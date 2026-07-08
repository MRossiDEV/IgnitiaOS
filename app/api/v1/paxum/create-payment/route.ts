import { NextRequest, NextResponse } from "next/server"
import { createPaxosPayment } from "@/lib/paxum/client"
import { CreatePaymentRequest, CreatePaymentResponse } from "@/lib/models/payment"

// ============================================================================
// POST /api/paxum/create-payment
// Create a new payment session with Paxos
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: CreatePaymentRequest = await req.json()

    // Validate required fields
    if (!body.amount || !body.currency || !body.description || !body.reportId || !body.leadId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency, description, reportId, leadId" },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Generate unique ref_id
    const timestamp = Date.now()
    const refId = `${body.leadId}-${body.reportId}-${timestamp}`

    // Create payment request for Paxos
    const paxosRequest = {
      amount: body.amount.toFixed(2),
      currency: body.currency,
      description: body.description,
      ref_id: refId,
    }

    // Call Paxos API to create payment
    const paxosResponse = await createPaxosPayment(paxosRequest)

    // TODO: Store payment session in database
    // This would typically involve:
    // 1. Insert into payment_sessions table
    // 2. Store paxos_payment_id, payment_url, ref_id, etc.
    // 3. Set status to 'pending'
    // 4. Set expiration time (24 hours from now)

    // For now, we'll return the response directly
    // In production, you should store this in your database first

    const response: CreatePaymentResponse = {
      paymentSessionId: paxosResponse.id,
      paymentUrl: paxosResponse.payment_url || `https://pay.paxum.com/pay/${paxosResponse.id}`,
      refId: refId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Missing Paxum credentials")) {
        return NextResponse.json(
          { error: "Payment service not configured. Please contact support." },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: "Failed to create payment", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  )
}

