<?php
/**
 * Admin Users Management API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';

function authenticateAdmin() {
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
    if (!$token) return ['success' => false, 'error' => 'Authentication required'];
    
    $auth = new Auth();
    $result = $auth->verifyToken($token);
    if (!$result['success']) return $result;
    
    if ($result['data']['user']['role'] !== 'admin') {
        return ['success' => false, 'error' => 'Admin access required'];
    }
    
    return ['success' => true, 'user' => $result['data']['user']];
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $authResult = authenticateAdmin();
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode($authResult);
        exit;
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $userId = (count($pathParts) >= 4 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;
    
    switch ($method) {
        case 'GET':
            if ($userId) {
                // Get specific user
                $stmt = $db->prepare("
                    SELECT u.*, up.phone, up.address, up.city, up.country, 
                           up.timezone, up.language, up.bio, up.website, 
                           up.social_links, up.preferences
                    FROM users u
                    LEFT JOIN user_profiles up ON u.id = up.user_id
                    WHERE u.id = ?
                ");
                $stmt->execute([$userId]);
                $user = $stmt->fetch();
                
                if (!$user) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'User not found']);
                    break;
                }
                
                // Remove sensitive data
                unset($user['password'], $user['verification_token'], $user['reset_token']);
                
                // Parse JSON fields
                $user['social_links'] = json_decode($user['social_links'] ?? '{}', true);
                $user['preferences'] = json_decode($user['preferences'] ?? '{}', true);
                
                echo json_encode(['success' => true, 'data' => $user]);
            } else {
                // Get all users with pagination
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 20), 100);
                $role = $_GET['role'] ?? null;
                $status = $_GET['status'] ?? null;
                $search = $_GET['search'] ?? null;
                $offset = ($page - 1) * $limit;
                
                $whereConditions = [];
                $params = [];
                
                if ($role) {
                    $whereConditions[] = "u.role = ?";
                    $params[] = $role;
                }
                if ($status) {
                    $whereConditions[] = "u.status = ?";
                    $params[] = $status;
                }
                if ($search) {
                    $whereConditions[] = "(u.name LIKE ? OR u.email LIKE ?)";
                    $searchTerm = "%$search%";
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                }
                
                $whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                // Get total count
                $countQuery = "SELECT COUNT(*) FROM users u $whereClause";
                $stmt = $db->prepare($countQuery);
                $stmt->execute($params);
                $total = $stmt->fetchColumn();
                
                // Get users
                $query = "
                    SELECT u.id, u.email, u.name, u.role, u.avatar, u.status,
                           u.email_verified, u.last_login, u.created_at,
                           up.city, up.country
                    FROM users u
                    LEFT JOIN user_profiles up ON u.id = up.user_id
                    $whereClause
                    ORDER BY u.created_at DESC
                    LIMIT ? OFFSET ?
                ";
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $users = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'users' => $users,
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
            
        case 'PUT':
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User ID is required']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Update user
            $updates = [];
            $params = [];
            
            $allowedFields = ['name', 'email', 'role', 'status', 'avatar'];
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (!empty($updates)) {
                $updates[] = "updated_at = NOW()";
                $params[] = $userId;
                
                $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
            }
            
            // Update profile if provided
            if (isset($input['profile'])) {
                $profile = $input['profile'];
                
                $profileUpdates = [];
                $profileParams = [];
                
                $allowedProfileFields = ['phone', 'address', 'city', 'country', 'timezone', 'language', 'bio', 'website'];
                foreach ($allowedProfileFields as $field) {
                    if (isset($profile[$field])) {
                        $profileUpdates[] = "$field = ?";
                        $profileParams[] = $profile[$field];
                    }
                }
                
                if (isset($profile['social_links'])) {
                    $profileUpdates[] = "social_links = ?";
                    $profileParams[] = json_encode($profile['social_links']);
                }
                
                if (isset($profile['preferences'])) {
                    $profileUpdates[] = "preferences = ?";
                    $profileParams[] = json_encode($profile['preferences']);
                }
                
                if (!empty($profileUpdates)) {
                    $profileUpdates[] = "updated_at = NOW()";
                    $profileParams[] = $userId;
                    
                    $profileQuery = "UPDATE user_profiles SET " . implode(', ', $profileUpdates) . " WHERE user_id = ?";
                    $stmt = $db->prepare($profileQuery);
                    $stmt->execute($profileParams);
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            break;
            
        case 'DELETE':
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User ID is required']);
                break;
            }
            
            // Don't allow deleting yourself
            if ($userId == $authResult['user']['id']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Cannot delete your own account']);
                break;
            }
            
            // Delete user (cascade will handle profile and sessions)
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong'
    ]);
}