/**
 * POST /api/payments/checkout
 * 
 * Initiates payment for report generation
 * Supports: PayPal
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createPayPalOrder } from '@/lib/payments/paypal'
import { z } from 'zod'

const CheckoutSchema = z.object({
  report_id: z.string().uuid().optional(),
  upsell_id: z.string().uuid().optional(),
  amount: z.number().min(1),
  currency: z.string().default('USD'),
  email: z.string().email(),
  full_name: z.string().optional(),
})

type CheckoutRequest = z.infer<typeof CheckoutSchema>

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = CheckoutSchema.parse(body)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin

    // Create payment session
    const { data: paymentSession, error: sessionError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_email: validatedData.email,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'pending',
        provider: 'paypal',
        report_id: validatedData.report_id,
        metadata: {
          upsell_id: validatedData.upsell_id,
          full_name: validatedData.full_name,
        },
      })
      .select('*')
      .single()

    if (sessionError) throw sessionError

    const description = validatedData.report_id
      ? 'KPI Report'
      : validatedData.upsell_id
      ? 'Premium Service'
      : 'Ignitia AI Report'

    const returnUrl = `${appUrl}/api/v1/payments/paypal/return?payment_session_id=${paymentSession.id}`
    const cancelUrl = `${appUrl}/api/v1/payments/paypal/cancel?payment_session_id=${paymentSession.id}`

    const paypalOrder = await createPayPalOrder({
      amount: validatedData.amount,
      currency: validatedData.currency,
      email: validatedData.email,
      paymentSessionId: paymentSession.id,
      description,
      returnUrl,
      cancelUrl,
    })

    await supabaseAdmin
      .from('payment_transactions')
      .update({
        reference_id: paypalOrder.orderId,
      })
      .eq('id', paymentSession.id)

    return NextResponse.json({
      success: true,
      checkout_url: paypalOrder.approvalUrl,
      session_id: paypalOrder.orderId,
      payment_session_id: paymentSession.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Checkout failed',
      },
      { status: 400 }
    )
  }
}
