/**
 * Supabase Database Types - PRD Update
 * 
 * This file extends the existing types with new tables for:
 * - Automated KPI report generation
 * - PromptStack workflow management
 * - Industry-specific configurations
 * - Lead nurturing and upsell tracking
 */

// ============================================================================
// NEW WORKFLOW & AUTOMATION TYPES
// ============================================================================

export interface WorkflowTemplate {
  id: string
  organization_id: string
  name: string
  industry: string
  description?: string
  
  // Workflow definition
  prompt_blocks: Record<string, any>[]
  variables: Record<string, any>
  
  // Configuration
  is_active: boolean
  version: number
  retry_on_failure: boolean
  max_retries: number
  timeout_seconds: number
  
  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
}

export interface WorkflowExecution {
  id: string
  workflow_template_id: string
  report_id: string
  
  // Execution status
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying'
  
  // Execution details
  input_data: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  
  // Retry tracking
  retry_count: number
  last_retry_at?: string
  
  // Performance
  started_at?: string
  completed_at?: string
  duration_ms?: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface IndustryKPIConfig {
  id: string
  organization_id: string
  industry: string
  
  // KPI Definition
  kpi_categories: string[]
  kpi_metrics: Record<string, any>
  
  // Report template
  report_sections: string[]
  template_id?: string
  
  // Pricing
  base_price: number
  premium_price: number
  
  // Configuration
  is_active: boolean
  benchmark_data?: Record<string, any>
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface KPIReport {
  id: string
  organization_id: string
  user_id: string
  industry: string
  website: string
  
  // Report status
  status: 'pending' | 'generating' | 'delivered' | 'failed'
  
  // KPI data
  kpi_data?: Record<string, any>
  
  // Report URLs
  pdf_url?: string
  html_report_url?: string
  
  // Workflow tracking
  industry_kpi_config_id?: string
  workflow_execution_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface UpsellOpportunity {
  id: string
  report_id: string
  user_id: string
  
  // Upsell details
  service_type: 'premium_analysis' | 'consulting' | 'managed_automation'
  service_description?: string
  upsell_price?: number
  
  // Tracking
  email_sent_at?: string
  email_opened_at?: string
  cta_clicked_at?: string
  converted: boolean
  conversion_payment_id?: string
  
  // Metadata
  created_at: string
  updated_at: string
}

export interface LeadNurtureSequence {
  id: string
  organization_id: string
  lead_id: string
  
  // Sequence status
  status: 'active' | 'completed' | 'paused' | 'failed'
  
  // Sequence data
  sequence_type: 'post_report' | 'lead_generation' | 'custom'
  emails_sent: number
  current_step: number
  
  // Engagement
  last_email_sent_at?: string
  next_email_scheduled_at?: string
  total_opens: number
  total_clicks: number
  
  // Timestamps
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface WorkflowVariable {
  id: string
  organization_id: string
  workflow_template_id?: string
  
  // Variable definition
  variable_name: string
  variable_type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  default_value?: string
  description?: string
  
  // Scope
  is_global: boolean
  
  // Validation
  validation_rules?: Record<string, any>
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface AutomationFailure {
  id: string
  organization_id: string
  workflow_execution_id?: string
  
  // Failure details
  error_type: string
  error_message: string
  stack_trace?: string
  
  // Context
  input_data?: Record<string, any>
  attempted_retry_at?: string
  
  // Resolution
  resolved: boolean
  resolved_at?: string
  resolution_notes?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface AdminAlert {
  id: string
  organization_id: string
  admin_user_id: string
  
  // Alert details
  alert_type: 'workflow_failure' | 'payment_issue' | 'lead_conversion' | 'system_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message?: string
  
  // Context
  related_entity_type?: string
  related_entity_id?: string
  
  // Status
  read_at?: string
  acknowledged_at?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface WorkflowAnalytics {
  id: string
  organization_id: string
  workflow_template_id?: string
  
  // Date bucket (daily aggregation)
  date_bucket: string
  
  // Metrics
  total_executions: number
  successful_executions: number
  failed_executions: number
  avg_duration_ms?: number
  total_revenue_generated?: number
  
  // Efficiency
  success_rate?: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================================================
// EXTENDED EXISTING TYPES
// ============================================================================

export interface Report {
  id: string
  organization_id: string
  user_id: string
  lead_id?: string
  industry: string
  website: string
  business_name: string
  
  // Report status and type
  type: 'snapshot' | 'blueprint'
  status: 'pending' | 'generating' | 'delivered' | 'failed'
  
  // KPI data (NEW)
  kpi_data?: Record<string, any>
  industry_kpi_config_id?: string
  workflow_execution_id?: string
  
  // Report URLs
  pdf_url?: string
  html_report_url?: string
  
  // AI analysis
  ai_confidence_score?: number
  revenue_model?: Record<string, any>
  bottlenecks?: Record<string, any>
  benchmarks?: Record<string, any>
  recommendations?: Record<string, any>
  
  // Delivery
  sent_at?: string
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  organization_id: string
  user_id: string
  report_id?: string // NEW
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  provider: 'stripe' | 'paypal' | 'crypto'
  reference_id?: string
  invoice_url?: string // NEW
  email_confirmation_sent_at?: string // NEW
  created_at: string
  updated_at: string
}

// ============================================================================
// HELPER TYPES FOR API RESPONSES
// ============================================================================

export interface ReportGenerationRequest {
  website: string
  industry: string
  company_name?: string
  email: string
  report_type: 'snapshot' | 'blueprint'
  premium?: boolean
}

export interface WorkflowExecutionResult {
  success: boolean
  execution_id: string
  report_id: string
  kpi_data?: Record<string, any>
  pdf_url?: string
  html_url?: string
  error?: string
  retry_count?: number
}

export interface PromptStackBlockConfig {
  id: string
  type: string // 'prompt', 'data_fetch', 'transform', 'validate', 'format'
  name: string
  prompt_template?: string
  variables?: string[]
  output_key: string
  error_handling?: 'fail' | 'retry' | 'skip'
  metadata?: Record<string, any>
}

export interface WorkflowDefinition {
  name: string
  industry: string
  blocks: PromptStackBlockConfig[]
  variables: WorkflowVariable[]
  version: number
}

// ============================================================================
// DATABASE TYPE DEFINITION
// ============================================================================

export type Database = {
  public: {
    Tables: {
      // Existing tables...
      organizations: { Row: any }
      user_profiles: { Row: any }
      leads: { Row: any }
      reports: { Row: Report }
      payment_transactions: { Row: PaymentTransaction }
      
      // New tables for PRD
      workflow_templates: { Row: WorkflowTemplate }
      workflow_executions: { Row: WorkflowExecution }
      industry_kpi_configs: { Row: IndustryKPIConfig }
      upsell_opportunities: { Row: UpsellOpportunity }
      lead_nurture_sequences: { Row: LeadNurtureSequence }
      workflow_variables: { Row: WorkflowVariable }
      automation_failures: { Row: AutomationFailure }
      admin_alerts: { Row: AdminAlert }
      workflow_analytics: { Row: WorkflowAnalytics }
    }
  }
}
