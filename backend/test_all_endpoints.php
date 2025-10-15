<?php
/**
 * Comprehensive API Endpoint Testing Script
 * Tests all API endpoints to ensure they're properly connected
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// ANSI color codes for terminal output
$colors = [
    'green' => "\033[32m",
    'red' => "\033[31m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'reset' => "\033[0m"
];

function colorOutput($text, $color = 'reset') {
    global $colors;
    return $colors[$color] . $text . $colors['reset'];
}

function testEndpoint($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && ($method === 'POST' || $method === 'PUT')) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }
    
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    return [
        'success' => !$error && $httpCode < 400,
        'http_code' => $httpCode,
        'response' => $response,
        'error' => $error
    ];
}

echo colorOutput("🔍 COMPREHENSIVE API ENDPOINT TEST\n", 'blue');
echo colorOutput("=====================================\n\n", 'blue');

$baseUrl = 'http://localhost:8000/backend';
$endpoints = [
    // Core API endpoints
    'API Status' => ['GET', '/'],
    'Test Endpoint' => ['GET', '/api/test.php'],
    
    // Authentication endpoints
    'Auth - Register' => ['POST', '/api/auth.php/register', [
        'email' => 'test@example.com',
        'password' => 'password123',
        'name' => 'Test User'
    ]],
    'Auth - Login' => ['POST', '/api/auth.php/login', [
        'email' => 'admin@adilgfx.com',
        'password' => 'admin123'
    ]],
    'Auth - Verify' => ['GET', '/api/auth.php/verify'],
    
    // Public content endpoints
    'Settings' => ['GET', '/api/settings.php'],
    'Blogs' => ['GET', '/api/blogs.php'],
    'Portfolio' => ['GET', '/api/portfolio.php'],
    'Services' => ['GET', '/api/services.php'],
    'Testimonials' => ['GET', '/api/testimonials.php'],
    'Carousel' => ['GET', '/api/carousel.php?name=hero'],
    'Pages' => ['GET', '/api/pages.php'],
    'Translations' => ['GET', '/api/translations.php'],
    
    // Contact and Newsletter
    'Contact Form' => ['POST', '/api/contact.php', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'subject' => 'Test Message',
        'message' => 'This is a test message'
    ]],
    'Newsletter Subscribe' => ['POST', '/api/newsletter.php/subscribe', [
        'email' => 'newsletter@example.com'
    ]],
    
    // Admin endpoints (require authentication)
    'Admin Stats' => ['GET', '/api/admin/stats.php'],
    'Admin Activity' => ['GET', '/api/admin/activity.php'],
    'Admin Users' => ['GET', '/api/admin/users.php'],
    'Admin Blogs' => ['GET', '/api/admin/blogs.php'],
    'Admin Notifications' => ['GET', '/api/admin/notifications.php'],
    'Admin Audit Logs' => ['GET', '/api/admin/audit.php'],
    'Admin Translations' => ['GET', '/api/admin/translations.php'],
    
    // User endpoints
    'User Profile' => ['GET', '/api/user/profile.php'],
    
    // Funnel endpoints
    'Funnel Reports' => ['GET', '/api/funnel/report.php?list=true'],
];

$results = [];
$passed = 0;
$failed = 0;

foreach ($endpoints as $name => $config) {
    $method = $config[0];
    $path = $config[1];
    $data = $config[2] ?? null;
    
    $url = $baseUrl . $path;
    
    echo colorOutput("Testing: ", 'yellow') . "$name ($method $path)\n";
    
    $result = testEndpoint($url, $method, $data);
    
    if ($result['success']) {
        echo colorOutput("  ✅ PASS", 'green') . " - HTTP {$result['http_code']}\n";
        $passed++;
    } else {
        echo colorOutput("  ❌ FAIL", 'red') . " - HTTP {$result['http_code']}";
        if ($result['error']) {
            echo " - " . $result['error'];
        }
        echo "\n";
        
        // Show response for debugging
        if ($result['response']) {
            $response = json_decode($result['response'], true);
            if ($response && isset($response['error'])) {
                echo colorOutput("     Error: " . $response['error'], 'red') . "\n";
            }
        }
        $failed++;
    }
    
    $results[$name] = $result;
    echo "\n";
}

// Test database connection
echo colorOutput("Testing Database Connection:\n", 'yellow');
try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Test basic query
    $stmt = $db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    
    if ($result && $result['test'] == 1) {
        echo colorOutput("  ✅ Database connection successful\n", 'green');
        $passed++;
    } else {
        echo colorOutput("  ❌ Database query failed\n", 'red');
        $failed++;
    }
    
    // Test key tables exist
    $tables = ['users', 'blogs', 'portfolio', 'services', 'testimonials', 'settings', 'notifications'];
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->fetch()) {
            echo colorOutput("  ✅ Table '$table' exists\n", 'green');
        } else {
            echo colorOutput("  ❌ Table '$table' missing\n", 'red');
            $failed++;
        }
    }
    
} catch (Exception $e) {
    echo colorOutput("  ❌ Database connection failed: " . $e->getMessage() . "\n", 'red');
    $failed++;
}

// Test file permissions
echo colorOutput("\nTesting File Permissions:\n", 'yellow');
$directories = ['uploads', 'cache', 'logs'];
foreach ($directories as $dir) {
    $path = __DIR__ . "/$dir";
    if (is_dir($path)) {
        if (is_writable($path)) {
            echo colorOutput("  ✅ Directory '$dir' is writable\n", 'green');
        } else {
            echo colorOutput("  ❌ Directory '$dir' is not writable\n", 'red');
            $failed++;
        }
    } else {
        echo colorOutput("  ❌ Directory '$dir' does not exist\n", 'red');
        $failed++;
    }
}

// Summary
echo colorOutput("\n" . str_repeat("=", 50) . "\n", 'blue');
echo colorOutput("TEST SUMMARY\n", 'blue');
echo colorOutput(str_repeat("=", 50) . "\n", 'blue');

$total = $passed + $failed;
$passRate = $total > 0 ? round(($passed / $total) * 100, 1) : 0;

echo colorOutput("Total Tests: $total\n", 'yellow');
echo colorOutput("Passed: $passed\n", 'green');
echo colorOutput("Failed: $failed\n", 'red');
echo colorOutput("Pass Rate: $passRate%\n", $passRate >= 80 ? 'green' : 'red');

if ($failed > 0) {
    echo colorOutput("\n⚠️  Some endpoints have issues. Check the details above.\n", 'yellow');
    exit(1);
} else {
    echo colorOutput("\n🎉 All endpoints are working correctly!\n", 'green');
    exit(0);
}