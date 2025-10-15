<?php
/**
 * Carousel API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$name = $_GET['name'] ?? 'hero';

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
            $stmt = $db->prepare("
                SELECT * FROM carousels 
                WHERE name = ? AND status = 'active' 
                AND (start_date IS NULL OR start_date <= NOW()) 
                AND (end_date IS NULL OR end_date >= NOW())
                ORDER BY sort_order ASC
            ");
            $stmt->execute([$name]);
            $slides = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $slides]);
            break;
            
        case 'POST':
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if (!in_array($authResult['user']['role'], ['admin', 'editor'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || !isset($input['image_url'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name and image URL are required']);
                break;
            }
            
            $stmt = $db->prepare("
                INSERT INTO carousels (
                    name, title, subtitle, description, image_url, cta_text, cta_url,
                    background_color, text_color, overlay_opacity, status, sort_order,
                    start_date, end_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $input['name'],
                $input['title'] ?? '',
                $input['subtitle'] ?? '',
                $input['description'] ?? '',
                $input['image_url'],
                $input['cta_text'] ?? '',
                $input['cta_url'] ?? '',
                $input['background_color'] ?? null,
                $input['text_color'] ?? '#FFFFFF',
                $input['overlay_opacity'] ?? 0.5,
                $input['status'] ?? 'active',
                $input['sort_order'] ?? 0,
                $input['start_date'] ?? null,
                $input['end_date'] ?? null
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Carousel slide created successfully', 'data' => ['id' => $db->lastInsertId()]]);
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