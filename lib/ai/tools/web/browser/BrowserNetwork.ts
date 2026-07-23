import type { Page } from "playwright"
import type { BrowserNetworkEntry } from "./BrowserTypes"

export function createBrowserNetwork(page: Page) {
  const entries: BrowserNetworkEntry[] = []

  page.on("request", (request) => {
    entries.push({
      type: "request",
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString(),
    })
  })

  page.on("response", (response) => {
    entries.push({
      type: "response",
      url: response.url(),
      status: response.status(),
      timestamp: new Date().toISOString(),
    })
  })

  return {
    async getEntries() {
      return entries.slice()
    },
    async clear() {
      entries.length = 0
      return { success: true as const }
    },
    async waitForRequest(predicate: (url: string) => boolean, timeoutMs = 15_000) {
      const request = await page.waitForRequest((request) => predicate(request.url()), { timeout: timeoutMs })
      return request.url()
    },
    async waitForResponse(predicate: (url: string) => boolean, timeoutMs = 15_000) {
      const response = await page.waitForResponse((response) => predicate(response.url()), { timeout: timeoutMs })
      return { url: response.url(), status: response.status() }
    },
  }
}
