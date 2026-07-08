import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== CREATE PROFILE API START ===')

  try {
    // Get userId from request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      console.log('❌ No userId provided in request body')
      return NextResponse.json({
        error: 'userId is required in request body'
      }, { status: 400 })
    }

    console.log('Creating profile for userId:', userId)

    // Use admin client to bypass RLS and cookie issues
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !user) {
      console.log('❌ User not found:', userError?.message)
      return NextResponse.json({
        error: 'User not found',
        details: userError?.message
      }, { status: 404 })
    }

    console.log('✅ User found:', user.email)

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile.role, existingProfile.email)
      console.log('=== CREATE PROFILE API END ===')
      return NextResponse.json({
        message: 'Profile already exists',
        profile: existingProfile
      })
    }

    // Create profile
    console.log('📝 Creating new profile...')
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        role: 'admin', // Make first user admin
        status: 'active',
        last_login_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating profile:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log('✅ Profile created successfully:', newProfile)
    console.log('=== CREATE PROFILE API END ===')

    return NextResponse.json({
      message: 'Profile created successfully',
      profile: newProfile
    })
  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

