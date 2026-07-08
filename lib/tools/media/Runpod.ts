import { RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID, MEDIA_TIMEOUT_MS } from "./constants"
import type { MediaJob } from "./MediaTypes"

function hasRunpod() {
  return Boolean(RUNPOD_API_KEY && RUNPOD_ENDPOINT_ID)
}

export async function submitToRunpod(job: MediaJob) {
  if (!hasRunpod()) {
    return {
      ...job,
      status: "fallback" as const,
      details: {
        reason: "RUNPOD_API_KEY or RUNPOD_ENDPOINT_ID is not configured",
        endpointHint: {
          endpointId: RUNPOD_ENDPOINT_ID || "<configure RUNPOD_ENDPOINT_ID>",
          timeoutMs: MEDIA_TIMEOUT_MS,
        },
      },
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MEDIA_TIMEOUT_MS)

  const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/runsync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RUNPOD_API_KEY}`,
    },
    body: JSON.stringify({
      input: {
        prompt: job.prompt,
        model: job.model,
        task: job.task,
        details: job.details ?? {},
      },
    }),
    signal: controller.signal,
  })

  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error(`Runpod request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    ...job,
    status: "completed" as const,
    details: data,
  }
}
