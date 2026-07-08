import { DEFAULT_AUTOMATION_TIMEOUT_MS } from "./constants"

function normalizeUrl(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function sendWebhook(url: string, payload: Record<string, any>) {
  const target = normalizeUrl(url)

  if (!target) {
    return {
      success: false,
      status: "fallback" as const,
      reason: "Missing webhook URL",
      payload,
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_AUTOMATION_TIMEOUT_MS)

  const response = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })

  clearTimeout(timeout)

  return {
    success: response.ok,
    statusCode: response.status,
    statusText: response.statusText,
  }
}
