<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../classes/Auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$auth = new Auth();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Authentication check for non-GET requests
if ($method !== 'GET') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization header required']);
        exit;
    }
    
    $token = $matches[1];
    $user = $auth->verifyToken($token);
    
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
}

try {
    $db = new PDO("sqlite:" . __DIR__ . "/../database/adilgfx.sqlite");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create homepage_content table if it doesn't exist
    $db->exec("
        CREATE TABLE IF NOT EXISTS homepage_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section VARCHAR(50) NOT NULL,
            content_key VARCHAR(100) NOT NULL,
            content_value TEXT,
            content_type VARCHAR(20) DEFAULT 'text',
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(section, content_key)
        )
    ");
    
    // Initialize default homepage content if table is empty
    $stmt = $db->prepare("SELECT COUNT(*) FROM homepage_content");
    $stmt->execute();
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        initializeDefaultContent($db);
    }
    
    switch ($method) {
        case 'GET':
            handleGet($db, $pathParts);
            break;
        case 'POST':
            handlePost($db);
            break;
        case 'PUT':
            handlePut($db, $pathParts);
            break;
        case 'DELETE':
            handleDelete($db, $pathParts);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

function initializeDefaultContent($db) {
    $defaultContent = [
        // Hero Section
        ['hero', 'badge_text', 'Trusted by 500+ YouTubers & Brands', 'text'],
        ['hero', 'main_headline', 'Transform Your Brand with Premium Designs', 'text'],
        ['hero', 'subtitle', 'Professional logo design, YouTube thumbnails, and video editing that converts viewers into loyal customers. Ready in 24-48 hours.', 'textarea'],
        ['hero', 'cta_primary_text', 'Start Your Project', 'text'],
        ['hero', 'cta_primary_link', '/contact', 'text'],
        ['hero', 'cta_secondary_text', 'Watch My Intro', 'text'],
        ['hero', 'cta_secondary_link', '/about', 'text'],
        ['hero', 'cta_tertiary_text', 'Watch Portfolio', 'text'],
        ['hero', 'cta_tertiary_link', '/portfolio', 'text'],
        ['hero', 'stat_clients', '500+', 'text'],
        ['hero', 'stat_clients_label', 'Happy Clients', 'text'],
        ['hero', 'stat_delivery', '24-48h', 'text'],
        ['hero', 'stat_delivery_label', 'Delivery Time', 'text'],
        ['hero', 'stat_satisfaction', '99%', 'text'],
        ['hero', 'stat_satisfaction_label', 'Satisfaction Rate', 'text'],
        ['hero', 'stat_rating', '5.0★', 'text'],
        ['hero', 'stat_rating_label', 'Average Rating', 'text'],
        
        // Why Choose Section
        ['why_choose', 'section_title', 'Why Choose Adil?', 'text'],
        ['why_choose', 'section_subtitle', 'Trusted by 500+ businesses and creators worldwide. Here\'s what sets me apart from the competition.', 'textarea'],
        ['why_choose', 'achievement_1_number', '500+', 'text'],
        ['why_choose', 'achievement_1_label', 'Happy Clients', 'text'],
        ['why_choose', 'achievement_1_description', 'Worldwide', 'text'],
        ['why_choose', 'achievement_2_number', '10M+', 'text'],
        ['why_choose', 'achievement_2_label', 'Views Generated', 'text'],
        ['why_choose', 'achievement_2_description', 'For YouTube clients', 'text'],
        ['why_choose', 'achievement_3_number', '$50M+', 'text'],
        ['why_choose', 'achievement_3_label', 'Revenue Impact', 'text'],
        ['why_choose', 'achievement_3_description', 'Client success stories', 'text'],
        ['why_choose', 'achievement_4_number', '24h', 'text'],
        ['why_choose', 'achievement_4_label', 'Average Delivery', 'text'],
        ['why_choose', 'achievement_4_description', 'For standard projects', 'text'],
        
        // Footer Section
        ['footer', 'newsletter_title', 'Stay Updated', 'text'],
        ['footer', 'newsletter_description', 'Get free design tips, latest trends, and exclusive offers delivered to your inbox.', 'textarea'],
        ['footer', 'company_description', 'Professional designer helping brands and YouTubers grow through premium visual content.', 'textarea'],
        ['footer', 'contact_email', 'hello@adilgfx.com', 'email'],
        ['footer', 'whatsapp_number', '1234567890', 'text'],
        ['footer', 'copyright_text', '© 2025 GFX by Adi. All rights reserved.', 'text'],
        
        // Social Links
        ['social', 'facebook_url', 'https://facebook.com/adilgfx', 'url'],
        ['social', 'instagram_url', 'https://instagram.com/adilgfx', 'url'],
        ['social', 'linkedin_url', 'https://linkedin.com/in/adilgfx', 'url'],
        ['social', 'youtube_url', 'https://youtube.com/@adilgfx', 'url'],
        
        // Navigation
        ['navigation', 'logo_text', 'Adil GFX', 'text'],
        ['navigation', 'cta_button_text', 'Hire Me Now', 'text'],
        ['navigation', 'cta_button_link', '/contact', 'text'],
        
        // Why Choose Reasons
        ['why_choose_reasons', 'reason_1_title', 'Lightning Fast Delivery', 'text'],
        ['why_choose_reasons', 'reason_1_description', 'Most projects delivered within 24-48 hours without compromising quality', 'textarea'],
        ['why_choose_reasons', 'reason_1_stat', '24-48h', 'text'],
        ['why_choose_reasons', 'reason_1_icon', 'Zap', 'text'],
        ['why_choose_reasons', 'reason_1_color', 'text-yellow-500', 'text'],
        
        ['why_choose_reasons', 'reason_2_title', 'Proven Results', 'text'],
        ['why_choose_reasons', 'reason_2_description', 'Designs that have generated millions in revenue and boosted client success', 'textarea'],
        ['why_choose_reasons', 'reason_2_stat', '500+ Projects', 'text'],
        ['why_choose_reasons', 'reason_2_icon', 'Trophy', 'text'],
        ['why_choose_reasons', 'reason_2_color', 'text-youtube-red', 'text'],
        
        ['why_choose_reasons', 'reason_3_title', '5-Star Rating', 'text'],
        ['why_choose_reasons', 'reason_3_description', 'Consistently rated 5 stars across all platforms - Fiverr, Upwork, and direct clients', 'textarea'],
        ['why_choose_reasons', 'reason_3_stat', '5.0/5.0', 'text'],
        ['why_choose_reasons', 'reason_3_icon', 'Star', 'text'],
        ['why_choose_reasons', 'reason_3_color', 'text-yellow-500', 'text'],
        
        ['why_choose_reasons', 'reason_4_title', 'Global Experience', 'text'],
        ['why_choose_reasons', 'reason_4_description', 'Worked with clients from 50+ countries, understanding diverse market needs', 'textarea'],
        ['why_choose_reasons', 'reason_4_stat', '50+ Countries', 'text'],
        ['why_choose_reasons', 'reason_4_icon', 'Users', 'text'],
        ['why_choose_reasons', 'reason_4_color', 'text-blue-500', 'text'],
        
        ['why_choose_reasons', 'reason_5_title', 'Unlimited Revisions', 'text'],
        ['why_choose_reasons', 'reason_5_description', 'Your satisfaction is guaranteed - we\'ll revise until you\'re 100% happy', 'textarea'],
        ['why_choose_reasons', 'reason_5_stat', '∞ Revisions', 'text'],
        ['why_choose_reasons', 'reason_5_icon', 'Heart', 'text'],
        ['why_choose_reasons', 'reason_5_color', 'text-pink-500', 'text'],
        
        ['why_choose_reasons', 'reason_6_title', 'Industry Expertise', 'text'],
        ['why_choose_reasons', 'reason_6_description', 'Specialized knowledge in YouTube optimization, branding, and conversion design', 'textarea'],
        ['why_choose_reasons', 'reason_6_stat', '5+ Years', 'text'],
        ['why_choose_reasons', 'reason_6_icon', 'Award', 'text'],
        ['why_choose_reasons', 'reason_6_color', 'text-purple-500', 'text'],
        
        // About Page Stats
        ['about_stats', 'stat_1_value', '500+', 'text'],
        ['about_stats', 'stat_1_label', 'Happy Clients', 'text'],
        ['about_stats', 'stat_1_icon', 'Users', 'text'],
        
        ['about_stats', 'stat_2_value', '24-48h', 'text'],
        ['about_stats', 'stat_2_label', 'Average Delivery', 'text'],
        ['about_stats', 'stat_2_icon', 'Clock', 'text'],
        
        ['about_stats', 'stat_3_value', '5.0★', 'text'],
        ['about_stats', 'stat_3_label', 'Average Rating', 'text'],
        ['about_stats', 'stat_3_icon', 'Award', 'text'],
        
        ['about_stats', 'stat_4_value', '99%', 'text'],
        ['about_stats', 'stat_4_label', 'Client Retention', 'text'],
        ['about_stats', 'stat_4_icon', 'Zap', 'text'],
        
        // Global Content
        ['global', 'site_description', 'Transform your brand with premium logo design, high-converting YouTube thumbnails, and professional video editing. Trusted by 500+ clients worldwide. Get results in 24-48 hours.', 'textarea'],
        ['global', 'chatbot_portfolio_response', '🏆 Check out my work:\n\n• 500+ happy clients worldwide\n• Projects that generated millions in revenue\n• 5-star rating on all platforms\n\nView my full portfolio at /portfolio or would you like me to show you specific examples?', 'textarea'],
        ['global', 'auth_page_subtitle', 'Join thousands of satisfied clients', 'text'],
        ['global', 'popup_offer_description', 'Join thousands of satisfied clients and start your design journey with us. Enter your email to claim your exclusive welcome discount.', 'textarea'],
        ['global', 'about_intro_text', 'Since then, I\'ve helped over 500 clients across various industries, from YouTubers who\'ve gained millions of subscribers to startups that secured major funding rounds.', 'textarea'],
        ['global', 'why_choose_closing_text', 'Join hundreds of satisfied clients who\'ve seen real results. Your success is my success.', 'textarea'],
        
        // Site Links
        ['links', 'home_url', '/', 'text'],
        ['links', 'about_url', '/about', 'text'],
        ['links', 'services_url', '/services', 'text'],
        ['links', 'portfolio_url', '/portfolio', 'text'],
        ['links', 'blog_url', '/blog', 'text'],
        ['links', 'testimonials_url', '/testimonials', 'text'],
        ['links', 'faq_url', '/faq', 'text'],
        ['links', 'contact_url', '/contact', 'text'],
        ['links', 'auth_url', '/auth', 'text'],
        ['links', 'dashboard_url', '/dashboard', 'text'],
        ['links', 'user_dashboard_url', '/user/dashboard', 'text'],
        ['links', 'user_login_url', '/user/login', 'text'],
        
        // External Links
        ['external_links', 'whatsapp_url', 'https://wa.me/1234567890', 'url'],
        ['external_links', 'fiverr_profile_url', 'https://fiverr.com/adilgfx', 'url'],
        ['external_links', 'upwork_profile_url', 'https://upwork.com/freelancers/adilgfx', 'url'],
        ['external_links', 'calendly_url', 'https://calendly.com/adilgfx', 'url'],
        
        // Site Settings
        ['site_settings', 'favicon_url', '/favicon.ico', 'url'],
        ['site_settings', 'site_url', 'https://adilgfx.com', 'url'],
        ['site_settings', 'admin_email', 'admin@adilgfx.com', 'email'],
        
        // Header Configuration
        ['header', 'show_header', 'true', 'boolean'],
        ['header', 'header_style', 'modern', 'text'], // modern, classic, minimal
        ['header', 'header_background', 'transparent', 'text'], // transparent, solid, gradient
        ['header', 'header_position', 'sticky', 'text'], // sticky, fixed, static
        ['header', 'show_search', 'false', 'boolean'],
        ['header', 'show_language_switcher', 'false', 'boolean'],
        ['header', 'show_theme_toggle', 'true', 'boolean'],
        ['header', 'header_height', '80', 'number'],
        ['header', 'mobile_menu_style', 'slide', 'text'], // slide, dropdown, fullscreen
        
        // Footer Configuration
        ['footer', 'show_footer', 'true', 'boolean'],
        ['footer', 'footer_style', 'modern', 'text'], // modern, classic, minimal
        ['footer', 'footer_columns', '4', 'number'],
        ['footer', 'show_newsletter', 'true', 'boolean'],
        ['footer', 'show_social_links', 'true', 'boolean'],
        ['footer', 'show_back_to_top', 'true', 'boolean'],
        ['footer', 'footer_background', 'dark', 'text'], // dark, light, gradient
        ['footer', 'copyright_position', 'center', 'text'], // left, center, right
        
        // Header Menu Items (additional to main navigation)
        ['header_menu', 'item_1_text', 'Get Quote', 'text'],
        ['header_menu', 'item_1_url', '/contact', 'text'],
        ['header_menu', 'item_1_style', 'button', 'text'], // link, button, highlight
        ['header_menu', 'item_2_text', 'Portfolio', 'text'],
        ['header_menu', 'item_2_url', '/portfolio', 'text'],
        ['header_menu', 'item_2_style', 'link', 'text'],
        
        // Footer Menu Sections
        ['footer_menu', 'section_1_title', 'Services', 'text'],
        ['footer_menu', 'section_1_links', 'Logo Design:/services#logos,Thumbnails:/services#thumbnails,Video Editing:/services#video', 'textarea'],
        ['footer_menu', 'section_2_title', 'Company', 'text'],
        ['footer_menu', 'section_2_links', 'About Us:/about,Portfolio:/portfolio,Testimonials:/testimonials', 'textarea'],
        ['footer_menu', 'section_3_title', 'Support', 'text'],
        ['footer_menu', 'section_3_links', 'Contact:/contact,FAQ:/faq,Help Center:/help', 'textarea'],
        ['footer_menu', 'section_4_title', 'Legal', 'text'],
        ['footer_menu', 'section_4_links', 'Privacy Policy:/privacy,Terms of Service:/terms,Refund Policy:/refunds', 'textarea'],
    ];
    
    $stmt = $db->prepare("
        INSERT INTO homepage_content (section, content_key, content_value, content_type, display_order) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    foreach ($defaultContent as $index => $item) {
        $stmt->execute([$item[0], $item[1], $item[2], $item[3], $index]);
    }
}

function handleGet($db, $pathParts) {
    if (isset($pathParts[3])) {
        // Get specific section: /api/homepage/{section}
        $section = $pathParts[3];
        $stmt = $db->prepare("
            SELECT content_key, content_value, content_type, display_order, is_active 
            FROM homepage_content 
            WHERE section = ? AND is_active = 1 
            ORDER BY display_order ASC, content_key ASC
        ");
        $stmt->execute([$section]);
        $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert to key-value pairs
        $result = [];
        foreach ($content as $item) {
            $result[$item['content_key']] = [
                'value' => $item['content_value'],
                'type' => $item['content_type'],
                'order' => $item['display_order'],
                'active' => (bool)$item['is_active']
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $result]);
    } else {
        // Get all content grouped by section
        $stmt = $db->prepare("
            SELECT section, content_key, content_value, content_type, display_order, is_active 
            FROM homepage_content 
            WHERE is_active = 1 
            ORDER BY section ASC, display_order ASC, content_key ASC
        ");
        $stmt->execute();
        $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Group by section
        $result = [];
        foreach ($content as $item) {
            if (!isset($result[$item['section']])) {
                $result[$item['section']] = [];
            }
            $result[$item['section']][$item['content_key']] = [
                'value' => $item['content_value'],
                'type' => $item['content_type'],
                'order' => $item['display_order'],
                'active' => (bool)$item['is_active']
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $result]);
    }
}

function handlePost($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['section']) || !isset($input['content_key']) || !isset($input['content_value'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: section, content_key, content_value']);
        return;
    }
    
    $stmt = $db->prepare("
        INSERT OR REPLACE INTO homepage_content 
        (section, content_key, content_value, content_type, display_order, is_active, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ");
    
    $stmt->execute([
        $input['section'],
        $input['content_key'],
        $input['content_value'],
        $input['content_type'] ?? 'text',
        $input['display_order'] ?? 0,
        $input['is_active'] ?? 1
    ]);
    
    echo json_encode(['success' => true, 'message' => 'Content saved successfully']);
}

function handlePut($db, $pathParts) {
    if (!isset($pathParts[3]) || !isset($pathParts[4])) {
        http_response_code(400);
        echo json_encode(['error' => 'Section and content_key required in URL']);
        return;
    }
    
    $section = $pathParts[3];
    $contentKey = $pathParts[4];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['content_value'])) {
        http_response_code(400);
        echo json_encode(['error' => 'content_value required']);
        return;
    }
    
    $stmt = $db->prepare("
        UPDATE homepage_content 
        SET content_value = ?, content_type = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE section = ? AND content_key = ?
    ");
    
    $stmt->execute([
        $input['content_value'],
        $input['content_type'] ?? 'text',
        $input['display_order'] ?? 0,
        $input['is_active'] ?? 1,
        $section,
        $contentKey
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Content updated successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Content not found']);
    }
}

function handleDelete($db, $pathParts) {
    if (!isset($pathParts[3]) || !isset($pathParts[4])) {
        http_response_code(400);
        echo json_encode(['error' => 'Section and content_key required in URL']);
        return;
    }
    
    $section = $pathParts[3];
    $contentKey = $pathParts[4];
    
    $stmt = $db->prepare("DELETE FROM homepage_content WHERE section = ? AND content_key = ?");
    $stmt->execute([$section, $contentKey]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Content deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Content not found']);
    }
}
?>