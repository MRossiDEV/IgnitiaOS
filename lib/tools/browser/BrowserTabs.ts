import type { BrowserSession } from "./types"

export function createBrowserTabs(session: BrowserSession) {
  const { context, page } = session

  return {
    async list() {
      return Promise.all(
        context.pages().map(async (tab, index) => ({
          id: String(index),
          url: tab.url(),
          title: await tab.title(),
          active: tab === page,
        }))
      )
    },
    async open(url?: string) {
      const tab = await context.newPage()
      if (url) {
        await tab.goto(url)
      }
      return tab
    },
    async closeCurrent() {
      await page.close()
      return { success: true as const }
    },
    async focus(pageIndex: number) {
      const target = context.pages()[pageIndex]
      if (!target) {
        throw new Error(`Tab ${pageIndex} not found`)
      }
      await target.bringToFront()
      return { success: true as const, index: pageIndex, url: target.url() }
    },
  }
}
