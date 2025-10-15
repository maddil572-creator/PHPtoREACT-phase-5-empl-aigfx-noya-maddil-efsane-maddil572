<?php
/**
 * Pages API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$pageId = (count($pathParts) >= 3 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;
$slug = (count($pathParts) >= 3 && !is_numeric(end($pathParts))) ? end($pathParts) : null;

function authenticateUser() {
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
    if (!$token) return ['success' => false, 'error' => 'Authentication required'];
    
    $auth = new Auth();
    $result = $auth->verifyToken($token);
    return $result['success'] ? ['success' => true, 'user' => $result['data']['user']] : $result;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            if ($pageId || $slug) {
                $field = $pageId ? 'id' : 'slug';
                $value = $pageId ?: $slug;
                
                $stmt = $db->prepare("
                    SELECT p.*, u.name as author_name
                    FROM pages p
                    LEFT JOIN users u ON p.author_id = u.id
                    WHERE p.$field = ? AND p.status = 'published'
                ");
                $stmt->execute([$value]);
                $page = $stmt->fetch();
                
                if (!$page) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Page not found']);
                    break;
                }
                
                // Increment view count
                $stmt = $db->prepare("UPDATE pages SET views = views + 1 WHERE id = ?");
                $stmt->execute([$page['id']]);
                
                $page['sections'] = json_decode($page['sections'] ?? '[]', true);
                
                echo json_encode(['success' => true, 'data' => $page]);
            } else {
                $stmt = $db->prepare("
                    SELECT id, title, slug, template, show_in_menu, menu_order, views, created_at
                    FROM pages 
                    WHERE status = 'published'
                    ORDER BY menu_order ASC, title ASC
                ");
                $stmt->execute();
                $pages = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $pages]);
            }
            break;
            
        case 'POST':
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if (!in_array($authResult['user']['role'], ['admin', 'editor'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['title'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Title is required']);
                break;
            }
            
            $slug = isset($input['slug']) ? trim($input['slug']) : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['title'])));
            
            // Ensure unique slug
            $originalSlug = $slug;
            $counter = 1;
            while (true) {
                $stmt = $db->prepare("SELECT id FROM pages WHERE slug = ?");
                $stmt->execute([$slug]);
                if (!$stmt->fetch()) break;
                $slug = $originalSlug . '-' . $counter++;
            }
            
            $stmt = $db->prepare("
                INSERT INTO pages (
                    title, slug, content, template, sections, status, featured,
                    show_in_menu, menu_order, parent_id, meta_title, meta_description,
                    meta_keywords, custom_css, custom_js, author_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                trim($input['title']),
                $slug,
                trim($input['content'] ?? ''),
                $input['template'] ?? 'default',
                json_encode($input['sections'] ?? []),
                $input['status'] ?? 'draft',
                $input['featured'] ?? 0,
                $input['show_in_menu'] ?? 0,
                $input['menu_order'] ?? null,
                $input['parent_id'] ?? null,
                trim($input['meta_title'] ?? ''),
                trim($input['meta_description'] ?? ''),
                trim($input['meta_keywords'] ?? ''),
                trim($input['custom_css'] ?? ''),
                trim($input['custom_js'] ?? ''),
                $authResult['user']['id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Page created successfully', 'data' => ['id' => $db->lastInsertId(), 'slug' => $slug]]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error', 'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong']);
}