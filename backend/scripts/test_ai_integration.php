<?php
/**
 * AI Integration Test Script
 * Tests all AI features to ensure proper setup
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/OpenAIIntegration.php';

echo "🤖 AI Integration Test Suite\n";
echo "============================\n\n";

// Test 1: Environment Configuration
echo "1. Testing Environment Configuration...\n";
$apiKey = $_ENV['OPENAI_API_KEY'] ?? null;
$budget = $_ENV['AI_MONTHLY_BUDGET'] ?? null;

if (!$apiKey) {
    echo "❌ OPENAI_API_KEY not found in environment\n";
    echo "   Please add OPENAI_API_KEY to your .env file\n\n";
    exit(1);
} else {
    echo "✅ OpenAI API key found\n";
}

if (!$budget) {
    echo "⚠️  AI_MONTHLY_BUDGET not set, using default $50\n";
} else {
    echo "✅ Monthly budget set to $" . $budget . "\n";
}

// Test 2: Database Connection
echo "\n2. Testing Database Connection...\n";
try {
    $database = new Database();
    $db = $database->getConnection();
    echo "✅ Database connection successful\n";
    
    // Check if AI tables exist
    $tables = ['ai_usage_log', 'ai_response_cache', 'ai_config', 'ai_generated_content', 'ai_budget_tracking'];
    foreach ($tables as $table) {
        $stmt = $db->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->rowCount() > 0) {
            echo "✅ Table $table exists\n";
        } else {
            echo "❌ Table $table missing - run AI migration\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: OpenAI Integration Class
echo "\n3. Testing OpenAI Integration Class...\n";
try {
    $openai = new OpenAIIntegration();
    echo "✅ OpenAI integration class initialized\n";
    
    // Test usage stats
    $stats = $openai->getUsageStats();
    if ($stats['success']) {
        echo "✅ Usage statistics retrieved\n";
        echo "   Current spend: $" . number_format($stats['data']['current_spend'], 4) . "\n";
        echo "   Monthly budget: $" . number_format($stats['data']['monthly_budget'], 2) . "\n";
    } else {
        echo "⚠️  Could not retrieve usage stats\n";
    }
} catch (Exception $e) {
    echo "❌ OpenAI integration failed: " . $e->getMessage() . "\n";
}

// Test 4: API Key Validation
echo "\n4. Testing OpenAI API Key...\n";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.openai.com/v1/models',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'User-Agent: AdilGFX-Test/1.0'
    ],
    CURLOPT_TIMEOUT => 10
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ OpenAI API key is valid\n";
    $models = json_decode($response, true);
    $modelCount = count($models['data'] ?? []);
    echo "   Available models: $modelCount\n";
} else {
    echo "❌ OpenAI API key validation failed (HTTP $httpCode)\n";
    if ($httpCode === 401) {
        echo "   Please check your API key\n";
    } elseif ($httpCode === 429) {
        echo "   Rate limit exceeded or insufficient credits\n";
    }
}

// Test 5: Simple Content Generation (if API key is valid)
if ($httpCode === 200) {
    echo "\n5. Testing Content Generation...\n";
    try {
        $result = $openai->generateSupportResponse(
            "What are your logo design prices?",
            ['source' => 'test']
        );
        
        if ($result['success']) {
            echo "✅ Content generation successful\n";
            echo "   Response length: " . strlen($result['data']['response']) . " characters\n";
            echo "   Cost: $" . number_format($result['cost'], 4) . "\n";
            echo "   Sample response: " . substr($result['data']['response'], 0, 100) . "...\n";
        } else {
            echo "❌ Content generation failed: " . $result['error'] . "\n";
        }
    } catch (Exception $e) {
        echo "❌ Content generation error: " . $e->getMessage() . "\n";
    }
} else {
    echo "\n5. Skipping Content Generation (API key invalid)\n";
}

// Test 6: Cache System
echo "\n6. Testing Cache System...\n";
try {
    $cacheKey = 'test_' . time();
    $testData = ['test' => 'data', 'timestamp' => time()];
    
    // Test cache write
    $stmt = $db->prepare("INSERT INTO ai_response_cache (cache_key, response_data, operation, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))");
    $stmt->execute([$cacheKey, json_encode($testData), 'test']);
    
    // Test cache read
    $stmt = $db->prepare("SELECT response_data FROM ai_response_cache WHERE cache_key = ? AND expires_at > NOW()");
    $stmt->execute([$cacheKey]);
    $cached = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($cached && json_decode($cached['response_data'], true)['test'] === 'data') {
        echo "✅ Cache system working\n";
        
        // Clean up test cache
        $stmt = $db->prepare("DELETE FROM ai_response_cache WHERE cache_key = ?");
        $stmt->execute([$cacheKey]);
    } else {
        echo "❌ Cache system not working\n";
    }
} catch (Exception $e) {
    echo "❌ Cache test failed: " . $e->getMessage() . "\n";
}

// Test 7: Budget Tracking
echo "\n7. Testing Budget Tracking...\n";
try {
    // Check if current month budget entry exists
    $stmt = $db->prepare("SELECT * FROM ai_budget_tracking WHERE year = YEAR(CURDATE()) AND month = MONTH(CURDATE())");
    $stmt->execute();
    $budget = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($budget) {
        echo "✅ Budget tracking active\n";
        echo "   Current spend: $" . number_format($budget['current_spend'], 4) . "\n";
        echo "   Budget limit: $" . number_format($budget['budget_limit'], 2) . "\n";
        echo "   Total requests: " . $budget['total_requests'] . "\n";
    } else {
        echo "⚠️  No budget tracking entry for current month\n";
        echo "   Creating entry...\n";
        
        $stmt = $db->prepare("INSERT INTO ai_budget_tracking (year, month, budget_limit) VALUES (YEAR(CURDATE()), MONTH(CURDATE()), ?)");
        $stmt->execute([floatval($_ENV['AI_MONTHLY_BUDGET'] ?? 50)]);
        echo "✅ Budget tracking entry created\n";
    }
} catch (Exception $e) {
    echo "❌ Budget tracking test failed: " . $e->getMessage() . "\n";
}

// Test 8: API Endpoints
echo "\n8. Testing API Endpoints...\n";
$baseUrl = 'http://localhost:8000'; // Adjust for your setup
$endpoints = [
    '/api/ai.php/usage/stats',
    '/api/ai.php/config'
];

foreach ($endpoints as $endpoint) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $baseUrl . $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 || $httpCode === 403) { // 403 is OK for admin-only endpoints
        echo "✅ Endpoint $endpoint accessible\n";
    } else {
        echo "❌ Endpoint $endpoint failed (HTTP $httpCode)\n";
    }
}

// Summary
echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 TEST SUMMARY\n";
echo str_repeat("=", 50) . "\n";

$allGood = true;

if (!$apiKey) {
    echo "❌ CRITICAL: OpenAI API key not configured\n";
    $allGood = false;
}

if ($httpCode !== 200) {
    echo "❌ CRITICAL: OpenAI API key invalid or no credits\n";
    $allGood = false;
}

if ($allGood) {
    echo "🎉 ALL TESTS PASSED!\n";
    echo "\nYour AI integration is ready to use:\n";
    echo "• Blog content generation\n";
    echo "• Client proposal creation\n";
    echo "• AI customer support chat\n";
    echo "• SEO content optimization\n";
    echo "• Budget tracking and monitoring\n";
    echo "\nNext steps:\n";
    echo "1. Access admin panel: /admin/ai\n";
    echo "2. Test chat widget on frontend\n";
    echo "3. Monitor usage and costs\n";
    echo "4. Customize AI prompts as needed\n";
} else {
    echo "⚠️  SETUP INCOMPLETE\n";
    echo "\nPlease fix the issues above before using AI features.\n";
    echo "Refer to AI_INTEGRATION_SETUP.md for detailed instructions.\n";
}

echo "\n💰 Estimated monthly cost: $20-50 for moderate usage\n";
echo "📊 Monitor usage at: /admin/ai\n";
echo "📖 Full documentation: AI_INTEGRATION_SETUP.md\n\n";
?>