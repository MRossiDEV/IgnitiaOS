import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'partner' | 'user' | 'api_user'

export interface UserProfile {
  id: string
  organization_id?: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  profile?: UserProfile
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
  role: UserRole = 'user'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) throw error

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        role: role,
        status: 'active',
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
    }
  }

  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Update last login
  if (data.user) {
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)
  }

  return { data, error }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) throw error
  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get current user with profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.log('No authenticated user found')
    return null
  }

  console.log('Authenticated user:', user.id, user.email)

  // Fetch user profile - handle errors gracefully
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() // Use maybeSingle() instead of single() to avoid errors when no row exists

  if (profileError) {
    console.error('Error fetching user profile:', {
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code
    })

    // Return user without profile if there's an error
    return {
      ...user,
      profile: undefined,
    }
  }

  if (!profile) {
    console.warn('No profile found for user:', user.id)
    console.warn('You may need to create a profile in the database')
  } else {
    console.log('Profile loaded:', profile.role, profile.email)
  }

  return {
    ...user,
    profile: profile || undefined,
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

