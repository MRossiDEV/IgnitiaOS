# Orders Management - Quick Reference

## Common Tasks

### View All Orders
**URL:** `/admin/orders`

**What you can do:**
- See list of all orders with key info
- Filter by status, offer type, or overdue
- Search by client name/email/company
- View statistics: total, overdue, pending payment, delivered
- Click any order to see details

---

### View Order Details
**URL:** `/admin/orders/[order-id]`

**Left panel - Information:**
- Client details (name, email, company, phone)
- Offer type and amount
- Status and timeline
- Internal notes

**Right panel - Actions:**
- **Payment status** - See if paid or pending
- **Current status** - View status badge
- **Mark Delivered** button:
  - ✅ Enabled if payment received
  - ❌ Disabled if payment pending (shows lock message)
- Linked items (workflow, reports)

---

## Status Changes

### Moving Through Lifecycle

```
Pending Input (awaiting client info or payment)
           ↓
In Progress (work started - happens auto when paid)
           ↓
Review (work complete, waiting for approval)
           ↓
Delivered (completed)
```

**To change status:**
1. Open order detail page
2. Find "Status & Timeline" card
3. Click status dropdown
4. Select new status
5. Click Save (auto-saves)

---

## Payment-Gated Delivery

### Why Delivery is Locked

Delivery button is **disabled** when:
- Payment status = "Pending"

Delivery button is **enabled** when:
- Payment status = "Paid" AND
- Status ≠ "Delivered"

### How Payment Unlocks Delivery

```
1. Order created → status = pending_input, payment = pending
2. Customer pays → payment = paid (auto-triggered)
3. Status auto-changes → in_progress
4. Continue work... → change to review
5. Click "Mark Delivered" → ✓ Delivered (because paid)
```

### If Payment Still Pending

Alert message shows:
```
⚠️ Payment Pending
Delivery is locked until payment is received.
Current amount due: $350
```

---

## Overdue Orders

### Automatic Detection

Orders are **automatically marked overdue** if:
- Due date has passed AND
- Status ≠ "Delivered"

### Identifying Overdue Orders

**In list view:**
- Red overdue alert icon
- Red date with "X days overdue"
- "Overdue Only" filter shows just these

**In detail view:**
- Red alert at top
- Details show days overdue
- Due date highlighted in red

### Overdue Actions

1. Prioritize overdue orders (sort first)
2. Check timeline to see if delayed
3. Update status to reflect current work
4. Add notes if blocked by client
5. Contact client if needed

---

## Updating Order Status

### Step-by-step

1. Open order
2. Find "Status & Timeline" card
3. Click dropdown showing current status
4. Select new status from options:
   - Awaiting Client Input
   - In Progress
   - Under Review
   - Delivered
5. Status updates immediately

### Status Options Explained

| Status | Meaning | Who sets it |
|--------|---------|------------|
| **Awaiting Client Input** | Waiting for client info or payment | Manual or default |
| **In Progress** | Work has started (auto when paid) | Manual or auto-on-payment |
| **Under Review** | Waiting for approval/feedback | Manual |
| **Delivered** | Complete (one-click or manual) | One-click button |

---

## One-Click Delivery

### Fastest Way to Mark Done

**If payment received:**
1. Open order
2. Find delivery card (right panel)
3. Click "Mark Delivered" button
4. ✓ Done! Status changes to delivered, timestamp recorded

**If payment NOT received:**
- Button is disabled
- Shows lock message
- Must receive payment first

---

## Notes & Activity

### Adding Notes

1. Find "Notes & Activity Log" card
2. Click textarea
3. Type your note (max ~500 chars typically)
4. Click "Save Notes"
5. Note is saved to order

### What Notes Are For

- Track blockers
- Record client requests
- Note version changes
- Document decisions
- Flag issues

**Examples:**
- "Waiting for client logo - emailed request"
- "Phase 1 complete, client approved to proceed"
- "Delayed due to missing website access"

---

## Statistics & Analytics

### The 4 Stats Cards

| Card | Meaning |
|------|---------|
| **Total Orders** | All orders in your account |
| **Overdue** | Orders past their due date (not yet delivered) |
| **Awaiting Payment** | Orders where payment hasn't been received |
| **Delivered** | Orders marked complete |

### Using Stats

- Total Orders: Track workload
- Overdue: Identify at-risk projects
- Awaiting Payment: See revenue pending
- Delivered: Track completion rate

---

## Filtering Orders

### Filter Types

**Status Filter:**
- All Statuses
- Awaiting Client Input
- In Progress
- Under Review
- Delivered

**Offer Type Filter:**
- All Offers
- SEO & Revenue Audit
- Content Optimization
- Growth Automation

**Special Filter:**
- Overdue Only (toggle button)

### Search

Type to search by:
- Client name
- Client email
- Client company name

---

## Common Scenarios

### Scenario 1: Payment Just Received
```
1. Find order in list (may say "Pending Payment")
2. Note payment status changed to "Paid"
3. Status auto-changed to "In Progress"
4. Update notes: "Payment received, starting work"
5. Begin work according to workflow
```

### Scenario 2: Order Is Overdue

```
1. See red alert "Order Overdue"
2. Check timeline - why delayed?
3. If blocked by client: Add note explaining
4. If your delay: Update status to current progress
5. Contact client if needed
```

### Scenario 3: Completing an Order

```
1. Status is "Under Review" (client approving)
2. Client approves delivery
3. Click "Mark Delivered" button
4. ✓ Order marked complete with timestamp
5. Move to next project
```

### Scenario 4: Client Hasn't Paid

```
1. Order showing "Pending" payment status
2. "Mark Delivered" button is disabled
3. Yellow alert explains: "Delivery is locked until payment"
4. Chase payment
5. Once paid: status auto-updates, button enables
6. Can then deliver
```

---

## Keyboard Shortcuts

Not yet implemented, but planned:

- `D` - Open order details
- `S` - Change status
- `P` - View payment info
- `M` - Mark delivered (if able)

---

## Performance Tips

### For Large Order Lists

1. Use filters to narrow down
2. Sort by due date (overdue first)
3. Use search to find specific clients
4. Overdue toggle shows only urgent items

### For Long Order Details

1. Scroll to relevant section
2. Use browser Find (Ctrl+F) to search page
3. Sections: Info, Offer, Status, Notes, Payment, Delivery, Links

---

## Troubleshooting

### Order Not Showing Up

- Check if it was deleted
- Verify organization filter
- Search by client name
- Check if order status is "Delivered" (may be archived)

### Can't Mark Delivered

- ❌ Payment pending? Must receive payment first
- ❌ Order already delivered? Can't deliver twice
- ❌ Server error? Refresh page and try again

### Status Won't Change

- Page may be loading (look for spinner)
- Check if status is valid transition
- Refresh if stuck
- Contact support if persists

### Notes Didn't Save

- Check internet connection
- Look for error message
- Try saving again
- Refresh page if still stuck

---

## Best Practices

### Daily Routine
1. **Morning:** Check "Overdue Only" filter
2. **Throughout day:** Update statuses as work progresses
3. **When blocked:** Add note explaining why
4. **On completion:** One-click mark delivered (if paid)
5. **End of day:** Review payment pending list

### Client Communication
- Add note before status changes
- Mention key blockers in notes
- Update status when client provides info
- Send delivery confirmation after marking complete

### Payment Flow
- Track payment status in stats
- Know amount pending from "Awaiting Payment"
- Don't mark delivered without payment
- Follow up on overdue payments

---

## Integration Points

### Linked to Other Systems

**Workflow:**
- Created when order is created
- Contains implementation steps
- View from order detail (future)

**Reports:**
- Generated per order
- Linked from order detail
- Used in delivery

**Payments:**
- Linked via payment_session_id
- Status synced with payment
- Validates before delivery

---

## Data You Have Access To

Per Order:
- Order ID (unique identifier)
- Client name, email, company, phone
- Offer type (what they bought)
- Amount (what they paid)
- Status (where in lifecycle)
- Payment status (paid/pending)
- Dates (created, started, due, delivered)
- Notes (your internal comments)
- Assigned to (who's working on it)

---

## Contact Support

For issues or questions:
1. Check this guide first
2. Review the detailed docs: `ORDERS_MANAGEMENT_GUIDE.md`
3. Refresh page and try again
4. Contact development team if bug

---

**Last Updated:** January 24, 2026
**Version:** 1.0 - Initial Release
