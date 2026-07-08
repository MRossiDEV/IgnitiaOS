/**
 * POST /api/payments/checkout
 * 
 * Initiates payment for report generation
 * Supports: Stripe, PayPal, Crypto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create payment session
    const { data: paymentSession, error: sessionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_email: validatedData.email,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'pending',
        provider: 'stripe',
        report_id: validatedData.report_id,
        metadata: {
          upsell_id: validatedData.upsell_id,
          full_name: validatedData.full_name,
        },
      })
      .select('*')
      .single()

    if (sessionError) throw sessionError

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: validatedData.currency.toLowerCase(),
            product_data: {
              name: validatedData.report_id
                ? 'KPI Report'
                : validatedData.upsell_id
                ? 'Premium Service'
                : 'Ignitia AI Report',
              description: 'Automated KPI Analysis Report',
            },
            unit_amount: Math.round(validatedData.amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: validatedData.email,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
      metadata: {
        payment_session_id: paymentSession.id,
        report_id: validatedData.report_id || 'none',
        upsell_id: validatedData.upsell_id || 'none',
      },
    })

    // Update payment transaction with Stripe session ID
    await supabase
      .from('payment_transactions')
      .update({
        reference_id: stripeSession.id,
      })
      .eq('id', paymentSession.id)

    return NextResponse.json({
      success: true,
      checkout_url: stripeSession.url,
      session_id: stripeSession.id,
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

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const paymentSessionId = session.metadata?.payment_session_id

        // Update payment transaction
        await supabase
          .from('payment_transactions')
          .update({
            status: 'completed',
          })
          .eq('id', paymentSessionId)

        // Send confirmation email
        if (session.customer_email) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/payment-confirmed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.customer_email,
                paymentSessionId,
              }),
            })
          } catch (err) {
            console.error('Failed to send confirmation email:', err)
          }
        }

        // If upsell, update conversion
        const metadata = session.metadata
        if (metadata?.upsell_id) {
          await supabase
            .from('upsell_opportunities')
            .update({
              converted: true,
              conversion_payment_id: paymentSessionId,
            })
            .eq('id', metadata.upsell_id)
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const paymentSessionId = session.metadata?.payment_session_id

        await supabase
          .from('payment_transactions')
          .update({
            status: 'failed',
          })
          .eq('id', paymentSessionId)

        break
      }

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge
        const paymentSessionId = charge.metadata?.payment_session_id

        if (paymentSessionId) {
          await supabase
            .from('payment_transactions')
            .update({
              status: 'failed',
            })
            .eq('id', paymentSessionId)
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
