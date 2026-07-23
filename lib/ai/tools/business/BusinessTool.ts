import { Leads } from "./Leads"
import { Projects } from "./Projects"
import { Tasks } from "./Tasks"
import { Estimates } from "./Estimates"
import { Invoices } from "./Invoices"
import { buildDashboard } from "./Dashboard"
import { businessStore } from "./CRM"
import type { Tool } from "../types"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export const BusinessTool: Tool = {
  name: "business_tool",
  description: "Manage leads, projects, tasks, estimates, invoices, CRM summaries, and dashboard metrics",
  async run(input) {
    const action = normalizeText(input.action || input.operation || input.type || "dashboard").toLowerCase()

    if (action === "reset") {
      businessStore.reset()
      return { success: true, action }
    }

    if (action === "leads") {
      const subAction = normalizeText(input.subAction || input.mode || "list").toLowerCase()
      if (subAction === "upsert" || subAction === "create") return { action, lead: Leads.upsert(input) }
      if (subAction === "get") return { action, lead: Leads.get(String(input.id || input.leadId || "")) }
      if (subAction === "remove" || subAction === "delete") return { action, removed: Leads.remove(String(input.id || input.leadId || "")) }
      return { action, leads: Leads.list() }
    }

    if (action === "projects") {
      const subAction = normalizeText(input.subAction || input.mode || "list").toLowerCase()
      if (subAction === "upsert" || subAction === "create") return { action, project: Projects.upsert(input) }
      if (subAction === "get") return { action, project: Projects.get(String(input.id || input.projectId || "")) }
      if (subAction === "remove" || subAction === "delete") return { action, removed: Projects.remove(String(input.id || input.projectId || "")) }
      return { action, projects: Projects.list() }
    }

    if (action === "tasks") {
      const subAction = normalizeText(input.subAction || input.mode || "list").toLowerCase()
      if (subAction === "upsert" || subAction === "create") return { action, task: Tasks.upsert(input) }
      if (subAction === "get") return { action, task: Tasks.get(String(input.id || input.taskId || "")) }
      if (subAction === "remove" || subAction === "delete") return { action, removed: Tasks.remove(String(input.id || input.taskId || "")) }
      return { action, tasks: Tasks.list() }
    }

    if (action === "estimates") {
      const subAction = normalizeText(input.subAction || input.mode || "list").toLowerCase()
      if (subAction === "upsert" || subAction === "create") return { action, estimate: Estimates.upsert(input) }
      if (subAction === "get") return { action, estimate: Estimates.get(String(input.id || input.estimateId || "")) }
      if (subAction === "remove" || subAction === "delete") return { action, removed: Estimates.remove(String(input.id || input.estimateId || "")) }
      return { action, estimates: Estimates.list() }
    }

    if (action === "invoices") {
      const subAction = normalizeText(input.subAction || input.mode || "list").toLowerCase()
      if (subAction === "upsert" || subAction === "create") return { action, invoice: Invoices.upsert(input) }
      if (subAction === "get") return { action, invoice: Invoices.get(String(input.id || input.invoiceId || "")) }
      if (subAction === "remove" || subAction === "delete") return { action, removed: Invoices.remove(String(input.id || input.invoiceId || "")) }
      return { action, invoices: Invoices.list() }
    }

    if (action === "crm") {
      return {
        action,
        crm: {
          leads: Leads.list(),
          projects: Projects.list(),
          tasks: Tasks.list(),
          estimates: Estimates.list(),
          invoices: Invoices.list(),
        },
      }
    }

    return {
      action: "dashboard",
      dashboard: buildDashboard(),
    }
  },
}
