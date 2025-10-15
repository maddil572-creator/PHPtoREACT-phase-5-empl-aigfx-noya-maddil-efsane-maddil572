<?php
/**
 * Tags Management API
 * Comprehensive tagging system for services and content
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
$tagId = (count($pathParts) >= 3 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;

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
    
    // Enhanced tags table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            color VARCHAR(7) DEFAULT '#3B82F6',
            icon VARCHAR(50),
            category ENUM('service', 'skill', 'industry', 'technology', 'style', 'general') DEFAULT 'general',
            usage_count INTEGER DEFAULT 0,
            is_featured BOOLEAN DEFAULT 0,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Enhanced service_tags junction table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS service_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            relevance_score DECIMAL(3,2) DEFAULT 1.00,
            is_primary BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(service_id, tag_id),
            FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
    ");
    
    // Tag categories table for hierarchical organization
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tag_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            color VARCHAR(7) DEFAULT '#6B7280',
            icon VARCHAR(50),
            parent_id INTEGER NULL,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES tag_categories(id)
        )
    ");
    
    // Initialize default tags if empty
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tags");
    $stmt->execute();
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $defaultTags = [
            // Service Tags
            ['Logo Design', 'logo-design', 'Professional logo creation and branding', '#FF6B35', 'Palette', 'service'],
            ['YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching video thumbnails', '#FF0000', 'Play', 'service'],
            ['Video Editing', 'video-editing', 'Professional video post-production', '#8B5CF6', 'Film', 'service'],
            ['Branding', 'branding', 'Complete brand identity solutions', '#F59E0B', 'Award', 'service'],
            ['Web Design', 'web-design', 'Modern website design', '#3B82F6', 'Globe', 'service'],
            
            // Skill Tags
            ['Photoshop', 'photoshop', 'Adobe Photoshop expertise', '#001E36', 'Image', 'technology'],
            ['Illustrator', 'illustrator', 'Adobe Illustrator skills', '#FF9A00', 'Pen', 'technology'],
            ['After Effects', 'after-effects', 'Motion graphics and animation', '#9999FF', 'Zap', 'technology'],
            ['Premiere Pro', 'premiere-pro', 'Video editing software', '#9999FF', 'Video', 'technology'],
            ['Figma', 'figma', 'UI/UX design tool', '#F24E1E', 'Layers', 'technology'],
            
            // Industry Tags
            ['Gaming', 'gaming', 'Gaming industry focus', '#10B981', 'Gamepad2', 'industry'],
            ['E-commerce', 'ecommerce', 'Online retail solutions', '#F59E0B', 'ShoppingCart', 'industry'],
            ['Healthcare', 'healthcare', 'Medical and health services', '#EF4444', 'Heart', 'industry'],
            ['Education', 'education', 'Educational content and materials', '#8B5CF6', 'GraduationCap', 'industry'],
            ['Technology', 'technology', 'Tech industry solutions', '#06B6D4', 'Cpu', 'industry'],
            
            // Style Tags
            ['Modern', 'modern', 'Contemporary design style', '#374151', 'Sparkles', 'style'],
            ['Minimalist', 'minimalist', 'Clean and simple design', '#9CA3AF', 'Minus', 'style'],
            ['Vintage', 'vintage', 'Retro and classic style', '#92400E', 'Clock', 'style'],
            ['Bold', 'bold', 'Strong and impactful design', '#DC2626', 'Zap', 'style'],
            ['Elegant', 'elegant', 'Sophisticated and refined', '#7C3AED', 'Crown', 'style'],
            
            // General Tags
            ['Fast Delivery', 'fast-delivery', 'Quick turnaround time', '#10B981', 'Clock', 'general'],
            ['Unlimited Revisions', 'unlimited-revisions', 'Multiple revision rounds', '#3B82F6', 'RotateCcw', 'general'],
            ['Premium Quality', 'premium-quality', 'High-end quality work', '#F59E0B', 'Star', 'general'],
            ['24/7 Support', 'support-24-7', 'Round-the-clock assistance', '#8B5CF6', 'Headphones', 'general'],
            ['Money Back Guarantee', 'money-back', 'Satisfaction guaranteed', '#10B981', 'Shield', 'general'],
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO tags (name, slug, description, color, icon, category) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($defaultTags as $tag) {
            $stmt->execute($tag);
        }
    }
    
    switch ($method) {
        case 'GET':
            if ($tagId) {
                // Get specific tag with usage statistics
                $stmt = $pdo->prepare("
                    SELECT t.*, 
                           COUNT(st.service_id) as service_count,
                           GROUP_CONCAT(DISTINCT s.name) as services
                    FROM tags t
                    LEFT JOIN service_tags st ON t.id = st.tag_id
                    LEFT JOIN services s ON st.service_id = s.id AND s.status = 'active'
                    WHERE t.id = ?
                    GROUP BY t.id
                ");
                $stmt->execute([$tagId]);
                $tag = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$tag) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Tag not found']);
                    exit;
                }
                
                $tag['services'] = $tag['services'] ? explode(',', $tag['services']) : [];
                echo json_encode(['success' => true, 'data' => $tag]);
                
            } else {
                // Get all tags with filters
                $query = "
                    SELECT t.*, 
                           COUNT(st.service_id) as service_count
                    FROM tags t
                    LEFT JOIN service_tags st ON t.id = st.tag_id
                    LEFT JOIN services s ON st.service_id = s.id AND s.status = 'active'
                ";
                
                $params = [];
                $conditions = [];
                
                // Filters
                if (isset($_GET['category'])) {
                    $conditions[] = "t.category = ?";
                    $params[] = $_GET['category'];
                }
                
                if (isset($_GET['status'])) {
                    $conditions[] = "t.status = ?";
                    $params[] = $_GET['status'];
                } else {
                    // Default to active tags for public access
                    if (!isset($_GET['admin'])) {
                        $conditions[] = "t.status = 'active'";
                    }
                }
                
                if (isset($_GET['featured'])) {
                    $conditions[] = "t.is_featured = 1";
                }
                
                if (isset($_GET['search'])) {
                    $conditions[] = "(t.name LIKE ? OR t.description LIKE ?)";
                    $searchTerm = '%' . $_GET['search'] . '%';
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                }
                
                if (!empty($conditions)) {
                    $query .= " WHERE " . implode(' AND ', $conditions);
                }
                
                $query .= " GROUP BY t.id";
                
                // Sorting
                $sortBy = $_GET['sort'] ?? 'name';
                $sortOrder = $_GET['order'] ?? 'ASC';
                
                switch ($sortBy) {
                    case 'usage':
                        $query .= " ORDER BY service_count $sortOrder, t.name ASC";
                        break;
                    case 'created':
                        $query .= " ORDER BY t.created_at $sortOrder";
                        break;
                    case 'updated':
                        $query .= " ORDER BY t.updated_at $sortOrder";
                        break;
                    default:
                        $query .= " ORDER BY t.name $sortOrder";
                }
                
                // Pagination
                if (isset($_GET['limit'])) {
                    $limit = min((int)$_GET['limit'], 100);
                    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                    $query .= " LIMIT $limit OFFSET $offset";
                }
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $tags]);
            }
            break;
            
        case 'POST':
            // Create new tag (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Tag name is required']);
                exit;
            }
            
            // Generate slug if not provided
            $slug = $input['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', trim($input['name'])));
            
            // Check if name or slug already exists
            $stmt = $pdo->prepare("SELECT id FROM tags WHERE name = ? OR slug = ?");
            $stmt->execute([$input['name'], $slug]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Tag name or slug already exists']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO tags (name, slug, description, color, icon, category, is_featured, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $input['name'],
                $slug,
                $input['description'] ?? '',
                $input['color'] ?? '#3B82F6',
                $input['icon'] ?? '',
                $input['category'] ?? 'general',
                $input['is_featured'] ?? 0,
                $input['status'] ?? 'active'
            ]);
            
            if ($result) {
                $tagId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'data' => ['id' => $tagId]]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to create tag']);
            }
            break;
            
        case 'PUT':
            // Update tag (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            if (!$tagId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Tag ID required']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid input data']);
                exit;
            }
            
            // Check if tag exists
            $stmt = $pdo->prepare("SELECT id FROM tags WHERE id = ?");
            $stmt->execute([$tagId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Tag not found']);
                exit;
            }
            
            // Update tag
            $fields = [];
            $params = [];
            
            $allowedFields = ['name', 'slug', 'description', 'color', 'icon', 'category', 'is_featured', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (!empty($fields)) {
                $fields[] = "updated_at = CURRENT_TIMESTAMP";
                $params[] = $tagId;
                
                $stmt = $pdo->prepare("UPDATE tags SET " . implode(', ', $fields) . " WHERE id = ?");
                $stmt->execute($params);
            }
            
            echo json_encode(['success' => true, 'message' => 'Tag updated successfully']);
            break;
            
        case 'DELETE':
            // Delete tag (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            if (!$tagId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Tag ID required']);
                exit;
            }
            
            // Check if tag exists
            $stmt = $pdo->prepare("SELECT id FROM tags WHERE id = ?");
            $stmt->execute([$tagId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Tag not found']);
                exit;
            }
            
            // Delete tag (service_tags will be deleted automatically due to CASCADE)
            $stmt = $pdo->prepare("DELETE FROM tags WHERE id = ?");
            $result = $stmt->execute([$tagId]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Tag deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete tag']);
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