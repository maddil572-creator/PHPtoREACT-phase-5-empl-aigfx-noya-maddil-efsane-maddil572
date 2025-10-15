# Hostinger Deployment Guide

Complete step-by-step guide for deploying the Adil GFX platform to Hostinger shared hosting.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Requirements](#server-requirements)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Database Setup](#database-setup)
5. [File Upload](#file-upload)
6. [Configuration](#configuration)
7. [PHP Settings](#php-settings)
8. [SMTP Email Setup](#smtp-email-setup)
9. [SSL Certificate](#ssl-certificate)
10. [Post-Deployment Testing](#post-deployment-testing)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- Hostinger hosting account (Business or higher recommended)
- Domain name registered and pointed to Hostinger
- FTP/SSH credentials from Hostinger panel
- Database credentials from Hostinger panel

### Local Tools Needed
- FTP client (FileZilla recommended) or SSH client
- MySQL client (phpMyAdmin or command line)
- Text editor for `.env` configuration

---

## Server Requirements

### Minimum Hostinger Plan
**Recommended:** Business Shared Hosting or higher

**Required Specifications:**
- PHP 8.0 or higher
- MySQL 5.7+ or MariaDB 10.2+
- 2GB RAM minimum
- 10GB storage minimum
- SSL certificate (free with Hostinger)

### PHP Extensions Required
- `pdo_mysql` - Database connectivity
- `curl` - API calls
- `json` - JSON processing
- `mbstring` - String handling
- `openssl` - Encryption
- `gd` or `imagick` - Image processing
- `zip` - Archive handling

### Verify PHP Extensions

Create `phpinfo.php` in your public directory:
```php
<?php phpinfo(); ?>
```

Visit `https://yourdomain.com/phpinfo.php` and verify all required extensions are installed.

**Important:** Delete this file after verification for security.

---

## Pre-Deployment Checklist

### Local Preparation

1. **Test Locally**
   ```bash
   # Build frontend
   npm run build

   # Test backend endpoints
   php backend/scripts/test_api_endpoints.php

   # Verify database schema
   mysql -u root -p adilgfx_db < backend/database/schema.sql
   ```

2. **Configure Environment Variables**
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env
   ```

3. **Export Database**
   ```bash
   mysqldump -u root -p adilgfx_db > adilgfx_db_export.sql
   gzip adilgfx_db_export.sql
   ```

4. **Verify Build Output**
   - Check `dist/` folder contains compiled React app
   - Verify `backend/` folder has all PHP files
   - Confirm `.htaccess` file exists in backend folder

### Files to Upload
```
/public_html/
├── index.html (from dist/)
├── assets/ (from dist/)
├── backend/
│   ├── .htaccess
│   ├── .env
│   ├── api/
│   ├── classes/
│   ├── config/
│   ├── admin/
│   ├── middleware/
│   └── scripts/
├── uploads/ (create empty, set 775)
└── cache/ (create empty, set 775)
```

---

## Database Setup

### Step 1: Create Database via Hostinger Panel

1. Login to Hostinger control panel (hPanel)
2. Navigate to **Databases → MySQL Databases**
3. Click **Create New Database**
4. Database name: `u123456789_adilgfx` (Hostinger adds prefix)
5. Click **Create**

### Step 2: Create Database User

1. In MySQL Databases section, scroll to **MySQL Users**
2. Click **Create New User**
3. Username: `u123456789_adilgfx`
4. Generate strong password, save it securely
5. Click **Create**

### Step 3: Link User to Database

1. Scroll to **Add User to Database**
2. Select user: `u123456789_adilgfx`
3. Select database: `u123456789_adilgfx`
4. Grant **All Privileges**
5. Click **Add**

### Step 4: Import Database Schema

**Via phpMyAdmin:**
1. In hPanel, click **phpMyAdmin** next to your database
2. Select your database from left sidebar
3. Click **Import** tab
4. Choose file: `adilgfx_db_export.sql.gz`
5. Click **Go**
6. Wait for import to complete

**Via SSH (if available):**
```bash
ssh u123456789@yourdomain.com
cd public_html
gunzip adilgfx_db_export.sql.gz
mysql -u u123456789_adilgfx -p u123456789_adilgfx < adilgfx_db_export.sql
rm adilgfx_db_export.sql
```

### Step 5: Run Migrations

Upload migration file and execute:
```bash
mysql -u u123456789_adilgfx -p u123456789_adilgfx < backend/database/migrations/part2_schema.sql
```

Or via phpMyAdmin:
1. Open phpMyAdmin
2. Select database
3. Click **Import**
4. Upload `backend/database/migrations/part2_schema.sql`
5. Click **Go**

---

## File Upload

### Option 1: FTP Upload (Recommended for Large Files)

**Using FileZilla:**

1. **Connect to Server**
   - Host: `ftp.yourdomain.com` or IP from Hostinger
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)

2. **Upload Files**
   - Local site: Your project folder
   - Remote site: `/public_html/`
   - Upload `dist/` contents to `/public_html/`
   - Upload `backend/` to `/public_html/backend/`
   - Upload `.htaccess` to `/public_html/`

3. **Create Required Directories**
   ```
   /public_html/uploads/
   /public_html/cache/
   /public_html/backend/uploads/
   /public_html/backend/cache/
   ```

### Option 2: File Manager Upload

1. Login to Hostinger hPanel
2. Navigate to **Files → File Manager**
3. Navigate to `/public_html/`
4. Click **Upload** button
5. Select and upload your files
6. Use **Extract** option for ZIP archives

### Option 3: SSH Upload (Fastest)

```bash
# Create archive locally
tar -czf adilgfx-deploy.tar.gz dist/ backend/

# Upload via SCP
scp adilgfx-deploy.tar.gz u123456789@yourdomain.com:~/

# SSH into server
ssh u123456789@yourdomain.com

# Extract files
cd public_html
tar -xzf ../adilgfx-deploy.tar.gz
mv dist/* .
rm -rf dist/

# Clean up
cd ~
rm adilgfx-deploy.tar.gz
```

---

## Configuration

### Step 1: Configure Backend `.env`

```bash
# Connect via FTP or File Manager
# Edit: /public_html/backend/.env
```

```env
# Database Configuration (from Hostinger)
DB_HOST=localhost
DB_NAME=u123456789_adilgfx
DB_USER=u123456789_adilgfx
DB_PASS=your_secure_database_password

# Application Settings
APP_ENV=production
JWT_SECRET=generate-a-random-64-character-string-here
FRONTEND_URL=https://yourdomain.com

# Email Configuration (see SMTP section)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USERNAME=hello@yourdomain.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=hello@yourdomain.com
FROM_NAME=Adil GFX

# Cache Settings
CACHE_ENABLED=true

# File Upload
UPLOAD_MAX_SIZE=10485760

# Rate Limiting
RATE_LIMIT_ENABLED=true

# API Keys (add as you configure each service)
SENDGRID_API_KEY=
WHATSAPP_ACCESS_TOKEN=
TELEGRAM_BOT_TOKEN=
STRIPE_SECRET_KEY=
COINBASE_API_KEY=
```

**Generate Secure JWT Secret:**
```bash
# On your local machine
openssl rand -base64 64
```

### Step 2: Configure `.htaccess`

Create `/public_html/.htaccess`:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Frontend routing (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend/
RewriteRule ^ index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Deny access to sensitive files
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

<FilesMatch "\.(sql|log|md)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

Create `/public_html/backend/.htaccess`:
```apache
# Enable rewrite engine
RewriteEngine On

# API routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1.php [QSA,L]

# Serve uploaded files
RewriteRule ^uploads/(.*)$ uploads/$1 [L]

# Protect sensitive files
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

# CORS headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

### Step 3: Set File Permissions

**Via FTP (FileZilla):**
1. Right-click folder/file
2. Select **File permissions**
3. Set permissions as below

**Via SSH:**
```bash
cd /home/u123456789/public_html

# Directories: 755 (read/write/execute for owner, read/execute for others)
chmod 755 backend/
chmod 755 backend/api/
chmod 755 backend/classes/
chmod 755 backend/config/

# Upload and cache directories: 775 (group writable)
chmod 775 backend/uploads/
chmod 775 backend/cache/
chmod 775 uploads/
chmod 775 cache/

# PHP files: 644 (read/write for owner, read for others)
find backend/ -type f -name "*.php" -exec chmod 644 {} \;

# .env file: 600 (read/write for owner only)
chmod 600 backend/.env

# .htaccess files: 644
chmod 644 .htaccess
chmod 644 backend/.htaccess
```

**Permission Summary:**
```
Directories: 755
Upload/Cache Directories: 775
PHP Files: 644
.env File: 600
.htaccess Files: 644
```

---

## PHP Settings

### Configure PHP Version

1. Login to Hostinger hPanel
2. Navigate to **Advanced → PHP Configuration**
3. Select **PHP 8.1** or **PHP 8.2**
4. Click **Apply**

### Configure PHP Settings via `.user.ini`

Hostinger doesn't allow editing `php.ini` directly. Use `.user.ini` instead.

Create `/public_html/.user.ini`:
```ini
; Maximum execution time
max_execution_time = 300

; Memory limit
memory_limit = 256M

; File upload limits
upload_max_filesize = 50M
post_max_size = 50M

; Error reporting (production)
display_errors = Off
display_startup_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
log_errors = On
error_log = /home/u123456789/logs/php_errors.log

; Session settings
session.save_path = "/home/u123456789/tmp"
session.gc_maxlifetime = 86400

; Timezone
date.timezone = America/New_York
```

**Important:** Changes to `.user.ini` may take 5-10 minutes to apply.

### Verify PHP Configuration

Create `/public_html/check-php.php`:
```php
<?php
echo "PHP Version: " . phpversion() . "\n";
echo "Memory Limit: " . ini_get('memory_limit') . "\n";
echo "Upload Max: " . ini_get('upload_max_filesize') . "\n";
echo "Post Max: " . ini_get('post_max_size') . "\n";
echo "Max Execution: " . ini_get('max_execution_time') . "s\n";

// Check extensions
$required = ['pdo_mysql', 'curl', 'json', 'mbstring', 'openssl', 'gd'];
foreach ($required as $ext) {
    echo "$ext: " . (extension_loaded($ext) ? '✓' : '✗') . "\n";
}
?>
```

Visit `https://yourdomain.com/check-php.php` and verify settings.

**Delete this file after verification.**

---

## SMTP Email Setup

Hostinger provides SMTP service for transactional emails.

### Option 1: Hostinger SMTP (Recommended)

**Configuration:**
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USERNAME=hello@yourdomain.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=hello@yourdomain.com
FROM_NAME=Adil GFX
```

**Create Email Account:**
1. In hPanel, go to **Emails → Email Accounts**
2. Click **Create Email Account**
3. Email: `hello@yourdomain.com`
4. Create strong password
5. Storage: 1GB minimum
6. Click **Create**

**Test SMTP:**
```bash
php backend/scripts/test_smtp.php hello@yourdomain.com
```

### Option 2: Gmail SMTP

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Adil GFX
```

**Setup Gmail App Password:**
1. Enable 2-Factor Authentication in Google Account
2. Go to **Security → App passwords**
3. Generate password for "Mail"
4. Use this password in `.env`

### Option 3: SendGrid (Highest Deliverability)

**Configuration:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=hello@yourdomain.com
FROM_NAME=Adil GFX
```

See `README_APIS.md` for SendGrid setup instructions.

### Troubleshooting Email Issues

**Emails not sending:**
```bash
# Check PHP mail function
php -r "mail('test@example.com', 'Test', 'Test message');"

# Check SMTP connectivity
telnet smtp.hostinger.com 587

# Review error logs
tail -f /home/u123456789/logs/php_errors.log
```

**Common Issues:**
- **Authentication failed**: Verify SMTP username/password
- **Connection timeout**: Check firewall allows port 587
- **Emails in spam**: Add SPF and DKIM records (see below)

### Configure SPF and DKIM Records

**Add SPF Record:**
1. Go to hPanel → **Advanced → DNS Zone Editor**
2. Add TXT record:
   - Name: `@`
   - Value: `v=spf1 include:_spf.hostinger.com ~all`
3. Save changes

**Enable DKIM:**
1. In hPanel → **Emails → DKIM Records**
2. Click **Enable DKIM**
3. Copy provided DNS records
4. Add to DNS Zone Editor
5. Wait 24-48 hours for propagation

---

## SSL Certificate

### Enable Free SSL (Let's Encrypt)

1. Login to Hostinger hPanel
2. Navigate to **Security → SSL**
3. Select your domain
4. Click **Install SSL**
5. Wait 1-2 minutes for installation

### Force HTTPS in `.htaccess`

Already included in the `.htaccess` configuration above:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Verify SSL Installation

Visit your site:
- `https://yourdomain.com` - Should load with padlock icon
- `http://yourdomain.com` - Should redirect to HTTPS

Test SSL configuration:
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- Should achieve A or A+ rating

---

## Post-Deployment Testing

### 1. Frontend Testing

**Test Pages:**
```
✓ https://yourdomain.com/
✓ https://yourdomain.com/about
✓ https://yourdomain.com/services
✓ https://yourdomain.com/portfolio
✓ https://yourdomain.com/blog
✓ https://yourdomain.com/contact
```

**Check Console:**
- Open browser DevTools (F12)
- Console should have no errors
- Network tab shows 200 status for API calls

### 2. Backend API Testing

**Test Endpoints:**
```bash
# Services endpoint
curl https://yourdomain.com/backend/api/services.php

# Blog endpoint
curl https://yourdomain.com/backend/api/blogs.php

# Settings endpoint
curl https://yourdomain.com/backend/api/settings.php
```

Expected: JSON response with data, no errors.

### 3. Admin Panel Access

**Login Test:**
1. Visit `https://yourdomain.com/backend/admin/`
2. Login with admin credentials
3. Verify dashboard loads
4. Test creating/editing content

**Default Admin Credentials:**
- Email: `admin@adilgfx.com`
- Password: (from database setup)

**Change default password immediately!**

### 4. Database Connection Test

Create `/public_html/backend/test-db.php`:
```php
<?php
require_once 'config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    echo "✓ Database connected successfully!\n";

    $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users in database: " . $result['count'] . "\n";

} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
}
?>
```

Run: `php /home/u123456789/public_html/backend/test-db.php`

**Delete this file after testing.**

### 5. Email Delivery Test

```bash
php backend/scripts/test_smtp.php your-email@example.com
```

Check if test email arrives within 2 minutes.

### 6. File Upload Test

1. Login to admin panel
2. Navigate to **Media Library**
3. Upload test image
4. Verify image appears and is accessible
5. URL format: `https://yourdomain.com/backend/uploads/filename.jpg`

### 7. API Integration Test

```bash
php backend/scripts/test_api_endpoints.php
```

Review output for API connection status.

### 8. Performance Test

**Run PageSpeed Test:**
1. Visit [PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter your domain
3. Target: 90+ score on mobile

**Check Load Times:**
- Homepage: < 3 seconds
- API responses: < 500ms
- Database queries: < 100ms

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: 500 Internal Server Error

**Causes:**
- Syntax error in PHP files
- Missing `.htaccess` file
- Incorrect file permissions
- PHP version incompatibility

**Solutions:**
```bash
# Check error logs
tail -f /home/u123456789/logs/php_errors.log

# Verify .htaccess exists
ls -la /home/u123456789/public_html/.htaccess

# Check PHP version
php -v

# Fix permissions
chmod 644 /home/u123456789/public_html/backend/.htaccess
```

#### Issue: Database Connection Failed

**Causes:**
- Incorrect database credentials
- Database not created
- User not linked to database

**Solutions:**
```bash
# Test database connection
mysql -u u123456789_adilgfx -p -h localhost

# Verify credentials in .env
cat /home/u123456789/public_html/backend/.env | grep DB_

# Check if database exists
mysql -u u123456789_adilgfx -p -e "SHOW DATABASES;"
```

#### Issue: API Returns 404

**Causes:**
- `.htaccess` rewrite rules not working
- `mod_rewrite` not enabled
- Incorrect API URL

**Solutions:**
```apache
# Verify .htaccess in backend folder
cat /home/u123456789/public_html/backend/.htaccess

# Test with full path
https://yourdomain.com/backend/api/services.php
```

Contact Hostinger support to enable `mod_rewrite` if needed.

#### Issue: File Uploads Failing

**Causes:**
- Insufficient permissions
- PHP upload limits too low
- Disk quota exceeded

**Solutions:**
```bash
# Check permissions
ls -ld /home/u123456789/public_html/backend/uploads/
# Should be: drwxrwxr-x (775)

# Verify ownership
ls -l /home/u123456789/public_html/backend/uploads/
# Owner should match PHP user

# Check disk space
df -h /home/u123456789/

# Increase PHP limits in .user.ini
upload_max_filesize = 50M
post_max_size = 50M
```

#### Issue: Emails Not Sending

**Causes:**
- SMTP credentials incorrect
- Port 587 blocked
- SPF/DKIM not configured

**Solutions:**
```bash
# Test SMTP connection
telnet smtp.hostinger.com 587

# Check SMTP credentials
php backend/scripts/test_smtp.php your-email@example.com

# Review email logs
tail -f /home/u123456789/logs/mail.log
```

#### Issue: CSS/JS Files Not Loading

**Causes:**
- Incorrect base path in HTML
- Files not uploaded
- MIME type issues

**Solutions:**
```bash
# Verify files exist
ls -la /home/u123456789/public_html/assets/

# Check file permissions
find /home/u123456789/public_html/assets/ -type f -exec chmod 644 {} \;

# Add MIME types to .htaccess
AddType application/javascript .js
AddType text/css .css
```

#### Issue: Admin Panel Shows Blank Page

**Causes:**
- JavaScript error
- Database connection issue
- Session configuration problem

**Solutions:**
```bash
# Check browser console for errors (F12)
# Review PHP error log
tail -f /home/u123456789/logs/php_errors.log

# Verify session directory exists
mkdir -p /home/u123456789/tmp
chmod 770 /home/u123456789/tmp

# Test admin login directly
curl -X POST https://yourdomain.com/backend/api/auth.php/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@adilgfx.com","password":"your_password"}'
```

### Performance Optimization

**Enable OPcache:**
Add to `.user.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

**Enable Gzip Compression:**
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

**Enable Browser Caching:**
Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Monitoring and Maintenance

**Setup Cron Jobs:**

1. In hPanel, go to **Advanced → Cron Jobs**
2. Add cron job:

```bash
# Clear expired cache (every hour)
0 * * * * php /home/u123456789/public_html/backend/scripts/clear_cache.php

# Daily database backup (2 AM daily)
0 2 * * * php /home/u123456789/public_html/backend/scripts/backup_database.php

# Clean old logs (weekly, Sunday midnight)
0 0 * * 0 php /home/u123456789/public_html/backend/scripts/clean_logs.php
```

**Monitor Error Logs:**
```bash
# Watch errors in real-time
tail -f /home/u123456789/logs/php_errors.log

# Review access logs
tail -f /home/u123456789/logs/access.log
```

**Database Backup:**
```bash
# Manual backup
mysqldump -u u123456789_adilgfx -p u123456789_adilgfx | gzip > backup_$(date +%Y%m%d).sql.gz

# Download backup via FTP
# Store backups offsite (AWS S3, Google Drive, etc.)
```

---

## Getting Help

### Hostinger Support
- **24/7 Live Chat**: Available in hPanel
- **Knowledge Base**: [support.hostinger.com](https://support.hostinger.com)
- **Priority Support**: Available on Business and Cloud plans

### Documentation
- `README_BACKEND.md` - Backend architecture
- `README_APIS.md` - API integration guides
- `SECURITY_SUMMARY.md` - Security best practices

### Common Support Requests

**Enable mod_rewrite:**
"Please enable mod_rewrite for my domain yourdomain.com"

**Increase PHP limits:**
"Please increase PHP memory_limit to 256M and max_execution_time to 300 for yourdomain.com"

**Configure SSH access:**
"Please enable SSH access for my hosting account"

---

## Deployment Checklist

### Pre-Deployment
- [ ] Local testing completed
- [ ] Frontend built (`npm run build`)
- [ ] Database exported with sample data
- [ ] `.env` file configured with production values
- [ ] All API keys obtained and tested
- [ ] SSL certificate configured

### Deployment
- [ ] Database created and imported
- [ ] Files uploaded to `/public_html/`
- [ ] `.htaccess` files in place
- [ ] File permissions set correctly
- [ ] `.user.ini` configured for PHP settings
- [ ] SMTP credentials configured and tested

### Post-Deployment
- [ ] Frontend loads without errors
- [ ] All pages accessible
- [ ] API endpoints responding
- [ ] Admin panel accessible
- [ ] Database connection working
- [ ] File uploads working
- [ ] Emails sending successfully
- [ ] SSL certificate active (HTTPS)
- [ ] Performance tests passing (90+ score)
- [ ] Cron jobs configured
- [ ] Error monitoring setup
- [ ] Backups scheduled

### Security
- [ ] Default admin password changed
- [ ] `.env` file protected
- [ ] Sensitive files denied in `.htaccess`
- [ ] SQL files not accessible
- [ ] phpinfo() test file deleted
- [ ] Debug files removed
- [ ] Error display disabled
- [ ] SPF and DKIM records configured

---

**Deployment Guide Version:** 1.0.0
**Last Updated:** January 2025
**Platform:** Hostinger Shared Hosting
**Support:** See `README.md` for contact information
