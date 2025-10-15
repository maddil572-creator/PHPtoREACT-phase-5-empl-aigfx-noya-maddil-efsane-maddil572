# 🚀 Adil Creator - Production Deployment Guide

## 📋 **Pre-Deployment Checklist**

✅ **Domain:** adilcreator.com  
✅ **Admin Email:** admin@adilcreator.com  
✅ **Studio Email:** studio@adilcreator.com  
✅ **Password:** Muhadilmmad#11213  
✅ **Database:** SQLite (ready for production)  
✅ **SSL:** Required for production  

---

## 🌐 **Hosting Setup Instructions**

### **1. Upload Files to Server**

Upload these directories to your web hosting:
```
adilcreator.com/
├── backend/           # PHP backend (upload to root or subdirectory)
├── dist/             # Built React frontend (after npm run build)
├── .env              # Environment configuration
└── .htaccess         # Web server configuration
```

### **2. Build Frontend for Production**

Before uploading, build the React app:
```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### **3. Web Server Configuration**

#### **Apache (.htaccess)**
Create `.htaccess` in your domain root:
```apache
# Redirect all API requests to backend
RewriteEngine On

# Handle backend API requests
RewriteRule ^backend/(.*)$ backend/index.php [QSA,L]

# Handle frontend routes (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/backend
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name adilcreator.com www.adilcreator.com;
    root /path/to/your/site;
    index index.html;

    # Backend API
    location /backend/ {
        try_files $uri $uri/ /backend/index.php?$query_string;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # Frontend (React)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

### **4. Database Setup**

Your SQLite database is ready! Just ensure the file has proper permissions:
```bash
chmod 644 backend/database/adilgfx.sqlite
chmod 755 backend/database/
```

### **5. Directory Permissions**

Set proper permissions for upload directories:
```bash
chmod 755 backend/uploads/
chmod 755 backend/cache/
chmod 755 backend/logs/
chmod 644 backend/database/adilgfx.sqlite
```

---

## 🔧 **Environment Configuration**

Your `.env` file is already configured for production:

```env
# Production URLs
VITE_API_BASE_URL=https://adilcreator.com/backend
VITE_SITE_URL=https://adilcreator.com
APP_URL=https://adilcreator.com
FRONTEND_URL=https://adilcreator.com

# Email Configuration
SMTP_HOST=mail.adilcreator.com
SMTP_USERNAME=admin@adilcreator.com
SMTP_PASSWORD=Muhadilmmad#11213
FROM_EMAIL=studio@adilcreator.com
ADMIN_EMAIL=admin@adilcreator.com

# Security
JWT_SECRET=I/rVsSBnNdU5+9GlR5aWHvtIigauxqqyQaAhnq4zlro=
APP_ENV=production
APP_DEBUG=false
```

---

## 🔐 **Admin Access**

Once deployed, access your admin panel:

**URL:** https://adilcreator.com/admin  
**Email:** admin@adilcreator.com  
**Password:** Muhadilmmad#11213  

---

## 🧪 **Testing After Deployment**

### **1. Test API Connectivity**
Visit: https://adilcreator.com/backend/api/test.php

Should return:
```json
{
  "success": true,
  "message": "API is working",
  "data": {
    "timestamp": "...",
    "environment": "production",
    "database": {
      "connected": true
    }
  }
}
```

### **2. Test Frontend**
Visit: https://adilcreator.com

Should load your React website.

### **3. Test Admin Panel**
Visit: https://adilcreator.com/admin

Should show login page, then dashboard after login.

### **4. Test Email**
Submit a contact form to test email functionality.

---

## 🛡️ **Security Checklist**

✅ **SSL Certificate:** Install SSL for HTTPS  
✅ **File Permissions:** Set correct permissions (755/644)  
✅ **Database Security:** SQLite file protected  
✅ **Environment Variables:** Secure JWT secret set  
✅ **Admin Password:** Strong password configured  
✅ **Email Security:** Secure SMTP credentials  

---

## 📁 **File Structure on Server**

```
adilcreator.com/
├── index.html              # React app entry point
├── assets/                 # CSS, JS, images
├── backend/
│   ├── index.php          # API entry point
│   ├── api/               # API endpoints
│   ├── classes/           # PHP classes
│   ├── config/            # Configuration
│   ├── database/          # SQLite database
│   ├── uploads/           # User uploads
│   └── vendor/            # Composer dependencies
├── .env                   # Environment config
└── .htaccess             # Web server config
```

---

## 🚀 **Go Live Steps**

1. **Upload Files:** Upload all files to your hosting
2. **Set Permissions:** Run permission commands
3. **Test API:** Check backend/api/test.php
4. **Test Frontend:** Check main website
5. **Login Admin:** Test admin panel access
6. **Configure SSL:** Set up HTTPS certificate
7. **Test Email:** Send test contact form
8. **Go Live:** Your site is ready!

---

## 📞 **Support**

If you encounter any issues:
1. Check error logs in `backend/logs/`
2. Verify file permissions
3. Test API endpoints individually
4. Check email server settings

**Your Adil Creator website is ready for production! 🎉**