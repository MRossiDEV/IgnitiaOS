import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { z } from "zod"

const paymentSessionSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
  source: z.enum(["audit", "optimization", "automation"]),
  amount: z.number().positive("Amount must be positive"),
})

type PaymentSessionInput = z.infer<typeof paymentSessionSchema>

/**
 * POST /api/payments/create-session
 *
 * Creates a payment session and returns payment URL
 * - Validates lead exists
 * - Creates payment session record
 * - Returns Paxum payment link
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = paymentSessionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const data: PaymentSessionInput = validation.data

    // Verify lead exists
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, email, organization_id, name')
      .eq('id', data.leadId)
      .single()

    if (!lead || leadError) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    // Get organization
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('id', lead.organization_id)
      .single()

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    // Generate payment session ID
    const paymentSessionId = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create payment session record
    const { data: paymentSession, error: sessionError } = await supabaseAdmin
      .from('payment_sessions')
      .insert({
        organization_id: org.id,
        lead_id: lead.id,
        amount: data.amount,
        currency: 'USD',
        description: `${data.source.charAt(0).toUpperCase() + data.source.slice(1)} Service - ${org.name}`,
        status: 'pending',
        metadata: {
          source: data.source,
          leadEmail: lead.email,
          leadName: lead.name,
        },
        external_id: paymentSessionId,
      })
      .select('id, external_id, amount, currency')
      .single()

    if (!paymentSession || sessionError) {
      console.error("Failed to create payment session:", sessionError)
      return NextResponse.json(
        { error: "Failed to create payment session" },
        { status: 500 }
      )
    }

    // Generate Paxum payment link
    // TODO: Integrate with actual Paxum/Paxos API
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/${paymentSession.id}?session=${paymentSessionId}&email=${lead.email}&amount=${data.amount}`

    console.log("Payment session created:", {
      sessionId: paymentSession.id,
      leadId: lead.id,
      amount: data.amount,
    })

    return NextResponse.json(
      {
        success: true,
        paymentSessionId: paymentSession.id,
        paymentUrl,
        amount: data.amount,
        currency: 'USD',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating payment session:", error)
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    )
  }
}
