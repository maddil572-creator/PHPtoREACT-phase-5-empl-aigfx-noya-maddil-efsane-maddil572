#!/bin/bash

# =====================================================
# Adil GFX Complete Setup and Startup Script
# This script sets up everything and starts the development environment
# =====================================================

echo "🚀 Adil GFX Complete Setup & Startup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "# Please configure your environment variables" > .env
    print_info "Please edit .env file with your database credentials and run this script again."
    exit 1
fi

print_status ".env file found"

# Check dependencies
print_info "Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi
print_status "Node.js found: $(node --version)"

# Check PHP
if ! command -v php &> /dev/null; then
    print_error "PHP is not installed. Please install PHP 7.4+ and try again."
    exit 1
fi
print_status "PHP found: $(php --version | head -n1)"

# Check Composer
if ! command -v composer &> /dev/null; then
    print_error "Composer is not installed. Please install Composer and try again."
    exit 1
fi
print_status "Composer found: $(composer --version | head -n1)"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client not found. Make sure MySQL server is running."
else
    print_status "MySQL client found"
fi

# Install Node.js dependencies
print_info "Installing Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_status "Node.js dependencies installed"
    else
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi
else
    print_status "Node.js dependencies already installed"
fi

# Install PHP dependencies
print_info "Installing PHP dependencies..."
if [ ! -d "backend/vendor" ]; then
    cd backend && composer install && cd ..
    if [ $? -eq 0 ]; then
        print_status "PHP dependencies installed"
    else
        print_error "Failed to install PHP dependencies"
        exit 1
    fi
else
    print_status "PHP dependencies already installed"
fi

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p backend/uploads/{images,documents,videos,thumbnails}
mkdir -p backend/cache
mkdir -p backend/logs

# Set permissions (for Unix-like systems)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    chmod -R 755 backend/uploads
    chmod -R 755 backend/cache
    chmod -R 755 backend/logs
    print_status "Directory permissions set"
fi

# Run database installation
print_info "Setting up database..."
php backend/install.php

if [ $? -eq 0 ]; then
    print_status "Database setup completed"
else
    print_error "Database setup failed. Please check your database configuration."
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo ""
    print_info "Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start PHP development server
print_info "Starting PHP backend server on http://localhost:8000..."
cd backend
php -S localhost:8000 index.php > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Test backend API
print_info "Testing backend API..."
if curl -s http://localhost:8000/api/test.php > /dev/null 2>&1; then
    print_status "Backend API is responding!"
else
    print_warning "Backend API test failed, but continuing..."
fi

# Start React development server
print_info "Starting React frontend server on http://localhost:5173..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
print_status "🎉 Development environment is ready!"
echo ""
echo "📍 URLs:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8000"
echo "   API Test:  http://localhost:8000/api/test.php"
echo "   Admin:     http://localhost:5173/admin"
echo ""
echo "👤 Admin Login:"
echo "   Email:     admin@adilgfx.com"
echo "   Password:  admin123"
echo "   ⚠️  Change password after first login!"
echo ""
echo "🔧 API Test Page:"
echo "   URL:       http://localhost:5173/api-test"
echo ""
echo "📝 Logs:"
echo "   Backend:   tail -f backend.log"
echo "   Frontend:  tail -f frontend.log"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo ""

# Keep script running and wait for user to stop
while true; do
    sleep 1
done