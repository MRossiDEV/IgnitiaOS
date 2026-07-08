import { sendWebhook } from "./Webhooks"
import { SLACK_WEBHOOK_URL } from "./constants"
import type { AutomationJob } from "./AutomationTypes"

export async function sendAutomationSlack(job: AutomationJob) {
  const payload = {
    text: job.payload.text || job.payload.message || job.title,
    blocks: job.payload.blocks,
    metadata: job.metadata || {},
  }

  const response = await sendWebhook(job.payload.webhookUrl || SLACK_WEBHOOK_URL, payload)

  return {
    ...job,
    status: response.success ? "sent" : "fallback",
    metadata: {
      ...(job.metadata || {}),
      response,
    },
  }
}
