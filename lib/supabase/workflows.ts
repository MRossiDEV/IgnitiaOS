/**
 * Workflows Service
 * API for workflow execution and tracking
 */

import { supabaseAdmin } from './server'
import { Workflow, WorkflowStatus, WorkflowType, getDefaultSteps } from '@/lib/ai/models/workflow'

/**
 * Create a new workflow for an order
 */
export async function createWorkflow(
  orderId: string,
  organizationId: string,
  type: WorkflowType
): Promise<Workflow> {
  const steps = getDefaultSteps(type)

  const { data, error } = await supabaseAdmin
    .from('workflows')
    .insert({
      order_id: orderId,
      organization_id: organizationId,
      type,
      status: 'not_started',
      steps,
      current_step_index: 0,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Workflow
}

/**
 * Get workflow by ID
 */
export async function getWorkflow(workflowId: string): Promise<Workflow | null> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as Workflow
}

/**
 * Get workflow by order ID
 */
export async function getWorkflowByOrderId(orderId: string): Promise<Workflow | null> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as Workflow
}

/**
 * Update workflow status
 */
export async function updateWorkflowStatus(
  workflowId: string,
  status: WorkflowStatus
): Promise<Workflow> {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'in_progress' && !updates.started_at) {
    updates.started_at = new Date().toISOString()
  }

  if (status === 'completed' || status === 'failed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('workflows')
    .update(updates)
    .eq('id', workflowId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Workflow
}

/**
 * Update current step in workflow
 */
export async function advanceWorkflowStep(
  workflowId: string,
  stepIndex: number,
  stepData?: Record<string, any>
): Promise<Workflow> {
  const { data: workflow, error: fetchError } = await supabaseAdmin
    .from('workflows')
    .select('steps')
    .eq('id', workflowId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const steps = workflow.steps || []
  if (stepIndex < steps.length) {
    steps[stepIndex] = {
      ...steps[stepIndex],
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...(stepData && { data: stepData })
    }
  }

  const nextIndex = stepIndex + 1
  const shouldComplete = nextIndex >= steps.length

  const { data, error } = await supabaseAdmin
    .from('workflows')
    .update({
      steps,
      current_step_index: nextIndex,
      status: shouldComplete ? 'completed' : 'in_progress',
      completed_at: shouldComplete ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Workflow
}

/**
 * Store workflow output/results
 */
export async function storeWorkflowOutput(
  workflowId: string,
  outputData: Record<string, any>
): Promise<Workflow> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .update({
      output_data: outputData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Workflow
}

/**
 * Mark workflow as failed
 */
export async function markWorkflowFailed(
  workflowId: string,
  errorMessage: string
): Promise<Workflow> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .update({
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Workflow
}

/**
 * List workflows for organization
 */
export async function listWorkflows(
  organizationId: string,
  filters?: { status?: WorkflowStatus; type?: WorkflowType }
) {
  let query = supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data || []) as Workflow[]
}
