<?php
/**
 * Application Configuration
 * Load environment variables and set global constants
 */

// Load environment variables
if (file_exists(__DIR__ . '/../../.env')) {
    $lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Application constants
define('APP_NAME', 'Adil GFX Backend');
define('APP_VERSION', '1.0.0');
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-in-production');
define('JWT_EXPIRY', 86400 * 7); // 7 days
define('BCRYPT_COST', 12);
define('RATE_LIMIT_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 3600); // 1 hour

// CORS settings
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'https://adilgfx.com',
    'https://www.adilgfx.com'
]);

// File upload settings
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'svg', 'pdf']);
define('UPLOAD_PATH', __DIR__ . '/../uploads/');

// Email settings
define('SMTP_HOST', $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com');
define('SMTP_PORT', $_ENV['SMTP_PORT'] ?? 587);
define('SMTP_USERNAME', $_ENV['SMTP_USERNAME'] ?? '');
define('SMTP_PASSWORD', $_ENV['SMTP_PASSWORD'] ?? '');
define('FROM_EMAIL', $_ENV['FROM_EMAIL'] ?? 'hello@adilgfx.com');
define('FROM_NAME', $_ENV['FROM_NAME'] ?? 'Adil GFX');

// Cache settings
define('CACHE_ENABLED', $_ENV['CACHE_ENABLED'] ?? true);
define('CACHE_TTL', 3600); // 1 hour

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Error reporting
if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}