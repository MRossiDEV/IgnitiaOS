# Quick Reference: Restructuring Commands & Checklist

## Quick Setup Commands

### 1. Delete Non-Essential Admin Sections (PowerShell)

```powershell
# Navigate to project directory
cd C:\DEV\ignitia-ai-landing-page

# Delete admin sections
Remove-Item -Path "app\admin\analytics" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\admin\automations" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\admin\content" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\admin\deals" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\admin\funnels" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\admin\partners" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\admin\requests" -Recurse -Force -ErrorAction SilentlyContinue

# Delete API routes
Remove-Item -Path "app\api\audit" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\api\deals" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\api\funnels" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\api\paxum" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\api\templates" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\api\users" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app\api\create-profile" -Recurse -Force -ErrorAction SilentlyContinue

# Delete models
Remove-Item -Path "lib\models\deals.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lib\models\partner.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lib\models\funnels.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lib\models\template.ts" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lib\models\settings.ts" -Force -ErrorAction SilentlyContinue

# Delete mock data
Remove-Item -Path "lib\mock" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup complete! Non-essential files deleted." -ForegroundColor Green
```

---

### 2. Create Required Database Tables (SQL)

Run this in Supabase SQL editor:

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('audit', 'optimization', 'growth_automation')),
  status TEXT NOT NULL DEFAULT 'pending_input' CHECK (status IN ('pending_input', 'in_progress', 'review', 'delivered')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
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

-- Create workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('seo_audit', 'content_optimization', 'automation_setup')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'awaiting_review', 'completed', 'failed')),
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

-- Create order_reports table
CREATE TABLE IF NOT EXISTS public.order_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('seo_audit', 'optimization_report', 'growth_report')),
  content JSONB,
  pdf_url TEXT,
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_organization_id ON orders(organization_id);
CREATE INDEX idx_orders_lead_id ON orders(lead_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_workflows_order_id ON workflows(order_id);
CREATE INDEX idx_workflows_organization_id ON workflows(organization_id);
CREATE INDEX idx_workflows_status ON workflows(status);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for orders
CREATE POLICY "Users can view orders from their org" ON orders
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create orders" ON orders
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create RLS Policies for workflows
CREATE POLICY "Users can view workflows from their org" ON workflows
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workflows" ON workflows
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create RLS Policies for order_reports
CREATE POLICY "Users can view reports from their org" ON order_reports
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

GRANT ALL ON orders TO authenticated;
GRANT ALL ON workflows TO authenticated;
GRANT ALL ON order_reports TO authenticated;
```

---

### 3. Update Leads Table (Remove Unused Columns)

```sql
-- These columns should be removed after migrating any data
-- Run if they exist:
ALTER TABLE leads DROP COLUMN IF EXISTS partner_id CASCADE;
ALTER TABLE leads DROP COLUMN IF EXISTS deal_id CASCADE;
ALTER TABLE leads DROP COLUMN IF EXISTS utm_source CASCADE;
ALTER TABLE leads DROP COLUMN IF EXISTS utm_medium CASCADE;
ALTER TABLE leads DROP COLUMN IF EXISTS utm_campaign CASCADE;
```

---

## Folder Structure Verification

### Check Current Structure

```powershell
# List admin directories
Get-ChildItem -Path "app\admin" -Directory | Select-Object Name

# Should output (keep these):
# leads
# orders       (NEW)
# workflows    (NEW)
# payments
# settings

# Should NOT output:
# analytics
# automations
# content
# deals
# funnels
# partners
# requests
```

### Check API Routes

```powershell
# List API directories
Get-ChildItem -Path "app\api" -Directory | Select-Object Name

# Should have:
# leads        (updated)
# orders       (NEW)
# workflows    (NEW)
# payments     (NEW)
# auth
# health

# Should NOT have:
# audit
# deals
# funnels
# paxum
# templates
# users
```

---

## Implementation Checklist

### Phase 2: Create Offer Pages
- [ ] Create `/app/offers/(audit)/page.tsx`
- [ ] Create `/app/offers/(audit)/form/page.tsx`
- [ ] Create `/app/offers/(optimization)/page.tsx`
- [ ] Create `/app/offers/(optimization)/form/page.tsx`
- [ ] Create `/app/offers/(automation)/page.tsx`
- [ ] Create `/app/offers/(automation)/form/page.tsx`
- [ ] Update `/app/page.tsx` with 3 offer cards
- [ ] Test form → lead creation flow

### Phase 3: Delete Non-Essential Features
- [ ] Run PowerShell cleanup commands (above)
- [ ] Delete remaining mock data references
- [ ] Update `/app/admin/layout.tsx` navigation (remove old links)
- [ ] Test admin navigation works

### Phase 4: Update Leads API
- [ ] Simplify `/app/api/leads/route.ts`
- [ ] Simplify `/app/api/leads/[id]/route.ts`
- [ ] Remove user role complexity

### Phase 5: Payment Integration
- [ ] Create `/app/api/payments/route.ts`
- [ ] Create `/app/api/payments/callback/route.ts`
- [ ] Add Stripe/Payoneer configuration
- [ ] Test payment flow

### Phase 6: Database & Testing
- [ ] Create database tables (run SQL above)
- [ ] Test order CRUD (/api/orders endpoints)
- [ ] Test workflow CRUD (/api/workflows endpoints)
- [ ] Test lead → order → payment flow
- [ ] Run all tests

---

## Testing Commands

### Test Offers API

```bash
# Create order from lead
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "YOUR_LEAD_ID",
    "offerType": "audit",
    "organizationId": "YOUR_ORG_ID"
  }'

# List orders
curl http://localhost:3000/api/orders?organizationId=YOUR_ORG_ID

# Get single order
curl http://localhost:3000/api/orders/ORDER_ID
```

### Test Workflows API

```bash
# Get workflow
curl http://localhost:3000/api/workflows/WORKFLOW_ID

# Update workflow status
curl -X PATCH http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'

# Advance workflow step
curl -X PATCH http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Content-Type: application/json" \
  -d '{
    "advance_step": true,
    "step_data": { "crawl_url": "https://example.com" }
  }'
```

---

## Troubleshooting

### Issue: RLS Policy Errors
**Solution**: Ensure user profile exists and has correct organization_id

```sql
-- Check user profile
SELECT id, organization_id, role FROM user_profiles WHERE id = 'USER_ID';
```

### Issue: Orders Not Showing in Admin
**Solution**: Verify organization_id matches

```sql
-- Check if orders exist
SELECT * FROM orders WHERE organization_id = 'ORG_ID';
```

### Issue: Migration Failing
**Solution**: Check if tables already exist

```sql
-- List existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## Important Files to Review

After restructuring, review these files in order:

1. **Models**: `lib/models/offer.ts`, `order.ts`, `workflow.ts`
2. **Services**: `lib/supabase/orders.ts`, `workflows.ts`
3. **API**: `app/api/orders/route.ts`, `workflows/[id]/route.ts`
4. **Admin**: `app/admin/page.tsx`, `orders/page.tsx`, `workflows/page.tsx`
5. **Public**: `app/page.tsx` (update homepage)

---

## Rollback Plan

If something goes wrong, you can:

1. **Restore from Git**: `git checkout -- <files>`
2. **Delete new tables**: Drop orders, workflows, order_reports tables
3. **Revert admin navigation**: Restore old links in layout
4. **Restore old routes**: Restore deleted admin sections from git

---

## Next Steps

1. ✅ Read `RESTRUCTURING_SUMMARY.md` (executive overview)
2. ✅ Read `CODEBASE_RESTRUCTURING.md` (planning)
3. ✅ Read `RESTRUCTURING_IMPLEMENTATION_GUIDE.md` (detailed steps)
4. → Create database tables (SQL above)
5. → Create offer pages (Phase 2)
6. → Delete old sections (Phase 3, use PowerShell commands)
7. → Test end-to-end flow

---

## Support

For specific questions:
- **Models**: See inline comments in `lib/models/*.ts`
- **APIs**: See inline comments in `app/api/*/route.ts`
- **Admin**: See `app/admin/page.tsx` for KPI logic
- **Database**: See SQL schema above

Good luck! 🚀
