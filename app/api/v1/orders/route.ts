import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createOrder, listOrders, updateOrderStatus, updateOrderPaymentStatus, getOrderAnalytics } from '@/lib/supabase/orders'
import { createWorkflow } from '@/lib/supabase/workflows'
import { WORKFLOW_TEMPLATES } from '@/lib/models/workflow'

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, offerType, daysUntilDue = 5 } = body

    // Get organization from auth or use default
    const orgId = body.organizationId || process.env.DEFAULT_ORGANIZATION_ID

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Get offer pricing
    const offers: any = {
      audit: { min: 249, max: 349 },
      optimization: { min: 500, max: 900 },
      growth_automation: { min: 500, max: 1500 }
    }

    const offer = offers[offerType]
    if (!offer) {
      return NextResponse.json(
        { error: 'Invalid offer type' },
        { status: 400 }
      )
    }

    // Use midpoint pricing
    const amount = Math.round((offer.min + offer.max) / 2)
    const dueDate = new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000)

    // Create order
    const order = await createOrder(orgId, leadId, offerType, amount, dueDate)

    // Create associated workflow
    const workflowType = WORKFLOW_TEMPLATES[offerType]
    const workflow = await createWorkflow(order.id, orgId, workflowType)

    return NextResponse.json(
      { success: true, order, workflow },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders
 * List orders (with optional filters)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('organizationId')
    const status = searchParams.get('status')
    const offerType = searchParams.get('offer_type')

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    const filters: any = {}
    if (status) filters.status = status
    if (offerType) filters.offer_type = offerType

    const orders = await listOrders(orgId, filters)

    return NextResponse.json(
      { success: true, orders },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
