/**
 * Workflow Model
 * Represents internal delivery workflows
 */

import { OfferType } from './offer'

export type WorkflowType = 'seo_audit' | 'content_optimization' | 'automation_setup'
export type WorkflowStatus = 'not_started' | 'in_progress' | 'awaiting_review' | 'completed' | 'failed'

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  started_at?: string
  completed_at?: string
  data?: Record<string, any>
}

export interface Workflow {
  id: string
  order_id: string
  organization_id: string
  
  // Type and status
  type: WorkflowType
  status: WorkflowStatus
  
  // Workflow steps
  steps: WorkflowStep[]
  current_step_index: number
  
  // Execution data
  input_data?: Record<string, any>
  output_data?: Record<string, any>
  
  // Audit/reporting
  error_message?: string
  
  // Timestamps
  created_at: string
  started_at?: string
  completed_at?: string
  updated_at: string
}

// Workflow templates for each offer type
export const WORKFLOW_TEMPLATES: Record<OfferType, WorkflowType> = {
  audit: 'seo_audit',
  optimization: 'content_optimization',
  growth_automation: 'automation_setup'
}

// Default steps for each workflow type
export function getDefaultSteps(type: WorkflowType): WorkflowStep[] {
  const templates: Record<WorkflowType, WorkflowStep[]> = {
    seo_audit: [
      { id: 'crawl', name: 'Crawl Website', status: 'not_started' },
      { id: 'analyze', name: 'Analyze SEO', status: 'not_started' },
      { id: 'competitors', name: 'Competitor Analysis', status: 'not_started' },
      { id: 'generate_report', name: 'Generate Report', status: 'not_started' },
      { id: 'review', name: 'Review & QA', status: 'not_started' }
    ],
    content_optimization: [
      { id: 'analyze_content', name: 'Analyze Existing Content', status: 'not_started' },
      { id: 'generate_content', name: 'Generate New Content', status: 'not_started' },
      { id: 'optimize', name: 'Optimize for SEO', status: 'not_started' },
      { id: 'review', name: 'Client Review', status: 'not_started' },
      { id: 'implement', name: 'Implement Changes', status: 'not_started' }
    ],
    automation_setup: [
      { id: 'audit', name: 'Business Process Audit', status: 'not_started' },
      { id: 'design', name: 'Design Automations', status: 'not_started' },
      { id: 'setup', name: 'Setup & Configure', status: 'not_started' },
      { id: 'test', name: 'Testing & QA', status: 'not_started' },
      { id: 'handoff', name: 'Training & Handoff', status: 'not_started' }
    ]
  }
  return templates[type]
}

// Helper to get next step
export function getNextStep(workflow: Workflow): WorkflowStep | null {
  if (workflow.current_step_index >= workflow.steps.length) {
    return null
  }
  return workflow.steps[workflow.current_step_index]
}

// Helper to check if workflow is complete
export function isWorkflowComplete(workflow: Workflow): boolean {
  return workflow.status === 'completed' || workflow.status === 'failed'
}
