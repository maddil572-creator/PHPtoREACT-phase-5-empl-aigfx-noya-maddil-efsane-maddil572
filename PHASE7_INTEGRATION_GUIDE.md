# Phase 7: Analytics Module - Integration Guide

## Quick Start

The Analytics & Reports module is complete and ready to integrate into your admin panel.

## Step 1: Import the Component

Add the import to your admin routing file:

```tsx
import { AnalyticsOverview } from '@/admin/pages/Analytics';
```

## Step 2: Add the Route

Add this route to your admin router:

```tsx
<Route path="/admin/analytics" element={<AnalyticsOverview />} />
```

## Step 3: Add Navigation Link

Add a link to your admin navigation menu:

```tsx
<NavLink to="/admin/analytics">
  <BarChart3 className="h-5 w-5 mr-2" />
  Analytics & Reports
</NavLink>
```

## Complete Example

```tsx
import { Routes, Route } from 'react-router-dom';
import { AnalyticsOverview } from '@/admin/pages/Analytics';
import { BlogList } from '@/admin/pages/Blogs';
import { ServiceList } from '@/admin/pages/Services';
// ... other imports

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/analytics" element={<AnalyticsOverview />} />
      <Route path="/admin/blogs" element={<BlogList />} />
      <Route path="/admin/services" element={<ServiceList />} />
      {/* ... other routes */}
    </Routes>
  );
}
```

## Backend Requirements

Ensure these API endpoints are accessible:

1. **GET /api/admin/stats.php**
   - Returns dashboard statistics
   - Requires admin authentication token

2. **GET /api/admin/activity.php?limit=10**
   - Returns recent activity feed
   - Requires admin authentication token

## Expected API Response Format

### /api/admin/stats.php
```json
{
  "totalUsers": 150,
  "totalBlogs": 45,
  "totalContacts": 89,
  "totalTokens": 5000,
  "newUsersMonth": 12,
  "popularBlogs": [
    {
      "title": "Blog Post Title",
      "views": 1234,
      "likes": 56
    }
  ],
  "recentContacts": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "service": "Web Design",
      "created_at": "2025-10-06 12:30:00"
    }
  ],
  "userGrowth": [
    {
      "date": "2025-10-01",
      "count": 5
    }
  ]
}
```

### /api/admin/activity.php
```json
[
  {
    "id": "unique-id-1",
    "description": "John Doe registered",
    "time": "2 hours ago",
    "icon": "fas fa-user-plus"
  },
  {
    "id": "unique-id-2",
    "description": "Jane Smith submitted contact form for Web Design",
    "time": "5 hours ago",
    "icon": "fas fa-envelope"
  }
]
```

## Features Available

Once integrated, users will have access to:

✅ **Dashboard Statistics**
- Total users with monthly growth
- Published blog count
- Contact form submissions
- Total platform tokens

✅ **Data Visualizations**
- User growth line chart (30-day trend)
- Popular blogs bar chart (views vs likes)

✅ **Activity Feed**
- Real-time activity timeline
- User registrations
- Contact submissions
- Blog performance

✅ **Auto-refresh**
- Optional 30-second auto-refresh
- Manual refresh button
- Toast notifications

✅ **Recent Contacts**
- Latest 5 contact submissions
- Name, email, service, date

✅ **Performance Summary**
- User growth metrics
- Content activity stats
- Token economy overview

## Configuration Options

### Auto-refresh Interval
Default: 30 seconds (when enabled)
Can be modified in `useAnalyticsStats` and `useActivityFeed` hooks.

### Activity Feed Limit
Default: 10 items
Can be changed by passing a different limit parameter:
```tsx
const { data: activities } = useActivityFeed(20); // Show 20 items
```

### Cache Configuration
- Stats cache: 60 seconds (staleTime)
- Activity cache: 30 seconds (staleTime)

## Troubleshooting

### Issue: Data not loading
**Solution:** Verify admin authentication token in localStorage and API endpoint accessibility.

### Issue: Charts not rendering
**Solution:** Ensure `recharts` and `date-fns` are installed:
```bash
npm install recharts date-fns
```

### Issue: Empty activity feed
**Solution:** Check backend API returns array format and has recent activities in database.

### Issue: Build warnings about bundle size
**Solution:** Implement code splitting for production:
```tsx
import { lazy } from 'react';
const AnalyticsOverview = lazy(() => import('@/admin/pages/Analytics'));
```

## Testing Checklist

Before deploying to production:

- [ ] Analytics page loads without errors
- [ ] All 4 stat cards display data correctly
- [ ] User growth chart renders with data
- [ ] Popular blogs chart shows top posts
- [ ] Activity feed displays recent activities
- [ ] Auto-refresh toggle works
- [ ] Manual refresh button updates data
- [ ] Recent contacts section shows submissions
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Dark mode displays correctly
- [ ] Error states show properly
- [ ] Loading skeletons appear during data fetch
- [ ] Toast notifications work for all actions

## Performance Considerations

- **Initial Load:** ~7.3s build time, 236KB gzipped
- **API Calls:** Cached for 30-60 seconds
- **Auto-refresh:** 30-second intervals (when enabled)
- **Chart Rendering:** Optimized with Recharts

## Security Notes

- All API calls require admin authentication token
- Token stored in localStorage as `admin_token`
- Unauthorized requests redirect to login
- Backend validates admin role before returning data

## Support

For issues or questions:
1. Check console for error messages
2. Verify API endpoints return correct data format
3. Ensure admin authentication is working
4. Review browser network tab for failed requests

---

**Phase 7: Analytics & Reports Module**
**Status:** ✅ Ready for Integration
**Build:** ✅ Clean (0 TypeScript errors)
**Documentation:** ✅ Complete
