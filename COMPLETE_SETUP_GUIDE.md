# 🚀 Adil GFX - Complete Setup Guide

**A fully functional PHP backend + React frontend with zero coding required!**

This is a complete, production-ready website with:
- ✅ PHP backend with REST API
- ✅ React frontend with modern UI
- ✅ MySQL database with sample data
- ✅ Admin panel for content management
- ✅ Authentication system (JWT)
- ✅ File upload & media management
- ✅ Email system & contact forms
- ✅ Blog, portfolio, services management
- ✅ Newsletter subscription
- ✅ User management & roles
- ✅ Analytics & activity logs

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- **PHP 7.4+** with extensions: `pdo`, `pdo_mysql`, `json`, `curl`, `mbstring`
- **MySQL 5.7+** or **MariaDB 10.3+**
- **Node.js 16+** and **npm**
- **Composer** (PHP package manager)

### 1. Setup Database
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE adilgfx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### 2. Configure Environment
```bash
# Edit .env file with your database credentials
# Only change these lines:
DB_HOST=localhost
DB_NAME=adilgfx_db
DB_USER=root
DB_PASS=your_mysql_password
```

### 3. Run Setup Script
```bash
# Linux/Mac
./setup-and-start.sh

# Windows
setup-and-start.bat
```

**That's it!** The script will:
- Install all dependencies
- Set up the database with sample data
- Start both frontend and backend servers
- Open your browser to the website

## 🌐 Access Your Website

After running the setup script:

### 🎨 Frontend (Your Website)
- **URL**: http://localhost:5173
- **Features**: Homepage, portfolio, services, blog, contact form

### 👨‍💼 Admin Panel
- **URL**: http://localhost:5173/admin
- **Login**: admin@adilgfx.com
- **Password**: admin123
- **⚠️ Change password after first login!**

### 🔧 API Testing
- **Test Page**: http://localhost:5173/api-test
- **API Docs**: http://localhost:8000/api/test.php

## 📋 What's Included

### 🎨 Frontend Features
- **Modern React UI** with TypeScript
- **Responsive design** (mobile-friendly)
- **Dark/light theme** support
- **SEO optimized** with meta tags
- **Fast loading** with code splitting
- **Accessibility** compliant

### 🔧 Backend Features
- **RESTful API** with proper HTTP methods
- **JWT authentication** with sessions
- **Role-based access** (admin, editor, user)
- **File upload** with thumbnails
- **Email system** with templates
- **Rate limiting** and security
- **Activity logging** and analytics

### 📊 Admin Panel Features
- **Dashboard** with statistics
- **Content Management**: blogs, portfolio, services
- **User Management**: create, edit, delete users
- **Media Library**: upload and organize files
- **Settings**: site configuration
- **Activity Logs**: track all changes
- **Email Templates**: customize notifications

### 🗄️ Database Features
- **Unified schema** with 20 optimized tables
- **Complete sample data** (blogs, portfolio, services, users)
- **Foreign keys** and referential integrity
- **Optimized indexes** for performance
- **Single-file deployment** ready

## 🔧 API Endpoints

### Public Endpoints
```
GET  /api/blogs           - Get blog posts
GET  /api/blogs/{id}      - Get specific blog
GET  /api/portfolio       - Get portfolio items
GET  /api/services        - Get services
GET  /api/testimonials    - Get testimonials
GET  /api/settings        - Get site settings
POST /api/contact         - Submit contact form
POST /api/newsletter      - Subscribe to newsletter
```

### Admin Endpoints (Require Authentication)
```
POST /api/auth/login      - Admin login
GET  /api/auth/verify     - Verify token
POST /api/blogs           - Create blog post
PUT  /api/blogs/{id}      - Update blog post
DELETE /api/blogs/{id}    - Delete blog post
POST /api/uploads         - Upload files
GET  /api/admin/stats     - Dashboard statistics
GET  /api/admin/users     - User management
```

## 📁 Project Structure

```
adilgfx/
├── backend/                 # PHP Backend
│   ├── api/                # API endpoints
│   │   ├── auth.php        # Authentication
│   │   ├── blogs.php       # Blog management
│   │   ├── portfolio.php   # Portfolio management
│   │   ├── services.php    # Services management
│   │   ├── testimonials.php # Testimonials
│   │   ├── contact.php     # Contact forms
│   │   ├── uploads.php     # File uploads
│   │   └── admin/          # Admin endpoints
│   ├── classes/            # PHP classes
│   │   ├── Auth.php        # Authentication logic
│   │   ├── MediaManager.php # File handling
│   │   └── EmailService.php # Email system
│   ├── config/             # Configuration
│   │   ├── config.php      # App config
│   │   └── database.php    # DB connection
│   ├── database/           # Database files
│   │   └── unified_schema.sql # Complete database with data
│   ├── middleware/         # Middleware
│   ├── uploads/            # Uploaded files
│   └── index.php           # Main entry point
├── src/                    # React Frontend
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   ├── admin/              # Admin panel
│   ├── utils/              # Utilities
│   └── hooks/              # React hooks
├── .env                    # Environment config
├── setup-and-start.sh      # Setup script (Linux/Mac)
├── setup-and-start.bat     # Setup script (Windows)
└── package.json            # Node.js dependencies
```

## 🎨 Customization

### Change Branding
1. **Logo**: Replace files in `public/` folder
2. **Colors**: Update in `src/index.css` and admin settings
3. **Content**: Use admin panel to update text
4. **Images**: Upload new images via admin media library

### Add Content
1. **Blog Posts**: Admin → Blog → Add New
2. **Portfolio Items**: Admin → Portfolio → Add New
3. **Services**: Admin → Services → Add New
4. **Testimonials**: Admin → Testimonials → Add New

### Site Settings
1. Go to **Admin → Settings**
2. Update site name, description, contact info
3. Configure email settings
4. Set social media links

## 🔒 Security Features

### Authentication
- **JWT tokens** with expiration
- **Password hashing** with bcrypt
- **Session management** with database
- **Rate limiting** on login attempts
- **Account lockout** after failed attempts

### API Security
- **CORS protection** with allowed origins
- **Input validation** and sanitization
- **SQL injection** prevention with prepared statements
- **XSS protection** with proper escaping
- **File upload** security with type checking

### Admin Security
- **Role-based access** control
- **Activity logging** for all actions
- **Secure file uploads** with virus scanning
- **CSRF protection** on forms

## 📧 Email System

### Automatic Emails
- **Contact form** notifications to admin
- **Contact confirmation** to users
- **Newsletter** welcome emails
- **Password reset** emails
- **User registration** confirmations

### Email Templates
All emails use HTML templates with:
- **Responsive design** for mobile
- **Brand consistency** with your colors
- **Professional styling**
- **Unsubscribe links** where required

## 🚀 Production Deployment

### 1. Update Environment
```bash
# Edit .env for production
VITE_API_BASE_URL=https://yourdomain.com/backend
VITE_APP_ENV=production
APP_ENV=production
APP_DEBUG=false
JWT_SECRET=your_super_secure_32_character_secret_key
```

### 2. Build Frontend
```bash
npm run build
```

### 3. Upload Files
Upload these folders to your web server:
- `dist/` → Document root
- `backend/` → Document root or subdirectory

### 4. Set Permissions
```bash
chmod 755 backend/uploads backend/cache
chmod 644 backend/.htaccess
```

### 5. Configure Database
- Create production database
- Run `php backend/install.php` (imports unified schema automatically)

## 📱 Mobile Responsive

The website is fully responsive and works on:
- **Desktop** (1920px+)
- **Laptop** (1024px-1919px)
- **Tablet** (768px-1023px)
- **Mobile** (320px-767px)

## 🎯 SEO Optimized

### Technical SEO
- **Meta tags** for all pages
- **Open Graph** for social sharing
- **Structured data** markup
- **XML sitemap** generation
- **Fast loading** (< 3 seconds)
- **Mobile-first** indexing ready

### Content SEO
- **Blog system** for content marketing
- **Portfolio showcase** for work samples
- **Service pages** for keyword targeting
- **Contact forms** for lead generation

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p adilgfx_db

# Check credentials in .env file
```

#### API Not Working
```bash
# Check PHP server is running
curl http://localhost:8000/api/test.php

# Check error logs
tail -f backend.log
```

#### Frontend Not Loading
```bash
# Check Node.js server
npm run dev

# Check for errors
tail -f frontend.log
```

#### File Upload Issues
```bash
# Check permissions
chmod 755 backend/uploads

# Check PHP settings
php -m | grep -E "(gd|fileinfo)"
```

### Getting Help

1. **Check logs**: `backend.log` and `frontend.log`
2. **Test API**: Visit http://localhost:5173/api-test
3. **Database**: Run `php backend/test_db.php`
4. **Permissions**: Ensure folders are writable

## 📈 Performance

### Frontend Performance
- **Code splitting** for faster loading
- **Image optimization** with lazy loading
- **CSS minification** and compression
- **JavaScript bundling** with tree shaking

### Backend Performance
- **Database indexing** for fast queries
- **Caching system** for repeated requests
- **Optimized queries** with joins
- **File compression** for uploads

### Hosting Recommendations
- **Shared Hosting**: Hostinger, Bluehost (Basic)
- **VPS**: DigitalOcean, Linode (Better)
- **Cloud**: AWS, Google Cloud (Best)

## 🎉 You're Ready!

Your website is now fully functional with:
- ✅ Professional design
- ✅ Content management system
- ✅ User authentication
- ✅ Email system
- ✅ File uploads
- ✅ Blog & portfolio
- ✅ Contact forms
- ✅ Newsletter
- ✅ Admin panel
- ✅ API system
- ✅ Database with sample data

**No coding required!** Just customize the content through the admin panel and you're ready to go live.

---

**Need help?** Check the troubleshooting section or test your API at http://localhost:5173/api-test