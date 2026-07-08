import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { capturePayPalOrder } from '@/lib/payments/paypal'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
  const orderId = req.nextUrl.searchParams.get('token')
  const paymentSessionIdFromQuery = req.nextUrl.searchParams.get('payment_session_id')

  if (!orderId) {
    return NextResponse.redirect(new URL(`${appUrl}/payment/cancelled?reason=missing_order_token`))
  }

  try {
    const capture = await capturePayPalOrder(orderId)

    const capturedSessionId =
      paymentSessionIdFromQuery ||
      capture.purchase_units?.[0]?.custom_id ||
      undefined

    if (capturedSessionId) {
      const { data: transaction } = await supabaseAdmin
        .from('payment_transactions')
        .select('id, metadata')
        .eq('id', capturedSessionId)
        .single()

      await supabaseAdmin
        .from('payment_transactions')
        .update({
          status: 'completed',
          reference_id: orderId,
        })
        .eq('id', capturedSessionId)

      const upsellId =
        transaction?.metadata && typeof transaction.metadata === 'object'
          ? (transaction.metadata as Record<string, unknown>).upsell_id
          : undefined

      if (typeof upsellId === 'string' && upsellId.length > 0) {
        await supabaseAdmin
          .from('upsell_opportunities')
          .update({
            converted: true,
            conversion_payment_id: capturedSessionId,
          })
          .eq('id', upsellId)
      }
    }

    return NextResponse.redirect(
      new URL(
        `${appUrl}/payment/success?payment_session_id=${capturedSessionId ?? ''}&order_id=${orderId}`
      )
    )
  } catch (error) {
    console.error('PayPal capture failed:', error)

    if (paymentSessionIdFromQuery) {
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', paymentSessionIdFromQuery)
    }

    return NextResponse.redirect(new URL(`${appUrl}/payment/cancelled?reason=capture_failed`))
  }
}
