# Mock Data Inventory and Integration Status

**Project:** Adil GFX - Design Services Platform
**Date:** October 1, 2025
**Purpose:** Track all mock data files and their integration status with PHP/MySQL backend

---

## Overview

The Adil GFX platform was initially developed with **mock JSON data** for rapid prototyping. The backend PHP/MySQL API infrastructure has been implemented, but the system currently operates in **HYBRID MODE** where it can use either mock data or live API endpoints.

### Current Architecture

**Data Flow:**
```
React Component → API Utility → [Mock JSON OR PHP API] → MySQL Database
                  (api.ts)      (toggle via VITE_USE_MOCK_DATA)
```

**Control Variable:**
- **Location:** `/src/utils/api.ts:25`
- **Variable:** `USE_MOCK_DATA`
- **Default:** `true` (uses mock data by default)
- **Production Setting:** Must be `false`

---

## Mock Data Files Inventory

### 1. Blogs Data

**File:** `/src/data/blogs.json`
**Size:** 3 entries (sample data)
**Schema:** Matches README_DATA_ARCHITECTURE.md specification

#### Structure:
```json
{
  "id": number,
  "title": string,
  "slug": string,
  "excerpt": string,
  "content": string (markdown),
  "category": string,
  "author": {
    "name": string,
    "avatar": string (placeholder URL),
    "bio": string
  },
  "date": string (ISO format),
  "readTime": string,
  "featuredImage": string (placeholder URL),
  "tags": string[],
  "featured": boolean,
  "views": number,
  "likes": number
}
```

#### Frontend References:
| File | Lines | Usage |
|------|-------|-------|
| `/src/pages/Blog.tsx` | Multiple | Blog listing page |
| `/src/pages/BlogDetail.tsx` | Multiple | Individual blog posts |
| `/src/pages/Home.tsx` | Multiple | Featured blogs on homepage |
| `/src/utils/api.ts` | 16, 352-378 | Import and fetchBlogs() |

#### Backend Integration:
- **API Endpoint:** `/backend/api/blogs.php`
- **Manager Class:** `/backend/classes/BlogManager.php`
- **Database Table:** `blogs`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Script:** `/backend/scripts/install_database.php:31-55`
- **Action:** Imports all mock blogs into MySQL
- **Status:** ⚠️ **READY** (requires running script)

---

### 2. Testimonials Data

**File:** `/src/data/testimonials.json`
**Size:** Multiple entries
**Schema:** Client feedback with ratings

#### Structure:
```json
{
  "id": number,
  "name": string,
  "role": string,
  "company": string,
  "content": string,
  "rating": number (1-5),
  "avatar": string (placeholder URL),
  "date": string (ISO format),
  "projectType": string,
  "verified": boolean
}
```

#### Frontend References:
| File | Lines | Usage |
|------|-------|-------|
| `/src/pages/Testimonials.tsx` | Multiple | Testimonials page |
| `/src/components/testimonials-section.tsx` | Multiple | Homepage testimonials section |
| `/src/utils/api.ts` | 17, 408-421 | Import and fetchTestimonials() |

#### Backend Integration:
- **API Endpoint:** `/backend/api/testimonials.php`
- **Manager Class:** `/backend/classes/TestimonialManager.php`
- **Database Table:** `testimonials`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Script:** `/backend/scripts/install_database.php:57-78`
- **Action:** Imports all testimonials into MySQL
- **Status:** ⚠️ **READY** (requires running script)

---

### 3. Portfolio Data

**File:** `/src/data/portfolio.json`
**Size:** Multiple project entries
**Schema:** Project showcase with before/after images

#### Structure:
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
  "featuredImage": string (placeholder URL),
  "images": string[] (placeholder URLs),
  "beforeImage": string (placeholder URL),
  "afterImage": string (placeholder URL),
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

#### Frontend References:
| File | Lines | Usage |
|------|-------|-------|
| `/src/pages/Portfolio.tsx` | Multiple | Portfolio listing page |
| `/src/components/portfolio-highlights.tsx` | Multiple | Homepage portfolio section |
| `/src/pages/Home.tsx` | Multiple | Featured portfolio items |
| `/src/utils/api.ts` | 18, 430-501 | Import and fetchPortfolio() |

#### Backend Integration:
- **API Endpoint:** `/backend/api/portfolio.php`
- **Manager Class:** `/backend/classes/PortfolioManager.php`
- **Database Table:** `portfolio`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Script:** `/backend/scripts/install_database.php:80-108`
- **Action:** Imports all portfolio items into MySQL
- **Status:** ⚠️ **READY** (requires running script)

---

### 4. Services Data

**File:** `/src/data/services.json`
**Size:** Multiple service offerings
**Schema:** Service descriptions with pricing tiers

#### Structure:
```json
{
  "id": number,
  "name": string,
  "slug": string,
  "icon": string (lucide-react icon name),
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

#### Frontend References:
| File | Lines | Usage |
|------|-------|-------|
| `/src/pages/Services.tsx` | Multiple | Services listing page |
| `/src/components/services-overview.tsx` | Multiple | Homepage services carousel |
| `/src/pages/Home.tsx` | Multiple | Featured services |
| `/src/utils/api.ts` | 19, 507-543 | Import and fetchServices() |

#### Backend Integration:
- **API Endpoint:** `/backend/api/services.php`
- **Manager Class:** `/backend/classes/ServiceManager.php`
- **Database Table:** `services`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Script:** `/backend/scripts/install_database.php:110-132`
- **Action:** Imports all services into MySQL
- **Status:** ⚠️ **READY** (requires running script)

---

### 5. Notifications Data

**File:** `/src/data/notifications.json`
**Size:** Multiple notification entries
**Schema:** User notifications and alerts

#### Structure:
```json
{
  "id": number,
  "type": "success" | "info" | "reward" | "promo" | "milestone",
  "title": string,
  "message": string,
  "timestamp": string (ISO format),
  "read": boolean,
  "actionUrl": string,
  "icon": string (lucide-react icon name)
}
```

#### Frontend References:
| File | Lines | Usage |
|------|-------|-------|
| `/src/components/notification-center.tsx` | Multiple | Notification dropdown |
| `/src/pages/Dashboard.tsx` | Multiple | User dashboard notifications |
| `/src/utils/api.ts` | 20, 550-593 | Import and fetchNotifications() |

#### Backend Integration:
- **API Endpoint:** `/backend/api/notifications.php` (implied, not verified)
- **Manager Class:** Not documented (likely inline in API)
- **Database Table:** `notifications`
- **Status:** ⚠️ **ASSUMED IMPLEMENTED**

#### Migration Status:
- **Script:** ⚠️ **NOT FOUND** in install_database.php
- **Action:** Needs migration script creation
- **Status:** ❌ **MISSING**

---

### 6. User Data

**File:** `/src/data/userData.json`
**Size:** 1 complete user profile with nested data
**Schema:** Comprehensive user profile with gamification

#### Structure:
```json
{
  "user": {
    "id": string,
    "email": string,
    "name": string,
    "avatar": string (placeholder URL),
    "joinDate": string,
    "membershipTier": string,
    "verified": boolean
  },
  "tokens": {
    "balance": number,
    "totalEarned": number,
    "totalSpent": number,
    "history": [
      {
        "id": string,
        "type": "earned" | "spent",
        "amount": number,
        "description": string,
        "date": string
      }
    ]
  },
  "streak": {
    "current": number,
    "longest": number,
    "lastCheckIn": string,
    "nextMilestone": number,
    "rewards": { [milestone: number]: reward: number }
  },
  "referrals": {
    "code": string,
    "totalReferred": number,
    "successfulConversions": number,
    "earningsFromReferrals": number,
    "referralLink": string
  },
  "orders": [ ... ],
  "achievements": [ ... ],
  "preferences": { ... }
}
```

#### Frontend References:
| File | Lines | Usage |
|------|-------|-------|
| `/src/pages/Dashboard.tsx` | 11, 38-39 | Main dashboard data |
| `/src/utils/api.ts` | 21, 599-616 | Import and fetchUserData() |

#### Backend Integration:
- **API Endpoint:** `/backend/api/user/profile.php`
- **Manager Classes:** Multiple (Auth, TokenManager, StreakManager, etc.)
- **Database Tables:** `users`, `user_tokens`, `user_streaks`, `referrals`, `orders`, `user_achievements`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Script:** Partially in install_database.php (users table seeded with admin)
- **Action:** User data created dynamically on registration
- **Status:** ✅ **DYNAMIC** (no migration needed)

---

## Integration Status Summary

| Data Type | Mock File | Backend API | Database Import | Status |
|-----------|-----------|-------------|-----------------|--------|
| Blogs | ✅ | ✅ | ✅ | 🟢 **READY** |
| Testimonials | ✅ | ✅ | ✅ | 🟢 **READY** |
| Portfolio | ✅ | ✅ | ✅ | 🟢 **READY** |
| Services | ✅ | ✅ | ✅ | 🟢 **READY** |
| Notifications | ✅ | ⚠️ | ❌ | 🔴 **INCOMPLETE** |
| User Data | ✅ | ✅ | 🟢 | 🟢 **DYNAMIC** |

### Legend:
- 🟢 **READY:** Fully implemented and ready for production
- ⚠️ **PARTIAL:** Implementation exists but needs verification
- 🔴 **INCOMPLETE:** Critical gaps, needs work
- 🟠 **PENDING:** Awaiting configuration or deployment

---

## Additional Mock Data Sources

### 7. Global Settings (Mock in api.ts)

**Location:** `/src/utils/api.ts:31-68`
**Type:** Inline mock object (not JSON file)

#### Structure:
```typescript
{
  branding: {
    siteLogo: string,
    primaryColor: string,
    secondaryColor: string,
    fontFamily: string
  },
  contact: {
    email: string,
    phone: string,
    whatsapp: string
  },
  social: {
    facebook: string,
    instagram: string,
    linkedin: string,
    youtube: string
  },
  features: {
    enableReferrals: boolean,
    enableStreaks: boolean,
    enableTokens: boolean,
    enablePopups: boolean
  }
}
```

#### Backend Integration:
- **API Endpoint:** `/backend/api/settings.php`
- **Manager Class:** `/backend/classes/SettingsManager.php`
- **Database Table:** `settings`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Action:** Admin must configure via admin panel
- **Status:** 🟠 **MANUAL CONFIGURATION**

---

### 8. Page Content (Mock in api.ts)

**Location:** `/src/utils/api.ts:75-105`
**Type:** Inline mock page structure

#### Structure:
```typescript
{
  id: number,
  title: string,
  slug: string,
  metaTitle: string,
  metaDescription: string,
  sections: [
    {
      type: "hero" | "content" | "services" | ...,
      title: string,
      subtitle: string,
      description: string,
      ctaText: string,
      ctaUrl: string
    }
  ]
}
```

#### Backend Integration:
- **API Endpoint:** `/backend/api/pages.php`
- **Manager Class:** `/backend/classes/PageManager.php`
- **Database Table:** `pages`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Action:** Admin must create pages via CMS
- **Status:** 🟠 **MANUAL CONFIGURATION**

---

### 9. Carousel Slides (Mock in api.ts)

**Location:** `/src/utils/api.ts:112-135`
**Type:** Inline mock carousel array

#### Structure:
```typescript
{
  id: number,
  title: string,
  subtitle: string,
  description: string,
  imageUrl: string,
  ctaText: string,
  ctaUrl: string
}
```

#### Backend Integration:
- **API Endpoint:** `/backend/api/carousel.php`
- **Manager Class:** `/backend/classes/CarouselManager.php`
- **Database Table:** `carousel_slides`
- **Status:** ✅ **IMPLEMENTED**

#### Migration Status:
- **Action:** Admin must configure via admin panel
- **Status:** 🟠 **MANUAL CONFIGURATION**

---

## Production Cutover Plan

### Phase 1: Database Setup ✅
1. ✅ Create MySQL database on Hostinger
2. ❌ Import schema.sql (MISSING - needs creation)
3. ⚠️ Run `/backend/scripts/install_database.php`
4. ⚠️ Verify data import success
5. ⚠️ Create missing notification entries

### Phase 2: Backend Configuration ⚠️
1. ❌ Copy and configure `/backend/.env` file
2. ❌ Run `composer install` in `/backend` directory
3. ❌ Create `/backend/cache` directory (permissions: 777)
4. ❌ Create `/backend/uploads` directory (permissions: 777)
5. ⚠️ Test API endpoint connectivity
6. ⚠️ Verify database connections work

### Phase 3: Frontend Configuration ⚠️
1. ❌ Create `/.env` file with production settings
2. ❌ Set `VITE_USE_MOCK_DATA=false`
3. ❌ Set `VITE_API_BASE_URL=https://adilgfx.com/backend`
4. ⚠️ Run `npm run build`
5. ⚠️ Test build output
6. ⚠️ Deploy to Hostinger

### Phase 4: Manual Content Setup 🟠
1. 🟠 Login to admin panel
2. 🟠 Configure global settings (branding, contact, social)
3. 🟠 Create/customize homepage (pages CMS)
4. 🟠 Configure hero carousel slides
5. 🟠 Review and approve imported content
6. 🟠 Upload production images (replace placeholders)

### Phase 5: Verification & Testing ⚠️
1. ⚠️ Test all API endpoints respond correctly
2. ⚠️ Verify mock data is NOT being used
3. ⚠️ Test user registration and login flows
4. ⚠️ Verify dashboard loads with real data
5. ⚠️ Test file uploads work correctly
6. ⚠️ Check all forms submit successfully
7. ⚠️ Verify email notifications send
8. ⚠️ Test responsive design on mobile devices

---

## Mock Data Removal Strategy

### ⚠️ DO NOT DELETE MOCK DATA FILES

**Rationale:**
1. Useful for development and testing
2. Serve as documentation of expected data structure
3. Fallback mechanism if API is unavailable
4. Reference for creating new content

### Recommended Approach:
1. Keep all `/src/data/*.json` files in repository
2. Use environment variable to control usage
3. Add clear comments in code about mock vs. production
4. Document in README that mock data is for development only
5. Ensure `VITE_USE_MOCK_DATA=false` in production

---

## Image Placeholder Replacement

### Current State:
All mock data uses `/api/placeholder/*` URLs for images:
- Blog featured images
- Author avatars
- Portfolio images
- Testimonial avatars
- User profile avatars

### Production Strategy:
1. **Option A:** Upload real images via admin panel media library
2. **Option B:** Use Hostinger file manager to upload in bulk
3. **Option C:** Use CDN (Cloudflare, Cloudinary) for image hosting

### Required Actions:
1. 📋 Create image asset inventory list
2. 🎨 Prepare production-quality images
3. 📤 Upload images to hosting/CDN
4. 🔗 Update database records with real URLs
5. ✅ Verify all images load correctly

---

## API Utility Switch Mechanism

### Current Implementation:
**File:** `/src/utils/api.ts`

```typescript
// Line 24-25
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
```

### How It Works:
1. If `VITE_USE_MOCK_DATA` is undefined or `'true'` → uses mock JSON files
2. If `VITE_USE_MOCK_DATA` is `'false'` → uses live API endpoints
3. All fetch functions check `USE_MOCK_DATA` and route accordingly
4. Fallback to mock data if API call fails

### Production Configuration:
```bash
# .env (root directory)
VITE_API_BASE_URL=https://adilgfx.com/backend
VITE_USE_MOCK_DATA=false
```

---

## Testing Checklist

### Mock Data Verification:
- [ ] All JSON files are valid JSON format
- [ ] All required fields are present in mock data
- [ ] Data structures match TypeScript interfaces in api.ts
- [ ] Placeholder URLs are consistent

### API Integration Verification:
- [ ] All API endpoints return data matching mock structure
- [ ] Pagination works correctly
- [ ] Filtering and search work correctly
- [ ] Error handling returns appropriate fallbacks
- [ ] Authentication headers are sent correctly

### Database Migration Verification:
- [ ] All mock data imported successfully
- [ ] No data loss during migration
- [ ] Foreign key relationships maintained
- [ ] JSON fields properly encoded/decoded
- [ ] Date formats consistent

---

## Known Issues & Limitations

### 1. Placeholder URLs
- **Issue:** All images use `/api/placeholder/*` URLs
- **Impact:** Images won't display in production
- **Fix:** Replace with real CDN URLs or hosted images

### 2. Hardcoded Mock Data in api.ts
- **Issue:** Settings, pages, carousel data hardcoded in api.ts
- **Impact:** Requires admin to manually recreate via CMS
- **Fix:** Create migration script or default data script

### 3. Notifications Not Migrated
- **Issue:** No migration script for notifications data
- **Impact:** Users won't have notifications after import
- **Fix:** Create notification migration in install_database.php

### 4. Token History Not Seeded
- **Issue:** Token history only created on registration
- **Impact:** Existing users won't have historical data
- **Fix:** Acceptable - data accumulates over time

---

## Recommendations

### Short Term (Pre-Launch):
1. ✅ Complete database schema creation
2. ✅ Run migration script to import all mock data
3. ✅ Set `VITE_USE_MOCK_DATA=false` in production
4. ⚠️ Test all API endpoints return correct data
5. ⚠️ Replace placeholder images with production assets

### Medium Term (Post-Launch):
1. 📊 Monitor API performance and caching effectiveness
2. 🔄 Create data backup procedures
3. 📈 Track which content gets most engagement
4. 🎨 Gradually replace all placeholder content
5. 📝 Document content management workflows

### Long Term (Ongoing):
1. 🔧 Maintain mock data in sync with production schema changes
2. 📚 Use mock data for automated testing
3. 🚀 Create staging environment with copy of production data
4. 🔄 Regular content audits and updates
5. 📊 Analytics-driven content optimization

---

## Conclusion

The mock data infrastructure is **well-structured and ready for migration**. The hybrid architecture (mock vs. live API) provides excellent flexibility for development and testing.

**Current Status:** 🟡 **MOSTLY READY**

**Blockers:**
- Missing database schema file
- Notification data migration script incomplete
- Production environment variables not configured

**Estimated Time to Complete Migration:** 2-4 hours

**Next Steps:**
1. Review this inventory
2. Create missing database schema
3. Run migration scripts
4. Configure production environment
5. Test API integration
6. Replace placeholder images

---

**Document Version:** 1.0
**Last Updated:** October 1, 2025
**Status:** Ready for Review
