import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // DEV: auth bypassed - all routes accessible without authentication
  return res

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Skipping auth middleware.')
    return res
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  console.log('Middleware:', pathname, 'Session:', session ? `✅ ${session.user.email}` : '❌ No session')

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/forgot-password',
    '/wizard',
    '/payments',
    '/setup-profile',
    '/api/create-profile',
    '/api/auth/signout',
    '/api/auth/session',
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated, check role-based access
  if (session) {
    // Fetch user profile to get role - use maybeSingle to avoid errors
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Middleware: Error fetching user profile:', profileError.message)
    }

    const userRole = profile?.role || 'user'
    console.log('Middleware: User role:', userRole, 'for path:', pathname)

    // Admin routes - only accessible by admin and super_admin
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        console.log('Middleware: Unauthorized access to admin route, redirecting to /unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Partner routes - only accessible by partners
    if (pathname.startsWith('/partner')) {
      if (userRole !== 'partner') {
        console.log('Middleware: Unauthorized access to partner route, redirecting to /unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (pathname === '/login' || pathname === '/signup') {
      if (userRole === 'admin' || userRole === 'super_admin') {
        console.log('Middleware: Redirecting admin to /admin')
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (userRole === 'partner') {
        console.log('Middleware: Redirecting partner to /partner')
        return NextResponse.redirect(new URL('/partner', req.url))
      } else {
        console.log('Middleware: Redirecting user to /dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

