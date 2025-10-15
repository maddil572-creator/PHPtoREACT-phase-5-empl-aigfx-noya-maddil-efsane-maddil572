#!/bin/bash

# AI Features Deployment Script for Hostinger
# This script deploys AI integration features to your Hostinger hosting

set -e  # Exit on any error

echo "🤖 AI Features Deployment Script"
echo "================================="
echo ""

# Configuration
HOSTINGER_HOST="your-domain.com"
HOSTINGER_USER="your-ftp-username"
HOSTINGER_PATH="/public_html"
DB_NAME="u720615217_adil_db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if required files exist
    required_files=(
        "backend/classes/OpenAIIntegration.php"
        "backend/api/ai.php"
        "backend/database/migrations/ai_features_schema.sql"
        "src/components/AIChatWidget.tsx"
        "src/admin/pages/AI/AIManagement.tsx"
        "backend/.env.ai.example"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "All required files found"
    
    # Check if .env file exists
    if [ ! -f "backend/.env" ]; then
        print_warning ".env file not found. You'll need to configure it manually."
    fi
    
    # Check if OpenAI API key is configured
    if [ -f "backend/.env" ]; then
        if ! grep -q "OPENAI_API_KEY=" backend/.env; then
            print_warning "OPENAI_API_KEY not found in .env file"
        fi
    fi
}

# Prepare files for deployment
prepare_files() {
    print_step "Preparing files for deployment..."
    
    # Create deployment directory
    mkdir -p deployment/ai_features
    
    # Copy backend files
    print_step "Copying backend files..."
    mkdir -p deployment/ai_features/backend/classes
    mkdir -p deployment/ai_features/backend/api
    mkdir -p deployment/ai_features/backend/database/migrations
    mkdir -p deployment/ai_features/backend/scripts
    
    cp backend/classes/OpenAIIntegration.php deployment/ai_features/backend/classes/
    cp backend/api/ai.php deployment/ai_features/backend/api/
    cp backend/database/migrations/ai_features_schema.sql deployment/ai_features/backend/database/migrations/
    cp backend/scripts/test_ai_integration.php deployment/ai_features/backend/scripts/
    cp backend/scripts/ai_maintenance.php deployment/ai_features/backend/scripts/
    
    # Copy frontend files
    print_step "Copying frontend files..."
    mkdir -p deployment/ai_features/src/components
    mkdir -p deployment/ai_features/src/admin/pages/AI
    
    cp src/components/AIChatWidget.tsx deployment/ai_features/src/components/
    cp src/components/AIContentGenerator.tsx deployment/ai_features/src/components/
    cp src/admin/pages/AI/AIManagement.tsx deployment/ai_features/src/admin/pages/AI/
    
    # Copy configuration files
    cp backend/.env.ai.example deployment/ai_features/
    cp AI_INTEGRATION_SETUP.md deployment/ai_features/
    
    print_success "Files prepared for deployment"
}

# Build frontend (if npm is available)
build_frontend() {
    print_step "Building frontend..."
    
    if command -v npm &> /dev/null; then
        print_step "Running npm build..."
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "Frontend build completed"
        else
            print_error "Frontend build failed"
            exit 1
        fi
    else
        print_warning "npm not found. Please build frontend manually with 'npm run build'"
    fi
}

# Upload files via FTP (requires lftp)
upload_files_ftp() {
    print_step "Uploading files via FTP..."
    
    if ! command -v lftp &> /dev/null; then
        print_error "lftp not found. Please install lftp or upload files manually."
        return 1
    fi
    
    read -p "Enter FTP password for $HOSTINGER_USER: " -s ftp_password
    echo ""
    
    # Upload backend files
    print_step "Uploading backend files..."
    lftp -c "
        set ftp:ssl-allow no;
        open ftp://$HOSTINGER_USER:$ftp_password@$HOSTINGER_HOST;
        cd $HOSTINGER_PATH/backend;
        mirror -R deployment/ai_features/backend/ ./;
        quit
    "
    
    # Upload frontend files (if built)
    if [ -d "dist" ]; then
        print_step "Uploading frontend files..."
        lftp -c "
            set ftp:ssl-allow no;
            open ftp://$HOSTINGER_USER:$ftp_password@$HOSTINGER_HOST;
            cd $HOSTINGER_PATH;
            mirror -R dist/ ./;
            quit
        "
    fi
    
    print_success "Files uploaded successfully"
}

# Generate deployment package
create_deployment_package() {
    print_step "Creating deployment package..."
    
    # Create zip file for manual upload
    zip -r ai_features_deployment.zip deployment/ai_features/
    
    print_success "Deployment package created: ai_features_deployment.zip"
    print_step "You can upload this package manually to your Hostinger hosting"
}

# Database migration instructions
show_database_instructions() {
    print_step "Database Migration Instructions"
    echo ""
    echo "1. Login to Hostinger Control Panel"
    echo "2. Go to Databases → phpMyAdmin"
    echo "3. Select database: $DB_NAME"
    echo "4. Click Import tab"
    echo "5. Upload file: ai_features_schema.sql"
    echo "6. Click Go to execute"
    echo ""
    print_warning "Make sure to backup your database before running migrations!"
}

# Environment configuration instructions
show_env_instructions() {
    print_step "Environment Configuration"
    echo ""
    echo "Add these variables to your backend/.env file:"
    echo ""
    cat backend/.env.ai.example
    echo ""
    print_warning "Don't forget to get your OpenAI API key from: https://platform.openai.com/api-keys"
}

# Testing instructions
show_testing_instructions() {
    print_step "Testing Instructions"
    echo ""
    echo "After deployment, run these tests:"
    echo ""
    echo "1. Test AI integration:"
    echo "   php backend/scripts/test_ai_integration.php"
    echo ""
    echo "2. Test admin panel:"
    echo "   Visit: https://$HOSTINGER_HOST/admin"
    echo "   Navigate to AI Management section"
    echo ""
    echo "3. Test chat widget:"
    echo "   Visit: https://$HOSTINGER_HOST"
    echo "   Look for chat button in bottom-right corner"
    echo ""
}

# Main deployment process
main() {
    echo "Starting AI features deployment process..."
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Prepare files
    prepare_files
    
    # Build frontend
    build_frontend
    
    # Ask deployment method
    echo ""
    echo "Choose deployment method:"
    echo "1. FTP Upload (requires lftp)"
    echo "2. Create deployment package for manual upload"
    echo ""
    read -p "Enter choice (1 or 2): " deployment_choice
    
    case $deployment_choice in
        1)
            upload_files_ftp
            ;;
        2)
            create_deployment_package
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Show instructions
    echo ""
    show_database_instructions
    echo ""
    show_env_instructions
    echo ""
    show_testing_instructions
    
    echo ""
    print_success "🎉 AI Features Deployment Completed!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your .env file with OpenAI API key"
    echo "2. Run database migrations"
    echo "3. Test the integration"
    echo "4. Monitor costs and usage"
    echo ""
    echo "For detailed setup instructions, see: AI_INTEGRATION_SETUP.md"
}

# Cleanup function
cleanup() {
    if [ -d "deployment" ]; then
        rm -rf deployment
        print_step "Cleaned up temporary files"
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"