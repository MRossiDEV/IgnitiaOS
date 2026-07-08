-- ============================================================================
-- DEBUG USER PROFILE
-- ============================================================================
-- Run this in Supabase SQL Editor to see what's happening
-- ============================================================================

-- 1. Check all users in auth.users table
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check all profiles in user_profiles table
SELECT 
  id,
  email,
  role,
  status,
  full_name,
  created_at,
  last_login_at
FROM user_profiles
ORDER BY created_at DESC;

-- 3. Check if there's a mismatch between auth.users and user_profiles
SELECT 
  u.id as auth_id,
  u.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. If you see your user in auth.users but NOT in user_profiles, run this:
-- (Replace the ID with your actual user ID from the query above)
/*
INSERT INTO user_profiles (id, email, role, status, full_name)
VALUES (
  'YOUR-USER-ID-HERE',
  'your-email@gmail.com',
  'admin',
  'active',
  'Your Name'
);
*/

