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
$path = $_SERVER['REQUEST_URI'];

// Parse the path to get the action
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$action = end($pathParts);

// Remove 'auth.php' from action if present
if ($action === 'auth.php') {
    $action = $_GET['action'] ?? 'verify';
}

try {
    $auth = new Auth();
    
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
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
                    if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Email, password, and name are required'
                        ]);
                        break;
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
                    
                case 'logout':
                    $token = $this->extractToken();
                    
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Token required'
                        ]);
                        break;
                    }
                    
                    $result = $auth->logout($token);
                    echo json_encode($result);
                    break;
                    
                case 'change-password':
                    $token = $this->extractToken();
                    
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Authentication required'
                        ]);
                        break;
                    }
                    
                    $tokenData = $auth->verifyToken($token);
                    if (!$tokenData['success']) {
                        http_response_code(401);
                        echo json_encode($tokenData);
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
                    
                    $result = $auth->changePassword(
                        $tokenData['data']['user']['id'],
                        $input['current_password'],
                        $input['new_password']
                    );
                    
                    http_response_code($result['success'] ? 200 : 400);
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
                    echo json_encode($result);
                    break;
                    
                case 'reset-password':
                    if (!isset($input['token']) || !isset($input['password'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Token and password are required'
                        ]);
                        break;
                    }
                    
                    $result = $auth->resetPassword($input['token'], $input['password']);
                    
                    http_response_code($result['success'] ? 200 : 400);
                    echo json_encode($result);
                    break;
                    
                default:
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Action not found'
                    ]);
                    break;
            }
            break;
            
        case 'GET':
            switch ($action) {
                case 'verify':
                    $token = $this->extractToken();
                    
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Token required'
                        ]);
                        break;
                    }
                    
                    $result = $auth->verifyToken($token);
                    
                    http_response_code($result['success'] ? 200 : 401);
                    echo json_encode($result);
                    break;
                    
                case 'profile':
                    $token = $this->extractToken();
                    
                    if (!$token) {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Authentication required'
                        ]);
                        break;
                    }
                    
                    $tokenData = $auth->verifyToken($token);
                    if (!$tokenData['success']) {
                        http_response_code(401);
                        echo json_encode($tokenData);
                        break;
                    }
                    
                    $user = $auth->getUserById($tokenData['data']['user']['id']);
                    
                    if ($user) {
                        echo json_encode([
                            'success' => true,
                            'data' => ['user' => $user]
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
                    // Return API info
                    echo json_encode([
                        'success' => true,
                        'message' => 'Authentication API',
                        'endpoints' => [
                            'POST /auth.php/login' => 'User login',
                            'POST /auth.php/register' => 'User registration',
                            'POST /auth.php/logout' => 'User logout',
                            'POST /auth.php/change-password' => 'Change password',
                            'POST /auth.php/forgot-password' => 'Request password reset',
                            'POST /auth.php/reset-password' => 'Reset password with token',
                            'GET /auth.php/verify' => 'Verify token',
                            'GET /auth.php/profile' => 'Get user profile'
                        ]
                    ]);
                    break;
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
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