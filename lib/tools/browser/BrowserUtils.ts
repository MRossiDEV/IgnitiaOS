import { DEFAULT_BROWSER_WAIT_STATE } from "./constants"
import type { BrowserSession } from "./types"

export function ensureHttpUrl(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error("Missing URL")
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function touchSession(session: BrowserSession) {
  session.updatedAt = new Date()
  return session
}

export async function waitForStablePage(page: { waitForLoadState: (state: typeof DEFAULT_BROWSER_WAIT_STATE) => Promise<void> }) {
  await page.waitForLoadState(DEFAULT_BROWSER_WAIT_STATE)
}
