<?php
/**
 * Admin Blog Management API Endpoint
 * Handles admin-specific blog operations
 */

header('Content-Type: application/json');

// Load dependencies
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';

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
    
    // Authenticate admin
    $authResult = authenticateAdmin();
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode($authResult);
        exit;
    }
    
    $user = $authResult['user'];
    
    switch ($method) {
        case 'GET':
            // Get blog ID from path if present
            $blogId = null;
            foreach ($pathParts as $part) {
                if (is_numeric($part)) {
                    $blogId = (int)$part;
                    break;
                }
            }
            
            if ($blogId) {
                // Get specific blog
                $stmt = $db->prepare("
                    SELECT b.*, c.name as category_name, u.name as author_name, u.email as author_email,
                           GROUP_CONCAT(DISTINCT t.name) as tag_names
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    LEFT JOIN users u ON b.author_id = u.id
                    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
                    LEFT JOIN tags t ON bt.tag_id = t.id
                    WHERE b.id = ?
                    GROUP BY b.id
                ");
                $stmt->execute([$blogId]);
                $blog = $stmt->fetch();
                
                if ($blog) {
                    $formattedBlog = [
                        'id' => (int)$blog['id'],
                        'title' => $blog['title'],
                        'slug' => $blog['slug'],
                        'excerpt' => $blog['excerpt'],
                        'content' => $blog['content'],
                        'category' => $blog['category_name'],
                        'author_id' => (int)$blog['author_id'],
                        'author' => [
                            'id' => (int)$blog['author_id'],
                            'name' => $blog['author_name'],
                            'email' => $blog['author_email']
                        ],
                        'featured_image' => $blog['featured_image'],
                        'tags' => $blog['tag_names'] ? explode(',', $blog['tag_names']) : [],
                        'featured' => (bool)$blog['featured'],
                        'published' => (bool)$blog['published'],
                        'status' => $blog['status'],
                        'views' => (int)$blog['views'],
                        'likes' => (int)$blog['likes'],
                        'read_time' => (int)$blog['read_time'],
                        'created_at' => $blog['created_at'],
                        'updated_at' => $blog['updated_at'],
                        'published_at' => $blog['published_at']
                    ];
                    
                    echo json_encode([
                        'success' => true,
                        'data' => [
                            'blog' => $formattedBlog
                        ]
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Blog not found'
                    ]);
                }
            } else {
                // Get all blogs for admin
                $page = (int)($_GET['page'] ?? 1);
                $limit = (int)($_GET['limit'] ?? 20);
                $status = $_GET['status'] ?? null;
                $category = $_GET['category'] ?? null;
                
                $offset = ($page - 1) * $limit;
                
                // Build query
                $whereConditions = [];
                $params = [];
                
                if ($status) {
                    $whereConditions[] = "b.status = ?";
                    $params[] = $status;
                }
                
                if ($category) {
                    $whereConditions[] = "c.name = ?";
                    $params[] = $category;
                }
                
                $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                // Get total count
                $countQuery = "
                    SELECT COUNT(*) as total 
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    $whereClause
                ";
                $stmt = $db->prepare($countQuery);
                $stmt->execute($params);
                $totalResult = $stmt->fetch();
                $total = (int)$totalResult['total'];
                
                // Get blogs
                $query = "
                    SELECT b.*, c.name as category_name, u.name as author_name, u.email as author_email,
                           GROUP_CONCAT(DISTINCT t.name) as tag_names
                    FROM blogs b
                    LEFT JOIN categories c ON b.category_id = c.id
                    LEFT JOIN users u ON b.author_id = u.id
                    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
                    LEFT JOIN tags t ON bt.tag_id = t.id
                    $whereClause
                    GROUP BY b.id
                    ORDER BY b.created_at DESC 
                    LIMIT ? OFFSET ?
                ";
                
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $blogs = $stmt->fetchAll();
                
                // Format blogs
                $formattedBlogs = array_map(function($blog) {
                    return [
                        'id' => (int)$blog['id'],
                        'title' => $blog['title'],
                        'slug' => $blog['slug'],
                        'excerpt' => $blog['excerpt'],
                        'category' => $blog['category_name'],
                        'author_id' => (int)$blog['author_id'],
                        'author' => [
                            'id' => (int)$blog['author_id'],
                            'name' => $blog['author_name'],
                            'email' => $blog['author_email']
                        ],
                        'featured_image' => $blog['featured_image'],
                        'tags' => $blog['tag_names'] ? explode(',', $blog['tag_names']) : [],
                        'featured' => (bool)$blog['featured'],
                        'published' => (bool)$blog['published'],
                        'status' => $blog['status'],
                        'views' => (int)$blog['views'],
                        'likes' => (int)$blog['likes'],
                        'read_time' => (int)$blog['read_time'],
                        'created_at' => $blog['created_at'],
                        'updated_at' => $blog['updated_at'],
                        'published_at' => $blog['published_at']
                    ];
                }, $blogs);
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'blogs' => $formattedBlogs,
                        'total' => $total,
                        'page' => $page,
                        'limit' => $limit
                    ]
                ]);
            }
            break;
            
        case 'POST':
            // Create new blog
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
                break;
            }
            
            // Validate required fields
            $required = ['title', 'content'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => ucfirst($field) . ' is required'
                    ]);
                    break 2;
                }
            }
            
            // Generate slug from title
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['title'])));
            
            // Check if slug exists
            $stmt = $db->prepare("SELECT id FROM blogs WHERE slug = ?");
            $stmt->execute([$slug]);
            if ($stmt->fetch()) {
                $slug .= '-' . time();
            }
            
            // Get category ID
            $categoryId = null;
            if (!empty($input['category'])) {
                $stmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
                $stmt->execute([$input['category']]);
                $category = $stmt->fetch();
                if ($category) {
                    $categoryId = $category['id'];
                }
            }
            
            // Calculate read time (average 200 words per minute)
            $wordCount = str_word_count(strip_tags($input['content']));
            $readTime = max(1, ceil($wordCount / 200));
            
            // Insert blog
            $stmt = $db->prepare("
                INSERT INTO blogs (
                    title, slug, excerpt, content, category_id, author_id, 
                    featured_image, featured, published, status, read_time,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $stmt->execute([
                $input['title'],
                $slug,
                $input['excerpt'] ?? '',
                $input['content'],
                $categoryId,
                $user['id'],
                $input['featured_image'] ?? '',
                $input['featured'] ?? false,
                $input['published'] ?? false,
                $input['status'] ?? 'draft',
                $readTime
            ]);
            
            $blogId = $db->lastInsertId();
            
            // Handle tags
            if (!empty($input['tags']) && is_array($input['tags'])) {
                foreach ($input['tags'] as $tagName) {
                    // Get or create tag
                    $stmt = $db->prepare("SELECT id FROM tags WHERE name = ?");
                    $stmt->execute([$tagName]);
                    $tag = $stmt->fetch();
                    
                    if (!$tag) {
                        $stmt = $db->prepare("INSERT INTO tags (name, created_at) VALUES (?, NOW())");
                        $stmt->execute([$tagName]);
                        $tagId = $db->lastInsertId();
                    } else {
                        $tagId = $tag['id'];
                    }
                    
                    // Link blog to tag
                    $stmt = $db->prepare("INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)");
                    $stmt->execute([$blogId, $tagId]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $blogId
                ],
                'message' => 'Blog created successfully'
            ]);
            break;
            
        case 'PUT':
            // Update blog
            $blogId = null;
            foreach ($pathParts as $part) {
                if (is_numeric($part)) {
                    $blogId = (int)$part;
                    break;
                }
            }
            
            if (!$blogId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog ID is required'
                ]);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
                break;
            }
            
            // Check if blog exists
            $stmt = $db->prepare("SELECT id FROM blogs WHERE id = ?");
            $stmt->execute([$blogId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog not found'
                ]);
                break;
            }
            
            // Build update query
            $updateFields = [];
            $params = [];
            
            $allowedFields = ['title', 'excerpt', 'content', 'featured_image', 'featured', 'published', 'status'];
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            // Handle category
            if (isset($input['category'])) {
                $stmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
                $stmt->execute([$input['category']]);
                $category = $stmt->fetch();
                if ($category) {
                    $updateFields[] = "category_id = ?";
                    $params[] = $category['id'];
                }
            }
            
            // Update slug if title changed
            if (isset($input['title'])) {
                $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['title'])));
                $updateFields[] = "slug = ?";
                $params[] = $slug;
            }
            
            // Update read time if content changed
            if (isset($input['content'])) {
                $wordCount = str_word_count(strip_tags($input['content']));
                $readTime = max(1, ceil($wordCount / 200));
                $updateFields[] = "read_time = ?";
                $params[] = $readTime;
            }
            
            if (!empty($updateFields)) {
                $updateFields[] = "updated_at = NOW()";
                $params[] = $blogId;
                
                $query = "UPDATE blogs SET " . implode(', ', $updateFields) . " WHERE id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
            }
            
            // Handle tags update
            if (isset($input['tags']) && is_array($input['tags'])) {
                // Remove existing tags
                $stmt = $db->prepare("DELETE FROM blog_tags WHERE blog_id = ?");
                $stmt->execute([$blogId]);
                
                // Add new tags
                foreach ($input['tags'] as $tagName) {
                    // Get or create tag
                    $stmt = $db->prepare("SELECT id FROM tags WHERE name = ?");
                    $stmt->execute([$tagName]);
                    $tag = $stmt->fetch();
                    
                    if (!$tag) {
                        $stmt = $db->prepare("INSERT INTO tags (name, created_at) VALUES (?, NOW())");
                        $stmt->execute([$tagName]);
                        $tagId = $db->lastInsertId();
                    } else {
                        $tagId = $tag['id'];
                    }
                    
                    // Link blog to tag
                    $stmt = $db->prepare("INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)");
                    $stmt->execute([$blogId, $tagId]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete blog
            $blogId = null;
            foreach ($pathParts as $part) {
                if (is_numeric($part)) {
                    $blogId = (int)$part;
                    break;
                }
            }
            
            if (!$blogId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog ID is required'
                ]);
                break;
            }
            
            // Check if blog exists
            $stmt = $db->prepare("SELECT id FROM blogs WHERE id = ?");
            $stmt->execute([$blogId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Blog not found'
                ]);
                break;
            }
            
            // Delete blog tags
            $stmt = $db->prepare("DELETE FROM blog_tags WHERE blog_id = ?");
            $stmt->execute([$blogId]);
            
            // Delete blog
            $stmt = $db->prepare("DELETE FROM blogs WHERE id = ?");
            $stmt->execute([$blogId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog deleted successfully'
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