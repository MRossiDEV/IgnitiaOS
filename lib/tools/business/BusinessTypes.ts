import type { Tool } from "../types"

export type BusinessEntityStatus = "lead" | "active" | "paused" | "closed" | "draft" | "sent" | "paid" | "overdue" | "done"

export type BusinessLead = {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  website?: string
  source?: string
  status: BusinessEntityStatus
  value?: number
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type BusinessProject = {
  id: string
  name: string
  clientId?: string
  leadId?: string
  status: BusinessEntityStatus
  description?: string
  budget?: number
  dueDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type BusinessTask = {
  id: string
  title: string
  projectId?: string
  assignee?: string
  status: BusinessEntityStatus
  priority: "low" | "medium" | "high"
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type BusinessEstimate = {
  id: string
  estimateNumber: string
  projectId?: string
  clientId?: string
  leadId?: string
  status: BusinessEntityStatus
  subtotal: number
  tax: number
  total: number
  currency: string
  lineItems: Array<{
    description: string
    qty: number
    rate: number
    amount: number
  }>
  createdAt: string
  updatedAt: string
}

export type BusinessInvoice = {
  id: string
  invoiceNumber: string
  estimateId?: string
  projectId?: string
  clientId?: string
  status: BusinessEntityStatus
  subtotal: number
  tax: number
  total: number
  currency: string
  dueDate?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export type BusinessDashboard = {
  totals: {
    leads: number
    projects: number
    tasks: number
    estimates: number
    invoices: number
  }
  revenue: {
    invoiced: number
    paid: number
    outstanding: number
  }
  pipeline: {
    openLeads: number
    activeProjects: number
    overdueTasks: number
    overdueInvoices: number
  }
}

export type BusinessToolInput = Record<string, any>

export type BusinessTool = Tool
