import type { BusinessLead, BusinessProject, BusinessTask, BusinessEstimate, BusinessInvoice } from "./BusinessTypes"

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function now() {
  return new Date().toISOString()
}

class BusinessStore {
  leads = new Map<string, BusinessLead>()
  projects = new Map<string, BusinessProject>()
  tasks = new Map<string, BusinessTask>()
  estimates = new Map<string, BusinessEstimate>()
  invoices = new Map<string, BusinessInvoice>()

  reset() {
    this.leads.clear()
    this.projects.clear()
    this.tasks.clear()
    this.estimates.clear()
    this.invoices.clear()
  }
}

export const businessStore = new BusinessStore()

export function toTags(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []
}

export function upsertLead(input: Record<string, any>): BusinessLead {
  const id = String(input.id || createId("lead"))
  const existing = businessStore.leads.get(id)
  const record: BusinessLead = {
    id,
    name: String(input.name || input.leadName || input.contactName || "Untitled Lead"),
    company: input.company || existing?.company,
    email: input.email || existing?.email,
    phone: input.phone || existing?.phone,
    website: input.website || existing?.website,
    source: input.source || existing?.source,
    status: String(input.status || existing?.status || "lead") as BusinessLead["status"],
    value: Number(input.value || existing?.value || 0),
    notes: input.notes || existing?.notes,
    tags: toTags(input.tags).length > 0 ? toTags(input.tags) : existing?.tags || [],
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  }

  businessStore.leads.set(id, record)
  return record
}

export function upsertProject(input: Record<string, any>): BusinessProject {
  const id = String(input.id || createId("proj"))
  const existing = businessStore.projects.get(id)
  const record: BusinessProject = {
    id,
    name: String(input.name || input.projectName || "Untitled Project"),
    clientId: input.clientId || existing?.clientId,
    leadId: input.leadId || existing?.leadId,
    status: String(input.status || existing?.status || "active") as BusinessProject["status"],
    description: input.description || existing?.description,
    budget: Number(input.budget || existing?.budget || 0),
    dueDate: input.dueDate || existing?.dueDate,
    tags: toTags(input.tags).length > 0 ? toTags(input.tags) : existing?.tags || [],
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  }

  businessStore.projects.set(id, record)
  return record
}

export function upsertTask(input: Record<string, any>): BusinessTask {
  const id = String(input.id || createId("task"))
  const existing = businessStore.tasks.get(id)
  const record: BusinessTask = {
    id,
    title: String(input.title || input.taskTitle || "Untitled Task"),
    projectId: input.projectId || existing?.projectId,
    assignee: input.assignee || existing?.assignee,
    status: String(input.status || existing?.status || "active") as BusinessTask["status"],
    priority: String(input.priority || existing?.priority || "medium") as BusinessTask["priority"],
    dueDate: input.dueDate || existing?.dueDate,
    notes: input.notes || existing?.notes,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  }

  businessStore.tasks.set(id, record)
  return record
}

export function upsertEstimate(input: Record<string, any>): BusinessEstimate {
  const id = String(input.id || createId("est"))
  const existing = businessStore.estimates.get(id)
  const lineItems = Array.isArray(input.lineItems)
    ? input.lineItems.map((item: any) => ({
        description: String(item.description || item.name || "Line Item"),
        qty: Number(item.qty || item.quantity || 1),
        rate: Number(item.rate || item.price || 0),
        amount: Number(item.amount || Number(item.qty || 1) * Number(item.rate || item.price || 0)),
      }))
    : existing?.lineItems || []

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = Number(input.tax ?? existing?.tax ?? 0)
  const total = Number(input.total || subtotal + tax)

  const record: BusinessEstimate = {
    id,
    estimateNumber: String(input.estimateNumber || existing?.estimateNumber || `EST-${Date.now()}`),
    projectId: input.projectId || existing?.projectId,
    clientId: input.clientId || existing?.clientId,
    leadId: input.leadId || existing?.leadId,
    status: String(input.status || existing?.status || "draft") as BusinessEstimate["status"],
    subtotal,
    tax,
    total,
    currency: String(input.currency || existing?.currency || "USD"),
    lineItems,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  }

  businessStore.estimates.set(id, record)
  return record
}

export function upsertInvoice(input: Record<string, any>): BusinessInvoice {
  const id = String(input.id || createId("inv"))
  const existing = businessStore.invoices.get(id)
  const subtotal = Number(input.subtotal ?? existing?.subtotal ?? 0)
  const tax = Number(input.tax ?? existing?.tax ?? 0)
  const total = Number(input.total ?? subtotal + tax)

  const record: BusinessInvoice = {
    id,
    invoiceNumber: String(input.invoiceNumber || existing?.invoiceNumber || `INV-${Date.now()}`),
    estimateId: input.estimateId || existing?.estimateId,
    projectId: input.projectId || existing?.projectId,
    clientId: input.clientId || existing?.clientId,
    status: String(input.status || existing?.status || "draft") as BusinessInvoice["status"],
    subtotal,
    tax,
    total,
    currency: String(input.currency || existing?.currency || "USD"),
    dueDate: input.dueDate || existing?.dueDate,
    paidAt: input.paidAt || existing?.paidAt,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  }

  businessStore.invoices.set(id, record)
  return record
}
