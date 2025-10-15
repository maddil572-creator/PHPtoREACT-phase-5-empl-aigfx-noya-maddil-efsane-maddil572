<?php
/**
 * Admin AI Management API
 * Advanced AI management endpoints for administrators
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';
require_once __DIR__ . '/../../classes/OpenAIIntegration.php';

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

// Authentication check
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (empty($authHeader) || strpos($authHeader, 'Bearer ') !== 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required']);
    exit();
}

$token = substr($authHeader, 7);
$user = $auth->verifyToken($token);

if (!$user || ($user['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin access required']);
    exit();
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

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($path, $db, $openai);
        break;
        
    case 'POST':
        handlePostRequest($path, $input, $db, $openai);
        break;
        
    case 'PUT':
        handlePutRequest($path, $input, $db, $openai);
        break;
        
    case 'DELETE':
        handleDeleteRequest($path, $db);
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleGetRequest($path, $db, $openai) {
    switch ($path) {
        case 'dashboard':
            getDashboardData($db, $openai);
            break;
            
        case 'usage/detailed':
            getDetailedUsage($db);
            break;
            
        case 'content/generated':
            getGeneratedContent($db);
            break;
            
        case 'chat/sessions':
            getChatSessions($db);
            break;
            
        case 'performance/metrics':
            getPerformanceMetrics($db);
            break;
            
        case 'budget/history':
            getBudgetHistory($db);
            break;
            
        case 'cache/analytics':
            getCacheAnalytics($db);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

function handlePostRequest($path, $input, $db, $openai) {
    switch ($path) {
        case 'budget/update':
            updateBudget($input, $db);
            break;
            
        case 'content/approve':
            approveContent($input, $db);
            break;
            
        case 'cache/clear':
            clearCache($input, $db);
            break;
            
        case 'test/integration':
            testIntegration($openai);
            break;
            
        case 'export/data':
            exportData($input, $db);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

function handlePutRequest($path, $input, $db, $openai) {
    switch ($path) {
        case 'config/update':
            updateConfig($input, $db);
            break;
            
        case 'content/edit':
            editGeneratedContent($input, $db);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

function handleDeleteRequest($path, $db) {
    switch ($path) {
        case 'content/delete':
            deleteGeneratedContent($_GET['id'] ?? null, $db);
            break;
            
        case 'cache/clear-all':
            clearAllCache($db);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }
}

function getDashboardData($db, $openai) {
    try {
        // Get usage stats
        $usageStats = $openai->getUsageStats();
        
        // Get recent activity
        $stmt = $db->query("
            SELECT 
                operation,
                cost,
                total_tokens,
                created_at
            FROM ai_usage_log 
            ORDER BY created_at DESC 
            LIMIT 10
        ");
        $recentActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get content stats
        $stmt = $db->query("
            SELECT 
                content_type,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(cost) as total_cost
            FROM ai_generated_content 
            GROUP BY content_type
        ");
        $contentStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get chat stats
        $stmt = $db->query("
            SELECT 
                COUNT(*) as total_sessions,
                SUM(total_messages) as total_messages,
                AVG(satisfaction_score) as avg_satisfaction,
                SUM(CASE WHEN converted_to_lead = 1 THEN 1 ELSE 0 END) as converted_leads
            FROM ai_chat_sessions 
            WHERE started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");
        $chatStats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse([
            'success' => true,
            'data' => [
                'usage_stats' => $usageStats['data'] ?? null,
                'recent_activity' => $recentActivity,
                'content_stats' => $contentStats,
                'chat_stats' => $chatStats
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to load dashboard data: ' . $e->getMessage(), 500);
    }
}

function getDetailedUsage($db) {
    try {
        $days = intval($_GET['days'] ?? 30);
        
        $stmt = $db->prepare("
            SELECT 
                DATE(created_at) as date,
                operation,
                COUNT(*) as requests,
                SUM(cost) as total_cost,
                SUM(total_tokens) as total_tokens,
                AVG(cost) as avg_cost
            FROM ai_usage_log 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
            GROUP BY DATE(created_at), operation
            ORDER BY date DESC, operation
        ");
        
        $stmt->execute([':days' => $days]);
        $usage = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get hourly distribution for today
        $stmt = $db->query("
            SELECT 
                HOUR(created_at) as hour,
                COUNT(*) as requests,
                SUM(cost) as cost
            FROM ai_usage_log 
            WHERE DATE(created_at) = CURDATE()
            GROUP BY HOUR(created_at)
            ORDER BY hour
        ");
        $hourlyUsage = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse([
            'success' => true,
            'data' => [
                'daily_usage' => $usage,
                'hourly_usage' => $hourlyUsage
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to load detailed usage: ' . $e->getMessage(), 500);
    }
}

function getGeneratedContent($db) {
    try {
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;
        
        $contentType = $_GET['content_type'] ?? '';
        $status = $_GET['status'] ?? '';
        
        $whereClause = '';
        $params = [];
        
        if ($contentType) {
            $whereClause .= ' AND content_type = :content_type';
            $params[':content_type'] = $contentType;
        }
        
        if ($status) {
            $whereClause .= ' AND status = :status';
            $params[':status'] = $status;
        }
        
        // Get content
        $stmt = $db->prepare("
            SELECT 
                id,
                content_type,
                ai_operation,
                LEFT(original_prompt, 100) as prompt_preview,
                LEFT(generated_content, 200) as content_preview,
                human_edited,
                quality_score,
                tokens_used,
                cost,
                status,
                created_by,
                created_at
            FROM ai_generated_content 
            WHERE 1=1 {$whereClause}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        ");
        
        $params[':limit'] = $limit;
        $params[':offset'] = $offset;
        
        $stmt->execute($params);
        $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countStmt = $db->prepare("
            SELECT COUNT(*) as total 
            FROM ai_generated_content 
            WHERE 1=1 {$whereClause}
        ");
        
        unset($params[':limit'], $params[':offset']);
        $countStmt->execute($params);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        sendResponse([
            'success' => true,
            'data' => [
                'content' => $content,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to load generated content: ' . $e->getMessage(), 500);
    }
}

function getChatSessions($db) {
    try {
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;
        
        $stmt = $db->prepare("
            SELECT 
                s.id,
                s.session_id,
                s.user_name,
                s.user_email,
                s.status,
                s.total_messages,
                s.ai_responses,
                s.satisfaction_score,
                s.lead_quality_score,
                s.converted_to_lead,
                s.total_cost,
                s.started_at,
                s.ended_at,
                COUNT(m.id) as message_count
            FROM ai_chat_sessions s
            LEFT JOIN ai_chat_messages m ON s.session_id = m.session_id
            GROUP BY s.id
            ORDER BY s.started_at DESC
            LIMIT :limit OFFSET :offset
        ");
        
        $stmt->execute([
            ':limit' => $limit,
            ':offset' => $offset
        ]);
        
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countStmt = $db->query("SELECT COUNT(*) as total FROM ai_chat_sessions");
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        sendResponse([
            'success' => true,
            'data' => [
                'sessions' => $sessions,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to load chat sessions: ' . $e->getMessage(), 500);
    }
}

function getPerformanceMetrics($db) {
    try {
        // Cache hit rate
        $stmt = $db->query("
            SELECT 
                operation,
                COUNT(*) as total_items,
                SUM(hit_count) as total_hits,
                AVG(hit_count) as avg_hits_per_item
            FROM ai_response_cache 
            WHERE expires_at > NOW()
            GROUP BY operation
        ");
        $cacheMetrics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Response times (if tracked)
        $stmt = $db->query("
            SELECT 
                operation,
                AVG(CASE WHEN JSON_EXTRACT(context_data, '$.response_time') IS NOT NULL 
                         THEN JSON_EXTRACT(context_data, '$.response_time') END) as avg_response_time
            FROM ai_chat_messages 
            WHERE message_type = 'ai' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY operation
        ");
        $responseTimeMetrics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Cost efficiency
        $stmt = $db->query("
            SELECT 
                operation,
                COUNT(*) as total_requests,
                SUM(cost) as total_cost,
                AVG(cost) as avg_cost_per_request,
                SUM(total_tokens) as total_tokens,
                AVG(total_tokens) as avg_tokens_per_request
            FROM ai_usage_log 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY operation
        ");
        $costMetrics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse([
            'success' => true,
            'data' => [
                'cache_metrics' => $cacheMetrics,
                'response_time_metrics' => $responseTimeMetrics,
                'cost_metrics' => $costMetrics
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to load performance metrics: ' . $e->getMessage(), 500);
    }
}

function updateBudget($input, $db) {
    try {
        $newBudget = floatval($input['budget'] ?? 0);
        
        if ($newBudget <= 0) {
            sendError('Budget must be greater than 0');
        }
        
        // Update current month's budget
        $stmt = $db->prepare("
            UPDATE ai_budget_tracking 
            SET budget_limit = :budget, last_updated = NOW()
            WHERE year = YEAR(CURDATE()) AND month = MONTH(CURDATE())
        ");
        
        $stmt->execute([':budget' => $newBudget]);
        
        // Also update config
        $stmt = $db->prepare("
            UPDATE ai_config 
            SET config_value = :budget, updated_at = NOW()
            WHERE config_key = 'monthly_budget'
        ");
        
        $stmt->execute([':budget' => $newBudget]);
        
        sendResponse([
            'success' => true,
            'message' => 'Budget updated successfully',
            'new_budget' => $newBudget
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to update budget: ' . $e->getMessage(), 500);
    }
}

function approveContent($input, $db) {
    try {
        $contentId = intval($input['content_id'] ?? 0);
        $status = $input['status'] ?? 'approved';
        $qualityScore = floatval($input['quality_score'] ?? 0);
        
        if (!$contentId) {
            sendError('Content ID is required');
        }
        
        $stmt = $db->prepare("
            UPDATE ai_generated_content 
            SET status = :status, quality_score = :quality_score, approved_by = :admin_id, updated_at = NOW()
            WHERE id = :content_id
        ");
        
        $stmt->execute([
            ':status' => $status,
            ':quality_score' => $qualityScore,
            ':admin_id' => 1, // Would use actual admin ID
            ':content_id' => $contentId
        ]);
        
        sendResponse([
            'success' => true,
            'message' => 'Content status updated successfully'
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to update content status: ' . $e->getMessage(), 500);
    }
}

function clearCache($input, $db) {
    try {
        $operation = $input['operation'] ?? '';
        
        if ($operation) {
            $stmt = $db->prepare("DELETE FROM ai_response_cache WHERE operation = :operation");
            $stmt->execute([':operation' => $operation]);
        } else {
            $stmt = $db->prepare("DELETE FROM ai_response_cache WHERE expires_at < NOW()");
            $stmt->execute();
        }
        
        $deletedCount = $stmt->rowCount();
        
        sendResponse([
            'success' => true,
            'message' => "Cleared {$deletedCount} cache entries",
            'deleted_count' => $deletedCount
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to clear cache: ' . $e->getMessage(), 500);
    }
}

function testIntegration($openai) {
    try {
        $result = $openai->generateSupportResponse("This is a test message for integration testing.");
        
        sendResponse([
            'success' => true,
            'test_result' => $result,
            'message' => 'Integration test completed'
        ]);
        
    } catch (Exception $e) {
        sendError('Integration test failed: ' . $e->getMessage(), 500);
    }
}

function exportData($input, $db) {
    try {
        $dataType = $input['data_type'] ?? 'usage';
        $format = $input['format'] ?? 'json';
        $dateFrom = $input['date_from'] ?? date('Y-m-01');
        $dateTo = $input['date_to'] ?? date('Y-m-d');
        
        switch ($dataType) {
            case 'usage':
                $stmt = $db->prepare("
                    SELECT * FROM ai_usage_log 
                    WHERE DATE(created_at) BETWEEN :date_from AND :date_to
                    ORDER BY created_at DESC
                ");
                break;
                
            case 'content':
                $stmt = $db->prepare("
                    SELECT * FROM ai_generated_content 
                    WHERE DATE(created_at) BETWEEN :date_from AND :date_to
                    ORDER BY created_at DESC
                ");
                break;
                
            case 'chat':
                $stmt = $db->prepare("
                    SELECT * FROM ai_chat_sessions 
                    WHERE DATE(started_at) BETWEEN :date_from AND :date_to
                    ORDER BY started_at DESC
                ");
                break;
                
            default:
                sendError('Invalid data type');
        }
        
        $stmt->execute([
            ':date_from' => $dateFrom,
            ':date_to' => $dateTo
        ]);
        
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($format === 'csv') {
            // Convert to CSV format
            $csv = '';
            if (!empty($data)) {
                $csv .= implode(',', array_keys($data[0])) . "\n";
                foreach ($data as $row) {
                    $csv .= implode(',', array_map(function($value) {
                        return '"' . str_replace('"', '""', $value) . '"';
                    }, $row)) . "\n";
                }
            }
            
            sendResponse([
                'success' => true,
                'data' => $csv,
                'format' => 'csv',
                'filename' => "ai_{$dataType}_export_{$dateFrom}_to_{$dateTo}.csv"
            ]);
        } else {
            sendResponse([
                'success' => true,
                'data' => $data,
                'format' => 'json',
                'count' => count($data)
            ]);
        }
        
    } catch (Exception $e) {
        sendError('Failed to export data: ' . $e->getMessage(), 500);
    }
}
?>