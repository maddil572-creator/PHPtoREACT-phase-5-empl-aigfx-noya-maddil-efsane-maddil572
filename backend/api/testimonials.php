<?php
/**
 * Testimonials API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$testimonialId = (count($pathParts) >= 3 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;

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
            if ($testimonialId) {
                $stmt = $db->prepare("SELECT * FROM testimonials WHERE id = ? AND status = 'approved'");
                $stmt->execute([$testimonialId]);
                $testimonial = $stmt->fetch();
                
                if (!$testimonial) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Testimonial not found']);
                    break;
                }
                
                echo json_encode(['success' => true, 'data' => $testimonial]);
            } else {
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 10), 50);
                $featured = $_GET['featured'] ?? null;
                $service_id = $_GET['service_id'] ?? null;
                $offset = ($page - 1) * $limit;
                
                $whereConditions = ["status = 'approved'"];
                $params = [];
                
                if ($featured === '1') {
                    $whereConditions[] = "featured = 1";
                }
                if ($service_id) {
                    $whereConditions[] = "service_id = ?";
                    $params[] = $service_id;
                }
                
                $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
                
                $countQuery = "SELECT COUNT(*) FROM testimonials $whereClause";
                $stmt = $db->prepare($countQuery);
                $stmt->execute($params);
                $total = $stmt->fetchColumn();
                
                $query = "SELECT * FROM testimonials $whereClause ORDER BY featured DESC, sort_order ASC, created_at DESC LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $testimonials = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'testimonials' => $testimonials,
                        'pagination' => [
                            'total' => (int)$total,
                            'page' => (int)$page,
                            'limit' => (int)$limit,
                            'pages' => ceil($total / $limit)
                        ]
                    ]
                ]);
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || !isset($input['content']) || !isset($input['rating'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name, content, and rating are required']);
                break;
            }
            
            // Public testimonial submission (pending approval)
            $status = 'pending';
            
            // If authenticated admin/editor, can approve directly
            $authResult = authenticateUser();
            if ($authResult['success'] && in_array($authResult['user']['role'], ['admin', 'editor'])) {
                $status = $input['status'] ?? 'approved';
            }
            
            $stmt = $db->prepare("
                INSERT INTO testimonials (
                    name, email, role, company, company_website, content, rating,
                    avatar, project_type, service_id, featured, verified, status,
                    sort_order, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                trim($input['name']),
                trim($input['email'] ?? ''),
                trim($input['role'] ?? ''),
                trim($input['company'] ?? ''),
                trim($input['company_website'] ?? ''),
                trim($input['content']),
                max(1, min(5, (int)$input['rating'])),
                trim($input['avatar'] ?? ''),
                trim($input['project_type'] ?? ''),
                $input['service_id'] ?? null,
                $input['featured'] ?? 0,
                $input['verified'] ?? 0,
                $status,
                $input['sort_order'] ?? 0
            ]);
            
            $message = $status === 'pending' ? 'Testimonial submitted for review' : 'Testimonial created successfully';
            echo json_encode(['success' => true, 'message' => $message, 'data' => ['id' => $db->lastInsertId()]]);
            break;
            
        case 'PUT':
            if (!$testimonialId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Testimonial ID is required']);
                break;
            }
            
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
            
            $updates = [];
            $params = [];
            
            $allowedFields = ['name', 'email', 'role', 'company', 'company_website', 'content', 'rating', 'avatar', 'project_type', 'service_id', 'featured', 'verified', 'status', 'sort_order'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No updates provided']);
                break;
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $testimonialId;
            
            $query = "UPDATE testimonials SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Testimonial updated successfully']);
            break;
            
        case 'DELETE':
            if (!$testimonialId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Testimonial ID is required']);
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
            
            $stmt = $db->prepare("DELETE FROM testimonials WHERE id = ?");
            $stmt->execute([$testimonialId]);
            
            echo json_encode(['success' => true, 'message' => 'Testimonial deleted successfully']);
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