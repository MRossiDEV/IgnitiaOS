import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  getPayPalCustomIdFromEvent,
  getPayPalEventType,
  getPayPalOrderIdFromEvent,
  verifyPayPalWebhookSignature,
} from '@/lib/payments/paypal'

async function findPaymentTransactionId(event: unknown): Promise<string | undefined> {
  const customId = getPayPalCustomIdFromEvent(event)
  if (customId) return customId

  const orderId = getPayPalOrderIdFromEvent(event)
  if (!orderId) return undefined

  const { data } = await supabaseAdmin
    .from('payment_transactions')
    .select('id')
    .eq('reference_id', orderId)
    .maybeSingle()

  return data?.id
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const transmissionId = req.headers.get('paypal-transmission-id')
  const transmissionTime = req.headers.get('paypal-transmission-time')
  const transmissionSig = req.headers.get('paypal-transmission-sig')
  const certUrl = req.headers.get('paypal-cert-url')
  const authAlgo = req.headers.get('paypal-auth-algo')

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    return NextResponse.json({ error: 'Missing PayPal verification headers' }, { status: 400 })
  }

  try {
    const verified = await verifyPayPalWebhookSignature({
      rawBody,
      event,
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid PayPal signature' }, { status: 400 })
    }

    const eventType = getPayPalEventType(event)
    const paymentTransactionId = await findPaymentTransactionId(event)

    if (!paymentTransactionId || !eventType) {
      return NextResponse.json({ received: true, skipped: true })
    }

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const { data: transaction } = await supabaseAdmin
        .from('payment_transactions')
        .select('id, metadata')
        .eq('id', paymentTransactionId)
        .single()

      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'completed' })
        .eq('id', paymentTransactionId)

      const upsellId =
        transaction?.metadata && typeof transaction.metadata === 'object'
          ? (transaction.metadata as Record<string, unknown>).upsell_id
          : undefined

      if (typeof upsellId === 'string' && upsellId.length > 0) {
        await supabaseAdmin
          .from('upsell_opportunities')
          .update({
            converted: true,
            conversion_payment_id: paymentTransactionId,
          })
          .eq('id', upsellId)
      }
    }

    if (
      eventType === 'PAYMENT.CAPTURE.DENIED' ||
      eventType === 'PAYMENT.CAPTURE.DECLINED' ||
      eventType === 'PAYMENT.CAPTURE.REVERSED'
    ) {
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', paymentTransactionId)
    }

    if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'refunded' })
        .eq('id', paymentTransactionId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
