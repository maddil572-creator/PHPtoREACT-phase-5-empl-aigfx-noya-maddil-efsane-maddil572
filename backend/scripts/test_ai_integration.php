<?php
/**
 * AI Integration Test Script
 * Comprehensive testing for all AI features
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/OpenAIIntegration.php';

class AIIntegrationTester {
    private $openai;
    private $db;
    private $results = [];
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->openai = new OpenAIIntegration();
    }
    
    public function runAllTests() {
        echo "🤖 AI Integration Test Suite\n";
        echo "============================\n\n";
        
        $this->testDatabaseSetup();
        $this->testAPIConnection();
        $this->testBudgetTracking();
        $this->testCaching();
        $this->testBlogGeneration();
        $this->testProposalGeneration();
        $this->testSupportChat();
        $this->testSEOOptimization();
        $this->testRateLimiting();
        
        $this->printSummary();
    }
    
    private function testDatabaseSetup() {
        echo "📊 Testing Database Setup...\n";
        
        $tables = [
            'ai_usage_log',
            'ai_response_cache', 
            'ai_config',
            'ai_generated_content',
            'ai_budget_tracking',
            'ai_chat_sessions',
            'ai_chat_messages'
        ];
        
        foreach ($tables as $table) {
            try {
                $stmt = $this->db->query("SELECT 1 FROM {$table} LIMIT 1");
                $this->logResult("Database table '{$table}' exists", true);
            } catch (Exception $e) {
                $this->logResult("Database table '{$table}' missing", false, $e->getMessage());
            }
        }
        
        // Test AI config
        try {
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM ai_config");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $configCount = $result['count'];
            
            if ($configCount > 0) {
                $this->logResult("AI configuration loaded ({$configCount} entries)", true);
            } else {
                $this->logResult("AI configuration empty", false, "No default config found");
            }
        } catch (Exception $e) {
            $this->logResult("AI configuration test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testAPIConnection() {
        echo "🔌 Testing OpenAI API Connection...\n";
        
        if (!$_ENV['OPENAI_API_KEY']) {
            $this->logResult("OpenAI API key configured", false, "OPENAI_API_KEY not set in .env");
            echo "\n";
            return;
        }
        
        $this->logResult("OpenAI API key configured", true);
        
        // Test simple API call
        try {
            $result = $this->openai->generateSupportResponse("Hello, this is a test message.");
            
            if ($result['success']) {
                $cost = $result['cost'] ?? 0;
                $this->logResult("OpenAI API connection successful", true, "Cost: $" . number_format($cost, 4));
            } else {
                $this->logResult("OpenAI API connection failed", false, $result['error'] ?? 'Unknown error');
            }
        } catch (Exception $e) {
            $this->logResult("OpenAI API connection failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testBudgetTracking() {
        echo "💰 Testing Budget Tracking...\n";
        
        try {
            $stats = $this->openai->getUsageStats();
            
            if ($stats['success']) {
                $data = $stats['data'];
                $this->logResult("Budget tracking working", true, 
                    "Budget: $" . number_format($data['monthly_budget'], 2) . 
                    ", Spent: $" . number_format($data['current_spend'], 4));
                
                // Test budget limit
                $percentage = ($data['current_spend'] / $data['monthly_budget']) * 100;
                if ($percentage < 90) {
                    $this->logResult("Budget within limits", true, number_format($percentage, 1) . "% used");
                } else {
                    $this->logResult("Budget approaching limit", false, number_format($percentage, 1) . "% used");
                }
            } else {
                $this->logResult("Budget tracking failed", false, $stats['error'] ?? 'Unknown error');
            }
        } catch (Exception $e) {
            $this->logResult("Budget tracking test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testCaching() {
        echo "🗄️ Testing Response Caching...\n";
        
        try {
            // Test cache write
            $testKey = 'test_cache_' . time();
            $testData = ['test' => 'data', 'timestamp' => time()];
            
            // Use reflection to access private method
            $reflection = new ReflectionClass($this->openai);
            $cacheMethod = $reflection->getMethod('cacheResponse');
            $cacheMethod->setAccessible(true);
            
            $cacheMethod->invoke($this->openai, $testKey, $testData, 60);
            $this->logResult("Cache write test", true);
            
            // Test cache read
            $getCacheMethod = $reflection->getMethod('getCachedResponse');
            $getCacheMethod->setAccessible(true);
            
            $cached = $getCacheMethod->invoke($this->openai, $testKey);
            
            if ($cached && $cached['test'] === 'data') {
                $this->logResult("Cache read test", true);
            } else {
                $this->logResult("Cache read test", false, "Cached data not found or corrupted");
            }
            
            // Test cache stats
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM ai_response_cache");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $cacheCount = $result['count'];
            
            $this->logResult("Cache statistics", true, "{$cacheCount} cached items");
            
        } catch (Exception $e) {
            $this->logResult("Cache testing failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testBlogGeneration() {
        echo "📝 Testing Blog Generation...\n";
        
        try {
            $result = $this->openai->generateBlogContent(
                "Test Blog Topic: AI in Design",
                ['AI', 'design', 'automation'],
                'professional',
                'short'
            );
            
            if ($result['success']) {
                $data = $result['data'];
                $cost = $result['cost'] ?? 0;
                
                $this->logResult("Blog generation successful", true, "Cost: $" . number_format($cost, 4));
                
                // Check required fields
                $requiredFields = ['title', 'content', 'meta_description'];
                foreach ($requiredFields as $field) {
                    if (!empty($data[$field])) {
                        $this->logResult("Blog field '{$field}' generated", true);
                    } else {
                        $this->logResult("Blog field '{$field}' missing", false);
                    }
                }
                
                // Check content length
                $wordCount = str_word_count(strip_tags($data['content'] ?? ''));
                if ($wordCount > 100) {
                    $this->logResult("Blog content length appropriate", true, "{$wordCount} words");
                } else {
                    $this->logResult("Blog content too short", false, "{$wordCount} words");
                }
                
            } else {
                $this->logResult("Blog generation failed", false, $result['error'] ?? 'Unknown error');
            }
        } catch (Exception $e) {
            $this->logResult("Blog generation test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testProposalGeneration() {
        echo "📋 Testing Proposal Generation...\n";
        
        try {
            $clientData = [
                'name' => 'Test Client',
                'business' => 'Tech Startup',
                'budget' => '$500-1000'
            ];
            
            $result = $this->openai->generateClientProposal(
                $clientData,
                'Logo Design',
                'Need a professional logo for a new tech startup focusing on AI solutions'
            );
            
            if ($result['success']) {
                $cost = $result['cost'] ?? 0;
                $this->logResult("Proposal generation successful", true, "Cost: $" . number_format($cost, 4));
                
                // Check if proposal contains client name
                $proposalContent = json_encode($result['data']);
                if (strpos($proposalContent, 'Test Client') !== false) {
                    $this->logResult("Proposal personalization working", true);
                } else {
                    $this->logResult("Proposal personalization failed", false, "Client name not found in proposal");
                }
                
            } else {
                $this->logResult("Proposal generation failed", false, $result['error'] ?? 'Unknown error');
            }
        } catch (Exception $e) {
            $this->logResult("Proposal generation test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testSupportChat() {
        echo "💬 Testing Support Chat...\n";
        
        try {
            $testMessages = [
                "What services do you offer?",
                "How much does logo design cost?",
                "What's your turnaround time?",
                "Do you offer revisions?"
            ];
            
            foreach ($testMessages as $index => $message) {
                $result = $this->openai->generateSupportResponse($message, [
                    'test_context' => true,
                    'message_number' => $index + 1
                ]);
                
                if ($result['success']) {
                    $response = $result['data']['response'] ?? '';
                    $cost = $result['cost'] ?? 0;
                    
                    if (strlen($response) > 50) {
                        $this->logResult("Chat response {$index + 1} generated", true, 
                            "Length: " . strlen($response) . " chars, Cost: $" . number_format($cost, 4));
                    } else {
                        $this->logResult("Chat response {$index + 1} too short", false, 
                            "Length: " . strlen($response) . " chars");
                    }
                } else {
                    $this->logResult("Chat response {$index + 1} failed", false, $result['error'] ?? 'Unknown error');
                }
                
                // Small delay to avoid rate limiting
                usleep(500000); // 0.5 seconds
            }
            
        } catch (Exception $e) {
            $this->logResult("Support chat test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testSEOOptimization() {
        echo "🔍 Testing SEO Optimization...\n";
        
        try {
            $testContent = "This is a sample blog post about logo design. Logo design is important for businesses. A good logo helps with branding and recognition.";
            
            $result = $this->openai->optimizeContentForSEO(
                $testContent,
                ['logo design', 'branding', 'business identity'],
                'blog'
            );
            
            if ($result['success']) {
                $data = $result['data'];
                $cost = $result['cost'] ?? 0;
                
                $this->logResult("SEO optimization successful", true, "Cost: $" . number_format($cost, 4));
                
                // Check if optimized content is longer
                $originalLength = strlen($testContent);
                $optimizedLength = strlen($data['optimized_content'] ?? '');
                
                if ($optimizedLength > $originalLength) {
                    $this->logResult("Content optimization effective", true, 
                        "Original: {$originalLength} chars, Optimized: {$optimizedLength} chars");
                } else {
                    $this->logResult("Content optimization minimal", false, 
                        "No significant improvement in content length");
                }
                
                // Check for SEO score
                if (isset($data['seo_score']) && $data['seo_score'] > 0) {
                    $this->logResult("SEO scoring working", true, "Score: " . $data['seo_score'] . "/10");
                } else {
                    $this->logResult("SEO scoring missing", false);
                }
                
            } else {
                $this->logResult("SEO optimization failed", false, $result['error'] ?? 'Unknown error');
            }
        } catch (Exception $e) {
            $this->logResult("SEO optimization test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function testRateLimiting() {
        echo "⏱️ Testing Rate Limiting...\n";
        
        try {
            // Check current rate limit settings
            $rateLimit = $_ENV['AI_RATE_LIMIT_PER_HOUR'] ?? 100;
            $this->logResult("Rate limit configured", true, "{$rateLimit} requests/hour");
            
            // Test rate limit tracking
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM ai_usage_log WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $recentRequests = $result['count'];
            
            $this->logResult("Rate limit tracking", true, "{$recentRequests} requests in last hour");
            
            if ($recentRequests < $rateLimit * 0.8) {
                $this->logResult("Rate limit healthy", true, "Well below limit");
            } else {
                $this->logResult("Rate limit approaching", false, "Close to hourly limit");
            }
            
        } catch (Exception $e) {
            $this->logResult("Rate limiting test failed", false, $e->getMessage());
        }
        
        echo "\n";
    }
    
    private function logResult($test, $success, $details = '') {
        $status = $success ? "✅ PASS" : "❌ FAIL";
        $message = "{$status} - {$test}";
        
        if ($details) {
            $message .= " ({$details})";
        }
        
        echo "  {$message}\n";
        
        $this->results[] = [
            'test' => $test,
            'success' => $success,
            'details' => $details
        ];
    }
    
    private function printSummary() {
        echo "📊 Test Summary\n";
        echo "===============\n";
        
        $totalTests = count($this->results);
        $passedTests = count(array_filter($this->results, function($r) { return $r['success']; }));
        $failedTests = $totalTests - $passedTests;
        
        echo "Total Tests: {$totalTests}\n";
        echo "✅ Passed: {$passedTests}\n";
        echo "❌ Failed: {$failedTests}\n";
        echo "Success Rate: " . round(($passedTests / $totalTests) * 100, 1) . "%\n\n";
        
        if ($failedTests > 0) {
            echo "❌ Failed Tests:\n";
            foreach ($this->results as $result) {
                if (!$result['success']) {
                    echo "  - {$result['test']}";
                    if ($result['details']) {
                        echo " ({$result['details']})";
                    }
                    echo "\n";
                }
            }
            echo "\n";
        }
        
        // Overall assessment
        if ($passedTests / $totalTests >= 0.9) {
            echo "🎉 AI Integration Status: EXCELLENT - Ready for production!\n";
        } elseif ($passedTests / $totalTests >= 0.7) {
            echo "✅ AI Integration Status: GOOD - Minor issues to address\n";
        } elseif ($passedTests / $totalTests >= 0.5) {
            echo "⚠️ AI Integration Status: NEEDS WORK - Several issues to fix\n";
        } else {
            echo "❌ AI Integration Status: CRITICAL - Major issues need immediate attention\n";
        }
        
        echo "\n";
        echo "💡 Next Steps:\n";
        echo "1. Fix any failed tests above\n";
        echo "2. Monitor costs and usage in admin panel\n";
        echo "3. Test chat widget on your website\n";
        echo "4. Generate sample content and review quality\n";
        echo "5. Set up monitoring alerts for budget limits\n";
    }
}

// Run tests
try {
    $tester = new AIIntegrationTester();
    $tester->runAllTests();
} catch (Exception $e) {
    echo "❌ Critical Error: " . $e->getMessage() . "\n";
    echo "Please check your configuration and try again.\n";
}
?>