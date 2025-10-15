-- AI Features Database Schema
-- Creates tables for AI usage tracking, caching, and management

-- AI Usage Logging Table
CREATE TABLE IF NOT EXISTS ai_usage_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    operation VARCHAR(50) NOT NULL COMMENT 'Type of AI operation (blog_generation, proposal_generation, etc.)',
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0 COMMENT 'Cost in USD',
    input_tokens INT NOT NULL DEFAULT 0 COMMENT 'Number of input tokens used',
    output_tokens INT NOT NULL DEFAULT 0 COMMENT 'Number of output tokens generated',
    total_tokens INT NOT NULL DEFAULT 0 COMMENT 'Total tokens used',
    user_id INT NULL COMMENT 'User who initiated the request',
    session_id VARCHAR(100) NULL COMMENT 'Session identifier',
    ip_address VARCHAR(45) NULL COMMENT 'Client IP address',
    user_agent TEXT NULL COMMENT 'Client user agent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_operation (operation),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id),
    INDEX idx_cost (cost)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Response Cache Table
CREATE TABLE IF NOT EXISTS ai_response_cache (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) NOT NULL UNIQUE COMMENT 'MD5 hash of request parameters',
    response_data LONGTEXT NOT NULL COMMENT 'JSON encoded AI response',
    operation VARCHAR(50) NOT NULL COMMENT 'Type of AI operation',
    hit_count INT NOT NULL DEFAULT 1 COMMENT 'Number of times this cache was used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL COMMENT 'When this cache entry expires',
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cache_key (cache_key),
    INDEX idx_expires_at (expires_at),
    INDEX idx_operation (operation),
    INDEX idx_last_accessed (last_accessed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Configuration Table
CREATE TABLE IF NOT EXISTS ai_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Configuration key',
    config_value TEXT NOT NULL COMMENT 'Configuration value (JSON or plain text)',
    description TEXT NULL COMMENT 'Description of this configuration',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this config is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Generated Content Table
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type VARCHAR(50) NOT NULL COMMENT 'Type of content (blog, proposal, support_response, etc.)',
    content_id INT NULL COMMENT 'ID of the related content (blog_id, etc.)',
    ai_operation VARCHAR(50) NOT NULL COMMENT 'AI operation used to generate',
    original_prompt TEXT NOT NULL COMMENT 'Original prompt sent to AI',
    generated_content LONGTEXT NOT NULL COMMENT 'AI generated content',
    human_edited BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether human edited the content',
    final_content LONGTEXT NULL COMMENT 'Final content after human editing',
    quality_score DECIMAL(3, 2) NULL COMMENT 'Quality score (1-10)',
    tokens_used INT NOT NULL DEFAULT 0 COMMENT 'Total tokens used for generation',
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0 COMMENT 'Cost for this generation',
    status ENUM('draft', 'approved', 'published', 'rejected') DEFAULT 'draft',
    created_by INT NULL COMMENT 'User who requested generation',
    approved_by INT NULL COMMENT 'User who approved the content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content_type (content_type),
    INDEX idx_content_id (content_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Budget Tracking Table
CREATE TABLE IF NOT EXISTS ai_budget_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year INT NOT NULL COMMENT 'Budget year',
    month INT NOT NULL COMMENT 'Budget month (1-12)',
    budget_limit DECIMAL(10, 2) NOT NULL DEFAULT 50.00 COMMENT 'Monthly budget limit in USD',
    current_spend DECIMAL(10, 6) NOT NULL DEFAULT 0 COMMENT 'Current month spending',
    total_requests INT NOT NULL DEFAULT 0 COMMENT 'Total API requests this month',
    successful_requests INT NOT NULL DEFAULT 0 COMMENT 'Successful API requests',
    failed_requests INT NOT NULL DEFAULT 0 COMMENT 'Failed API requests',
    cache_hits INT NOT NULL DEFAULT 0 COMMENT 'Number of cache hits (saved costs)',
    estimated_savings DECIMAL(10, 6) NOT NULL DEFAULT 0 COMMENT 'Estimated savings from caching',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_month (year, month),
    INDEX idx_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Chat Sessions Table (for customer support chat)
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique session identifier',
    user_id INT NULL COMMENT 'Registered user ID (if logged in)',
    visitor_id VARCHAR(100) NULL COMMENT 'Anonymous visitor identifier',
    user_name VARCHAR(100) NULL COMMENT 'User name provided in chat',
    user_email VARCHAR(255) NULL COMMENT 'User email provided in chat',
    status ENUM('active', 'ended', 'transferred_to_human') DEFAULT 'active',
    total_messages INT NOT NULL DEFAULT 0 COMMENT 'Total messages in this session',
    ai_responses INT NOT NULL DEFAULT 0 COMMENT 'Number of AI responses',
    human_responses INT NOT NULL DEFAULT 0 COMMENT 'Number of human responses',
    satisfaction_score INT NULL COMMENT 'User satisfaction score (1-5)',
    lead_quality_score DECIMAL(3, 2) NULL COMMENT 'Estimated lead quality (1-10)',
    converted_to_lead BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this became a lead',
    total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0 COMMENT 'Total AI cost for this session',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at),
    INDEX idx_converted_to_lead (converted_to_lead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL COMMENT 'Chat session ID',
    message_type ENUM('user', 'ai', 'human', 'system') NOT NULL COMMENT 'Who sent the message',
    message_content TEXT NOT NULL COMMENT 'Message content',
    ai_confidence DECIMAL(3, 2) NULL COMMENT 'AI confidence score (0-1)',
    tokens_used INT NULL COMMENT 'Tokens used for AI response',
    cost DECIMAL(10, 6) NULL COMMENT 'Cost for AI response',
    response_time_ms INT NULL COMMENT 'Response time in milliseconds',
    context_data JSON NULL COMMENT 'Additional context data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_message_type (message_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default AI configuration
INSERT INTO ai_config (config_key, config_value, description) VALUES
('monthly_budget', '50.00', 'Default monthly AI budget in USD'),
('cache_ttl', '86400', 'Default cache TTL in seconds (24 hours)'),
('max_tokens_per_request', '4000', 'Maximum tokens per AI request'),
('enable_content_generation', 'true', 'Enable AI content generation features'),
('enable_chat_support', 'true', 'Enable AI-powered chat support'),
('enable_seo_optimization', 'true', 'Enable AI SEO optimization features'),
('quality_threshold', '7.0', 'Minimum quality score for auto-approval'),
('rate_limit_per_hour', '100', 'Maximum AI requests per hour per user')
ON DUPLICATE KEY UPDATE 
config_value = VALUES(config_value),
updated_at = CURRENT_TIMESTAMP;

-- Create current month budget tracking entry
INSERT INTO ai_budget_tracking (year, month, budget_limit) 
VALUES (YEAR(CURDATE()), MONTH(CURDATE()), 50.00)
ON DUPLICATE KEY UPDATE 
budget_limit = VALUES(budget_limit),
last_updated = CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX idx_ai_usage_month ON ai_usage_log (YEAR(created_at), MONTH(created_at));
CREATE INDEX idx_ai_cache_operation_expires ON ai_response_cache (operation, expires_at);
CREATE INDEX idx_ai_content_type_status ON ai_generated_content (content_type, status);
CREATE INDEX idx_ai_chat_session_date ON ai_chat_sessions (DATE(started_at));

-- Create a view for monthly AI statistics
CREATE OR REPLACE VIEW ai_monthly_stats AS
SELECT 
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    operation,
    COUNT(*) as total_requests,
    SUM(cost) as total_cost,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    AVG(cost) as avg_cost_per_request,
    MIN(created_at) as first_request,
    MAX(created_at) as last_request
FROM ai_usage_log
GROUP BY YEAR(created_at), MONTH(created_at), operation;

-- Create a view for AI cache effectiveness
CREATE OR REPLACE VIEW ai_cache_stats AS
SELECT 
    operation,
    COUNT(*) as total_cached_items,
    SUM(hit_count) as total_cache_hits,
    AVG(hit_count) as avg_hits_per_item,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_cache_items,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_cache_items
FROM ai_response_cache
GROUP BY operation;

-- Add cleanup procedure for old cache entries
DELIMITER //
CREATE PROCEDURE CleanupAICache()
BEGIN
    -- Delete expired cache entries older than 7 days
    DELETE FROM ai_response_cache 
    WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    -- Delete old usage logs older than 1 year
    DELETE FROM ai_usage_log 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Delete old chat sessions older than 6 months
    DELETE FROM ai_chat_sessions 
    WHERE started_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    SELECT ROW_COUNT() as cleaned_records;
END //
DELIMITER ;

-- Create event to run cleanup weekly (if events are enabled)
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS ai_weekly_cleanup
-- ON SCHEDULE EVERY 1 WEEK
-- STARTS CURRENT_TIMESTAMP
-- DO CALL CleanupAICache();

COMMIT;