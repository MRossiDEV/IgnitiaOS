"use client"

import { useRouter } from 'next/navigation'
import type { AuthUser, UserRole } from '@/lib/auth/supabase-auth'

// ============================================================================
// AUTH HOOK (DEV: auth bypassed, returns mock admin user)
// ============================================================================

const MOCK_USER: AuthUser = {
  id: 'dev-user-id',
  email: 'dev@ignitia.local',
  app_metadata: {},
  user_metadata: { full_name: 'Dev User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  profile: {
    id: 'dev-user-id',
    email: 'dev@ignitia.local',
    full_name: 'Dev User',
    role: 'super_admin',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
} as AuthUser

export function useAuth() {
  const router = useRouter()

  const signOut = async () => {
    router.push('/login')
  }

  const hasRole = (_roles: UserRole | UserRole[]): boolean => true
  const isAdmin = (): boolean => true
  const isPartner = (): boolean => true

  return {
    user: MOCK_USER,
    loading: false,
    signOut,
    hasRole,
    isAdmin,
    isPartner,
    isAuthenticated: true,
  }
}

