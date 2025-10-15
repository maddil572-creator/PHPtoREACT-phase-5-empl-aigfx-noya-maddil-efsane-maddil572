<?php
/**
 * Adil GFX Backend - Main Entry Point
 * Routes all API requests to appropriate handlers
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load configuration and dependencies
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/middleware/rate_limit.php';

// Autoload classes
spl_autoload_register(function ($class) {
    $classFile = __DIR__ . '/classes/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($classFile)) {
        require_once $classFile;
    }
});

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Remove backend prefix if present
$path = str_replace('/backend', '', $path);

// Set JSON content type
header('Content-Type: application/json');

try {
    // Route API requests
    if (strpos($path, '/api/') === 0) {
        $apiPath = substr($path, 4); // Remove '/api' prefix
        
        // Route to appropriate API handler
        switch (true) {
            // Authentication endpoints
            case $apiPath === '/auth.php' || strpos($apiPath, '/auth.php/') === 0:
                require_once __DIR__ . '/api/auth.php';
                break;
                
            // Blog endpoints
            case $apiPath === '/blogs.php' || strpos($apiPath, '/blogs.php/') === 0:
                require_once __DIR__ . '/api/blogs.php';
                break;
                
            // Portfolio endpoints
            case $apiPath === '/portfolio.php' || strpos($apiPath, '/portfolio.php/') === 0:
                require_once __DIR__ . '/api/portfolio.php';
                break;
                
            // Services endpoints
            case $apiPath === '/services.php' || strpos($apiPath, '/services.php/') === 0:
                require_once __DIR__ . '/api/services.php';
                break;
                
            // Testimonials endpoints
            case $apiPath === '/testimonials.php' || strpos($apiPath, '/testimonials.php/') === 0:
                require_once __DIR__ . '/api/testimonials.php';
                break;
                
            // Settings endpoints
            case $apiPath === '/settings.php' || strpos($apiPath, '/settings.php/') === 0:
                require_once __DIR__ . '/api/settings.php';
                break;
                
            // Contact endpoints
            case $apiPath === '/contact.php' || strpos($apiPath, '/contact.php/') === 0:
                require_once __DIR__ . '/api/contact.php';
                break;
                
            // Newsletter endpoints
            case $apiPath === '/newsletter.php' || strpos($apiPath, '/newsletter.php/') === 0:
                require_once __DIR__ . '/api/newsletter.php';
                break;
                
            // Upload endpoints
            case $apiPath === '/uploads.php' || strpos($apiPath, '/uploads.php/') === 0:
                require_once __DIR__ . '/api/uploads.php';
                break;
                
            // Carousel endpoints
            case $apiPath === '/carousel.php' || strpos($apiPath, '/carousel.php/') === 0:
                require_once __DIR__ . '/api/carousel.php';
                break;
                
            // Pages endpoints
            case $apiPath === '/pages.php' || strpos($apiPath, '/pages.php/') === 0:
                require_once __DIR__ . '/api/pages.php';
                break;
                
            // Translations endpoints
            case $apiPath === '/translations.php' || strpos($apiPath, '/translations.php/') === 0:
                require_once __DIR__ . '/api/translations.php';
                break;
                
            // Admin endpoints
            case strpos($apiPath, '/admin/') === 0:
                $adminPath = substr($apiPath, 7); // Remove '/admin/' prefix
                
                switch (true) {
                    case $adminPath === 'stats.php' || strpos($adminPath, 'stats.php/') === 0:
                        require_once __DIR__ . '/api/admin/stats.php';
                        break;
                        
                    case $adminPath === 'activity.php' || strpos($adminPath, 'activity.php/') === 0:
                        require_once __DIR__ . '/api/admin/activity.php';
                        break;
                        
                    case $adminPath === 'users.php' || strpos($adminPath, 'users.php/') === 0:
                        require_once __DIR__ . '/api/admin/users.php';
                        break;
                        
                    case $adminPath === 'translations.php' || strpos($adminPath, 'translations.php/') === 0:
                        require_once __DIR__ . '/api/admin/translations.php';
                        break;
                        
                    default:
                        http_response_code(404);
                        echo json_encode(['error' => 'Admin endpoint not found']);
                        break;
                }
                break;
                
            // User endpoints
            case strpos($apiPath, '/user/') === 0:
                $userPath = substr($apiPath, 6); // Remove '/user/' prefix
                
                switch (true) {
                    case $userPath === 'profile.php' || strpos($userPath, 'profile.php/') === 0:
                        require_once __DIR__ . '/api/user/profile.php';
                        break;
                        
                    default:
                        http_response_code(404);
                        echo json_encode(['error' => 'User endpoint not found']);
                        break;
                }
                break;
                
            // Funnel endpoints
            case strpos($apiPath, '/funnel/') === 0:
                $funnelPath = substr($apiPath, 8); // Remove '/funnel/' prefix
                
                switch (true) {
                    case $funnelPath === 'simulate.php' || strpos($funnelPath, 'simulate.php/') === 0:
                        require_once __DIR__ . '/api/funnel/simulate.php';
                        break;
                        
                    case $funnelPath === 'report.php' || strpos($funnelPath, 'report.php/') === 0:
                        require_once __DIR__ . '/api/funnel/report.php';
                        break;
                        
                    default:
                        http_response_code(404);
                        echo json_encode(['error' => 'Funnel endpoint not found']);
                        break;
                }
                break;
                
            default:
                http_response_code(404);
                echo json_encode(['error' => 'API endpoint not found']);
                break;
        }
    } else {
        // Non-API requests - serve admin panel or redirect
        if ($path === '/' || $path === '/admin' || strpos($path, '/admin/') === 0) {
            // Serve admin panel
            require_once __DIR__ . '/admin/index.php';
        } else {
            // API status endpoint
            echo json_encode([
                'success' => true,
                'message' => 'Adil GFX Backend API',
                'version' => APP_VERSION,
                'timestamp' => date('c'),
                'endpoints' => [
                    'auth' => '/api/auth.php',
                    'blogs' => '/api/blogs.php',
                    'portfolio' => '/api/portfolio.php',
                    'services' => '/api/services.php',
                    'testimonials' => '/api/testimonials.php',
                    'settings' => '/api/settings.php',
                    'contact' => '/api/contact.php',
                    'uploads' => '/api/uploads.php',
                    'admin' => '/api/admin/',
                    'user' => '/api/user/'
                ]
            ]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong'
    ]);
}