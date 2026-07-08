/**
 * Orders Management Page
 * Lists and manages all active orders/projects with filtering
 */

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, AlertCircle, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Order, isOrderOverdue, daysRemaining, formatOrderStatus } from '@/lib/models/order'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>('all')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.append('status', statusFilter)
        if (offerTypeFilter !== 'all') params.append('offer_type', offerTypeFilter)

        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch orders')
        
        const data = await response.json()
        setOrders(data.orders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [statusFilter, offerTypeFilter])

  // Apply local filters
  useEffect(() => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const lead = (order as any).lead || {}
        const searchLower = searchTerm.toLowerCase()
        return (
          (lead.name || '').toLowerCase().includes(searchLower) ||
          (lead.email || '').toLowerCase().includes(searchLower) ||
          (lead.company || '').toLowerCase().includes(searchLower)
        )
      })
    }

    // Overdue filter
    if (showOverdueOnly) {
      filtered = filtered.filter(order => isOrderOverdue(order))
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, showOverdueOnly])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_input: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      review: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200'
    }
    return colors[status] || 'bg-slate-50'
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending_input: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
      review: 'border-purple-200 bg-purple-50 text-purple-700',
      delivered: 'border-green-200 bg-green-50 text-green-700'
    }
    return classes[status] || 'border-slate-200'
  }

  const stats = {
    total: orders.length,
    overdue: orders.filter(o => isOrderOverdue(o)).length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders & Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active and completed projects</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-sm text-slate-600 mt-1">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-sm text-slate-600 mt-1">Overdue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-slate-600 mt-1">Awaiting Payment</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
              <p className="text-sm text-slate-600 mt-1">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTER */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by client name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending_input">Awaiting Client Input</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Under Review</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 block mb-1">Offer Type</label>
              <select
                value={offerTypeFilter}
                onChange={(e) => setOfferTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Offers</option>
                <option value="audit">SEO & Revenue Audit</option>
                <option value="optimization">Content Optimization</option>
                <option value="automation">Growth Automation</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant={showOverdueOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                className={showOverdueOnly ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Overdue Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ORDERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-slate-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">
                {orders.length === 0 
                  ? 'No orders yet. Create your first order to get started.'
                  : 'No orders match your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Offer</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const overdue = isOrderOverdue(order)
                    const daysLeft = daysRemaining(order)
                    const lead = (order as any).lead || {}

                    return (
                      <tr key={order.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{lead.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{lead.email || ''}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {order.offer_type === 'audit' ? 'SEO & Revenue Audit' :
                           order.offer_type === 'optimization' ? 'Content Optimization' :
                           order.offer_type === 'automation' ? 'Growth Automation' :
                           order.offer_type}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusBadgeClass(order.status)} border`}>
                            {formatOrderStatus(order.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">${order.amount}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {overdue && (
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <span className={overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                              {order.due_date ? new Date(order.due_date).toLocaleDateString() : 'N/A'}
                            </span>
                            {daysLeft !== null && (
                              <span className={`text-xs ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
                                ({daysLeft > 0 ? `${daysLeft}d left` : `${Math.abs(daysLeft)}d overdue`})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            order.payment_status === 'paid'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                          } variant="outline">
                            {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
