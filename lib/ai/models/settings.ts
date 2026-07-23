// Settings Page Type Definitions

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD"

export interface PlatformSettings {
  id: string
  organizationId: string
  platformName: string
  defaultCurrency: Currency
  timezone: string
  businessVerticals: string[]
  logoUrl?: string
  emailSender: string
  reportFooterText: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// AI TEMPLATES
// ============================================================================

export type TemplateType = "free_report" | "paid_report" | "email" | "custom"
export type OutputFormat = "markdown" | "html" | "json"

export interface AITemplate {
  id: string
  organizationId: string
  name: string
  templateType: TemplateType
  industry?: string
  promptTemplate: string
  systemPrompt?: string
  model: string
  temperature: number
  maxTokens: number
  outputFormat: OutputFormat
  placeholders: string[]
  customSections: CustomSection[]
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface CustomSection {
  id: string
  name: string
  description?: string
  promptAddition?: string
  order: number
}

// ============================================================================
// REPORT CONFIGURATIONS
// ============================================================================

export type ReportSection =
  | "revenue_snapshot"
  | "quick_wins"
  | "basic_analysis"
  | "deep_analysis"
  | "competitor_analysis"
  | "growth_roadmap"
  | "implementation_plan"
  | "revenue_leakage"
  | "conversion_optimization"
  | "seo_analysis"

export interface ReportConfiguration {
  id: string
  organizationId: string
  freeReportSections: ReportSection[]
  paidReportSections: ReportSection[]
  enableRedemptionTracking: boolean
  pdfFontFamily: string
  pdfPrimaryColor: string
  pdfSecondaryColor: string
  pdfHeaderTemplate?: string
  pdfFooterTemplate?: string
  enableUpsell: boolean
  upsellMessage: string
  upsellPrice: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INDUSTRY SETTINGS
// ============================================================================

export interface CustomMetric {
  id: string
  name: string
  description?: string
  unit?: string
  benchmarkValue?: number
}

export interface IndustrySettings {
  id: string
  organizationId: string
  industryName: string
  displayName: string
  description?: string
  reportSections: ReportSection[]
  customMetrics: CustomMetric[]
  aiPromptOverrides?: string
  benchmarkData: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// PAYMENT SETTINGS
// ============================================================================

export type CommissionType = "percentage" | "fixed"

export interface PaymentSettings {
  id: string
  organizationId: string
  stripeApiKeyEncrypted?: string
  stripeWebhookSecretEncrypted?: string
  paxumApiKeyEncrypted?: string
  paxumEmail?: string
  defaultReportPrice: number
  defaultCommissionType: CommissionType
  defaultCommissionValue: number
  taxRate: number
  vatRate: number
  enableDiscounts: boolean
  createdAt: string
  updatedAt: string
}

export type DiscountType = "percentage" | "fixed"

export interface DiscountCode {
  id: string
  organizationId: string
  code: string
  discountType: DiscountType
  discountValue: number
  maxUses?: number
  currentUses: number
  validFrom: string
  validUntil?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// INTEGRATION SETTINGS
// ============================================================================

export type EmailService = "sendgrid" | "mailgun" | "resend" | "ses"
export type AnalyticsService = "google_analytics" | "plausible" | "matomo"
export type CRMService = "hubspot" | "salesforce" | "pipedrive"

export interface IntegrationSettings {
  id: string
  organizationId: string
  emailService?: EmailService
  emailApiKeyEncrypted?: string
  analyticsService?: AnalyticsService
  analyticsTrackingId?: string
  crmService?: CRMService
  crmApiKeyEncrypted?: string
  crmExportEnabled: boolean
  osintApiKeys: Record<string, string>
  webhookUrls: string[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// AUTOMATION RULES
// ============================================================================

export type RuleType =
  | "lead_creation"
  | "lead_assignment"
  | "report_generation"
  | "notification"
  | "status_change"

export interface AutomationRule {
  id: string
  organizationId: string
  ruleName: string
  ruleType: RuleType
  triggerEvent: string
  conditions: Record<string, any>
  actions: AutomationAction[]
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface AutomationAction {
  type: string
  config: Record<string, any>
}

// ============================================================================
// FUNNEL TEMPLATES
// ============================================================================

export interface FunnelStep {
  id: string
  name: string
  type: string
  order: number
  config: Record<string, any>
}

export interface FunnelTemplate {
  id: string
  organizationId: string
  templateName: string
  description?: string
  steps: FunnelStep[]
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export type BackupFrequency = "hourly" | "daily" | "weekly"
export type SystemAlert = "errors" | "api_failures" | "payment_failures"

export interface SystemSettings {
  id: string
  organizationId: string
  enableLogging: boolean
  enableAudit: boolean
  dataRetentionDays: number
  systemAlerts: SystemAlert[]
  backupFrequency: BackupFrequency
  createdAt: string
  updatedAt: string
}

// ============================================================================
// COMBINED SETTINGS (for UI)
// ============================================================================

export interface AllSettings {
  platform: PlatformSettings
  reports: ReportConfiguration
  payments: PaymentSettings
  integrations: IntegrationSettings
  system: SystemSettings
}

// ============================================================================
// FORM INPUTS (for validation)
// ============================================================================

export interface PlatformSettingsInput {
  platformName: string
  defaultCurrency: Currency
  timezone: string
  businessVerticals: string[]
  logoUrl?: string
  emailSender: string
  reportFooterText: string
}

export interface AITemplateInput {
  name: string
  templateType: TemplateType
  industry?: string
  promptTemplate: string
  systemPrompt?: string
  model: string
  temperature: number
  maxTokens: number
  outputFormat: OutputFormat
  placeholders: string[]
  customSections: CustomSection[]
  isActive: boolean
}

export interface ReportConfigurationInput {
  freeReportSections: ReportSection[]
  paidReportSections: ReportSection[]
  enableRedemptionTracking: boolean
  pdfFontFamily: string
  pdfPrimaryColor: string
  pdfSecondaryColor: string
  pdfHeaderTemplate?: string
  pdfFooterTemplate?: string
  enableUpsell: boolean
  upsellMessage: string
  upsellPrice: number
}

export interface IndustrySettingsInput {
  industryName: string
  displayName: string
  description?: string
  reportSections: ReportSection[]
  customMetrics: CustomMetric[]
  aiPromptOverrides?: string
  benchmarkData: Record<string, any>
  isActive: boolean
}

export interface PaymentSettingsInput {
  stripeApiKey?: string
  stripeWebhookSecret?: string
  paxumApiKey?: string
  paxumEmail?: string
  defaultReportPrice: number
  defaultCommissionType: CommissionType
  defaultCommissionValue: number
  taxRate: number
  vatRate: number
  enableDiscounts: boolean
}

export interface IntegrationSettingsInput {
  emailService?: EmailService
  emailApiKey?: string
  analyticsService?: AnalyticsService
  analyticsTrackingId?: string
  crmService?: CRMService
  crmApiKey?: string
  crmExportEnabled: boolean
  osintApiKeys: Record<string, string>
  webhookUrls: string[]
}

export interface AutomationRuleInput {
  ruleName: string
  ruleType: RuleType
  triggerEvent: string
  conditions: Record<string, any>
  actions: AutomationAction[]
  isActive: boolean
  priority: number
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface SettingsResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PreviewResponse {
  preview: string
  tokens: number
  cost: number
  success: boolean
  error?: string
}

