<?php
/**
 * Dynamic Sitemap Generator
 * Generates XML sitemap for better search engine indexing
 */

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: max-age=3600'); // Cache for 1 hour

require_once '../config/database.php';
require_once '../classes/Database.php';

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Get current domain from environment or request
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $domain = $_ENV['FRONTEND_URL'] ?? $protocol . '://' . $_SERVER['HTTP_HOST'];
    
    // Start XML output
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";
    
    // Static pages with priorities
    $staticPages = [
        ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
        ['url' => '/about', 'priority' => '0.8', 'changefreq' => 'monthly'],
        ['url' => '/services', 'priority' => '0.9', 'changefreq' => 'weekly'],
        ['url' => '/portfolio', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['url' => '/testimonials', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ['url' => '/blog', 'priority' => '0.8', 'changefreq' => 'daily'],
        ['url' => '/faq', 'priority' => '0.6', 'changefreq' => 'monthly'],
        ['url' => '/contact', 'priority' => '0.7', 'changefreq' => 'monthly']
    ];
    
    foreach ($staticPages as $page) {
        echo "  <url>\n";
        echo "    <loc>{$domain}{$page['url']}</loc>\n";
        echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
        echo "    <changefreq>{$page['changefreq']}</changefreq>\n";
        echo "    <priority>{$page['priority']}</priority>\n";
        echo "  </url>\n";
    }
    
    // Dynamic blog posts
    $blogQuery = "SELECT id, slug, title, updated_at, featured_image FROM blogs WHERE status = 'published' ORDER BY updated_at DESC";
    $blogStmt = $pdo->query($blogQuery);
    
    while ($blog = $blogStmt->fetch(PDO::FETCH_ASSOC)) {
        $blogUrl = $domain . '/blog/' . ($blog['slug'] ?: $blog['id']);
        $lastmod = date('Y-m-d', strtotime($blog['updated_at'] ?: 'now'));
        
        echo "  <url>\n";
        echo "    <loc>{$blogUrl}</loc>\n";
        echo "    <lastmod>{$lastmod}</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.7</priority>\n";
        
        // Add image sitemap if featured image exists
        if (!empty($blog['featured_image'])) {
            $imageUrl = strpos($blog['featured_image'], 'http') === 0 
                ? $blog['featured_image'] 
                : $domain . '/' . ltrim($blog['featured_image'], '/');
            
            echo "    <image:image>\n";
            echo "      <image:loc>{$imageUrl}</image:loc>\n";
            echo "      <image:title>" . htmlspecialchars($blog['title']) . "</image:title>\n";
            echo "    </image:image>\n";
        }
        
        echo "  </url>\n";
    }
    
    // Dynamic portfolio items
    $portfolioQuery = "SELECT id, slug, title, updated_at, featured_image FROM portfolio WHERE status = 'published' ORDER BY updated_at DESC";
    $portfolioStmt = $pdo->query($portfolioQuery);
    
    while ($portfolio = $portfolioStmt->fetch(PDO::FETCH_ASSOC)) {
        $portfolioUrl = $domain . '/portfolio/' . ($portfolio['slug'] ?: $portfolio['id']);
        $lastmod = date('Y-m-d', strtotime($portfolio['updated_at'] ?: 'now'));
        
        echo "  <url>\n";
        echo "    <loc>{$portfolioUrl}</loc>\n";
        echo "    <lastmod>{$lastmod}</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.6</priority>\n";
        
        // Add image sitemap for portfolio images
        if (!empty($portfolio['featured_image'])) {
            $imageUrl = strpos($portfolio['featured_image'], 'http') === 0 
                ? $portfolio['featured_image'] 
                : $domain . '/' . ltrim($portfolio['featured_image'], '/');
            
            echo "    <image:image>\n";
            echo "      <image:loc>{$imageUrl}</image:loc>\n";
            echo "      <image:title>" . htmlspecialchars($portfolio['title']) . "</image:title>\n";
            echo "    </image:image>\n";
        }
        
        echo "  </url>\n";
    }
    
    // Dynamic service pages
    $servicesQuery = "SELECT id, slug, name, updated_at FROM services WHERE status = 'active' ORDER BY updated_at DESC";
    $servicesStmt = $pdo->query($servicesQuery);
    
    while ($service = $servicesStmt->fetch(PDO::FETCH_ASSOC)) {
        $serviceUrl = $domain . '/services/' . ($service['slug'] ?: $service['id']);
        $lastmod = date('Y-m-d', strtotime($service['updated_at'] ?: 'now'));
        
        echo "  <url>\n";
        echo "    <loc>{$serviceUrl}</loc>\n";
        echo "    <lastmod>{$lastmod}</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }
    
    // Dynamic custom pages
    $pagesQuery = "SELECT slug, title, updated_at FROM pages WHERE status = 'published' ORDER BY updated_at DESC";
    $pagesStmt = $pdo->query($pagesQuery);
    
    while ($page = $pagesStmt->fetch(PDO::FETCH_ASSOC)) {
        $pageUrl = $domain . '/page/' . $page['slug'];
        $lastmod = date('Y-m-d', strtotime($page['updated_at'] ?: 'now'));
        
        echo "  <url>\n";
        echo "    <loc>{$pageUrl}</loc>\n";
        echo "    <lastmod>{$lastmod}</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.5</priority>\n";
        echo "  </url>\n";
    }
    
    echo '</urlset>';
    
} catch (Exception $e) {
    // Fallback to basic sitemap if database fails
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $domain = $protocol . '://' . $_SERVER['HTTP_HOST'];
    
    $basicPages = ['/', '/about', '/services', '/portfolio', '/blog', '/contact'];
    foreach ($basicPages as $page) {
        echo "  <url>\n";
        echo "    <loc>{$domain}{$page}</loc>\n";
        echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }
    
    echo '</urlset>';
}
?>