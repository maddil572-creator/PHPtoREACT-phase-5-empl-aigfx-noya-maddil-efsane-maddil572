<?php
/**
 * Adil GFX Installation Script
 * Automatically sets up database and sample data
 */

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Set execution time limit
set_time_limit(300);

echo "🚀 Adil GFX Installation Script\n";
echo "================================\n\n";

try {
    // Test database connection
    echo "📡 Testing database connection...\n";
    $database = new Database();
    $db = $database->getConnection();
    echo "✅ Database connection successful!\n\n";
    
    // Check if tables already exist
    echo "🔍 Checking existing tables...\n";
    
    // Check database driver
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    
    if ($driver === 'sqlite') {
        $stmt = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    } else {
        $stmt = $db->query("SHOW TABLES");
    }
    
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($existingTables) > 0) {
        echo "⚠️  Database already contains " . count($existingTables) . " tables.\n";
        echo "Do you want to:\n";
        echo "1. Skip installation (keep existing data)\n";
        echo "2. Drop all tables and reinstall (WARNING: This will delete all data!)\n";
        echo "3. Exit installation\n\n";
        
        if (php_sapi_name() === 'cli') {
            echo "Enter your choice (1-3): ";
            $choice = trim(fgets(STDIN));
        } else {
            // For web interface
            $choice = $_GET['action'] ?? '1';
        }
        
        switch ($choice) {
            case '2':
                echo "🗑️  Dropping existing tables...\n";
                foreach ($existingTables as $table) {
                    if ($driver === 'sqlite') {
                        $db->exec("DROP TABLE IF EXISTS \"$table\"");
                    } else {
                        $db->exec("DROP TABLE IF EXISTS `$table`");
                    }
                }
                echo "✅ All tables dropped.\n\n";
                break;
            case '3':
                echo "❌ Installation cancelled.\n";
                exit(0);
            default:
                echo "⏭️  Skipping table creation.\n\n";
                goto skip_schema;
        }
    }
    
    // Install database schema
    echo "📋 Installing unified database schema...\n";
    
    // Choose schema file based on database driver
    if ($driver === 'sqlite') {
        $schemaFile = __DIR__ . '/database/simple_schema.sql';
    } else {
        $schemaFile = __DIR__ . '/database/hostinger_mysql_schema.sql';
    }
    
    if (!file_exists($schemaFile)) {
        throw new Exception("Unified schema file not found: $schemaFile");
    }
    
    $schema = file_get_contents($schemaFile);
    
    // Remove comments and split by semicolon
    $schema = preg_replace('/--.*$/m', '', $schema);
    $queries = array_filter(array_map('trim', explode(';', $schema)));
    
    $tableCount = 0;
    foreach ($queries as $query) {
        if (empty($query) || stripos($query, 'CREATE DATABASE') !== false || stripos($query, 'USE ') !== false) {
            continue;
        }
        
        try {
            $db->exec($query);
            if (stripos($query, 'CREATE TABLE') !== false) {
                $tableCount++;
                preg_match('/CREATE TABLE\s+`?(\w+)`?/i', $query, $matches);
                $tableName = $matches[1] ?? 'unknown';
                echo "  ✅ Created table: $tableName\n";
            }
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') === false) {
                throw $e;
            }
        }
    }
    
    echo "✅ Database schema installed successfully! ($tableCount tables created)\n\n";
    
    skip_schema:
    
    // Check if admin user already exists
    echo "🔍 Checking for existing admin user...\n";
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $adminCount = $stmt->fetchColumn();
    
    if ($adminCount > 0) {
        echo "👤 Admin user already exists. Database setup complete.\n";
        echo "📧 Admin login: admin@adilgfx.com\n";
        echo "🔑 Password: admin123\n\n";
    } else {
        echo "✅ Unified schema with sample data installed successfully!\n\n";
        
        echo "👤 Admin Account Created:\n";
        echo "📧 Email: admin@adilgfx.com\n";
        echo "🔑 Password: admin123\n";
        echo "⚠️  Please change the admin password after first login!\n\n";
    }
    
    // Create necessary directories
    echo "📁 Creating necessary directories...\n";
    $directories = [
        __DIR__ . '/uploads',
        __DIR__ . '/uploads/images',
        __DIR__ . '/uploads/documents',
        __DIR__ . '/uploads/videos',
        __DIR__ . '/cache',
        __DIR__ . '/logs'
    ];
    
    foreach ($directories as $dir) {
        if (!is_dir($dir)) {
            if (mkdir($dir, 0755, true)) {
                echo "  ✅ Created directory: " . basename($dir) . "\n";
            } else {
                echo "  ❌ Failed to create directory: " . basename($dir) . "\n";
            }
        } else {
            echo "  ✅ Directory exists: " . basename($dir) . "\n";
        }
    }
    
    // Set permissions
    echo "\n🔐 Setting directory permissions...\n";
    foreach ($directories as $dir) {
        if (is_dir($dir)) {
            chmod($dir, 0755);
            echo "  ✅ Set permissions for: " . basename($dir) . "\n";
        }
    }
    
    // Create .htaccess files for security
    echo "\n🛡️  Creating security files...\n";
    
    $uploadsHtaccess = __DIR__ . '/uploads/.htaccess';
    if (!file_exists($uploadsHtaccess)) {
        file_put_contents($uploadsHtaccess, "Options -Indexes\nOptions -ExecCGI\nAddHandler cgi-script .php .pl .py .jsp .asp .sh .cgi\n");
        echo "  ✅ Created uploads/.htaccess\n";
    }
    
    $cacheHtaccess = __DIR__ . '/cache/.htaccess';
    if (!file_exists($cacheHtaccess)) {
        file_put_contents($cacheHtaccess, "Order Allow,Deny\nDeny from all\n");
        echo "  ✅ Created cache/.htaccess\n";
    }
    
    // Test API endpoints
    echo "\n🧪 Testing API endpoints...\n";
    $testEndpoints = [
        '/api/test.php' => 'API Test',
        '/api/settings.php' => 'Settings API',
        '/api/blogs.php' => 'Blogs API',
        '/api/portfolio.php' => 'Portfolio API',
        '/api/services.php' => 'Services API',
        '/api/testimonials.php' => 'Testimonials API'
    ];
    
    foreach ($testEndpoints as $endpoint => $name) {
        try {
            $url = 'http://localhost:8000' . $endpoint;
            $context = stream_context_create(['http' => ['timeout' => 5]]);
            $response = @file_get_contents($url, false, $context);
            
            if ($response !== false) {
                $data = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "  ✅ $name: Working\n";
                } else {
                    echo "  ⚠️  $name: Response not JSON\n";
                }
            } else {
                echo "  ❌ $name: No response\n";
            }
        } catch (Exception $e) {
            echo "  ❌ $name: Error - " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n🎉 Installation completed successfully!\n";
    echo "================================\n\n";
    
    echo "📍 Next Steps:\n";
    echo "1. Start your servers:\n";
    echo "   Frontend: npm run dev (http://localhost:5173)\n";
    echo "   Backend:  php -S localhost:8000 -t backend/ (http://localhost:8000)\n\n";
    
    echo "2. Access your admin panel:\n";
    echo "   URL: http://localhost:5173/admin\n";
    echo "   Email: admin@adilgfx.com\n";
    echo "   Password: admin123\n\n";
    
    echo "3. Test API connectivity:\n";
    echo "   URL: http://localhost:5173/api-test\n\n";
    
    echo "4. Configure your .env file with:\n";
    echo "   - Database credentials\n";
    echo "   - SMTP settings for email\n";
    echo "   - JWT secret key\n\n";
    
    echo "⚠️  Security Reminders:\n";
    echo "- Change the default admin password\n";
    echo "- Update JWT_SECRET in .env file\n";
    echo "- Configure proper SMTP settings\n";
    echo "- Set up SSL certificate for production\n\n";
    
} catch (Exception $e) {
    echo "❌ Installation failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. Database connection settings in .env\n";
    echo "2. MySQL server is running\n";
    echo "3. Database user has proper permissions\n";
    echo "4. PHP extensions are installed (pdo, pdo_mysql)\n\n";
    
    exit(1);
}