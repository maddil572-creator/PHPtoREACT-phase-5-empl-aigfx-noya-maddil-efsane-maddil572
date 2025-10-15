@echo off
REM Adil GFX Development Startup Script for Windows
REM Starts both frontend and backend servers

echo 🚀 Starting Adil GFX Development Environment...

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Copying from .env.example...
    copy .env.example .env
    echo ✅ Please edit .env file with your configuration and run this script again.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

REM Check if PHP is installed
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PHP is not installed. Please install PHP 7.4+ and try again.
    pause
    exit /b 1
)

REM Install Node.js dependencies
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Install PHP dependencies
if not exist "backend\vendor" (
    echo 📦 Installing PHP dependencies...
    cd backend
    composer install
    cd ..
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\cache" mkdir backend\cache
if not exist "backend\logs" mkdir backend\logs

REM Test database connection
echo 🔍 Testing database connection...
php backend\test_db.php
if errorlevel 1 (
    echo ❌ Database connection failed. Please check your database configuration in .env
    echo Make sure MySQL is running and the database exists.
    pause
    exit /b 1
)

echo ✅ Database connection successful!

REM Start PHP development server
echo 🔧 Starting PHP backend server on http://localhost:8000...
start /b php -S localhost:8000 -t backend backend\index.php

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Test backend API
echo 🔍 Testing backend API...
curl -s http://localhost:8000/api/test.php >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Backend API test failed, but continuing...
) else (
    echo ✅ Backend API is responding!
)

REM Start React development server
echo 🔧 Starting React frontend server on http://localhost:5173...
start /b npm run dev

echo.
echo 🎉 Development environment is ready!
echo.
echo 📍 Frontend: http://localhost:5173
echo 📍 Backend:  http://localhost:8000
echo 📍 API Test: http://localhost:8000/api/test.php
echo.
echo Press any key to stop all servers...
pause >nul

REM Kill PHP and Node processes
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo 🛑 Development servers stopped.
pause