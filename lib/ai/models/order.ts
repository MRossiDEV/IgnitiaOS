/**
 * Order Model
 * Represents a paid project for a lead
 */

import { OfferType } from './offer'

export type OrderStatus = 'pending_input' | 'in_progress' | 'review' | 'delivered'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface Order {
  id: string
  organization_id: string
  lead_id: string
  offer_type: OfferType
  status: OrderStatus
  payment_status: PaymentStatus
  
  // Pricing & billing
  amount: number
  currency: string
  payment_session_id?: string
  
  // Timeline
  start_date?: string
  due_date?: string
  
  // Assignment
  assigned_to?: string // user_id of team member (founder)
  
  // Metadata & notes
  metadata?: Record<string, any>
  notes?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  delivered_at?: string
}

/**
 * Helper to calculate if order is overdue
 * Returns true if due date has passed and order is not delivered
 */
export function isOrderOverdue(order: Order): boolean {
  if (!order.due_date || order.status === 'delivered') {
    return false
  }
  return new Date(order.due_date) < new Date()
}

/**
 * Helper to get days remaining until due date
 * Positive = days remaining, Negative = days overdue, null = no due date
 */
export function daysRemaining(order: Order): number | null {
  if (!order.due_date) return null
  const now = new Date()
  const due = new Date(order.due_date)
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Helper to check if delivery is possible
 * Can only deliver if payment is received
 */
export function canDeliver(order: Order): boolean {
  return order.payment_status === 'paid' && order.status !== 'delivered'
}

/**
 * Helper to check if order should be locked from delivery
 * Locked if payment is unpaid
 */
export function isDeliveryLocked(order: Order): boolean {
  return order.payment_status !== 'paid'
}

/**
 * Helper to format status for display
 */
export function formatOrderStatus(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending_input: 'Awaiting Client Input',
    in_progress: 'In Progress',
    review: 'Under Review',
    delivered: 'Delivered'
  }
  return statusMap[status]
}

/**
 * Helper to get status color for UI
 */
export function getStatusColor(status: OrderStatus): {
  bg: string
  text: string
  border: string
} {
  const colorMap: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    pending_input: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    in_progress: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    review: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    delivered: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    }
  }
  return colorMap[status]
}

/**
 * Helper to get next suggested status
 */
export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const transitions: Record<OrderStatus, OrderStatus | null> = {
    pending_input: 'in_progress',
    in_progress: 'review',
    review: 'delivered',
    delivered: null
  }
  return transitions[currentStatus]
}
