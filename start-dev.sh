#!/bin/bash

# Adil GFX Development Startup Script
# Starts both frontend and backend servers

echo "🚀 Starting Adil GFX Development Environment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env file with your configuration and run this script again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed. Please install PHP 7.4+ and try again."
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer and try again."
    exit 1
fi

# Install Node.js dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Install PHP dependencies
if [ ! -d "backend/vendor" ]; then
    echo "📦 Installing PHP dependencies..."
    cd backend && composer install && cd ..
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/cache
mkdir -p backend/logs

# Set permissions (for Unix-like systems)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    chmod 755 backend/uploads
    chmod 755 backend/cache
    chmod 755 backend/logs
fi

# Test database connection
echo "🔍 Testing database connection..."
php backend/test_db.php

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed. Please check your database configuration in .env"
    echo "Make sure MySQL is running and the database exists."
    exit 1
fi

echo "✅ Database connection successful!"

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start PHP development server
echo "🔧 Starting PHP backend server on http://localhost:8000..."
cd backend
php -S localhost:8000 index.php > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Test backend API
echo "🔍 Testing backend API..."
curl -s http://localhost:8000/api/test.php > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API is responding!"
else
    echo "⚠️ Backend API test failed, but continuing..."
fi

# Start React development server
echo "🔧 Starting React frontend server on http://localhost:5173..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend:  http://localhost:8000"
echo "📍 API Test: http://localhost:8000/api/test.php"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop the script
wait