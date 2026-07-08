import { COMFYUI_BASE_URL, MEDIA_TIMEOUT_MS } from "./constants"
import type { MediaJob } from "./MediaTypes"

function hasComfyUI() {
  return Boolean(COMFYUI_BASE_URL)
}

export async function submitToComfyUI(job: MediaJob) {
  if (!hasComfyUI()) {
    return {
      ...job,
      status: "fallback" as const,
      details: {
        reason: "COMFYUI_BASE_URL is not configured",
        workflowHint: {
          node: job.task,
          prompt: job.prompt,
          model: job.model,
          timeoutMs: MEDIA_TIMEOUT_MS,
        },
      },
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MEDIA_TIMEOUT_MS)

  const response = await fetch(`${COMFYUI_BASE_URL.replace(/\/$/, "")}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: job.prompt,
      model: job.model,
      task: job.task,
      details: job.details ?? {},
    }),
    signal: controller.signal,
  })

  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error(`ComfyUI request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    ...job,
    status: "queued" as const,
    details: data,
  }
}
