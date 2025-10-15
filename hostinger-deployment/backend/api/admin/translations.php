<?php
/**
 * Admin Translations API Endpoint
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
            // Return basic translation structure
            // In a real app, you'd have a translations table
            $translations = [
                'en' => [
                    'common' => [
                        'home' => 'Home',
                        'about' => 'About',
                        'services' => 'Services',
                        'portfolio' => 'Portfolio',
                        'blog' => 'Blog',
                        'contact' => 'Contact',
                        'get_started' => 'Get Started',
                        'learn_more' => 'Learn More',
                        'read_more' => 'Read More',
                        'view_all' => 'View All'
                    ],
                    'hero' => [
                        'title' => 'Transform Your Brand',
                        'subtitle' => 'Professional Design Services',
                        'description' => 'Get premium logo design, YouTube thumbnails, and video editing services that make your brand stand out from the competition.'
                    ]
                ],
                'es' => [
                    'common' => [
                        'home' => 'Inicio',
                        'about' => 'Acerca de',
                        'services' => 'Servicios',
                        'portfolio' => 'Portafolio',
                        'blog' => 'Blog',
                        'contact' => 'Contacto',
                        'get_started' => 'Comenzar',
                        'learn_more' => 'Saber Más',
                        'read_more' => 'Leer Más',
                        'view_all' => 'Ver Todo'
                    ],
                    'hero' => [
                        'title' => 'Transforma Tu Marca',
                        'subtitle' => 'Servicios de Diseño Profesional',
                        'description' => 'Obtén diseño de logos premium, miniaturas de YouTube y servicios de edición de video que hacen que tu marca se destaque de la competencia.'
                    ]
                ]
            ];
            
            $language = $_GET['language'] ?? 'en';
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'language' => $language,
                    'translations' => $translations[$language] ?? $translations['en']
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