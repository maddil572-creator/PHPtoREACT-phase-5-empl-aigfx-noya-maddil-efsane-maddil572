<?php
/**
 * Dynamic Pages Management API
 * Allows creating, editing, and removing custom pages
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$pageId = (count($pathParts) >= 3 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;
$slug = (count($pathParts) >= 3 && !is_numeric(end($pathParts))) ? end($pathParts) : null;

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
    
    $user = $result['data']['user'];
    if ($user['role'] !== 'admin') {
        return ['success' => false, 'error' => 'Admin access required'];
    }
    
    return ['success' => true, 'user' => $user];
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Create pages table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
            template ENUM('default', 'landing', 'service', 'portfolio', 'blog') DEFAULT 'default',
            show_in_navigation BOOLEAN DEFAULT 0,
            navigation_order INTEGER DEFAULT 0,
            parent_page_id INTEGER NULL,
            featured_image TEXT,
            custom_css TEXT,
            custom_js TEXT,
            seo_title TEXT,
            canonical_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (parent_page_id) REFERENCES pages(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    ");
    
    // Create page sections table for flexible content
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS page_sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_id INTEGER NOT NULL,
            section_type ENUM('hero', 'text', 'image', 'gallery', 'cta', 'testimonials', 'services', 'contact_form', 'custom_html') NOT NULL,
            section_title VARCHAR(255),
            section_content TEXT,
            section_data JSON,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        )
    ");
    
    switch ($method) {
        case 'GET':
            if ($pageId) {
                // Get specific page with sections
                $stmt = $pdo->prepare("
                    SELECT p.*, u.username as created_by_name 
                    FROM pages p 
                    LEFT JOIN users u ON p.created_by = u.id 
                    WHERE p.id = ?
                ");
                $stmt->execute([$pageId]);
                $page = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$page) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Page not found']);
                    exit;
                }
                
                // Get page sections
                $stmt = $pdo->prepare("
                    SELECT * FROM page_sections 
                    WHERE page_id = ? AND is_active = 1 
                    ORDER BY display_order ASC
                ");
                $stmt->execute([$pageId]);
                $page['sections'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $page]);
                
            } elseif ($slug) {
                // Get page by slug (public access)
                $stmt = $pdo->prepare("
                    SELECT p.*, u.username as created_by_name 
                    FROM pages p 
                    LEFT JOIN users u ON p.created_by = u.id 
                    WHERE p.slug = ? AND p.status = 'published'
                ");
                $stmt->execute([$slug]);
                $page = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$page) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Page not found']);
                    exit;
                }
                
                // Get page sections
                $stmt = $pdo->prepare("
                    SELECT * FROM page_sections 
                    WHERE page_id = ? AND is_active = 1 
                    ORDER BY display_order ASC
                ");
                $stmt->execute([$page['id']]);
                $page['sections'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $page]);
                
            } else {
                // Get all pages (admin only for full list)
                $isPublic = !isset($_GET['admin']);
                
                if (!$isPublic) {
                    $auth = authenticateAdmin();
                    if (!$auth['success']) {
                        http_response_code(401);
                        echo json_encode($auth);
                        exit;
                    }
                }
                
                $query = "
                    SELECT p.*, u.username as created_by_name,
                           (SELECT COUNT(*) FROM page_sections WHERE page_id = p.id AND is_active = 1) as sections_count
                    FROM pages p 
                    LEFT JOIN users u ON p.created_by = u.id 
                ";
                
                $params = [];
                $conditions = [];
                
                if ($isPublic) {
                    $conditions[] = "p.status = 'published'";
                    if (isset($_GET['navigation'])) {
                        $conditions[] = "p.show_in_navigation = 1";
                        $query .= " WHERE " . implode(' AND ', $conditions) . " ORDER BY p.navigation_order ASC";
                    }
                } else {
                    if (isset($_GET['status'])) {
                        $conditions[] = "p.status = ?";
                        $params[] = $_GET['status'];
                    }
                    if (isset($_GET['template'])) {
                        $conditions[] = "p.template = ?";
                        $params[] = $_GET['template'];
                    }
                }
                
                if (!empty($conditions)) {
                    $query .= " WHERE " . implode(' AND ', $conditions);
                }
                
                $query .= " ORDER BY p.updated_at DESC";
                
                if (isset($_GET['limit'])) {
                    $query .= " LIMIT " . (int)$_GET['limit'];
                }
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $pages]);
            }
            break;
            
        case 'POST':
            // Create new page (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['title']) || !isset($input['slug'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Title and slug are required']);
                exit;
            }
            
            // Check if slug already exists
            $stmt = $pdo->prepare("SELECT id FROM pages WHERE slug = ?");
            $stmt->execute([$input['slug']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Slug already exists']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO pages (
                    title, slug, content, meta_description, meta_keywords, status, 
                    template, show_in_navigation, navigation_order, parent_page_id,
                    featured_image, custom_css, custom_js, seo_title, canonical_url, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $input['title'],
                $input['slug'],
                $input['content'] ?? '',
                $input['meta_description'] ?? '',
                $input['meta_keywords'] ?? '',
                $input['status'] ?? 'draft',
                $input['template'] ?? 'default',
                $input['show_in_navigation'] ?? 0,
                $input['navigation_order'] ?? 0,
                $input['parent_page_id'] ?? null,
                $input['featured_image'] ?? '',
                $input['custom_css'] ?? '',
                $input['custom_js'] ?? '',
                $input['seo_title'] ?? $input['title'],
                $input['canonical_url'] ?? '',
                $auth['user']['id']
            ]);
            
            if ($result) {
                $pageId = $pdo->lastInsertId();
                
                // Add default sections if provided
                if (isset($input['sections']) && is_array($input['sections'])) {
                    foreach ($input['sections'] as $index => $section) {
                        $stmt = $pdo->prepare("
                            INSERT INTO page_sections (page_id, section_type, section_title, section_content, section_data, display_order)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ");
                        $stmt->execute([
                            $pageId,
                            $section['type'],
                            $section['title'] ?? '',
                            $section['content'] ?? '',
                            json_encode($section['data'] ?? []),
                            $index
                        ]);
                    }
                }
                
                echo json_encode(['success' => true, 'data' => ['id' => $pageId]]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to create page']);
            }
            break;
            
        case 'PUT':
            // Update page (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            if (!$pageId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Page ID required']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid input data']);
                exit;
            }
            
            // Check if page exists
            $stmt = $pdo->prepare("SELECT id FROM pages WHERE id = ?");
            $stmt->execute([$pageId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Page not found']);
                exit;
            }
            
            // Update page
            $fields = [];
            $params = [];
            
            $allowedFields = [
                'title', 'slug', 'content', 'meta_description', 'meta_keywords', 'status',
                'template', 'show_in_navigation', 'navigation_order', 'parent_page_id',
                'featured_image', 'custom_css', 'custom_js', 'seo_title', 'canonical_url'
            ];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (!empty($fields)) {
                $fields[] = "updated_at = CURRENT_TIMESTAMP";
                $params[] = $pageId;
                
                $stmt = $pdo->prepare("UPDATE pages SET " . implode(', ', $fields) . " WHERE id = ?");
                $stmt->execute($params);
            }
            
            // Update sections if provided
            if (isset($input['sections']) && is_array($input['sections'])) {
                // Delete existing sections
                $stmt = $pdo->prepare("DELETE FROM page_sections WHERE page_id = ?");
                $stmt->execute([$pageId]);
                
                // Add new sections
                foreach ($input['sections'] as $index => $section) {
                    $stmt = $pdo->prepare("
                        INSERT INTO page_sections (page_id, section_type, section_title, section_content, section_data, display_order)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        $pageId,
                        $section['type'],
                        $section['title'] ?? '',
                        $section['content'] ?? '',
                        json_encode($section['data'] ?? []),
                        $index
                    ]);
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Page updated successfully']);
            break;
            
        case 'DELETE':
            // Delete page (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            if (!$pageId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Page ID required']);
                exit;
            }
            
            // Check if page exists
            $stmt = $pdo->prepare("SELECT id FROM pages WHERE id = ?");
            $stmt->execute([$pageId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Page not found']);
                exit;
            }
            
            // Delete page (sections will be deleted automatically due to CASCADE)
            $stmt = $pdo->prepare("DELETE FROM pages WHERE id = ?");
            $result = $stmt->execute([$pageId]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Page deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete page']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>