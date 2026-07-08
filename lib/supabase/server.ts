import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// SUPABASE ADMIN CLIENT (Server-side)
// ============================================================================
// This client is used for server-side operations (API routes, server components)
// It uses the service role key which BYPASSES Row Level Security (RLS) policies
// ⚠️ WARNING: Only use this on the server side, never expose to the client!
// ============================================================================

let _supabaseAdmin: SupabaseClient | null = null

function getRequiredEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required variables:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return { supabaseUrl, supabaseServiceKey }
}

export function getSupabaseAdmin() {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const { supabaseUrl, supabaseServiceKey } = getRequiredEnv()
  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _supabaseAdmin
}

// Preserve the existing `supabaseAdmin` API while deferring env validation
// until the client is actually used at runtime.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver)
  },
})

