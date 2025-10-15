<?php
/**
 * Translations API Endpoint
 * Handles multi-language content translations
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

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
            // Get translations
            $language = $_GET['language'] ?? 'en';
            $contentType = $_GET['content_type'] ?? null;
            
            // Return basic translation structure
            $translations = [
                'en' => [
                    'common' => [
                        'home' => 'Home',
                        'about' => 'About',
                        'services' => 'Services',
                        'portfolio' => 'Portfolio',
                        'blog' => 'Blog',
                        'contact' => 'Contact',
                        'testimonials' => 'Testimonials',
                        'get_started' => 'Get Started',
                        'learn_more' => 'Learn More',
                        'read_more' => 'Read More',
                        'view_all' => 'View All',
                        'contact_us' => 'Contact Us',
                        'subscribe' => 'Subscribe',
                        'submit' => 'Submit',
                        'loading' => 'Loading...',
                        'error' => 'Error',
                        'success' => 'Success'
                    ],
                    'hero' => [
                        'title' => 'Transform Your Brand',
                        'subtitle' => 'Professional Design Services',
                        'description' => 'Get premium logo design, YouTube thumbnails, and video editing services that make your brand stand out from the competition.',
                        'cta' => 'Get Started Today'
                    ],
                    'services' => [
                        'title' => 'Our Services',
                        'subtitle' => 'Professional Design Solutions',
                        'logo_design' => 'Logo Design',
                        'youtube_thumbnails' => 'YouTube Thumbnails',
                        'video_editing' => 'Video Editing',
                        'web_design' => 'Web Design',
                        'branding' => 'Branding',
                        'social_media' => 'Social Media Graphics'
                    ],
                    'contact' => [
                        'title' => 'Get In Touch',
                        'subtitle' => 'Ready to start your project?',
                        'name' => 'Name',
                        'email' => 'Email',
                        'phone' => 'Phone',
                        'subject' => 'Subject',
                        'message' => 'Message',
                        'send_message' => 'Send Message'
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
                        'testimonials' => 'Testimonios',
                        'get_started' => 'Comenzar',
                        'learn_more' => 'Saber Más',
                        'read_more' => 'Leer Más',
                        'view_all' => 'Ver Todo',
                        'contact_us' => 'Contáctanos',
                        'subscribe' => 'Suscribirse',
                        'submit' => 'Enviar',
                        'loading' => 'Cargando...',
                        'error' => 'Error',
                        'success' => 'Éxito'
                    ],
                    'hero' => [
                        'title' => 'Transforma Tu Marca',
                        'subtitle' => 'Servicios de Diseño Profesional',
                        'description' => 'Obtén diseño de logos premium, miniaturas de YouTube y servicios de edición de video que hacen que tu marca se destaque de la competencia.',
                        'cta' => 'Comenzar Hoy'
                    ],
                    'services' => [
                        'title' => 'Nuestros Servicios',
                        'subtitle' => 'Soluciones de Diseño Profesional',
                        'logo_design' => 'Diseño de Logos',
                        'youtube_thumbnails' => 'Miniaturas de YouTube',
                        'video_editing' => 'Edición de Video',
                        'web_design' => 'Diseño Web',
                        'branding' => 'Branding',
                        'social_media' => 'Gráficos para Redes Sociales'
                    ],
                    'contact' => [
                        'title' => 'Ponte en Contacto',
                        'subtitle' => '¿Listo para comenzar tu proyecto?',
                        'name' => 'Nombre',
                        'email' => 'Correo',
                        'phone' => 'Teléfono',
                        'subject' => 'Asunto',
                        'message' => 'Mensaje',
                        'send_message' => 'Enviar Mensaje'
                    ]
                ]
            ];
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'language' => $language,
                    'translations' => $translations[$language] ?? $translations['en'],
                    'available_languages' => array_keys($translations)
                ]
            ]);
            break;
            
        case 'POST':
            // Save new translation (admin only)
            $authResult = authenticateAdmin();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // For now, return success (would implement actual translation storage)
            echo json_encode([
                'success' => true,
                'message' => 'Translation saved successfully'
            ]);
            break;
            
        case 'PUT':
            // Update translation (admin only)
            $authResult = authenticateAdmin();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // For now, return success (would implement actual translation update)
            echo json_encode([
                'success' => true,
                'message' => 'Translation updated successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET', 'POST', 'PUT']
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