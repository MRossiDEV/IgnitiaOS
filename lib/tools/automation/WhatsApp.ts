import { sendWebhook } from "./Webhooks"
import { WHATSAPP_WEBHOOK_URL } from "./constants"
import type { AutomationJob } from "./AutomationTypes"

export async function sendAutomationWhatsApp(job: AutomationJob) {
  const payload = {
    to: job.payload.to,
    message: job.payload.message || job.payload.text || job.title,
    metadata: job.metadata || {},
  }

  const response = await sendWebhook(job.payload.webhookUrl || WHATSAPP_WEBHOOK_URL, payload)

  return {
    ...job,
    status: response.success ? "sent" : "fallback",
    metadata: {
      ...(job.metadata || {}),
      response,
    },
  }
}
