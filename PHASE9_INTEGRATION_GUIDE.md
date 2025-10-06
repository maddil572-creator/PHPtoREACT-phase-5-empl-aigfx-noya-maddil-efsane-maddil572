# Phase 9: User Portal Integration Guide

## Quick Start

### Access User Portal
```
http://localhost:5173/user/login
http://localhost:5173/user/register
http://localhost:5173/user/dashboard
http://localhost:5173/user/profile
http://localhost:5173/user/tokens
```

### Backend Requirements
Ensure these PHP endpoints are accessible:

1. **Authentication**
   - `POST /api/auth.php/login` - User login
   - `POST /api/auth.php/register` - User registration
   - `GET /api/auth.php/verify` - Token verification

2. **User Profile**
   - `GET /api/user/profile.php` - Fetch user data
   - `PUT /api/user/profile.php` - Update profile
   - `PUT /api/user/profile.php/password` - Change password

3. **Gamification**
   - `POST /api/user/streak.php` - Daily check-in

### Environment Variables
Add to `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         React Application               │
│  ┌────────────┐      ┌──────────────┐  │
│  │   Public   │      │    Admin     │  │
│  │   Portal   │      │    Panel     │  │
│  └────────────┘      └──────────────┘  │
│         │                    │          │
│         └────────┬───────────┘          │
│                  │                      │
│         ┌────────▼───────┐              │
│         │  User Portal   │              │
│         │  (Phase 9)     │              │
│         └────────┬───────┘              │
│                  │                      │
│         ┌────────▼───────┐              │
│         │  AuthContext   │              │
│         └────────┬───────┘              │
└──────────────────┼─────────────────────┘
                   │
                   │ JWT Token Auth
                   ▼
         ┌─────────────────┐
         │   PHP Backend   │
         │  (MySQL + APIs) │
         └─────────────────┘
```

## Key Integration Points

### 1. Shared Authentication Context
Both admin and user portals use the same `AuthContext`:
```typescript
// src/contexts/AuthContext.tsx
export function useAuth() {
  const { user, token, login, logout } = useContext(AuthContext);
  // Available in ALL components
}
```

### 2. Route Structure
```
/                   → Public homepage
/user/login         → User authentication
/user/dashboard     → User portal
/dashboard          → Admin panel (separate)
/auth               → Admin authentication (separate)
```

### 3. API Integration
```typescript
// All requests include JWT token
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Usage Examples

### User Registration Flow
```typescript
// 1. User fills registration form
// 2. Submit to /api/auth.php/register
// 3. Success → redirect to /user/login
// 4. User logs in
// 5. JWT token stored in localStorage
// 6. AuthContext updates
// 7. User redirected to /user/dashboard
```

### Daily Check-in Flow
```typescript
// 1. User opens dashboard
// 2. StreakCard checks if eligible
// 3. User clicks "Check In"
// 4. POST to /api/user/streak.php
// 5. Backend calculates reward
// 6. Token balance updated
// 7. React Query invalidates cache
// 8. Dashboard reflects new balance
```

### Profile Update Flow
```typescript
// 1. User edits name/avatar on /user/profile
// 2. Form validates with Zod
// 3. PUT to /api/user/profile.php
// 4. React Query optimistic update
// 5. UI updates immediately
// 6. On success: cache invalidated
// 7. On error: rollback + toast
```

## Data Flow

### Authentication
```
Login Page → authService.login()
  → POST /api/auth.php/login
  → Receive { token, user }
  → AuthContext.login(token, user)
  → localStorage.setItem('auth_token', token)
  → Navigate to /user/dashboard
```

### Profile Loading
```
Dashboard Mount → useUserProfile()
  → React Query fetch
  → GET /api/user/profile.php
  → Returns full UserProfile
  → Cache for 5 minutes
  → Render dashboard components
```

## State Management

### Global State (AuthContext)
- `user` - Current user object
- `token` - JWT authentication token
- `isAuthenticated` - Boolean flag
- `isLoading` - Initial auth check status
- `login()` - Set authenticated state
- `logout()` - Clear authenticated state

### Server State (React Query)
- `userProfile` - Full profile data (cached 5 min)
- `mutations` - Update profile, change password, check-in
- Automatic refetch on mutations
- Optimistic updates for better UX

### Local State
- Form values (React Hook Form)
- UI toggles (password form visibility)
- Copy confirmation states

## Security

### Token Storage
- JWT stored in `localStorage` with key `auth_token`
- Automatically included in all authenticated requests
- Cleared on logout or token expiry

### Protected Routes
```typescript
// All user portal routes check authentication
if (!isAuthenticated) {
  navigate('/user/login');
  return null;
}
```

### Input Validation
- Client-side: Zod schemas
- Server-side: PHP validation (existing)
- Password min 8 characters
- Email format validation
- URL validation for avatars

## Testing User Portal

### Manual Test Checklist
1. ✅ Register new account
2. ✅ Login with credentials
3. ✅ View dashboard (profile loads)
4. ✅ Check token balance displays
5. ✅ Perform daily check-in
6. ✅ Copy referral link
7. ✅ Navigate to profile page
8. ✅ Update name/avatar
9. ✅ Change password
10. ✅ Logout (redirects to login)

### Backend API Test
```bash
# Test login
curl -X POST http://localhost:8000/api/auth.php/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test profile fetch (requires token)
curl http://localhost:8000/api/user/profile.php \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Issue: "Unauthorized" error
- Check token in localStorage
- Verify token format: `Bearer <token>`
- Confirm backend `/api/auth.php/verify` works

### Issue: Dashboard not loading
- Check React Query DevTools
- Verify API endpoint `/api/user/profile.php` returns data
- Check console for CORS errors

### Issue: Check-in button disabled
- User already checked in today
- Check `streak.lastCheckIn` date
- Backend logic prevents duplicate check-ins

### Issue: Profile update fails
- Check form validation errors
- Verify JWT token is valid
- Confirm backend accepts PUT requests

## Next Steps

### Optional Enhancements
1. Email verification system
2. Password reset flow
3. Real-time notifications
4. Token purchase with Stripe
5. Leaderboard page
6. Social login (Google/GitHub)
7. Two-factor authentication

### Performance Optimization
1. Implement code splitting
2. Lazy load user portal routes
3. Image optimization for avatars
4. Bundle size reduction

---

**Status**: ✅ Ready for integration testing
**Documentation**: See PHASE9_USER_PORTAL_COMPLETE.md
**Test Report**: See PHASE9_TEST_REPORT.md
