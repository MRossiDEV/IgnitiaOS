'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, AlertCircle, Check, Clock, FileText, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Order, isOrderOverdue, daysRemaining, formatOrderStatus } from '@/lib/models/order'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Failed to fetch order')
        
        const data = await response.json()
        setOrder(data.order)
        setNotes(data.order.notes || '')
        setSelectedStatus(data.order.status)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) fetchOrder()
  }, [orderId])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    
    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      const data = await response.json()
      setOrder(data.order)
      setSelectedStatus(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkDelivered = async () => {
    if (!order || order.payment_status !== 'paid') return
    
    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_delivered: true })
      })
      
      if (!response.ok) throw new Error('Failed to mark as delivered')
      
      const data = await response.json()
      setOrder(data.order)
      setSelectedStatus('delivered')
    } catch (error) {
      console.error('Error marking delivered:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateNotes = async () => {
    if (!order) return
    
    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      
      if (!response.ok) throw new Error('Failed to update notes')
      
      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error updating notes:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-600">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">Order not found</p>
      </div>
    )
  }

  const lead = (order as any).lead || {}
  const overdue = isOrderOverdue(order)
  const daysLeft = daysRemaining(order)
  const canDeliver = order.payment_status === 'paid' && order.status !== 'delivered'

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_input: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      review: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200'
    }
    return colors[status] || 'bg-slate-50'
  }

  const statusOptions = [
    { value: 'pending_input', label: 'Awaiting Client Input' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Under Review' },
    { value: 'delivered', label: 'Delivered' }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
          <p className="text-sm text-slate-500 mt-1">ID: {order.id}</p>
        </div>
      </div>

      {/* ALERTS */}
      {overdue && order.status !== 'delivered' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Order Overdue</p>
            <p className="text-sm text-red-700 mt-1">
              This order was due on {order.due_date ? new Date(order.due_date).toLocaleDateString() : 'N/A'} and is {Math.abs(daysLeft || 0)} days overdue.
            </p>
          </div>
        </div>
      )}

      {order.payment_status !== 'paid' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Payment Pending</p>
            <p className="text-sm text-yellow-700 mt-1">
              Delivery is locked until payment is received. Current amount due: ${order.amount}
            </p>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* CLIENT INFO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Name</p>
                  <p className="text-slate-900">{lead.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Email</p>
                  <p className="text-slate-900">{lead.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Company</p>
                  <p className="text-slate-900">{lead.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Phone</p>
                  <p className="text-slate-900">{lead.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OFFER SUMMARY */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Offer Type</p>
                  <p className="text-slate-900 text-lg">
                    {order.offer_type === 'audit' ? 'SEO & Revenue Audit' :
                     order.offer_type === 'optimization' ? 'Content Optimization' :
                     order.offer_type === 'automation' ? 'Growth Automation' :
                     order.offer_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Amount</p>
                  <p className="text-slate-900 text-lg font-bold">${order.amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STATUS & TIMELINE */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Control */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Order Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Created</p>
                    <p className="text-sm text-slate-600">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {order.start_date && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Started</p>
                      <p className="text-sm text-slate-600">
                        {new Date(order.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.due_date && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <AlertCircle className={`w-5 h-5 ${overdue ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Due Date</p>
                      <p className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                        {new Date(order.due_date).toLocaleDateString()}
                        {daysLeft !== null && (
                          <span className="ml-2">
                            ({daysLeft > 0 ? `${daysLeft} days remaining` : `${Math.abs(daysLeft)} days overdue`})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {order.delivered_at && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Delivered</p>
                      <p className="text-sm text-slate-600">
                        {new Date(order.delivered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* NOTES & ACTIVITY */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notes & Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this order..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleUpdateNotes}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Notes
              </Button>

              {/* Activity log placeholder */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <p className="text-sm font-semibold text-slate-700">Recent Activity</p>
                <p className="text-sm text-slate-600">Order created on {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Quick Actions */}
        <div className="space-y-6">
          {/* PAYMENT STATUS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge className={
                order.payment_status === 'paid'
                  ? 'border-green-200 bg-green-50 text-green-700 w-full justify-center py-2 text-sm'
                  : 'border-yellow-200 bg-yellow-50 text-yellow-700 w-full justify-center py-2 text-sm'
              } variant="outline">
                {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
              </Badge>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Amount Due</p>
                <p className="text-2xl font-bold text-slate-900">${order.amount}</p>
              </div>
            </CardContent>
          </Card>

          {/* CURRENT STATUS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStatusColor(order.status)} border w-full justify-center py-2 text-sm`}>
                {formatOrderStatus(order.status)}
              </Badge>
            </CardContent>
          </Card>

          {/* DELIVERY ACTION */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.payment_status !== 'paid' && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-xs text-red-700 font-semibold">Delivery Locked</p>
                  <p className="text-xs text-red-600 mt-1">Awaiting payment of ${order.amount}</p>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-xs text-green-700 font-semibold">✓ Delivered</p>
                  <p className="text-xs text-green-600 mt-1">
                    {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              )}
              {canDeliver && (
                <Button
                  onClick={handleMarkDelivered}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Mark Delivered
                </Button>
              )}
            </CardContent>
          </Card>

          {/* LINKED ITEMS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600 font-semibold">Workflow</p>
                <p className="text-slate-900">Not yet linked</p>
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Report</p>
                <p className="text-slate-900">Not yet linked</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
