<?php
/**
 * Admin Activity Logs API Endpoint
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
    
    if (!in_array($result['data']['user']['role'], ['admin', 'editor'])) {
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
    
    switch ($method) {
        case 'GET':
            $page = (int)($_GET['page'] ?? 1);
            $limit = min((int)($_GET['limit'] ?? 50), 100);
            $action = $_GET['action'] ?? null;
            $entity = $_GET['entity'] ?? null;
            $userId = $_GET['user_id'] ?? null;
            $offset = ($page - 1) * $limit;
            
            $whereConditions = [];
            $params = [];
            
            if ($action) {
                $whereConditions[] = "action = ?";
                $params[] = $action;
            }
            if ($entity) {
                $whereConditions[] = "entity = ?";
                $params[] = $entity;
            }
            if ($userId) {
                $whereConditions[] = "al.user_id = ?";
                $params[] = $userId;
            }
            
            $whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get total count
            $countQuery = "
                SELECT COUNT(*) 
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.id
                $whereClause
            ";
            $stmt = $db->prepare($countQuery);
            $stmt->execute($params);
            $total = $stmt->fetchColumn();
            
            // Get activity logs
            $query = "
                SELECT al.*, u.name as user_name, u.email as user_email
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.id
                $whereClause
                ORDER BY al.created_at DESC
                LIMIT ? OFFSET ?
            ";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $activities = $stmt->fetchAll();
            
            // Parse changes JSON
            foreach ($activities as &$activity) {
                $activity['changes'] = json_decode($activity['changes'] ?? '{}', true);
            }
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'activities' => $activities,
                    'pagination' => [
                        'total' => (int)$total,
                        'page' => (int)$page,
                        'limit' => (int)$limit,
                        'pages' => ceil($total / $limit)
                    ]
                ]
            ]);
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