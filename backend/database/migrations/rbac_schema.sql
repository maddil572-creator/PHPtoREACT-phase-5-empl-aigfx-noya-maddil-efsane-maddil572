/*
  # RBAC (Role-Based Access Control) Schema Migration

  ## Overview
  Extends the existing users table to support additional roles for granular permission control.

  ## Changes

  ### 1. Modified Tables
    - `users` table:
      - Updated `role` column from ENUM('user', 'admin') to ENUM('user', 'editor', 'viewer', 'admin')
      - Adds support for Editor and Viewer roles

  ### 2. New Index
    - Maintains existing `idx_role` index for role-based queries

  ### 3. Role Definitions
    - **User**: Default role for registered users (can access user portal)
    - **Viewer**: Read-only access to admin panel
    - **Editor**: Can create/edit content (blogs, portfolio, services)
    - **Admin**: Full access including user management and settings

  ## Security Notes
    - Only Admin role can change user roles
    - Role changes are logged in audit_log table
    - Frontend route guards enforce role-based access
*/

-- Alter users table to support additional roles
ALTER TABLE users
MODIFY COLUMN role ENUM('user', 'editor', 'viewer', 'admin') DEFAULT 'user';

-- Add role change audit log entries for existing users (if needed)
INSERT INTO audit_log (action, entity_type, entity_id, user_id, changes, created_at)
SELECT
    'role_migration' as action,
    'user' as entity_type,
    id as entity_id,
    id as user_id,
    JSON_OBJECT('role', role, 'migration', 'RBAC Phase 10') as changes,
    NOW() as created_at
FROM users
WHERE role IN ('user', 'admin')
ON DUPLICATE KEY UPDATE created_at = created_at;
