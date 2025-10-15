-- =====================================================
-- Adil Creator - Hostinger MySQL Database Schema
-- =====================================================
-- Optimized for Hostinger MySQL hosting
-- Database: u720615217_adil_db
-- User: u720615217_adil
-- =====================================================

-- Use the database
USE `u720615217_adil_db`;

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS `page_views`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `newsletter_subscribers`;
DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `carousels`;
DROP TABLE IF EXISTS `pages`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `service_tags`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `portfolio_tags`;
DROP TABLE IF EXISTS `portfolio`;
DROP TABLE IF EXISTS `blog_tags`;
DROP TABLE IF EXISTS `blogs`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Site Settings Table
CREATE TABLE `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` TEXT,
    `type` ENUM('text', 'number', 'boolean', 'json', 'url', 'email', 'color') NOT NULL DEFAULT 'text',
    `category` ENUM('general', 'seo', 'appearance', 'social', 'api', 'system') NOT NULL DEFAULT 'general',
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(500),
    `role` ENUM('admin', 'editor', 'user') NOT NULL DEFAULT 'user',
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `verification_token` VARCHAR(255),
    `reset_token` VARCHAR(255),
    `reset_expires` TIMESTAMP NULL,
    `login_attempts` INT DEFAULT 0,
    `locked_until` TIMESTAMP NULL,
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Profiles Table
CREATE TABLE `user_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `phone` VARCHAR(20),
    `address` TEXT,
    `city` VARCHAR(100),
    `country` VARCHAR(100),
    `timezone` VARCHAR(50) DEFAULT 'UTC',
    `language` VARCHAR(10) DEFAULT 'en',
    `bio` TEXT,
    `website` VARCHAR(500),
    `social_links` JSON,
    `preferences` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT,
    `color` VARCHAR(7),
    `icon` VARCHAR(50),
    `parent_id` INT NULL,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags Table
CREATE TABLE `tags` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `color` VARCHAR(7),
    `usage_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media Files Table
CREATE TABLE `media` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `filename` VARCHAR(255) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_size` BIGINT NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_type` ENUM('image', 'document', 'video', 'audio', 'other') NOT NULL,
    `dimensions` JSON,
    `alt_text` TEXT,
    `caption` TEXT,
    `uploaded_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog Posts Table
CREATE TABLE `blogs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) NOT NULL UNIQUE,
    `excerpt` TEXT,
    `content` LONGTEXT NOT NULL,
    `featured_image` VARCHAR(500),
    `category_id` INT,
    `author_id` INT NOT NULL,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `featured` BOOLEAN NOT NULL DEFAULT FALSE,
    `published` BOOLEAN NOT NULL DEFAULT FALSE,
    `views` INT DEFAULT 0,
    `likes` INT DEFAULT 0,
    `read_time` INT DEFAULT 5,
    `seo_title` VARCHAR(500),
    `seo_description` TEXT,
    `seo_keywords` TEXT,
    `published_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_status` (`status`),
    INDEX `idx_featured` (`featured`),
    INDEX `idx_published` (`published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog Tags Junction Table
CREATE TABLE `blog_tags` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `blog_id` INT NOT NULL,
    `tag_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_blog_tag` (`blog_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portfolio Items Table
CREATE TABLE `portfolio` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) NOT NULL UNIQUE,
    `description` TEXT NOT NULL,
    `long_description` LONGTEXT,
    `featured_image` VARCHAR(500) NOT NULL,
    `gallery_images` JSON,
    `category_id` INT,
    `client_name` VARCHAR(255),
    `client_website` VARCHAR(500),
    `project_url` VARCHAR(500),
    `completion_date` DATE,
    `technologies` JSON,
    `results` JSON,
    `status` ENUM('active', 'archived', 'draft') NOT NULL DEFAULT 'active',
    `featured` BOOLEAN NOT NULL DEFAULT FALSE,
    `views` INT DEFAULT 0,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_status` (`status`),
    INDEX `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portfolio Tags Junction Table
CREATE TABLE `portfolio_tags` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `portfolio_id` INT NOT NULL,
    `tag_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_portfolio_tag` (`portfolio_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services Table
CREATE TABLE `services` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `tagline` VARCHAR(500),
    `description` TEXT NOT NULL,
    `long_description` LONGTEXT,
    `icon` VARCHAR(100),
    `featured_image` VARCHAR(500),
    `category_id` INT,
    `features` JSON,
    `pricing_tiers` JSON,
    `delivery_time` VARCHAR(100),
    `popular` BOOLEAN NOT NULL DEFAULT FALSE,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_active` (`active`),
    INDEX `idx_popular` (`popular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Tags Junction Table
CREATE TABLE `service_tags` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `service_id` INT NOT NULL,
    `tag_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_service_tag` (`service_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials Table
CREATE TABLE `testimonials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255),
    `company` VARCHAR(255),
    `position` VARCHAR(255),
    `avatar` VARCHAR(500),
    `content` TEXT NOT NULL,
    `rating` TINYINT NOT NULL DEFAULT 5,
    `service_id` INT,
    `project_id` INT,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `featured` BOOLEAN NOT NULL DEFAULT FALSE,
    `approved_by` INT,
    `approved_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`project_id`) REFERENCES `portfolio`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_status` (`status`),
    INDEX `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dynamic Pages Table
CREATE TABLE `pages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) NOT NULL UNIQUE,
    `content` LONGTEXT NOT NULL,
    `template` VARCHAR(100) DEFAULT 'default',
    `sections` JSON,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `featured` BOOLEAN NOT NULL DEFAULT FALSE,
    `author_id` INT NOT NULL,
    `seo_title` VARCHAR(500),
    `seo_description` TEXT,
    `seo_keywords` TEXT,
    `published_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Carousel Slides Table
CREATE TABLE `carousels` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `subtitle` VARCHAR(500),
    `description` TEXT,
    `image` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500),
    `link_text` VARCHAR(100),
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Form Submissions Table
CREATE TABLE `contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `subject` VARCHAR(500),
    `message` TEXT NOT NULL,
    `service_interest` VARCHAR(255),
    `budget_range` VARCHAR(100),
    `timeline` VARCHAR(100),
    `source` VARCHAR(100),
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `status` ENUM('new', 'read', 'responded', 'archived') NOT NULL DEFAULT 'new',
    `responded_at` TIMESTAMP NULL,
    `responded_by` INT,
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`responded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_status` (`status`),
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter Subscribers Table
CREATE TABLE `newsletter_subscribers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `name` VARCHAR(255),
    `status` ENUM('active', 'unsubscribed', 'bounced') NOT NULL DEFAULT 'active',
    `source` VARCHAR(100),
    `interests` JSON,
    `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `unsubscribed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `action` VARCHAR(100) NOT NULL,
    `entity` VARCHAR(100) NOT NULL,
    `entity_id` INT,
    `description` TEXT NOT NULL,
    `changes` JSON,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_entity` (`entity`, `entity_id`),
    INDEX `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Notifications Table
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('system', 'user', 'security', 'content', 'info') NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `message` TEXT NOT NULL,
    `action_url` VARCHAR(500),
    `metadata` JSON,
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `read_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_read` (`is_read`),
    INDEX `idx_type` (`type`),
    INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert System Settings
INSERT INTO `settings` (`key`, `value`, `type`, `category`, `description`) VALUES
('site_name', 'Adil Creator', 'text', 'general', 'Website name'),
('site_tagline', 'Professional Design & Creative Services', 'text', 'general', 'Website tagline'),
('site_description', 'Premium logo design, YouTube thumbnails, video editing, and creative services', 'text', 'general', 'Website description'),
('contact_email', 'admin@adilcreator.com', 'email', 'general', 'Primary contact email'),
('studio_email', 'studio@adilcreator.com', 'email', 'general', 'Studio contact email'),
('contact_phone', '+1 (555) 123-4567', 'text', 'general', 'Contact phone number'),
('logo_url', '/images/logo.png', 'url', 'appearance', 'Website logo URL'),
('favicon_url', '/images/favicon.ico', 'url', 'appearance', 'Favicon URL'),
('primary_color', '#3B82F6', 'color', 'appearance', 'Primary brand color'),
('secondary_color', '#1E40AF', 'color', 'appearance', 'Secondary brand color'),
('seo_title', 'Adil Creator - Professional Design & Creative Services', 'text', 'seo', 'Default SEO title'),
('seo_description', 'Get premium logo design, YouTube thumbnails, video editing, and creative services. Professional quality, fast delivery, affordable prices.', 'text', 'seo', 'Default SEO description'),
('seo_keywords', 'logo design, youtube thumbnails, video editing, graphic design, branding, creative services', 'text', 'seo', 'Default SEO keywords');

-- Insert Default Admin User
INSERT INTO `users` (`email`, `password`, `name`, `role`, `status`, `email_verified`, `created_at`) VALUES
('admin@adilcreator.com', '$2y$12$PXq0z7MbJKf/AQMEe6Fjsu6tZfjErrbYrGvtWyDnMa2my.xw46Xg2', 'Adil Creator Admin', 'admin', 'active', 1, NOW());

-- Insert User Profile
INSERT INTO `user_profiles` (`user_id`, `bio`, `timezone`, `language`, `preferences`) VALUES
(1, 'Creative professional specializing in logo design, YouTube thumbnails, and video editing services.', 'UTC', 'en', '{"theme":"light","notifications":true,"email_notifications":true}');

-- Insert Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('Logo Design', 'logo-design', 'Professional logo design services', '#3B82F6', 'palette', 1),
('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching YouTube thumbnail designs', '#FF0000', 'play-circle', 2),
('Video Editing', 'video-editing', 'Professional video editing and post-production', '#8B5CF6', 'film', 3),
('Web Design', 'web-design', 'Modern and responsive web design', '#10B981', 'globe', 4),
('Branding', 'branding', 'Complete brand identity packages', '#F59E0B', 'star', 5),
('Creative Services', 'creative-services', 'Various creative and design services', '#EC4899', 'sparkles', 6);

-- Insert Tags
INSERT INTO `tags` (`name`, `slug`, `color`) VALUES
('Modern', 'modern', '#3B82F6'),
('Minimalist', 'minimalist', '#6B7280'),
('Creative', 'creative', '#8B5CF6'),
('Professional', 'professional', '#1E40AF'),
('Colorful', 'colorful', '#F59E0B'),
('Gaming', 'gaming', '#EF4444'),
('Business', 'business', '#059669'),
('Tech', 'tech', '#0891B2'),
('Fashion', 'fashion', '#EC4899'),
('Food', 'food', '#F97316');

-- Insert Sample Services
INSERT INTO `services` (`name`, `slug`, `tagline`, `description`, `long_description`, `icon`, `category_id`, `features`, `pricing_tiers`, `delivery_time`, `popular`, `active`, `sort_order`) VALUES
('Premium Logo Design', 'premium-logo-design', 'Stand out with a unique brand identity', 'Professional logo design that captures your brand essence and makes you memorable.', 'Our premium logo design service includes comprehensive brand research, multiple concept development, unlimited revisions, and complete file packages. We work closely with you to understand your vision and create a logo that truly represents your brand values.', 'palette', 1, '["Multiple concepts", "Unlimited revisions", "Vector files included", "Brand guidelines", "Commercial license"]', '[{"name":"Basic","price":99,"duration":"3-5 days","features":["3 logo concepts","2 revisions","PNG & JPG files"]},{"name":"Standard","price":199,"duration":"5-7 days","features":["5 logo concepts","Unlimited revisions","All file formats","Basic brand guide"],"popular":true},{"name":"Premium","price":399,"duration":"7-10 days","features":["10 logo concepts","Unlimited revisions","Complete brand package","Style guide","Business card design"]}]', '3-10 days', 1, 1, 1),

('YouTube Thumbnail Design', 'youtube-thumbnail-design', 'Boost your video views instantly', 'Eye-catching YouTube thumbnails that increase click-through rates and grow your channel.', 'Our YouTube thumbnail design service is specifically crafted to maximize your video performance. We understand YouTube algorithm preferences and design thumbnails that stand out in search results and suggested videos.', 'play-circle', 2, '["High CTR designs", "Mobile optimized", "A/B testing options", "Quick turnaround", "YouTube compliant"]', '[{"name":"Single","price":25,"duration":"24 hours","features":["1 custom thumbnail","2 revisions","HD quality"]},{"name":"Pack of 5","price":99,"duration":"2-3 days","features":["5 custom thumbnails","Unlimited revisions","HD quality","Bonus template"],"popular":true},{"name":"Monthly","price":299,"duration":"Ongoing","features":["20 thumbnails/month","Priority support","Custom templates","Analytics insights"]}]', '24-72 hours', 1, 1, 2),

('Video Editing Pro', 'video-editing-pro', 'Transform raw footage into cinematic content', 'Professional video editing with color grading, sound design, and motion graphics.', 'Our professional video editing service transforms your raw footage into polished, engaging content. We handle everything from basic cuts and transitions to advanced color grading, audio mixing, and motion graphics.', 'film', 3, '["Color grading", "Sound design", "Motion graphics", "Multi-format export", "Revision rounds"]', '[{"name":"Basic Edit","price":150,"duration":"3-5 days","features":["Basic cuts & transitions","Color correction","Audio sync","HD export"]},{"name":"Professional","price":350,"duration":"5-7 days","features":["Advanced editing","Color grading","Sound design","Motion graphics","4K export"],"popular":true},{"name":"Cinematic","price":750,"duration":"7-14 days","features":["Full post-production","Advanced VFX","Custom graphics","Sound mixing","Multiple formats"]}]', '3-14 days', 1, 1, 3);

-- Insert Sample Carousel Slides
INSERT INTO `carousels` (`name`, `title`, `subtitle`, `description`, `image`, `link_url`, `link_text`, `active`, `sort_order`) VALUES
('hero', 'Transform Your Brand Identity', 'Professional Design Services', 'Get premium logo design, YouTube thumbnails, and video editing services that make your brand stand out from the competition.', '/images/hero/slide-1.jpg', '/services', 'Explore Services', 1, 1),
('hero', 'Boost Your YouTube Channel', 'Eye-Catching Thumbnails That Convert', 'Increase your click-through rates and grow your audience with professionally designed YouTube thumbnails optimized for maximum engagement.', '/images/hero/slide-2.jpg', '/services/youtube-thumbnail-design', 'Get Thumbnails', 1, 2),
('hero', 'Professional Video Production', 'From Raw Footage to Cinematic Content', 'Transform your videos with professional editing, color grading, sound design, and motion graphics that captivate your audience.', '/images/hero/slide-3.jpg', '/services/video-editing-pro', 'Start Project', 1, 3);

-- Insert Sample Notifications
INSERT INTO `notifications` (`type`, `title`, `message`, `priority`, `is_read`) VALUES
('system', 'Welcome to Adil Creator', 'Your website has been successfully set up and configured for adilcreator.com. You can now customize content and settings through the admin panel.', 'high', 0),
('content', 'Services Configured', 'Your service catalog has been set up with logo design, YouTube thumbnails, and video editing services.', 'medium', 0),
('system', 'Email Configuration Ready', 'Email system configured with admin@adilcreator.com and studio@adilcreator.com mailboxes.', 'medium', 0);

-- Insert Sample Activity Logs
INSERT INTO `activity_logs` (`user_id`, `action`, `entity`, `entity_id`, `description`, `ip_address`) VALUES
(1, 'create', 'system', 1, 'Initial system setup completed', '127.0.0.1'),
(1, 'create', 'settings', 1, 'Site settings configured for Adil Creator', '127.0.0.1'),
(1, 'create', 'services', 1, 'Service catalog initialized', '127.0.0.1');

COMMIT;