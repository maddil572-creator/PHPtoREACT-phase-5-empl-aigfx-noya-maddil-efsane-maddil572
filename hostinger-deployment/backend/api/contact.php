<?php
/**
 * Contact Form API Endpoint
 * Handles contact form submissions and email notifications
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/EmailService.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();
    $emailService = new EmailService();
    
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $requiredFields = ['name', 'email', 'message'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || empty(trim($input[$field]))) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => ucfirst($field) . ' is required'
                    ]);
                    exit;
                }
            }
            
            // Validate email format
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid email format'
                ]);
                exit;
            }
            
            // Sanitize input data
            $contactData = [
                'name' => trim($input['name']),
                'email' => trim($input['email']),
                'phone' => isset($input['phone']) ? trim($input['phone']) : null,
                'subject' => isset($input['subject']) ? trim($input['subject']) : 'General Inquiry',
                'service' => isset($input['service']) ? trim($input['service']) : null,
                'budget' => isset($input['budget']) ? trim($input['budget']) : null,
                'timeline' => isset($input['timeline']) ? trim($input['timeline']) : null,
                'message' => trim($input['message']),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'utm_source' => isset($input['utm_source']) ? trim($input['utm_source']) : null,
                'utm_medium' => isset($input['utm_medium']) ? trim($input['utm_medium']) : null,
                'utm_campaign' => isset($input['utm_campaign']) ? trim($input['utm_campaign']) : null
            ];
            
            // Basic spam protection
            if (strlen($contactData['message']) < 10) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Message is too short'
                ]);
                exit;
            }
            
            // Check for spam patterns
            $spamPatterns = [
                '/\b(viagra|cialis|casino|poker|loan|credit)\b/i',
                '/\b(make money|work from home|get rich)\b/i',
                '/http[s]?:\/\/[^\s]+/i' // URLs in message
            ];
            
            foreach ($spamPatterns as $pattern) {
                if (preg_match($pattern, $contactData['message'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Message contains prohibited content'
                    ]);
                    exit;
                }
            }
            
            // Rate limiting - check if same IP submitted recently
            $stmt = $db->prepare("
                SELECT COUNT(*) FROM contacts 
                WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            ");
            $stmt->execute([$contactData['ip_address']]);
            $recentSubmissions = $stmt->fetchColumn();
            
            if ($recentSubmissions >= 3) {
                http_response_code(429);
                echo json_encode([
                    'success' => false,
                    'error' => 'Too many submissions. Please wait before submitting again.'
                ]);
                exit;
            }
            
            // Save to database
            $stmt = $db->prepare("
                INSERT INTO contacts (
                    name, email, phone, subject, service, budget, timeline, message,
                    ip_address, user_agent, utm_source, utm_medium, utm_campaign, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $contactData['name'],
                $contactData['email'],
                $contactData['phone'],
                $contactData['subject'],
                $contactData['service'],
                $contactData['budget'],
                $contactData['timeline'],
                $contactData['message'],
                $contactData['ip_address'],
                $contactData['user_agent'],
                $contactData['utm_source'],
                $contactData['utm_medium'],
                $contactData['utm_campaign']
            ]);
            
            $contactId = $db->lastInsertId();
            
            // Send notification emails
            $emailResults = [];
            
            // Send notification to admin
            $adminNotification = $emailService->sendContactNotification($contactData);
            $emailResults['admin_notification'] = $adminNotification;
            
            // Send confirmation to user
            $userConfirmation = $emailService->sendContactConfirmation($contactData);
            $emailResults['user_confirmation'] = $userConfirmation;
            
            // Log activity
            try {
                $stmt = $db->prepare("
                    INSERT INTO activity_logs (action, entity, entity_id, description, ip_address, user_agent, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW())
                ");
                
                $stmt->execute([
                    'contact_submitted',
                    'contacts',
                    $contactId,
                    "Contact form submitted by {$contactData['name']} ({$contactData['email']})",
                    $contactData['ip_address'],
                    $contactData['user_agent']
                ]);
            } catch (Exception $e) {
                // Log error but don't fail the main operation
                error_log("Failed to log contact activity: " . $e->getMessage());
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Thank you for your message! We will get back to you within 24 hours.',
                'data' => [
                    'contact_id' => $contactId,
                    'email_results' => $emailResults
                ]
            ]);
            break;
            
        case 'GET':
            // Get contact submissions (admin only)
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
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
            $countQuery = "SELECT COUNT(*) FROM contacts $whereClause";
            $stmt = $db->prepare($countQuery);
            $stmt->execute($params);
            $total = $stmt->fetchColumn();
            
            // Get contacts
            $query = "
                SELECT c.*, u.name as assigned_to_name 
                FROM contacts c 
                LEFT JOIN users u ON c.assigned_to = u.id 
                $whereClause 
                ORDER BY c.created_at DESC 
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $contacts = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'contacts' => $contacts,
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