<?php
/**
 * API Test Endpoint
 * Simple endpoint to test API connectivity
 */

header('Content-Type: application/json');

// Load configuration
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Test database connection
            $dbTest = false;
            $dbMessage = '';
            
            try {
                $database = new Database();
                $db = $database->getConnection();
                $stmt = $db->query("SELECT 1 as test");
                $result = $stmt->fetch();
                $dbTest = ($result['test'] == 1);
                $dbMessage = 'Database connection successful';
            } catch (Exception $e) {
                $dbMessage = 'Database connection failed: ' . $e->getMessage();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'API is working',
                'data' => [
                    'timestamp' => date('c'),
                    'version' => APP_VERSION,
                    'environment' => $_ENV['APP_ENV'] ?? 'unknown',
                    'database' => [
                        'connected' => $dbTest,
                        'message' => $dbMessage
                    ],
                    'cors' => [
                        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
                        'allowed_origins' => ALLOWED_ORIGINS
                    ]
                ]
            ]);
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            echo json_encode([
                'success' => true,
                'message' => 'POST request received',
                'data' => [
                    'received' => $input,
                    'timestamp' => date('c')
                ]
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed',
                'allowed_methods' => ['GET', 'POST']
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