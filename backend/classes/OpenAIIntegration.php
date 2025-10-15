<?php
/**
 * OpenAI Integration Class
 * Handles GPT-4 API calls for content generation and client communication
 * Optimized for shared hosting with budget tracking and caching
 */

require_once __DIR__ . '/../config/database.php';

class OpenAIIntegration {
    private $db;
    private $apiKey;
    private $baseUrl = 'https://api.openai.com/v1';
    private $model = 'gpt-4o-mini'; // Cost-effective model
    private $monthlyBudget;
    private $currentSpend;
    
    // Cost per 1K tokens (as of 2024)
    private const INPUT_COST_PER_1K = 0.00015;  // $0.00015 per 1K input tokens
    private const OUTPUT_COST_PER_1K = 0.0006;  // $0.0006 per 1K output tokens
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->apiKey = $_ENV['OPENAI_API_KEY'] ?? null;
        $this->monthlyBudget = floatval($_ENV['AI_MONTHLY_BUDGET'] ?? 50); // $50 default
        $this->loadCurrentSpend();
        
        if (!$this->apiKey) {
            error_log('OpenAI API key not configured');
        }
    }
    
    /**
     * Generate blog content with SEO optimization
     */
    public function generateBlogContent($topic, $keywords = [], $tone = 'professional', $length = 'medium') {
        if (!$this->canMakeAPICall(5.0)) { // Estimate $5 max cost
            return $this->getErrorResponse('Monthly AI budget exceeded');
        }
        
        // Check cache first
        $cacheKey = 'blog_' . md5($topic . implode(',', $keywords) . $tone . $length);
        $cached = $this->getCachedResponse($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        $keywordString = !empty($keywords) ? implode(', ', $keywords) : '';
        $lengthMap = [
            'short' => '800-1200 words',
            'medium' => '1500-2000 words', 
            'long' => '2500-3000 words'
        ];
        
        $prompt = "Write a comprehensive blog post about '{$topic}' for a professional design services website (Adil GFX).

Target keywords: {$keywordString}
Tone: {$tone}
Length: {$lengthMap[$length]}

Requirements:
- SEO-optimized with natural keyword integration
- Include actionable tips and insights
- Add relevant examples from design/YouTube/branding industry
- Structure with clear headings (H2, H3)
- Include a compelling introduction and conclusion
- Add call-to-action related to design services
- Write in a way that establishes expertise and builds trust

Format the response as JSON with these fields:
- title: SEO-optimized title
- meta_description: 150-160 character meta description
- content: Full blog post content in HTML format
- excerpt: 2-3 sentence summary
- tags: Array of relevant tags
- estimated_read_time: Reading time in minutes";

        try {
            $response = $this->makeAPICall([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert content writer specializing in design, branding, and digital marketing. You create engaging, SEO-optimized content that converts readers into clients.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 3000,
                'temperature' => 0.7
            ]);
            
            if ($response['success']) {
                $content = $response['data']['choices'][0]['message']['content'];
                
                // Try to parse as JSON, fallback to plain text
                $parsedContent = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $result = [
                        'success' => true,
                        'data' => $parsedContent,
                        'usage' => $response['data']['usage'] ?? null,
                        'cost' => $this->calculateCost($response['data']['usage'] ?? [])
                    ];
                } else {
                    // Fallback for non-JSON response
                    $result = [
                        'success' => true,
                        'data' => [
                            'title' => $this->extractTitle($content, $topic),
                            'content' => $this->formatContent($content),
                            'meta_description' => $this->generateMetaDescription($content),
                            'excerpt' => $this->extractExcerpt($content),
                            'tags' => $keywords,
                            'estimated_read_time' => $this->estimateReadTime($content)
                        ],
                        'usage' => $response['data']['usage'] ?? null,
                        'cost' => $this->calculateCost($response['data']['usage'] ?? [])
                    ];
                }
                
                // Cache the response
                $this->cacheResponse($cacheKey, $result);
                
                // Track usage
                $this->trackUsage('blog_generation', $result['cost'], $response['data']['usage'] ?? []);
                
                return $result;
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log('OpenAI Blog Generation Error: ' . $e->getMessage());
            return $this->getErrorResponse('Failed to generate blog content: ' . $e->getMessage());
        }
    }
    
    /**
     * Generate personalized client proposals
     */
    public function generateClientProposal($clientData, $serviceType, $requirements) {
        if (!$this->canMakeAPICall(3.0)) {
            return $this->getErrorResponse('Monthly AI budget exceeded');
        }
        
        $cacheKey = 'proposal_' . md5(json_encode($clientData) . $serviceType . $requirements);
        $cached = $this->getCachedResponse($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        $clientName = $clientData['name'] ?? 'Valued Client';
        $clientBusiness = $clientData['business'] ?? 'your business';
        $budget = $clientData['budget'] ?? 'your budget';
        
        $prompt = "Create a personalized project proposal for a design client.

Client Details:
- Name: {$clientName}
- Business: {$clientBusiness}
- Service Needed: {$serviceType}
- Budget Range: {$budget}
- Requirements: {$requirements}

Create a professional proposal that includes:
1. Personalized greeting and understanding of their needs
2. Proposed solution tailored to their requirements
3. Project timeline and deliverables
4. Pricing structure (be specific but flexible)
5. Why Adil GFX is the right choice
6. Next steps and call-to-action

Tone: Professional, confident, and client-focused
Length: 800-1200 words

Format as JSON with:
- subject: Email subject line
- greeting: Personalized opening
- solution: Detailed project approach
- timeline: Project phases and timeline
- pricing: Pricing breakdown
- why_us: Why choose Adil GFX
- next_steps: Clear next steps
- closing: Professional closing";

        try {
            $response = $this->makeAPICall([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional design consultant who creates compelling proposals that convert prospects into clients. You understand design services, pricing, and client psychology.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 2000,
                'temperature' => 0.8
            ]);
            
            if ($response['success']) {
                $content = $response['data']['choices'][0]['message']['content'];
                $parsedContent = json_decode($content, true);
                
                $result = [
                    'success' => true,
                    'data' => $parsedContent ?: ['content' => $content],
                    'usage' => $response['data']['usage'] ?? null,
                    'cost' => $this->calculateCost($response['data']['usage'] ?? [])
                ];
                
                $this->cacheResponse($cacheKey, $result);
                $this->trackUsage('proposal_generation', $result['cost'], $response['data']['usage'] ?? []);
                
                return $result;
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log('OpenAI Proposal Generation Error: ' . $e->getMessage());
            return $this->getErrorResponse('Failed to generate proposal: ' . $e->getMessage());
        }
    }
    
    /**
     * Generate customer support responses
     */
    public function generateSupportResponse($customerMessage, $context = []) {
        if (!$this->canMakeAPICall(1.0)) {
            return $this->getErrorResponse('Monthly AI budget exceeded');
        }
        
        $cacheKey = 'support_' . md5($customerMessage . json_encode($context));
        $cached = $this->getCachedResponse($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        $contextString = '';
        if (!empty($context)) {
            $contextString = "Context: " . json_encode($context);
        }
        
        $prompt = "You are a helpful customer support representative for Adil GFX, a professional design services company specializing in logos, YouTube thumbnails, video editing, and branding.

Customer Message: \"{$customerMessage}\"
{$contextString}

Provide a helpful, professional response that:
1. Addresses their specific question or concern
2. Provides actionable information
3. Maintains a friendly, professional tone
4. Includes relevant service information if appropriate
5. Suggests next steps or offers additional help

Services we offer:
- Logo Design (Basic: $199, Standard: $399, Premium: $699)
- YouTube Thumbnails (Single: $49, Pack of 5: $199, Monthly: $599)
- Video Editing (Basic: $299, Professional: $599, Premium: $999)
- Complete Branding Packages (Starting at $899)

Keep response concise (2-3 paragraphs) and helpful.";

        try {
            $response = $this->makeAPICall([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a knowledgeable and friendly customer support representative for a design services company. You provide helpful, accurate information while maintaining a professional tone.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.7
            ]);
            
            if ($response['success']) {
                $content = $response['data']['choices'][0]['message']['content'];
                
                $result = [
                    'success' => true,
                    'data' => [
                        'response' => $content,
                        'suggested_actions' => $this->extractSuggestedActions($content)
                    ],
                    'usage' => $response['data']['usage'] ?? null,
                    'cost' => $this->calculateCost($response['data']['usage'] ?? [])
                ];
                
                $this->cacheResponse($cacheKey, $result);
                $this->trackUsage('support_response', $result['cost'], $response['data']['usage'] ?? []);
                
                return $result;
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log('OpenAI Support Response Error: ' . $e->getMessage());
            return $this->getErrorResponse('Failed to generate support response: ' . $e->getMessage());
        }
    }
    
    /**
     * Optimize existing content for SEO
     */
    public function optimizeContentForSEO($content, $targetKeywords = [], $contentType = 'blog') {
        if (!$this->canMakeAPICall(2.0)) {
            return $this->getErrorResponse('Monthly AI budget exceeded');
        }
        
        $cacheKey = 'seo_optimize_' . md5($content . implode(',', $targetKeywords) . $contentType);
        $cached = $this->getCachedResponse($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        $keywordString = implode(', ', $targetKeywords);
        
        $prompt = "Optimize the following content for SEO while maintaining its quality and readability.

Content Type: {$contentType}
Target Keywords: {$keywordString}

Original Content:
{$content}

Please:
1. Improve keyword density naturally (aim for 1-2% for primary keyword)
2. Enhance headings for better structure
3. Add semantic keywords and related terms
4. Improve meta elements if applicable
5. Suggest internal linking opportunities
6. Maintain the original tone and message

Return as JSON with:
- optimized_content: The improved content
- seo_score: Estimated SEO score (1-10)
- improvements_made: List of specific improvements
- suggested_meta_title: SEO-optimized title
- suggested_meta_description: 150-160 character description
- internal_link_suggestions: Relevant internal pages to link to";

        try {
            $response = $this->makeAPICall([
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an SEO expert who optimizes content for search engines while maintaining readability and user experience. You understand keyword optimization, content structure, and technical SEO.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 2000,
                'temperature' => 0.5
            ]);
            
            if ($response['success']) {
                $content = $response['data']['choices'][0]['message']['content'];
                $parsedContent = json_decode($content, true);
                
                $result = [
                    'success' => true,
                    'data' => $parsedContent ?: ['optimized_content' => $content],
                    'usage' => $response['data']['usage'] ?? null,
                    'cost' => $this->calculateCost($response['data']['usage'] ?? [])
                ];
                
                $this->cacheResponse($cacheKey, $result);
                $this->trackUsage('seo_optimization', $result['cost'], $response['data']['usage'] ?? []);
                
                return $result;
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log('OpenAI SEO Optimization Error: ' . $e->getMessage());
            return $this->getErrorResponse('Failed to optimize content: ' . $e->getMessage());
        }
    }
    
    /**
     * Make API call to OpenAI
     */
    private function makeAPICall($data) {
        if (!$this->apiKey) {
            return $this->getErrorResponse('OpenAI API key not configured');
        }
        
        $url = $this->baseUrl . '/chat/completions';
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'User-Agent: AdilGFX/1.0'
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return $this->getErrorResponse('cURL Error: ' . $error);
        }
        
        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['error']['message'] ?? 'HTTP Error ' . $httpCode;
            return $this->getErrorResponse($errorMessage);
        }
        
        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->getErrorResponse('Invalid JSON response from OpenAI');
        }
        
        return [
            'success' => true,
            'data' => $decodedResponse
        ];
    }
    
    /**
     * Check if we can make an API call within budget
     */
    private function canMakeAPICall($estimatedCost) {
        return ($this->currentSpend + $estimatedCost) <= $this->monthlyBudget;
    }
    
    /**
     * Calculate cost based on token usage
     */
    private function calculateCost($usage) {
        if (empty($usage)) {
            return 0;
        }
        
        $inputTokens = $usage['prompt_tokens'] ?? 0;
        $outputTokens = $usage['completion_tokens'] ?? 0;
        
        $inputCost = ($inputTokens / 1000) * self::INPUT_COST_PER_1K;
        $outputCost = ($outputTokens / 1000) * self::OUTPUT_COST_PER_1K;
        
        return round($inputCost + $outputCost, 6);
    }
    
    /**
     * Track API usage for budget management
     */
    private function trackUsage($operation, $cost, $usage) {
        try {
            $query = "INSERT INTO ai_usage_log (operation, cost, input_tokens, output_tokens, total_tokens, created_at) 
                      VALUES (:operation, :cost, :input_tokens, :output_tokens, :total_tokens, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':operation' => $operation,
                ':cost' => $cost,
                ':input_tokens' => $usage['prompt_tokens'] ?? 0,
                ':output_tokens' => $usage['completion_tokens'] ?? 0,
                ':total_tokens' => $usage['total_tokens'] ?? 0
            ]);
            
            $this->currentSpend += $cost;
            
        } catch (Exception $e) {
            error_log('Failed to track AI usage: ' . $e->getMessage());
        }
    }
    
    /**
     * Load current month's spending
     */
    private function loadCurrentSpend() {
        try {
            $query = "SELECT COALESCE(SUM(cost), 0) as total_spend 
                      FROM ai_usage_log 
                      WHERE YEAR(created_at) = YEAR(CURDATE()) 
                      AND MONTH(created_at) = MONTH(CURDATE())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->currentSpend = floatval($result['total_spend'] ?? 0);
            
        } catch (Exception $e) {
            error_log('Failed to load current AI spend: ' . $e->getMessage());
            $this->currentSpend = 0;
        }
    }
    
    /**
     * Cache response to reduce API calls
     */
    private function cacheResponse($key, $data, $ttl = 86400) {
        try {
            $query = "INSERT INTO ai_response_cache (cache_key, response_data, expires_at) 
                      VALUES (:key, :data, DATE_ADD(NOW(), INTERVAL :ttl SECOND))
                      ON DUPLICATE KEY UPDATE 
                      response_data = VALUES(response_data), 
                      expires_at = VALUES(expires_at)";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':key' => $key,
                ':data' => json_encode($data),
                ':ttl' => $ttl
            ]);
            
        } catch (Exception $e) {
            error_log('Failed to cache AI response: ' . $e->getMessage());
        }
    }
    
    /**
     * Get cached response
     */
    private function getCachedResponse($key) {
        try {
            $query = "SELECT response_data FROM ai_response_cache 
                      WHERE cache_key = :key AND expires_at > NOW()";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([':key' => $key]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return json_decode($result['response_data'], true);
            }
            
        } catch (Exception $e) {
            error_log('Failed to get cached AI response: ' . $e->getMessage());
        }
        
        return null;
    }
    
    /**
     * Get current usage statistics
     */
    public function getUsageStats() {
        try {
            $query = "SELECT 
                        COUNT(*) as total_calls,
                        SUM(cost) as total_cost,
                        SUM(input_tokens) as total_input_tokens,
                        SUM(output_tokens) as total_output_tokens,
                        operation,
                        DATE(created_at) as date
                      FROM ai_usage_log 
                      WHERE YEAR(created_at) = YEAR(CURDATE()) 
                      AND MONTH(created_at) = MONTH(CURDATE())
                      GROUP BY operation, DATE(created_at)
                      ORDER BY created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => [
                    'current_spend' => $this->currentSpend,
                    'monthly_budget' => $this->monthlyBudget,
                    'remaining_budget' => $this->monthlyBudget - $this->currentSpend,
                    'usage_by_operation' => $results
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Failed to get AI usage stats: ' . $e->getMessage());
            return $this->getErrorResponse('Failed to get usage statistics');
        }
    }
    
    // Helper methods for content processing
    private function extractTitle($content, $fallback) {
        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/i', $content, $matches)) {
            return strip_tags($matches[1]);
        }
        if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
            return trim($matches[1]);
        }
        return $fallback;
    }
    
    private function formatContent($content) {
        // Convert markdown-style headers to HTML
        $content = preg_replace('/^### (.+)$/m', '<h3>$1</h3>', $content);
        $content = preg_replace('/^## (.+)$/m', '<h2>$1</h2>', $content);
        $content = preg_replace('/^# (.+)$/m', '<h1>$1</h1>', $content);
        
        // Convert line breaks to paragraphs
        $content = nl2br($content);
        
        return $content;
    }
    
    private function generateMetaDescription($content) {
        $text = strip_tags($content);
        $sentences = preg_split('/[.!?]+/', $text);
        $description = '';
        
        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if (strlen($description . $sentence) < 150 && !empty($sentence)) {
                $description .= $sentence . '. ';
            } else {
                break;
            }
        }
        
        return trim($description);
    }
    
    private function extractExcerpt($content) {
        $text = strip_tags($content);
        $sentences = array_slice(preg_split('/[.!?]+/', $text), 0, 3);
        return implode('. ', array_filter($sentences)) . '.';
    }
    
    private function estimateReadTime($content) {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, round($wordCount / 200)); // 200 words per minute
    }
    
    private function extractSuggestedActions($content) {
        $actions = [];
        
        if (stripos($content, 'contact') !== false || stripos($content, 'get in touch') !== false) {
            $actions[] = 'contact_form';
        }
        if (stripos($content, 'quote') !== false || stripos($content, 'estimate') !== false) {
            $actions[] = 'request_quote';
        }
        if (stripos($content, 'portfolio') !== false || stripos($content, 'examples') !== false) {
            $actions[] = 'view_portfolio';
        }
        if (stripos($content, 'service') !== false || stripos($content, 'package') !== false) {
            $actions[] = 'view_services';
        }
        
        return $actions;
    }
    
    private function getErrorResponse($message) {
        return [
            'success' => false,
            'error' => $message
        ];
    }
}