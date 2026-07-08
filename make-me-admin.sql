-- ============================================================================
-- MAKE YOUR USER AN ADMIN
-- ============================================================================
-- This script will update your user profile to have admin role
-- Run this in Supabase SQL Editor
-- ============================================================================

-- First, let's see all users and their current roles
SELECT 
  id,
  email,
  role,
  status,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Update YOUR user to be an admin
-- Replace 'your-email@gmail.com' with your actual email
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'mrossiph@gmail.com';  -- <-- CHANGE THIS TO YOUR EMAIL

-- Verify the update
SELECT 
  id,
  email,
  role,
  status
FROM user_profiles
WHERE email = 'mrossiph@gmail.com';  -- <-- CHANGE THIS TO YOUR EMAIL

-- ============================================================================
-- ALTERNATIVE: Make ALL users admins (for testing)
-- ============================================================================
-- Uncomment the line below if you want to make all users admins
-- UPDATE user_profiles SET role = 'admin';

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- After running this:
-- 1. Refresh your browser (Ctrl+Shift+R)
-- 2. You should be redirected to /admin instead of /dashboard

