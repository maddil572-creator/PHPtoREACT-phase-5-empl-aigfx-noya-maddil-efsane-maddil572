<?php
/**
 * Database Connection Test
 * Test script to verify database connectivity
 */

require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "✓ Database connection successful!\n";
    
    // Test basic query
    $stmt = $db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    
    if ($result['test'] == 1) {
        echo "✓ Database query test successful!\n";
    }
    
    // Check if tables exist
    $tables = ['users', 'blogs', 'portfolio', 'services', 'testimonials', 'settings'];
    $existingTables = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                $existingTables[] = $table;
                echo "✓ Table '$table' exists\n";
            } else {
                echo "✗ Table '$table' missing\n";
            }
        } catch (Exception $e) {
            echo "✗ Error checking table '$table': " . $e->getMessage() . "\n";
        }
    }
    
    if (count($existingTables) === count($tables)) {
        echo "\n✓ All required tables exist!\n";
    } else {
        echo "\n⚠ Some tables are missing. You may need to run the database setup script.\n";
        echo "Missing tables: " . implode(', ', array_diff($tables, $existingTables)) . "\n";
    }
    
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. MySQL server is running\n";
    echo "2. Database credentials in .env file are correct\n";
    echo "3. Database 'adilgfx_db' exists\n";
    echo "4. User has proper permissions\n";
    
    exit(1);
}