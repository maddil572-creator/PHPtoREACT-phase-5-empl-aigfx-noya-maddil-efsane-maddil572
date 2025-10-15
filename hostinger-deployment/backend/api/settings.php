<?php
/**
 * Settings API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$settingKey = (count($pathParts) >= 3) ? end($pathParts) : null;

function authenticateUser() {
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
    if (!$token) return ['success' => false, 'error' => 'Authentication required'];
    
    $auth = new Auth();
    $result = $auth->verifyToken($token);
    return $result['success'] ? ['success' => true, 'user' => $result['data']['user']] : $result;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            if ($settingKey) {
                $stmt = $db->prepare("SELECT * FROM settings WHERE `key` = ?");
                $stmt->execute([$settingKey]);
                $setting = $stmt->fetch();
                
                if (!$setting) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Setting not found']);
                    break;
                }
                
                echo json_encode(['success' => true, 'data' => $setting]);
            } else {
                $category = $_GET['category'] ?? null;
                
                $whereClause = $category ? "WHERE category = ?" : "";
                $params = $category ? [$category] : [];
                
                $query = "SELECT * FROM settings $whereClause ORDER BY category, sort_order, `key`";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $settings = $stmt->fetchAll();
                
                // Group by category for easier frontend consumption
                $grouped = [];
                foreach ($settings as $setting) {
                    $grouped[$setting['category']][] = $setting;
                }
                
                echo json_encode(['success' => true, 'data' => ['settings' => $settings, 'grouped' => $grouped]]);
            }
            break;
            
        case 'PUT':
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if ($authResult['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if ($settingKey) {
                // Update single setting
                if (!isset($input['value'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Value is required']);
                    break;
                }
                
                $stmt = $db->prepare("UPDATE settings SET value = ?, updated_at = NOW() WHERE `key` = ?");
                $stmt->execute([$input['value'], $settingKey]);
                
                echo json_encode(['success' => true, 'message' => 'Setting updated successfully']);
            } else {
                // Bulk update settings
                if (!isset($input['settings']) || !is_array($input['settings'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Settings array is required']);
                    break;
                }
                
                $updated = 0;
                foreach ($input['settings'] as $key => $value) {
                    $stmt = $db->prepare("UPDATE settings SET value = ?, updated_at = NOW() WHERE `key` = ?");
                    $stmt->execute([$value, $key]);
                    $updated += $stmt->rowCount();
                }
                
                echo json_encode(['success' => true, 'message' => "$updated settings updated successfully"]);
            }
            break;
            
        case 'POST':
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if ($authResult['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['key']) || !isset($input['value'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Key and value are required']);
                break;
            }
            
            $stmt = $db->prepare("
                INSERT INTO settings (`key`, value, type, category, label, description, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $input['key'],
                $input['value'],
                $input['type'] ?? 'text',
                $input['category'] ?? 'general',
                $input['label'] ?? '',
                $input['description'] ?? '',
                $input['sort_order'] ?? 0
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Setting created successfully', 'data' => ['id' => $db->lastInsertId()]]);
            break;
            
        case 'DELETE':
            if (!$settingKey) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Setting key is required']);
                break;
            }
            
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if ($authResult['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM settings WHERE `key` = ?");
            $stmt->execute([$settingKey]);
            
            echo json_encode(['success' => true, 'message' => 'Setting deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error', 'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong']);
}