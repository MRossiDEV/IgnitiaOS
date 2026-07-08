import type { Page } from "playwright"
import { DEFAULT_BROWSER_WAIT_STATE } from "./constants"
import { ensureHttpUrl } from "./BrowserUtils"

export function createBrowserNavigation(page: Page) {
  return {
    async open(url: string) {
      await page.goto(ensureHttpUrl(url), { waitUntil: DEFAULT_BROWSER_WAIT_STATE })
      return { success: true as const, url: page.url() }
    },
    async reload() {
      await page.reload({ waitUntil: DEFAULT_BROWSER_WAIT_STATE })
      return { success: true as const, url: page.url() }
    },
    async back() {
      await page.goBack({ waitUntil: DEFAULT_BROWSER_WAIT_STATE })
      return { success: true as const, url: page.url() }
    },
    async forward() {
      await page.goForward({ waitUntil: DEFAULT_BROWSER_WAIT_STATE })
      return { success: true as const, url: page.url() }
    },
    async wait(milliseconds: number) {
      await page.waitForTimeout(milliseconds)
      return { success: true as const, waitedMs: milliseconds }
    },
    async waitForSelector(selector: string) {
      await page.waitForSelector(selector)
      return { success: true as const, selector }
    },
    async waitForLoad() {
      await page.waitForLoadState(DEFAULT_BROWSER_WAIT_STATE)
      return { success: true as const }
    },
  }
}
