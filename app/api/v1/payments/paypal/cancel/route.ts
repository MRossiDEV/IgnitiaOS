import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
  const paymentSessionId = req.nextUrl.searchParams.get('payment_session_id')

  if (paymentSessionId) {
    await supabaseAdmin
      .from('payment_transactions')
      .update({ status: 'failed' })
      .eq('id', paymentSessionId)
  }

  return NextResponse.redirect(
    new URL(
      `${appUrl}/payment/cancelled?payment_session_id=${paymentSessionId ?? ''}`
    )
  )
}
