# 🔗 PHP Backend + React Frontend Connection Guide

This guide explains how to connect and run your PHP backend with React frontend in development and production.

## 📋 Prerequisites

### Required Software
- **PHP 7.4+** with extensions: `pdo`, `pdo_mysql`, `json`, `curl`, `mbstring`
- **MySQL 5.7+** or **MariaDB 10.3+**
- **Node.js 16+** and **npm**
- **Composer** (PHP package manager)

### Optional Tools
- **Git** for version control
- **Postman** or **Insomnia** for API testing

## 🚀 Quick Start (Development)

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# Copy environment configuration
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your preferred editor
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE adilgfx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# Import database schema (if available)
mysql -u root -p adilgfx_db < backend/database/schema.sql
```

### 3. Install Dependencies
```bash
# Install PHP dependencies
cd backend
composer install
cd ..

# Install Node.js dependencies
npm install
```

### 4. Start Development Servers

#### Option A: Automated Script (Recommended)
```bash
# Linux/Mac
./start-dev.sh

# Windows
start-dev.bat
```

#### Option B: Manual Start
```bash
# Terminal 1: Start PHP backend
cd backend
php -S localhost:8000 index.php

# Terminal 2: Start React frontend
npm run dev
```

### 5. Verify Connection
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/test.php
- **Backend Status**: http://localhost:8000

## 🔧 Configuration Details

### Environment Variables (.env)

#### Frontend Configuration
```env
VITE_API_BASE_URL=http://localhost:8000/backend
VITE_USE_MOCK_DATA=false
VITE_SITE_NAME=Adil GFX
```

#### Backend Configuration
```env
# Database
DB_HOST=localhost
DB_NAME=adilgfx_db
DB_USER=root
DB_PASS=your_password

# Security
JWT_SECRET=your_32_character_secret_key
APP_ENV=development
```

### API Endpoints Structure

The backend provides RESTful API endpoints:

```
GET    /api/test.php           - API health check
GET    /api/blogs.php          - Get all blogs
GET    /api/blogs.php/{id}     - Get specific blog
POST   /api/blogs.php          - Create blog (auth required)
PUT    /api/blogs.php/{id}     - Update blog (auth required)
DELETE /api/blogs.php/{id}     - Delete blog (auth required)

GET    /api/portfolio.php      - Get portfolio items
GET    /api/services.php       - Get services
GET    /api/testimonials.php   - Get testimonials
POST   /api/contact.php        - Submit contact form
POST   /api/uploads.php        - Upload files (auth required)

# Admin endpoints (require authentication)
POST   /api/auth.php/login     - Admin login
GET    /api/admin/stats.php    - Dashboard statistics
GET    /api/admin/users.php    - User management
```

## 🔍 Testing the Connection

### 1. Backend API Test
```bash
# Test basic connectivity
curl http://localhost:8000/api/test.php

# Expected response:
{
  "success": true,
  "message": "API is working",
  "data": {
    "timestamp": "2024-01-01T12:00:00+00:00",
    "database": {
      "connected": true,
      "message": "Database connection successful"
    }
  }
}
```

### 2. Frontend-Backend Integration Test
```bash
# Test from React app console
fetch('http://localhost:8000/backend/api/test.php')
  .then(r => r.json())
  .then(console.log)
```

### 3. Database Connection Test
```bash
# Run database test script
php backend/test_db.php
```

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: 
- Check `ALLOWED_ORIGINS` in `backend/config/config.php`
- Ensure frontend URL is included
- Verify CORS middleware is loaded

#### 2. Database Connection Failed
**Problem**: "Database connection failed"
**Solutions**:
- Verify MySQL is running: `sudo systemctl status mysql`
- Check database credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`
- Test connection: `php backend/test_db.php`

#### 3. 404 API Errors
**Problem**: API endpoints return 404
**Solutions**:
- Check `.htaccess` file exists in backend directory
- Verify URL rewriting is enabled
- Test direct file access: `http://localhost:8000/backend/api/test.php`

#### 4. Permission Errors
**Problem**: File upload or cache errors
**Solutions**:
```bash
# Set proper permissions
chmod 755 backend/uploads
chmod 755 backend/cache
chmod 644 backend/.htaccess
```

#### 5. PHP Extensions Missing
**Problem**: "Class not found" or extension errors
**Solutions**:
```bash
# Check installed extensions
php -m | grep -E "(pdo|mysql|json|curl)"

# Install missing extensions (Ubuntu/Debian)
sudo apt-get install php-mysql php-curl php-json php-mbstring

# Install missing extensions (CentOS/RHEL)
sudo yum install php-mysql php-curl php-json php-mbstring
```

### Debug Mode

Enable debug mode for detailed error messages:

```env
# In .env file
APP_ENV=development
APP_DEBUG=true
VITE_DEBUG_MODE=true
```

### Log Files

Check log files for errors:
```bash
# Backend logs
tail -f backend.log

# Frontend logs  
tail -f frontend.log

# PHP error logs
tail -f /var/log/apache2/error.log  # Apache
tail -f /var/log/nginx/error.log    # Nginx
```

## 🚀 Production Deployment

### 1. Environment Setup
```env
# Production .env
VITE_API_BASE_URL=https://yourdomain.com/backend
VITE_USE_MOCK_DATA=false
APP_ENV=production
APP_DEBUG=false
```

### 2. Build Frontend
```bash
npm run build
```

### 3. Deploy Files
```bash
# Upload to server
rsync -avz dist/ user@server:/var/www/html/
rsync -avz backend/ user@server:/var/www/html/backend/
```

### 4. Server Configuration

#### Apache (.htaccess)
```apache
# In document root
RewriteEngine On
RewriteRule ^backend/(.*)$ backend/index.php [QSA,L]
RewriteRule ^(?!backend).*$ index.html [QSA,L]
```

#### Nginx
```nginx
location /backend/ {
    try_files $uri $uri/ /backend/index.php?$query_string;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## 📚 API Documentation

### Authentication
Most admin endpoints require JWT authentication:

```javascript
// Login to get token
const response = await fetch('/api/auth.php/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Use token in subsequent requests
fetch('/api/admin/stats.php', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Error Handling
All API responses follow this format:

```json
{
  "success": true|false,
  "data": { ... },           // On success
  "error": "Error message",  // On failure
  "message": "Info message"
}
```

## 🔒 Security Considerations

### Development
- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Validate all user inputs
- Use prepared statements for database queries
- Implement rate limiting

### Production Checklist
- [ ] Change default JWT secret
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up database backups
- [ ] Monitor error logs

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review error logs
3. Test individual components
4. Check network connectivity
5. Verify server configuration

For additional help, please provide:
- Error messages
- Server configuration
- PHP/Node.js versions
- Operating system details