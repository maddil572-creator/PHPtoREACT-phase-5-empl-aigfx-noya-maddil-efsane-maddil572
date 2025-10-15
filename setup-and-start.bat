@echo off
REM =====================================================
REM Adil GFX Complete Setup and Startup Script for Windows
REM =====================================================

echo 🚀 Adil GFX Complete Setup ^& Startup
echo ====================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    if exist ".env.example" (
        copy .env.example .env >nul
    ) else (
        echo # Please configure your environment variables > .env
    )
    echo ℹ️  Please edit .env file with your database credentials and run this script again.
    pause
    exit /b 1
)

echo ✅ .env file found

REM Check dependencies
echo ℹ️  Checking dependencies...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check PHP
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PHP is not installed. Please install PHP 7.4+ and try again.
    pause
    exit /b 1
)
echo ✅ PHP found

REM Check Composer
composer --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Composer is not installed. Please install Composer and try again.
    pause
    exit /b 1
)
echo ✅ Composer found

REM Install Node.js dependencies
echo ℹ️  Installing Node.js dependencies...
if not exist "node_modules" (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    echo ✅ Node.js dependencies installed
) else (
    echo ✅ Node.js dependencies already installed
)

REM Install PHP dependencies
echo ℹ️  Installing PHP dependencies...
if not exist "backend\vendor" (
    cd backend
    composer install
    cd ..
    if errorlevel 1 (
        echo ❌ Failed to install PHP dependencies
        pause
        exit /b 1
    )
    echo ✅ PHP dependencies installed
) else (
    echo ✅ PHP dependencies already installed
)

REM Create necessary directories
echo ℹ️  Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\uploads\images" mkdir backend\uploads\images
if not exist "backend\uploads\documents" mkdir backend\uploads\documents
if not exist "backend\uploads\videos" mkdir backend\uploads\videos
if not exist "backend\uploads\thumbnails" mkdir backend\uploads\thumbnails
if not exist "backend\cache" mkdir backend\cache
if not exist "backend\logs" mkdir backend\logs
echo ✅ Directories created

REM Run database installation
echo ℹ️  Setting up database...
php backend\install.php
if errorlevel 1 (
    echo ❌ Database setup failed. Please check your database configuration.
    pause
    exit /b 1
)
echo ✅ Database setup completed

REM Start PHP development server
echo ℹ️  Starting PHP backend server on http://localhost:8000...
start /b php -S localhost:8000 -t backend backend\index.php

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Test backend API
echo ℹ️  Testing backend API...
curl -s http://localhost:8000/api/test.php >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend API test failed, but continuing...
) else (
    echo ✅ Backend API is responding!
)

REM Start React development server
echo ℹ️  Starting React frontend server on http://localhost:5173...
start /b npm run dev

echo.
echo ✅ 🎉 Development environment is ready!
echo.
echo 📍 URLs:
echo    Frontend:  http://localhost:5173
echo    Backend:   http://localhost:8000
echo    API Test:  http://localhost:8000/api/test.php
echo    Admin:     http://localhost:5173/admin
echo.
echo 👤 Admin Login:
echo    Email:     admin@adilgfx.com
echo    Password:  admin123
echo    ⚠️  Change password after first login!
echo.
echo 🔧 API Test Page:
echo    URL:       http://localhost:5173/api-test
echo.
echo 🛑 Press any key to stop all servers...
pause >nul

REM Kill PHP and Node processes
echo ℹ️  Shutting down development servers...
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo ✅ Development servers stopped.
pause