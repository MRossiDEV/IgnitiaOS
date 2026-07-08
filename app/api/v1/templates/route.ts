/**
 * Templates API Route
 * 
 * GET /api/templates - Get all templates for organization
 * POST /api/templates - Create a new template
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { CreateTemplateInput } from '@/lib/models/template'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with the request to get the authenticated user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // We don't need to set cookies on the response from API routes
          },
          remove(name: string, options: CookieOptions) {
            // We don't need to remove cookies on the response from API routes
          },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API GET /templates - User ID:', user.id, 'Email:', user.email)

    // Get user's organization directly from auth user's id
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)

    if (profileError || !userProfiles || userProfiles.length === 0) {
      console.error('Profile error:', profileError)
      console.log('No user profile found for user:', user.id)
      // Return empty templates instead of error if profile doesn't exist yet
      return NextResponse.json({ templates: [] })
    }

    const userProfile = userProfiles[0]

    if (!userProfile?.organization_id) {
      console.log('User profile exists but has no organization_id. Profile:', userProfile)
      // Return empty templates if user has no organization yet
      return NextResponse.json({ templates: [] })
    }

    // Fetch all templates for the organization
    const { data: templates, error } = await supabaseAdmin
      .from('ai_templates')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: `Failed to fetch templates: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error('Error in GET /api/templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with the request to get the authenticated user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // We don't need to set cookies on the response from API routes
          },
          remove(name: string, options: CookieOptions) {
            // We don't need to remove cookies on the response from API routes
          },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization directly from auth user's id
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)

    if (profileError || !userProfiles || userProfiles.length === 0) {
      console.error('Profile error:', profileError)
      console.log('No user profile found for user:', user.id)
      return NextResponse.json({ error: 'User profile not found' }, { status: 500 })
    }

    const userProfile = userProfiles[0]

    if (!userProfile?.organization_id) {
      console.log('User profile exists but has no organization_id. Cannot create template.')
      return NextResponse.json({ error: 'Your organization is not set up yet. Please contact support.' }, { status: 400 })
    }

    const body: CreateTemplateInput = await request.json()

    // Validate required fields
    if (!body.name || !body.template_type || !body.prompt_template) {
      return NextResponse.json(
        { error: 'Missing required fields: name, template_type, prompt_template' },
        { status: 400 }
      )
    }

    // Create template
    const { data: newTemplate, error: insertError } = await supabaseAdmin
      .from('ai_templates')
      .insert({
        organization_id: userProfile.organization_id,
        name: body.name,
        template_type: body.template_type,
        industry: body.industry,
        prompt_template: body.prompt_template,
        system_prompt: body.system_prompt,
        model: body.model || 'gpt-4',
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 2000,
        output_format: body.output_format || 'markdown',
        placeholders: body.placeholders || [],
        custom_sections: body.custom_sections || [],
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating template:', insertError)
      return NextResponse.json({ error: `Failed to create template: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ template: newTemplate }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
