#!/bin/bash

# =====================================================
# Adil Creator - Production Deployment Script
# =====================================================
# Prepares the system for deployment to adilcreator.com
# =====================================================

echo "🚀 Adil Creator - Production Deployment Preparation"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "✅ Domain: adilcreator.com"
echo "✅ Database: u720615217_adil_db"
echo "✅ Admin Email: admin@adilcreator.com"
echo "✅ Studio Email: studio@adilcreator.com"
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
echo "Installing Node.js dependencies..."
npm install --production

echo "Installing PHP dependencies..."
cd backend
composer install --no-dev --optimize-autoloader
cd ..

# Build frontend for production
echo -e "${YELLOW}🏗️  Building frontend for production...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
mkdir -p deployment-package

# Copy essential files
cp -r dist/* deployment-package/
cp -r backend deployment-package/
cp .env deployment-package/
cp .htaccess deployment-package/ 2>/dev/null || echo "No .htaccess found, will create one"

# Create .htaccess for production
cat > deployment-package/.htaccess << 'EOF'
# Adil Creator - Production .htaccess
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
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Protect sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.json">
    Order allow,deny
    Deny from all
</Files>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF

# Set proper permissions in deployment package
echo -e "${YELLOW}🔐 Setting file permissions...${NC}"
find deployment-package -type f -name "*.php" -exec chmod 644 {} \;
find deployment-package -type d -exec chmod 755 {} \;
chmod 755 deployment-package/backend/uploads/
chmod 755 deployment-package/backend/cache/
chmod 755 deployment-package/backend/logs/

echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo ""
echo -e "${BLUE}📁 Deployment package contents:${NC}"
echo "├── index.html (React app entry point)"
echo "├── assets/ (CSS, JS, images)"
echo "├── backend/ (PHP API)"
echo "├── .env (production configuration)"
echo "└── .htaccess (web server configuration)"
echo ""

echo -e "${YELLOW}🚀 Next Steps for Deployment:${NC}"
echo "1. Upload contents of 'deployment-package/' to your hosting root directory"
echo "2. Ensure your Hostinger database is accessible:"
echo "   - Database: u720615217_adil_db"
echo "   - Username: u720615217_adil"
echo "   - Password: Muhadilmmad#11213"
echo "3. Run database setup: https://adilcreator.com/backend/install.php"
echo "4. Test your site: https://adilcreator.com"
echo "5. Access admin panel: https://adilcreator.com/admin"
echo ""

echo -e "${GREEN}🎉 Production deployment package ready!${NC}"
echo -e "${BLUE}📞 Admin Login:${NC}"
echo "   Email: admin@adilcreator.com"
echo "   Password: Muhadilmmad#11213"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "- Set up SSL certificate for HTTPS"
echo "- Test email functionality after deployment"
echo "- Verify all API endpoints are working"
echo ""