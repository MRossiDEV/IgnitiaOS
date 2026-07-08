-- ============================================================================
-- FIX: User Profiles RLS Policy - Remove Infinite Recursion
-- ============================================================================
-- Run this in your Supabase SQL Editor to fix the RLS policy issue
-- ============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;

-- Create a simple policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Allow authenticated users to insert their own profile (for OAuth signup)
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Optional: Allow admins to view all profiles in their organization
-- Uncomment this if you need admin access to all profiles
/*
CREATE POLICY "Admins can view all profiles in organization"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
      AND up.organization_id = user_profiles.organization_id
    )
  );
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, you should be able to query your own profile without errors

