import { businessStore } from "./CRM"

function isOverdue(dueDate?: string) {
  return Boolean(dueDate && new Date(dueDate).getTime() < Date.now())
}

export function buildDashboard() {
  const leads = [...businessStore.leads.values()]
  const projects = [...businessStore.projects.values()]
  const tasks = [...businessStore.tasks.values()]
  const estimates = [...businessStore.estimates.values()]
  const invoices = [...businessStore.invoices.values()]

  const invoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paid = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0)
  const outstanding = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0)

  return {
    totals: {
      leads: leads.length,
      projects: projects.length,
      tasks: tasks.length,
      estimates: estimates.length,
      invoices: invoices.length,
    },
    revenue: {
      invoiced,
      paid,
      outstanding,
    },
    pipeline: {
      openLeads: leads.filter((lead) => lead.status === "lead").length,
      activeProjects: projects.filter((project) => project.status === "active").length,
      overdueTasks: tasks.filter((task) => isOverdue(task.dueDate) && task.status !== "done").length,
      overdueInvoices: invoices.filter((invoice) => isOverdue(invoice.dueDate) && invoice.status !== "paid").length,
    },
  }
}
