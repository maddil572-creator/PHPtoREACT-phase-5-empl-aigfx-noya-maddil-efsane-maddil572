# Smoke Test Suite
**Project:** Adil GFX Platform
**Test Type:** Manual Smoke Tests
**Purpose:** Quick validation of critical functionality before deployment
**Execution Time:** ~15-20 minutes

---

## Prerequisites

Before running these tests, ensure:
- [ ] Backend deployed to server
- [ ] Database schema imported
- [ ] Environment variables configured
- [ ] Frontend built and deployed
- [ ] HTTPS enabled (for production)

---

## Test Environment Information

**Backend URL:** `https://adilgfx.com/backend`
**Frontend URL:** `https://adilgfx.com`
**Test Date:** _______________
**Tester Name:** _______________
**Environment:** [ ] Development [ ] Staging [ ] Production

---

## 1. API Connectivity Tests

### 1.1 Health Check
**Endpoint:** `GET /backend/api/settings`
**Expected:** 200 OK with settings JSON

```bash
curl -X GET "https://adilgfx.com/backend/api/settings"
```

**Expected Response:**
```json
{
  "branding": { ... },
  "contact": { ... },
  "social": { ... },
  "features": { ... }
}
```

**Result:** [ ] PASS [ ] FAIL
**Notes:** _______________

---

### 1.2 CORS Headers
**Endpoint:** `OPTIONS /backend/api/blogs`
**Expected:** Proper CORS headers returned

```bash
curl -X OPTIONS "https://adilgfx.com/backend/api/blogs" \
  -H "Origin: https://adilgfx.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

**Check for Headers:**
- `Access-Control-Allow-Origin: https://adilgfx.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token`

**Result:** [ ] PASS [ ] FAIL
**Notes:** _______________

---

## 2. Authentication Tests

### 2.1 User Registration
**Endpoint:** `POST /backend/api/auth/register`

```bash
curl -X POST "https://adilgfx.com/backend/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "message": "Account created successfully",
  "user_id": <number>
}
```

**Result:** [ ] PASS [ ] FAIL
**User ID Created:** _______________
**Notes:** _______________

---

### 2.2 User Login
**Endpoint:** `POST /backend/api/auth/login`

```bash
curl -X POST "https://adilgfx.com/backend/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<email from 2.1>",
    "password": "TestPassword123!"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "<jwt_token>",
  "user": { ... }
}
```

**Result:** [ ] PASS [ ] FAIL
**Token Received:** [ ] YES [ ] NO
**Save Token for Next Tests:** _______________
**Notes:** _______________

---

### 2.3 Token Verification
**Endpoint:** `GET /backend/api/auth/verify`

```bash
curl -X GET "https://adilgfx.com/backend/api/auth/verify" \
  -H "Authorization: Bearer <token from 2.2>"
```

**Expected Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

**Result:** [ ] PASS [ ] FAIL
**Notes:** _______________

---

### 2.4 Admin Login
**Endpoint:** `POST /backend/api/auth/login`

```bash
curl -X POST "https://adilgfx.com/backend/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@adilgfx.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "<admin_jwt_token>",
  "user": {
    "role": "admin",
    ...
  }
}
```

**Result:** [ ] PASS [ ] FAIL
**Admin Token:** _______________
**Notes:** _______________

---

## 3. Content Retrieval Tests

### 3.1 Get Blogs
**Endpoint:** `GET /backend/api/blogs`

```bash
curl -X GET "https://adilgfx.com/backend/api/blogs?page=1&limit=10"
```

**Expected Response:**
```json
{
  "data": [ ... ],
  "page": 1,
  "totalPages": <number>,
  "totalItems": <number>
}
```

**Result:** [ ] PASS [ ] FAIL
**Number of Blogs Returned:** _______________
**Notes:** _______________

---

### 3.2 Get Single Blog
**Endpoint:** `GET /backend/api/blogs/{id}`

```bash
curl -X GET "https://adilgfx.com/backend/api/blogs/1"
```

**Expected Response:**
```json
{
  "id": 1,
  "title": "...",
  "content": "...",
  ...
}
```

**Result:** [ ] PASS [ ] FAIL
**Notes:** _______________

---

### 3.3 Get Portfolio
**Endpoint:** `GET /backend/api/portfolio`

```bash
curl -X GET "https://adilgfx.com/backend/api/portfolio"
```

**Expected:** Portfolio items with pagination

**Result:** [ ] PASS [ ] FAIL
**Number of Items:** _______________

---

### 3.4 Get Services
**Endpoint:** `GET /backend/api/services`

```bash
curl -X GET "https://adilgfx.com/backend/api/services"
```

**Expected:** Array of service objects

**Result:** [ ] PASS [ ] FAIL
**Number of Services:** _______________

---

### 3.5 Get Testimonials
**Endpoint:** `GET /backend/api/testimonials`

```bash
curl -X GET "https://adilgfx.com/backend/api/testimonials"
```

**Expected:** Array of testimonial objects

**Result:** [ ] PASS [ ] FAIL
**Number of Testimonials:** _______________

---

## 4. User Profile Tests

### 4.1 Get User Dashboard Data
**Endpoint:** `GET /backend/api/user/profile`

```bash
curl -X GET "https://adilgfx.com/backend/api/user/profile" \
  -H "Authorization: Bearer <token from 2.2>"
```

**Expected Response:**
```json
{
  "user": { ... },
  "tokens": { "balance": 100, ... },
  "streak": { ... },
  "referrals": { ... },
  "orders": [],
  "achievements": [],
  "preferences": { ... }
}
```

**Result:** [ ] PASS [ ] FAIL
**Token Balance:** _______________
**Current Streak:** _______________
**Notes:** _______________

---

## 5. Form Submission Tests

### 5.1 Contact Form
**Endpoint:** `POST /backend/api/contact`

```bash
curl -X POST "https://adilgfx.com/backend/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "Logo Design",
    "message": "This is a test message",
    "budget": "$500-$1000"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thank you for your message..."
}
```

**Result:** [ ] PASS [ ] FAIL
**Email Received:** [ ] YES [ ] NO [ ] N/A
**Notes:** _______________

---

### 5.2 Newsletter Subscription
**Endpoint:** `POST /backend/api/newsletter/subscribe`

```bash
curl -X POST "https://adilgfx.com/backend/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsletter_'$(date +%s)'@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to our newsletter!"
}
```

**Result:** [ ] PASS [ ] FAIL
**Notes:** _______________

---

## 6. Admin Functionality Tests

### 6.1 Create Blog Post (Admin Only)
**Endpoint:** `POST /backend/api/blogs`

```bash
curl -X POST "https://adilgfx.com/backend/api/blogs" \
  -H "Authorization: Bearer <admin token from 2.4>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Blog Post",
    "excerpt": "This is a test",
    "content": "This is the full content of the test blog post.",
    "category": "Test",
    "featured_image": "/api/placeholder/800/400",
    "tags": ["test"],
    "featured": false
  }'
```

**Expected Response:**
```json
{
  "message": "Blog created successfully",
  "id": <number>
}
```

**Result:** [ ] PASS [ ] FAIL
**Blog ID Created:** _______________
**Notes:** _______________

---

### 6.2 Update Blog Post (Admin Only)
**Endpoint:** `PUT /backend/api/blogs/{id}`

```bash
curl -X PUT "https://adilgfx.com/backend/api/blogs/<id from 6.1>" \
  -H "Authorization: Bearer <admin token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Blog Post"
  }'
```

**Expected Response:**
```json
{
  "message": "Blog updated successfully"
}
```

**Result:** [ ] PASS [ ] FAIL

---

### 6.3 Delete Blog Post (Admin Only)
**Endpoint:** `DELETE /backend/api/blogs/{id}`

```bash
curl -X DELETE "https://adilgfx.com/backend/api/blogs/<id from 6.1>" \
  -H "Authorization: Bearer <admin token>"
```

**Expected Response:**
```json
{
  "message": "Blog deleted successfully"
}
```

**Result:** [ ] PASS [ ] FAIL

---

### 6.4 Admin Stats (Admin Only)
**Endpoint:** `GET /backend/api/admin/stats`

```bash
curl -X GET "https://adilgfx.com/backend/api/admin/stats" \
  -H "Authorization: Bearer <admin token>"
```

**Expected:** Dashboard statistics JSON

**Result:** [ ] PASS [ ] FAIL

---

## 7. File Upload Tests

### 7.1 Upload Image (Authenticated)
**Endpoint:** `POST /backend/api/uploads`

```bash
# Create test image first
convert -size 100x100 xc:blue test_image.jpg

curl -X POST "https://adilgfx.com/backend/api/uploads" \
  -H "Authorization: Bearer <token from 2.2>" \
  -F "file=@test_image.jpg" \
  -F "altText=Test image" \
  -F "caption=Smoke test upload"
```

**Expected Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": <number>,
    "filename": "...",
    "url": "...",
    "originalName": "test_image.jpg"
  }
}
```

**Result:** [ ] PASS [ ] FAIL
**File ID:** _______________
**File Accessible:** [ ] YES [ ] NO
**Notes:** _______________

---

## 8. Security Tests

### 8.1 Unauthorized Access
**Test:** Try to access admin endpoint without token

```bash
curl -X GET "https://adilgfx.com/backend/api/admin/stats"
```

**Expected:** 401 Unauthorized

**Result:** [ ] PASS [ ] FAIL

---

### 8.2 Invalid Token
**Test:** Use invalid JWT token

```bash
curl -X GET "https://adilgfx.com/backend/api/user/profile" \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected:** 401 Unauthorized

**Result:** [ ] PASS [ ] FAIL

---

### 8.3 Rate Limiting
**Test:** Exceed rate limit (run same request 110 times)

```bash
for i in {1..110}; do
  curl -X GET "https://adilgfx.com/backend/api/blogs" -w "\n"
done
```

**Expected:** 429 Too Many Requests after ~100 requests

**Result:** [ ] PASS [ ] FAIL
**Rate Limit Triggered After:** _____ requests

---

### 8.4 SQL Injection Attempt
**Test:** Try SQL injection in search parameter

```bash
curl -X GET "https://adilgfx.com/backend/api/blogs?search=' OR '1'='1"
```

**Expected:** Normal search results or no results (NOT database error)

**Result:** [ ] PASS [ ] FAIL

---

### 8.5 XSS Attempt in Form
**Test:** Submit XSS payload in contact form

```bash
curl -X POST "https://adilgfx.com/backend/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(1)</script>",
    "email": "test@example.com",
    "service": "Test",
    "message": "Test"
  }'
```

**Expected:** Form submission succeeds but script is escaped/sanitized

**Result:** [ ] PASS [ ] FAIL

---

## 9. Frontend Integration Tests

### 9.1 Homepage Loads
**Action:** Visit https://adilgfx.com

**Checks:**
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Services section displays
- [ ] Portfolio section displays
- [ ] Testimonials section displays
- [ ] Footer displays with correct info

**Result:** [ ] PASS [ ] FAIL
**Load Time:** _____ seconds
**Notes:** _______________

---

### 9.2 Blog Page
**Action:** Visit https://adilgfx.com/blog

**Checks:**
- [ ] Blog list displays
- [ ] Pagination works
- [ ] Search functionality works
- [ ] Individual blog posts load

**Result:** [ ] PASS [ ] FAIL

---

### 9.3 Portfolio Page
**Action:** Visit https://adilgfx.com/portfolio

**Checks:**
- [ ] Portfolio items display
- [ ] Category filtering works
- [ ] Before/after images display
- [ ] Modal preview works

**Result:** [ ] PASS [ ] FAIL

---

### 9.4 Contact Form
**Action:** Fill and submit contact form on /contact

**Checks:**
- [ ] Form validation works
- [ ] Form submits successfully
- [ ] Success message displays
- [ ] Email notification received (if configured)

**Result:** [ ] PASS [ ] FAIL
**Email Received:** [ ] YES [ ] NO

---

### 9.5 User Registration Flow
**Action:** Register new user via /auth

**Checks:**
- [ ] Registration form validates input
- [ ] Account creates successfully
- [ ] Auto-login after registration
- [ ] Dashboard displays correctly

**Result:** [ ] PASS [ ] FAIL

---

### 9.6 User Dashboard
**Action:** Login and visit dashboard

**Checks:**
- [ ] Token balance displays
- [ ] Login streak displays
- [ ] Referral code displays
- [ ] Orders section displays (even if empty)
- [ ] Achievements display

**Result:** [ ] PASS [ ] FAIL

---

## 10. Performance Tests

### 10.1 API Response Times
**Action:** Measure response times for key endpoints

| Endpoint | Response Time | Status |
|----------|---------------|--------|
| GET /api/blogs | _____ ms | [ ] < 500ms |
| GET /api/portfolio | _____ ms | [ ] < 500ms |
| GET /api/services | _____ ms | [ ] < 500ms |
| POST /api/auth/login | _____ ms | [ ] < 1000ms |
| GET /api/user/profile | _____ ms | [ ] < 1000ms |

**Overall:** [ ] PASS [ ] FAIL

---

### 10.2 Page Load Times
**Action:** Measure frontend page load times

| Page | Load Time | Status |
|------|-----------|--------|
| Homepage | _____ s | [ ] < 3s |
| Blog List | _____ s | [ ] < 3s |
| Portfolio | _____ s | [ ] < 3s |
| Dashboard | _____ s | [ ] < 4s |

**Tool Used:** [ ] Chrome DevTools [ ] GTmetrix [ ] Other: _______

**Overall:** [ ] PASS [ ] FAIL

---

## Test Summary

**Total Tests:** 40
**Passed:** _____
**Failed:** _____
**Skipped:** _____
**Pass Rate:** _____%

### Critical Failures (if any):
1. _______________
2. _______________
3. _______________

### Non-Critical Issues:
1. _______________
2. _______________
3. _______________

### Recommendations:
1. _______________
2. _______________
3. _______________

---

## Sign-Off

**Tested By:** _______________
**Date:** _______________
**Environment:** _______________
**Deployment Approved:** [ ] YES [ ] NO [ ] WITH CONDITIONS

**Conditions (if any):**
_______________________________________________
_______________________________________________

**Approver Signature:** _______________
**Date:** _______________

---

## Next Steps

- [ ] Address all critical failures
- [ ] Fix non-critical issues
- [ ] Re-run failed tests
- [ ] Update documentation
- [ ] Proceed to production deployment

---

**Document Version:** 1.0
**Last Updated:** October 1, 2025
