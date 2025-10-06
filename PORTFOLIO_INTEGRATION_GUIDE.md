# Portfolio Module - Integration Guide

Quick reference for integrating the Portfolio Management Module into the admin dashboard.

---

## 📦 What Was Delivered

### Files Created
```
src/admin/hooks/usePortfolio.ts
src/admin/pages/Portfolio/
├── index.ts
├── PortfolioGrid.tsx
├── PortfolioForm.tsx
└── PortfolioModal.tsx
```

### Files Modified
```
src/admin/utils/api.ts (added Portfolio types & API endpoints)
src/admin/utils/validation.ts (added portfolioSchema)
```

---

## 🔌 Integration Steps

### Step 1: Import the Module

In your admin dashboard router or main admin component:

```typescript
import { PortfolioGrid } from '@/admin/pages/Portfolio';
```

### Step 2: Add Route

Add to your admin routes:

```typescript
<Route path="/admin/portfolio" element={<PortfolioGrid />} />
```

### Step 3: Add Navigation Menu Item

Add to your admin navigation menu:

```typescript
{
  title: 'Portfolio',
  path: '/admin/portfolio',
  icon: FolderIcon, // or any appropriate icon from lucide-react
}
```

---

## 🔧 Backend Requirements

The module expects these PHP endpoints to be available:

### Required Endpoints

1. **GET /api/portfolio.php**
   - Returns: Array of portfolio items
   - Auth: Required (Bearer token)

2. **GET /api/portfolio.php/{id}**
   - Returns: Single portfolio item
   - Auth: Required

3. **POST /api/portfolio.php**
   - Body: PortfolioFormData (JSON)
   - Returns: { id: number }
   - Auth: Required

4. **PUT /api/portfolio.php/{id}**
   - Body: PortfolioFormData (JSON)
   - Returns: Success response
   - Auth: Required

5. **DELETE /api/portfolio.php/{id}**
   - Returns: Success response
   - Auth: Required

6. **POST /api/uploads.php** (already exists)
   - Body: FormData with 'file' field
   - Returns: { url: string }
   - Auth: Required

### Expected Data Structure

```typescript
interface Portfolio {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription?: string;
  client?: string;
  completionDate?: string;
  featuredImage: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  tags: string[];
  technologies?: string[];
  projectUrl?: string;
  results?: {
    metric1?: string;
    metric2?: string;
    metric3?: string;
  };
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
  views: number;
  created_at?: string;
  updated_at?: string;
}
```

---

## 🗄️ Database Schema Suggestion

```sql
CREATE TABLE portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  client VARCHAR(100),
  completion_date DATE,
  featured_image VARCHAR(500) NOT NULL,
  images JSON NOT NULL,
  before_image VARCHAR(500),
  after_image VARCHAR(500),
  tags JSON NOT NULL,
  technologies JSON,
  project_url VARCHAR(500),
  results JSON,
  featured BOOLEAN DEFAULT 0,
  status ENUM('active', 'draft', 'archived') DEFAULT 'active',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_featured (featured)
);
```

---

## 🎯 Usage Example

Once integrated, users can:

1. **View All Projects**
   - Navigate to /admin/portfolio
   - See grid of all portfolio items
   - Filter by status, category (future enhancement)

2. **Create New Project**
   - Click "Add Project" button
   - Fill in all required fields
   - Upload images or add URLs
   - Add tags and technologies
   - Set featured and status
   - Submit

3. **Edit Existing Project**
   - Click "Edit" on any project card
   - Modify fields
   - Submit changes

4. **Delete Project**
   - Click delete button
   - Confirm deletion in dialog

---

## ✅ Pre-Integration Checklist

- [ ] Backend `/api/portfolio.php` endpoint created
- [ ] Database table created
- [ ] PHP authentication middleware configured
- [ ] Image upload path `/api/uploads.php` working
- [ ] Admin navigation menu has Portfolio item
- [ ] Route added to admin router
- [ ] Permissions configured (if applicable)

---

## 🧪 Testing Checklist

After integration:

- [ ] Portfolio grid loads without errors
- [ ] Create form opens and submits successfully
- [ ] Edit form pre-populates data correctly
- [ ] Delete confirmation works
- [ ] Image upload functions properly
- [ ] Tags and technologies can be added/removed
- [ ] Form validation shows appropriate errors
- [ ] Toast notifications appear for all actions
- [ ] Responsive design works on mobile/tablet/desktop

---

## 🐛 Troubleshooting

### Issue: "404 Not Found" when accessing /api/portfolio.php
**Solution:** Ensure backend endpoint is created and .htaccess routes are configured

### Issue: "Unauthorized" errors
**Solution:** Check authentication token in localStorage and verify backend auth middleware

### Issue: Images not uploading
**Solution:** Verify `/api/uploads.php` exists and has write permissions to upload directory

### Issue: Form validation not working
**Solution:** Check browser console for Zod validation errors and verify all required fields

---

## 📞 Support

For issues or questions:
1. Check `PHASE4_2_1_PORTFOLIO_COMPLETE.md` for implementation details
2. Check `PHASE4_2_1_TEST_REPORT.md` for test results
3. Review existing Blog/Services modules for similar patterns
4. Check browser console for error messages

---

**Integration Time Estimate:** 15-30 minutes
**Backend Implementation Time Estimate:** 2-4 hours

Ready for integration!
