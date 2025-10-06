<?php
/**
 * User Profile API
 * Handles user profile data and dashboard information
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';
require_once __DIR__ . '/../../middleware/cors.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Verify user authentication
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $token);

$auth = new Auth();
$auth_result = $auth->verifyToken($token);

if (!$auth_result['success']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    $user_id = $auth_result['user_id'];

    // Get user data
    $stmt = $conn->prepare("
        SELECT u.id, u.email, u.name, u.avatar, u.join_date, u.membership_tier, u.verified, u.role,
               ut.balance, ut.total_earned, ut.total_spent,
               us.current_streak, us.longest_streak, us.last_check_in,
               r.referral_code
        FROM users u
        LEFT JOIN user_tokens ut ON u.id = ut.user_id
        LEFT JOIN user_streaks us ON u.id = us.user_id
        LEFT JOIN referrals r ON u.id = r.referrer_id
        WHERE u.id = ?
    ");
    $stmt->execute([$user_id]);
    $user_data = $stmt->fetch();

    if (!$user_data) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Get token history
    $stmt = $conn->prepare("
        SELECT type, amount, description, created_at as date
        FROM token_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute([$user_id]);
    $token_history = $stmt->fetchAll();

    // Get referral data
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total_referred,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_conversions,
               SUM(earnings) as earnings_from_referrals
        FROM referrals 
        WHERE referrer_id = ?
    ");
    $stmt->execute([$user_id]);
    $referral_stats = $stmt->fetch();

    // Get user orders
    $stmt = $conn->prepare("
        SELECT o.id, s.name as service, o.package_name as package, o.status, 
               o.order_date, o.expected_completion, o.completion_date, o.amount
        FROM orders o
        JOIN services s ON o.service_id = s.id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
    ");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll();

    // Get user achievements
    $stmt = $conn->prepare("
        SELECT a.name, a.description, a.icon, ua.progress, ua.unlocked, ua.unlocked_at, a.target_value
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        ORDER BY ua.unlocked DESC, a.name ASC
    ");
    $stmt->execute([$user_id]);
    $achievements = $stmt->fetchAll();

    // Calculate next streak milestone
    $current_streak = (int)$user_data['current_streak'];
    $milestones = [7, 14, 30, 60, 90];
    $next_milestone = 30; // default
    foreach ($milestones as $milestone) {
        if ($current_streak < $milestone) {
            $next_milestone = $milestone;
            break;
        }
    }

    // Format response to match frontend expectations
    $response = [
        'user' => [
            'id' => $user_data['id'],
            'email' => $user_data['email'],
            'name' => $user_data['name'],
            'avatar' => $user_data['avatar'] ?? '/api/placeholder/120/120',
            'joinDate' => $user_data['join_date'],
            'membershipTier' => ucfirst($user_data['membership_tier']),
            'verified' => (bool)$user_data['verified'],
            'role' => $user_data['role']
        ],
        'tokens' => [
            'balance' => (int)$user_data['balance'],
            'totalEarned' => (int)$user_data['total_earned'],
            'totalSpent' => (int)$user_data['total_spent'],
            'history' => array_map(function($item) {
                return [
                    'id' => 'txn_' . $item['date'],
                    'type' => $item['type'],
                    'amount' => (int)$item['amount'],
                    'description' => $item['description'],
                    'date' => $item['date']
                ];
            }, $token_history)
        ],
        'streak' => [
            'current' => $current_streak,
            'longest' => (int)$user_data['longest_streak'],
            'lastCheckIn' => $user_data['last_check_in'],
            'nextMilestone' => $next_milestone,
            'rewards' => [
                7 => 50,
                14 => 100,
                30 => 250,
                60 => 500,
                90 => 1000
            ]
        ],
        'referrals' => [
            'code' => $user_data['referral_code'],
            'totalReferred' => (int)$referral_stats['total_referred'],
            'successfulConversions' => (int)$referral_stats['successful_conversions'],
            'earningsFromReferrals' => (int)$referral_stats['earnings_from_referrals'],
            'referralLink' => "https://adilgfx.com/ref/{$user_data['referral_code']}"
        ],
        'orders' => array_map(function($order) {
            return [
                'id' => $order['id'],
                'service' => $order['service'],
                'package' => $order['package'],
                'status' => $order['status'],
                'orderDate' => $order['order_date'],
                'expectedCompletion' => $order['expected_completion'],
                'completionDate' => $order['completion_date'],
                'amount' => (float)$order['amount']
            ];
        }, $orders),
        'achievements' => array_map(function($achievement) {
            return [
                'id' => 'ach_' . $achievement['name'],
                'name' => $achievement['name'],
                'description' => $achievement['description'],
                'icon' => $achievement['icon'],
                'unlocked' => (bool)$achievement['unlocked'],
                'date' => $achievement['unlocked_at'],
                'progress' => (int)$achievement['progress'],
                'target' => (int)$achievement['target_value']
            ];
        }, $achievements),
        'preferences' => [
            'emailNotifications' => true,
            'pushNotifications' => true,
            'newsletter' => true,
            'theme' => 'light'
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    error_log("User profile error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load user profile']);
}