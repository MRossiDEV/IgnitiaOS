import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { CreateUserInput } from '@/lib/models/user'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('GET /api/users - User:', user.email)

    // Get user's organization
    const { data: userProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)

    if (!userProfiles || userProfiles.length === 0) {
      console.log('No profile found for user:', user.id)
      return NextResponse.json({ users: [] })
    }

    const userProfile = userProfiles[0]

    if (!userProfile?.organization_id) {
      console.log('Profile has no organization_id')
      return NextResponse.json({ users: [] })
    }

    // Fetch all users in the organization
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    console.log('Returning users:', users?.length || 0)
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    )

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's organization and verify admin role
    const { data: currentUserProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', currentUser.id)

    if (!currentUserProfiles || currentUserProfiles.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const currentUserProfile = currentUserProfiles[0]

    if (!currentUserProfile?.organization_id) {
      return NextResponse.json({ error: 'User has no organization' }, { status: 403 })
    }

    // Check if user has admin permission
    if (!['admin', 'super_admin'].includes(currentUserProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body: CreateUserInput = await request.json()

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create auth user
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password || Math.random().toString(36).slice(-12),
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user profile
    const { data: newUser, error: profileInsertError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: newAuthUser.user.id,
        organization_id: currentUserProfile.organization_id,
        email: body.email,
        full_name: body.full_name,
        role: body.role || 'user',
        status: 'active',
      })
      .select()

    if (profileInsertError) {
      console.error('Error creating user profile:', profileInsertError)
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    return NextResponse.json({ user: newUser?.[0] }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
