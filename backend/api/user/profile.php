<?php
/**
 * User Profile API Endpoint
 * Handles user profile data and dashboard information
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
 * Authenticate user
 */
function authenticateUser() {
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
    
    return [
        'success' => true,
        'user' => $result['data']['user']
    ];
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            // Get user profile
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $user = $authResult['user'];
            $userId = $user['id'];
            
            // Get complete user data with profile
            $stmt = $db->prepare("
                SELECT u.id, u.email, u.name, u.avatar, u.role, u.status, 
                       u.email_verified, u.last_login, u.created_at,
                       up.phone, up.address, up.city, up.country, up.timezone, 
                       up.language, up.bio, up.website, up.social_links, up.preferences
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = ?
            ");
            
            $stmt->execute([$userId]);
            $userData = $stmt->fetch();
            
            if (!$userData) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'User profile not found'
                ]);
                break;
            }
            
            // Parse JSON fields
            $userData['social_links'] = json_decode($userData['social_links'] ?? '{}', true);
            $userData['preferences'] = json_decode($userData['preferences'] ?? '{}', true);
            
            // Remove sensitive data
            unset($userData['password']);
            
            // Mock additional data for compatibility with frontend
            $mockData = [
                'user' => [
                    'id' => $userData['id'],
                    'email' => $userData['email'],
                    'name' => $userData['name'],
                    'avatar' => $userData['avatar'] ?? '/api/placeholder/120/120',
                    'joinDate' => $userData['created_at'],
                    'membershipTier' => 'Premium',
                    'verified' => (bool)$userData['email_verified'],
                    'role' => $userData['role']
                ],
                'tokens' => [
                    'balance' => 1250,
                    'totalEarned' => 2500,
                    'totalSpent' => 1250,
                    'history' => [
                        [
                            'id' => 'txn_1',
                            'type' => 'earned',
                            'amount' => 100,
                            'description' => 'Welcome bonus',
                            'date' => date('Y-m-d H:i:s')
                        ]
                    ]
                ],
                'streak' => [
                    'current' => 5,
                    'longest' => 12,
                    'lastCheckIn' => date('Y-m-d'),
                    'nextMilestone' => 7,
                    'rewards' => [
                        7 => 50,
                        14 => 100,
                        30 => 250
                    ]
                ],
                'referrals' => [
                    'code' => 'USER' . $userData['id'],
                    'totalReferred' => 0,
                    'successfulConversions' => 0,
                    'earningsFromReferrals' => 0,
                    'referralLink' => "https://adilgfx.com/ref/USER" . $userData['id']
                ],
                'orders' => [],
                'achievements' => [
                    [
                        'id' => 'ach_welcome',
                        'name' => 'Welcome',
                        'description' => 'Joined Adil GFX',
                        'icon' => 'Trophy',
                        'unlocked' => true,
                        'date' => $userData['created_at'],
                        'progress' => 100,
                        'target' => 100
                    ]
                ],
                'preferences' => array_merge([
                    'emailNotifications' => true,
                    'pushNotifications' => true,
                    'newsletter' => true,
                    'theme' => 'light'
                ], $userData['preferences'])
            ];
            
            echo json_encode([
                'success' => true,
                'data' => $mockData
            ]);
            break;
            
        case 'PUT':
            // Update user profile
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $user = $authResult['user'];
            $userId = $user['id'];
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Update user table
            $userUpdates = [];
            $userParams = [];
            
            $allowedUserFields = ['name', 'avatar'];
            foreach ($allowedUserFields as $field) {
                if (isset($input[$field])) {
                    $userUpdates[] = "$field = ?";
                    $userParams[] = $input[$field];
                }
            }
            
            if (!empty($userUpdates)) {
                $userUpdates[] = "updated_at = NOW()";
                $userParams[] = $userId;
                
                $query = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute($userParams);
            }
            
            // Update user profile
            $profileUpdates = [];
            $profileParams = [];
            
            $allowedProfileFields = ['phone', 'address', 'city', 'country', 'timezone', 'language', 'bio', 'website'];
            foreach ($allowedProfileFields as $field) {
                if (isset($input[$field])) {
                    $profileUpdates[] = "$field = ?";
                    $profileParams[] = $input[$field];
                }
            }
            
            if (isset($input['social_links'])) {
                $profileUpdates[] = "social_links = ?";
                $profileParams[] = json_encode($input['social_links']);
            }
            
            if (isset($input['preferences'])) {
                $profileUpdates[] = "preferences = ?";
                $profileParams[] = json_encode($input['preferences']);
            }
            
            if (!empty($profileUpdates)) {
                $profileUpdates[] = "updated_at = NOW()";
                $profileParams[] = $userId;
                
                // Check if profile exists
                $stmt = $db->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
                $stmt->execute([$userId]);
                $profileExists = $stmt->fetch();
                
                if ($profileExists) {
                    // Update existing profile
                    $query = "UPDATE user_profiles SET " . implode(', ', $profileUpdates) . " WHERE user_id = ?";
                    $stmt = $db->prepare($query);
                    $stmt->execute($profileParams);
                } else {
                    // Create new profile
                    $profileFields = array_map(function($update) {
                        return explode(' = ', $update)[0];
                    }, $profileUpdates);
                    $profileFields[] = 'user_id';
                    $profileParams[] = $userId;
                    
                    $placeholders = str_repeat('?,', count($profileFields) - 1) . '?';
                    $query = "INSERT INTO user_profiles (" . implode(', ', $profileFields) . ") VALUES ($placeholders)";
                    $stmt = $db->prepare($query);
                    $stmt->execute($profileParams);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
            break;
            
        case 'POST':
            // Handle password change
            $action = end($pathParts);
            
            if ($action === 'password') {
                $authResult = authenticateUser();
                if (!$authResult['success']) {
                    http_response_code(401);
                    echo json_encode($authResult);
                    break;
                }
                
                $user = $authResult['user'];
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($input['currentPassword']) || !isset($input['newPassword'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Current password and new password are required'
                    ]);
                    break;
                }
                
                $auth = new Auth();
                $result = $auth->changePassword($user['id'], $input['currentPassword'], $input['newPassword']);
                
                http_response_code($result['success'] ? 200 : 400);
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Action not found'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET', 'PUT', 'POST']
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