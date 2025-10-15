<?php
/**
 * Blogs API Endpoint
 * Handles blog posts CRUD operations
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
$blogId = null;

// Extract blog ID from path if present
if (count($pathParts) >= 3 && is_numeric(end($pathParts))) {
    $blogId = (int)end($pathParts);
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
            if (isset($blogId)) {
                // Get specific blog by ID
                $stmt = $db->prepare("
                    SELECT b.*, c.name as category_name, c.slug as category_slug,
                           u.name as author_name, u.email as author_email,
                           GROUP_CONCAT(t.name) as tags
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    LEFT JOIN users u ON b.author_id = u.id
                    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
                    LEFT JOIN tags t ON bt.tag_id = t.id
                    WHERE b.id = ? AND b.status = 'published'
                    GROUP BY b.id
                ");
                
                $stmt->execute([$blogId]);
                $blog = $stmt->fetch();
                
                if (!$blog) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Blog post not found'
                    ]);
                    break;
                }
                
                // Increment view count
                $stmt = $db->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
                $stmt->execute([$blogId]);
                
                // Convert tags to array
                $blog['tags'] = $blog['tags'] ? explode(',', $blog['tags']) : [];
                
                echo json_encode([
                    'success' => true,
                    'data' => $blog
                ]);
                
            } elseif (isset($slug)) {
                // Get blog by slug
                $stmt = $db->prepare("
                    SELECT b.*, c.name as category_name, c.slug as category_slug,
                           u.name as author_name, u.email as author_email,
                           GROUP_CONCAT(t.name) as tags
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    LEFT JOIN users u ON b.author_id = u.id
                    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
                    LEFT JOIN tags t ON bt.tag_id = t.id
                    WHERE b.slug = ? AND b.status = 'published'
                    GROUP BY b.id
                ");
                
                $stmt->execute([$slug]);
                $blog = $stmt->fetch();
                
                if (!$blog) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Blog post not found'
                    ]);
                    break;
                }
                
                // Increment view count
                $stmt = $db->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
                $stmt->execute([$blog['id']]);
                
                // Convert tags to array
                $blog['tags'] = $blog['tags'] ? explode(',', $blog['tags']) : [];
                
                echo json_encode([
                    'success' => true,
                    'data' => $blog
                ]);
                
            } else {
                // Get all blogs with pagination and filters
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 10), 50); // Max 50 per page
                $category = $_GET['category'] ?? null;
                $tag = $_GET['tag'] ?? null;
                $search = $_GET['search'] ?? null;
                $featured = $_GET['featured'] ?? null;
                $offset = ($page - 1) * $limit;
                
                // Build WHERE conditions
                $whereConditions = ["b.status = 'published'"];
                $params = [];
                
                if ($category) {
                    $whereConditions[] = "c.slug = ?";
                    $params[] = $category;
                }
                
                if ($tag) {
                    $whereConditions[] = "t.slug = ?";
                    $params[] = $tag;
                }
                
                if ($search) {
                    $whereConditions[] = "(b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)";
                    $searchTerm = "%$search%";
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                }
                
                if ($featured === '1') {
                    $whereConditions[] = "b.featured = 1";
                }
                
                $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
                
                // Get total count
                $countQuery = "
                    SELECT COUNT(DISTINCT b.id) 
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
                    LEFT JOIN tags t ON bt.tag_id = t.id
                    $whereClause
                ";
                
                $stmt = $db->prepare($countQuery);
                $stmt->execute($params);
                $total = $stmt->fetchColumn();
                
                // Get blogs
                $query = "
                    SELECT b.id, b.title, b.slug, b.excerpt, b.featured_image, b.featured,
                           b.views, b.likes, b.read_time, b.published_at, b.created_at,
                           c.name as category_name, c.slug as category_slug,
                           u.name as author_name, u.email as author_email,
                           GROUP_CONCAT(DISTINCT t.name) as tags
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    LEFT JOIN users u ON b.author_id = u.id
                    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
                    LEFT JOIN tags t ON bt.tag_id = t.id
                    $whereClause
                    GROUP BY b.id
                    ORDER BY b.featured DESC, b.published_at DESC
                    LIMIT ? OFFSET ?
                ";
                
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $blogs = $stmt->fetchAll();
                
                // Convert tags to arrays
                foreach ($blogs as &$blog) {
                    $blog['tags'] = $blog['tags'] ? explode(',', $blog['tags']) : [];
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'blogs' => $blogs,
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
            // Create new blog post
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
            $requiredFields = ['title', 'content'];
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
                $stmt = $db->prepare("SELECT id FROM blogs WHERE slug = ?");
                $stmt->execute([$slug]);
                if (!$stmt->fetch()) break;
                
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            // Calculate read time (average 200 words per minute)
            $wordCount = str_word_count(strip_tags($input['content']));
            $readTime = max(1, ceil($wordCount / 200));
            
            // Insert blog post
            $stmt = $db->prepare("
                INSERT INTO blogs (
                    title, slug, excerpt, content, featured_image, category_id,
                    author_id, status, featured, allow_comments, meta_title,
                    meta_description, meta_keywords, read_time, published_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $publishedAt = ($input['status'] ?? 'draft') === 'published' ? date('Y-m-d H:i:s') : null;
            
            $stmt->execute([
                trim($input['title']),
                $slug,
                trim($input['excerpt'] ?? ''),
                trim($input['content']),
                trim($input['featured_image'] ?? ''),
                $input['category_id'] ?? null,
                $user['id'],
                $input['status'] ?? 'draft',
                $input['featured'] ?? 0,
                $input['allow_comments'] ?? 1,
                trim($input['meta_title'] ?? ''),
                trim($input['meta_description'] ?? ''),
                trim($input['meta_keywords'] ?? ''),
                $readTime,
                $publishedAt
            ]);
            
            $blogId = $db->lastInsertId();
            
            // Handle tags
            if (isset($input['tags']) && is_array($input['tags'])) {
                foreach ($input['tags'] as $tagName) {
                    $tagName = trim($tagName);
                    if (empty($tagName)) continue;
                    
                    // Create tag if it doesn't exist
                    $tagSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tagName)));
                    
                    $stmt = $db->prepare("INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)");
                    $stmt->execute([$tagName, $tagSlug]);
                    
                    // Get tag ID
                    $stmt = $db->prepare("SELECT id FROM tags WHERE slug = ?");
                    $stmt->execute([$tagSlug]);
                    $tagId = $stmt->fetchColumn();
                    
                    // Link blog to tag
                    $stmt = $db->prepare("INSERT IGNORE INTO blog_tags (blog_id, tag_id) VALUES (?, ?)");
                    $stmt->execute([$blogId, $tagId]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog post created successfully',
                'data' => [
                    'id' => $blogId,
                    'slug' => $slug
                ]
            ]);
            break;
            
        case 'PUT':
            // Update blog post
            if (!$blogId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog ID is required'
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
            
            // Check if blog exists and user has permission
            $stmt = $db->prepare("SELECT author_id FROM blogs WHERE id = ?");
            $stmt->execute([$blogId]);
            $blog = $stmt->fetch();
            
            if (!$blog) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog post not found'
                ]);
                break;
            }
            
            if ($user['role'] !== 'admin' && $blog['author_id'] != $user['id']) {
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
            
            if (isset($input['title'])) {
                $updates[] = "title = ?";
                $params[] = trim($input['title']);
            }
            
            if (isset($input['slug'])) {
                $updates[] = "slug = ?";
                $params[] = trim($input['slug']);
            }
            
            if (isset($input['excerpt'])) {
                $updates[] = "excerpt = ?";
                $params[] = trim($input['excerpt']);
            }
            
            if (isset($input['content'])) {
                $updates[] = "content = ?";
                $params[] = trim($input['content']);
                
                // Recalculate read time
                $wordCount = str_word_count(strip_tags($input['content']));
                $readTime = max(1, ceil($wordCount / 200));
                $updates[] = "read_time = ?";
                $params[] = $readTime;
            }
            
            if (isset($input['featured_image'])) {
                $updates[] = "featured_image = ?";
                $params[] = trim($input['featured_image']);
            }
            
            if (isset($input['category_id'])) {
                $updates[] = "category_id = ?";
                $params[] = $input['category_id'];
            }
            
            if (isset($input['status'])) {
                $updates[] = "status = ?";
                $params[] = $input['status'];
                
                // Set published_at if publishing
                if ($input['status'] === 'published') {
                    $updates[] = "published_at = NOW()";
                }
            }
            
            if (isset($input['featured'])) {
                $updates[] = "featured = ?";
                $params[] = $input['featured'];
            }
            
            if (isset($input['meta_title'])) {
                $updates[] = "meta_title = ?";
                $params[] = trim($input['meta_title']);
            }
            
            if (isset($input['meta_description'])) {
                $updates[] = "meta_description = ?";
                $params[] = trim($input['meta_description']);
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
            $params[] = $blogId;
            
            $query = "UPDATE blogs SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            
            // Handle tags update
            if (isset($input['tags']) && is_array($input['tags'])) {
                // Remove existing tags
                $stmt = $db->prepare("DELETE FROM blog_tags WHERE blog_id = ?");
                $stmt->execute([$blogId]);
                
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
                    
                    $stmt = $db->prepare("INSERT IGNORE INTO blog_tags (blog_id, tag_id) VALUES (?, ?)");
                    $stmt->execute([$blogId, $tagId]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog post updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete blog post
            if (!$blogId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog ID is required'
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
            
            // Check if blog exists and user has permission
            $stmt = $db->prepare("SELECT author_id, title FROM blogs WHERE id = ?");
            $stmt->execute([$blogId]);
            $blog = $stmt->fetch();
            
            if (!$blog) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog post not found'
                ]);
                break;
            }
            
            if ($user['role'] !== 'admin' && $blog['author_id'] != $user['id']) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Permission denied'
                ]);
                break;
            }
            
            // Delete blog tags first (foreign key constraint)
            $stmt = $db->prepare("DELETE FROM blog_tags WHERE blog_id = ?");
            $stmt->execute([$blogId]);
            
            // Delete blog post
            $stmt = $db->prepare("DELETE FROM blogs WHERE id = ?");
            $stmt->execute([$blogId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog post deleted successfully'
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