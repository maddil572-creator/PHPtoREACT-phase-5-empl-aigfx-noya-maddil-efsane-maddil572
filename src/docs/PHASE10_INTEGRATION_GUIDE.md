# Phase 10 - RBAC Integration Guide

## Quick Start

This guide helps you integrate and configure the RBAC system in your deployment.

## Prerequisites

- Database access (MySQL/MariaDB)
- Admin panel access
- Backend API running
- Frontend built and deployed

## Step 1: Database Migration

### Apply the Schema Update

```bash
# Connect to your database
mysql -u your_username -p your_database_name

# Run the migration
mysql -u your_username -p your_database_name < backend/database/migrations/rbac_schema.sql
```

### Verify Migration

```sql
-- Check that role column supports new values
SHOW COLUMNS FROM users LIKE 'role';

-- Should show: ENUM('user', 'editor', 'viewer', 'admin')
```

### Create Your First Admin

```sql
-- Update your account to admin
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, name, role FROM users WHERE email = 'your-email@example.com';
```

## Step 2: API Configuration

### Backend Environment

Ensure your backend configuration includes:

```php
// backend/config/config.php
define('JWT_SECRET', 'your-secret-key-here');
define('JWT_EXPIRY', 86400); // 24 hours
define('BCRYPT_COST', 12);
```

### Test API Endpoints

```bash
# Get auth token
curl -X POST http://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Test user management endpoint (replace TOKEN)
curl http://your-api.com/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "users": [...],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

## Step 3: Frontend Configuration

### Environment Variables

Ensure your frontend has the correct API URL:

```env
# .env or .env.production
VITE_API_BASE_URL=https://your-api.com/api
```

### Build and Deploy

```bash
# Build production version
npm run build

# Deploy dist/ directory to your hosting
# (Netlify, Vercel, traditional hosting, etc.)
```

## Step 4: User Management Setup

### Access Admin Panel

1. Login with your admin account
2. Navigate to the admin dashboard
3. You should see a "User Management" option

### Assign Roles to Existing Users

1. Go to User Management page
2. Search for the user
3. Click the edit icon (UserCog)
4. Select the appropriate role:
   - **User**: Regular customer access only
   - **Viewer**: Can view admin panel but not edit
   - **Editor**: Can create and edit content
   - **Admin**: Full system access
5. Review warnings if promoting/demoting admins
6. Click "Update Role"

## Step 5: Testing the System

### Test Each Role

Create test accounts with each role:

```sql
-- Create test users
INSERT INTO users (email, password_hash, name, role) VALUES
('user@test.com', '$2y$12$...', 'Test User', 'user'),
('viewer@test.com', '$2y$12$...', 'Test Viewer', 'viewer'),
('editor@test.com', '$2y$12$...', 'Test Editor', 'editor');
```

### Verification Checklist

**As User:**
- [ ] Can login and access user dashboard
- [ ] Cannot see admin dashboard link
- [ ] Redirected when trying to access /dashboard
- [ ] Can view profile and tokens

**As Viewer:**
- [ ] Can access admin dashboard
- [ ] Can view analytics
- [ ] Can view all admin pages
- [ ] Cannot edit content (UI should prevent)

**As Editor:**
- [ ] Can access admin dashboard
- [ ] Can create/edit blogs
- [ ] Can create/edit portfolio items
- [ ] Can upload media
- [ ] Cannot access user management
- [ ] Cannot access settings

**As Admin:**
- [ ] Can access all pages
- [ ] Can manage users and roles
- [ ] Can change system settings
- [ ] Can view audit logs
- [ ] Can delete users (except self)

## Step 6: Security Configuration

### Enable Audit Logging

The system automatically logs role changes. Verify logs are created:

```sql
-- View recent role changes
SELECT * FROM audit_log
WHERE action = 'role_change'
ORDER BY created_at DESC
LIMIT 10;
```

### Set Up Monitoring

Monitor for:
- Unusual role assignments
- Multiple failed access attempts
- Admin account activity

### Backup Strategy

```bash
# Regular database backups
mysqldump -u user -p database_name > backup_$(date +%Y%m%d).sql

# Backup includes:
# - User accounts and roles
# - Audit logs
# - All other data
```

## Common Integration Patterns

### Adding New Admin Routes

```tsx
// In your admin router
import { ProtectedRoute } from '@/components/protected-route';

<Route
  path="/admin/new-feature"
  element={
    <ProtectedRoute requiredRoles={['admin', 'editor']}>
      <NewFeaturePage />
    </ProtectedRoute>
  }
/>
```

### Checking Permissions in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { hasRole, hasAnyRole, isAdmin } = useAuth();

  return (
    <>
      {isAdmin && <AdminOnlyButton />}
      {hasRole('editor') && <EditorButton />}
      {hasAnyRole(['admin', 'editor']) && <ContentButton />}
    </>
  );
}
```

### Backend Permission Checks

```php
// In any API endpoint
$auth = new Auth();
$auth_result = $auth->verifyToken($token);

if (!$auth_result['success']) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check for specific role
if ($auth_result['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

// Check for multiple roles
$allowed_roles = ['admin', 'editor'];
if (!in_array($auth_result['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['error' => 'Insufficient permissions']);
    exit;
}
```

## Troubleshooting

### Issue: Users can't login after migration

**Solution:**
```sql
-- Verify role column exists
DESCRIBE users;

-- Ensure all users have valid roles
UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';
```

### Issue: Admin panel shows access denied

**Solution:**
1. Clear browser cache and cookies
2. Login again to get new JWT with role
3. Check token includes role claim
4. Verify API returns role in response

### Issue: Role updates not saving

**Solution:**
```sql
-- Check audit_log table exists
SHOW TABLES LIKE 'audit_log';

-- Verify foreign key constraints
SHOW CREATE TABLE audit_log;

-- Test role update directly
UPDATE users SET role = 'editor' WHERE id = 1;
```

### Issue: Navigation not showing login button

**Solution:**
1. Verify AuthContext is wrapped around App
2. Check navigation.tsx imported useAuth correctly
3. Clear build cache: `rm -rf dist/ node_modules/.vite`
4. Rebuild: `npm run build`

## Performance Optimization

### Database Indexes

The migration includes indexes, but verify:

```sql
-- Check indexes
SHOW INDEX FROM users;

-- Should include index on role column
```

### API Caching

Consider caching user role checks:

```php
// In Auth class
private $roleCache = [];

public function getUserRole($user_id) {
    if (isset($this->roleCache[$user_id])) {
        return $this->roleCache[$user_id];
    }
    // Fetch from database
    $this->roleCache[$user_id] = $role;
    return $role;
}
```

### Frontend State Management

Role is cached in AuthContext - no additional caching needed.

## Maintenance

### Regular Tasks

**Weekly:**
- Review audit logs for unusual activity
- Check for users with incorrect roles
- Monitor API error logs

**Monthly:**
- Audit admin account list
- Review and cleanup test accounts
- Backup audit logs

**Quarterly:**
- Security audit of RBAC system
- Review role definitions
- Update documentation

### Updating Role Definitions

If you need to change role permissions:

1. Update backend permission checks
2. Update route protection in frontend
3. Update documentation
4. Test thoroughly before deploying
5. Notify users of permission changes

## Migration from Legacy System

If upgrading from an older system:

```sql
-- Migrate old admin flags to new role system
UPDATE users
SET role = 'admin'
WHERE is_admin = 1;

UPDATE users
SET role = 'user'
WHERE is_admin = 0 OR is_admin IS NULL;

-- Drop old column after verification
-- ALTER TABLE users DROP COLUMN is_admin;
```

## Support Resources

### Documentation
- `PHASE10_RBAC_COMPLETE.md` - Full implementation details
- `PHASE10_TEST_REPORT.md` - Testing coverage
- `API_SPEC.yaml` - API endpoint documentation

### Code References
- `backend/api/admin/users.php` - User management API
- `src/contexts/AuthContext.tsx` - Auth utilities
- `src/components/protected-route.tsx` - Route protection
- `src/admin/pages/Users/` - User management UI

### Getting Help

If you encounter issues:
1. Check error logs (browser console + server logs)
2. Review this integration guide
3. Verify all steps completed
4. Check database for correct role values
5. Test API endpoints independently

## Production Checklist

Before deploying to production:

- [ ] Database migration applied and verified
- [ ] At least one admin account created
- [ ] API endpoints tested with all roles
- [ ] Frontend build succeeds
- [ ] Route protection tested
- [ ] User management UI tested
- [ ] Audit logs verified working
- [ ] Notifications system working
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation reviewed
- [ ] Team trained on new system

## Next Steps

After successful integration:

1. **User Training**: Educate team on new role system
2. **Documentation**: Update internal procedures
3. **Monitoring**: Set up alerts for security events
4. **Optimization**: Fine-tune based on usage patterns
5. **Expansion**: Consider custom permissions if needed

## Conclusion

You now have a fully functional RBAC system! Users can be managed with granular permissions, and the system is secure, scalable, and maintainable.

For questions or issues, refer to the documentation files or review the test report for detailed testing procedures.
