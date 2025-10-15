-- =====================================================
-- ADIL GFX UNIFIED COMPLETE DATABASE SCHEMA
-- Single comprehensive schema with all tables and relationships
-- =====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `adilgfx_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `adilgfx_db`;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `page_views`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `newsletter_subscribers`;
DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `carousels`;
DROP TABLE IF EXISTS `pages`;
DROP TABLE IF EXISTS `service_tags`;
DROP TABLE IF EXISTS `portfolio_tags`;
DROP TABLE IF EXISTS `blog_tags`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `portfolio`;
DROP TABLE IF EXISTS `blogs`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- System settings for global configuration
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` longtext DEFAULT NULL,
  `type` enum('text','number','boolean','json','url','email','color','file') NOT NULL DEFAULT 'text',
  `category` varchar(100) NOT NULL DEFAULT 'general',
  `label` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `options` json DEFAULT NULL,
  `validation` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_category` (`category`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USER MANAGEMENT SYSTEM
-- =====================================================

-- Main users table with authentication
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('admin','editor','user') NOT NULL DEFAULT 'user',
  `avatar` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `login_attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_email_verified` (`email_verified`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extended user profiles with additional information
CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `language` varchar(10) DEFAULT 'en',
  `bio` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_city` (`city`),
  KEY `idx_country` (`country`),
  CONSTRAINT `fk_user_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions for JWT token management
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_user_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CONTENT TAXONOMY SYSTEM
-- =====================================================

-- Categories for organizing content (blogs, portfolio, services)
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icon` varchar(100) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_categories_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags for flexible content labeling
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `color` varchar(7) DEFAULT '#6B7280',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MEDIA MANAGEMENT SYSTEM
-- =====================================================

-- Media files storage with metadata
CREATE TABLE `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `url` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `folder` varchar(255) DEFAULT 'uploads',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_mime_type` (`mime_type`),
  KEY `idx_folder` (`folder`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_media_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BLOG MANAGEMENT SYSTEM
-- =====================================================

-- Blog posts with full content management
CREATE TABLE `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `allow_comments` tinyint(1) NOT NULL DEFAULT 1,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `read_time` int(11) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_status` (`status`),
  KEY `idx_featured` (`featured`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_views` (`views`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_blogs_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_blogs_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog tags junction table (many-to-many)
CREATE TABLE `blog_tags` (
  `blog_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`blog_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_blog_tags_blog_id` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_blog_tags_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PORTFOLIO MANAGEMENT SYSTEM
-- =====================================================

-- Portfolio items showcase
CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `long_description` longtext DEFAULT NULL,
  `featured_image` varchar(500) NOT NULL,
  `gallery_images` json DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `client_website` varchar(255) DEFAULT NULL,
  `project_url` varchar(255) DEFAULT NULL,
  `technologies` json DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `project_duration` varchar(100) DEFAULT NULL,
  `budget_range` varchar(100) DEFAULT NULL,
  `results_metrics` json DEFAULT NULL,
  `before_image` varchar(500) DEFAULT NULL,
  `after_image` varchar(500) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','archived','draft') NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_featured` (`featured`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_views` (`views`),
  KEY `idx_completion_date` (`completion_date`),
  CONSTRAINT `fk_portfolio_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portfolio tags junction table (many-to-many)
CREATE TABLE `portfolio_tags` (
  `portfolio_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`portfolio_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_portfolio_tags_portfolio_id` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_portfolio_tags_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SERVICES MANAGEMENT SYSTEM
-- =====================================================

-- Services offered with pricing tiers
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `long_description` longtext DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `gallery_images` json DEFAULT NULL,
  `features` json DEFAULT NULL,
  `pricing_tiers` json DEFAULT NULL,
  `delivery_time` varchar(100) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `popular` tinyint(1) NOT NULL DEFAULT 0,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','draft') NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `min_price` decimal(10,2) DEFAULT NULL,
  `max_price` decimal(10,2) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_popular` (`popular`),
  KEY `idx_featured` (`featured`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_min_price` (`min_price`),
  CONSTRAINT `fk_services_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service tags junction table (many-to-many)
CREATE TABLE `service_tags` (
  `service_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`service_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_service_tags_service_id` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_service_tags_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TESTIMONIALS SYSTEM
-- =====================================================

-- Client testimonials and reviews
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `company_website` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `rating` int(1) NOT NULL DEFAULT 5,
  `avatar` varchar(500) DEFAULT NULL,
  `project_type` varchar(255) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service_id` (`service_id`),
  KEY `idx_featured` (`featured`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_testimonials_service_id` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DYNAMIC PAGES SYSTEM
-- =====================================================

-- Custom pages with dynamic content
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `template` varchar(100) DEFAULT 'default',
  `sections` json DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `show_in_menu` tinyint(1) NOT NULL DEFAULT 0,
  `menu_order` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `custom_css` longtext DEFAULT NULL,
  `custom_js` longtext DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `author_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_status` (`status`),
  KEY `idx_show_in_menu` (`show_in_menu`),
  KEY `idx_menu_order` (`menu_order`),
  CONSTRAINT `fk_pages_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `pages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pages_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CAROUSEL/SLIDER SYSTEM
-- =====================================================

-- Homepage carousels and sliders
CREATE TABLE `carousels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `cta_text` varchar(100) DEFAULT NULL,
  `cta_url` varchar(255) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `text_color` varchar(7) DEFAULT '#FFFFFF',
  `overlay_opacity` decimal(3,2) DEFAULT 0.5,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMMUNICATION SYSTEM
-- =====================================================

-- Contact form submissions
CREATE TABLE `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `service` varchar(255) DEFAULT NULL,
  `budget` varchar(100) DEFAULT NULL,
  `timeline` varchar(100) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `assigned_to` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `source` varchar(100) DEFAULT 'website',
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_email` (`email`),
  CONSTRAINT `fk_contacts_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter subscribers
CREATE TABLE `newsletter_subscribers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
  `source` varchar(100) DEFAULT 'website',
  `tags` json DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `unsubscribed_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_source` (`source`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SYSTEM MONITORING & LOGS
-- =====================================================

-- Activity logs for audit trail
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `changes` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_entity` (`entity`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_activity_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System notifications
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `type` enum('system','user','security','content','info') NOT NULL DEFAULT 'info',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `read_at` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_priority` (`priority`),
  KEY `idx_read_at` (`read_at`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

-- Page views tracking for analytics
CREATE TABLE `page_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_type` varchar(50) NOT NULL,
  `page_id` int(11) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_viewed_at` (`viewed_at`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_ip_address` (`ip_address`),
  CONSTRAINT `fk_page_views_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Default system settings
INSERT INTO `settings` (`key`, `value`, `type`, `category`, `label`, `description`, `sort_order`) VALUES
-- General Settings
('site_name', 'Adil GFX', 'text', 'general', 'Site Name', 'The name of your website', 1),
('site_tagline', 'Professional Design Services', 'text', 'general', 'Site Tagline', 'A short description of your site', 2),
('site_description', 'Transform your brand with premium design services. Professional logo design, YouTube thumbnails, and video editing.', 'text', 'general', 'Site Description', 'Description for SEO and social sharing', 3),
('contact_email', 'hello@adilgfx.com', 'email', 'general', 'Contact Email', 'Main contact email address', 4),
('contact_phone', '+1 (555) 123-4567', 'text', 'general', 'Contact Phone', 'Main contact phone number', 5),
('address', '123 Design Street, Creative City, CC 12345', 'text', 'general', 'Address', 'Business address', 6),

-- Branding
('logo_url', '/logo.png', 'file', 'branding', 'Logo URL', 'Main logo image', 1),
('favicon_url', '/favicon.ico', 'file', 'branding', 'Favicon URL', 'Site favicon', 2),
('primary_color', '#FF6B6B', 'color', 'branding', 'Primary Color', 'Main brand color', 3),
('secondary_color', '#4ECDC4', 'color', 'branding', 'Secondary Color', 'Secondary brand color', 4),
('accent_color', '#45B7D1', 'color', 'branding', 'Accent Color', 'Accent color for highlights', 5),

-- SEO Settings
('meta_title', 'Adil GFX - Professional Design Services', 'text', 'seo', 'Meta Title', 'Default page title for SEO', 1),
('meta_description', 'Transform your brand with premium design services. Professional logo design, YouTube thumbnails, and video editing.', 'text', 'seo', 'Meta Description', 'Default meta description', 2),
('meta_keywords', 'logo design, youtube thumbnails, video editing, graphic design, branding', 'text', 'seo', 'Meta Keywords', 'Default meta keywords', 3),
('google_analytics_id', '', 'text', 'seo', 'Google Analytics ID', 'Google Analytics tracking ID', 4),

-- Social Media
('facebook_url', 'https://facebook.com/adilgfx', 'url', 'social', 'Facebook URL', 'Facebook page URL', 1),
('instagram_url', 'https://instagram.com/adilgfx', 'url', 'social', 'Instagram URL', 'Instagram profile URL', 2),
('twitter_url', 'https://twitter.com/adilgfx', 'url', 'social', 'Twitter URL', 'Twitter profile URL', 3),
('linkedin_url', 'https://linkedin.com/company/adilgfx', 'url', 'social', 'LinkedIn URL', 'LinkedIn page URL', 4),
('youtube_url', 'https://youtube.com/@adilgfx', 'url', 'social', 'YouTube URL', 'YouTube channel URL', 5),

-- Features
('enable_blog', '1', 'boolean', 'features', 'Enable Blog', 'Enable/disable blog functionality', 1),
('enable_portfolio', '1', 'boolean', 'features', 'Enable Portfolio', 'Enable/disable portfolio functionality', 2),
('enable_testimonials', '1', 'boolean', 'features', 'Enable Testimonials', 'Enable/disable testimonials', 3),
('enable_contact_form', '1', 'boolean', 'features', 'Enable Contact Form', 'Enable/disable contact form', 4),
('enable_newsletter', '1', 'boolean', 'features', 'Enable Newsletter', 'Enable/disable newsletter signup', 5);

-- Create admin user (password: admin123)
INSERT INTO `users` (`email`, `password`, `name`, `role`, `status`, `email_verified`, `created_at`) VALUES
('admin@adilgfx.com', '$2y$12$LQv3c1yqBwlVHpPjreubu.CQHDcmi6pk2O/.jEIzYiOhs9wvAiBjm', 'Admin User', 'admin', 'active', 1, NOW()),
('editor@adilgfx.com', '$2y$12$LQv3c1yqBwlVHpPjreubu.CQHDcmi6pk2O/.jEIzYiOhs9wvAiBjm', 'Editor User', 'editor', 'active', 1, NOW()),
('user@adilgfx.com', '$2y$12$LQv3c1yqBwlVHpPjreubu.CQHDcmi6pk2O/.jEIzYiOhs9wvAiBjm', 'Regular User', 'user', 'active', 1, NOW());

-- Create user profiles
INSERT INTO `user_profiles` (`user_id`, `phone`, `city`, `country`, `bio`, `preferences`) VALUES
(1, '+1234567890', 'New York', 'USA', 'Administrator and founder of Adil GFX', '{"theme": "light", "notifications": true}'),
(2, '+1234567891', 'Los Angeles', 'USA', 'Content editor and designer', '{"theme": "dark", "notifications": true}'),
(3, '+1234567892', 'London', 'UK', 'Regular user and client', '{"theme": "light", "notifications": false}');

-- Create categories
INSERT INTO `categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('Logo Design', 'logo-design', 'Professional logo design services', '#FF6B6B', 'Palette', 1),
('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching YouTube thumbnail designs', '#4ECDC4', 'Youtube', 2),
('Video Editing', 'video-editing', 'Professional video editing services', '#45B7D1', 'Video', 3),
('Web Design', 'web-design', 'Modern and responsive web design', '#96CEB4', 'Monitor', 4),
('Branding', 'branding', 'Complete branding solutions', '#FFEAA7', 'Award', 5),
('Social Media', 'social-media', 'Social media graphics and content', '#DDA0DD', 'Share2', 6);

-- Create tags
INSERT INTO `tags` (`name`, `slug`, `color`) VALUES
('Creative', 'creative', '#FF6B6B'),
('Professional', 'professional', '#4ECDC4'),
('Modern', 'modern', '#45B7D1'),
('Minimalist', 'minimalist', '#96CEB4'),
('Corporate', 'corporate', '#FFEAA7'),
('Colorful', 'colorful', '#DDA0DD'),
('Gaming', 'gaming', '#FF9FF3'),
('Tech', 'tech', '#54A0FF'),
('Business', 'business', '#5F27CD'),
('Startup', 'startup', '#00D2D3');

COMMIT;

-- =====================================================
-- SCHEMA COMPLETE
-- Total Tables: 20
-- Total Relationships: 15+ Foreign Keys
-- Features: Users, Auth, Content, Media, Analytics, Logs
-- =====================================================