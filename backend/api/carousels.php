<?php
/**
 * Carousel/Slider Management API
 * Allows creating and managing dynamic carousels and sliders
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
$carouselId = (count($pathParts) >= 3 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;

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
    
    // Create carousels table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS carousels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            type ENUM('hero', 'testimonials', 'portfolio', 'products', 'images', 'custom') DEFAULT 'images',
            autoplay BOOLEAN DEFAULT 1,
            autoplay_speed INTEGER DEFAULT 5000,
            show_dots BOOLEAN DEFAULT 1,
            show_arrows BOOLEAN DEFAULT 1,
            infinite_loop BOOLEAN DEFAULT 1,
            slides_to_show INTEGER DEFAULT 1,
            slides_to_scroll INTEGER DEFAULT 1,
            responsive_breakpoints JSON,
            animation_type ENUM('slide', 'fade', 'zoom', 'flip') DEFAULT 'slide',
            animation_speed INTEGER DEFAULT 500,
            pause_on_hover BOOLEAN DEFAULT 1,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    ");
    
    // Create carousel slides table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS carousel_slides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            carousel_id INTEGER NOT NULL,
            title VARCHAR(255),
            subtitle VARCHAR(255),
            description TEXT,
            image_url TEXT,
            video_url TEXT,
            link_url TEXT,
            link_text VARCHAR(100),
            link_target ENUM('_self', '_blank') DEFAULT '_self',
            background_color VARCHAR(7),
            text_color VARCHAR(7),
            button_style ENUM('primary', 'secondary', 'outline', 'ghost') DEFAULT 'primary',
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            custom_css TEXT,
            custom_data JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (carousel_id) REFERENCES carousels(id) ON DELETE CASCADE
        )
    ");
    
    switch ($method) {
        case 'GET':
            if ($carouselId) {
                // Get specific carousel with slides
                $stmt = $pdo->prepare("
                    SELECT c.*, u.username as created_by_name 
                    FROM carousels c 
                    LEFT JOIN users u ON c.created_by = u.id 
                    WHERE c.id = ?
                ");
                $stmt->execute([$carouselId]);
                $carousel = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$carousel) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Carousel not found']);
                    exit;
                }
                
                // Get carousel slides
                $stmt = $pdo->prepare("
                    SELECT * FROM carousel_slides 
                    WHERE carousel_id = ? AND is_active = 1 
                    ORDER BY display_order ASC
                ");
                $stmt->execute([$carouselId]);
                $carousel['slides'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Parse JSON fields
                if ($carousel['responsive_breakpoints']) {
                    $carousel['responsive_breakpoints'] = json_decode($carousel['responsive_breakpoints'], true);
                }
                
                foreach ($carousel['slides'] as &$slide) {
                    if ($slide['custom_data']) {
                        $slide['custom_data'] = json_decode($slide['custom_data'], true);
                    }
                }
                
                echo json_encode(['success' => true, 'data' => $carousel]);
                
            } else {
                // Get all carousels (admin only for full list)
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
                    SELECT c.*, u.username as created_by_name,
                           (SELECT COUNT(*) FROM carousel_slides WHERE carousel_id = c.id AND is_active = 1) as slides_count
                    FROM carousels c 
                    LEFT JOIN users u ON c.created_by = u.id 
                ";
                
                $params = [];
                $conditions = [];
                
                if ($isPublic) {
                    $conditions[] = "c.status = 'active'";
                }
                
                if (isset($_GET['type'])) {
                    $conditions[] = "c.type = ?";
                    $params[] = $_GET['type'];
                }
                
                if (isset($_GET['slug'])) {
                    $conditions[] = "c.slug = ?";
                    $params[] = $_GET['slug'];
                }
                
                if (!empty($conditions)) {
                    $query .= " WHERE " . implode(' AND ', $conditions);
                }
                
                $query .= " ORDER BY c.updated_at DESC";
                
                if (isset($_GET['limit'])) {
                    $query .= " LIMIT " . (int)$_GET['limit'];
                }
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $carousels = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Parse JSON fields
                foreach ($carousels as &$carousel) {
                    if ($carousel['responsive_breakpoints']) {
                        $carousel['responsive_breakpoints'] = json_decode($carousel['responsive_breakpoints'], true);
                    }
                }
                
                echo json_encode(['success' => true, 'data' => $carousels]);
            }
            break;
            
        case 'POST':
            // Create new carousel (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name']) || !isset($input['slug'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name and slug are required']);
                exit;
            }
            
            // Check if slug already exists
            $stmt = $pdo->prepare("SELECT id FROM carousels WHERE slug = ?");
            $stmt->execute([$input['slug']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Slug already exists']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO carousels (
                    name, slug, type, autoplay, autoplay_speed, show_dots, show_arrows,
                    infinite_loop, slides_to_show, slides_to_scroll, responsive_breakpoints,
                    animation_type, animation_speed, pause_on_hover, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $stmt->execute([
                $input['name'],
                $input['slug'],
                $input['type'] ?? 'images',
                $input['autoplay'] ?? 1,
                $input['autoplay_speed'] ?? 5000,
                $input['show_dots'] ?? 1,
                $input['show_arrows'] ?? 1,
                $input['infinite_loop'] ?? 1,
                $input['slides_to_show'] ?? 1,
                $input['slides_to_scroll'] ?? 1,
                json_encode($input['responsive_breakpoints'] ?? []),
                $input['animation_type'] ?? 'slide',
                $input['animation_speed'] ?? 500,
                $input['pause_on_hover'] ?? 1,
                $input['status'] ?? 'active',
                $auth['user']['id']
            ]);
            
            if ($result) {
                $carouselId = $pdo->lastInsertId();
                
                // Add slides if provided
                if (isset($input['slides']) && is_array($input['slides'])) {
                    foreach ($input['slides'] as $index => $slide) {
                        $stmt = $pdo->prepare("
                            INSERT INTO carousel_slides (
                                carousel_id, title, subtitle, description, image_url, video_url,
                                link_url, link_text, link_target, background_color, text_color,
                                button_style, display_order, custom_css, custom_data
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ");
                        $stmt->execute([
                            $carouselId,
                            $slide['title'] ?? '',
                            $slide['subtitle'] ?? '',
                            $slide['description'] ?? '',
                            $slide['image_url'] ?? '',
                            $slide['video_url'] ?? '',
                            $slide['link_url'] ?? '',
                            $slide['link_text'] ?? '',
                            $slide['link_target'] ?? '_self',
                            $slide['background_color'] ?? '',
                            $slide['text_color'] ?? '',
                            $slide['button_style'] ?? 'primary',
                            $index,
                            $slide['custom_css'] ?? '',
                            json_encode($slide['custom_data'] ?? [])
                        ]);
                    }
                }
                
                echo json_encode(['success' => true, 'data' => ['id' => $carouselId]]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to create carousel']);
            }
            break;
            
        case 'PUT':
            // Update carousel (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            if (!$carouselId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Carousel ID required']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid input data']);
                exit;
            }
            
            // Check if carousel exists
            $stmt = $pdo->prepare("SELECT id FROM carousels WHERE id = ?");
            $stmt->execute([$carouselId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Carousel not found']);
                exit;
            }
            
            // Update carousel
            $fields = [];
            $params = [];
            
            $allowedFields = [
                'name', 'slug', 'type', 'autoplay', 'autoplay_speed', 'show_dots', 'show_arrows',
                'infinite_loop', 'slides_to_show', 'slides_to_scroll', 'animation_type',
                'animation_speed', 'pause_on_hover', 'status'
            ];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    if ($field === 'responsive_breakpoints') {
                        $params[] = json_encode($input[$field]);
                    } else {
                        $params[] = $input[$field];
                    }
                }
            }
            
            if (isset($input['responsive_breakpoints'])) {
                $fields[] = "responsive_breakpoints = ?";
                $params[] = json_encode($input['responsive_breakpoints']);
            }
            
            if (!empty($fields)) {
                $fields[] = "updated_at = CURRENT_TIMESTAMP";
                $params[] = $carouselId;
                
                $stmt = $pdo->prepare("UPDATE carousels SET " . implode(', ', $fields) . " WHERE id = ?");
                $stmt->execute($params);
            }
            
            // Update slides if provided
            if (isset($input['slides']) && is_array($input['slides'])) {
                // Delete existing slides
                $stmt = $pdo->prepare("DELETE FROM carousel_slides WHERE carousel_id = ?");
                $stmt->execute([$carouselId]);
                
                // Add new slides
                foreach ($input['slides'] as $index => $slide) {
                    $stmt = $pdo->prepare("
                        INSERT INTO carousel_slides (
                            carousel_id, title, subtitle, description, image_url, video_url,
                            link_url, link_text, link_target, background_color, text_color,
                            button_style, display_order, custom_css, custom_data
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        $carouselId,
                        $slide['title'] ?? '',
                        $slide['subtitle'] ?? '',
                        $slide['description'] ?? '',
                        $slide['image_url'] ?? '',
                        $slide['video_url'] ?? '',
                        $slide['link_url'] ?? '',
                        $slide['link_text'] ?? '',
                        $slide['link_target'] ?? '_self',
                        $slide['background_color'] ?? '',
                        $slide['text_color'] ?? '',
                        $slide['button_style'] ?? 'primary',
                        $index,
                        $slide['custom_css'] ?? '',
                        json_encode($slide['custom_data'] ?? [])
                    ]);
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Carousel updated successfully']);
            break;
            
        case 'DELETE':
            // Delete carousel (admin only)
            $auth = authenticateAdmin();
            if (!$auth['success']) {
                http_response_code(401);
                echo json_encode($auth);
                exit;
            }
            
            if (!$carouselId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Carousel ID required']);
                exit;
            }
            
            // Check if carousel exists
            $stmt = $pdo->prepare("SELECT id FROM carousels WHERE id = ?");
            $stmt->execute([$carouselId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Carousel not found']);
                exit;
            }
            
            // Delete carousel (slides will be deleted automatically due to CASCADE)
            $stmt = $pdo->prepare("DELETE FROM carousels WHERE id = ?");
            $result = $stmt->execute([$carouselId]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Carousel deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to delete carousel']);
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