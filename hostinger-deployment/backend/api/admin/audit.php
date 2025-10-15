<?php
/**
 * Admin Audit Logs API Endpoint
 * Handles audit trail and activity logging for admin users
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
            
            // Check for specific audit log ID
            $auditId = null;
            foreach ($pathParts as $part) {
                if (is_numeric($part)) {
                    $auditId = (int)$part;
                    break;
                }
            }
            
            if ($auditId) {
                // Get specific audit log
                $stmt = $db->prepare("
                    SELECT al.*, u.name as user_name, u.email as user_email
                    FROM activity_logs al
                    LEFT JOIN users u ON al.user_id = u.id
                    WHERE al.id = ?
                ");
                $stmt->execute([$auditId]);
                $log = $stmt->fetch();
                
                if ($log) {
                    $formattedLog = [
                        'id' => (int)$log['id'],
                        'userId' => (int)$log['user_id'],
                        'userName' => $log['user_name'],
                        'userEmail' => $log['user_email'],
                        'action' => $log['action'],
                        'entity' => $log['entity'],
                        'entityId' => $log['entity_id'] ? (int)$log['entity_id'] : null,
                        'description' => $log['description'],
                        'changes' => json_decode($log['changes'] ?? '{}', true),
                        'ipAddress' => $log['ip_address'],
                        'userAgent' => $log['user_agent'],
                        'timestamp' => $log['created_at'],
                        'status' => 'success'
                    ];
                    
                    echo json_encode([
                        'success' => true,
                        'data' => [
                            'log' => $formattedLog
                        ]
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Audit log not found'
                    ]);
                }
                break;
            }
            
            // Check for export request
            if (in_array('export', $pathParts)) {
                $format = $_GET['format'] ?? 'csv';
                
                // Get all audit logs for export
                $stmt = $db->prepare("
                    SELECT al.*, u.name as user_name, u.email as user_email
                    FROM activity_logs al
                    LEFT JOIN users u ON al.user_id = u.id
                    ORDER BY al.created_at DESC
                ");
                $stmt->execute();
                $logs = $stmt->fetchAll();
                
                if ($format === 'csv') {
                    header('Content-Type: text/csv');
                    header('Content-Disposition: attachment; filename="audit-logs.csv"');
                    
                    $output = fopen('php://output', 'w');
                    fputcsv($output, ['ID', 'User', 'Action', 'Entity', 'Entity ID', 'Description', 'Timestamp']);
                    
                    foreach ($logs as $log) {
                        fputcsv($output, [
                            $log['id'],
                            $log['user_name'] ?? 'System',
                            $log['action'],
                            $log['entity'],
                            $log['entity_id'],
                            $log['description'],
                            $log['created_at']
                        ]);
                    }
                    
                    fclose($output);
                } else {
                    // JSON export
                    header('Content-Type: application/json');
                    header('Content-Disposition: attachment; filename="audit-logs.json"');
                    
                    $formattedLogs = array_map(function($log) {
                        return [
                            'id' => (int)$log['id'],
                            'userId' => (int)$log['user_id'],
                            'userName' => $log['user_name'],
                            'userEmail' => $log['user_email'],
                            'action' => $log['action'],
                            'entity' => $log['entity'],
                            'entityId' => $log['entity_id'] ? (int)$log['entity_id'] : null,
                            'description' => $log['description'],
                            'changes' => json_decode($log['changes'] ?? '{}', true),
                            'timestamp' => $log['created_at']
                        ];
                    }, $logs);
                    
                    echo json_encode($formattedLogs);
                }
                break;
            }
            
            // Get audit logs with pagination and filters
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
            $action = $_GET['action'] ?? null;
            $entity = $_GET['entity'] ?? null;
            $startDate = $_GET['startDate'] ?? null;
            $endDate = $_GET['endDate'] ?? null;
            
            $offset = ($page - 1) * $limit;
            
            // Build query
            $whereConditions = [];
            $params = [];
            
            if ($userId) {
                $whereConditions[] = "al.user_id = ?";
                $params[] = $userId;
            }
            
            if ($action) {
                $whereConditions[] = "al.action = ?";
                $params[] = $action;
            }
            
            if ($entity) {
                $whereConditions[] = "al.entity = ?";
                $params[] = $entity;
            }
            
            if ($startDate) {
                $whereConditions[] = "al.created_at >= ?";
                $params[] = $startDate;
            }
            
            if ($endDate) {
                $whereConditions[] = "al.created_at <= ?";
                $params[] = $endDate . ' 23:59:59';
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get total count
            $countQuery = "
                SELECT COUNT(*) as total 
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.id
                $whereClause
            ";
            $stmt = $db->prepare($countQuery);
            $stmt->execute($params);
            $totalResult = $stmt->fetch();
            $total = (int)$totalResult['total'];
            
            // Get audit logs
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
            $logs = $stmt->fetchAll();
            
            // Format logs
            $formattedLogs = array_map(function($log) {
                return [
                    'id' => (int)$log['id'],
                    'userId' => (int)$log['user_id'],
                    'userName' => $log['user_name'],
                    'userEmail' => $log['user_email'],
                    'action' => $log['action'],
                    'entity' => $log['entity'],
                    'entityId' => $log['entity_id'] ? (int)$log['entity_id'] : null,
                    'description' => $log['description'],
                    'changes' => json_decode($log['changes'] ?? '{}', true),
                    'ipAddress' => $log['ip_address'],
                    'userAgent' => $log['user_agent'],
                    'timestamp' => $log['created_at'],
                    'status' => 'success'
                ];
            }, $logs);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'logs' => $formattedLogs,
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit
                ]
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET']
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