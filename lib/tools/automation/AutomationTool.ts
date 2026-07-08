import { buildAutomationWorkflow, workflowToJob } from "./Workflow"
import { scheduler } from "./Scheduler"
import { sendAutomationEmail } from "./Email"
import { sendAutomationSlack } from "./Slack"
import { sendAutomationWhatsApp } from "./WhatsApp"
import { runN8NWorkflow } from "./N8N"
import { sendWebhook } from "./Webhooks"
import type { AutomationTool } from "./AutomationTypes"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export const AutomationTool: AutomationTool = {
  name: "automation_tool",
  description: "Execute workflows, webhooks, notifications, schedules, and external automation jobs",
  async run(input) {
    const action = normalizeText(input.action || input.operation || "workflow").toLowerCase()

    if (action === "workflow" || action === "build_workflow") {
      const workflow = buildAutomationWorkflow(input)
      return {
        channel: "workflow",
        status: "completed",
        workflow,
      }
    }

    if (action === "webhook") {
      const response = await sendWebhook(String(input.url || input.webhookUrl || ""), input.payload || input.body || input)
      return {
        channel: "webhook",
        status: response.success ? "completed" : "fallback",
        response,
      }
    }

    if (action === "schedule" || action === "scheduler") {
      const workflow = input.workflow ? input.workflow : buildAutomationWorkflow(input)
      const job = scheduler.schedule(workflowToJob(workflow, "scheduler"), Number(input.delayMs || input.delay || 5000))
      return {
        channel: "scheduler",
        status: "scheduled",
        job,
      }
    }

    if (action === "email") {
      return sendAutomationEmail({
        channel: "email",
        status: "queued",
        title: normalizeText(input.subject || input.title || "Email Automation"),
        payload: input,
        metadata: input.metadata || {},
        createdAt: new Date().toISOString(),
      })
    }

    if (action === "slack") {
      return sendAutomationSlack({
        channel: "slack",
        status: "queued",
        title: normalizeText(input.title || "Slack Automation"),
        payload: input,
        metadata: input.metadata || {},
        createdAt: new Date().toISOString(),
      })
    }

    if (action === "whatsapp") {
      return sendAutomationWhatsApp({
        channel: "whatsapp",
        status: "queued",
        title: normalizeText(input.title || "WhatsApp Automation"),
        payload: input,
        metadata: input.metadata || {},
        createdAt: new Date().toISOString(),
      })
    }

    if (action === "n8n") {
      return runN8NWorkflow({
        channel: "n8n",
        status: "queued",
        title: normalizeText(input.workflow || input.title || "n8n Workflow"),
        payload: input,
        metadata: input.metadata || {},
        createdAt: new Date().toISOString(),
      })
    }

    if (action === "list_schedules") {
      return {
        channel: "scheduler",
        status: "completed",
        schedules: scheduler.list(),
      }
    }

    if (action === "cancel_schedule") {
      const cancelled = scheduler.cancel(String(input.id || input.scheduleId || ""))
      return {
        channel: "scheduler",
        status: cancelled ? "completed" : "fallback",
        cancelled,
      }
    }

    return {
      channel: "workflow",
      status: "completed",
      workflow: buildAutomationWorkflow(input),
      hint: "Defaulted to workflow creation",
    }
  },
}
