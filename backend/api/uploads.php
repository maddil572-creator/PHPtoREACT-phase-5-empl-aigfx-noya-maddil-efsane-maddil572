<?php
/**
 * File Upload API Endpoint
 * Handles file uploads and media management
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../classes/MediaManager.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse the path to get the ID if present
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$mediaId = null;

// Extract media ID from path if present
if (count($pathParts) >= 3 && is_numeric(end($pathParts))) {
    $mediaId = (int)end($pathParts);
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
    $mediaManager = new MediaManager();
    
    switch ($method) {
        case 'POST':
            // Upload file
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $user = $authResult['user'];
            
            // Check if file was uploaded
            if (!isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No file uploaded'
                ]);
                break;
            }
            
            $file = $_FILES['file'];
            $altText = $_POST['altText'] ?? '';
            $caption = $_POST['caption'] ?? '';
            $folder = $_POST['folder'] ?? 'uploads';
            
            $result = $mediaManager->uploadFile($file, $user['id'], $altText, $caption, $folder);
            
            http_response_code($result['success'] ? 201 : 400);
            echo json_encode($result);
            break;
            
        case 'GET':
            if ($mediaId) {
                // Get specific media file
                $result = $mediaManager->getMediaById($mediaId);
                
                http_response_code($result['success'] ? 200 : 404);
                echo json_encode($result);
            } else {
                // Get media files with pagination
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 20);
                $type = $_GET['type'] ?? null;
                $userId = $_GET['user_id'] ?? null;
                
                // Limit results for non-authenticated users
                $authResult = authenticateUser();
                if (!$authResult['success']) {
                    $limit = min($limit, 10); // Limit to 10 for public access
                }
                
                $result = $mediaManager->getMediaFiles($page, $limit, $type, $userId);
                
                echo json_encode($result);
            }
            break;
            
        case 'PUT':
            // Update media metadata
            if (!$mediaId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Media ID required'
                ]);
                break;
            }
            
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $user = $authResult['user'];
            $input = json_decode(file_get_contents('php://input'), true);
            
            $altText = $input['alt_text'] ?? null;
            $caption = $input['caption'] ?? null;
            
            $result = $mediaManager->updateMedia($mediaId, $altText, $caption, $user['id']);
            
            http_response_code($result['success'] ? 200 : 400);
            echo json_encode($result);
            break;
            
        case 'DELETE':
            // Delete media file
            if (!$mediaId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Media ID required'
                ]);
                break;
            }
            
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $user = $authResult['user'];
            
            // Check permissions (only admin or file owner can delete)
            $mediaResult = $mediaManager->getMediaById($mediaId);
            if ($mediaResult['success']) {
                $media = $mediaResult['data'];
                if ($user['role'] !== 'admin' && $media['uploaded_by'] != $user['id']) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Permission denied'
                    ]);
                    break;
                }
            }
            
            $result = $mediaManager->deleteMedia($mediaId, $user['id']);
            
            http_response_code($result['success'] ? 200 : 400);
            echo json_encode($result);
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
                'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE']
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