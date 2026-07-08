-- ============================================================================
-- COMPLETE FIX: User Profiles Setup
-- ============================================================================
-- This script will:
-- 1. Check if user_profiles table exists
-- 2. Create it if it doesn't exist
-- 3. Fix RLS policies to prevent infinite recursion
-- 4. Create a profile for your existing authenticated user
-- ============================================================================

-- Step 1: Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'partner', 'user', 'api_user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Step 4: Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Step 5: Create profile for existing authenticated users
-- This will create a profile for any user in auth.users who doesn't have one yet
INSERT INTO user_profiles (id, email, full_name, avatar_url, role, status, last_login_at)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'avatar_url',
  'user' as role,
  'active' as status,
  NOW() as last_login_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Verification - Check if profiles were created
SELECT 
  'Total auth users:' as info,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total user profiles:' as info,
  COUNT(*) as count
FROM user_profiles;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- If you see numbers above, the setup is complete.
-- Refresh your browser and the error should be gone.

