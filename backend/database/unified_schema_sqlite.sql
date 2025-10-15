-- =====================================================
-- Adil GFX Platform - Unified SQLite Database Schema
-- =====================================================
-- Complete database schema with all tables and sample data
-- Optimized for SQLite with proper data types and constraints
-- =====================================================

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS "page_views";
DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "activity_logs";
DROP TABLE IF EXISTS "newsletter_subscribers";
DROP TABLE IF EXISTS "contacts";
DROP TABLE IF EXISTS "carousels";
DROP TABLE IF EXISTS "pages";
DROP TABLE IF EXISTS "testimonials";
DROP TABLE IF EXISTS "service_tags";
DROP TABLE IF EXISTS "services";
DROP TABLE IF EXISTS "portfolio_tags";
DROP TABLE IF EXISTS "portfolio";
DROP TABLE IF EXISTS "blog_tags";
DROP TABLE IF EXISTS "blogs";
DROP TABLE IF EXISTS "media";
DROP TABLE IF EXISTS "tags";
DROP TABLE IF EXISTS "categories";
DROP TABLE IF EXISTS "user_sessions";
DROP TABLE IF EXISTS "user_profiles";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "settings";

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Site Settings Table
CREATE TABLE "settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "email_verified" INTEGER NOT NULL DEFAULT 0,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_expires" DATETIME,
    "login_attempts" INTEGER DEFAULT 0,
    "locked_until" DATETIME,
    "last_login" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE "user_profiles" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "bio" TEXT,
    "website" TEXT,
    "social_links" TEXT, -- JSON
    "preferences" TEXT, -- JSON
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- User Sessions Table
CREATE TABLE "user_sessions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires_at" DATETIME NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- =====================================================
-- CONTENT MANAGEMENT TABLES
-- =====================================================

-- Categories Table
CREATE TABLE "categories" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "parent_id" INTEGER,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL
);

-- Tags Table
CREATE TABLE "tags" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "color" TEXT,
    "usage_count" INTEGER DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Media Files Table
CREATE TABLE "media" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "dimensions" TEXT, -- JSON for width/height
    "alt_text" TEXT,
    "caption" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Blog Posts Table
CREATE TABLE "blogs" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featured_image" TEXT,
    "category_id" INTEGER,
    "author_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" INTEGER NOT NULL DEFAULT 0,
    "published" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER DEFAULT 0,
    "likes" INTEGER DEFAULT 0,
    "read_time" INTEGER DEFAULT 5,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "published_at" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL,
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Blog Tags Junction Table
CREATE TABLE "blog_tags" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "blog_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE,
    UNIQUE("blog_id", "tag_id")
);

-- Portfolio Items Table
CREATE TABLE "portfolio" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "long_description" TEXT,
    "featured_image" TEXT NOT NULL,
    "gallery_images" TEXT, -- JSON array
    "category_id" INTEGER,
    "client_name" TEXT,
    "client_website" TEXT,
    "project_url" TEXT,
    "completion_date" DATE,
    "technologies" TEXT, -- JSON array
    "results" TEXT, -- JSON object
    "status" TEXT NOT NULL DEFAULT 'active',
    "featured" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER DEFAULT 0,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
);

-- Portfolio Tags Junction Table
CREATE TABLE "portfolio_tags" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "portfolio_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE,
    UNIQUE("portfolio_id", "tag_id")
);

-- Services Table
CREATE TABLE "services" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "long_description" TEXT,
    "icon" TEXT,
    "featured_image" TEXT,
    "category_id" INTEGER,
    "features" TEXT, -- JSON array
    "pricing_tiers" TEXT, -- JSON array
    "delivery_time" TEXT,
    "popular" INTEGER NOT NULL DEFAULT 0,
    "active" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
);

-- Service Tags Junction Table
CREATE TABLE "service_tags" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "service_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE,
    UNIQUE("service_id", "tag_id")
);

-- Testimonials Table
CREATE TABLE "testimonials" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT,
    "position" TEXT,
    "avatar" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "service_id" INTEGER,
    "project_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "featured" INTEGER NOT NULL DEFAULT 0,
    "approved_by" INTEGER,
    "approved_at" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL,
    FOREIGN KEY ("project_id") REFERENCES "portfolio"("id") ON DELETE SET NULL,
    FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Dynamic Pages Table
CREATE TABLE "pages" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "template" TEXT DEFAULT 'default',
    "sections" TEXT, -- JSON for flexible page sections
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" INTEGER NOT NULL DEFAULT 0,
    "author_id" INTEGER NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "published_at" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Carousel Slides Table
CREATE TABLE "carousels" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link_url" TEXT,
    "link_text" TEXT,
    "active" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COMMUNICATION TABLES
-- =====================================================

-- Contact Form Submissions Table
CREATE TABLE "contacts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "service_interest" TEXT,
    "budget_range" TEXT,
    "timeline" TEXT,
    "source" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "responded_at" DATETIME,
    "responded_by" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Newsletter Subscribers Table
CREATE TABLE "newsletter_subscribers" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT,
    "interests" TEXT, -- JSON array
    "subscribed_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SYSTEM MONITORING TABLES
-- =====================================================

-- Activity Logs Table
CREATE TABLE "activity_logs" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" INTEGER,
    "description" TEXT NOT NULL,
    "changes" TEXT, -- JSON
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- System Notifications Table
CREATE TABLE "notifications" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "metadata" TEXT, -- JSON
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "is_read" INTEGER NOT NULL DEFAULT 0,
    "read_at" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page Views Analytics Table
CREATE TABLE "page_views" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "page_url" TEXT NOT NULL,
    "page_title" TEXT,
    "referrer" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "session_id" TEXT,
    "user_id" INTEGER,
    "viewed_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_status" ON "users"("status");

-- Content indexes
CREATE INDEX "idx_blogs_slug" ON "blogs"("slug");
CREATE INDEX "idx_blogs_status" ON "blogs"("status");
CREATE INDEX "idx_blogs_featured" ON "blogs"("featured");
CREATE INDEX "idx_blogs_published" ON "blogs"("published");
CREATE INDEX "idx_blogs_category" ON "blogs"("category_id");
CREATE INDEX "idx_blogs_author" ON "blogs"("author_id");

CREATE INDEX "idx_portfolio_slug" ON "portfolio"("slug");
CREATE INDEX "idx_portfolio_status" ON "portfolio"("status");
CREATE INDEX "idx_portfolio_featured" ON "portfolio"("featured");
CREATE INDEX "idx_portfolio_category" ON "portfolio"("category_id");

CREATE INDEX "idx_services_slug" ON "services"("slug");
CREATE INDEX "idx_services_active" ON "services"("active");
CREATE INDEX "idx_services_popular" ON "services"("popular");

-- System indexes
CREATE INDEX "idx_settings_key" ON "settings"("key");
CREATE INDEX "idx_settings_category" ON "settings"("category");
CREATE INDEX "idx_activity_logs_user" ON "activity_logs"("user_id");
CREATE INDEX "idx_activity_logs_entity" ON "activity_logs"("entity", "entity_id");
CREATE INDEX "idx_notifications_read" ON "notifications"("is_read");

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert System Settings
INSERT INTO "settings" ("key", "value", "type", "category", "description") VALUES
('site_name', 'Adil GFX', 'text', 'general', 'Website name'),
('site_tagline', 'Professional Design Services', 'text', 'general', 'Website tagline'),
('site_description', 'Premium logo design, YouTube thumbnails, and video editing services', 'textarea', 'general', 'Website description'),
('contact_email', 'hello@adilgfx.com', 'email', 'general', 'Primary contact email'),
('contact_phone', '+1 (555) 123-4567', 'text', 'general', 'Contact phone number'),
('address', '123 Design Street, Creative City, CC 12345', 'textarea', 'general', 'Business address'),
('logo_url', '/images/logo.png', 'url', 'appearance', 'Website logo URL'),
('favicon_url', '/images/favicon.ico', 'url', 'appearance', 'Favicon URL'),
('primary_color', '#3B82F6', 'color', 'appearance', 'Primary brand color'),
('secondary_color', '#1E40AF', 'color', 'appearance', 'Secondary brand color'),
('facebook_url', 'https://facebook.com/adilgfx', 'url', 'social', 'Facebook page URL'),
('twitter_url', 'https://twitter.com/adilgfx', 'url', 'social', 'Twitter profile URL'),
('instagram_url', 'https://instagram.com/adilgfx', 'url', 'social', 'Instagram profile URL'),
('linkedin_url', 'https://linkedin.com/company/adilgfx', 'url', 'social', 'LinkedIn page URL'),
('youtube_url', 'https://youtube.com/@adilgfx', 'url', 'social', 'YouTube channel URL'),
('seo_title', 'Adil GFX - Professional Design Services', 'text', 'seo', 'Default SEO title'),
('seo_description', 'Get premium logo design, YouTube thumbnails, and video editing services. Professional quality, fast delivery, affordable prices.', 'textarea', 'seo', 'Default SEO description'),
('seo_keywords', 'logo design, youtube thumbnails, video editing, graphic design, branding', 'textarea', 'seo', 'Default SEO keywords'),
('google_analytics_id', '', 'text', 'analytics', 'Google Analytics tracking ID'),
('facebook_pixel_id', '', 'text', 'analytics', 'Facebook Pixel ID'),
('maintenance_mode', '0', 'boolean', 'system', 'Enable maintenance mode');

-- Insert Default Users
INSERT INTO "users" ("email", "password", "name", "role", "status", "email_verified", "created_at") VALUES
('admin@adilgfx.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', 'active', 1, datetime('now')),
('editor@adilgfx.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor User', 'editor', 'active', 1, datetime('now')),
('user@adilgfx.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', 'user', 'active', 1, datetime('now'));

-- Insert User Profiles
INSERT INTO "user_profiles" ("user_id", "bio", "timezone", "language", "preferences") VALUES
(1, 'System Administrator with full access to all features.', 'UTC', 'en', '{"theme":"light","notifications":true}'),
(2, 'Content Editor responsible for managing blog posts and portfolio.', 'UTC', 'en', '{"theme":"light","notifications":true}'),
(3, 'Regular user account for testing purposes.', 'UTC', 'en', '{"theme":"light","notifications":false}');

-- Insert Categories
INSERT INTO "categories" ("name", "slug", "description", "color", "icon") VALUES
('Logo Design', 'logo-design', 'Professional logo design services', '#3B82F6', 'palette'),
('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching YouTube thumbnail designs', '#FF0000', 'play-circle'),
('Video Editing', 'video-editing', 'Professional video editing and post-production', '#8B5CF6', 'film'),
('Web Design', 'web-design', 'Modern and responsive web design', '#10B981', 'globe'),
('Branding', 'branding', 'Complete brand identity packages', '#F59E0B', 'star'),
('Social Media', 'social-media', 'Social media graphics and content', '#EC4899', 'share');

-- Insert Tags
INSERT INTO "tags" ("name", "slug", "color") VALUES
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
INSERT INTO "services" ("name", "slug", "tagline", "description", "long_description", "icon", "category_id", "features", "pricing_tiers", "delivery_time", "popular", "active") VALUES
('Premium Logo Design', 'premium-logo-design', 'Stand out with a unique brand identity', 'Professional logo design that captures your brand essence and makes you memorable.', 'Our premium logo design service includes comprehensive brand research, multiple concept development, unlimited revisions, and complete file packages. We work closely with you to understand your vision and create a logo that truly represents your brand values and appeals to your target audience.', 'palette', 1, '["Multiple concepts", "Unlimited revisions", "Vector files included", "Brand guidelines", "Commercial license"]', '[{"name":"Basic","price":99,"duration":"3-5 days","features":["3 logo concepts","2 revisions","PNG & JPG files"]},{"name":"Standard","price":199,"duration":"5-7 days","features":["5 logo concepts","Unlimited revisions","All file formats","Basic brand guide"],"popular":true},{"name":"Premium","price":399,"duration":"7-10 days","features":["10 logo concepts","Unlimited revisions","Complete brand package","Style guide","Business card design"]}]', '3-10 days', 1, 1),

('YouTube Thumbnail Design', 'youtube-thumbnail-design', 'Boost your video views instantly', 'Eye-catching YouTube thumbnails that increase click-through rates and grow your channel.', 'Our YouTube thumbnail design service is specifically crafted to maximize your video performance. We understand YouTube algorithm preferences and design thumbnails that stand out in search results and suggested videos. Each thumbnail is optimized for mobile viewing and includes compelling visual elements that encourage clicks.', 'play-circle', 2, '["High CTR designs", "Mobile optimized", "A/B testing options", "Quick turnaround", "YouTube compliant"]', '[{"name":"Single","price":25,"duration":"24 hours","features":["1 custom thumbnail","2 revisions","HD quality"]},{"name":"Pack of 5","price":99,"duration":"2-3 days","features":["5 custom thumbnails","Unlimited revisions","HD quality","Bonus template"],"popular":true},{"name":"Monthly","price":299,"duration":"Ongoing","features":["20 thumbnails/month","Priority support","Custom templates","Analytics insights"]}]', '24-72 hours', 1, 1),

('Video Editing Pro', 'video-editing-pro', 'Transform raw footage into cinematic content', 'Professional video editing with color grading, sound design, and motion graphics.', 'Our professional video editing service transforms your raw footage into polished, engaging content. We handle everything from basic cuts and transitions to advanced color grading, audio mixing, and motion graphics. Whether it\'s for YouTube, social media, or commercial use, we ensure your videos look professional and captivating.', 'film', 3, '["Color grading", "Sound design", "Motion graphics", "Multi-format export", "Revision rounds"]', '[{"name":"Basic Edit","price":150,"duration":"3-5 days","features":["Basic cuts & transitions","Color correction","Audio sync","HD export"]},{"name":"Professional","price":350,"duration":"5-7 days","features":["Advanced editing","Color grading","Sound design","Motion graphics","4K export"],"popular":true},{"name":"Cinematic","price":750,"duration":"7-14 days","features":["Full post-production","Advanced VFX","Custom graphics","Sound mixing","Multiple formats"]}]', '3-14 days', 1, 1),

('Brand Identity Package', 'brand-identity-package', 'Complete brand transformation', 'Comprehensive branding solution including logo, colors, fonts, and brand guidelines.', 'Our complete brand identity package provides everything you need to establish a strong, consistent brand presence. This comprehensive service includes logo design, color palette development, typography selection, brand voice definition, and detailed brand guidelines. Perfect for startups and businesses looking to rebrand or establish their visual identity.', 'star', 5, '["Logo design", "Color palette", "Typography", "Brand guidelines", "Marketing materials"]', '[{"name":"Startup","price":599,"duration":"2-3 weeks","features":["Logo design","Color palette","Basic guidelines","Business card"]},{"name":"Business","price":1299,"duration":"3-4 weeks","features":["Complete identity","Detailed guidelines","Stationery design","Social media kit"],"popular":true},{"name":"Enterprise","price":2499,"duration":"4-6 weeks","features":["Full brand system","Marketing materials","Website mockups","Brand strategy"]}]', '2-6 weeks', 0, 1),

('Social Media Graphics', 'social-media-graphics', 'Consistent visual presence across platforms', 'Custom social media graphics that maintain brand consistency and drive engagement.', 'Keep your social media presence fresh and engaging with our custom graphics service. We create platform-specific designs optimized for each social network\'s requirements and best practices. From Instagram posts to Facebook covers, we ensure your brand looks professional and consistent across all platforms.', 'share', 6, '["Platform optimized", "Brand consistent", "Engagement focused", "Template creation", "Quick delivery"]', '[{"name":"Basic Pack","price":149,"duration":"2-3 days","features":["10 social posts","2 platforms","Basic templates"]},{"name":"Growth Pack","price":299,"duration":"3-5 days","features":["25 social posts","All platforms","Custom templates","Story designs"],"popular":true},{"name":"Pro Pack","price":599,"duration":"5-7 days","features":["50 social posts","Animated versions","Video templates","Monthly updates"]}]', '2-7 days', 0, 1);

-- Insert Sample Portfolio Items
INSERT INTO "portfolio" ("title", "slug", "description", "long_description", "featured_image", "gallery_images", "category_id", "client_name", "project_url", "completion_date", "technologies", "results", "status", "featured") VALUES
('TechStart Logo Design', 'techstart-logo-design', 'Modern logo design for a technology startup', 'Created a clean, modern logo for TechStart that reflects innovation and reliability. The design process involved extensive research into the tech industry and competitor analysis to ensure uniqueness. The final logo works perfectly across digital and print media.', '/images/portfolio/techstart-logo.jpg', '["\/images\/portfolio\/techstart-1.jpg","\/images\/portfolio\/techstart-2.jpg","\/images\/portfolio\/techstart-3.jpg"]', 1, 'TechStart Inc.', 'https://techstart.com', '2024-01-15', '["Adobe Illustrator","Photoshop"]', '{"client_satisfaction":"100%","delivery_time":"5 days","revisions":"3"}', 'active', 1),

('Gaming Channel Rebrand', 'gaming-channel-rebrand', 'Complete YouTube channel branding for gaming content creator', 'Comprehensive rebranding project for a gaming YouTube channel with 500K subscribers. Included logo design, channel art, thumbnail templates, and overlay graphics. The new branding increased subscriber engagement by 40% and improved brand recognition.', '/images/portfolio/gaming-rebrand.jpg', '["\/images\/portfolio\/gaming-1.jpg","\/images\/portfolio\/gaming-2.jpg","\/images\/portfolio\/gaming-3.jpg"]', 2, 'GameMaster Pro', 'https://youtube.com/@gamemasterpro', '2024-02-20', '["Adobe Creative Suite","After Effects"]', '{"subscriber_growth":"25%","engagement_increase":"40%","brand_recognition":"85%"}', 'active', 1),

('Corporate Video Production', 'corporate-video-production', 'Professional corporate video with motion graphics', 'Produced a 3-minute corporate video for a financial services company. The project included scriptwriting consultation, professional editing, custom motion graphics, and sound design. The video effectively communicated the company\'s values and services.', '/images/portfolio/corporate-video.jpg', '["\/images\/portfolio\/corporate-1.jpg","\/images\/portfolio\/corporate-2.jpg"]', 3, 'FinanceFlow LLC', 'https://financeflow.com', '2024-03-10', '["Premiere Pro","After Effects","Audition"]', '{"client_approval":"First draft","usage":"Website & social","views":"50K+"}', 'active', 0),

('Restaurant Brand Identity', 'restaurant-brand-identity', 'Complete branding package for upscale restaurant', 'Developed a sophisticated brand identity for an upscale restaurant including logo, menu design, signage concepts, and marketing materials. The design captures the restaurant\'s elegant atmosphere while remaining approachable and memorable.', '/images/portfolio/restaurant-brand.jpg', '["\/images\/portfolio\/restaurant-1.jpg","\/images\/portfolio\/restaurant-2.jpg","\/images\/portfolio\/restaurant-3.jpg"]', 5, 'Bella Vista Restaurant', 'https://bellavista.com', '2024-01-30', '["Adobe Creative Suite","InDesign"]', '{"brand_recognition":"90%","customer_feedback":"Excellent","implementation":"Full rollout"}', 'active', 1);

-- Insert Sample Blog Posts
INSERT INTO "blogs" ("title", "slug", "excerpt", "content", "featured_image", "category_id", "author_id", "status", "featured", "published", "views", "read_time", "published_at") VALUES
('10 Logo Design Trends for 2024', '10-logo-design-trends-2024', 'Discover the latest logo design trends that will dominate 2024 and how to incorporate them into your brand identity.', 'Logo design is constantly evolving, and 2024 brings exciting new trends that blend creativity with functionality. In this comprehensive guide, we explore the top 10 trends that are shaping the industry...\n\n## 1. Minimalist Geometry\n\nClean geometric shapes continue to dominate, but with subtle twists that add personality without complexity.\n\n## 2. Dynamic Gradients\n\nGradients are making a comeback, but they\'re more sophisticated than ever, creating depth and movement.\n\n## 3. Custom Typography\n\nBrands are investing in unique typefaces that become part of their identity.\n\n## 4. Sustainable Design\n\nEco-conscious design elements that reflect brand values around sustainability.\n\n## 5. Retro Futurism\n\nA blend of nostalgic elements with futuristic aesthetics.\n\nThese trends offer exciting opportunities for brands to stand out while maintaining timeless appeal.', '/images/blog/logo-trends-2024.jpg', 1, 1, 'published', 1, 1, 1250, 8, '2024-01-05 10:00:00'),

('YouTube Thumbnail Psychology: What Makes Viewers Click', 'youtube-thumbnail-psychology', 'Understanding the psychological triggers that make thumbnails irresistible and how to apply them to your content.', 'The psychology behind YouTube thumbnails is fascinating and crucial for content creators. Research shows that viewers decide whether to click on a video within milliseconds of seeing the thumbnail...\n\n## The Science of First Impressions\n\nHuman brains process visual information incredibly quickly. Studies show that it takes just 13 milliseconds for our brains to process an image.\n\n## Color Psychology in Thumbnails\n\nDifferent colors evoke different emotions:\n- Red: Urgency, excitement\n- Blue: Trust, professionalism\n- Yellow: Happiness, attention\n- Green: Growth, harmony\n\n## The Power of Faces\n\nThumbnails with human faces perform 30% better than those without. The key is authentic expressions that match your content.\n\n## Text Hierarchy\n\nEffective thumbnails use text strategically:\n1. Large, bold headlines\n2. Contrasting colors\n3. Easy-to-read fonts\n4. Minimal word count\n\nBy understanding these psychological principles, you can create thumbnails that not only attract clicks but also set proper expectations for your content.', '/images/blog/thumbnail-psychology.jpg', 2, 1, 'published', 1, 1, 980, 6, '2024-01-12 14:30:00'),

('Video Editing Workflow: From Raw Footage to Final Cut', 'video-editing-workflow', 'A step-by-step guide to professional video editing workflow that ensures efficiency and quality results.', 'Professional video editing requires a systematic approach that balances creativity with efficiency. Here\'s our proven workflow that delivers consistent, high-quality results...\n\n## Pre-Production Planning\n\nBefore touching any footage:\n1. Review all raw materials\n2. Create a project structure\n3. Backup original files\n4. Set project specifications\n\n## Organization Phase\n\n### File Management\n- Create consistent naming conventions\n- Organize footage by scenes/topics\n- Separate audio, video, and graphics\n- Use bins and folders effectively\n\n### Timeline Setup\n- Configure sequence settings\n- Set up audio tracks\n- Create color coding system\n- Establish keyboard shortcuts\n\n## Editing Process\n\n### Assembly Edit\n1. Rough cut assembly\n2. Story structure review\n3. Pacing adjustments\n4. Content verification\n\n### Fine Cut\n1. Detailed trimming\n2. Transition additions\n3. Audio synchronization\n4. Color correction basics\n\n## Post-Production Polish\n\n### Color Grading\n- Primary color correction\n- Secondary adjustments\n- Look development\n- Consistency checks\n\n### Audio Mixing\n- Level balancing\n- EQ adjustments\n- Noise reduction\n- Final mix review\n\n### Final Delivery\n- Export settings optimization\n- Quality control review\n- Multiple format delivery\n- Archive organization\n\nThis workflow ensures that every project maintains professional standards while meeting deadlines efficiently.', '/images/blog/video-editing-workflow.jpg', 3, 2, 'published', 0, 1, 756, 10, '2024-01-18 09:15:00');

-- Insert Sample Testimonials
INSERT INTO "testimonials" ("name", "email", "company", "position", "content", "rating", "service_id", "status", "featured", "approved_by", "approved_at") VALUES
('Sarah Johnson', 'sarah@techstart.com', 'TechStart Inc.', 'CEO', 'Adil GFX delivered an exceptional logo that perfectly captures our brand vision. The process was smooth, professional, and the final result exceeded our expectations. Highly recommended!', 5, 1, 'approved', 1, 1, '2024-01-16 10:00:00'),

('Mike Chen', 'mike@gamemasterpro.com', 'GameMaster Pro', 'Content Creator', 'The YouTube thumbnail designs have transformed my channel! My click-through rate increased by 40% and the thumbnails perfectly match my gaming content style. Amazing work!', 5, 2, 'approved', 1, 1, '2024-02-22 15:30:00'),

('Emily Rodriguez', 'emily@financeflow.com', 'FinanceFlow LLC', 'Marketing Director', 'The corporate video production was outstanding. From concept to final delivery, the team was professional, creative, and delivered exactly what we needed for our marketing campaign.', 5, 3, 'approved', 1, 1, '2024-03-12 11:45:00'),

('David Thompson', 'david@bellavista.com', 'Bella Vista Restaurant', 'Owner', 'The complete brand identity package transformed our restaurant\'s image. The logo, menu design, and marketing materials all work together beautifully. Our customers love the new look!', 5, 4, 'approved', 1, 1, '2024-02-02 16:20:00'),

('Lisa Wang', 'lisa@creativestudio.com', 'Creative Studio', 'Art Director', 'Working with Adil GFX on our social media graphics has been a game-changer. The designs are always on-brand, engaging, and delivered on time. Perfect for our fast-paced environment.', 5, 5, 'approved', 0, 1, '2024-01-25 13:10:00');

-- Insert Sample Carousel Slides
INSERT INTO "carousels" ("name", "title", "subtitle", "description", "image", "link_url", "link_text", "active", "sort_order") VALUES
('hero', 'Transform Your Brand Identity', 'Professional Design Services', 'Get premium logo design, YouTube thumbnails, and video editing services that make your brand stand out from the competition.', '/images/hero/slide-1.jpg', '/services', 'Explore Services', 1, 1),
('hero', 'Boost Your YouTube Channel', 'Eye-Catching Thumbnails That Convert', 'Increase your click-through rates and grow your audience with professionally designed YouTube thumbnails optimized for maximum engagement.', '/images/hero/slide-2.jpg', '/services/youtube-thumbnail-design', 'Get Thumbnails', 1, 2),
('hero', 'Professional Video Production', 'From Raw Footage to Cinematic Content', 'Transform your videos with professional editing, color grading, sound design, and motion graphics that captivate your audience.', '/images/hero/slide-3.jpg', '/services/video-editing-pro', 'Start Project', 1, 3);

-- Insert Sample Notifications
INSERT INTO "notifications" ("type", "title", "message", "priority", "is_read") VALUES
('system', 'Welcome to Adil GFX', 'Your website has been successfully set up with sample data. You can now customize content and settings.', 'high', 0),
('content', 'New Blog Post Published', 'The blog post "10 Logo Design Trends for 2024" has been published and is now live on your website.', 'medium', 0),
('user', 'New Contact Submission', 'You have received a new contact form submission that requires your attention.', 'high', 0);

-- Insert Sample Activity Logs
INSERT INTO "activity_logs" ("user_id", "action", "entity", "entity_id", "description", "ip_address") VALUES
(1, 'create', 'blog', 1, 'Created blog post: 10 Logo Design Trends for 2024', '127.0.0.1'),
(1, 'create', 'service', 1, 'Created service: Premium Logo Design', '127.0.0.1'),
(1, 'create', 'portfolio', 1, 'Created portfolio item: TechStart Logo Design', '127.0.0.1'),
(2, 'create', 'blog', 3, 'Created blog post: Video Editing Workflow', '127.0.0.1'),
(1, 'update', 'settings', 1, 'Updated site settings', '127.0.0.1');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================