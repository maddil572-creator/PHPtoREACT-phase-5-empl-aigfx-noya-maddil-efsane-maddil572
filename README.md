# Adil Creator - Professional Design Platform

A complete full-stack web application for professional design services including logo design, YouTube thumbnails, and video editing.

**🌐 Live Website:** https://adilcreator.com  
**👤 Admin Panel:** https://adilcreator.com/admin  
**📧 Contact:** admin@adilcreator.com

## 🚀 Quick Start

### Prerequisites
- PHP 8.4+ with SQLite extension
- Node.js 18+ and npm
- Composer

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd adil-gfx
   ```

2. **Install dependencies:**
   ```bash
   # Backend dependencies
   cd backend && composer install && cd ..
   
   # Frontend dependencies
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Copy and edit environment file
   cp .env.example .env
   # Update database and email settings in .env
   ```

4. **Setup database:**
   ```bash
   php backend/install.php
   ```

5. **Start servers:**
   ```bash
   # Backend (Terminal 1)
   php -S localhost:8000 -t backend/
   
   # Frontend (Terminal 2)
   npm run dev
   ```

## 🌐 Access Points

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8080/admin
- **API Test:** http://localhost:8080/api-test

### Admin Credentials
- **Email:** admin@adilcreator.com
- **Password:** Muhadilmmad#11213

## 🏗️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/UI components
- React Query for data fetching

### Backend
- PHP 8.4 with SQLite database
- JWT authentication
- RESTful API architecture
- File upload management
- Email notifications

## 📁 Project Structure

```
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── admin/             # Admin panel
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── backend/               # PHP backend
│   ├── api/               # API endpoints
│   ├── classes/           # PHP classes
│   ├── config/            # Configuration files
│   └── database/          # Database files
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables
Key variables in `.env`:
- `VITE_API_BASE_URL` - Backend API URL
- `DB_NAME` - Database file path
- `JWT_SECRET` - JWT signing secret
- `SMTP_*` - Email configuration

### Database
**Production:** MySQL on Hostinger (u720615217_adil_db)  
**Development:** SQLite for local testing

## 🎯 Features

- **Portfolio Management** - Showcase design work
- **Blog System** - Content management
- **Service Catalog** - Service offerings
- **Contact Forms** - Lead generation
- **Admin Dashboard** - Content management
- **User Authentication** - Secure access
- **File Upload** - Media management
- **Email Notifications** - Automated communications

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention
- Rate limiting

## 📝 API Documentation

Main API endpoints:
- `GET /api/test.php` - API status
- `POST /api/auth.php/login` - User login
- `GET /api/blogs.php` - Get blog posts
- `GET /api/services.php` - Get services
- `GET /api/portfolio.php` - Get portfolio items

## 🚀 Deployment

1. Upload files to web server
2. Configure web server to serve `backend/index.php` for API routes
3. Update `.env` with production settings
4. Run `php backend/install.php` on server
5. Build frontend: `npm run build`
6. Serve built files from `dist/` directory

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for professional design services**