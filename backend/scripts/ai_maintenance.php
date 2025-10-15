<?php
/**
 * AI Maintenance Script
 * Handles cleanup, optimization, and monitoring tasks
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/OpenAIIntegration.php';

class AIMaintenance {
    private $db;
    private $openai;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->openai = new OpenAIIntegration();
    }
    
    public function runMaintenance($tasks = ['all']) {
        echo "🔧 AI Maintenance Tasks\n";
        echo "======================\n\n";
        
        if (in_array('all', $tasks) || in_array('cleanup', $tasks)) {
            $this->cleanupExpiredCache();
            $this->cleanupOldLogs();
            $this->cleanupOldSessions();
        }
        
        if (in_array('all', $tasks) || in_array('optimize', $tasks)) {
            $this->optimizeDatabase();
            $this->updateCacheStats();
        }
        
        if (in_array('all', $tasks) || in_array('monitor', $tasks)) {
            $this->checkBudgetUsage();
            $this->checkSystemHealth();
            $this->generateUsageReport();
        }
        
        if (in_array('all', $tasks) || in_array('backup', $tasks)) {
            $this->backupAIData();
        }
        
        echo "\n✅ Maintenance completed successfully!\n";
    }
    
    private function cleanupExpiredCache() {
        echo "🗑️ Cleaning up expired cache entries...\n";
        
        try {
            $stmt = $this->db->prepare("DELETE FROM ai_response_cache WHERE expires_at < NOW()");
            $stmt->execute();
            $deletedCount = $stmt->rowCount();
            
            echo "  Removed {$deletedCount} expired cache entries\n";
            
            // Also clean up very old cache entries (7+ days past expiration)
            $stmt = $this->db->prepare("DELETE FROM ai_response_cache WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
            $stmt->execute();
            $oldDeletedCount = $stmt->rowCount();
            
            if ($oldDeletedCount > 0) {
                echo "  Removed {$oldDeletedCount} old expired cache entries\n";
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error cleaning cache: " . $e->getMessage() . "\n";
        }
    }
    
    private function cleanupOldLogs() {
        echo "📋 Cleaning up old usage logs...\n";
        
        try {
            // Keep logs for 1 year
            $stmt = $this->db->prepare("DELETE FROM ai_usage_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)");
            $stmt->execute();
            $deletedCount = $stmt->rowCount();
            
            echo "  Removed {$deletedCount} old log entries (>1 year)\n";
            
        } catch (Exception $e) {
            echo "  ❌ Error cleaning logs: " . $e->getMessage() . "\n";
        }
    }
    
    private function cleanupOldSessions() {
        echo "💬 Cleaning up old chat sessions...\n";
        
        try {
            // Keep sessions for 6 months
            $stmt = $this->db->prepare("DELETE FROM ai_chat_sessions WHERE started_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)");
            $stmt->execute();
            $deletedCount = $stmt->rowCount();
            
            echo "  Removed {$deletedCount} old chat sessions (>6 months)\n";
            
            // Clean up orphaned chat messages
            $stmt = $this->db->prepare("
                DELETE FROM ai_chat_messages 
                WHERE session_id NOT IN (SELECT session_id FROM ai_chat_sessions)
            ");
            $stmt->execute();
            $orphanedCount = $stmt->rowCount();
            
            if ($orphanedCount > 0) {
                echo "  Removed {$orphanedCount} orphaned chat messages\n";
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error cleaning sessions: " . $e->getMessage() . "\n";
        }
    }
    
    private function optimizeDatabase() {
        echo "⚡ Optimizing database tables...\n";
        
        $tables = [
            'ai_usage_log',
            'ai_response_cache',
            'ai_generated_content',
            'ai_chat_sessions',
            'ai_chat_messages'
        ];
        
        foreach ($tables as $table) {
            try {
                $stmt = $this->db->prepare("OPTIMIZE TABLE {$table}");
                $stmt->execute();
                echo "  Optimized table: {$table}\n";
            } catch (Exception $e) {
                echo "  ❌ Error optimizing {$table}: " . $e->getMessage() . "\n";
            }
        }
    }
    
    private function updateCacheStats() {
        echo "📊 Updating cache statistics...\n";
        
        try {
            // Update hit counts and effectiveness metrics
            $stmt = $this->db->query("
                SELECT 
                    operation,
                    COUNT(*) as total_items,
                    SUM(hit_count) as total_hits,
                    AVG(hit_count) as avg_hits
                FROM ai_response_cache 
                WHERE expires_at > NOW()
                GROUP BY operation
            ");
            
            $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($stats as $stat) {
                echo "  {$stat['operation']}: {$stat['total_items']} items, {$stat['total_hits']} hits (avg: " . round($stat['avg_hits'], 1) . ")\n";
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error updating cache stats: " . $e->getMessage() . "\n";
        }
    }
    
    private function checkBudgetUsage() {
        echo "💰 Checking budget usage...\n";
        
        try {
            $stats = $this->openai->getUsageStats();
            
            if ($stats['success']) {
                $data = $stats['data'];
                $percentage = ($data['current_spend'] / $data['monthly_budget']) * 100;
                
                echo "  Monthly budget: $" . number_format($data['monthly_budget'], 2) . "\n";
                echo "  Current spend: $" . number_format($data['current_spend'], 4) . "\n";
                echo "  Usage: " . number_format($percentage, 1) . "%\n";
                
                // Check for alerts
                $alertThreshold = floatval($_ENV['AI_ALERT_BUDGET_THRESHOLD'] ?? 0.8) * 100;
                
                if ($percentage >= 95) {
                    echo "  🚨 CRITICAL: Budget almost exhausted!\n";
                    $this->sendBudgetAlert('critical', $percentage);
                } elseif ($percentage >= $alertThreshold) {
                    echo "  ⚠️ WARNING: Budget threshold exceeded\n";
                    $this->sendBudgetAlert('warning', $percentage);
                } else {
                    echo "  ✅ Budget usage is healthy\n";
                }
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error checking budget: " . $e->getMessage() . "\n";
        }
    }
    
    private function checkSystemHealth() {
        echo "🏥 Checking system health...\n";
        
        try {
            // Check API connectivity
            $testResult = $this->openai->generateSupportResponse("System health check");
            
            if ($testResult['success']) {
                echo "  ✅ OpenAI API connectivity: OK\n";
                echo "  Response time: " . ($testResult['response_time'] ?? 'N/A') . "\n";
            } else {
                echo "  ❌ OpenAI API connectivity: FAILED\n";
                echo "  Error: " . ($testResult['error'] ?? 'Unknown') . "\n";
            }
            
            // Check database performance
            $start = microtime(true);
            $stmt = $this->db->query("SELECT COUNT(*) FROM ai_usage_log WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $queryTime = microtime(true) - $start;
            
            echo "  ✅ Database performance: " . number_format($queryTime * 1000, 2) . "ms\n";
            
            // Check cache effectiveness
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total_cache,
                    SUM(hit_count) as total_hits,
                    AVG(hit_count) as avg_effectiveness
                FROM ai_response_cache 
                WHERE expires_at > NOW()
            ");
            
            $cacheStats = $stmt->fetch(PDO::FETCH_ASSOC);
            $effectiveness = $cacheStats['avg_effectiveness'] ?? 0;
            
            echo "  Cache effectiveness: " . number_format($effectiveness, 1) . " avg hits per item\n";
            
            if ($effectiveness >= 2) {
                echo "  ✅ Cache performance: EXCELLENT\n";
            } elseif ($effectiveness >= 1) {
                echo "  ✅ Cache performance: GOOD\n";
            } else {
                echo "  ⚠️ Cache performance: NEEDS IMPROVEMENT\n";
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error checking system health: " . $e->getMessage() . "\n";
        }
    }
    
    private function generateUsageReport() {
        echo "📈 Generating usage report...\n";
        
        try {
            // Daily usage for last 7 days
            $stmt = $this->db->query("
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as requests,
                    SUM(cost) as daily_cost,
                    SUM(total_tokens) as tokens
                FROM ai_usage_log 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            ");
            
            $dailyStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "  Last 7 days usage:\n";
            echo "  Date       | Requests | Cost     | Tokens\n";
            echo "  -----------|----------|----------|--------\n";
            
            foreach ($dailyStats as $day) {
                echo "  " . $day['date'] . " | " . 
                     str_pad($day['requests'], 8) . " | $" . 
                     str_pad(number_format($day['daily_cost'], 4), 7) . " | " . 
                     number_format($day['tokens']) . "\n";
            }
            
            // Top operations
            $stmt = $this->db->query("
                SELECT 
                    operation,
                    COUNT(*) as count,
                    SUM(cost) as total_cost,
                    AVG(cost) as avg_cost
                FROM ai_usage_log 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY operation
                ORDER BY count DESC
                LIMIT 5
            ");
            
            $topOps = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n  Top operations (last 30 days):\n";
            foreach ($topOps as $op) {
                echo "  {$op['operation']}: {$op['count']} requests, $" . 
                     number_format($op['total_cost'], 4) . " total\n";
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error generating report: " . $e->getMessage() . "\n";
        }
    }
    
    private function backupAIData() {
        echo "💾 Backing up AI data...\n";
        
        try {
            $backupDir = __DIR__ . '/../backups/ai';
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }
            
            $timestamp = date('Y-m-d_H-i-s');
            $backupFile = "{$backupDir}/ai_backup_{$timestamp}.sql";
            
            // Export AI-related tables
            $tables = [
                'ai_config',
                'ai_budget_tracking',
                'ai_generated_content'
            ];
            
            $sql = "-- AI Data Backup - " . date('Y-m-d H:i:s') . "\n\n";
            
            foreach ($tables as $table) {
                $stmt = $this->db->query("SELECT * FROM {$table}");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (!empty($rows)) {
                    $sql .= "-- Table: {$table}\n";
                    
                    foreach ($rows as $row) {
                        $columns = array_keys($row);
                        $values = array_map(function($v) {
                            return $this->db->quote($v);
                        }, array_values($row));
                        
                        $sql .= "INSERT INTO {$table} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ");\n";
                    }
                    
                    $sql .= "\n";
                }
            }
            
            file_put_contents($backupFile, $sql);
            echo "  Backup saved: {$backupFile}\n";
            
            // Clean up old backups (keep last 30 days)
            $oldBackups = glob("{$backupDir}/ai_backup_*.sql");
            $cutoffTime = time() - (30 * 24 * 60 * 60); // 30 days ago
            
            foreach ($oldBackups as $backup) {
                if (filemtime($backup) < $cutoffTime) {
                    unlink($backup);
                    echo "  Removed old backup: " . basename($backup) . "\n";
                }
            }
            
        } catch (Exception $e) {
            echo "  ❌ Error creating backup: " . $e->getMessage() . "\n";
        }
    }
    
    private function sendBudgetAlert($level, $percentage) {
        $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@adilcreator.com';
        $subject = "AI Budget Alert - " . strtoupper($level);
        
        $message = "AI budget usage has reached {$percentage}%.\n\n";
        $message .= "Current status:\n";
        $message .= "- Budget: $" . ($_ENV['AI_MONTHLY_BUDGET'] ?? '50.00') . "\n";
        $message .= "- Usage: {$percentage}%\n";
        $message .= "- Level: " . strtoupper($level) . "\n\n";
        $message .= "Please review AI usage in the admin panel.\n";
        
        // You can implement email sending here
        error_log("AI Budget Alert: {$subject} - {$message}");
    }
}

// Command line usage
if (isset($argv)) {
    $tasks = array_slice($argv, 1);
    if (empty($tasks)) {
        $tasks = ['all'];
    }
    
    $maintenance = new AIMaintenance();
    $maintenance->runMaintenance($tasks);
} else {
    echo "This script should be run from command line.\n";
    echo "Usage: php ai_maintenance.php [cleanup|optimize|monitor|backup|all]\n";
}
?>