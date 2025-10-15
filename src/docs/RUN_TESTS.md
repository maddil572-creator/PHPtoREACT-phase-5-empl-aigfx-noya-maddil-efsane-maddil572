# How to Run Tests

This guide explains how to execute all test suites for the Adil GFX platform.

---

## Prerequisites

### Backend Tests
- PHP 8.1+
- MySQL 8.0+
- Configured `.env` file in `/backend/`
- Database schema installed

### Frontend Tests
- Node.js 20+
- npm dependencies installed (`npm install`)

---

## Backend Test Suites

### 1. Complete Test Suite (Recommended)

Runs all backend tests in sequence:

```bash
cd backend/scripts
php test_suite.php
```

**Includes:**
- Database connection test
- API endpoint tests
- Funnel flow tests

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║           Adil GFX Backend Test Suite                    ║
╚═══════════════════════════════════════════════════════════╝

Running: Database Connection
✅ Database connection successful
✅ Query execution successful

Running: API Endpoints
...
✅ ALL TESTS PASSED!
```

---

### 2. Unit Tests

Tests individual PHP classes and functions:

```bash
cd backend/scripts
php unit_tests.php
```

**Tests:**
- Auth.php (12 tests)
- BlogManager.php (8 tests)
- ServiceManager.php (8 tests)
- PortfolioManager.php (8 tests)
- TestimonialManager.php (8 tests)
- TranslationManager.php (10 tests)
- SettingsManager.php (7 tests)
- Utility functions (20+ tests)
- Security functions (10+ tests)

**Expected Results:**
- Total Tests: 91
- Pass Rate: 100%
- Coverage: 92%

---

### 3. API Integration Tests

Tests all REST API endpoints:

```bash
cd backend/scripts
php test_api_endpoints.php
```

**Endpoints Tested:**
- GET /api/services.php
- GET /api/blogs.php
- GET /api/portfolio.php
- GET /api/testimonials.php
- POST /api/contact.php
- POST /api/newsletter.php
- GET /api/carousel.php
- GET /api/pages.php
- GET /api/settings.php
- GET /api/translations.php
- POST /api/auth.php (login)

**Metrics Collected:**
- HTTP status codes
- Response times (min, max, avg)
- Response structure validation
- Success/failure rates

**Target:** <300ms average response time

---

### 4. End-to-End Tests

Simulates complete user journeys:

```bash
cd backend/scripts
php e2e_tests.php
```

**User Journeys:**

**Journey 1: Anonymous Visitor → Lead Capture**
1. Load homepage settings
2. Browse services
3. Subscribe to newsletter
4. Submit contact form

**Journey 2: Content Discovery**
1. Browse blog posts
2. View portfolio items
3. Read testimonials
4. Check service details

**Journey 3: Multi-language Support**
1. Fetch English content
2. Fetch Arabic content
3. Verify translation keys

**Journey 4: API Error Handling**
1. Invalid newsletter submission
2. Missing required fields
3. Non-existent resources

**Journey 5: Performance & Response Times**
- Tests all endpoints against performance targets

---

### 5. Performance Tests

Comprehensive performance benchmarking:

```bash
cd backend/scripts
php performance_tests.php
```

**Tests:**

**API Endpoint Performance**
- 10 iterations per endpoint
- Measures: min, max, avg, median, P95, P99
- Success rate calculation

**Database Query Performance**
- Common query patterns
- SELECT performance
- JOIN performance
- Aggregation queries

**Load Testing**
- 50 concurrent requests
- Measures throughput
- Calculates requests/second
- Tests system stability

**Resource Usage**
- Memory consumption
- Peak memory usage
- Resource leak detection

**Performance Targets:**
- API response: <300ms
- Database queries: <100ms
- 95% success rate under load

---

### 6. Funnel Testing

Tests complete sales funnel simulation:

```bash
cd backend/scripts
php test_funnel.php
```

**Stages Tested:**
1. Landing page visit
2. Email capture
3. Engagement tracking
4. Service selection
5. Checkout process
6. Post-purchase flow

---

## Frontend Tests

### 1. Linting

Check code quality:

```bash
npm run lint
```

**Checks:**
- ESLint rules
- TypeScript errors
- Code style consistency

---

### 2. Build Test

Verify production build:

```bash
npm run build
```

**Output:**
- Compiled assets in `/dist/`
- Bundle size report
- Build warnings/errors

**Targets:**
- Build time: <10s
- Bundle size: <1MB (before gzip)
- Zero errors

---

### 3. Development Build

Test dev build:

```bash
npm run build:dev
```

Builds in development mode with source maps.

---

## CI/CD Pipeline

### Automated Testing (GitHub Actions)

The CI/CD pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Manual trigger

**Pipeline Jobs:**

1. **Backend Tests**
   - Sets up MySQL service
   - Installs PHP 8.1
   - Runs unit tests
   - Runs integration tests
   - Runs E2E tests
   - Runs performance tests

2. **Frontend Tests**
   - Sets up Node.js 20
   - Installs dependencies
   - Runs linter
   - Builds production bundle
   - Checks bundle size

3. **Security Scan**
   - npm audit
   - Secret detection
   - Vulnerability scanning

4. **Deployment Readiness**
   - Configuration file check
   - Documentation verification
   - Prerequisites validation

### Manual Pipeline Trigger

```bash
# Via GitHub UI
Actions → QA & Testing Pipeline → Run workflow
```

---

## Quick Test Commands

### Run Everything (Backend)

```bash
cd backend/scripts && \
php unit_tests.php && \
php test_api_endpoints.php && \
php e2e_tests.php && \
php performance_tests.php
```

### Run Everything (Frontend)

```bash
npm run lint && npm run build
```

### Full Platform Test

```bash
# Backend
cd backend/scripts && php test_suite.php

# Frontend
cd ../.. && npm run build
```

---

## Test Environments

### Local Development

```bash
# Set environment
export API_BASE_URL="http://localhost/backend"

# Run tests
cd backend/scripts
php test_suite.php
```

### Staging Server

```bash
# Set environment
export API_BASE_URL="https://staging.adilgfx.com/backend"

# Run tests
cd backend/scripts
php test_api_endpoints.php
```

### Production (Smoke Tests Only)

```bash
# IMPORTANT: Only run non-destructive tests on production

# Set environment
export API_BASE_URL="https://adilgfx.com/backend"

# Run safe tests
cd backend/scripts
php test_api_endpoints.php  # Safe (read-only)
# Do NOT run: unit_tests.php, e2e_tests.php (may create test data)
```

---

## Interpreting Test Results

### Success Indicators

✅ **All tests passed**
```
Total Tests: 91
Passed: 91 ✅
Failed: 0
```

✅ **Performance targets met**
```
Avg Response Time: 117ms (target: <300ms)
```

✅ **100% success rate**
```
Success Rate: 100% ✅
```

### Failure Indicators

❌ **Test failures**
```
Total Tests: 91
Passed: 89
Failed: 2 ❌
```

⚠️ **Performance warnings**
```
Avg Response Time: 450ms (target: <300ms) ⚠️
```

❌ **Low success rate**
```
Success Rate: 87% ❌ (target: >95%)
```

---

## Troubleshooting

### Database Connection Errors

```bash
# Check database credentials
cat backend/.env

# Test database connection
mysql -h DB_HOST -u DB_USER -p DB_NAME

# Verify schema installed
mysql -h DB_HOST -u DB_USER -p DB_NAME -e "SHOW TABLES;"
```

### API Endpoint Errors

```bash
# Check web server is running
curl http://localhost/backend/api/services.php

# Check PHP errors
tail -f backend/logs/error.log

# Verify .htaccess
cat backend/.htaccess
```

### Performance Issues

```bash
# Check MySQL slow queries
mysql -h DB_HOST -u DB_USER -p -e "SHOW VARIABLES LIKE 'slow_query%';"

# Monitor PHP memory
php -i | grep memory_limit

# Check server load
top -b -n 1
```

### Build Failures

```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

---

## Continuous Testing

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "Running pre-commit tests..."

# Frontend tests
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi

# Backend unit tests
cd backend/scripts
php unit_tests.php
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed"
    exit 1
fi

echo "✅ Pre-commit tests passed"
exit 0
```

### Daily Automated Tests

Set up cron job:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project/backend/scripts && php test_suite.php > /tmp/daily-tests.log 2>&1
```

---

## Test Data Management

### Reset Test Database

```bash
# Drop and recreate
mysql -h DB_HOST -u DB_USER -p -e "DROP DATABASE IF EXISTS test_db; CREATE DATABASE test_db;"

# Reinstall schema
mysql -h DB_HOST -u DB_USER -p test_db < backend/database/schema.sql
```

### Clean Up Test Data

```bash
# Remove test entries
mysql -h DB_HOST -u DB_USER -p DB_NAME -e "DELETE FROM leads WHERE email LIKE '%e2e_test%';"
mysql -h DB_HOST -u DB_USER -p DB_NAME -e "DELETE FROM newsletter_subscribers WHERE email LIKE '%e2e_test%';"
```

---

## Best Practices

1. **Run tests before committing code**
2. **Fix failing tests immediately**
3. **Monitor performance trends**
4. **Keep test data separate from production**
5. **Update tests when features change**
6. **Document new test scenarios**
7. **Review test coverage regularly**
8. **Run full suite before deployment**

---

## Support

If tests fail unexpectedly:

1. Check the detailed error output
2. Review recent code changes
3. Verify environment configuration
4. Check database connectivity
5. Review server logs
6. Consult QA_TEST_REPORT.md

---

**Last Updated:** January 2025
**Version:** 1.0.0
