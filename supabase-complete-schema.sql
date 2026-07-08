-- ============================================================================
-- IGNITIA AI - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- PostgreSQL / Supabase
-- Run this in your Supabase SQL Editor
-- 
-- This schema includes:
-- - Core tables (organizations, users, partners, deals, leads, reports)
-- - Payment processing (Paxum/Paxos integration)
-- - Settings and configurations
-- - Funnels and automation
-- - Analytics and audit logs
-- - Row Level Security (RLS) policies
-- - Indexes for performance
-- - Triggers and functions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ORGANIZATIONS & USERS
-- ============================================================================

-- Organizations table (multi-tenancy support)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'partner', 'user', 'api_user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTNERS
-- ============================================================================

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  industry TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- DEALS
-- ============================================================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2),
  payout_trigger TEXT NOT NULL CHECK (payout_trigger IN ('lead', 'sale', 'subscription')),
  redemptions INTEGER DEFAULT 0,
  max_redemptions INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- LEADS
-- ============================================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Lead identity
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  website TEXT,
  industry TEXT,
  message TEXT,
  
  -- Tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source TEXT NOT NULL CHECK (source IN ('audit', 'manual', 'referral', 'campaign')),
  priority TEXT CHECK (priority IN ('hot', 'warm', 'cold')),
  
  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Revenue tracking
  estimated_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  
  assigned_to UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- REPORTS
-- ============================================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Business info
  business_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,

  -- Report details
  type TEXT DEFAULT 'snapshot' CHECK (type IN ('snapshot', 'blueprint')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'delivered')),

  -- AI analysis
  ai_confidence_score INTEGER CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),

  -- Report content (stored as JSONB)
  revenue_model JSONB,
  bottlenecks JSONB,
  benchmarks JSONB,
  recommendations JSONB,
  funnel_model JSONB,
  automation_plan JSONB,

  -- Delivery
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- PAYMENT SESSIONS (Paxum/Paxos Integration)
-- ============================================================================

CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  description TEXT NOT NULL,

  -- Paxos/Paxum specific fields
  ref_id TEXT UNIQUE NOT NULL,
  paxos_payment_id TEXT UNIQUE,
  payment_url TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'expired'
  )),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ============================================================================
-- PAYMENT TRANSACTIONS
-- ============================================================================

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_session_id UUID REFERENCES payment_sessions(id) ON DELETE CASCADE,

  -- Paxos transaction details
  paxos_transaction_id TEXT UNIQUE NOT NULL,
  paxos_payment_id TEXT NOT NULL,

  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT,

  -- Status
  transaction_status TEXT NOT NULL,

  -- Additional data from Paxos
  paxos_response JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOK EVENTS
-- ============================================================================

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  event_type TEXT NOT NULL,
  event_id TEXT UNIQUE,

  -- Related payment
  payment_session_id UUID REFERENCES payment_sessions(id) ON DELETE SET NULL,
  ref_id TEXT,

  -- Payload
  payload JSONB NOT NULL,

  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FUNNELS
-- ============================================================================

CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE funnel_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hero', 'features', 'form', 'testimonial', 'cta')),
  content TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funnel_id, step_order)
);

-- ============================================================================
-- PLATFORM SETTINGS
-- ============================================================================

CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform_name TEXT DEFAULT 'Ignitia AI',
  default_currency TEXT DEFAULT 'USD' CHECK (default_currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  timezone TEXT DEFAULT 'UTC',
  business_verticals TEXT[] DEFAULT ARRAY['Hospitality', 'Tourism', 'Services'],
  logo_url TEXT,
  email_sender TEXT DEFAULT 'no-reply@ignitia.ai',
  report_footer_text TEXT DEFAULT 'Powered by Ignitia AI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- ============================================================================
-- AI TEMPLATES
-- ============================================================================

CREATE TABLE ai_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('free_report', 'paid_report', 'email', 'custom')),
  industry TEXT,
  prompt_template TEXT NOT NULL,
  system_prompt TEXT,
  model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000,
  output_format TEXT DEFAULT 'markdown' CHECK (output_format IN ('markdown', 'html', 'json')),
  placeholders TEXT[] DEFAULT '{}',
  custom_sections JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- REPORT CONFIGURATIONS
-- ============================================================================

CREATE TABLE report_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  free_report_sections TEXT[] DEFAULT ARRAY['revenue_snapshot', 'quick_wins', 'basic_analysis'],
  paid_report_sections TEXT[] DEFAULT ARRAY['revenue_snapshot', 'quick_wins', 'deep_analysis', 'competitor_analysis', 'growth_roadmap', 'implementation_plan'],
  enable_redemption_tracking BOOLEAN DEFAULT true,
  pdf_font_family TEXT DEFAULT 'Inter',
  pdf_primary_color TEXT DEFAULT '#7C3AED',
  pdf_secondary_color TEXT DEFAULT '#1F2937',
  pdf_header_template TEXT,
  pdf_footer_template TEXT,
  enable_upsell BOOLEAN DEFAULT true,
  upsell_message TEXT DEFAULT 'Unlock your complete Growth Blueprint for $500',
  upsell_price DECIMAL(10,2) DEFAULT 500.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- ============================================================================
-- INDUSTRY SETTINGS
-- ============================================================================

CREATE TABLE industry_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  industry_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  report_sections TEXT[] DEFAULT '{}',
  custom_metrics JSONB DEFAULT '[]',
  ai_prompt_overrides TEXT,
  benchmark_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, industry_name)
);

-- ============================================================================
-- PAYMENT SETTINGS
-- ============================================================================

CREATE TABLE payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_api_key_encrypted TEXT,
  stripe_webhook_secret_encrypted TEXT,
  paxum_api_key_encrypted TEXT,
  paxum_email TEXT,
  default_report_price DECIMAL(10,2) DEFAULT 500.00,
  default_commission_type TEXT DEFAULT 'percentage' CHECK (default_commission_type IN ('percentage', 'fixed')),
  default_commission_value DECIMAL(10,2) DEFAULT 20.00,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  vat_rate DECIMAL(5,2) DEFAULT 0.00,
  enable_discounts BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- ============================================================================
-- DISCOUNT CODES
-- ============================================================================

CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- ============================================================================
-- INTEGRATION SETTINGS
-- ============================================================================

CREATE TABLE integration_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email_service TEXT CHECK (email_service IN ('sendgrid', 'mailgun', 'resend', 'ses')),
  email_api_key_encrypted TEXT,
  analytics_service TEXT CHECK (analytics_service IN ('google_analytics', 'plausible', 'matomo')),
  analytics_tracking_id TEXT,
  crm_service TEXT CHECK (crm_service IN ('hubspot', 'salesforce', 'pipedrive')),
  crm_api_key_encrypted TEXT,
  crm_export_enabled BOOLEAN DEFAULT false,
  osint_api_keys JSONB DEFAULT '{}',
  webhook_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- ============================================================================
-- AUTOMATION RULES
-- ============================================================================

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('lead_creation', 'lead_assignment', 'report_generation', 'notification', 'status_change')),
  trigger_event TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- FUNNEL TEMPLATES
-- ============================================================================

CREATE TABLE funnel_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  enable_logging BOOLEAN DEFAULT true,
  enable_audit BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 365,
  system_alerts TEXT[] DEFAULT ARRAY['errors', 'api_failures', 'payment_failures'],
  backup_frequency TEXT DEFAULT 'daily' CHECK (backup_frequency IN ('hourly', 'daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- ============================================================================
-- SUBSCRIPTIONS & BILLING
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- API KEYS & WEBHOOKS
-- ============================================================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & METRICS
-- ============================================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);

-- User Profiles
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Partners
CREATE INDEX idx_partners_organization_id ON partners(organization_id);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_created_at ON partners(created_at DESC);

-- Deals
CREATE INDEX idx_deals_partner_id ON deals(partner_id);
CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);

-- Leads
CREATE INDEX idx_leads_partner_id ON leads(partner_id);
CREATE INDEX idx_leads_deal_id ON leads(deal_id);
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Reports
CREATE INDEX idx_reports_organization_id ON reports(organization_id);
CREATE INDEX idx_reports_lead_id ON reports(lead_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Payment Sessions
CREATE INDEX idx_payment_sessions_organization_id ON payment_sessions(organization_id);
CREATE INDEX idx_payment_sessions_lead_id ON payment_sessions(lead_id);
CREATE INDEX idx_payment_sessions_report_id ON payment_sessions(report_id);
CREATE INDEX idx_payment_sessions_ref_id ON payment_sessions(ref_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX idx_payment_sessions_created_at ON payment_sessions(created_at DESC);

-- Payment Transactions
CREATE INDEX idx_payment_transactions_session_id ON payment_transactions(payment_session_id);
CREATE INDEX idx_payment_transactions_paxos_id ON payment_transactions(paxos_transaction_id);

-- Webhook Events
CREATE INDEX idx_webhook_events_payment_session_id ON webhook_events(payment_session_id);
CREATE INDEX idx_webhook_events_ref_id ON webhook_events(ref_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Funnels
CREATE INDEX idx_funnels_organization_id ON funnels(organization_id);
CREATE INDEX idx_funnels_deal_id ON funnels(deal_id);
CREATE INDEX idx_funnels_status ON funnels(status);

-- Funnel Steps
CREATE INDEX idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);

-- AI Templates
CREATE INDEX idx_ai_templates_organization_id ON ai_templates(organization_id);
CREATE INDEX idx_ai_templates_template_type ON ai_templates(template_type);
CREATE INDEX idx_ai_templates_is_active ON ai_templates(is_active);

-- Automation Rules
CREATE INDEX idx_automation_rules_organization_id ON automation_rules(organization_id);
CREATE INDEX idx_automation_rules_rule_type ON automation_rules(rule_type);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);

-- Subscriptions
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Audit Logs
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Analytics Events
CREATE INDEX idx_analytics_events_organization_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_sessions_updated_at BEFORE UPDATE ON payment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnel_steps_updated_at BEFORE UPDATE ON funnel_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_templates_updated_at BEFORE UPDATE ON ai_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_configurations_updated_at BEFORE UPDATE ON report_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industry_settings_updated_at BEFORE UPDATE ON industry_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at BEFORE UPDATE ON integration_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnel_templates_updated_at BEFORE UPDATE ON funnel_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- User Profiles: Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON user_profiles FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Partners: Organization-scoped access
CREATE POLICY "Users can view their organization's partners"
  ON partners FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert partners in their organization"
  ON partners FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's partners"
  ON partners FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete partners"
  ON partners FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Deals: Organization-scoped access
CREATE POLICY "Users can view their organization's deals"
  ON deals FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage deals in their organization"
  ON deals FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Leads: Organization-scoped access
CREATE POLICY "Users can view their organization's leads"
  ON leads FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage leads in their organization"
  ON leads FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Reports: Organization-scoped access
CREATE POLICY "Users can view their organization's reports"
  ON reports FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage reports in their organization"
  ON reports FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Payment Sessions: Organization-scoped access
CREATE POLICY "Users can view their organization's payment sessions"
  ON payment_sessions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage payment sessions in their organization"
  ON payment_sessions FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Settings tables: Admin-only access
CREATE POLICY "Admins can view platform settings"
  ON platform_settings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Admins can manage platform settings"
  ON platform_settings FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Audit Logs: Read-only for admins
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- ============================================================================
-- USEFUL VIEWS FOR ANALYTICS
-- ============================================================================

-- Partner performance view
CREATE OR REPLACE VIEW partner_performance AS
SELECT
  p.id,
  p.name,
  p.organization_id,
  p.status,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'converted' THEN l.id END) as converted_leads,
  CASE
    WHEN COUNT(DISTINCT l.id) > 0
    THEN ROUND((COUNT(DISTINCT CASE WHEN l.status = 'converted' THEN l.id END)::DECIMAL / COUNT(DISTINCT l.id)::DECIMAL) * 100, 2)
    ELSE 0
  END as conversion_rate,
  COALESCE(SUM(l.actual_value), 0) as total_revenue,
  COUNT(DISTINCT d.id) as active_deals
FROM partners p
LEFT JOIN leads l ON l.partner_id = p.id
LEFT JOIN deals d ON d.partner_id = p.id AND d.status = 'active'
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.organization_id, p.status;

-- Monthly revenue view
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  organization_id,
  DATE_TRUNC('month', converted_at) as month,
  COUNT(*) as conversions,
  SUM(actual_value) as revenue,
  AVG(actual_value) as avg_deal_size
FROM leads
WHERE status = 'converted' AND converted_at IS NOT NULL
GROUP BY organization_id, DATE_TRUNC('month', converted_at)
ORDER BY month DESC;

-- Lead funnel metrics
CREATE OR REPLACE VIEW lead_funnel_metrics AS
SELECT
  organization_id,
  source,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
  COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
  COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost_leads,
  ROUND(AVG(CASE WHEN status = 'converted' THEN actual_value END), 2) as avg_conversion_value
FROM leads
GROUP BY organization_id, source;

-- Report generation metrics
CREATE OR REPLACE VIEW report_metrics AS
SELECT
  organization_id,
  type,
  status,
  COUNT(*) as total_reports,
  ROUND(AVG(ai_confidence_score), 2) as avg_confidence_score,
  COUNT(CASE WHEN sent_at IS NOT NULL THEN 1 END) as delivered_reports
FROM reports
GROUP BY organization_id, type, status;

-- Payment session metrics
CREATE OR REPLACE VIEW payment_metrics AS
SELECT
  organization_id,
  status,
  COUNT(*) as total_sessions,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
FROM payment_sessions
GROUP BY organization_id, status;

-- ============================================================================
-- SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Insert a default organization
INSERT INTO organizations (name, slug, plan, status)
VALUES ('Demo Organization', 'demo-org', 'professional', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Get the organization ID for seed data
DO $$
DECLARE
  org_id UUID;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'demo-org';

  -- Insert default platform settings
  INSERT INTO platform_settings (organization_id, platform_name, default_currency, timezone)
  VALUES (org_id, 'Ignitia AI', 'USD', 'UTC')
  ON CONFLICT (organization_id) DO NOTHING;

  -- Insert default report configuration
  INSERT INTO report_configurations (organization_id)
  VALUES (org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Insert default payment settings
  INSERT INTO payment_settings (organization_id)
  VALUES (org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Insert default integration settings
  INSERT INTO integration_settings (organization_id)
  VALUES (org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Insert default system settings
  INSERT INTO system_settings (organization_id)
  VALUES (org_id)
  ON CONFLICT (organization_id) DO NOTHING;
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE organizations IS 'Multi-tenant organizations/accounts';
COMMENT ON TABLE user_profiles IS 'Extended user profile data linked to Supabase auth.users';
COMMENT ON TABLE partners IS 'Partner/affiliate accounts for referral tracking';
COMMENT ON TABLE deals IS 'Deals and offers managed by partners';
COMMENT ON TABLE leads IS 'Leads captured through various sources (audits, referrals, campaigns)';
COMMENT ON TABLE reports IS 'AI-generated business reports (snapshots and blueprints)';
COMMENT ON TABLE payment_sessions IS 'Payment sessions for Paxum/Paxos integration';
COMMENT ON TABLE payment_transactions IS 'Detailed payment transaction records';
COMMENT ON TABLE webhook_events IS 'Webhook events from payment providers';
COMMENT ON TABLE funnels IS 'Marketing funnels for lead generation';
COMMENT ON TABLE funnel_steps IS 'Individual steps within a funnel';
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings';
COMMENT ON TABLE ai_templates IS 'AI prompt templates for report generation';
COMMENT ON TABLE report_configurations IS 'Report generation and PDF configuration';
COMMENT ON TABLE industry_settings IS 'Industry-specific settings and benchmarks';
COMMENT ON TABLE payment_settings IS 'Payment gateway and pricing configuration';
COMMENT ON TABLE discount_codes IS 'Discount codes for promotions';
COMMENT ON TABLE integration_settings IS 'Third-party integration settings';
COMMENT ON TABLE automation_rules IS 'Automation rules for workflows';
COMMENT ON TABLE funnel_templates IS 'Reusable funnel templates';
COMMENT ON TABLE system_settings IS 'System-level settings and preferences';
COMMENT ON TABLE subscriptions IS 'Stripe subscription data';
COMMENT ON TABLE invoices IS 'Invoice records';
COMMENT ON TABLE api_keys IS 'API keys for external integrations';
COMMENT ON TABLE webhooks IS 'Webhook configurations';
COMMENT ON TABLE audit_logs IS 'Audit trail for all important actions';
COMMENT ON TABLE analytics_events IS 'Analytics and tracking events';

-- ============================================================================
-- ORDERS TABLE (for paid offers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  payment_session_id UUID REFERENCES payment_sessions(id) ON DELETE SET NULL,
  
  -- Order details
  type TEXT NOT NULL CHECK (type IN ('audit', 'optimization', 'automation', 'custom')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  
  -- Delivery tracking
  delivery_started_at TIMESTAMPTZ,
  delivery_completed_at TIMESTAMPTZ,
  expected_completion_at TIMESTAMPTZ,
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT order_lead_organization CHECK (
    lead_id IS NULL OR EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_id AND leads.organization_id = orders.organization_id
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_orders_organization_id ON orders(organization_id);
CREATE INDEX idx_orders_lead_id ON orders(lead_id);
CREATE INDEX idx_orders_payment_session_id ON orders(payment_session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(type);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Comments
COMMENT ON TABLE orders IS 'Customer orders for paid services (audits, optimization, automation)';
COMMENT ON COLUMN orders.type IS 'Type of service: audit, optimization, automation, or custom';
COMMENT ON COLUMN orders.status IS 'Current order status: draft (not paid), pending (payment processing), active (in progress), completed, or cancelled';
COMMENT ON COLUMN orders.delivery_started_at IS 'Timestamp when work began on the order';
COMMENT ON COLUMN orders.delivery_completed_at IS 'Timestamp when order was completed';
COMMENT ON COLUMN orders.expected_completion_at IS 'Estimated completion date';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Next steps:
-- 1. Run this schema in your Supabase SQL Editor
-- 2. Configure environment variables in your application
-- 3. Set up Supabase client in your Next.js app
-- 4. Create API routes to interact with the database
-- 5. Test RLS policies with different user roles
-- 6. Add additional custom policies as needed
-- 7. Set up database backups
-- 8. Configure connection pooling for production
-- 9. Monitor query performance and add indexes as needed
-- 10. Set up database migrations for future schema changes

