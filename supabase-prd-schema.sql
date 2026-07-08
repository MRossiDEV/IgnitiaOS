-- ============================================================================
-- IGNITIA AI - KPI REPORT & LEAD GENERATION PRD SCHEMA
-- ============================================================================
-- PostgreSQL / Supabase
-- Version: Phase 1 - Automation + Admin PromptStack Module
-- Date: Jan 24, 2026
--
-- This schema extends the existing Supabase schema with:
-- - Automated report generation pipeline
-- - PromptStack workflow templates and execution
-- - Industry-specific KPI configurations
-- - Lead nurturing and upsell tracking
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- NEW TABLES FOR PRD
-- ============================================================================

-- ============================================================================
-- WORKFLOW TEMPLATES (PromptStack)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  
  -- Workflow definition
  prompt_blocks JSONB NOT NULL DEFAULT '[]',
  variables JSONB NOT NULL DEFAULT '{}',
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  retry_on_failure BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 300,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, name),
  INDEX idx_workflow_templates_org_industry (organization_id, industry),
  INDEX idx_workflow_templates_active (is_active)
);

-- ============================================================================
-- WORKFLOW EXECUTIONS (Automation Pipeline)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  
  -- Execution status
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'retrying')),
  
  -- Execution details
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB DEFAULT NULL,
  error_message TEXT,
  
  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  
  -- Performance
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_workflow_executions_status (status),
  INDEX idx_workflow_executions_report (report_id),
  INDEX idx_workflow_executions_created (created_at DESC)
);

-- ============================================================================
-- INDUSTRY CONFIGURATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS industry_kpi_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  industry TEXT NOT NULL,
  
  -- KPI Definition
  kpi_categories TEXT[] NOT NULL DEFAULT '{}',
  kpi_metrics JSONB NOT NULL DEFAULT '{}',
  
  -- Report template
  report_sections TEXT[] NOT NULL DEFAULT '{}',
  template_id UUID REFERENCES workflow_templates(id),
  
  -- Pricing
  base_price DECIMAL(10,2) DEFAULT 50.00,
  premium_price DECIMAL(10,2) DEFAULT 100.00,
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  benchmark_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, industry),
  INDEX idx_industry_configs_org (organization_id),
  INDEX idx_industry_configs_active (is_active)
);

-- ============================================================================
-- KPI REPORT GENERATION (Enhanced Reports Table)
-- ============================================================================
-- Note: This extends the existing reports table with KPI-specific fields
-- Run this migration to add columns to existing reports table:

ALTER TABLE IF EXISTS reports ADD COLUMN IF NOT EXISTS
  kpi_data JSONB DEFAULT NULL;

ALTER TABLE IF EXISTS reports ADD COLUMN IF NOT EXISTS
  industry_kpi_config_id UUID REFERENCES industry_kpi_configs(id);

ALTER TABLE IF EXISTS reports ADD COLUMN IF NOT EXISTS
  workflow_execution_id UUID REFERENCES workflow_executions(id);

ALTER TABLE IF EXISTS reports ADD COLUMN IF NOT EXISTS
  html_report_url TEXT;

-- ============================================================================
-- AUTOMATED UPSELL TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS upsell_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Upsell details
  service_type TEXT NOT NULL CHECK (service_type IN ('premium_analysis', 'consulting', 'managed_automation')),
  service_description TEXT,
  upsell_price DECIMAL(10,2),
  
  -- Tracking
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  cta_clicked_at TIMESTAMPTZ,
  converted BOOLEAN DEFAULT false,
  conversion_payment_id UUID REFERENCES payment_transactions(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_upsell_report (report_id),
  INDEX idx_upsell_user (user_id),
  INDEX idx_upsell_converted (converted),
  INDEX idx_upsell_email_sent (email_sent_at)
);

-- ============================================================================
-- LEAD NURTURE SEQUENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_nurture_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  
  -- Sequence status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed')),
  
  -- Sequence data
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('post_report', 'lead_generation', 'custom')),
  emails_sent INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 0,
  
  -- Engagement
  last_email_sent_at TIMESTAMPTZ,
  next_email_scheduled_at TIMESTAMPTZ,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_nurture_status (status),
  INDEX idx_nurture_lead (lead_id),
  INDEX idx_nurture_next_scheduled (next_email_scheduled_at)
);

-- ============================================================================
-- AUTOMATION WORKFLOW VARIABLES (Variable Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  
  -- Variable definition
  variable_name TEXT NOT NULL,
  variable_type TEXT NOT NULL CHECK (variable_type IN ('string', 'number', 'boolean', 'array', 'object')),
  default_value TEXT,
  description TEXT,
  
  -- Scope
  is_global BOOLEAN DEFAULT false,
  
  -- Validation
  validation_rules JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, variable_name),
  INDEX idx_variables_org (organization_id),
  INDEX idx_variables_workflow (workflow_template_id)
);

-- ============================================================================
-- AUTOMATION FAILURES & ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workflow_execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
  
  -- Failure details
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  
  -- Context
  input_data JSONB,
  attempted_retry_at TIMESTAMPTZ,
  
  -- Resolution
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_failures_org (organization_id),
  INDEX idx_failures_unresolved (resolved),
  INDEX idx_failures_created (created_at DESC)
);

-- ============================================================================
-- ADMIN ALERTS & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('workflow_failure', 'payment_issue', 'lead_conversion', 'system_error')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT,
  
  -- Context
  related_entity_type TEXT,
  related_entity_id UUID,
  
  -- Status
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_alerts_admin (admin_user_id),
  INDEX idx_alerts_unread (read_at),
  INDEX idx_alerts_severity (severity)
);

-- ============================================================================
-- WORKFLOW MONITORING & ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  
  -- Date bucket (daily aggregation)
  date_bucket DATE NOT NULL,
  
  -- Metrics
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  total_revenue_generated DECIMAL(12,2),
  
  -- Efficiency
  success_rate DECIMAL(5,2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, workflow_template_id, date_bucket),
  INDEX idx_analytics_date (date_bucket),
  INDEX idx_analytics_workflow (workflow_template_id)
);

-- ============================================================================
-- ENHANCE EXISTING PAYMENT TABLE FOR REPORT DELIVERY
-- ============================================================================

ALTER TABLE IF EXISTS payment_transactions ADD COLUMN IF NOT EXISTS
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS payment_transactions ADD COLUMN IF NOT EXISTS
  invoice_url TEXT;

ALTER TABLE IF EXISTS payment_transactions ADD COLUMN IF NOT EXISTS
  email_confirmation_sent_at TIMESTAMPTZ;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_kpi_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_nurture_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;

-- Workflow Templates - Organization isolation
CREATE POLICY "Admin can manage workflow templates"
  ON workflow_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND organization_id = workflow_templates.organization_id
    )
  );

CREATE POLICY "Users can view active workflow templates"
  ON workflow_templates FOR SELECT
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND organization_id = workflow_templates.organization_id
  ));

-- Workflow Executions - Organization isolation
CREATE POLICY "Org members can view executions"
  ON workflow_executions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND organization_id = (
      SELECT organization_id FROM workflow_templates
      WHERE id = workflow_executions.workflow_template_id
    )
  ));

-- Industry KPI Configs - Organization isolation
CREATE POLICY "Admin can manage industry configs"
  ON industry_kpi_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND organization_id = industry_kpi_configs.organization_id
    )
  );

-- Upsell Opportunities - User and admin access
CREATE POLICY "Users can view their own upsells"
  ON upsell_opportunities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all upsells"
  ON upsell_opportunities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ));

-- Lead Nurture Sequences - Admin access
CREATE POLICY "Admin can manage nurture sequences"
  ON lead_nurture_sequences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND organization_id = lead_nurture_sequences.organization_id
    )
  );

-- Workflow Variables - Admin access
CREATE POLICY "Admin can manage workflow variables"
  ON workflow_variables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND organization_id = workflow_variables.organization_id
    )
  );

-- Automation Failures - Admin access
CREATE POLICY "Admin can view failures"
  ON automation_failures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND organization_id = automation_failures.organization_id
    )
  );

-- Admin Alerts - User can view their own alerts
CREATE POLICY "Users can view their own alerts"
  ON admin_alerts FOR SELECT
  USING (admin_user_id = auth.uid());

-- Workflow Analytics - Admin access
CREATE POLICY "Admin can view analytics"
  ON workflow_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND organization_id = workflow_analytics.organization_id
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_templates_org ON workflow_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_industry ON workflow_templates(industry);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status_date ON workflow_executions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_industry_kpi_configs_org ON industry_kpi_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_upsell_converted_date ON upsell_opportunities(converted, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nurture_status_date ON lead_nurture_sequences(status, next_email_scheduled_at);
CREATE INDEX IF NOT EXISTS idx_failures_unresolved_org ON automation_failures(organization_id, resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_date ON admin_alerts(severity, created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Automatically update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workflow_templates_timestamp BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_workflow_executions_timestamp BEFORE UPDATE ON workflow_executions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_industry_kpi_configs_timestamp BEFORE UPDATE ON industry_kpi_configs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_upsell_opportunities_timestamp BEFORE UPDATE ON upsell_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_lead_nurture_sequences_timestamp BEFORE UPDATE ON lead_nurture_sequences
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_workflow_variables_timestamp BEFORE UPDATE ON workflow_variables
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_automation_failures_timestamp BEFORE UPDATE ON automation_failures
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_admin_alerts_timestamp BEFORE UPDATE ON admin_alerts
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_workflow_analytics_timestamp BEFORE UPDATE ON workflow_analytics
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE workflow_templates IS 'PromptStack workflow templates for automated KPI report generation by industry';
COMMENT ON TABLE workflow_executions IS 'Track individual workflow executions with status, input/output, and retry tracking';
COMMENT ON TABLE industry_kpi_configs IS 'Industry-specific KPI definitions, metrics, and pricing configuration';
COMMENT ON TABLE upsell_opportunities IS 'Track post-report upsell opportunities and conversion metrics';
COMMENT ON TABLE lead_nurture_sequences IS 'Automated lead nurturing email sequences with engagement tracking';
COMMENT ON TABLE workflow_variables IS 'Reusable variables across workflow templates with validation rules';
COMMENT ON TABLE automation_failures IS 'Log and track automation failures for manual intervention';
COMMENT ON TABLE admin_alerts IS 'Alert admins about workflow failures, payment issues, and critical events';
COMMENT ON TABLE workflow_analytics IS 'Daily aggregated metrics for workflow performance and revenue tracking';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
