# Ignitia AI – Restructuring Implementation Guide

## Phase-by-Phase Implementation

This guide walks you through implementing the PRD-aligned codebase restructure. Follow these steps in order to avoid breaking existing functionality.

---

## PHASE 1: Create New Models & Services ✅ COMPLETED

### New Files Created:
- `lib/models/offer.ts` - Defines the 3 offers
- `lib/models/order.ts` - Order/project model with helpers
- `lib/models/workflow.ts` - Workflow execution model
- `lib/supabase/orders.ts` - Order CRUD operations
- `lib/supabase/workflows.ts` - Workflow CRUD operations
- `app/api/orders/route.ts` - Order API endpoints
- `app/api/orders/[id]/route.ts` - Single order operations
- `app/api/workflows/[id]/route.ts` - Workflow API
- `app/api/workflows/by-order/[orderId]/route.ts` - Find workflow by order
- `app/admin/page.tsx` - Updated dashboard (simplified KPIs)
- `app/admin/orders/page.tsx` - Orders management page
- `app/admin/workflows/page.tsx` - Workflows overview

### What This Provides:
✅ Complete order management system  
✅ Workflow tracking for delivery  
✅ API for order CRUD  
✅ Updated admin dashboard focused on revenue & active projects  

---

## PHASE 2: Restructure Public Website (TODO)

### Steps:
1. Create new offer pages in `/app/offers/`:
   - `/audit/page.tsx` - SEO Audit offer
   - `/optimization/page.tsx` - Website Optimization
   - `/growth-automation/page.tsx` - Monthly Growth service

2. Update homepage (`/app/page.tsx`):
   - Remove wizard (too complex for Phase 0)
   - Add 3 clear offer cards with pricing
   - Add CTA buttons to offer pages

3. Create form pages for each offer:
   - `/audit/form/page.tsx` - Collect lead info + payment
   - `/optimization/form/page.tsx` - Schedule call form
   - `/growth-automation/form/page.tsx` - Schedule call form

### Database Schema Needed:
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  offer_type TEXT NOT NULL CHECK (offer_type IN ('audit', 'optimization', 'growth_automation')),
  status TEXT NOT NULL DEFAULT 'pending_input',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_session_id TEXT,
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  assigned_to UUID REFERENCES user_profiles(id),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  steps JSONB NOT NULL,
  current_step_index INT DEFAULT 0,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add to leads table:
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS associated_order_id UUID REFERENCES orders(id);
```

---

## PHASE 3: Remove Non-Essential Admin Sections (TODO)

These admin sections are NOT needed for Phase 1. Delete them:

### Directories to Delete:
```
/app/admin/analytics/          # Analytics can use orders table later
/app/admin/automations/        # Not needed Phase 1
/app/admin/content/            # Not needed Phase 1
/app/admin/deals/              # Use orders instead
/app/admin/funnels/            # Not needed Phase 1
/app/admin/partners/           # Not needed Phase 1
/app/admin/requests/           # Not needed Phase 1
/app/admin/users/              # Keep only if needed for settings
```

### API Routes to Delete:
```
/app/api/audit                 # Replace with /api/workflows/audit
/app/api/deals                 # Not needed
/app/api/funnels               # Not needed
/app/api/paxum                 # Keep only if actively using payments
/app/api/templates             # Not needed
/app/api/users                 # Keep only if needed
/app/api/create-profile        # Not needed
```

### Models to Delete:
```
/lib/models/deals.ts           # Functionality moved to orders
/lib/models/partner.ts         # Not needed Phase 1
/lib/models/funnels.ts         # Not needed Phase 1
/lib/models/template.ts        # Not needed Phase 1
/lib/models/settings.ts        # Move to admin/settings if needed
```

### Command to Delete (PowerShell):
```powershell
# Remove admin sections
Remove-Item -Path "app/admin/analytics" -Recurse -Force
Remove-Item -Path "app/admin/automations" -Recurse -Force
Remove-Item -Path "app/admin/content" -Recurse -Force
Remove-Item -Path "app/admin/deals" -Recurse -Force
Remove-Item -Path "app/admin/funnels" -Recurse -Force
Remove-Item -Path "app/admin/partners" -Recurse -Force
Remove-Item -Path "app/admin/requests" -Recurse -Force

# Remove API routes
Remove-Item -Path "app/api/audit" -Recurse -Force
Remove-Item -Path "app/api/deals" -Recurse -Force
Remove-Item -Path "app/api/funnels" -Recurse -Force
Remove-Item -Path "app/api/paxum" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/templates" -Recurse -Force
Remove-Item -Path "app/api/users" -Recurse -Force
Remove-Item -Path "app/api/create-profile" -Recurse -Force

# Remove models
Remove-Item -Path "lib/models/deals.ts" -Force
Remove-Item -Path "lib/models/partner.ts" -Force
Remove-Item -Path "lib/models/funnels.ts" -Force
Remove-Item -Path "lib/models/template.ts" -Force
Remove-Item -Path "lib/models/settings.ts" -Force
```

---

## PHASE 4: Simplify Lead & Payment Routes (TODO)

### Update `/app/api/leads/route.ts`:
- Focus on: Create lead, list leads by org
- Remove: Complex filtering, user role checks (admin only for now)

### Create `/app/api/payments/route.ts` (NEW):
- Create payment session
- Verify payment callback
- Update order payment status

### Update `/middleware.ts`:
- Focus on: Auth, admin vs client redirect
- Remove: Complex role-based routing (not needed Phase 1)

---

## PHASE 5: Create Offer Pages (TODO)

### New Directory Structure:
```
/app/offers/
  /(audit)/
    page.tsx                    # Audit landing page
    form/page.tsx              # Audit form → leads
  
  /(optimization)/
    page.tsx                    # Optimization landing page
    form/page.tsx              # Schedule call form
  
  /(automation)/
    page.tsx                    # Automation landing page  
    form/page.tsx              # Schedule call form
```

### Each Offer Page Should Have:
1. Clear headline
2. Problem statement
3. Solution overview
4. Deliverables list
5. Timeline
6. Pricing
7. CTA button ("Get Started", "Schedule Call")
8. Trust elements (testimonials, case studies)

### Form Pages Should:
1. Collect lead information
2. Create lead in database
3. If paid offer (audit): Create payment session → redirect to Stripe
4. If call offer: Create calendar link (Calendly) → show confirmation
5. Send confirmation email

---

## PHASE 6: Database Migration (TODO)

### Steps to Run:
1. Create new tables (orders, workflows)
2. Migrate existing data if needed
3. Update RLS policies for new tables
4. Test all CRUD operations

### RLS Policies for Orders:
```sql
-- Users can see orders from their organization
CREATE POLICY "Users see org orders" ON orders
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Admins can update orders
CREATE POLICY "Admins update orders" ON orders
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));
```

---

## What Stays (Keep These)

✅ Authentication system (Supabase Auth)  
✅ Lead management fundamentals  
✅ User profiles & roles  
✅ Leads table (simplify: remove partner_id, deal_id)  
✅ Payment session basics  
✅ UI components (Radix)  
✅ Middleware  
✅ Env configuration  

---

## File Organization Summary

### Public Facing (Marketing):
```
/app
  /page.tsx                          # Homepage - 3 offers
  /offers/(audit)/page.tsx           # Audit offer
  /offers/(optimization)/page.tsx    # Optimization offer  
  /offers/(automation)/page.tsx      # Automation offer
  /auth/callback/route.ts            # OAuth callback
```

### Admin (Operations):
```
/app/admin
  /page.tsx                          # Dashboard (NEW - simplified)
  /leads                             # Lead CRM (exists, keep)
  /orders                            # Projects (NEW)
  /workflows                         # Delivery (NEW)
  /payments                          # Payment tracking (NEW)
  /settings                          # Admin settings (NEW)
```

### Services:
```
/lib
  /models
    /offer.ts                        # NEW - 3 offers definition
    /order.ts                        # NEW - order model
    /workflow.ts                     # NEW - workflow model
  
  /supabase
    /orders.ts                       # NEW - order CRUD
    /workflows.ts                    # NEW - workflow CRUD
    /leads.ts                        # NEW - simplify lead CRUD
    /payments.ts                     # NEW - payment operations
  
  /workflows                         # NEW - internal delivery tools
    /seo-audit/generator.ts
    /content-optimization/analyzer.ts
```

### API Routes:
```
/app/api
  /leads/                            # Simplify
  /orders/                           # NEW
  /workflows/                        # NEW
  /payments/                         # NEW
```

---

## Success Checklist

- [ ] Database tables created (orders, workflows)
- [ ] New models and services tested
- [ ] Admin dashboard showing correct KPIs
- [ ] Orders management page functional
- [ ] Workflows tracking page works
- [ ] Offer pages created for all 3 offers
- [ ] Lead form → creates order → payment flow works
- [ ] Non-essential admin sections deleted
- [ ] API routes simplified and tested
- [ ] RLS policies configured
- [ ] Email notifications set up
- [ ] All tests passing

---

## Timeline Estimate

- **Phase 1** (New Models/Services): ✅ DONE
- **Phase 2** (Offer Pages): 2-3 days
- **Phase 3** (Remove Clutter): 1 day
- **Phase 4** (Simplify Routes): 1-2 days
- **Phase 5** (Payment Integration): 2 days
- **Phase 6** (Database & Testing): 2 days

**Total: ~1-1.5 weeks for full restructure**

---

## Next Steps

1. **Immediately**: Run Phase 2 (create offer pages)
2. **Day 2**: Run Phase 3 (delete old admin sections)
3. **Day 3-4**: Run Phase 4 & 5 (simplify routes, create forms)
4. **Day 5-6**: Run Phase 6 (database, test everything)
5. **Day 7**: Deploy and monitor

---

## Contact & Support

For questions on specific implementations, see the inline comments in each new file.

Key files to reference:
- `lib/models/offer.ts` - How offers are structured
- `lib/models/order.ts` - Order lifecycle
- `lib/models/workflow.ts` - Workflow execution
- `app/admin/page.tsx` - New dashboard layout
