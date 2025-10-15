<?php
/**
 * FAQ Management API
 * Handles CRUD operations for FAQ items
 */

require_once '../config/database.php';
require_once '../classes/Database.php';
require_once '../middleware/cors.php';
require_once '../middleware/rate_limit.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    
    // Extract FAQ ID if present
    $faqId = null;
    if (isset($pathParts[3]) && is_numeric($pathParts[3])) {
        $faqId = (int)$pathParts[3];
    }
    
    switch ($method) {
        case 'GET':
            if ($faqId) {
                // Get single FAQ
                $stmt = $pdo->prepare("
                    SELECT * FROM faqs 
                    WHERE id = ?
                ");
                $stmt->execute([$faqId]);
                $faq = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$faq) {
                    http_response_code(404);
                    echo json_encode(['error' => 'FAQ not found']);
                    exit;
                }
                
                echo json_encode($faq);
            } else {
                // Get all FAQs
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 50);
                $category = $_GET['category'] ?? null;
                $status = $_GET['status'] ?? null;
                $search = $_GET['search'] ?? null;
                
                $offset = ($page - 1) * $limit;
                
                // Build query
                $whereConditions = [];
                $params = [];
                
                if ($category) {
                    $whereConditions[] = "category = ?";
                    $params[] = $category;
                }
                
                if ($status) {
                    $whereConditions[] = "status = ?";
                    $params[] = $status;
                }
                
                if ($search) {
                    $whereConditions[] = "(question LIKE ? OR answer LIKE ?)";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                }
                
                $whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                // Get total count
                $countStmt = $pdo->prepare("SELECT COUNT(*) FROM faqs $whereClause");
                $countStmt->execute($params);
                $totalCount = $countStmt->fetchColumn();
                
                // Get FAQs
                $stmt = $pdo->prepare("
                    SELECT * FROM faqs 
                    $whereClause 
                    ORDER BY `order` ASC, category ASC, created_at DESC 
                    LIMIT ? OFFSET ?
                ");
                $stmt->execute([...$params, $limit, $offset]);
                $faqs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'data' => $faqs,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $totalCount,
                        'totalPages' => ceil($totalCount / $limit)
                    ]
                ]);
            }
            break;
            
        case 'POST':
            if (isset($pathParts[3]) && $pathParts[3] === 'bulk-update') {
                // Bulk update FAQs
                $input = json_decode(file_get_contents('php://input'), true);
                $updates = $input['updates'] ?? [];
                
                $pdo->beginTransaction();
                
                try {
                    foreach ($updates as $update) {
                        $id = $update['id'];
                        $fields = [];
                        $params = [];
                        
                        if (isset($update['order'])) {
                            $fields[] = "`order` = ?";
                            $params[] = $update['order'];
                        }
                        
                        if (isset($update['status'])) {
                            $fields[] = "status = ?";
                            $params[] = $update['status'];
                        }
                        
                        if ($fields) {
                            $params[] = $id;
                            $stmt = $pdo->prepare("
                                UPDATE faqs 
                                SET " . implode(', ', $fields) . ", updated_at = NOW() 
                                WHERE id = ?
                            ");
                            $stmt->execute($params);
                        }
                    }
                    
                    $pdo->commit();
                    echo json_encode(['success' => true, 'message' => 'FAQs updated successfully']);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    throw $e;
                }
            } else {
                // Create new FAQ
                $input = json_decode(file_get_contents('php://input'), true);
                
                $required = ['question', 'answer', 'category'];
                foreach ($required as $field) {
                    if (empty($input[$field])) {
                        http_response_code(400);
                        echo json_encode(['error' => "Field '$field' is required"]);
                        exit;
                    }
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO faqs (question, answer, category, status, `order`, featured, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                ");
                
                $stmt->execute([
                    $input['question'],
                    $input['answer'],
                    $input['category'],
                    $input['status'] ?? 'draft',
                    $input['order'] ?? 0,
                    $input['featured'] ?? false
                ]);
                
                $faqId = $pdo->lastInsertId();
                
                // Return created FAQ
                $stmt = $pdo->prepare("SELECT * FROM faqs WHERE id = ?");
                $stmt->execute([$faqId]);
                $faq = $stmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(201);
                echo json_encode($faq);
            }
            break;
            
        case 'PUT':
            if (!$faqId) {
                http_response_code(400);
                echo json_encode(['error' => 'FAQ ID is required']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Check if FAQ exists
            $stmt = $pdo->prepare("SELECT id FROM faqs WHERE id = ?");
            $stmt->execute([$faqId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'FAQ not found']);
                exit;
            }
            
            // Build update query
            $fields = [];
            $params = [];
            
            $allowedFields = ['question', 'answer', 'category', 'status', 'order', 'featured'];
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "`$field` = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid fields to update']);
                exit;
            }
            
            $fields[] = "updated_at = NOW()";
            $params[] = $faqId;
            
            $stmt = $pdo->prepare("
                UPDATE faqs 
                SET " . implode(', ', $fields) . " 
                WHERE id = ?
            ");
            $stmt->execute($params);
            
            // Return updated FAQ
            $stmt = $pdo->prepare("SELECT * FROM faqs WHERE id = ?");
            $stmt->execute([$faqId]);
            $faq = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode($faq);
            break;
            
        case 'DELETE':
            if (!$faqId) {
                http_response_code(400);
                echo json_encode(['error' => 'FAQ ID is required']);
                exit;
            }
            
            // Check if FAQ exists
            $stmt = $pdo->prepare("SELECT id FROM faqs WHERE id = ?");
            $stmt->execute([$faqId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'FAQ not found']);
                exit;
            }
            
            // Delete FAQ
            $stmt = $pdo->prepare("DELETE FROM faqs WHERE id = ?");
            $stmt->execute([$faqId]);
            
            echo json_encode(['success' => true, 'message' => 'FAQ deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong'
    ]);
}
?>