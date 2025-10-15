-- =====================================================
-- Sample Data for Adil GFX Database
-- =====================================================

USE `adilgfx_db`;

-- =====================================================
-- ADMIN USER & SAMPLE USERS
-- =====================================================

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

-- =====================================================
-- CATEGORIES & TAGS
-- =====================================================

-- Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('Logo Design', 'logo-design', 'Professional logo design services', '#FF6B6B', 'Palette', 1),
('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching YouTube thumbnail designs', '#4ECDC4', 'Youtube', 2),
('Video Editing', 'video-editing', 'Professional video editing services', '#45B7D1', 'Video', 3),
('Web Design', 'web-design', 'Modern and responsive web design', '#96CEB4', 'Monitor', 4),
('Branding', 'branding', 'Complete branding solutions', '#FFEAA7', 'Award', 5),
('Social Media', 'social-media', 'Social media graphics and content', '#DDA0DD', 'Share2', 6);

-- Tags
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

-- =====================================================
-- SYSTEM SETTINGS
-- =====================================================

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
('google_search_console', '', 'text', 'seo', 'Google Search Console', 'Google Search Console verification', 5),

-- Social Media
('facebook_url', 'https://facebook.com/adilgfx', 'url', 'social', 'Facebook URL', 'Facebook page URL', 1),
('instagram_url', 'https://instagram.com/adilgfx', 'url', 'social', 'Instagram URL', 'Instagram profile URL', 2),
('twitter_url', 'https://twitter.com/adilgfx', 'url', 'social', 'Twitter URL', 'Twitter profile URL', 3),
('linkedin_url', 'https://linkedin.com/company/adilgfx', 'url', 'social', 'LinkedIn URL', 'LinkedIn page URL', 4),
('youtube_url', 'https://youtube.com/@adilgfx', 'url', 'social', 'YouTube URL', 'YouTube channel URL', 5),
('behance_url', 'https://behance.net/adilgfx', 'url', 'social', 'Behance URL', 'Behance profile URL', 6),
('dribbble_url', 'https://dribbble.com/adilgfx', 'url', 'social', 'Dribbble URL', 'Dribbble profile URL', 7),

-- Features
('enable_blog', '1', 'boolean', 'features', 'Enable Blog', 'Enable/disable blog functionality', 1),
('enable_portfolio', '1', 'boolean', 'features', 'Enable Portfolio', 'Enable/disable portfolio functionality', 2),
('enable_testimonials', '1', 'boolean', 'features', 'Enable Testimonials', 'Enable/disable testimonials', 3),
('enable_contact_form', '1', 'boolean', 'features', 'Enable Contact Form', 'Enable/disable contact form', 4),
('enable_newsletter', '1', 'boolean', 'features', 'Enable Newsletter', 'Enable/disable newsletter signup', 5),
('enable_comments', '1', 'boolean', 'features', 'Enable Comments', 'Enable/disable blog comments', 6),

-- Email Settings
('smtp_host', 'smtp.gmail.com', 'text', 'email', 'SMTP Host', 'SMTP server hostname', 1),
('smtp_port', '587', 'number', 'email', 'SMTP Port', 'SMTP server port', 2),
('smtp_username', '', 'text', 'email', 'SMTP Username', 'SMTP username', 3),
('smtp_password', '', 'text', 'email', 'SMTP Password', 'SMTP password', 4),
('from_email', 'hello@adilgfx.com', 'email', 'email', 'From Email', 'Default sender email', 5),
('from_name', 'Adil GFX', 'text', 'email', 'From Name', 'Default sender name', 6);

-- =====================================================
-- SAMPLE SERVICES
-- =====================================================

INSERT INTO `services` (`name`, `slug`, `tagline`, `description`, `long_description`, `icon`, `features`, `pricing_tiers`, `delivery_time`, `category_id`, `popular`, `featured`, `status`, `sort_order`, `min_price`, `max_price`) VALUES
('Logo Design', 'logo-design', 'Professional Brand Identity', 'Create a memorable brand identity with custom logo design that represents your business perfectly.', 'Our logo design service includes comprehensive brand research, multiple concept development, unlimited revisions, and final delivery in all formats. We create logos that are memorable, scalable, and timeless.', 'Palette', 
'["Custom design concepts", "Unlimited revisions", "Vector files included", "Brand guidelines", "Multiple file formats", "Commercial license"]',
'[{"name": "Basic", "price": 99, "duration": "3-5 days", "features": ["1 logo concept", "3 revisions", "PNG & JPG files"], "popular": false}, {"name": "Standard", "price": 199, "duration": "5-7 days", "features": ["3 logo concepts", "Unlimited revisions", "Vector files", "Brand guidelines"], "popular": true}, {"name": "Premium", "price": 399, "duration": "7-10 days", "features": ["5 logo concepts", "Unlimited revisions", "Complete brand package", "Social media kit", "Business card design"], "popular": false}]',
'3-10 days', 1, 1, 1, 'active', 1, 99.00, 399.00),

('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-Catching Thumbnails', 'Boost your YouTube views with custom thumbnail designs that grab attention and increase click-through rates.', 'Our YouTube thumbnail service focuses on creating eye-catching designs that stand out in search results and suggested videos. We understand YouTube algorithm preferences and design accordingly.', 'Youtube',
'["High-resolution designs", "A/B testing options", "Quick turnaround", "Unlimited revisions", "YouTube optimized", "Trend-aware designs"]',
'[{"name": "Single", "price": 25, "duration": "24 hours", "features": ["1 thumbnail design", "2 revisions", "High-res PNG"], "popular": false}, {"name": "Pack of 5", "price": 99, "duration": "3 days", "features": ["5 thumbnail designs", "Unlimited revisions", "Source files included"], "popular": true}, {"name": "Monthly", "price": 299, "duration": "Ongoing", "features": ["20 thumbnails per month", "Priority support", "A/B testing variants", "Analytics consultation"], "popular": false}]',
'24 hours - 3 days', 2, 1, 1, 'active', 2, 25.00, 299.00),

('Video Editing', 'video-editing', 'Professional Video Production', 'Transform your raw footage into engaging videos with professional editing, effects, and post-production.', 'Our video editing service covers everything from basic cuts to advanced motion graphics. We work with all video formats and can handle projects of any complexity.', 'Video',
'["Professional editing", "Color correction", "Audio enhancement", "Motion graphics", "Multiple formats", "Fast delivery"]',
'[{"name": "Basic Edit", "price": 149, "duration": "3-5 days", "features": ["Basic cuts and transitions", "Color correction", "Audio sync", "Up to 5 minutes"], "popular": false}, {"name": "Advanced Edit", "price": 299, "duration": "5-7 days", "features": ["Advanced editing", "Motion graphics", "Sound design", "Up to 15 minutes"], "popular": true}, {"name": "Premium Production", "price": 599, "duration": "7-14 days", "features": ["Complete post-production", "Custom animations", "Professional sound mix", "Unlimited length"], "popular": false}]',
'3-14 days', 3, 1, 1, 'active', 3, 149.00, 599.00),

('Web Design', 'web-design', 'Modern Website Solutions', 'Create stunning, responsive websites that convert visitors into customers with our modern web design service.', 'We design and develop modern, responsive websites that look great on all devices. Our process includes UX research, wireframing, design, and development.', 'Monitor',
'["Responsive design", "SEO optimized", "Fast loading", "Modern UI/UX", "CMS integration", "Mobile-first approach"]',
'[{"name": "Landing Page", "price": 499, "duration": "5-7 days", "features": ["Single page design", "Responsive layout", "Contact form", "SEO basics"], "popular": false}, {"name": "Business Website", "price": 999, "duration": "10-14 days", "features": ["Up to 5 pages", "CMS integration", "SEO optimization", "Contact forms", "Analytics setup"], "popular": true}, {"name": "E-commerce", "price": 1999, "duration": "14-21 days", "features": ["Full e-commerce site", "Payment integration", "Product management", "Order tracking", "Admin panel"], "popular": false}]',
'5-21 days', 4, 0, 1, 'active', 4, 499.00, 1999.00),

('Branding Package', 'branding-package', 'Complete Brand Identity', 'Get a complete brand identity package including logo, business cards, letterhead, and brand guidelines.', 'Our comprehensive branding package includes everything you need to establish a professional brand identity. From logo design to complete brand guidelines.', 'Award',
'["Logo design", "Business cards", "Letterhead design", "Brand guidelines", "Social media kit", "Email signature"]',
'[{"name": "Startup", "price": 799, "duration": "7-10 days", "features": ["Logo design", "Business card", "Letterhead", "Basic brand guide"], "popular": false}, {"name": "Business", "price": 1299, "duration": "10-14 days", "features": ["Complete logo package", "Stationery design", "Social media kit", "Comprehensive brand guide"], "popular": true}, {"name": "Enterprise", "price": 2499, "duration": "14-21 days", "features": ["Full brand identity", "Marketing materials", "Website design", "Brand strategy consultation"], "popular": false}]',
'7-21 days', 5, 0, 1, 'active', 5, 799.00, 2499.00),

('Social Media Graphics', 'social-media-graphics', 'Engaging Social Content', 'Create consistent, engaging social media graphics that boost your online presence and engagement.', 'Our social media graphics service helps you maintain a consistent brand presence across all social platforms with custom-designed posts, stories, and covers.', 'Share2',
'["Platform-specific sizes", "Brand consistency", "Engaging designs", "Quick turnaround", "Multiple formats", "Content calendar support"]',
'[{"name": "Basic Pack", "price": 199, "duration": "3-5 days", "features": ["10 social media posts", "2 platforms", "Basic templates"], "popular": false}, {"name": "Standard Pack", "price": 399, "duration": "5-7 days", "features": ["25 social media posts", "All major platforms", "Custom designs", "Stories templates"], "popular": true}, {"name": "Premium Pack", "price": 699, "duration": "7-10 days", "features": ["50+ designs", "All platforms", "Animated posts", "Content calendar", "Monthly updates"], "popular": false}]',
'3-10 days', 6, 1, 0, 'active', 6, 199.00, 699.00);

-- =====================================================
-- SAMPLE PORTFOLIO ITEMS
-- =====================================================

INSERT INTO `portfolio` (`title`, `slug`, `description`, `long_description`, `featured_image`, `gallery_images`, `category_id`, `client_name`, `project_url`, `technologies`, `completion_date`, `project_duration`, `results_metrics`, `featured`, `status`, `sort_order`) VALUES
('TechStart Logo Design', 'techstart-logo-design', 'Modern logo design for a technology startup focusing on AI solutions.', 'Created a modern, scalable logo for TechStart, a cutting-edge AI technology company. The design incorporates geometric elements representing data flow and artificial intelligence, using a contemporary color palette that conveys innovation and trust.', '/api/placeholder/800/600', '["\/api\/placeholder\/800\/600", "\/api\/placeholder\/600\/400", "\/api\/placeholder\/400\/600"]', 1, 'TechStart Inc.', 'https://techstart.example.com', '["Adobe Illustrator", "Figma", "Adobe Photoshop"]', '2024-01-15', '2 weeks', '{"brand_recognition": "85% increase", "customer_trust": "92% positive feedback", "market_impact": "Featured in 3 design blogs"}', 1, 'active', 1),

('Gaming Channel Thumbnails', 'gaming-channel-thumbnails', 'Eye-catching thumbnail series for a popular gaming YouTube channel.', 'Designed a complete thumbnail series for GameMaster Pro, focusing on high-energy designs that increase click-through rates. Used vibrant colors, dynamic compositions, and consistent branding elements across all thumbnails.', '/api/placeholder/800/600', '["\/api\/placeholder\/800\/600", "\/api\/placeholder\/600\/400", "\/api\/placeholder\/400\/600"]', 2, 'GameMaster Pro', 'https://youtube.com/gamemaster', '["Adobe Photoshop", "After Effects", "Figma"]', '2024-01-20', '1 week', '{"ctr_increase": "45% higher CTR", "subscriber_growth": "2000+ new subscribers", "engagement": "78% increase in views"}', 1, 'active', 2),

('Corporate Video Edit', 'corporate-video-edit', 'Professional corporate video for a financial services company.', 'Edited a comprehensive corporate video for FinanceFirst, including interview segments, motion graphics, and professional color grading. The video effectively communicates the company\'s values and services.', '/api/placeholder/800/600', '["\/api\/placeholder\/800\/600", "\/api\/placeholder\/600\/400", "\/api\/placeholder\/400\/600"]', 3, 'FinanceFirst Ltd.', 'https://financefirst.example.com', '["Adobe Premiere Pro", "After Effects", "DaVinci Resolve"]', '2024-02-01', '3 weeks', '{"client_satisfaction": "98% satisfaction rate", "lead_generation": "150+ qualified leads", "brand_awareness": "60% increase"}', 1, 'active', 3),

('E-commerce Website', 'ecommerce-website-design', 'Modern e-commerce website design for a fashion retailer.', 'Designed and developed a complete e-commerce solution for StyleHub, featuring a modern interface, seamless checkout process, and mobile-optimized design. The site includes inventory management and analytics integration.', '/api/placeholder/800/600', '["\/api\/placeholder\/800\/600", "\/api\/placeholder\/600\/400", "\/api\/placeholder\/400\/600"]', 4, 'StyleHub Fashion', 'https://stylehub.example.com', '["React", "Node.js", "MongoDB", "Stripe API"]', '2024-02-15', '4 weeks', '{"conversion_rate": "32% increase", "mobile_traffic": "68% mobile users", "sales_growth": "$50K+ monthly revenue"}', 1, 'active', 4),

('Restaurant Branding', 'restaurant-branding-package', 'Complete branding package for a new restaurant chain.', 'Developed a comprehensive brand identity for Taste & Co., including logo design, menu design, signage, and digital assets. The brand reflects the restaurant\'s focus on fresh, local ingredients and modern dining experience.', '/api/placeholder/800/600', '["\/api\/placeholder\/800\/600", "\/api\/placeholder\/600\/400", "\/api\/placeholder\/400\/600"]', 5, 'Taste & Co.', 'https://tasteandco.example.com', '["Adobe Illustrator", "InDesign", "Photoshop"]', '2024-03-01', '6 weeks', '{"brand_recognition": "90% local recognition", "customer_retention": "75% return rate", "social_engagement": "200% increase"}', 0, 'active', 5),

('Social Media Campaign', 'fitness-social-media-campaign', 'Comprehensive social media graphics for a fitness brand.', 'Created a month-long social media campaign for FitLife Gym, including post designs, story templates, and promotional graphics. The campaign successfully increased engagement and membership sign-ups.', '/api/placeholder/800/600', '["\/api\/placeholder\/800\/600", "\/api\/placeholder\/600\/400", "\/api\/placeholder\/400\/600"]', 6, 'FitLife Gym', 'https://fitlifegym.example.com', '["Adobe Photoshop", "Canva Pro", "Figma"]', '2024-03-10', '2 weeks', '{"engagement_rate": "85% increase", "new_members": "120+ sign-ups", "reach": "50K+ people reached"}', 0, 'active', 6);

-- =====================================================
-- SAMPLE TESTIMONIALS
-- =====================================================

INSERT INTO `testimonials` (`name`, `email`, `role`, `company`, `content`, `rating`, `project_type`, `service_id`, `featured`, `verified`, `status`) VALUES
('Sarah Johnson', 'sarah@techstart.com', 'CEO', 'TechStart Inc.', 'Adil GFX delivered an exceptional logo that perfectly captures our brand essence. The attention to detail and creative process was outstanding. Highly recommend!', 5, 'Logo Design', 1, 1, 1, 'approved'),
('Mike Chen', 'mike@gamemaster.com', 'Content Creator', 'GameMaster Pro', 'The thumbnail designs increased our click-through rate by 45%! The team understands YouTube trends and creates designs that really work.', 5, 'YouTube Thumbnails', 2, 1, 1, 'approved'),
('Emily Rodriguez', 'emily@financefirst.com', 'Marketing Director', 'FinanceFirst Ltd.', 'Professional video editing that exceeded our expectations. The final product was polished, engaging, and perfectly aligned with our brand message.', 5, 'Video Editing', 3, 1, 1, 'approved'),
('David Kim', 'david@stylehub.com', 'Founder', 'StyleHub Fashion', 'The website design is absolutely stunning and functional. Our conversion rate increased by 32% after the launch. Amazing work!', 5, 'Web Design', 4, 1, 1, 'approved'),
('Lisa Thompson', 'lisa@tasteandco.com', 'Owner', 'Taste & Co.', 'Complete branding package that transformed our restaurant identity. Every piece works together perfectly. Customers love the new look!', 5, 'Branding', 5, 0, 1, 'approved'),
('Alex Martinez', 'alex@fitlifegym.com', 'Marketing Manager', 'FitLife Gym', 'Social media graphics that actually convert! Our engagement increased by 85% and we gained 120+ new members. Fantastic results!', 5, 'Social Media', 6, 0, 1, 'approved');

-- =====================================================
-- SAMPLE BLOG POSTS
-- =====================================================

INSERT INTO `blogs` (`title`, `slug`, `excerpt`, `content`, `featured_image`, `category_id`, `author_id`, `status`, `featured`, `meta_title`, `meta_description`, `views`, `read_time`, `published_at`) VALUES
('10 Logo Design Trends for 2024', '10-logo-design-trends-2024', 'Discover the latest logo design trends that will dominate 2024 and how to incorporate them into your brand identity.', '<h2>Introduction</h2><p>Logo design continues to evolve, and 2024 brings exciting new trends that blend creativity with functionality. Here are the top 10 trends to watch:</p><h3>1. Minimalist Geometry</h3><p>Clean, geometric shapes continue to dominate, offering versatility and timeless appeal.</p><h3>2. Dynamic Gradients</h3><p>Subtle gradients add depth and dimension while maintaining modern aesthetics.</p><h3>3. Custom Typography</h3><p>Brands are investing in unique, custom typefaces that set them apart.</p><h3>4. Responsive Logos</h3><p>Logos that adapt to different sizes and contexts are becoming essential.</p><h3>5. Sustainable Design</h3><p>Eco-conscious design elements reflect brand values and social responsibility.</p>', '/api/placeholder/800/600', 1, 1, 'published', 1, '10 Logo Design Trends for 2024 | Adil GFX', 'Discover the latest logo design trends for 2024. Learn how to create modern, effective logos that stand out in today\'s competitive market.', 1250, 8, '2024-01-10 10:00:00'),

('YouTube Thumbnail Psychology: What Makes Viewers Click', 'youtube-thumbnail-psychology-what-makes-viewers-click', 'Learn the psychological principles behind effective YouTube thumbnails and how to apply them to increase your click-through rates.', '<h2>The Science of Click-Worthy Thumbnails</h2><p>Understanding viewer psychology is crucial for creating thumbnails that drive clicks. Here\'s what research tells us:</p><h3>Color Psychology</h3><p>Bright, contrasting colors grab attention in YouTube\'s interface. Red, orange, and yellow perform exceptionally well.</p><h3>Facial Expressions</h3><p>Thumbnails with expressive faces increase engagement by up to 30%. Surprise, excitement, and curiosity work best.</p><h3>Text Overlay Strategy</h3><p>Keep text to 4 words or less. Use bold, readable fonts that complement your brand.</p><h3>Composition Rules</h3><p>Follow the rule of thirds and create visual hierarchy to guide the viewer\'s eye.</p>', '/api/placeholder/800/600', 2, 1, 'published', 1, 'YouTube Thumbnail Psychology: What Makes Viewers Click', 'Learn the psychological principles behind effective YouTube thumbnails. Discover proven strategies to increase click-through rates.', 980, 6, '2024-01-15 14:30:00'),

('Video Editing Workflow: From Raw Footage to Final Cut', 'video-editing-workflow-raw-footage-final-cut', 'A comprehensive guide to professional video editing workflow, from organizing footage to delivering the final product.', '<h2>Professional Video Editing Process</h2><p>A structured workflow is essential for efficient video production. Here\'s our proven process:</p><h3>Pre-Production Planning</h3><p>Start with a clear vision and storyboard. Plan your shots and gather all necessary assets.</p><h3>Footage Organization</h3><p>Create a logical folder structure and use consistent naming conventions for easy asset management.</p><h3>Rough Cut Assembly</h3><p>Focus on story structure first. Get the pacing right before adding effects.</p><h3>Fine-Tuning</h3><p>Add transitions, color correction, and audio enhancement to polish your edit.</p><h3>Final Review</h3><p>Always review on different devices and gather feedback before final delivery.</p>', '/api/placeholder/800/600', 3, 1, 'published', 0, 'Professional Video Editing Workflow Guide | Adil GFX', 'Master the professional video editing workflow. Learn our proven process from raw footage to final cut delivery.', 756, 10, '2024-01-20 09:15:00'),

('The Ultimate Guide to Brand Identity Design', 'ultimate-guide-brand-identity-design', 'Everything you need to know about creating a cohesive and memorable brand identity that resonates with your target audience.', '<h2>Building a Strong Brand Identity</h2><p>Brand identity goes beyond just a logo. It\'s the complete visual and emotional representation of your business.</p><h3>Research and Strategy</h3><p>Understand your audience, competitors, and market positioning before designing anything.</p><h3>Visual Elements</h3><p>Develop a cohesive system including logo, colors, typography, and imagery style.</p><h3>Brand Guidelines</h3><p>Create comprehensive guidelines to ensure consistency across all touchpoints.</p><h3>Implementation</h3><p>Apply your brand identity consistently across all marketing materials and platforms.</p>', '/api/placeholder/800/600', 5, 1, 'published', 1, 'The Ultimate Guide to Brand Identity Design', 'Learn how to create a powerful brand identity. Complete guide covering research, design, and implementation strategies.', 1420, 12, '2024-01-25 11:45:00');

-- Link blog posts with tags
INSERT INTO `blog_tags` (`blog_id`, `tag_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 7), (2, 8),
(3, 2), (3, 8), (3, 1),
(4, 2), (4, 9), (4, 10);

-- Link portfolio items with tags
INSERT INTO `portfolio_tags` (`portfolio_id`, `tag_id`) VALUES
(1, 2), (1, 3), (1, 8),
(2, 1), (2, 6), (2, 7),
(3, 2), (3, 9), (3, 8),
(4, 3), (4, 8), (4, 9),
(5, 2), (5, 9), (5, 1),
(6, 1), (6, 6), (6, 2);

-- =====================================================
-- SAMPLE CAROUSEL SLIDES
-- =====================================================

INSERT INTO `carousels` (`name`, `title`, `subtitle`, `description`, `image_url`, `cta_text`, `cta_url`, `background_color`, `text_color`, `sort_order`, `status`) VALUES
('hero', 'Transform Your Brand', 'Professional Design Services', 'Get premium logo design, YouTube thumbnails, and video editing services that make your brand stand out from the competition.', '/api/placeholder/1200/600', 'Get Started Today', '/contact', '#1F2937', '#FFFFFF', 1, 'active'),
('hero', 'YouTube Success Starts Here', 'Eye-Catching Thumbnails', 'Boost your click-through rates with custom YouTube thumbnails designed to grab attention and increase views.', '/api/placeholder/1200/600', 'View Portfolio', '/portfolio', '#DC2626', '#FFFFFF', 2, 'active'),
('hero', 'Professional Video Editing', 'Bring Your Vision to Life', 'From raw footage to polished final product, our video editing services help you create engaging content that converts.', '/api/placeholder/1200/600', 'Learn More', '/services/video-editing', '#059669', '#FFFFFF', 3, 'active');

-- =====================================================
-- SAMPLE PAGES
-- =====================================================

INSERT INTO `pages` (`title`, `slug`, `content`, `template`, `sections`, `status`, `show_in_menu`, `menu_order`, `meta_title`, `meta_description`, `author_id`) VALUES
('About Us', 'about', '<h1>About Adil GFX</h1><p>We are a creative design agency specializing in brand identity, digital graphics, and video production. With over 5 years of experience, we have helped hundreds of businesses establish their visual presence and grow their brands.</p>', 'default', '{"hero": {"title": "About Adil GFX", "subtitle": "Creative Design Agency"}, "content": {"sections": [{"type": "text", "content": "Our story and mission"}]}}', 'published', 1, 2, 'About Us - Professional Design Agency | Adil GFX', 'Learn about Adil GFX, a professional design agency specializing in logo design, YouTube thumbnails, and video editing services.', 1),
('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>This privacy policy explains how we collect, use, and protect your personal information when you use our services.</p>', 'legal', NULL, 'published', 1, 8, 'Privacy Policy | Adil GFX', 'Read our privacy policy to understand how we handle your personal information and protect your privacy.', 1),
('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>By using our services, you agree to these terms and conditions.</p>', 'legal', NULL, 'published', 1, 9, 'Terms of Service | Adil GFX', 'Read our terms of service to understand the conditions for using our design services.', 1);

-- =====================================================
-- SAMPLE NOTIFICATIONS
-- =====================================================

INSERT INTO `notifications` (`user_id`, `type`, `title`, `message`, `priority`, `created_at`) VALUES
(1, 'system', 'Welcome to Adil GFX Admin', 'Your admin account has been successfully created. You can now manage your website content.', 'medium', NOW()),
(1, 'info', 'New Contact Form Submission', 'You have received a new contact form submission from a potential client.', 'high', NOW()),
(2, 'content', 'Blog Post Published', 'Your blog post "10 Logo Design Trends for 2024" has been published successfully.', 'low', NOW());

COMMIT;