/**
 * Orders Service
 * API for order/project management
 */

import { supabaseAdmin } from './server'
import { Order, OrderStatus, PaymentStatus } from '@/lib/ai/models/order'
import { OfferType } from '@/lib/ai/models/offer'

/**
 * Create a new order
 */
export async function createOrder(
  organizationId: string,
  leadId: string,
  offerType: OfferType,
  amount: number,
  dueDate?: Date
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      organization_id: organizationId,
      lead_id: leadId,
      offer_type: offerType,
      status: 'pending_input',
      payment_status: 'pending',
      amount,
      currency: 'USD',
      due_date: dueDate?.toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return data as Order
}

/**
 * Get order by ID with lead details
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      lead:lead_id (
        id, name, email, company, phone, website, industry
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data as Order
}

/**
 * List orders for organization with lead details
 */
export async function listOrders(
  organizationId: string,
  filters?: {
    status?: OrderStatus
    offer_type?: OfferType
    payment_status?: PaymentStatus
  }
): Promise<Order[]> {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      lead:lead_id (
        id, name, email, company, phone, website, industry
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.offer_type) {
    query = query.eq('offer_type', filters.offer_type)
  }
  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data || []) as Order[]
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Order
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentSessionId?: string
): Promise<Order> {
  const updates: any = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString()
  }

  if (paymentSessionId) {
    updates.payment_session_id = paymentSessionId
  }

  if (paymentStatus === 'paid') {
    updates.status = 'in_progress'
    updates.start_date = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Order
}

/**
 * Assign order to team member
 */
export async function assignOrder(
  orderId: string,
  userId: string
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ assigned_to: userId, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Order
}

/**
 * Update order notes
 */
export async function updateOrderNotes(
  orderId: string,
  notes: string
): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Order
}

/**
 * Mark order as delivered (locked until payment received)
 */
export async function markOrderDelivered(orderId: string): Promise<Order> {
  // Verify order payment status first
  const order = await getOrder(orderId)
  if (!order) {
    throw new Error('Order not found')
  }

  if (order.payment_status !== 'paid') {
    throw new Error('Cannot deliver order without payment. Delivery is locked until payment is received.')
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Order
}

/**
 * Get order analytics for dashboard
 */
export async function getOrderAnalytics(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('status, payment_status, amount, due_date')
    .eq('organization_id', organizationId)

  if (error) {
    throw error
  }

  const orders = data || []
  const now = new Date()

  const overdue = orders.filter(o => 
    o.due_date && 
    o.status !== 'delivered' && 
    new Date(o.due_date) < now
  ).length
  
  return {
    total_orders: orders.length,
    completed_orders: orders.filter(o => o.status === 'delivered').length,
    in_progress_orders: orders.filter(o => o.status === 'in_progress').length,
    pending_input_orders: orders.filter(o => o.status === 'pending_input').length,
    overdue_orders: overdue,
    total_revenue: orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.amount || 0), 0),
    pending_payment: orders
      .filter(o => o.payment_status === 'pending')
      .reduce((sum, o) => sum + (o.amount || 0), 0),
  }
}

/**
 * Get overdue orders for organization
 */
export async function getOverdueOrders(organizationId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      lead:lead_id (
        id, name, email, company, phone
      )
    `)
    .eq('organization_id', organizationId)
    .neq('status', 'delivered')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []) as Order[]
}

/**
 * Auto-mark overdue orders (called by background job/cron)
 */
export async function autoMarkOverdueOrders(organizationId: string): Promise<Order[]> {
  const overdueOrders = await getOverdueOrders(organizationId)
  
  if (overdueOrders.length === 0) {
    return []
  }

  // Update orders with overdue status indicator in metadata
  const updatedOrders = await Promise.all(
    overdueOrders.map(order =>
      supabaseAdmin
        .from('orders')
        .update({
          metadata: {
            ...(order.metadata || {}),
            is_overdue: true,
            marked_overdue_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
        .select()
        .single()
    )
  )

  return updatedOrders.map(result => result.data as Order)
}
