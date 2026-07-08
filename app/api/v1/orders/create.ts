import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { z } from "zod"

const orderSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
  paymentSessionId: z.string().uuid("Invalid payment session ID"),
  source: z.enum(["audit", "optimization", "automation"]),
})

type OrderInput = z.infer<typeof orderSchema>

/**
 * POST /api/orders
 *
 * Creates an order after successful payment
 * - Links order to lead and payment session
 * - Auto-tags by source
 * - Triggers workflow creation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = orderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const data: OrderInput = validation.data

    // Verify lead exists
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, organization_id, email')
      .eq('id', data.leadId)
      .single()

    if (!lead || leadError) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    // Verify payment session exists
    const { data: paymentSession, error: sessionError } = await supabaseAdmin
      .from('payment_sessions')
      .select('id, amount, status')
      .eq('id', data.paymentSessionId)
      .eq('lead_id', data.leadId)
      .single()

    if (!paymentSession || sessionError) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      )
    }

    if (paymentSession.status !== 'completed') {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        organization_id: lead.organization_id,
        lead_id: lead.id,
        payment_session_id: data.paymentSessionId,
        status: 'active',
        type: data.source,
        amount: paymentSession.amount,
        currency: 'USD',
        metadata: {
          source: data.source,
          leadEmail: lead.email,
          createdAt: new Date().toISOString(),
        },
      })
      .select('id, status, type')
      .single()

    if (!order || orderError) {
      console.error("Failed to create order:", orderError)
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      )
    }

    // Update lead status to qualified
    await supabaseAdmin
      .from('leads')
      .update({ status: 'qualified' })
      .eq('id', lead.id)

    // TODO: Auto-create workflow based on source
    // TODO: Send confirmation email

    console.log("Order created successfully:", {
      orderId: order.id,
      leadId: lead.id,
      type: order.type,
    })

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        leadId: lead.id,
        status: order.status,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
