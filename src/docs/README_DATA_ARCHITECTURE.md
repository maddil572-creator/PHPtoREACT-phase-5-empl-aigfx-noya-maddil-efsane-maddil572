# Adil GFX - Data Architecture Documentation

## 🎯 Overview

This project is a **production-ready, conversion-focused design services platform** built with React, TypeScript, and Tailwind CSS. The entire system is designed with **zero hardcoded content** - all dynamic data comes from mock JSON files that can easily be swapped with live API calls.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── notification-center.tsx
│   ├── referral-banner.tsx
│   └── popup-offer.tsx
├── data/               # Mock JSON data files
│   ├── blogs.json
│   ├── testimonials.json
│   ├── portfolio.json
│   ├── services.json
│   ├── notifications.json
│   └── userData.json
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Auth.tsx        # Login/Signup
│   ├── Dashboard.tsx   # User dashboard
│   └── ...
├── utils/
│   └── api.ts          # Centralized API utilities
└── ...
```

---

## 📊 Data Files Schema

### 1. **blogs.json**
```json
{
  "id": number,
  "title": string,
  "slug": string,
  "excerpt": string,
  "content": string,
  "category": string,
  "author": {
    "name": string,
    "avatar": string,
    "bio": string
  },
  "date": string (ISO format),
  "readTime": string,
  "featuredImage": string,
  "tags": string[],
  "featured": boolean,
  "views": number,
  "likes": number
}
```

**Used in:** Blog page, blog listings, featured posts

**API Endpoint (when live):** `GET /api/blogs`, `GET /api/blogs/:id`

---

### 2. **testimonials.json**
```json
{
  "id": number,
  "name": string,
  "role": string,
  "company": string,
  "content": string,
  "rating": number (1-5),
  "avatar": string,
  "date": string (ISO format),
  "projectType": string,
  "verified": boolean
}
```

**Used in:** Testimonials section, service pages

**API Endpoint:** `GET /api/testimonials`

---

### 3. **portfolio.json**
```json
{
  "id": number,
  "title": string,
  "slug": string,
  "category": string,
  "description": string,
  "longDescription": string,
  "client": string,
  "completionDate": string,
  "featuredImage": string,
  "images": string[],
  "beforeImage": string,
  "afterImage": string,
  "tags": string[],
  "results": {
    "metric1": string,
    "metric2": string,
    "metric3": string
  },
  "featured": boolean,
  "views": number
}
```

**Used in:** Portfolio page, portfolio highlights

**API Endpoint:** `GET /api/portfolio?category=:category`

---

### 4. **services.json**
```json
{
  "id": number,
  "name": string,
  "slug": string,
  "icon": string,
  "tagline": string,
  "description": string,
  "features": string[],
  "pricingTiers": [
    {
      "name": string,
      "price": number,
      "duration": string,
      "features": string[],
      "popular": boolean (optional)
    }
  ],
  "deliveryTime": string,
  "popular": boolean,
  "testimonialIds": number[]
}
```

**Used in:** Services page, pricing calculator

**API Endpoint:** `GET /api/services`, `GET /api/services/:slug`

---

### 5. **notifications.json**
```json
{
  "id": number,
  "type": "success" | "info" | "reward" | "promo" | "milestone",
  "title": string,
  "message": string,
  "timestamp": string (ISO format),
  "read": boolean,
  "actionUrl": string,
  "icon": string
}
```

**Used in:** Notification center component

**API Endpoint:** `GET /api/notifications`, `PATCH /api/notifications/:id/read`

---

### 6. **userData.json**
```json
{
  "user": {
    "id": string,
    "email": string,
    "name": string,
    "avatar": string,
    "joinDate": string,
    "membershipTier": string,
    "verified": boolean
  },
  "tokens": {
    "balance": number,
    "totalEarned": number,
    "totalSpent": number,
    "history": [...]
  },
  "streak": {
    "current": number,
    "longest": number,
    "lastCheckIn": string,
    "nextMilestone": number,
    "rewards": { [milestone: number]: reward: number }
  },
  "referrals": {...},
  "orders": [...],
  "achievements": [...],
  "preferences": {...}
}
```

**Used in:** Dashboard, user profile

**API Endpoint:** `GET /api/user/profile` (requires auth)

---

## 🔄 Switching from Mock to Live API

The `src/utils/api.ts` file centralizes all data fetching. To switch from mock data to live API:

### Option 1: Environment Variable
```env
# .env file
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://your-backend.com
```

### Option 2: Code Example
```typescript
// Before (mock data)
const blogs = await fetchBlogs();

// After (live API) - NO CHANGES NEEDED!
// Just set VITE_USE_MOCK_DATA=false
const blogs = await fetchBlogs();
```

The API utility automatically handles:
- Network delays simulation
- Error handling with fallbacks
- Loading states
- Authentication headers (for protected routes)

---

## 🎨 Key Features

### ✅ User Authentication
- Login/Signup pages with validation
- Protected dashboard routes
- Session management

### ✅ User Dashboard
- Token balance & earning history
- Login streak tracker with milestones
- Referral system with custom links
- Order tracking
- Achievement badges

### ✅ Conversion Optimization
- **Notification Center**: Real-time notifications
- **Referral Banner**: Sticky promotional banner
- **Popup Offers**: First-time and returning visitor popups
- Strategic CTA placement throughout

### ✅ Blog System
- Featured posts
- Category filtering
- Search functionality
- Newsletter signup

### ✅ Portfolio Showcase
- Category filters
- Before/after comparisons
- Modal previews

### ✅ Services Carousel
- Interactive slider
- Pricing tiers
- Service comparison

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🔌 Backend Integration Checklist

When connecting to your PHP/Node.js backend:

- [ ] Set `VITE_USE_MOCK_DATA=false` in `.env`
- [ ] Set `VITE_API_BASE_URL` to your backend URL
- [ ] Implement authentication endpoints
- [ ] Create database tables matching JSON schemas
- [ ] Set up CORS for frontend domain
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Add input validation on backend
- [ ] Set up email notifications
- [ ] Configure file upload for user avatars

---

## 📝 Notes

- All timestamps use ISO 8601 format
- Images use placeholder URLs - replace with actual CDN/storage
- Authentication uses localStorage (upgrade to httpOnly cookies in production)
- Mock API includes 300ms delay to simulate network latency
- All currency values are in USD

---

## 🎯 Conversion Features

1. **Token System**: Gamification to increase user engagement
2. **Referral Program**: Viral growth mechanism
3. **Streak Rewards**: Daily login incentive
4. **Popup Offers**: Capture emails with discounts
5. **Notification Center**: Keep users engaged
6. **Achievement System**: Milestone celebrations

---

## 📧 Contact

For questions about this architecture, refer to the inline documentation in `src/utils/api.ts`

**Ready for production deployment!** 🚀
