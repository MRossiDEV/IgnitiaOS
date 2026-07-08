'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, ChevronRight, Clock } from 'lucide-react'

interface Order {
  id: string
  type: string
  amount: number | string
  status: string
  expected_completion_at: string | null
  delivery_started_at: string | null
  created_at: string
  leads: { id: string; name: string; email: string } | null
}

interface OrdersNeedingActionProps {
  orders: Order[]
  isLoading?: boolean
}

export function OrdersNeedingActionWidget({ orders, isLoading }: OrdersNeedingActionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'audit':
        return 'Audit'
      case 'optimization':
        return 'Optimization'
      case 'automation':
        return 'Automation'
      default:
        return type
    }
  }

  const isOverdue = (expectedDate: string | null) => {
    if (!expectedDate) return false
    return new Date(expectedDate) < new Date()
  }

  const isNotStarted = (deliveryStarted: string | null) => {
    return !deliveryStarted
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Orders Needing Action</CardTitle>
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {orders.length} orders require immediate attention
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-slate-100 rounded" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>All orders are on track!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="text-xs font-medium text-slate-600">
                        {getTypeLabel(order.type)}
                      </span>
                      {isNotStarted(order.delivery_started_at) && (
                        <Badge variant="secondary" className="text-xs bg-red-50 text-red-700">
                          Not Started
                        </Badge>
                      )}
                      {isOverdue(order.expected_completion_at) && (
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    {order.leads && (
                      <p className="text-sm font-medium text-slate-900">{order.leads.name}</p>
                    )}
                    <p className="text-xs text-slate-500 truncate">
                      Amount: ${parseFloat(order.amount as string).toFixed(2)}
                    </p>
                    {order.expected_completion_at && (
                      <p className="text-xs text-slate-500">
                        Due: {new Date(order.expected_completion_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
        {orders.length > 0 && (
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Orders
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
