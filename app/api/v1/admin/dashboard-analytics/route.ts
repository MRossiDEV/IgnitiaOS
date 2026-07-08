import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/admin/dashboard-analytics
 * Fetch comprehensive dashboard analytics with all KPIs and widgets data
 */
export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('organizationId')
    
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Get today's date at 00:00:00 and the start of current month
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // ============================================================================
    // 1. TODAY'S REVENUE
    // ============================================================================
    const { data: todayOrders } = await supabaseAdmin
      .from('orders')
      .select('amount')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('completed_at', todayStart.toISOString())
      .lt('completed_at', new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString())

    const todayRevenue = (todayOrders || []).reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0)

    // ============================================================================
    // 2. MONTH-TO-DATE REVENUE
    // ============================================================================
    const { data: mtdOrders } = await supabaseAdmin
      .from('orders')
      .select('amount')
      .eq('organization_id', orgId)
      .eq('status', 'completed')
      .gte('completed_at', monthStart.toISOString())
      .lt('completed_at', new Date(monthStart.getTime() + 31 * 24 * 60 * 60 * 1000).toISOString())

    const mtdRevenue = (mtdOrders || []).reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0)

    // ============================================================================
    // 3. ACTIVE ORDERS (status = 'active' or 'pending')
    // ============================================================================
    const { data: activeOrdersData, count: activeOrdersCount } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .in('status', ['active', 'pending'])

    const activeOrders = activeOrdersCount || 0

    // ============================================================================
    // 4. ORDERS OVERDUE (expected_completion_at is before today AND status != completed)
    // ============================================================================
    const { data: overdueOrdersData, count: overdueCount } = await supabaseAdmin
      .from('orders')
      .select('id, expected_completion_at', { count: 'exact' })
      .eq('organization_id', orgId)
      .neq('status', 'completed')
      .lt('expected_completion_at', todayStart.toISOString())

    const ordersOverdue = overdueCount || 0

    // ============================================================================
    // 5. PENDING PAYMENTS (payment_sessions with status != completed)
    // ============================================================================
    const { data: pendingPaymentsData } = await supabaseAdmin
      .from('payment_sessions')
      .select('amount')
      .eq('organization_id', orgId)
      .neq('status', 'completed')
      .neq('status', 'failed')

    const pendingPayments = (pendingPaymentsData || []).reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)

    // ============================================================================
    // 6. ORDERS NEEDING ACTION (active but no delivery_started_at yet, or overdue)
    // ============================================================================
    const { data: ordersNeedingAction } = await supabaseAdmin
      .from('orders')
      .select('id, type, amount, status, expected_completion_at, delivery_started_at, created_at, leads (id, name, email)')
      .eq('organization_id', orgId)
      .in('status', ['active', 'pending'])
      .or(`delivery_started_at.is.null,expected_completion_at.lt.${todayStart.toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(10)

    // ============================================================================
    // 7. LEADS NOT CONTACTED IN 48 HOURS
    // ============================================================================
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const { data: leadsNotContacted } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, status, created_at, last_contacted_at')
      .eq('organization_id', orgId)
      .neq('status', 'converted')
      .neq('status', 'lost')
      .or(`last_contacted_at.is.null,last_contacted_at.lt.${fortyEightHoursAgo.toISOString()}`)
      .order('last_contacted_at', { ascending: true, nullsFirst: true })
      .limit(10)

    return NextResponse.json({
      kpis: {
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        mtdRevenue: parseFloat(mtdRevenue.toFixed(2)),
        activeOrders,
        ordersOverdue,
        pendingPayments: parseFloat(pendingPayments.toFixed(2)),
      },
      widgets: {
        ordersNeedingAction: ordersNeedingAction || [],
        leadsNotContacted: leadsNotContacted || [],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    )
  }
}
