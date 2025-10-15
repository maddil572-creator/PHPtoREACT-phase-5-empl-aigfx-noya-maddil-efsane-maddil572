<?php
/**
 * Admin Notifications API Endpoint
 * Handles system notifications for admin users
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));

/**
 * Extract JWT token from Authorization header
 */
function extractToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

/**
 * Authenticate admin user
 */
function authenticateAdmin() {
    $token = extractToken();
    
    if (!$token) {
        return [
            'success' => false,
            'error' => 'Authentication required'
        ];
    }
    
    $auth = new Auth();
    $result = $auth->verifyToken($token);
    
    if (!$result['success']) {
        return $result;
    }
    
    $user = $result['data']['user'];
    
    if (!in_array($user['role'], ['admin', 'editor'])) {
        return [
            'success' => false,
            'error' => 'Admin access required'
        ];
    }
    
    return [
        'success' => true,
        'user' => $user
    ];
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            // Authenticate admin
            $authResult = authenticateAdmin();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            // Check for unread count request
            if (isset($_GET['unread_count']) && $_GET['unread_count'] === 'true') {
                $stmt = $db->prepare("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0");
                $stmt->execute();
                $result = $stmt->fetch();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'count' => (int)$result['count']
                    ]
                ]);
                break;
            }
            
            // Get notifications with pagination and filters
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $type = $_GET['type'] ?? null;
            $read = isset($_GET['read']) ? filter_var($_GET['read'], FILTER_VALIDATE_BOOLEAN) : null;
            
            $offset = ($page - 1) * $limit;
            
            // Build query
            $whereConditions = [];
            $params = [];
            
            if ($type) {
                $whereConditions[] = "type = ?";
                $params[] = $type;
            }
            
            if ($read !== null) {
                $whereConditions[] = "is_read = ?";
                $params[] = $read ? 1 : 0;
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM notifications $whereClause";
            $stmt = $db->prepare($countQuery);
            $stmt->execute($params);
            $totalResult = $stmt->fetch();
            $total = (int)$totalResult['total'];
            
            // Get notifications
            $query = "
                SELECT id, type, title, message, is_read, priority, action_url, 
                       metadata, created_at, read_at
                FROM notifications 
                $whereClause
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $notifications = $stmt->fetchAll();
            
            // Format notifications
            $formattedNotifications = array_map(function($notification) {
                return [
                    'id' => (int)$notification['id'],
                    'type' => $notification['type'],
                    'title' => $notification['title'],
                    'message' => $notification['message'],
                    'read' => (bool)$notification['is_read'],
                    'priority' => $notification['priority'],
                    'actionUrl' => $notification['action_url'],
                    'metadata' => json_decode($notification['metadata'] ?? '{}', true),
                    'createdAt' => $notification['created_at'],
                    'readAt' => $notification['read_at']
                ];
            }, $notifications);
            
            // Get unread count
            $unreadStmt = $db->prepare("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0");
            $unreadStmt->execute();
            $unreadResult = $unreadStmt->fetch();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'notifications' => $formattedNotifications,
                    'total' => $total,
                    'unread' => (int)$unreadResult['count'],
                    'page' => $page,
                    'limit' => $limit
                ]
            ]);
            break;
            
        case 'PUT':
            // Authenticate admin
            $authResult = authenticateAdmin();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            // Check for specific notification ID or bulk action
            if (in_array('read', $pathParts)) {
                // Mark specific notification as read
                $notificationId = null;
                foreach ($pathParts as $i => $part) {
                    if (is_numeric($part) && isset($pathParts[$i + 1]) && $pathParts[$i + 1] === 'read') {
                        $notificationId = (int)$part;
                        break;
                    }
                }
                
                if ($notificationId) {
                    $stmt = $db->prepare("
                        UPDATE notifications 
                        SET is_read = 1, read_at = NOW() 
                        WHERE id = ?
                    ");
                    $stmt->execute([$notificationId]);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Notification marked as read'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid notification ID'
                    ]);
                }
            } elseif (in_array('mark-all-read', $pathParts)) {
                // Mark all notifications as read
                $stmt = $db->prepare("
                    UPDATE notifications 
                    SET is_read = 1, read_at = NOW() 
                    WHERE is_read = 0
                ");
                $stmt->execute();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'All notifications marked as read'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid action'
                ]);
            }
            break;
            
        case 'DELETE':
            // Authenticate admin
            $authResult = authenticateAdmin();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if (in_array('delete-all', $pathParts)) {
                // Delete all notifications
                $stmt = $db->prepare("DELETE FROM notifications");
                $stmt->execute();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'All notifications deleted'
                ]);
            } else {
                // Delete specific notification
                $notificationId = null;
                foreach ($pathParts as $part) {
                    if (is_numeric($part)) {
                        $notificationId = (int)$part;
                        break;
                    }
                }
                
                if ($notificationId) {
                    $stmt = $db->prepare("DELETE FROM notifications WHERE id = ?");
                    $stmt->execute([$notificationId]);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Notification deleted'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid notification ID'
                    ]);
                }
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET', 'PUT', 'DELETE']
            ]);
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