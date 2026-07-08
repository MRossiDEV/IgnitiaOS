import { NextRequest, NextResponse } from 'next/server'
import { getWorkflow, updateWorkflowStatus, advanceWorkflowStep, markWorkflowFailed, getWorkflowByOrderId } from '@/lib/supabase/workflows'

/**
 * GET /api/workflows/[id]
 * Get workflow details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workflow = await getWorkflow(id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, workflow },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/workflows/[id]
 * Update workflow status or advance step
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    let workflow = await getWorkflow(id)
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Update overall status
    if (body.status) {
      workflow = await updateWorkflowStatus(id, body.status)
    }

    // Advance to next step
    if (body.advance_step) {
      workflow = await advanceWorkflowStep(id, workflow.current_step_index, body.step_data)
    }

    // Mark as failed
    if (body.fail) {
      workflow = await markWorkflowFailed(id, body.error_message || 'Workflow failed')
    }

    return NextResponse.json(
      { success: true, workflow },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}
