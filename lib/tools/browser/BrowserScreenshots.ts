import type { Page } from "playwright"

export function createBrowserScreenshots(page: Page) {
  return {
    async screenshot(path?: string, fullPage = true) {
      return page.screenshot({ path, fullPage })
    },
    async elementScreenshot(selector: string, path?: string) {
      return page.locator(selector).screenshot({ path })
    },
  }
}
