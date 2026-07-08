# Admin Dashboard - Command Center

## Overview

The Admin Dashboard is the operational hub of the business. It provides real-time visibility into all critical metrics and actionable items requiring immediate attention.

**Live Dashboard**: `/admin`

## Architecture

### 1. API Endpoint
**Route**: `GET /api/admin/dashboard-analytics`

Fetches comprehensive dashboard data with all KPIs and widget information. This is a secure server-side endpoint that queries the database using Supabase admin client.

**Query Parameters**:
- `organizationId` (required): UUID of the organization

**Response**:
```json
{
  "kpis": {
    "todayRevenue": 1250.50,
    "mtdRevenue": 28450.00,
    "activeOrders": 7,
    "ordersOverdue": 2,
    "pendingPayments": 3500.00
  },
  "widgets": {
    "ordersNeedingAction": [...],
    "leadsNotContacted": [...]
  },
  "timestamp": "2024-01-24T15:30:00.000Z"
}
```

### 2. Data Sources

All KPIs are calculated from real database tables:

#### Orders Table
- **Table**: `orders`
- **Key fields**: `status`, `amount`, `completed_at`, `expected_completion_at`, `delivery_started_at`, `lead_id`
- **Statuses**: `draft`, `pending`, `active`, `completed`, `cancelled`

#### Payment Sessions Table
- **Table**: `payment_sessions`
- **Key fields**: `status`, `amount`, `created_at`
- **Statuses**: `pending`, `processing`, `completed`, `failed`, `cancelled`, `expired`

#### Leads Table
- **Table**: `leads`
- **Key fields**: `status`, `last_contacted_at`, `created_at`, `email`, `name`
- **Statuses**: `new`, `contacted`, `qualified`, `converted`, `lost`

## KPIs Explained

### 1. Today's Revenue
**Query**: Orders with `status='completed'` and `completed_at` between today 00:00 and 23:59
- **Color**: Green (success)
- **Icon**: Dollar Sign
- **Use**: Track daily revenue performance

### 2. Month-to-Date (MTD) Revenue
**Query**: Orders with `status='completed'` and `completed_at` from 1st of month to current date
- **Color**: Green (success)
- **Icon**: Trending Up
- **Use**: Track monthly revenue progress toward targets

### 3. Active Orders
**Query**: Orders with `status` IN ('active', 'pending')
- **Color**: Default/Blue
- **Icon**: Trending Up
- **Use**: Count of orders currently in progress or awaiting payment

### 4. Orders Overdue
**Query**: Orders with `status != 'completed'` AND `expected_completion_at < today`
- **Color**: Red (danger) if > 0, Green otherwise
- **Icon**: Alert Circle
- **Use**: Identify delivery SLA violations

### 5. Pending Payments
**Query**: Payment Sessions with `status` NOT IN ('completed', 'failed')
- **Color**: Amber (warning) if > 0, Green otherwise
- **Icon**: Dollar Sign
- **Use**: Total amount awaiting payment collection

## Widgets

### Orders Needing Action Widget
Displays up to 10 orders requiring immediate attention, with priority given to:
1. Orders not yet started (`delivery_started_at IS NULL`)
2. Overdue orders (`expected_completion_at < today`)

**Actions**:
- Click to view order details
- See lead information
- Identify status and timeline
- Quick filters: "Not Started", "Overdue"

**Data Fields**:
- Order Type (Audit, Optimization, Automation)
- Status Badge
- Lead Name & Email
- Amount
- Due Date
- Badges for priority issues

### Leads Not Contacted (48h+) Widget
Displays up to 10 leads that haven't been contacted in 48+ hours or have never been contacted.

**Filters**:
- Excludes `converted` and `lost` leads
- Orders by `last_contacted_at` (nulls first)

**Data Fields**:
- Lead Status (New, Contacted, Qualified, etc.)
- Days Since Contact (displays "Never" if never contacted)
- Lead Name
- Email Address
- Date Added to System

**Actions**:
- Click to contact lead
- View lead details
- Log interaction

## Components

### 1. KPI Cards (`components/admin/kpi-cards.tsx`)
Reusable KPI card components with:
- Dynamic color coding
- Trend indicators (optional)
- Custom icons
- Formatted values (currency, thousands separator)

**Exported Components**:
- `KPICard` - Generic card
- `TodayRevenueCard`
- `MTDRevenueCard`
- `ActiveOrdersCard`
- `OrdersOverdueCard`
- `PendingPaymentsCard`

### 2. Orders Widget (`components/admin/orders-widget.tsx`)
Displays orders requiring action with:
- Status and priority badges
- Lead information
- Amount and due date
- Loading and empty states
- Link to order details page

### 3. Leads Widget (`components/admin/leads-widget.tsx`)
Displays leads not contacted with:
- Contact history indicator
- Status classification
- Lead details
- Loading and empty states
- Link to lead details page

## Features

### Auto-Refresh
- Dashboard auto-refreshes every 5 minutes
- Manual refresh button available
- Shows last refresh timestamp
- Smooth loading states during refresh

### Responsive Design
- Mobile-optimized layout (1 column on mobile, 5 columns on desktop)
- Touch-friendly interactive elements
- Optimized widget layout for all screen sizes

### Error Handling
- Graceful error messages if fetch fails
- Retry button for failed loads
- Fallback UI states

### Loading States
- Skeleton loaders for KPI cards
- Animated loading indicators
- Empty state messages with guidance

## Usage

### Fetching Dashboard Data

```typescript
// Client-side fetch
const response = await fetch(`/api/admin/dashboard-analytics?organizationId=${orgId}`)
const data = await response.json()

// Access data
const {
  kpis: { todayRevenue, mtdRevenue, activeOrders, ordersOverdue, pendingPayments },
  widgets: { ordersNeedingAction, leadsNotContacted }
} = data
```

### Updating KPIs
The API calculates KPIs dynamically on each request. No manual updates needed.

To refresh in UI:
```typescript
const [data, setData] = useState(null)

const refresh = async () => {
  const response = await fetch(`/api/admin/dashboard-analytics?organizationId=${orgId}`)
  const newData = await response.json()
  setData(newData)
}
```

## Performance Considerations

### Database Queries
- **Indexed fields used**: `organization_id`, `status`, `created_at`, `completed_at`, `expected_completion_at`
- **Query complexity**: O(n) scans but limited by status filters
- **Typical response time**: < 500ms for most organizations

### Optimization Tips
1. Dashboard data is fetched only on mount and with manual refresh
2. Auto-refresh interval is 5 minutes (configurable)
3. No real-time updates (polling-based)
4. Consider adding Redis caching for high-traffic dashboards

## Future Enhancements

1. **Real-time Updates**: WebSocket connection for live metric updates
2. **Custom Dashboards**: Allow users to configure widgets
3. **Historical Trends**: Charts showing revenue trends over time
4. **Predictive Analytics**: Forecast next month's revenue
5. **Alerts**: Email/SMS notifications for critical events
6. **Export Reports**: Download dashboard data as PDF/CSV
7. **Team Views**: Personalized dashboards per team member
8. **Drilldowns**: Click through to detailed reports
9. **Comparisons**: Week-over-week and month-over-month comparisons
10. **Goals & Targets**: Set and track against KPI targets

## Troubleshooting

### No Data Showing
1. Check if organization ID is correctly set
2. Verify database has orders/leads/payments
3. Check browser console for API errors
4. Verify RLS policies allow user to see data

### Stale Data
1. Click Refresh button
2. Wait for auto-refresh (5 minutes)
3. Check network tab for API errors
4. Clear browser cache and reload

### Slow Loading
1. Check network connection
2. Verify database is responsive
3. Check if there are many pending/active orders
4. Consider increasing refresh interval

## Related Files

- [API Endpoint](app/api/admin/dashboard-analytics/route.ts)
- [Admin Page](app/admin/page.tsx)
- [KPI Components](components/admin/kpi-cards.tsx)
- [Orders Widget](components/admin/orders-widget.tsx)
- [Leads Widget](components/admin/leads-widget.tsx)
- [Database Schema](supabase-complete-schema.sql)
