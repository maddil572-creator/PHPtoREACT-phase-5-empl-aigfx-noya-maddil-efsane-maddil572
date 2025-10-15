<?php
/**
 * SQLite Database Connection Class
 * Simplified database setup for quick deployment
 */

class Database {
    private $host;
    private $db_name;
    private $connection;

    public function __construct() {
        // Load environment variables if not already loaded
        if (empty($_ENV['DB_NAME']) && file_exists(__DIR__ . '/../.env')) {
            $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') === false) continue;
                list($name, $value) = explode('=', $line, 2);
                $_ENV[trim($name)] = trim($value);
            }
        }

        $this->db_name = $_ENV['DB_NAME'] ?? __DIR__ . '/../database/adilgfx.sqlite';
        
        // Ensure database directory exists
        $dbDir = dirname($this->db_name);
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
    }

    public function getConnection() {
        $this->connection = null;

        try {
            // Create SQLite connection
            $this->connection = new PDO("sqlite:" . $this->db_name);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Enable foreign keys
            $this->connection->exec("PRAGMA foreign_keys = ON");
            
        } catch(PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }

        return $this->connection;
    }
}