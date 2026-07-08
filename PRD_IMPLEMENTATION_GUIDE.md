# Ignitia AI - PRD Implementation Guide
## Automated KPI Report & Lead Generation Platform

**Version:** Phase 1 - Automation + Admin PromptStack Module  
**Date:** Jan 24, 2026  
**Status:** Implementation Complete (Framework)

---

## 📋 Overview

This document provides a complete implementation guide for the new Ignitia AI platform upgrade, transitioning from a multi-purpose business platform to a fully automated KPI report and lead generation system.

### Key Changes

1. **Core Business Model**: $50-$100 automated KPI reports per industry
2. **User Experience**: Simplified, conversion-focused purchase flow
3. **Admin Tools**: PromptStack module for workflow management
4. **Automation**: 24/7 automated report generation with minimal human intervention
5. **Revenue Growth**: Built-in upsell funnels and lead nurturing

---

## 🗂️ Project Structure

```
app/
├── industries/[industry]/page.tsx          # Industry landing pages
├── dashboard/
│   └── reports/page.tsx                    # User report dashboard
├── admin/
│   ├── dashboard/page.tsx                  # Admin monitoring dashboard
│   └── promptstack/page.tsx                # PromptStack workflow management
├── api/
│   ├── reports/generate/route.ts           # Report generation API
│   ├── workflows/execute/route.ts          # Workflow execution engine
│   ├── admin/workflows/route.ts            # Admin workflow CRUD
│   ├── payments/checkout/route.ts          # Payment processing
│   └── emails/                             # Email delivery APIs
│
lib/
├── supabase/
│   └── types-prd.ts                        # New TypeScript types
└── email/
    └── service.ts                          # Email & nurture sequences

database/
├── supabase-prd-schema.sql                 # New database tables
└── migrations/                             # Schema migration files
```

---

## 🗄️ Database Changes

### New Tables Created

1. **workflow_templates** - PromptStack workflow definitions
2. **workflow_executions** - Track workflow runs and results
3. **industry_kpi_configs** - Industry-specific KPI settings
4. **upsell_opportunities** - Post-report upsell tracking
5. **lead_nurture_sequences** - Automated email sequences
6. **workflow_variables** - Reusable workflow variables
7. **automation_failures** - Error logging and recovery
8. **admin_alerts** - Admin notifications
9. **workflow_analytics** - Performance metrics

### Schema Additions

- `reports.kpi_data` - JSONB field for KPI results
- `reports.html_report_url` - HTML report delivery
- `reports.industry_kpi_config_id` - Link to KPI config
- `reports.workflow_execution_id` - Track execution
- `payment_transactions.report_id` - Link payment to report
- `payment_transactions.invoice_url` - Invoice delivery

**Run Migration:**

```bash
# In Supabase SQL Editor:
# 1. Open supabase-prd-schema.sql
# 2. Copy entire contents
# 3. Run in SQL Editor
# 4. Verify success message
```

---

## 🚀 Core Features Implementation

### 1. Industry Landing Pages

**File:** `app/industries/[industry]/page.tsx`

**Features:**
- Industry-specific hero section with KPI showcase
- Pricing display ($50 snapshot, $100 premium)
- Testimonials with revenue improvements
- Conversion-optimized CTA buttons
- Minimal form capture (3 fields)

**Industries Supported:**
- Restaurant
- E-commerce
- Real Estate

**To Add New Industry:**

```typescript
// Add to INDUSTRY_CONFIGS object
const INDUSTRY_CONFIGS = {
  your_industry: {
    displayName: 'Your Industry',
    hero: '...',
    kpis: [...],
    price: 50,
    premiumPrice: 100,
    testimonials: [...]
  }
}
```

### 2. Automated Report Generation

**File:** `app/api/reports/generate/route.ts`

**Flow:**

```
1. User submits form (website, industry, email)
   ↓
2. Create/retrieve user account
   ↓
3. Create lead record
   ↓
4. Get industry KPI configuration
   ↓
5. Create report (status: 'pending')
   ↓
6. Queue workflow execution
   ↓
7. Return execution ID to user
```

**Usage:**

```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "website": "https://example.com",
    "industry": "restaurant",
    "company_name": "My Restaurant",
    "email": "owner@example.com",
    "report_type": "snapshot",
    "premium": false
  }'

# Response:
{
  "success": true,
  "report_id": "uuid",
  "execution_id": "uuid",
  "status": "pending"
}
```

### 3. PromptStack Workflow Execution

**File:** `app/api/workflows/execute/route.ts`

**Workflow Block Types:**

- **prompt**: Execute OpenAI prompt with variables
- **data_fetch**: Fetch data from external APIs
- **transform**: Transform data with custom logic
- **validate**: Validate data against schema
- **format**: Format for output (JSON, Markdown, PDF)

**Workflow Definition Example:**

```json
{
  "name": "Restaurant KPI Report",
  "industry": "restaurant",
  "prompt_blocks": [
    {
      "id": "1",
      "type": "prompt",
      "name": "Analyze Revenue Metrics",
      "prompt_template": "Analyze {{website}} for restaurant revenue metrics...",
      "system_prompt": "You are a restaurant business analyst...",
      "temperature": 0.7,
      "max_tokens": 2000,
      "output_key": "revenue_metrics"
    },
    {
      "id": "2",
      "type": "prompt",
      "name": "Calculate Performance Scores",
      "prompt_template": "Based on {{revenue_metrics}}, calculate scores...",
      "output_key": "performance_scores"
    }
  ],
  "variables": {
    "website": { "type": "string" },
    "industry": { "type": "string" }
  }
}
```

### 4. Admin PromptStack Module

**File:** `app/admin/promptstack/page.tsx`

**Capabilities:**

- Create/edit/delete workflow templates
- Define and reuse variables
- Test workflows with sample data
- Monitor execution pipeline
- Track failures and retry attempts
- View performance analytics

**Key Endpoints:**

```
GET    /api/admin/workflows                    # List all workflows
POST   /api/admin/workflows                    # Create workflow
PUT    /api/admin/workflows/[id]               # Update workflow
DELETE /api/admin/workflows/[id]               # Delete workflow
POST   /api/admin/workflows/[id]/test          # Test workflow
GET    /api/admin/workflows/executions         # View executions
GET    /api/admin/failures                     # View failures
```

### 5. Payment Processing

**File:** `app/api/payments/checkout/route.ts`

**Supported Providers:**
- Stripe (primary)
- PayPal (future)
- Crypto (future)

**Payment Flow:**

```
1. User clicks "Get Report" or "Upgrade"
   ↓
2. Create payment transaction (status: pending)
   ↓
3. Initialize Stripe checkout session
   ↓
4. User completes payment
   ↓
5. Stripe webhook confirms payment
   ↓
6. Update transaction status → completed
   ↓
7. Send confirmation email
   ↓
8. Trigger upsell opportunity creation
```

**Webhook Handling:**

```typescript
// Stripe events handled:
- checkout.session.completed  → Mark payment complete
- checkout.session.expired    → Mark payment failed
- charge.failed              → Mark payment failed
```

### 6. Email & Lead Nurturing

**File:** `lib/email/service.ts`

**Email Types:**

1. **Report Delivery Email**
   - Sent when report is completed
   - Includes KPI highlights
   - CTA to upgrade to premium

2. **Upsell Email**
   - Sent 24 hours after report delivery
   - Personalized premium service offer
   - $500 premium analysis or consulting

3. **Lead Nurture Sequences**
   - 3-email sequence over 9 days
   - Email 1: Implementation tips (Day 1)
   - Email 2: Success story (Day 4)
   - Email 3: Monthly service offer (Day 7)

**Usage:**

```typescript
// Send report delivery email
await sendReportDeliveryEmail(reportId)

// Send upsell opportunity email
await sendUpsellEmail(upsellId)

// Send lead nurture email
await sendLeadNurtureEmail(sequenceId, stepNumber)

// Schedule all pending emails (run via cron)
await scheduleAutomatedEmails()
```

### 7. Admin Dashboard

**File:** `app/admin/dashboard/page.tsx`

**Metrics Displayed:**

- Total reports (all time)
- Completed reports (success rate)
- Total revenue generated
- Active workflows
- Unresolved failures
- 7-day execution trend
- Revenue by industry
- Top performing workflows
- Recent system alerts

**Real-time Updates:**

- Updates every 30 seconds
- Shows live pipeline status
- Alerts for critical failures

---

## 🔧 Setup Instructions

### 1. Database Setup

```bash
# 1. Create Supabase project
# 2. Copy supabase-prd-schema.sql
# 3. Paste into Supabase SQL Editor
# 4. Run (Ctrl/Cmd + Enter)
# 5. Verify all tables created
```

### 2. Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# APIs
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_key

# Email
EMAIL_FROM=reports@ignitia.ai
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install stripe resend recharts
# or
pnpm add stripe resend recharts
```

### 4. Create Industry Configurations

```sql
-- Insert industry KPI configurations
INSERT INTO industry_kpi_configs (
  organization_id,
  industry,
  kpi_categories,
  kpi_metrics,
  report_sections,
  base_price,
  premium_price
) VALUES (
  'default-org-id',
  'restaurant',
  '{"Revenue", "Operations", "Customer"}',
  '{"avg_spend": {...}, "turnover_rate": {...}}',
  '["revenue_snapshot", "quick_wins", "deep_analysis"]',
  50.00,
  100.00
);
```

### 5. Create Sample Workflows

```sql
-- Insert sample workflow template
INSERT INTO workflow_templates (
  organization_id,
  name,
  industry,
  prompt_blocks,
  variables,
  is_active
) VALUES (
  'default-org-id',
  'Restaurant KPI Report',
  'restaurant',
  '[{"type": "prompt", "name": "Analyze Revenue", ...}]',
  '{"website": {"type": "string"}, "industry": {"type": "string"}}',
  true
);
```

---

## 🚦 User Flows

### Flow 1: Generate Free Report

```
User lands on /industries/restaurant
    ↓
Clicks "Get Your Report Now ($50)"
    ↓
Fills form (company name, website, email)
    ↓
Chooses snapshot vs premium
    ↓
Proceeds to payment
    ↓
Completes Stripe checkout
    ↓
Payment confirmed via webhook
    ↓
Workflow executes (1-5 min)
    ↓
Report completed, email sent
    ↓
User logs in → /dashboard/reports
    ↓
Views report + KPI highlights
    ↓
Sees upsell CTA for premium analysis
```

### Flow 2: Upsell to Premium

```
User receives report delivery email
    ↓
Email includes CTA "Upgrade to Premium"
    ↓
24 hours later: Receives upsell email
    ↓
"Premium Deep Dive Analysis - $500"
    ↓
Clicks "Upgrade"
    ↓
Completes payment
    ↓
Conversion tracked in upsell_opportunities
    ↓
Assigned to expert consultant
```

### Flow 3: Admin Manages Workflows

```
Admin logs in → /admin/promptstack
    ↓
Sees list of active workflows
    ↓
Clicks "New Workflow"
    ↓
Defines workflow name, industry, blocks
    ↓
Adds prompt blocks with variables
    ↓
Tests workflow with sample data
    ↓
Publishes to production
    ↓
Monitors executions via dashboard
```

---

## 📊 Analytics & Monitoring

### Key Metrics to Track

```
1. Report Generation
   - Reports per day/week/month
   - Average generation time
   - Success rate by industry
   - Cost per report (API calls)

2. Revenue
   - Total revenue
   - Revenue per industry
   - Average order value
   - Upsell conversion rate

3. Lead Quality
   - Leads per day
   - Email open rates
   - Click-through rates
   - Conversion funnel

4. Automation Health
   - Workflow success rate
   - Failure recovery rate
   - Execution time trends
   - API error rates

5. User Engagement
   - Report views
   - Dashboard logins
   - Upsell click-through
   - Premium conversion
```

### Accessing Analytics

```bash
# Query workflow analytics
SELECT date_bucket, total_executions, success_rate
FROM workflow_analytics
WHERE organization_id = 'default-org-id'
ORDER BY date_bucket DESC
LIMIT 30;

# Query upsell conversions
SELECT service_type, COUNT(*) as conversions, SUM(upsell_price) as revenue
FROM upsell_opportunities
WHERE converted = true
GROUP BY service_type;
```

---

## 🔐 Security Considerations

### 1. Authentication

- Supabase Auth with email magic links
- Optional OAuth (Google, GitHub)
- Admin-only access to /admin routes
- Role-based access control (RBAC)

### 2. Data Privacy

- Row-level security (RLS) on all tables
- Encryption for sensitive keys
- GDPR-compliant data retention
- Regular backups

### 3. Payment Security

- PCI-DSS compliance via Stripe
- No credit card data stored locally
- Webhook signature verification
- Encrypted transaction records

---

## 🚀 Deployment Checklist

- [ ] Database schema migration run successfully
- [ ] Environment variables configured
- [ ] Industry configurations seeded
- [ ] Sample workflows created and tested
- [ ] Stripe account configured with webhooks
- [ ] Resend email account active
- [ ] OpenAI API key validated
- [ ] Landing pages tested across industries
- [ ] Payment flow tested end-to-end
- [ ] Email delivery tested
- [ ] Admin dashboard verified
- [ ] PromptStack module tested
- [ ] Monitor admin alerts active
- [ ] Analytics queries validated
- [ ] Documentation reviewed

---

## 📈 Phase 2 Features (Future)

- [ ] AI voice bots for upsell calls
- [ ] Multi-user workflow collaboration
- [ ] Version control for workflows
- [ ] Advanced A/B testing framework
- [ ] Subscription model ($99/month)
- [ ] Custom report templates
- [ ] Third-party API integrations
- [ ] Mobile app
- [ ] Video report generation

---

## 🆘 Troubleshooting

### Issue: Workflow Execution Fails

```
Check:
1. OpenAI API key is valid
2. Prompt template variables match input data
3. External APIs are accessible
4. Timeout not exceeded (300s default)

Solution:
- Increase max_retries in workflow template
- Check automation_failures table for details
- Review admin_alerts for error messages
- Test workflow manually via /admin/promptstack
```

### Issue: Emails Not Sending

```
Check:
1. Resend API key configured
2. Email addresses valid
3. No bounces in Resend dashboard
4. Check function logs for errors

Solution:
- Verify RESEND_API_KEY in .env
- Resend emails via /api/emails/test
- Check Resend dashboard for bounces
- Review email_service.ts error handling
```

### Issue: Payment Not Processing

```
Check:
1. Stripe API keys correct
2. Webhook URL configured in Stripe dashboard
3. Webhook signature matches
4. Database connection working

Solution:
- Test Stripe connection in terminal
- Verify webhook secret matches
- Check payment_transactions table for status
- Review Stripe dashboard for failed charges
```

---

## 📞 Support

For questions or issues:

1. Review this implementation guide
2. Check the troubleshooting section
3. Review API documentation in code
4. Check admin alerts and error logs
5. Contact development team

---

**Last Updated:** Jan 24, 2026  
**Version:** 1.0.0 - Initial Release
