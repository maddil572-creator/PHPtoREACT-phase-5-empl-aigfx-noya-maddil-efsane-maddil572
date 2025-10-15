<?php
/**
 * Hostinger Deployment Configuration Script
 * Automatically configures the system for Hostinger shared hosting
 */

echo "🚀 Adil Creator - Hostinger Deployment Configuration\n";
echo "==================================================\n\n";

// Hostinger-specific settings
$hostingerConfig = [
    'domain' => 'adilcreator.com',
    'db_host' => 'localhost',
    'db_name' => 'u720615217_adil_db',
    'db_user' => 'u720615217_adil',
    'db_pass' => 'Muhadilmmad#11213',
    'admin_email' => 'admin@adilcreator.com',
    'studio_email' => 'studio@adilcreator.com',
    'admin_password' => 'Muhadilmmad#11213'
];

echo "📋 Hostinger Configuration:\n";
echo "Domain: {$hostingerConfig['domain']}\n";
echo "Database: {$hostingerConfig['db_name']}\n";
echo "DB User: {$hostingerConfig['db_user']}\n";
echo "Admin Email: {$hostingerConfig['admin_email']}\n";
echo "Studio Email: {$hostingerConfig['studio_email']}\n\n";

// Create deployment directory
$deployDir = __DIR__ . '/hostinger-deployment';
if (!is_dir($deployDir)) {
    mkdir($deployDir, 0755, true);
    echo "✅ Created deployment directory\n";
}

// Copy built frontend files
echo "📁 Copying frontend files...\n";
$distDir = __DIR__ . '/dist';
if (is_dir($distDir)) {
    // Copy all files from dist to deployment root
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($distDir, RecursiveDirectoryIterator::SKIP_DOTS)
    );
    
    foreach ($iterator as $file) {
        $relativePath = substr($file->getPathname(), strlen($distDir) + 1);
        $targetPath = $deployDir . '/' . $relativePath;
        
        $targetDir = dirname($targetPath);
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        
        copy($file->getPathname(), $targetPath);
    }
    echo "✅ Frontend files copied\n";
} else {
    echo "❌ Frontend build not found. Run 'npm run build' first.\n";
    exit(1);
}

// Copy backend files
echo "📁 Copying backend files...\n";
$backendDir = __DIR__ . '/backend';
$targetBackendDir = $deployDir . '/backend';

if (!is_dir($targetBackendDir)) {
    mkdir($targetBackendDir, 0755, true);
}

// Copy essential backend files
$backendFiles = [
    'index.php',
    'install.php',
    '.htaccess',
    'composer.json',
    'composer.lock'
];

foreach ($backendFiles as $file) {
    if (file_exists($backendDir . '/' . $file)) {
        copy($backendDir . '/' . $file, $targetBackendDir . '/' . $file);
    }
}

// Copy backend directories
$backendDirs = ['api', 'classes', 'config', 'database', 'middleware', 'admin'];
foreach ($backendDirs as $dir) {
    $sourceDir = $backendDir . '/' . $dir;
    $targetDir = $targetBackendDir . '/' . $dir;
    
    if (is_dir($sourceDir)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            $relativePath = substr($file->getPathname(), strlen($sourceDir) + 1);
            $targetPath = $targetDir . '/' . $relativePath;
            
            $targetDirPath = dirname($targetPath);
            if (!is_dir($targetDirPath)) {
                mkdir($targetDirPath, 0755, true);
            }
            
            copy($file->getPathname(), $targetPath);
        }
    }
}

// Create upload directories
$uploadDirs = ['uploads', 'uploads/images', 'uploads/documents', 'uploads/videos', 'cache', 'logs'];
foreach ($uploadDirs as $dir) {
    $dirPath = $targetBackendDir . '/' . $dir;
    if (!is_dir($dirPath)) {
        mkdir($dirPath, 0755, true);
    }
    
    // Create .htaccess for security
    if (strpos($dir, 'uploads') !== false) {
        file_put_contents($dirPath . '/.htaccess', "Options -Indexes\nDeny from all\n<Files ~ \"\\.(jpg|jpeg|png|gif|svg|pdf|doc|docx|mp4|avi|mov)$\">\nAllow from all\n</Files>");
    }
}

echo "✅ Backend files copied\n";

// Create Hostinger-specific .env file
echo "⚙️ Creating production .env file...\n";
$envContent = <<<ENV
# =====================================================
# Adil Creator - Hostinger Production Configuration
# =====================================================

# Frontend Configuration
VITE_API_BASE_URL=https://adilcreator.com/backend
VITE_USE_MOCK_DATA=false
VITE_SITE_NAME=Adil Creator
VITE_SITE_URL=https://adilcreator.com
VITE_APP_ENV=production
VITE_DEBUG_MODE=false

# Backend Configuration
APP_ENV=production
APP_DEBUG=false
APP_URL=https://adilcreator.com
FRONTEND_URL=https://adilcreator.com

# Hostinger Database Configuration
DB_HOST=localhost
DB_NAME=u720615217_adil_db
DB_USER=u720615217_adil
DB_PASS=Muhadilmmad#11213
DB_PORT=3306
DB_CHARSET=utf8mb4

# Security
JWT_SECRET=I/rVsSBnNdU5+9GlR5aWHvtIigauxqqyQaAhnq4zlro=
JWT_EXPIRY=604800
BCRYPT_COST=12

# Email Configuration (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USERNAME=admin@adilcreator.com
SMTP_PASSWORD=Muhadilmmad#11213
SMTP_ENCRYPTION=tls
FROM_EMAIL=studio@adilcreator.com
FROM_NAME=Adil Creator Studio
ADMIN_EMAIL=admin@adilcreator.com

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./backend/uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,svg,pdf,doc,docx,mp4,avi,mov

# Cache & Performance
CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_PATH=./backend/cache

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
ENV;

file_put_contents($deployDir . '/.env', $envContent);
echo "✅ Production .env created\n";

// Create Hostinger-specific .htaccess
echo "🔧 Creating Hostinger .htaccess...\n";
$htaccessContent = <<<HTACCESS
# =====================================================
# Adil Creator - Hostinger Shared Hosting Configuration
# =====================================================

RewriteEngine On

# Force HTTPS (Hostinger SSL)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle backend API requests
RewriteCond %{REQUEST_URI} ^/backend/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^backend/(.*)$ backend/index.php [QSA,L]

# Handle React Router (frontend routes)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend
RewriteRule . /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Protect sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.json">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.lock">
    Order allow,deny
    Deny from all
</Files>

<FilesMatch "\.(sql|log|txt)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Enable compression (if available)
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# PHP Settings for Hostinger
<IfModule mod_php8.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
    php_value memory_limit 256M
</IfModule>
HTACCESS;

file_put_contents($deployDir . '/.htaccess', $htaccessContent);
echo "✅ Hostinger .htaccess created\n";

// Create backend .htaccess for additional security
$backendHtaccess = <<<BACKEND_HTACCESS
# Backend Security Configuration
RewriteEngine On

# Route all requests through index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Protect sensitive directories
<Files "composer.json">
    Deny from all
</Files>

<Files ".env">
    Deny from all
</Files>

<FilesMatch "\.(sql|log)$">
    Deny from all
</FilesMatch>

# Allow uploads but prevent execution
<Directory "uploads">
    <Files "*">
        SetHandler none
        SetHandler default-handler
        Options -ExecCGI
        RemoveHandler .php .phtml .php3 .php4 .php5 .php6
        RemoveType .php .phtml .php3 .php4 .php5 .php6
    </Files>
</Directory>
BACKEND_HTACCESS;

file_put_contents($targetBackendDir . '/.htaccess', $backendHtaccess);
echo "✅ Backend .htaccess created\n";

// Create database installation instructions
echo "📋 Creating database setup instructions...\n";
$dbInstructions = <<<INSTRUCTIONS
# Database Setup Instructions for Hostinger

## Automatic Setup (Recommended)
1. Upload all files to your domain root
2. Visit: https://adilcreator.com/backend/install.php
3. Follow the installation prompts

## Manual Setup (if needed)
1. Access Hostinger cPanel
2. Go to phpMyAdmin
3. Select database: u720615217_adil_db
4. Import file: backend/database/hostinger_mysql_schema.sql
5. Verify tables are created

## Admin Access
- URL: https://adilcreator.com/admin
- Email: admin@adilcreator.com
- Password: Muhadilmmad#11213

## Testing
- API Test: https://adilcreator.com/backend/api/test.php
- Website: https://adilcreator.com
INSTRUCTIONS;

file_put_contents($deployDir . '/DATABASE_SETUP.txt', $dbInstructions);
echo "✅ Database setup instructions created\n";

echo "\n🎉 Hostinger deployment package ready!\n";
echo "📁 Location: hostinger-deployment/\n";
echo "📤 Upload contents to your domain root directory\n\n";

echo "🔗 Your URLs after deployment:\n";
echo "Website: https://adilcreator.com\n";
echo "Admin: https://adilcreator.com/admin\n";
echo "API: https://adilcreator.com/backend/api/test.php\n\n";

echo "🔑 Admin Login:\n";
echo "Email: admin@adilcreator.com\n";
echo "Password: Muhadilmmad#11213\n\n";

echo "✅ Ready for Hostinger deployment!\n";
?>