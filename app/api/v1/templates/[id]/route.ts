/**
 * Template Detail API Route
 * 
 * GET /api/templates/[id] - Get a specific template
 * PUT /api/templates/[id] - Update a template
 * DELETE /api/templates/[id] - Delete a template
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { UpdateTemplateInput } from '@/lib/models/template'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    // Get the current user
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)

    if (!userProfiles || userProfiles.length === 0) {
      console.error('User profile not found')
      return NextResponse.json({ error: 'User profile not found' }, { status: 500 })
    }

    const userProfile = userProfiles[0]

    // Fetch the template
    const { data: template, error } = await supabaseAdmin
      .from('ai_templates')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return NextResponse.json({ error: `Template not found: ${error.message}` }, { status: 404 })
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error in GET /api/templates/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    // Get the current user
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)

    if (!userProfiles || userProfiles.length === 0) {
      console.error('User profile not found')
      return NextResponse.json({ error: 'User profile not found' }, { status: 500 })
    }

    const userProfile = userProfiles[0]

    // Verify template exists and belongs to organization
    const { data: existingTemplate } = await supabaseAdmin
      .from('ai_templates')
      .select('id')
      .eq('id', id)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const body: UpdateTemplateInput = await request.json()

    // Update template
    const { data: updatedTemplate, error } = await supabaseAdmin
      .from('ai_templates')
      .update({
        name: body.name,
        template_type: body.template_type,
        industry: body.industry,
        prompt_template: body.prompt_template,
        system_prompt: body.system_prompt,
        model: body.model,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
        output_format: body.output_format,
        placeholders: body.placeholders,
        custom_sections: body.custom_sections,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      return NextResponse.json({ error: `Failed to update template: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error('Error in PUT /api/templates/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    // Get the current user
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)

    if (!userProfiles || userProfiles.length === 0) {
      console.error('User profile not found')
      return NextResponse.json({ error: 'User profile not found' }, { status: 500 })
    }

    const userProfile = userProfiles[0]

    // Verify template exists and belongs to organization
    const { data: existingTemplate } = await supabaseAdmin
      .from('ai_templates')
      .select('id')
      .eq('id', id)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Delete template
    const { error: deleteError } = await supabaseAdmin
      .from('ai_templates')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting template:', deleteError)
      return NextResponse.json({ error: `Failed to delete template: ${deleteError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/templates/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
