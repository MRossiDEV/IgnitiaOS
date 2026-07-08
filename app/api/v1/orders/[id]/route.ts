import { NextRequest, NextResponse } from 'next/server'
import { getOrder, updateOrderStatus, updateOrderPaymentStatus, assignOrder, updateOrderNotes, markOrderDelivered } from '@/lib/supabase/orders'

/**
 * GET /api/orders/[id]
 * Get order details with linked resources
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await getOrder(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, order },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order (status, payment, assignment, notes, delivery)
 * 
 * Body options:
 * - status: Update order status
 * - payment_status: Update payment status
 * - payment_session_id: Link payment session (with payment_status)
 * - assigned_to: Assign to team member
 * - notes: Update order notes
 * - mark_delivered: Mark as delivered (requires payment)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    let order = await getOrder(id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update status
    if (body.status) {
      order = await updateOrderStatus(id, body.status)
    }

    // Update payment status
    if (body.payment_status) {
      order = await updateOrderPaymentStatus(id, body.payment_status, body.payment_session_id)
    }

    // Assign order
    if (body.assigned_to) {
      order = await assignOrder(id, body.assigned_to)
    }

    // Update notes
    if (body.notes !== undefined) {
      order = await updateOrderNotes(id, body.notes)
    }

    // Mark delivered (validates payment first)
    if (body.mark_delivered) {
      try {
        order = await markOrderDelivered(id)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to mark as delivered' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: true, order },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
