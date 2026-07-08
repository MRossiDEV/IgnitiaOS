import { NextRequest, NextResponse } from "next/server"
import { getPaxosPaymentByRefId, mapPaxosStatus } from "@/lib/paxum/client"
import { PaymentStatusResponse } from "@/lib/models/payment"

// ============================================================================
// GET /api/paxum/payment-status?refId=xxx
// Check the status of a payment by ref_id
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // Get refId from query parameters
    const { searchParams } = new URL(req.url)
    const refId = searchParams.get("refId")

    if (!refId) {
      return NextResponse.json({ error: "Missing required parameter: refId" }, { status: 400 })
    }

    // TODO: First check database for payment session
    // This would be more efficient and provide cached data
    // const paymentSession = await getPaymentSessionByRefId(refId)

    // Query Paxos API for payment status
    const paxosPayment = await getPaxosPaymentByRefId(refId)

    if (!paxosPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Map Paxos status to our internal status
    const status = mapPaxosStatus(paxosPayment.status)

    // TODO: Update payment session in database with latest status
    // if (status !== paymentSession.status) {
    //   await updatePaymentSessionStatus(refId, status)
    // }

    const response: PaymentStatusResponse = {
      paymentSessionId: paxosPayment.id,
      status: status as any,
      amount: parseFloat(paxosPayment.amount),
      currency: paxosPayment.currency as any,
      description: "Payment for Ignitia AI Report",
      createdAt: paxosPayment.created_at,
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error checking payment status:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to check payment status", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  )
}

