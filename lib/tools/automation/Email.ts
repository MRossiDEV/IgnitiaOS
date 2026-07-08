import { sendEmail } from "../tools/sendEmail"
import type { AutomationJob } from "./AutomationTypes"

export async function sendAutomationEmail(job: AutomationJob) {
  const input = job.payload
  const result = await sendEmail.run({
    to: input.to || input.email || input.recipient,
    subject: input.subject || job.title,
    body: input.body || input.message || JSON.stringify(input, null, 2),
  })

  return {
    ...job,
    status: result?.success === false ? "fallback" : "sent",
    metadata: {
      ...(job.metadata || {}),
      result,
    },
  }
}
