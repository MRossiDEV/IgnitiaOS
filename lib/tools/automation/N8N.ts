import { sendWebhook } from "./Webhooks"
import { N8N_WEBHOOK_URL } from "./constants"
import type { AutomationJob } from "./AutomationTypes"

export async function runN8NWorkflow(job: AutomationJob) {
  const payload = {
    workflow: job.payload.workflow || job.payload.workflowId || job.title,
    input: job.payload.input || job.payload,
    metadata: job.metadata || {},
  }

  const response = await sendWebhook(job.payload.webhookUrl || N8N_WEBHOOK_URL, payload)

  return {
    ...job,
    status: response.success ? "completed" : "fallback",
    metadata: {
      ...(job.metadata || {}),
      response,
    },
  }
}
