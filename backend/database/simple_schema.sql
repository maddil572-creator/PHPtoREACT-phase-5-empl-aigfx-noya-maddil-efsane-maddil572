-- Simple SQLite Schema for Quick Setup
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    email_verified INTEGER NOT NULL DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_expires TEXT,
    login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    last_login TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    type TEXT NOT NULL DEFAULT 'text',
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    icon TEXT,
    parent_id INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    featured INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 5,
    published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    long_description TEXT,
    featured_image TEXT NOT NULL,
    gallery_images TEXT,
    category_id INTEGER,
    client_name TEXT,
    project_url TEXT,
    completion_date TEXT,
    technologies TEXT,
    results TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    featured INTEGER NOT NULL DEFAULT 0,
    views INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT NOT NULL,
    long_description TEXT,
    icon TEXT,
    featured_image TEXT,
    category_id INTEGER,
    features TEXT,
    pricing_tiers TEXT,
    delivery_time TEXT,
    popular INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    position TEXT,
    avatar TEXT,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    service_id INTEGER,
    project_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    featured INTEGER NOT NULL DEFAULT 0,
    approved_by INTEGER,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    service_interest TEXT,
    budget_range TEXT,
    timeline TEXT,
    source TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    responded_at TEXT,
    responded_by INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    source TEXT,
    interests TEXT,
    subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    description TEXT NOT NULL,
    changes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    metadata TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    is_read INTEGER NOT NULL DEFAULT 0,
    read_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Media Table
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_type TEXT NOT NULL,
    dimensions TEXT,
    alt_text TEXT,
    caption TEXT,
    uploaded_by INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    `order` INTEGER DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    views INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT OR IGNORE INTO users (email, password, name, role, status, email_verified) VALUES
('admin@adilcreator.com', '$2y$12$PXq0z7MbJKf/AQMEe6Fjsu6tZfjErrbYrGvtWyDnMa2my.xw46Xg2', 'Adil Creator Admin', 'admin', 'active', 1);

INSERT OR IGNORE INTO settings (key, value, type, category, description) VALUES
('site_name', 'Adil Creator', 'text', 'general', 'Website name'),
('site_tagline', 'Professional Design & Creative Services', 'text', 'general', 'Website tagline'),
('contact_email', 'admin@adilcreator.com', 'email', 'general', 'Primary contact email');

INSERT OR IGNORE INTO categories (name, slug, description, color, icon) VALUES
('Logo Design', 'logo-design', 'Professional logo design services', '#3B82F6', 'palette'),
('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching YouTube thumbnail designs', '#FF0000', 'play-circle'),
('Video Editing', 'video-editing', 'Professional video editing and post-production', '#8B5CF6', 'film');

INSERT OR IGNORE INTO services (name, slug, tagline, description, icon, category_id, features, pricing_tiers, delivery_time, popular, active) VALUES
('Premium Logo Design', 'premium-logo-design', 'Stand out with a unique brand identity', 'Professional logo design that captures your brand essence and makes you memorable.', 'palette', 1, '["Multiple concepts", "Unlimited revisions", "Vector files included"]', '[{"name":"Basic","price":99,"duration":"3-5 days"}]', '3-10 days', 1, 1);

-- Sample FAQ data
INSERT OR IGNORE INTO faqs (question, answer, category, status, `order`, featured) VALUES
('How long does it typically take to complete a project?', 'Timeline varies by service: Logo design takes 2-7 days, thumbnails are delivered within 24-48 hours, and video editing ranges from 3-10 days depending on complexity. Rush delivery is available for an additional 50% fee.', 'General', 'published', 1, 1),
('What''s included in the final delivery?', 'All projects include high-resolution files in multiple formats (PNG, JPG, and source files when applicable), commercial usage rights, and a basic style guide. Premium packages include additional formats like SVG, AI, and comprehensive brand guidelines.', 'General', 'published', 2, 0),
('Do you offer unlimited revisions?', 'Revision policy varies by package. Basic packages include 2-3 revisions, Standard packages include 5 revisions, and Premium packages offer unlimited revisions. Additional revisions beyond the package limit are $25 each.', 'General', 'published', 3, 0),
('What payment methods do you accept?', 'I accept PayPal, Stripe (credit/debit cards), bank transfers, and cryptocurrency. For larger projects, I offer payment plans with 50% upfront and 50% upon completion.', 'Pricing & Payment', 'published', 1, 0),
('Are there any hidden fees?', 'No hidden fees! All pricing is transparent and listed upfront. The only additional costs would be optional add-ons like rush delivery (+50%), extra revisions ($25 each), or source files ($49) if not included in your package.', 'Pricing & Payment', 'published', 2, 0),
('Do you offer refunds?', 'I offer a 100% satisfaction guarantee. If you''re not happy with the initial concepts and we can''t resolve it through revisions, I''ll provide a full refund. Once revisions begin and you approve directions, the project is considered accepted.', 'Pricing & Payment', 'published', 3, 0),
('What information do you need to start a project?', 'I need your brand/channel name, target audience, style preferences, any existing brand elements, preferred colors, and 2-3 reference examples of designs you like. The more details you provide, the better I can match your vision.', 'Design Process', 'published', 1, 0),
('Can I request specific changes during the design process?', 'Absolutely! Collaboration is key to great design. You can request changes to colors, fonts, layouts, or any other elements during the revision phase. I encourage feedback to ensure the final design exceeds your expectations.', 'Design Process', 'published', 2, 0),
('What if I don''t like any of the initial concepts?', 'This rarely happens, but if none of the initial concepts hit the mark, I''ll create new concepts based on your feedback at no extra charge. Your satisfaction is my priority, and I''ll work until we find the perfect solution.', 'Design Process', 'published', 3, 0),
('What file formats will I receive?', 'Standard delivery includes PNG and JPG files. Premium packages include SVG (vector), AI (Adobe Illustrator source), PSD (Photoshop source), and PDF formats. All files are provided in high resolution suitable for both web and print use.', 'File Formats & Usage', 'published', 1, 0),
('Can I use the designs for commercial purposes?', 'Yes! All designs come with full commercial usage rights. You own the final design and can use it however you like - on products, marketing materials, websites, etc. I retain the right to showcase the work in my portfolio unless you request otherwise.', 'File Formats & Usage', 'published', 2, 0),
('Will my designs work on social media platforms?', 'Absolutely! All designs are optimized for digital use and will look great on social media. I provide correctly sized versions for different platforms when needed, and ensure designs are mobile-friendly and web-optimized.', 'File Formats & Usage', 'published', 3, 0),
('How do we communicate during the project?', 'I primarily use email for detailed communications and file sharing, WhatsApp for quick updates and questions, and can schedule video calls for complex projects. You''ll receive regular updates and can reach me anytime during business hours.', 'Communication & Support', 'published', 1, 0),
('What timezone are you in and when are you available?', 'I''m available Monday-Friday, 9 AM - 6 PM EST, with extended hours for urgent projects. I typically respond to messages within 2 hours during business hours and within 24 hours on weekends.', 'Communication & Support', 'published', 2, 0),
('Do you provide ongoing support after project completion?', 'Yes! I offer 30 days of free minor adjustments after delivery (small text changes, color tweaks, etc.). For major changes or new variations, I provide ongoing support at discounted rates for existing clients.', 'Communication & Support', 'published', 3, 0);