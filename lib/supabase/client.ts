import { createBrowserClient } from '@supabase/ssr'

// ============================================================================
// SUPABASE CLIENT (Client-side)
// ============================================================================
// This client is used for client-side operations (browser)
// It uses the anon key which respects Row Level Security (RLS) policies
// Uses @supabase/ssr for proper cookie handling in Next.js
// ============================================================================

// Get environment variables with fallback to process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'Required variables:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

export  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

