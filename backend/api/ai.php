<?php
/**
 * AI Operations API Endpoint
 * Handles AI content generation, chat support, and optimization requests
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../classes/OpenAIIntegration.php';

// Initialize
$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);
$openai = new OpenAIIntegration();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$path = trim($path, '/');

// Parse request body
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Rate limiting check
function checkRateLimit($db, $identifier, $limit = 100, $window = 3600) {
    try {
        $query = "SELECT COUNT(*) as request_count 
                  FROM ai_usage_log 
                  WHERE (ip_address = :identifier OR user_id = :identifier)
                  AND created_at > DATE_SUB(NOW(), INTERVAL :window SECOND)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':identifier' => $identifier,
            ':window' => $window
        ]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($result['request_count'] ?? 0) < $limit;
        
    } catch (Exception $e) {
        error_log('Rate limit check failed: ' . $e->getMessage());
        return true; // Allow on error
    }
}

// Log request
function logRequest($db, $operation, $userId = null) {
    try {
        $query = "INSERT INTO ai_usage_log (operation, user_id, ip_address, user_agent, created_at) 
                  VALUES (:operation, :user_id, :ip_address, :user_agent, NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':operation' => $operation . '_request',
            ':user_id' => $userId,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
        
    } catch (Exception $e) {
        error_log('Failed to log AI request: ' . $e->getMessage());
    }
}

// Response helper
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Error response helper
function sendError($message, $code = 400) {
    sendResponse(['success' => false, 'error' => $message], $code);
}

// Get user info (optional authentication)
$user = null;
$userId = null;
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (!empty($authHeader) && strpos($authHeader, 'Bearer ') === 0) {
    $token = substr($authHeader, 7);
    $userData = $auth->verifyToken($token);
    if ($userData) {
        $user = $userData;
        $userId = $user['id'] ?? null;
    }
}

// Rate limiting
$identifier = $userId ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!checkRateLimit($db, $identifier)) {
    sendError('Rate limit exceeded. Please try again later.', 429);
}

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($path, $openai, $db, $user);
        break;
        
    case 'POST':
        handlePostRequest($path, $input, $openai, $db, $user, $userId);
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleGetRequest($path, $openai, $db, $user) {
    switch ($path) {
        case 'usage':
        case 'usage/stats':
            // Get AI usage statistics
            $stats = $openai->getUsageStats();
            sendResponse($stats);
            break;
            
        case 'config':
            // Get AI configuration (admin only)
            if (!$user || ($user['role'] ?? '') !== 'admin') {
                sendError('Admin access required', 403);
            }
            
            try {
                $query = "SELECT config_key, config_value, description, is_active 
                          FROM ai_config 
                          WHERE is_active = TRUE 
                          ORDER BY config_key";
                
                $stmt = $db->prepare($query);
                $stmt->execute();
                $config = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                sendResponse(['success' => true, 'data' => $config]);
                
            } catch (Exception $e) {
                sendError('Failed to fetch AI configuration: ' . $e->getMessage(), 500);
            }
            break;
            
        case 'cache/stats':
            // Get cache statistics
            try {
                $query = "SELECT * FROM ai_cache_stats";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $cacheStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                sendResponse(['success' => true, 'data' => $cacheStats]);
                
            } catch (Exception $e) {
                sendError('Failed to fetch cache statistics: ' . $e->getMessage(), 500);
            }
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

function handlePostRequest($path, $input, $openai, $db, $user, $userId) {
    // Log the request
    logRequest($db, $path, $userId);
    
    switch ($path) {
        case 'generate/blog':
            handleBlogGeneration($input, $openai, $db, $userId);
            break;
            
        case 'generate/proposal':
            handleProposalGeneration($input, $openai, $db, $userId);
            break;
            
        case 'chat/support':
            handleSupportChat($input, $openai, $db, $userId);
            break;
            
        case 'optimize/seo':
            handleSEOOptimization($input, $openai, $db, $userId);
            break;
            
        case 'generate/meta':
            handleMetaGeneration($input, $openai, $db, $userId);
            break;
            
        case 'analyze/content':
            handleContentAnalysis($input, $openai, $db, $userId);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

function handleBlogGeneration($input, $openai, $db, $userId) {
    // Validate input
    $topic = $input['topic'] ?? '';
    $keywords = $input['keywords'] ?? [];
    $tone = $input['tone'] ?? 'professional';
    $length = $input['length'] ?? 'medium';
    
    if (empty($topic)) {
        sendError('Topic is required');
    }
    
    if (!in_array($tone, ['professional', 'casual', 'technical', 'friendly'])) {
        $tone = 'professional';
    }
    
    if (!in_array($length, ['short', 'medium', 'long'])) {
        $length = 'medium';
    }
    
    try {
        $result = $openai->generateBlogContent($topic, $keywords, $tone, $length);
        
        if ($result['success']) {
            // Save generated content
            saveGeneratedContent($db, 'blog', null, 'blog_generation', 
                               json_encode($input), json_encode($result['data']), 
                               $result['cost'], $result['usage']['total_tokens'] ?? 0, $userId);
        }
        
        sendResponse($result);
        
    } catch (Exception $e) {
        error_log('Blog generation error: ' . $e->getMessage());
        sendError('Failed to generate blog content: ' . $e->getMessage(), 500);
    }
}

function handleProposalGeneration($input, $openai, $db, $userId) {
    // Validate input
    $clientData = $input['client_data'] ?? [];
    $serviceType = $input['service_type'] ?? '';
    $requirements = $input['requirements'] ?? '';
    
    if (empty($clientData) || empty($serviceType) || empty($requirements)) {
        sendError('Client data, service type, and requirements are required');
    }
    
    try {
        $result = $openai->generateClientProposal($clientData, $serviceType, $requirements);
        
        if ($result['success']) {
            // Save generated content
            saveGeneratedContent($db, 'proposal', null, 'proposal_generation', 
                               json_encode($input), json_encode($result['data']), 
                               $result['cost'], $result['usage']['total_tokens'] ?? 0, $userId);
        }
        
        sendResponse($result);
        
    } catch (Exception $e) {
        error_log('Proposal generation error: ' . $e->getMessage());
        sendError('Failed to generate proposal: ' . $e->getMessage(), 500);
    }
}

function handleSupportChat($input, $openai, $db, $userId) {
    // Validate input
    $message = $input['message'] ?? '';
    $sessionId = $input['session_id'] ?? '';
    $context = $input['context'] ?? [];
    
    if (empty($message)) {
        sendError('Message is required');
    }
    
    // Create session if not provided
    if (empty($sessionId)) {
        $sessionId = 'chat_' . uniqid() . '_' . time();
        
        // Create new chat session
        try {
            $query = "INSERT INTO ai_chat_sessions (session_id, user_id, visitor_id, status) 
                      VALUES (:session_id, :user_id, :visitor_id, 'active')";
            
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':session_id' => $sessionId,
                ':user_id' => $userId,
                ':visitor_id' => $userId ? null : ($_SERVER['REMOTE_ADDR'] ?? 'unknown')
            ]);
            
        } catch (Exception $e) {
            error_log('Failed to create chat session: ' . $e->getMessage());
        }
    }
    
    try {
        // Save user message
        saveChatMessage($db, $sessionId, 'user', $message);
        
        // Generate AI response
        $result = $openai->generateSupportResponse($message, $context);
        
        if ($result['success']) {
            $aiResponse = $result['data']['response'] ?? '';
            $suggestedActions = $result['data']['suggested_actions'] ?? [];
            
            // Save AI response
            saveChatMessage($db, $sessionId, 'ai', $aiResponse, 
                          null, $result['usage']['total_tokens'] ?? 0, $result['cost']);
            
            // Update session stats
            updateChatSession($db, $sessionId, $result['cost']);
            
            sendResponse([
                'success' => true,
                'data' => [
                    'session_id' => $sessionId,
                    'response' => $aiResponse,
                    'suggested_actions' => $suggestedActions,
                    'cost' => $result['cost']
                ]
            ]);
        } else {
            sendResponse($result);
        }
        
    } catch (Exception $e) {
        error_log('Support chat error: ' . $e->getMessage());
        sendError('Failed to generate support response: ' . $e->getMessage(), 500);
    }
}

function handleSEOOptimization($input, $openai, $db, $userId) {
    // Validate input
    $content = $input['content'] ?? '';
    $keywords = $input['keywords'] ?? [];
    $contentType = $input['content_type'] ?? 'blog';
    
    if (empty($content)) {
        sendError('Content is required');
    }
    
    try {
        $result = $openai->optimizeContentForSEO($content, $keywords, $contentType);
        
        if ($result['success']) {
            // Save generated content
            saveGeneratedContent($db, 'seo_optimization', null, 'seo_optimization', 
                               json_encode($input), json_encode($result['data']), 
                               $result['cost'], $result['usage']['total_tokens'] ?? 0, $userId);
        }
        
        sendResponse($result);
        
    } catch (Exception $e) {
        error_log('SEO optimization error: ' . $e->getMessage());
        sendError('Failed to optimize content: ' . $e->getMessage(), 500);
    }
}

function handleMetaGeneration($input, $openai, $db, $userId) {
    // Generate meta titles and descriptions
    $content = $input['content'] ?? '';
    $keywords = $input['keywords'] ?? [];
    
    if (empty($content)) {
        sendError('Content is required');
    }
    
    // Use SEO optimization for meta generation
    try {
        $result = $openai->optimizeContentForSEO($content, $keywords, 'meta');
        sendResponse($result);
        
    } catch (Exception $e) {
        error_log('Meta generation error: ' . $e->getMessage());
        sendError('Failed to generate meta tags: ' . $e->getMessage(), 500);
    }
}

function handleContentAnalysis($input, $openai, $db, $userId) {
    // Analyze content quality and provide suggestions
    $content = $input['content'] ?? '';
    
    if (empty($content)) {
        sendError('Content is required');
    }
    
    // Basic content analysis (can be enhanced with AI)
    $wordCount = str_word_count(strip_tags($content));
    $readingTime = max(1, round($wordCount / 200));
    $sentences = preg_split('/[.!?]+/', strip_tags($content));
    $avgSentenceLength = $wordCount / max(1, count($sentences));
    
    $analysis = [
        'word_count' => $wordCount,
        'reading_time' => $reading_time,
        'sentence_count' => count($sentences),
        'avg_sentence_length' => round($avgSentenceLength, 1),
        'readability_score' => calculateReadabilityScore($content),
        'suggestions' => generateContentSuggestions($content, $wordCount, $avgSentenceLength)
    ];
    
    sendResponse(['success' => true, 'data' => $analysis]);
}

// Helper functions
function saveGeneratedContent($db, $contentType, $contentId, $operation, $prompt, $generated, $cost, $tokens, $userId) {
    try {
        $query = "INSERT INTO ai_generated_content 
                  (content_type, content_id, ai_operation, original_prompt, generated_content, 
                   tokens_used, cost, created_by) 
                  VALUES (:type, :content_id, :operation, :prompt, :generated, :tokens, :cost, :user_id)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':type' => $contentType,
            ':content_id' => $contentId,
            ':operation' => $operation,
            ':prompt' => $prompt,
            ':generated' => $generated,
            ':tokens' => $tokens,
            ':cost' => $cost,
            ':user_id' => $userId
        ]);
        
    } catch (Exception $e) {
        error_log('Failed to save generated content: ' . $e->getMessage());
    }
}

function saveChatMessage($db, $sessionId, $messageType, $content, $confidence = null, $tokens = null, $cost = null) {
    try {
        $query = "INSERT INTO ai_chat_messages 
                  (session_id, message_type, message_content, ai_confidence, tokens_used, cost) 
                  VALUES (:session_id, :type, :content, :confidence, :tokens, :cost)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':session_id' => $sessionId,
            ':type' => $messageType,
            ':content' => $content,
            ':confidence' => $confidence,
            ':tokens' => $tokens,
            ':cost' => $cost
        ]);
        
    } catch (Exception $e) {
        error_log('Failed to save chat message: ' . $e->getMessage());
    }
}

function updateChatSession($db, $sessionId, $cost) {
    try {
        $query = "UPDATE ai_chat_sessions 
                  SET total_messages = total_messages + 1,
                      ai_responses = ai_responses + 1,
                      total_cost = total_cost + :cost
                  WHERE session_id = :session_id";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':session_id' => $sessionId,
            ':cost' => $cost
        ]);
        
    } catch (Exception $e) {
        error_log('Failed to update chat session: ' . $e->getMessage());
    }
}

function calculateReadabilityScore($content) {
    // Simple readability score based on sentence and word length
    $text = strip_tags($content);
    $words = str_word_count($text);
    $sentences = count(preg_split('/[.!?]+/', $text));
    $syllables = estimateSyllables($text);
    
    if ($sentences == 0 || $words == 0) return 0;
    
    // Flesch Reading Ease approximation
    $score = 206.835 - (1.015 * ($words / $sentences)) - (84.6 * ($syllables / $words));
    return max(0, min(100, round($score, 1)));
}

function estimateSyllables($text) {
    $words = str_word_count($text, 1);
    $syllables = 0;
    
    foreach ($words as $word) {
        $word = strtolower($word);
        $wordSyllables = preg_match_all('/[aeiouy]+/', $word);
        if (substr($word, -1) === 'e') $wordSyllables--;
        $syllables += max(1, $wordSyllables);
    }
    
    return $syllables;
}

function generateContentSuggestions($content, $wordCount, $avgSentenceLength) {
    $suggestions = [];
    
    if ($wordCount < 300) {
        $suggestions[] = "Consider expanding the content. Aim for at least 300 words for better SEO.";
    }
    
    if ($avgSentenceLength > 25) {
        $suggestions[] = "Try to shorten sentences for better readability. Aim for 15-20 words per sentence.";
    }
    
    if ($avgSentenceLength < 10) {
        $suggestions[] = "Consider varying sentence length to improve flow and readability.";
    }
    
    $headingCount = preg_match_all('/<h[1-6][^>]*>/i', $content);
    if ($wordCount > 500 && $headingCount < 2) {
        $suggestions[] = "Add more headings to break up the content and improve structure.";
    }
    
    return $suggestions;
}
?>