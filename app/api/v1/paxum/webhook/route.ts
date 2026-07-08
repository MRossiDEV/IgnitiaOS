import { NextRequest, NextResponse } from "next/server"
import { WebhookPayload } from "@/lib/models/payment"

// ============================================================================
// POST /api/paxum/webhook
// Handle webhook callbacks from Paxos/Paxum
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (if Paxos provides one)
    const signature = req.headers.get("x-paxos-signature")
    const webhookSecret = process.env.PAXUM_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // TODO: Implement signature verification
      // const isValid = verifyWebhookSignature(await req.text(), signature, webhookSecret)
      // if (!isValid) {
      //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      // }
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json()

    console.log("Received webhook:", payload)

    // Validate payload structure
    if (!payload.event || !payload.data || !payload.data.ref_id) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    // TODO: Store webhook event in database for audit trail
    // await createWebhookEvent({
    //   eventType: payload.event,
    //   refId: payload.data.ref_id,
    //   payload: payload,
    //   processed: false,
    // })

    // Handle different event types
    switch (payload.event) {
      case "payment.completed":
        await handlePaymentCompleted(payload)
        break

      case "payment.failed":
        await handlePaymentFailed(payload)
        break

      case "payment.pending":
        await handlePaymentPending(payload)
        break

      case "payment.cancelled":
        await handlePaymentCancelled(payload)
        break

      default:
        console.warn(`Unhandled webhook event type: ${payload.event}`)
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)

    // Still return 200 to prevent webhook retries for parsing errors
    // Log the error for investigation
    return NextResponse.json({ received: true, error: "Processing error" }, { status: 200 })
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

async function handlePaymentCompleted(payload: WebhookPayload) {
  const { ref_id, payment_amount, payment_id } = payload.data

  console.log(`Payment completed: ${ref_id}, amount: ${payment_amount}`)

  // TODO: Implement the following:
  // 1. Update payment session status to 'completed'
  // 2. Update lead status to 'converted'
  // 3. Unlock the paid report for the user
  // 4. Send confirmation email to user
  // 5. Trigger report generation if not already done
  // 6. Update analytics/metrics

  // Example:
  // await updatePaymentSessionStatus(ref_id, 'completed', payment_id)
  // await unlockPaidReport(ref_id)
  // await sendPaymentConfirmationEmail(ref_id)
}

async function handlePaymentFailed(payload: WebhookPayload) {
  const { ref_id, error } = payload.data

  console.log(`Payment failed: ${ref_id}, error: ${error}`)

  // TODO: Implement the following:
  // 1. Update payment session status to 'failed'
  // 2. Store error message
  // 3. Send failure notification email
  // 4. Log for investigation

  // Example:
  // await updatePaymentSessionStatus(ref_id, 'failed', undefined, error)
  // await sendPaymentFailureEmail(ref_id, error)
}

async function handlePaymentPending(payload: WebhookPayload) {
  const { ref_id } = payload.data

  console.log(`Payment pending: ${ref_id}`)

  // TODO: Update payment session status to 'processing'
  // await updatePaymentSessionStatus(ref_id, 'processing')
}

async function handlePaymentCancelled(payload: WebhookPayload) {
  const { ref_id } = payload.data

  console.log(`Payment cancelled: ${ref_id}`)

  // TODO: Update payment session status to 'cancelled'
  // await updatePaymentSessionStatus(ref_id, 'cancelled')
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
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-paxos-signature",
      },
    }
  )
}

