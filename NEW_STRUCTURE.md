# Ignitia AI – New Codebase Structure

## Overview
This document shows the restructured codebase aligned with the PRD. Only the 3 core offers, essential admin operations, and delivery workflows.

---

## Directory Tree (Recommended Structure)

```
ignitia-ai-landing-page/
│
├── app/
│   ├── page.tsx                                    # Homepage - 3 offers
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── (auth)/                                    # Auth pages (hidden from navbar)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── auth/
│   │   ├── callback/route.ts                     # OAuth callback
│   │   └── logout/route.ts
│   │
│   ├── offers/                                    # 3 Productized Services
│   │   ├── (audit)/
│   │   │   ├── page.tsx                          # Audit offer landing
│   │   │   └── form/page.tsx                     # Audit form → payment
│   │   │
│   │   ├── (optimization)/
│   │   │   ├── page.tsx                          # Optimization landing
│   │   │   └── form/page.tsx                     # Schedule call form
│   │   │
│   │   └── (automation)/
│   │       ├── page.tsx                          # Growth automation landing
│   │       └── form/page.tsx                     # Schedule call form
│   │
│   ├── admin/                                     # Founder Operations
│   │   ├── layout.tsx
│   │   ├── page.tsx                              # Dashboard (KPIs, urgent actions)
│   │   │
│   │   ├── leads/                                # Lead CRM
│   │   │   ├── page.tsx                          # Lead list + kanban
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                      # Lead details
│   │   │   └── new/page.tsx                      # Create lead
│   │   │
│   │   ├── orders/                               # Order/Project Management
│   │   │   ├── page.tsx                          # Orders list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                      # Order details + workflow
│   │   │   └── new/page.tsx                      # Create order
│   │   │
│   │   ├── workflows/                            # Delivery Workflow Tracking
│   │   │   ├── page.tsx                          # All workflows
│   │   │   ├── seo-audit/
│   │   │   │   └── [id]/page.tsx                 # Audit generator UI
│   │   │   ├── content-optimization/
│   │   │   │   └── [id]/page.tsx                 # Content optimizer UI
│   │   │   └── automation-setup/
│   │   │       └── [id]/page.tsx                 # Automation setup UI
│   │   │
│   │   ├── payments/                             # Payment Tracking
│   │   │   ├── page.tsx                          # Payment transactions
│   │   │   └── invoices/[id]/page.tsx            # Invoice view
│   │   │
│   │   └── settings/                             # Admin Settings
│   │       └── page.tsx                          # Organization settings
│   │
│   ├── portal/                                    # Client Portal (Phase 1 optional)
│   │   ├── page.tsx                              # Client dashboard
│   │   ├── projects/[id]/page.tsx                # Project details
│   │   └── files/[id]/page.tsx                   # File download
│   │
│   └── api/
│       ├── leads/
│       │   ├── route.ts                          # GET (list), POST (create)
│       │   └── [id]/route.ts                     # GET, PATCH, DELETE
│       │
│       ├── orders/                               # NEW
│       │   ├── route.ts                          # GET, POST
│       │   └── [id]/route.ts                     # GET, PATCH
│       │
│       ├── workflows/                            # NEW
│       │   ├── [id]/route.ts                     # GET, PATCH
│       │   ├── by-order/[orderId]/route.ts      # Get by order
│       │   ├── audit/route.ts                    # Generate audit
│       │   └── status/[id]/route.ts              # Get status
│       │
│       ├── payments/                             # NEW
│       │   ├── route.ts                          # Create payment session
│       │   ├── callback/route.ts                 # Payment webhook
│       │   └── status/[id]/route.ts              # Check payment status
│       │
│       ├── auth/                                 # Keep existing
│       │   └── [provider]/route.ts
│       │
│       └── health/route.ts                       # Health check
│
├── lib/
│   ├── models/                                   # Data Models
│   │   ├── offer.ts                              # NEW - 3 offers definition
│   │   ├── order.ts                              # NEW - order/project model
│   │   ├── workflow.ts                           # NEW - workflow model
│   │   ├── lead.ts                               # Simplify - keep only essentials
│   │   ├── user.ts                               # User profile
│   │   └── payment.ts                            # Payment models
│   │
│   ├── supabase/
│   │   ├── client.ts                             # Keep - browser client
│   │   ├── server.ts                             # Keep - server client
│   │   ├── types.ts                              # Update - remove unused types
│   │   ├── orders.ts                             # NEW - order CRUD
│   │   ├── workflows.ts                          # NEW - workflow CRUD
│   │   ├── leads.ts                              # NEW - simplify lead CRUD
│   │   └── payments.ts                           # NEW - payment operations
│   │
│   ├── auth/                                     # Keep - auth utilities
│   │   ├── supabase-auth.ts
│   │   └── middleware.ts
│   │
│   ├── workflows/                                # NEW - Internal Delivery Tools
│   │   ├── seo-audit/
│   │   │   ├── generator.ts                      # Core audit logic
│   │   │   ├── crawler.ts                        # Website crawler
│   │   │   ├── analyzer.ts                       # AI analysis
│   │   │   └── report-builder.ts                 # PDF generation
│   │   │
│   │   ├── content-optimization/
│   │   │   ├── analyzer.ts                       # Content analysis
│   │   │   ├── generator.ts                      # AI content generation
│   │   │   └── scorer.ts                         # SEO scoring
│   │   │
│   │   └── automation-setup/
│   │       └── setup.ts                          # Automation configuration
│   │
│   ├── validators/                               # Keep - validation schemas
│   │   └── *.ts
│   │
│   ├── utils.ts                                  # Keep - utility functions
│   ├── env.ts                                    # Keep - env config
│   └── constants.ts                              # NEW - app constants
│
├── components/
│   ├── ui/                                       # Keep - Radix UI components
│   │   └── *.tsx
│   │
│   ├── theme-provider.tsx                       # Keep
│   │
│   ├── admin/                                    # Admin-specific components
│   │   ├── leads/
│   │   │   ├── lead-kanban.tsx
│   │   │   ├── lead-card.tsx
│   │   │   └── lead-details.tsx
│   │   │
│   │   ├── orders/                              # NEW
│   │   │   ├── order-table.tsx
│   │   │   ├── order-card.tsx
│   │   │   └── order-form.tsx
│   │   │
│   │   ├── workflows/                           # NEW
│   │   │   ├── workflow-viewer.tsx
│   │   │   ├── step-progress.tsx
│   │   │   └── workflow-control.tsx
│   │   │
│   │   └── reports/                             # NEW
│   │       ├── report-template.tsx
│   │       └── report-editor.tsx
│   │
│   └── marketing/                                # NEW - Landing page components
│       ├── hero.tsx
│       ├── offer-card.tsx
│       ├── trust-section.tsx
│       └── cta-section.tsx
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-toast.ts
│   ├── use-mobile.ts
│   └── use-orders.ts                            # NEW - orders hook
│
├── public/
│   ├── logo.png
│   ├── favicon.ico
│   ├── case-studies/
│   └── testimonials/
│
├── scripts/
│   └── test-supabase-connection.ts
│
├── styles/
│   └── globals.css
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── .env.local                                    # Environment variables
├── middleware.ts                                 # Auth middleware
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
│
├── CODEBASE_RESTRUCTURING.md                    # Restructuring plan
├── RESTRUCTURING_IMPLEMENTATION_GUIDE.md        # Step-by-step guide
└── README.md                                    # Updated docs
```

---

## What to DELETE

### Directories:
```
❌ /app/admin/analytics/
❌ /app/admin/automations/
❌ /app/admin/content/
❌ /app/admin/deals/
❌ /app/admin/funnels/
❌ /app/admin/partners/
❌ /app/admin/requests/
❌ /app/admin/users/ (optional - keep if needed for admin user management)
```

### API Routes:
```
❌ /app/api/audit (replace with workflows)
❌ /app/api/deals
❌ /app/api/funnels
❌ /app/api/paxum (if not using)
❌ /app/api/templates
❌ /app/api/users
❌ /app/api/create-profile
```

### Models:
```
❌ /lib/models/deals.ts
❌ /lib/models/partner.ts
❌ /lib/models/funnels.ts
❌ /lib/models/template.ts
❌ /lib/models/settings.ts
```

### Components:
```
❌ /components/admin/template-*
❌ /components/admin/user-*
❌ /components/settings/*
```

### Mock Data:
```
❌ /lib/mock/* (remove all mock data)
```

---

## What's NEW

### Core Additions:
```
✅ /lib/models/offer.ts
✅ /lib/models/order.ts
✅ /lib/models/workflow.ts
✅ /lib/supabase/orders.ts
✅ /lib/supabase/workflows.ts
✅ /lib/supabase/leads.ts (simplify existing)
✅ /lib/workflows/* (internal tools)
✅ /app/admin/orders/
✅ /app/admin/workflows/
✅ /app/offers/ (all 3 offer pages)
✅ /app/api/orders/
✅ /app/api/workflows/
✅ /app/api/payments/
✅ /components/marketing/
✅ /components/admin/orders/
✅ /components/admin/workflows/
✅ /components/admin/reports/
```

---

## Database Tables

### Keep & Update:
```sql
organizations          -- Keep
user_profiles         -- Keep
leads                 -- Simplify (remove partner_id, deal_id)
payment_sessions      -- Keep
payment_transactions  -- Keep
```

### Add (NEW):
```sql
orders                -- Order/project management
workflows             -- Delivery workflow tracking
order_reports         -- Generated reports
```

### Remove (Migrate data first):
```sql
partners              -- Not needed Phase 1
deals                 -- Functionality moved to orders
funnels               -- Not needed Phase 1
templates             -- Not needed Phase 1
integrations          -- Not needed Phase 1
automations          -- Will use workflows instead
```

---

## Routing Summary

### Public Routes:
| Route | Purpose |
|-------|---------|
| `/` | Homepage (3 offers) |
| `/offers/audit` | Audit offer page |
| `/offers/optimization` | Optimization offer page |
| `/offers/automation` | Growth automation offer page |
| `/login` | Login page |
| `/signup` | Signup page |

### Admin Routes:
| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard (KPIs) |
| `/admin/leads` | Lead management |
| `/admin/orders` | Project/order list |
| `/admin/orders/[id]` | Order details + workflow |
| `/admin/workflows` | All workflows |
| `/admin/workflows/[id]` | Workflow details |
| `/admin/payments` | Payment tracking |
| `/admin/settings` | Admin settings |

### API Routes:
| Endpoint | Purpose |
|----------|---------|
| `POST /api/leads` | Create lead |
| `GET /api/leads` | List leads |
| `PATCH /api/leads/[id]` | Update lead |
| `POST /api/orders` | Create order |
| `GET /api/orders` | List orders |
| `PATCH /api/orders/[id]` | Update order |
| `GET /api/workflows/[id]` | Get workflow |
| `PATCH /api/workflows/[id]` | Update workflow |
| `POST /api/payments` | Create payment session |

---

## Migration Checklist

- [ ] Create database tables (orders, workflows)
- [ ] Create new models and services (Phase 1 complete ✅)
- [ ] Update admin dashboard (Phase 1 complete ✅)
- [ ] Create offer pages
- [ ] Create offer form pages
- [ ] Delete old admin sections
- [ ] Delete old API routes
- [ ] Migrate leads data (if needed)
- [ ] Set up payment integration
- [ ] Test all CRUD operations
- [ ] Set up RLS policies
- [ ] Deploy to staging
- [ ] Test end-to-end workflow
- [ ] Deploy to production

---

## Implementation Timeline

| Phase | Tasks | Days | Status |
|-------|-------|------|--------|
| 1 | Create models & services | - | ✅ DONE |
| 2 | Create offer pages & forms | 2-3 | ⏳ TODO |
| 3 | Delete old sections | 1 | ⏳ TODO |
| 4 | Payment integration | 2 | ⏳ TODO |
| 5 | Database & RLS | 2 | ⏳ TODO |
| 6 | Testing & QA | 1-2 | ⏳ TODO |

**Total: ~1-2 weeks**

---

## Key Files to Reference

After restructuring, key files will be:

**Models & Types:**
- `lib/models/offer.ts` - How offers work
- `lib/models/order.ts` - Order lifecycle
- `lib/models/workflow.ts` - Workflow execution

**Services:**
- `lib/supabase/orders.ts` - Order operations
- `lib/supabase/workflows.ts` - Workflow operations
- `lib/supabase/leads.ts` - Lead CRM

**Admin Pages:**
- `app/admin/page.tsx` - Dashboard
- `app/admin/orders/page.tsx` - Orders list
- `app/admin/workflows/page.tsx` - Workflows

**Public Pages:**
- `app/page.tsx` - Homepage
- `app/offers/[offer]/page.tsx` - Offer pages
- `app/offers/[offer]/form/page.tsx` - Forms

---

This structure is **simple, scalable, and revenue-focused**. Every folder, file, and component serves a clear purpose aligned with the PRD.
