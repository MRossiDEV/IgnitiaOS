# Ignitia AI PRD - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you get the platform up and running locally.

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account (for payments)
- OpenAI API key
- Resend account (for email)

---

## Step 1: Clone & Install (2 min)

```bash
# Install dependencies
npm install
# or
pnpm install
```

---

## Step 2: Database Setup (3 min)

```bash
# 1. Create Supabase project at supabase.com

# 2. In Supabase dashboard:
#    - Go to SQL Editor
#    - Click "New query"
#    - Copy supabase-prd-schema.sql
#    - Run it

# 3. Verify tables created:
#    - workflow_templates
#    - workflow_executions
#    - industry_kpi_configs
#    - upsell_opportunities
#    - etc.
```

---

## Step 3: Environment Setup (1 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - Supabase URL and keys
# - Stripe API keys
# - OpenAI API key
# - Resend API key
```

---

## Step 4: Run Locally

```bash
# Start development server
npm run dev

# Server will run at http://localhost:3000
```

---

## Step 5: Test the Platform

### Test Landing Page
```bash
# Visit industry landing page
http://localhost:3000/industries/restaurant
```

### Test Report Generation
```bash
# Via API
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "website": "https://example.com",
    "industry": "restaurant",
    "company_name": "Test Restaurant",
    "email": "test@example.com",
    "report_type": "snapshot",
    "premium": false
  }'
```

### Test Admin Dashboard
```bash
# Visit admin dashboard
http://localhost:3000/admin/dashboard

# Visit PromptStack module
http://localhost:3000/admin/promptstack
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase-prd-schema.sql` | Database schema |
| `lib/supabase/types-prd.ts` | TypeScript types |
| `app/industries/[industry]/page.tsx` | Landing pages |
| `app/api/reports/generate/route.ts` | Report API |
| `app/api/workflows/execute/route.ts` | Workflow execution |
| `app/api/admin/workflows/route.ts` | Admin API |
| `app/dashboard/reports/page.tsx` | User dashboard |
| `app/admin/dashboard/page.tsx` | Admin dashboard |
| `app/admin/promptstack/page.tsx` | PromptStack module |
| `lib/email/service.ts` | Email delivery |
| `PRD_IMPLEMENTATION_GUIDE.md` | Full documentation |

---

## 🔗 Industry Landing Pages

Available at `/industries/[industry]`:

- `/industries/restaurant` - Restaurant KPI reports
- `/industries/ecommerce` - E-commerce analytics
- `/industries/realestate` - Real estate metrics

To add a new industry, edit `app/industries/[industry]/page.tsx` and add to `INDUSTRY_CONFIGS`.

---

## 🛠️ API Endpoints

### Reports
```
POST   /api/reports/generate              Create report
GET    /api/reports/[reportId]            Get report status
POST   /api/reports/[reportId]/regenerate Regenerate report
```

### Workflows
```
POST   /api/workflows/execute             Execute workflow
GET    /api/workflows/[workflowId]        Get workflow
```

### Admin
```
GET    /api/admin/workflows               List workflows
POST   /api/admin/workflows               Create workflow
PUT    /api/admin/workflows/[id]          Update workflow
DELETE /api/admin/workflows/[id]          Delete workflow
POST   /api/admin/workflows/[id]/test     Test workflow
GET    /api/admin/dashboard/metrics       Get metrics
```

### Payments
```
POST   /api/payments/checkout             Create checkout session
POST   /api/payments/webhook              Handle Stripe webhook
```

---

## 🧪 Testing

### Test Workflow Execution

1. Go to http://localhost:3000/admin/promptstack
2. Click "New Workflow"
3. Fill in workflow details
4. Create a sample workflow with a prompt block
5. Click "Test" to execute with sample data

### Test Report Generation

```bash
# 1. Submit form on landing page
# 2. Check database for created lead
# 3. Check workflow_executions table for status
# 4. Verify report created in reports table
```

### Test Email Delivery

```bash
# Check Resend dashboard for:
# - Reports sent
# - Bounces
# - Opens/clicks
```

---

## 🔒 Security Notes

1. **Never commit** `.env.local` to git
2. **Always use** SUPABASE_SERVICE_ROLE_KEY on backend only
3. **Enable** Row Level Security on all tables (already done)
4. **Verify** Stripe webhook signatures
5. **Rotate** API keys regularly

---

## 📊 Monitoring

### View Workflow Executions
```sql
SELECT * FROM workflow_executions
ORDER BY created_at DESC
LIMIT 10;
```

### View Failed Reports
```sql
SELECT * FROM automation_failures
WHERE resolved = false;
```

### View Revenue
```sql
SELECT service_type, COUNT(*), SUM(upsell_price)
FROM upsell_opportunities
WHERE converted = true
GROUP BY service_type;
```

---

## 🚀 Next Steps

1. ✅ Set up database
2. ✅ Configure environment
3. ✅ Run locally
4. ✅ Test landing pages
5. ✅ Test report generation
6. ✅ Configure workflows
7. [ ] Set up email sequences
8. [ ] Test payment flow
9. [ ] Deploy to production
10. [ ] Monitor analytics

---

## 📚 Documentation

Full documentation available in:
- `PRD_IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `ADMIN_DASHBOARD_GUIDE.md` - Admin features
- Individual file comments for API details

---

## ❓ FAQ

**Q: Where do I configure industry settings?**
A: Add to `INDUSTRY_CONFIGS` object in `app/industries/[industry]/page.tsx` and seed database via `industry_kpi_configs` table.

**Q: How do I create a new workflow?**
A: Visit `/admin/promptstack`, click "New Workflow", define prompt blocks, test, and publish.

**Q: Can I test payments locally?**
A: Yes, use Stripe test keys and test card numbers from Stripe docs.

**Q: How are reports generated?**
A: User submits form → Workflow executes → OpenAI prompts → KPI data extracted → PDF generated → Email sent.

---

## 🆘 Troubleshooting

**Workflow not executing?**
- Check OpenAI API key
- Verify workflow template is active
- Check automation_failures table for errors

**Emails not sending?**
- Verify Resend API key
- Check email addresses are valid
- Review Resend dashboard

**Payment failing?**
- Verify Stripe keys
- Check webhook configuration
- Ensure webhook URL is public

---

## 💬 Support

For issues or questions:
1. Check PRD_IMPLEMENTATION_GUIDE.md
2. Review error logs in database
3. Check admin dashboard for alerts
4. Review API response messages

---

**Happy coding! 🚀**
