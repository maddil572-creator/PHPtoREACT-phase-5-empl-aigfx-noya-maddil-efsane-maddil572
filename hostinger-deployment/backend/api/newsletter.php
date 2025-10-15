<?php
/**
 * Newsletter API Endpoint
 * Handles newsletter subscriptions and management
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/EmailService.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse the path to get the action
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$action = end($pathParts);

try {
    $database = new Database();
    $db = $database->getConnection();
    $emailService = new EmailService();
    
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            switch ($action) {
                case 'subscribe':
                    // Validate email
                    if (!isset($input['email']) || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Valid email address is required'
                        ]);
                        break;
                    }
                    
                    $email = trim($input['email']);
                    $name = isset($input['name']) ? trim($input['name']) : '';
                    $source = isset($input['source']) ? trim($input['source']) : 'website';
                    $tags = isset($input['tags']) ? $input['tags'] : [];
                    
                    // Check if already subscribed
                    $stmt = $db->prepare("SELECT id, status FROM newsletter_subscribers WHERE email = ?");
                    $stmt->execute([$email]);
                    $existing = $stmt->fetch();
                    
                    if ($existing) {
                        if ($existing['status'] === 'active') {
                            echo json_encode([
                                'success' => true,
                                'message' => 'You are already subscribed to our newsletter!'
                            ]);
                            break;
                        } else {
                            // Reactivate subscription
                            $stmt = $db->prepare("
                                UPDATE newsletter_subscribers 
                                SET status = 'active', confirmed_at = NOW(), updated_at = NOW()
                                WHERE id = ?
                            ");
                            $stmt->execute([$existing['id']]);
                            
                            echo json_encode([
                                'success' => true,
                                'message' => 'Welcome back! Your subscription has been reactivated.'
                            ]);
                            break;
                        }
                    }
                    
                    // Rate limiting - check IP
                    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
                    $stmt = $db->prepare("
                        SELECT COUNT(*) FROM newsletter_subscribers 
                        WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                    ");
                    $stmt->execute([$ipAddress]);
                    $recentSubscriptions = $stmt->fetchColumn();
                    
                    if ($recentSubscriptions >= 5) {
                        http_response_code(429);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Too many subscription attempts. Please try again later.'
                        ]);
                        break;
                    }
                    
                    // Add new subscription
                    $stmt = $db->prepare("
                        INSERT INTO newsletter_subscribers (
                            email, name, status, source, tags, confirmed_at, 
                            ip_address, user_agent, created_at
                        ) VALUES (?, ?, 'active', ?, ?, NOW(), ?, ?, NOW())
                    ");
                    
                    $stmt->execute([
                        $email,
                        $name,
                        $source,
                        json_encode($tags),
                        $ipAddress,
                        $_SERVER['HTTP_USER_AGENT'] ?? null
                    ]);
                    
                    $subscriberId = $db->lastInsertId();
                    
                    // Send welcome email
                    $emailResult = $emailService->sendNewsletterConfirmation($email, $name);
                    
                    // Log activity
                    try {
                        $stmt = $db->prepare("
                            INSERT INTO activity_logs (action, entity, entity_id, description, ip_address, user_agent, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, NOW())
                        ");
                        
                        $stmt->execute([
                            'newsletter_subscribed',
                            'newsletter_subscribers',
                            $subscriberId,
                            "Newsletter subscription: $email",
                            $ipAddress,
                            $_SERVER['HTTP_USER_AGENT'] ?? null
                        ]);
                    } catch (Exception $e) {
                        error_log("Failed to log newsletter activity: " . $e->getMessage());
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Thank you for subscribing! Check your email for confirmation.',
                        'data' => [
                            'subscriber_id' => $subscriberId,
                            'email_sent' => $emailResult['success']
                        ]
                    ]);
                    break;
                    
                case 'unsubscribe':
                    if (!isset($input['email'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'Email address is required'
                        ]);
                        break;
                    }
                    
                    $email = trim($input['email']);
                    
                    // Update subscription status
                    $stmt = $db->prepare("
                        UPDATE newsletter_subscribers 
                        SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
                        WHERE email = ?
                    ");
                    
                    $stmt->execute([$email]);
                    
                    if ($stmt->rowCount() > 0) {
                        echo json_encode([
                            'success' => true,
                            'message' => 'You have been successfully unsubscribed from our newsletter.'
                        ]);
                    } else {
                        echo json_encode([
                            'success' => false,
                            'error' => 'Email address not found in our subscription list.'
                        ]);
                    }
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
            // Get newsletter subscribers (admin only)
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $status = $_GET['status'] ?? null;
            $offset = ($page - 1) * $limit;
            
            // Build query
            $whereConditions = [];
            $params = [];
            
            if ($status) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }
            
            $whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get total count
            $countQuery = "SELECT COUNT(*) FROM newsletter_subscribers $whereClause";
            $stmt = $db->prepare($countQuery);
            $stmt->execute($params);
            $total = $stmt->fetchColumn();
            
            // Get subscribers
            $query = "
                SELECT * FROM newsletter_subscribers 
                $whereClause 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $subscribers = $stmt->fetchAll();
            
            // Parse tags JSON
            foreach ($subscribers as &$subscriber) {
                $subscriber['tags'] = json_decode($subscriber['tags'] ?? '[]', true);
            }
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'subscribers' => $subscribers,
                    'pagination' => [
                        'total' => (int)$total,
                        'page' => (int)$page,
                        'limit' => (int)$limit,
                        'pages' => ceil($total / $limit)
                    ]
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