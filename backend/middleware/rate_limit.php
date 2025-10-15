<?php
/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

if (!isset($_ENV['RATE_LIMIT_ENABLED']) || $_ENV['RATE_LIMIT_ENABLED'] !== 'false') {
    require_once __DIR__ . '/../config/database.php';
    
    $ip = $_SERVER['REMOTE_ADDR'];
    $endpoint = $_SERVER['REQUEST_URI'];
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        // Clean old entries
        $stmt = $conn->prepare("
            DELETE FROM rate_limits 
            WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ");
        $stmt->execute();
        
        // Check current rate limit
        $stmt = $conn->prepare("
            SELECT requests FROM rate_limits 
            WHERE ip_address = ? AND endpoint = ? 
            AND window_start > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ");
        $stmt->execute([$ip, $endpoint]);
        
        $current = $stmt->fetch();
        
        if ($current) {
            if ($current['requests'] >= RATE_LIMIT_REQUESTS) {
                http_response_code(429);
                header('Retry-After: 3600');
                echo json_encode(['error' => 'Rate limit exceeded. Try again later.']);
                exit;
            }
            
            // Increment counter
            $stmt = $conn->prepare("
                UPDATE rate_limits 
                SET requests = requests + 1 
                WHERE ip_address = ? AND endpoint = ?
            ");
            $stmt->execute([$ip, $endpoint]);
        } else {
            // Create new entry
            $stmt = $conn->prepare("
                INSERT INTO rate_limits (ip_address, endpoint, requests) 
                VALUES (?, ?, 1)
                ON DUPLICATE KEY UPDATE requests = requests + 1, window_start = NOW()
            ");
            $stmt->execute([$ip, $endpoint]);
        }
        
    } catch (Exception $e) {
        error_log("Rate limit error: " . $e->getMessage());
        // Continue without rate limiting if there's an error
    }
}