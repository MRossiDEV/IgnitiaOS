import type { BrowserSession } from "./types"

export function createBrowserCookies(session: BrowserSession) {
  const { context } = session

  return {
    async list() {
      return context.cookies()
    },
    async set(cookies: Parameters<typeof context.addCookies>[0]) {
      await context.addCookies(cookies)
      return { success: true as const, count: cookies.length }
    },
    async clear() {
      await context.clearCookies()
      return { success: true as const }
    },
  }
}
