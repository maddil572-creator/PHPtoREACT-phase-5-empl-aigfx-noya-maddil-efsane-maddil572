<?php
/**
 * Sample Content Generator
 * Generates sample blog posts and content to test AI integration
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/OpenAIIntegration.php';

class SampleContentGenerator {
    private $openai;
    private $db;
    
    private $sampleTopics = [
        'Logo Design' => [
            'How to Create a Memorable Logo for Your Brand',
            'The Psychology of Colors in Logo Design',
            'Logo Design Trends for 2024: What\'s Hot and What\'s Not',
            'Common Logo Design Mistakes to Avoid',
            '5 Steps to Design a Professional Logo'
        ],
        'YouTube Thumbnails' => [
            'Creating Click-Worthy YouTube Thumbnails That Get Views',
            'The Science Behind High-Converting Thumbnail Design',
            'YouTube Thumbnail Best Practices for 2024',
            'How to Design Thumbnails That Stand Out in Search',
            'Color Psychology in YouTube Thumbnail Design'
        ],
        'Video Editing' => [
            'Professional Video Editing Tips for Beginners',
            'How to Create Engaging Video Content for Your Brand',
            'The Ultimate Guide to Video Editing Software',
            'Color Grading Techniques for Professional Videos',
            'Audio Editing: The Secret to Professional Videos'
        ],
        'Branding' => [
            'Building a Strong Brand Identity: A Complete Guide',
            'How to Develop a Brand Style Guide',
            'The Importance of Consistent Branding Across All Platforms',
            'Rebranding: When and How to Refresh Your Brand',
            'Brand Storytelling: Connecting with Your Audience'
        ]
    ];
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->openai = new OpenAIIntegration();
    }
    
    public function generateSampleContent($count = 5) {
        echo "🎨 Generating Sample Content for AI Testing\n";
        echo "==========================================\n\n";
        
        $generated = 0;
        $failed = 0;
        
        foreach ($this->sampleTopics as $category => $topics) {
            if ($generated >= $count) break;
            
            echo "📂 Category: {$category}\n";
            
            foreach ($topics as $topic) {
                if ($generated >= $count) break;
                
                echo "  📝 Generating: {$topic}...\n";
                
                try {
                    $result = $this->generateBlogPost($topic, $category);
                    
                    if ($result['success']) {
                        $this->saveBlogPost($result['data'], $category);
                        $generated++;
                        echo "     ✅ Success! Cost: $" . number_format($result['cost'], 4) . "\n";
                    } else {
                        $failed++;
                        echo "     ❌ Failed: " . ($result['error'] ?? 'Unknown error') . "\n";
                    }
                } catch (Exception $e) {
                    $failed++;
                    echo "     ❌ Error: " . $e->getMessage() . "\n";
                }
                
                // Small delay to avoid rate limiting
                sleep(2);
            }
            
            echo "\n";
        }
        
        echo "📊 Generation Summary:\n";
        echo "  ✅ Generated: {$generated} posts\n";
        echo "  ❌ Failed: {$failed} posts\n";
        echo "  💰 Total estimated cost: $" . number_format($generated * 1.5, 2) . "\n\n";
        
        if ($generated > 0) {
            echo "🎉 Sample content generated successfully!\n";
            echo "You can now test the AI features with real content.\n";
        }
    }
    
    private function generateBlogPost($topic, $category) {
        $keywords = $this->getCategoryKeywords($category);
        
        return $this->openai->generateBlogContent(
            $topic,
            $keywords,
            'professional',
            'medium'
        );
    }
    
    private function getCategoryKeywords($category) {
        $keywordMap = [
            'Logo Design' => ['logo design', 'branding', 'brand identity', 'graphic design', 'visual identity'],
            'YouTube Thumbnails' => ['youtube thumbnails', 'video marketing', 'click-through rate', 'youtube optimization', 'video design'],
            'Video Editing' => ['video editing', 'video production', 'motion graphics', 'video marketing', 'content creation'],
            'Branding' => ['branding', 'brand strategy', 'brand identity', 'marketing', 'business branding']
        ];
        
        return $keywordMap[$category] ?? ['design', 'creative', 'professional'];
    }
    
    private function saveBlogPost($blogData, $category) {
        try {
            $query = "INSERT INTO blogs (title, content, excerpt, category, tags, featured_image, status, created_at) 
                      VALUES (:title, :content, :excerpt, :category, :tags, :featured_image, 'draft', NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':title' => $blogData['title'] ?? 'AI Generated Blog Post',
                ':content' => $blogData['content'] ?? '',
                ':excerpt' => $blogData['excerpt'] ?? '',
                ':category' => $category,
                ':tags' => json_encode($blogData['tags'] ?? []),
                ':featured_image' => 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop'
            ]);
            
            return $this->db->lastInsertId();
            
        } catch (Exception $e) {
            throw new Exception("Failed to save blog post: " . $e->getMessage());
        }
    }
    
    public function generateSampleProposals($count = 3) {
        echo "📋 Generating Sample Proposals\n";
        echo "=============================\n\n";
        
        $sampleClients = [
            [
                'name' => 'Tech Startup Inc.',
                'business' => 'Technology Startup',
                'service' => 'Complete Branding Package',
                'requirements' => 'Need complete brand identity including logo, color scheme, typography, and brand guidelines for a new AI software company.',
                'budget' => '$2000-3000'
            ],
            [
                'name' => 'Fitness First Gym',
                'business' => 'Fitness Center',
                'service' => 'Logo Design',
                'requirements' => 'Modern, energetic logo design for a new fitness center. Should convey strength, motivation, and health.',
                'budget' => '$500-800'
            ],
            [
                'name' => 'Creative YouTube Channel',
                'business' => 'Content Creator',
                'service' => 'YouTube Thumbnails',
                'requirements' => 'Monthly thumbnail design service for educational content channel. Need consistent style that increases click-through rates.',
                'budget' => '$300-500/month'
            ]
        ];
        
        $generated = 0;
        
        foreach ($sampleClients as $client) {
            if ($generated >= $count) break;
            
            echo "  📝 Generating proposal for: {$client['name']}...\n";
            
            try {
                $result = $this->openai->generateClientProposal(
                    [
                        'name' => $client['name'],
                        'business' => $client['business'],
                        'budget' => $client['budget']
                    ],
                    $client['service'],
                    $client['requirements']
                );
                
                if ($result['success']) {
                    $this->saveProposal($result['data'], $client);
                    $generated++;
                    echo "     ✅ Success! Cost: $" . number_format($result['cost'], 4) . "\n";
                } else {
                    echo "     ❌ Failed: " . ($result['error'] ?? 'Unknown error') . "\n";
                }
                
            } catch (Exception $e) {
                echo "     ❌ Error: " . $e->getMessage() . "\n";
            }
            
            sleep(1);
        }
        
        echo "\n📊 Generated {$generated} sample proposals\n";
    }
    
    private function saveProposal($proposalData, $clientData) {
        try {
            $query = "INSERT INTO ai_generated_content 
                      (content_type, ai_operation, original_prompt, generated_content, status, created_at) 
                      VALUES ('proposal', 'proposal_generation', :prompt, :content, 'draft', NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':prompt' => json_encode($clientData),
                ':content' => json_encode($proposalData)
            ]);
            
            return $this->db->lastInsertId();
            
        } catch (Exception $e) {
            throw new Exception("Failed to save proposal: " . $e->getMessage());
        }
    }
    
    public function testChatResponses() {
        echo "💬 Testing AI Chat Responses\n";
        echo "============================\n\n";
        
        $testQuestions = [
            "What services do you offer?",
            "How much does logo design cost?",
            "What's your turnaround time for projects?",
            "Do you offer revisions?",
            "Can you help with YouTube channel branding?",
            "What file formats do you provide?",
            "Do you offer rush delivery?",
            "Can I see examples of your work?"
        ];
        
        foreach ($testQuestions as $index => $question) {
            echo "  Q: {$question}\n";
            
            try {
                $result = $this->openai->generateSupportResponse($question, [
                    'test_mode' => true,
                    'question_id' => $index + 1
                ]);
                
                if ($result['success']) {
                    $response = $result['data']['response'] ?? '';
                    $cost = $result['cost'] ?? 0;
                    
                    echo "  A: " . substr($response, 0, 100) . "...\n";
                    echo "     💰 Cost: $" . number_format($cost, 4) . "\n\n";
                } else {
                    echo "  ❌ Failed: " . ($result['error'] ?? 'Unknown error') . "\n\n";
                }
                
            } catch (Exception $e) {
                echo "  ❌ Error: " . $e->getMessage() . "\n\n";
            }
            
            sleep(1);
        }
    }
}

// Command line usage
if (isset($argv)) {
    $generator = new SampleContentGenerator();
    
    $action = $argv[1] ?? 'all';
    $count = intval($argv[2] ?? 5);
    
    switch ($action) {
        case 'blogs':
            $generator->generateSampleContent($count);
            break;
            
        case 'proposals':
            $generator->generateSampleProposals($count);
            break;
            
        case 'chat':
            $generator->testChatResponses();
            break;
            
        case 'all':
        default:
            $generator->generateSampleContent($count);
            $generator->generateSampleProposals(3);
            $generator->testChatResponses();
            break;
    }
} else {
    echo "This script should be run from command line.\n";
    echo "Usage: php generate_sample_content.php [blogs|proposals|chat|all] [count]\n";
}
?>