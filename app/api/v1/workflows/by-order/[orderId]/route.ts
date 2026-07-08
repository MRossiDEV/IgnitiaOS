import { NextRequest, NextResponse } from 'next/server'
import { getWorkflowByOrderId } from '@/lib/supabase/workflows'

/**
 * GET /api/workflows/by-order/[orderId]
 * Get workflow by order ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const workflow = await getWorkflowByOrderId(orderId)

    if (!workflow) {
      return NextResponse.json(
        { error: 'No workflow found for this order' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, workflow },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching workflow by order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}
