# Ignitia AI – Codebase Restructuring Guide

## Overview
This document outlines the restructuring of the codebase to align with the PRD. The goal is to remove non-essential features and focus on the core three offers and micro-agency operations.

---

## Key Principles
1. **Single Focus**: Only 3 productized offers
2. **Operational Efficiency**: Admin panel for lead, project, and delivery management
3. **Simple & Fast**: No overengineering
4. **Revenue-First**: Every feature must increase revenue or reduce delivery cost

---

## Current Issues
- Too many admin sections: analytics, audits, automations, content, deals, funnels, leads, partners, payments, reports, requests, settings, users
- Complex user/partner/deal system not aligned with 3-offer model
- Unclear offer structure in frontend
- Unnecessary marketplace/multi-vertical logic

---

## New Directory Structure

### `/app` (Next.js App Router)

#### Public Website
```
/app
  /page.tsx                    # Homepage (3 offers visible)
  
  /(offers)                    # Offer pages (grouped route)
    /audit
      /page.tsx               # SEO Audit offer page
      /form                   # Form submission for audit
      /[sessionId]/page.tsx    # Payment/confirmation
    
    /optimization
      /page.tsx               # Website optimization offer page
      /form                   # Schedule call
    
    /growth-automation
      /page.tsx               # Monthly growth offer page
      /form                   # Schedule call
  
  /portal                      # Minimal client portal (Phase 1 optional)
    /layout.tsx
    /page.tsx                 # Dashboard
    /projects/[id]/page.tsx   # Project details
    /files/[id]/page.tsx      # File download
```

#### Admin - Operational Dashboard
```
/app/admin
  /page.tsx                    # Dashboard (KPIs, urgent actions)
  
  /leads                       # Lead management (core CRM)
    /page.tsx                 # Lead list + kanban
    /[id]/page.tsx            # Lead details + notes
  
  /orders                      # Order/project management (NEW)
    /page.tsx                 # All projects
    /[id]/page.tsx            # Project details + status
    /new/page.tsx             # Create order
  
  /workflows                   # Delivery workflows (NEW)
    /seo-audit
      /[id]/page.tsx          # SEO audit generator UI
    /content-optimization
      /[id]/page.tsx          # Content optimization workflow
    /growth-automation
      /[id]/page.tsx          # Automation setup workflow
  
  /reports                     # Simple reporting
    /templates                # Report templates
    /[reportId]/page.tsx      # View/edit report
  
  /payments                    # Billing & payment tracking
    /page.tsx                 # Payment transactions
    /invoices/[id]/page.tsx  # Invoice view
  
  /settings                    # Admin settings only
    /page.tsx                 # Platform settings
```

#### Authentication
```
/app/auth
  /callback/route.ts          # OAuth callback
  /logout/route.ts            # Logout endpoint

/app/(auth)                    # Auth pages (not in navbar)
  /login/page.tsx
  /signup/page.tsx
  /forgot-password/page.tsx
```

---

### `/lib` (Utilities & Services)

#### Models & Types
```
/lib/models
  /offer.ts                   # Offer definition
  /order.ts                   # Order/project model
  /lead.ts                    # Keep - simplified
  /workflow.ts                # Delivery workflow model
  /report.ts                  # Report template & generation

DELETE:
  - deals.ts
  - partner.ts
  - funnels.ts
  - template.ts (UI template, not report)
  - settings.ts (move to platform settings)
```

#### Supabase Services
```
/lib/supabase
  /client.ts                  # Browser client (unchanged)
  /server.ts                  # Server client (unchanged)
  /types.ts                   # Database types (simplify)
  
  /leads.ts                   # Lead operations (NEW)
  /orders.ts                  # Order operations (NEW)
  /workflows.ts               # Workflow execution (NEW)
  /reports.ts                 # Report generation (NEW)
  /payments.ts                # Payment tracking (NEW)
```

#### Delivery Workflows (Core Business Logic)
```
/lib/workflows                # Internal tools - NOT client-facing
  /seo-audit
    /generator.ts             # Core audit logic
    /crawler.ts               # Website crawler
    /analyzer.ts              # AI analysis
    /report-builder.ts        # PDF/report generation
  
  /content-optimization
    /analyzer.ts              # Content analysis
    /generator.ts             # AI content generation
    /scorer.ts                # SEO scoring
  
  /automation
    /setup.ts                 # Automation configuration
```

#### Other Services
```
/lib/auth                     # Keep existing
/lib/validators              # Keep existing
/lib/utils.ts                # Keep existing
/lib/env.ts                  # Keep existing

DELETE:
  /lib/paxum (if not actively used)
  /lib/mock (remove mock data, use real DB)
```

---

### `/components` (UI Components)

#### Keep
```
/components/ui/*              # Radix UI components (unchanged)
/components/theme-provider.tsx

/components/admin            # Admin-specific components
  /leads                      # Lead management UI
    /lead-kanban.tsx          # Kanban board
    /lead-card.tsx            # Lead card component
  
  /orders                     # Order/project UI (NEW)
    /order-table.tsx
    /order-form.tsx
  
  /workflows                  # Workflow UI (NEW)
    /workflow-viewer.tsx      # Display workflow state
    /audit-generator.tsx      # Audit builder UI
  
  /reports                    # Report UI (NEW)
    /report-template.tsx
    /report-editor.tsx

/components/marketing         # Landing page components (NEW)
  /offer-card.tsx             # Offer display
  /hero.tsx
  /trust-section.tsx
```

#### Remove
```
/components/admin/template-*  # Remove (not needed)
/components/admin/user-*      # Remove (not needed)
/components/settings/*        # Remove (move to /admin/settings)
/components/payment/*         # Simplify
```

---

### `/app/api` (API Routes)

#### Keep & Simplify
```
/app/api
  /auth                       # Keep
  
  /leads                      # Simplify
    /route.ts                 # List & create leads
    /[id]/route.ts            # Get, update lead
  
  /orders                     # NEW - Order/project CRUD
    /route.ts
    /[id]/route.ts
  
  /workflows                  # NEW - Workflow execution
    /audit/route.ts           # Generate audit
    /[id]/route.ts            # Get workflow status
  
  /reports                    # NEW - Report generation
    /[id]/route.ts            # Generate report
  
  /payments                   # NEW - Payment handling
    /initiate/route.ts        # Create payment link
    /callback/route.ts        # Payment webhook
  
  /health/route.ts            # Health check

DELETE:
  /app/api/audit (replace with /workflows/audit)
  /app/api/deals
  /app/api/funnels
  /app/api/partners
  /app/api/templates
  /app/api/users
  /app/api/paxum
  /app/api/create-profile
```

---

### `/public` (Assets)

Keep minimal:
```
/public
  /logo.png
  /favicon.ico
  /case-studies/              # Sample case studies
  /testimonials/              # Testimonial images
```

---

### SQL & Database

```
/supabase-complete-schema.sql  # Simplify:
  Keep: users, organizations, leads, orders (NEW), payments, payment_transactions, user_profiles
  
  Remove tables:
    - partners
    - deals
    - funnels
    - reports (replace with order_reports)
    - templates
    - automations
    - integrations
```

---

## Database Schema Changes

### New `orders` Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  offer_type TEXT NOT NULL, -- 'audit' | 'optimization' | 'growth_automation'
  status TEXT NOT NULL, -- 'pending_input' | 'in_progress' | 'review' | 'delivered'
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  amount NUMERIC NOT NULL,
  payment_status TEXT, -- 'pending' | 'paid' | 'refunded'
  assigned_to UUID, -- user_id (founder)
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Update `leads` Table
```sql
-- Remove: partner_id, deal_id, utm fields (not needed yet)
-- Keep: core fields (name, email, company, website, industry, message)
-- Keep: tracking (status, source, priority, created_at, last_contacted_at)
```

### New `order_reports` Table
```sql
CREATE TABLE order_reports (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  report_type TEXT, -- 'seo_audit' | 'optimization_report' | 'growth_report'
  content JSONB,
  pdf_url TEXT,
  status TEXT, -- 'generating' | 'completed' | 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

## Frontend Route Changes

### Public Routes (Marketing)
- `/` → Homepage (3 offers)
- `/audit` → SEO Audit offer page
- `/optimization` → Optimization offer page
- `/growth-automation` → Monthly growth offer page
- `/auth/callback` → OAuth callback
- `/login`, `/signup`, `/forgot-password` → Auth pages

### Admin Routes (Operations)
- `/admin` → Dashboard (KPIs, urgent actions)
- `/admin/leads` → Lead CRM
- `/admin/orders` → Project management
- `/admin/workflows/seo-audit/[id]` → Audit generator
- `/admin/workflows/optimization/[id]` → Content optimizer
- `/admin/workflows/automation/[id]` → Automation setup
- `/admin/reports` → Reporting
- `/admin/payments` → Payment tracking
- `/admin/settings` → Admin settings

### Client Portal (Phase 1 - Optional)
- `/portal` → Client dashboard
- `/portal/projects/[id]` → Project details
- `/portal/files/[id]` → File download

---

## Phase 1 Implementation Priority

1. ✅ **Database**: Add `orders` table, simplify schema
2. ✅ **Homepage**: Show 3 clear offers with pricing
3. ✅ **Offer Pages**: Form → Payment → Confirmation for Audit
4. ✅ **Admin Dashboard**: KPIs for revenue, active projects, conversion rate
5. ✅ **Lead Management**: Simple kanban + notes
6. ✅ **Order Management**: CRUD for projects
7. ⏳ **SEO Audit Generator**: Internal tool (can be manual initially)
8. ⏳ **Report System**: Template-based PDF generation
9. ⏳ **Payments**: Link generation + tracking

---

## Deletion Checklist

Remove these folders/files:
- [ ] `/app/admin/analytics`
- [ ] `/app/admin/automations`
- [ ] `/app/admin/content`
- [ ] `/app/admin/deals`
- [ ] `/app/admin/funnels`
- [ ] `/app/admin/partners`
- [ ] `/app/admin/requests`
- [ ] `/app/admin/users` (move essential parts to settings)
- [ ] `/app/api/audit` (replace with `/api/workflows/audit`)
- [ ] `/app/api/deals`
- [ ] `/app/api/funnels`
- [ ] `/app/api/paxum`
- [ ] `/app/api/templates`
- [ ] `/app/api/users`
- [ ] `/app/api/create-profile`
- [ ] `/lib/models/deals.ts`
- [ ] `/lib/models/partner.ts`
- [ ] `/lib/models/funnels.ts`
- [ ] `/lib/models/template.ts`
- [ ] `/lib/models/settings.ts`
- [ ] `/lib/mock/*`
- [ ] Various SQL setup files not needed
- [ ] `/components/admin/template-*`
- [ ] `/components/admin/user-*`
- [ ] `/components/settings/*`

---

## What Stays (Core)

✅ Authentication (Supabase Auth)
✅ Leads Management (CRM)
✅ Basic UI Components (Radix)
✅ Payment Handling (Stripe/Payoneer)
✅ Organization Multi-tenancy
✅ Admin Dashboard

---

## Success Criteria

After restructuring, you should have:

1. **Clear product identity**: 3 offers, easy to find on homepage
2. **Lean admin**: Only lead, order, workflow, report, and payment management
3. **Reduced cognitive load**: 80% fewer UI sections to maintain
4. **Foundation for scale**: Workflows are structured for future automation
5. **Fast iteration**: Changes to one offer don't affect others
6. **Revenue clarity**: KPIs show conversion, revenue, delivery time

