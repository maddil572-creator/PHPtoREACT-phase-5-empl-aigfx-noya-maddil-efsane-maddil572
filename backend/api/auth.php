<?php
/**
 * Authentication API Endpoint
 * Handles login, registration, token verification, and password management
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Parse the path to get the action - handle both /auth.php/login and /auth/login patterns
$path = parse_url($uri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Find action from URL path
$action = 'verify'; // default action
foreach ($pathParts as $i => $part) {
    if ($part === 'auth.php' || $part === 'auth') {
        if (isset($pathParts[$i + 1])) {
            $action = $pathParts[$i + 1];
        }
        break;
    }
}

// Also check query parameter for action
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

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

try {
    $auth = new Auth();
    
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
                break;
            }
            
            switch ($action) {
                case 'login':
                    if (!isset($input['email']) || !isset($input['password'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Email and password are required'
                        ]);
                        break;
                    }
                    
                    $result = $auth->login(
                        $input['email'],
                        $input['password'],
                        $input['remember_me'] ?? false
                    );
                    
                    http_response_code($result['success'] ? 200 : 401);
                    echo json_encode($result);
                    break;
                    
                case 'register':
                    $required = ['email', 'password', 'name'];
                    foreach ($required as $field) {
                        if (!isset($input[$field])) {
                            http_response_code(400);
                            echo json_encode([
                                'success' => false,
                                'error' => ucfirst($field) . ' is required'
                            ]);
                            break 2;
                        }
                    }
                    
                    $result = $auth->register(
                        $input['email'],
                        $input['password'],
                        $input['name'],
                        $input['role'] ?? 'user'
                    );
                    
                    http_response_code($result['success'] ? 201 : 400);
                    echo json_encode($result);
                    break;
                    
                case 'forgot-password':
                    if (!isset($input['email'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Email is required'
                        ]);
                        break;
                    }
                    
                    $result = $auth->requestPasswordReset($input['email']);
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($result);
                    break;
                    
                case 'reset-password':
                    if (!isset($input['token']) || !isset($input['password'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Token and new password are required'
                        ]);
                        break;
                    }
                    
                    $result = $auth->resetPassword($input['token'], $input['password']);
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($result);
                    break;
                    
                case 'change-password':
                    $token = extractToken();
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Authentication required'
                        ]);
                        break;
                    }
                    
                    $tokenResult = $auth->verifyToken($token);
                    if (!$tokenResult['success']) {
                        http_response_code(401);
                        echo json_encode($tokenResult);
                        break;
                    }
                    
                    if (!isset($input['current_password']) || !isset($input['new_password'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Current password and new password are required'
                        ]);
                        break;
                    }
                    
                    $userId = $tokenResult['data']['user']['id'];
                    $result = $auth->changePassword(
                        $userId,
                        $input['current_password'],
                        $input['new_password']
                    );
                    
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($result);
                    break;
                    
                case 'logout':
                    $token = extractToken();
                    if ($token) {
                        $result = $auth->logout($token);
                        echo json_encode($result);
                    } else {
                        echo json_encode([
                            'success' => true,
                            'message' => 'Logged out successfully'
                        ]);
                    }
                    break;
                    
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid action for POST method',
                        'allowed_actions' => ['login', 'register', 'forgot-password', 'reset-password', 'change-password', 'logout']
                    ]);
                    break;
            }
            break;
            
        case 'GET':
            switch ($action) {
                case 'verify':
                    $token = extractToken();
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'No token provided'
                        ]);
                        break;
                    }
                    
                    $result = $auth->verifyToken($token);
                    http_response_code($result['success'] ? 200 : 401);
                    echo json_encode($result);
                    break;
                    
                case 'profile':
                    $token = extractToken();
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Authentication required'
                        ]);
                        break;
                    }
                    
                    $tokenResult = $auth->verifyToken($token);
                    if (!$tokenResult['success']) {
                        http_response_code(401);
                        echo json_encode($tokenResult);
                        break;
                    }
                    
                    $userId = $tokenResult['data']['user']['id'];
                    $user = $auth->getUserById($userId);
                    
                    if ($user) {
                        echo json_encode([
                            'success' => true,
                            'data' => [
                                'user' => $user
                            ]
                        ]);
                    } else {
                        http_response_code(404);
                        echo json_encode([
                            'success' => false,
                            'error' => 'User not found'
                        ]);
                    }
                    break;
                    
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid action for GET method',
                        'allowed_actions' => ['verify', 'profile']
                    ]);
                    break;
            }
            break;
            
        case 'PUT':
            switch ($action) {
                case 'profile':
                    $token = extractToken();
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Authentication required'
                        ]);
                        break;
                    }
                    
                    $tokenResult = $auth->verifyToken($token);
                    if (!$tokenResult['success']) {
                        http_response_code(401);
                        echo json_encode($tokenResult);
                        break;
                    }
                    
                    $input = json_decode(file_get_contents('php://input'), true);
                    if (!$input) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Invalid JSON data'
                        ]);
                        break;
                    }
                    
                    // Handle profile update logic here
                    echo json_encode([
                        'success' => true,
                        'message' => 'Profile updated successfully'
                    ]);
                    break;
                    
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid action for PUT method',
                        'allowed_actions' => ['profile']
                    ]);
                    break;
            }
            break;
            
        case 'OPTIONS':
            // Handle CORS preflight
            http_response_code(200);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET', 'POST', 'PUT', 'OPTIONS']
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