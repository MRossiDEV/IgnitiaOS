/**
 * User Model
 * 
 * Types and interfaces for user management
 */

export type UserRole = 'super_admin' | 'admin' | 'partner' | 'user' | 'api_user'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string

  email: string
  password_hash: string

  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  phone: string | null

  role:
    | 'super_admin'
    | 'admin'
    | 'manager'
    | 'sales'
    | 'agent'
    | 'partner'
    | 'contractor'
    | 'client'
    | 'user'

  status:
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'pending'
    | 'deleted'

  is_active: boolean

  last_login: string | null
  last_login_at: string | null

  created_at: string | null
  updated_at: string | null

  organization_id: string | null
  created_by: string | null
  updated_by: string | null

  job_title: string | null
  department: string | null
  notes: string | null

  timezone: string | null
  locale: string | null

  email_verified: boolean | null
  two_factor_enabled: boolean | null

  failed_login_attempts: number | null
  locked_until: string | null

  deleted_at: string | null
}

export interface CreateUserInput {
  email: string
  full_name?: string
  role: UserRole
  password?: string
}

export interface UpdateUserInput {
  full_name?: string
  role?: UserRole
  status?: UserStatus
  avatar_url?: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  partner: 'Partner',
  user: 'User',
  api_user: 'API User',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full system access, can manage all users and settings',
  admin: 'Full access to organization data and features',
  partner: 'Limited access, partner-specific features only',
  user: 'Standard user access to assigned features',
  api_user: 'API access only for integrations',
}

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}
