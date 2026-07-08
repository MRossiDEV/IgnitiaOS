# Orders & Projects Management - API Documentation

## Overview

The Orders & Projects Management system provides complete lifecycle tracking for client projects and deliverables. Orders flow through a defined lifecycle with payment validation, automatic overdue detection, and delivery locks.

## Order Lifecycle

```
Created → Pending Input → In Progress → Review → Delivered
           (awaiting payment or client info)
```

**Key Features:**
- ✅ Automatic overdue detection
- ✅ One-click mark delivered (payment-gated)
- ✅ Delivery locked until payment received
- ✅ Full audit trail with notes and activity log
- ✅ Multi-filter list view with status, offer type, and overdue tracking

---

## Data Models

### Order Status
- `pending_input` - Awaiting client input or payment
- `in_progress` - Work has started (after payment)
- `review` - Ready for review
- `delivered` - Completed and delivered

### Payment Status
- `pending` - Awaiting payment
- `paid` - Payment received (unlocks delivery)
- `refunded` - Payment refunded

### Order Interface
```typescript
interface Order {
  id: string                        // UUID
  organization_id: string           // Organization owner
  lead_id: string                   // Client/lead reference
  offer_type: 'audit' | 'optimization' | 'automation'
  status: OrderStatus
  payment_status: PaymentStatus
  
  // Pricing
  amount: number                    // Order value
  currency: string                  // 'USD'
  payment_session_id?: string       // Linked payment
  
  // Timeline
  start_date?: string               // When work began
  due_date?: string                 // Delivery deadline
  
  // Assignment
  assigned_to?: string              // User ID of team member
  
  // Content
  notes?: string                    // Internal notes
  metadata?: Record<string, any>    // Extensible data
  
  // Timestamps
  created_at: string
  updated_at: string
  delivered_at?: string             // When delivered
}
```

---

## API Endpoints

### GET `/api/orders`
List all orders for organization with optional filters.

**Query Parameters:**
```
- organizationId: string (required)
- status?: 'pending_input' | 'in_progress' | 'review' | 'delivered'
- offer_type?: 'audit' | 'optimization' | 'automation'
- payment_status?: 'pending' | 'paid' | 'refunded'
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "...",
      "organization_id": "...",
      "lead_id": "...",
      "offer_type": "audit",
      "status": "in_progress",
      "payment_status": "paid",
      "amount": 349,
      "currency": "USD",
      "due_date": "2026-02-15T00:00:00Z",
      "lead": {
        "id": "...",
        "name": "Client Name",
        "email": "client@example.com",
        "company": "Client Corp"
      },
      "created_at": "2026-01-24T...",
      "updated_at": "2026-01-24T..."
    }
  ]
}
```

---

### GET `/api/orders/[id]`
Get order details with linked resources.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-123",
    "organization_id": "org-123",
    "lead_id": "lead-123",
    "offer_type": "audit",
    "status": "in_progress",
    "payment_status": "paid",
    "amount": 349,
    "currency": "USD",
    "start_date": "2026-01-24T...",
    "due_date": "2026-02-15T...",
    "assigned_to": "user-123",
    "notes": "Waiting for client feedback on initial recommendations",
    "lead": {
      "id": "lead-123",
      "name": "Sarah Smith",
      "email": "sarah@example.com",
      "company": "Smith Services",
      "phone": "+1-555-0123",
      "website": "https://smithservices.com",
      "industry": "Hospitality"
    },
    "created_at": "2026-01-24T10:00:00Z",
    "updated_at": "2026-01-24T14:30:00Z"
  }
}
```

**Error Responses:**
```json
// Order not found
{ "error": "Order not found" } // 404

// Server error
{ "error": "Failed to fetch order" } // 500
```

---

### PATCH `/api/orders/[id]`
Update order details, payment status, or delivery status.

**Request Body Options:**

#### 1. Update Status
```json
{
  "status": "in_progress"
}
```

#### 2. Update Payment Status
```json
{
  "payment_status": "paid",
  "payment_session_id": "session-123"
}
```
*Note: Setting `payment_status: 'paid'` auto-transitions status to `in_progress` and sets `start_date`*

#### 3. Assign to Team Member
```json
{
  "assigned_to": "user-123"
}
```

#### 4. Update Notes
```json
{
  "notes": "Client provided feedback. Proceeding with Phase 2."
}
```

#### 5. Mark Delivered (Payment-Gated)
```json
{
  "mark_delivered": true
}
```
*Requires: `payment_status === 'paid'`*
*Validation:* Fails with 400 if payment not received
*Sets:* `status: 'delivered'` + `delivered_at` timestamp

#### 6. Multiple Updates
```json
{
  "status": "review",
  "assigned_to": "user-123",
  "notes": "Ready for client review"
}
```

**Success Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-123",
    "status": "delivered",
    "delivered_at": "2026-01-24T15:00:00Z",
    "updated_at": "2026-01-24T15:00:00Z",
    ...
  }
}
```

**Error Responses:**
```json
// Delivery locked - payment pending
{
  "error": "Cannot deliver order without payment. Delivery is locked until payment is received."
} // 400

// Order not found
{ "error": "Order not found" } // 404

// Server error
{ "error": "Failed to update order" } // 500
```

---

### POST `/api/orders`
Create a new order (triggered after payment).

**Request Body:**
```json
{
  "leadId": "lead-123",
  "offerType": "audit",
  "daysUntilDue": 5,
  "organizationId": "org-123"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-new",
    "organization_id": "org-123",
    "lead_id": "lead-123",
    "offer_type": "audit",
    "status": "pending_input",
    "payment_status": "pending",
    "amount": 299,
    "due_date": "2026-01-29T00:00:00Z",
    "created_at": "2026-01-24T...",
    "updated_at": "2026-01-24T..."
  },
  "workflow": { ... }
}
```

---

## Helper Functions (Frontend)

### Order Model Utilities (`lib/models/order.ts`)

```typescript
/**
 * Check if order is overdue
 * Returns true if due_date passed and not delivered
 */
function isOrderOverdue(order: Order): boolean

/**
 * Calculate days remaining/overdue
 * Positive = days left, Negative = days overdue, null = no deadline
 */
function daysRemaining(order: Order): number | null

/**
 * Check if delivery is possible
 * Can only deliver if payment received
 */
function canDeliver(order: Order): boolean

/**
 * Check if delivery is locked
 * Locked if payment unpaid
 */
function isDeliveryLocked(order: Order): boolean

/**
 * Format status for display
 */
function formatOrderStatus(status: OrderStatus): string

/**
 * Get next suggested status in lifecycle
 */
function getNextStatus(status: OrderStatus): OrderStatus | null

/**
 * Get color styling for status
 */
function getStatusColor(status: OrderStatus): {
  bg: string
  text: string
  border: string
}
```

### Orders Service (`lib/supabase/orders.ts`)

```typescript
// Fetch order with lead details
async function getOrder(orderId: string): Promise<Order | null>

// List orders with optional filters
async function listOrders(
  organizationId: string,
  filters?: { status?, offer_type?, payment_status? }
): Promise<Order[]>

// Get overdue orders
async function getOverdueOrders(organizationId: string): Promise<Order[]>

// Update order status
async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>

// Update payment (auto-starts work when paid)
async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentSessionId?: string
): Promise<Order>

// Assign to team member
async function assignOrder(orderId: string, userId: string): Promise<Order>

// Update internal notes
async function updateOrderNotes(orderId: string, notes: string): Promise<Order>

// Mark delivered (validates payment, throws if unpaid)
async function markOrderDelivered(orderId: string): Promise<Order>

// Get dashboard analytics
async function getOrderAnalytics(organizationId: string): Promise<{
  total_orders: number
  completed_orders: number
  in_progress_orders: number
  pending_input_orders: number
  overdue_orders: number
  total_revenue: number
  pending_payment: number
}>

// Auto-mark orders as overdue (background job)
async function autoMarkOverdueOrders(organizationId: string): Promise<Order[]>
```

---

## UI Components

### Orders List Page
**Path:** `/admin/orders`

**Features:**
- Real-time order list with pagination
- Multi-filter sidebar: Status, Offer Type, Overdue-only
- Search by client name, email, company
- Stats cards: Total, Overdue, Awaiting Payment, Delivered
- Status badges with color coding
- Overdue indicator with days remaining/past due
- Payment status at a glance
- Quick-view action buttons

**Filters:**
- Status: All, Pending Input, In Progress, Review, Delivered
- Offer Type: All, Audit, Optimization, Automation
- Overdue Orders: Toggle to show only past-due

**Sorting:** By created date (newest first) with option to sort by due date

---

### Order Detail Page
**Path:** `/admin/orders/[id]`

**Sections:**

#### 1. Header
- Back button and order ID
- Alert flags: Overdue, Payment pending

#### 2. Client Information
- Name, Email, Company, Phone
- Website, Industry

#### 3. Offer Summary
- Offer type badge
- Amount due

#### 4. Status & Timeline
- Status selector dropdown
- Timeline visualization:
  - Created date ✓
  - Started date (after payment)
  - Due date (with days remaining/overdue)
  - Delivered date (if complete)

#### 5. Notes & Activity Log
- Rich text notes editor with save
- Activity log showing key events

#### 6. Payment Status
- Payment badge (Paid/Pending)
- Amount due display
- Payment lock indicator if unpaid

#### 7. Delivery Control
- Status indicator if already delivered
- "Mark Delivered" button (enabled only if paid)
- Delivery lock message if payment pending

#### 8. Linked Items
- Workflow link (future)
- Report link (future)

---

## Best Practices

### 1. Payment Validation
- Always check `isDeliveryLocked()` before enabling delivery button
- Validate payment status server-side before marking delivered
- Display clear messaging about payment requirements

### 2. Overdue Handling
- Run `autoMarkOverdueOrders()` daily via cron job
- Show overdue badge prominently in list view
- Highlight overdue orders in sorted results first

### 3. Status Transitions
- Enforce logical progression: pending_input → in_progress → review → delivered
- Use `getNextStatus()` to guide users to next step
- Show progress indicators in UI

### 4. Audit Trail
- Update `notes` field when significant changes occur
- Use `metadata` for extended tracking data
- Log all PATCH operations with user context

### 5. Error Handling
- Catch delivery lock errors gracefully
- Provide clear error messages to users
- Log errors for debugging

---

## Database Schema

### orders table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID NOT NULL REFERENCES leads(id),
  offer_type TEXT NOT NULL CHECK (offer_type IN ('audit', 'optimization', 'automation')),
  status TEXT NOT NULL DEFAULT 'pending_input',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_session_id UUID REFERENCES payment_sessions(id),
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  CONSTRAINT valid_status CHECK (status IN ('pending_input', 'in_progress', 'review', 'delivered')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);

CREATE INDEX idx_orders_organization_id ON orders(organization_id);
CREATE INDEX idx_orders_lead_id ON orders(lead_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_due_date ON orders(due_date);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

---

## Workflow Integration

When an order is created, it automatically generates a linked workflow:

```typescript
// Order creation triggers workflow
const order = await createOrder(orgId, leadId, offerType, amount, dueDate)
const workflow = await createWorkflow(order.id, orgId, workflowType)

// Workflow templates mapped by offer type:
// - 'audit' → SEO & Revenue Audit workflow
// - 'optimization' → Content Optimization workflow
// - 'automation' → Growth Automation workflow
```

Workflows contain implementation steps, checklist items, and resource links.

---

## Future Enhancements

- [ ] Recurring/subscription orders
- [ ] Invoice generation and tracking
- [ ] Client portal for order status
- [ ] Automated reminders for overdue orders
- [ ] Bulk operations (mark multiple as delivered)
- [ ] Order templates
- [ ] Time tracking per order
- [ ] Profitability analytics
- [ ] Order cloning for similar clients
