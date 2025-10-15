<?php
/**
 * Portfolio API Endpoint
 * Handles portfolio items CRUD operations
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse the path to get the ID if present
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$portfolioId = null;

// Extract portfolio ID from path if present
if (count($pathParts) >= 3 && is_numeric(end($pathParts))) {
    $portfolioId = (int)end($pathParts);
} elseif (count($pathParts) >= 3 && !is_numeric(end($pathParts))) {
    // Handle slug-based requests
    $slug = end($pathParts);
}

/**
 * Authenticate user for write operations
 */
function authenticateUser() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
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
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            if (isset($portfolioId)) {
                // Get specific portfolio item by ID
                $stmt = $db->prepare("
                    SELECT p.*, c.name as category_name, c.slug as category_slug,
                           GROUP_CONCAT(t.name) as tags
                    FROM portfolio p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN portfolio_tags pt ON p.id = pt.portfolio_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    WHERE p.id = ? AND p.status = 'active'
                    GROUP BY p.id
                ");
                
                $stmt->execute([$portfolioId]);
                $portfolio = $stmt->fetch();
                
                if (!$portfolio) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Portfolio item not found'
                    ]);
                    break;
                }
                
                // Increment view count
                $stmt = $db->prepare("UPDATE portfolio SET views = views + 1 WHERE id = ?");
                $stmt->execute([$portfolioId]);
                
                // Parse JSON fields
                $portfolio['gallery_images'] = json_decode($portfolio['gallery_images'] ?? '[]', true);
                $portfolio['technologies'] = json_decode($portfolio['technologies'] ?? '[]', true);
                $portfolio['results_metrics'] = json_decode($portfolio['results_metrics'] ?? '{}', true);
                $portfolio['tags'] = $portfolio['tags'] ? explode(',', $portfolio['tags']) : [];
                
                echo json_encode([
                    'success' => true,
                    'data' => $portfolio
                ]);
                
            } elseif (isset($slug)) {
                // Get portfolio item by slug
                $stmt = $db->prepare("
                    SELECT p.*, c.name as category_name, c.slug as category_slug,
                           GROUP_CONCAT(t.name) as tags
                    FROM portfolio p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN portfolio_tags pt ON p.id = pt.portfolio_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    WHERE p.slug = ? AND p.status = 'active'
                    GROUP BY p.id
                ");
                
                $stmt->execute([$slug]);
                $portfolio = $stmt->fetch();
                
                if (!$portfolio) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Portfolio item not found'
                    ]);
                    break;
                }
                
                // Increment view count
                $stmt = $db->prepare("UPDATE portfolio SET views = views + 1 WHERE id = ?");
                $stmt->execute([$portfolio['id']]);
                
                // Parse JSON fields
                $portfolio['gallery_images'] = json_decode($portfolio['gallery_images'] ?? '[]', true);
                $portfolio['technologies'] = json_decode($portfolio['technologies'] ?? '[]', true);
                $portfolio['results_metrics'] = json_decode($portfolio['results_metrics'] ?? '{}', true);
                $portfolio['tags'] = $portfolio['tags'] ? explode(',', $portfolio['tags']) : [];
                
                echo json_encode([
                    'success' => true,
                    'data' => $portfolio
                ]);
                
            } else {
                // Get all portfolio items with pagination and filters
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 12), 50);
                $category = $_GET['category'] ?? null;
                $tag = $_GET['tag'] ?? null;
                $featured = $_GET['featured'] ?? null;
                $offset = ($page - 1) * $limit;
                
                // Build WHERE conditions
                $whereConditions = ["p.status = 'active'"];
                $params = [];
                
                if ($category && $category !== 'All') {
                    $whereConditions[] = "c.slug = ?";
                    $params[] = $category;
                }
                
                if ($tag) {
                    $whereConditions[] = "t.slug = ?";
                    $params[] = $tag;
                }
                
                if ($featured === '1') {
                    $whereConditions[] = "p.featured = 1";
                }
                
                $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
                
                // Get total count
                $countQuery = "
                    SELECT COUNT(DISTINCT p.id) 
                    FROM portfolio p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN portfolio_tags pt ON p.id = pt.portfolio_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    $whereClause
                ";
                
                $stmt = $db->prepare($countQuery);
                $stmt->execute($params);
                $total = $stmt->fetchColumn();
                
                // Get portfolio items
                $query = "
                    SELECT p.id, p.title, p.slug, p.description, p.featured_image,
                           p.client_name, p.completion_date, p.featured, p.views, p.likes,
                           c.name as category_name, c.slug as category_slug,
                           GROUP_CONCAT(DISTINCT t.name) as tags
                    FROM portfolio p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN portfolio_tags pt ON p.id = pt.portfolio_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    $whereClause
                    GROUP BY p.id
                    ORDER BY p.featured DESC, p.sort_order ASC, p.created_at DESC
                    LIMIT ? OFFSET ?
                ";
                
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $portfolioItems = $stmt->fetchAll();
                
                // Convert tags to arrays
                foreach ($portfolioItems as &$item) {
                    $item['tags'] = $item['tags'] ? explode(',', $item['tags']) : [];
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'portfolio' => $portfolioItems,
                        'pagination' => [
                            'total' => (int)$total,
                            'page' => (int)$page,
                            'limit' => (int)$limit,
                            'pages' => ceil($total / $limit)
                        ]
                    ]
                ]);
            }
            break;
            
        case 'POST':
            // Create new portfolio item
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            $user = $authResult['user'];
            
            // Check permissions
            if (!in_array($user['role'], ['admin', 'editor'])) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Permission denied'
                ]);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $requiredFields = ['title', 'description', 'featured_image'];
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
            
            // Generate slug if not provided
            $slug = isset($input['slug']) ? trim($input['slug']) : '';
            if (empty($slug)) {
                $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['title'])));
            }
            
            // Ensure slug is unique
            $originalSlug = $slug;
            $counter = 1;
            while (true) {
                $stmt = $db->prepare("SELECT id FROM portfolio WHERE slug = ?");
                $stmt->execute([$slug]);
                if (!$stmt->fetch()) break;
                
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            // Insert portfolio item
            $stmt = $db->prepare("
                INSERT INTO portfolio (
                    title, slug, description, long_description, featured_image,
                    gallery_images, category_id, client_name, client_website,
                    project_url, technologies, completion_date, project_duration,
                    budget_range, results_metrics, before_image, after_image,
                    featured, status, sort_order, meta_title, meta_description, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                trim($input['title']),
                $slug,
                trim($input['description']),
                trim($input['long_description'] ?? ''),
                trim($input['featured_image']),
                json_encode($input['gallery_images'] ?? []),
                $input['category_id'] ?? null,
                trim($input['client_name'] ?? ''),
                trim($input['client_website'] ?? ''),
                trim($input['project_url'] ?? ''),
                json_encode($input['technologies'] ?? []),
                $input['completion_date'] ?? null,
                trim($input['project_duration'] ?? ''),
                trim($input['budget_range'] ?? ''),
                json_encode($input['results_metrics'] ?? []),
                trim($input['before_image'] ?? ''),
                trim($input['after_image'] ?? ''),
                $input['featured'] ?? 0,
                $input['status'] ?? 'active',
                $input['sort_order'] ?? 0,
                trim($input['meta_title'] ?? ''),
                trim($input['meta_description'] ?? '')
            ]);
            
            $portfolioId = $db->lastInsertId();
            
            // Handle tags
            if (isset($input['tags']) && is_array($input['tags'])) {
                foreach ($input['tags'] as $tagName) {
                    $tagName = trim($tagName);
                    if (empty($tagName)) continue;
                    
                    $tagSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tagName)));
                    
                    $stmt = $db->prepare("INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)");
                    $stmt->execute([$tagName, $tagSlug]);
                    
                    $stmt = $db->prepare("SELECT id FROM tags WHERE slug = ?");
                    $stmt->execute([$tagSlug]);
                    $tagId = $stmt->fetchColumn();
                    
                    $stmt = $db->prepare("INSERT IGNORE INTO portfolio_tags (portfolio_id, tag_id) VALUES (?, ?)");
                    $stmt->execute([$portfolioId, $tagId]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Portfolio item created successfully',
                'data' => [
                    'id' => $portfolioId,
                    'slug' => $slug
                ]
            ]);
            break;
            
        case 'PUT':
            // Update portfolio item
            if (!$portfolioId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Portfolio ID is required'
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
            
            // Check permissions
            if (!in_array($user['role'], ['admin', 'editor'])) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Permission denied'
                ]);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Build update query dynamically
            $updates = [];
            $params = [];
            
            $allowedFields = [
                'title', 'slug', 'description', 'long_description', 'featured_image',
                'category_id', 'client_name', 'client_website', 'project_url',
                'completion_date', 'project_duration', 'budget_range', 'before_image',
                'after_image', 'featured', 'status', 'sort_order', 'meta_title', 'meta_description'
            ];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            // Handle JSON fields
            if (isset($input['gallery_images'])) {
                $updates[] = "gallery_images = ?";
                $params[] = json_encode($input['gallery_images']);
            }
            
            if (isset($input['technologies'])) {
                $updates[] = "technologies = ?";
                $params[] = json_encode($input['technologies']);
            }
            
            if (isset($input['results_metrics'])) {
                $updates[] = "results_metrics = ?";
                $params[] = json_encode($input['results_metrics']);
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No updates provided'
                ]);
                break;
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $portfolioId;
            
            $query = "UPDATE portfolio SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            
            // Handle tags update
            if (isset($input['tags']) && is_array($input['tags'])) {
                // Remove existing tags
                $stmt = $db->prepare("DELETE FROM portfolio_tags WHERE portfolio_id = ?");
                $stmt->execute([$portfolioId]);
                
                // Add new tags
                foreach ($input['tags'] as $tagName) {
                    $tagName = trim($tagName);
                    if (empty($tagName)) continue;
                    
                    $tagSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tagName)));
                    
                    $stmt = $db->prepare("INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)");
                    $stmt->execute([$tagName, $tagSlug]);
                    
                    $stmt = $db->prepare("SELECT id FROM tags WHERE slug = ?");
                    $stmt->execute([$tagSlug]);
                    $tagId = $stmt->fetchColumn();
                    
                    $stmt = $db->prepare("INSERT IGNORE INTO portfolio_tags (portfolio_id, tag_id) VALUES (?, ?)");
                    $stmt->execute([$portfolioId, $tagId]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Portfolio item updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete portfolio item
            if (!$portfolioId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Portfolio ID is required'
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
            
            // Check permissions
            if ($user['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Permission denied'
                ]);
                break;
            }
            
            // Delete portfolio tags first
            $stmt = $db->prepare("DELETE FROM portfolio_tags WHERE portfolio_id = ?");
            $stmt->execute([$portfolioId]);
            
            // Delete portfolio item
            $stmt = $db->prepare("DELETE FROM portfolio WHERE id = ?");
            $stmt->execute([$portfolioId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Portfolio item deleted successfully'
            ]);
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