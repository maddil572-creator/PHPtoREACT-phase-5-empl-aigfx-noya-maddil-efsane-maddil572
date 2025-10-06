<?php
/**
 * Users Management API (Admin Only)
 * Handles user listing, role assignment, and user management
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';
require_once __DIR__ . '/../../middleware/cors.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = $_SERVER['PATH_INFO'] ?? '';

$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $token);

$auth = new Auth();
$auth_result = $auth->verifyToken($token);

if (!$auth_result['success']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($auth_result['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Admin access required']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    switch ($method) {
        case 'GET':
            if ($path_info === '' || $path_info === '/') {
                $search = $_GET['search'] ?? '';
                $role_filter = $_GET['role'] ?? '';
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 20);
                $offset = ($page - 1) * $limit;

                $where_clauses = [];
                $params = [];

                if ($search) {
                    $where_clauses[] = "(u.name LIKE ? OR u.email LIKE ?)";
                    $search_param = "%{$search}%";
                    $params[] = $search_param;
                    $params[] = $search_param;
                }

                if ($role_filter && in_array($role_filter, ['user', 'editor', 'viewer', 'admin'])) {
                    $where_clauses[] = "u.role = ?";
                    $params[] = $role_filter;
                }

                $where_sql = $where_clauses ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

                $count_stmt = $conn->prepare("SELECT COUNT(*) as total FROM users u $where_sql");
                $count_stmt->execute($params);
                $total = $count_stmt->fetch()['total'];

                $params[] = $limit;
                $params[] = $offset;

                $stmt = $conn->prepare("
                    SELECT u.id, u.email, u.name, u.avatar, u.role, u.verified,
                           u.last_login, u.created_at,
                           ut.balance, ut.total_earned,
                           (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders
                    FROM users u
                    LEFT JOIN user_tokens ut ON u.id = ut.user_id
                    $where_sql
                    ORDER BY u.created_at DESC
                    LIMIT ? OFFSET ?
                ");
                $stmt->execute($params);
                $users = $stmt->fetchAll();

                echo json_encode([
                    'users' => array_map(function($user) {
                        return [
                            'id' => $user['id'],
                            'email' => $user['email'],
                            'name' => $user['name'],
                            'avatar' => $user['avatar'] ?? '/api/placeholder/80/80',
                            'role' => $user['role'],
                            'verified' => (bool)$user['verified'],
                            'lastLogin' => $user['last_login'],
                            'joinDate' => $user['created_at'],
                            'tokenBalance' => (int)$user['balance'],
                            'totalEarned' => (int)$user['total_earned'],
                            'totalOrders' => (int)$user['total_orders']
                        ];
                    }, $users),
                    'pagination' => [
                        'total' => (int)$total,
                        'page' => $page,
                        'limit' => $limit,
                        'pages' => ceil($total / $limit)
                    ]
                ]);
            } elseif (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $user_id = $matches[1];

                $stmt = $conn->prepare("
                    SELECT u.id, u.email, u.name, u.avatar, u.role, u.verified,
                           u.last_login, u.created_at,
                           ut.balance, ut.total_earned, ut.total_spent,
                           us.current_streak, us.longest_streak,
                           r.referral_code
                    FROM users u
                    LEFT JOIN user_tokens ut ON u.id = ut.user_id
                    LEFT JOIN user_streaks us ON u.id = us.user_id
                    LEFT JOIN referrals r ON u.id = r.referrer_id
                    WHERE u.id = ?
                ");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();

                if (!$user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }

                echo json_encode([
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'avatar' => $user['avatar'] ?? '/api/placeholder/120/120',
                    'role' => $user['role'],
                    'verified' => (bool)$user['verified'],
                    'lastLogin' => $user['last_login'],
                    'joinDate' => $user['created_at'],
                    'tokenBalance' => (int)$user['balance'],
                    'totalEarned' => (int)$user['total_earned'],
                    'totalSpent' => (int)$user['total_spent'],
                    'currentStreak' => (int)$user['current_streak'],
                    'longestStreak' => (int)$user['longest_streak'],
                    'referralCode' => $user['referral_code']
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;

        case 'PUT':
            if (preg_match('/^\/(\d+)\/role$/', $path_info, $matches)) {
                $user_id = $matches[1];
                $input = json_decode(file_get_contents('php://input'), true);

                if (!isset($input['role'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Role is required']);
                    exit;
                }

                $new_role = $input['role'];
                if (!in_array($new_role, ['user', 'editor', 'viewer', 'admin'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid role']);
                    exit;
                }

                $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
                $stmt->execute([$user_id]);
                $current_user = $stmt->fetch();

                if (!$current_user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }

                $old_role = $current_user['role'];

                $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
                $stmt->execute([$new_role, $user_id]);

                $stmt = $conn->prepare("
                    INSERT INTO audit_log (action, entity_type, entity_id, user_id, changes)
                    VALUES ('role_change', 'user', ?, ?, ?)
                ");
                $changes = json_encode([
                    'old_role' => $old_role,
                    'new_role' => $new_role,
                    'changed_by' => $auth_result['user_id']
                ]);
                $stmt->execute([$user_id, $auth_result['user_id'], $changes]);

                $stmt = $conn->prepare("
                    INSERT INTO notifications (user_id, type, title, message, icon)
                    VALUES (?, 'system', 'Role Updated', ?, 'Shield')
                ");
                $message = "Your role has been changed from {$old_role} to {$new_role}";
                $stmt->execute([$user_id, $message]);

                echo json_encode([
                    'message' => 'Role updated successfully',
                    'user_id' => $user_id,
                    'old_role' => $old_role,
                    'new_role' => $new_role
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;

        case 'DELETE':
            if (preg_match('/^\/(\d+)$/', $path_info, $matches)) {
                $user_id = $matches[1];

                if ($user_id == $auth_result['user_id']) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Cannot delete your own account']);
                    exit;
                }

                $stmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();

                if (!$user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }

                $stmt = $conn->prepare("
                    INSERT INTO audit_log (action, entity_type, entity_id, user_id, changes)
                    VALUES ('user_delete', 'user', ?, ?, ?)
                ");
                $changes = json_encode([
                    'deleted_user' => $user['email'],
                    'deleted_name' => $user['name'],
                    'deleted_by' => $auth_result['user_id']
                ]);
                $stmt->execute([$user_id, $auth_result['user_id'], $changes]);

                $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
                $stmt->execute([$user_id]);

                echo json_encode([
                    'message' => 'User deleted successfully',
                    'user_id' => $user_id
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    error_log("Users API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
