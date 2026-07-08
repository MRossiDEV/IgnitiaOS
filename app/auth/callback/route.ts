import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('=== AUTH CALLBACK START ===')
  console.log('Code received:', !!code)

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Exchange the code for a session
    console.log('Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL('/login?error=Authentication failed', requestUrl.origin)
      )
    }

    console.log('✅ Session created for user:', data.user?.email)

    if (data.user) {
      console.log('Checking user profile for:', data.user.email, 'ID:', data.user.id)

      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError)
      }

      console.log('Profile found:', profile ? `Yes - Role: ${profile.role}` : 'No')

      // If no profile exists, create one (for OAuth users)
      if (!profile) {
        console.log('📝 Creating new user profile for OAuth user:', data.user.email)
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            role: 'admin', // CHANGED: Make first OAuth user admin by default
            status: 'active',
            last_login_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError)
          // Continue anyway - user can still log in without profile
        } else {
          console.log('✅ User profile created successfully with role:', newProfile?.role)
        }
      } else {
        // Update last login
        console.log('⏰ Updating last login for user:', data.user.email)
        await supabase
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      // Fetch the profile again to get the latest role
      const { data: finalProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      const userRole = finalProfile?.role || 'user'
      let redirectPath = '/dashboard'

      if (userRole === 'admin' || userRole === 'super_admin') {
        redirectPath = '/admin'
      } else if (userRole === 'partner') {
        redirectPath = '/partner'
      }

      console.log('👤 User role:', userRole)
      console.log('🚀 Redirecting user to:', redirectPath)
      console.log('=== AUTH CALLBACK END ===')

      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

