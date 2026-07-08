/**
 * Admin Workflow Management API
 * 
 * CRUD operations for PromptStack workflow templates
 * Includes variable management and template testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const WorkflowTemplateSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  description: z.string().optional(),
  prompt_blocks: z.array(z.record(z.any())),
  variables: z.record(z.any()),
  is_active: z.boolean().default(true),
  max_retries: z.number().default(3),
  timeout_seconds: z.number().default(300),
})

type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>

/**
 * GET /api/admin/workflows
 * List all workflow templates
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(req.url)
    const industry = searchParams.get('industry')
    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('workflow_templates')
      .select(`
        *,
        workflow_variables(*)
      `)
      .order('updated_at', { ascending: false })

    if (industry) {
      query = query.eq('industry', industry)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get workflows error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve workflows' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/workflows
 * Create a new workflow template
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = WorkflowTemplateSchema.parse(body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Create workflow template
    const { data: workflow, error } = await supabase
      .from('workflow_templates')
      .insert({
        organization_id: userProfile.organization_id,
        created_by: user.id,
        ...validatedData,
      })
      .select('*')
      .single()

    if (error) throw error

    // Create workflow variables
    if (Object.keys(validatedData.variables).length > 0) {
      const variablesToInsert = Object.entries(validatedData.variables).map(
        ([name, config]: [string, any]) => ({
          organization_id: userProfile.organization_id,
          workflow_template_id: workflow.id,
          variable_name: name,
          variable_type: config.type || 'string',
          default_value: config.default_value,
          description: config.description,
          is_global: config.is_global || false,
          validation_rules: config.validation_rules || {},
        })
      )

      await supabase.from('workflow_variables').insert(variablesToInsert)
    }

    return NextResponse.json(
      {
        success: true,
        workflow,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create workflow error:', error)
    return NextResponse.json(
      {
        error: error instanceof z.ZodError ? error.errors : 'Failed to create workflow',
      },
      { status: 400 }
    )
  }
}

/**
 * PUT /api/admin/workflows/[workflowId]
 * Update a workflow template
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const body = await req.json()
    const validatedData = WorkflowTemplateSchema.partial().parse(body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update workflow
    const { data: workflow, error } = await supabase
      .from('workflow_templates')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.workflowId)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Update workflow error:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/workflows/[workflowId]
 * Delete a workflow template
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check permissions
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete workflow
    const { error } = await supabase
      .from('workflow_templates')
      .delete()
      .eq('id', params.workflowId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete workflow error:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/workflows/[workflowId]/test
 * Test a workflow template with sample data
 */
// export async function POST(
//   req: NextRequest,
//   { params }: { params: { workflowId: string } }
// ) {
//   if (req.method !== 'POST') {
//     return NextResponse.json(
//       { error: 'Method not allowed' },
//       { status: 405 }
//     )
//   }

//   try {
//     const body = await req.json()
//     const { test_data } = body

//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.SUPABASE_SERVICE_ROLE_KEY!
//     )

//     // Get workflow
//     const { data: workflow, error: workflowError } = await supabase
//       .from('workflow_templates')
//       .select('*')
//       .eq('id', params.workflowId)
//       .single()

//     if (workflowError) throw workflowError

//     // Execute workflow with test data
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/execute-test`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           workflow,
//           test_data,
//         }),
//       }
//     )

//     if (!response.ok) {
//       throw new Error('Workflow execution failed')
//     }

//     const result = await response.json()

//     return NextResponse.json({
//       success: true,
//       result,
//     })
//   } catch (error) {
//     console.error('Test workflow error:', error)
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : 'Workflow test failed',
//       },
//       { status: 400 }
//     )
//   }
// }
