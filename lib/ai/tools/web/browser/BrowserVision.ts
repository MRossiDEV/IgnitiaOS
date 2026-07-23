import type { Page } from "playwright"

export function createBrowserVision(page: Page) {
  return {
    async captureScreenshot(fullPage = true) {
      return page.screenshot({ fullPage, type: "png" })
    },
    async describeViewport() {
      const url = page.url()
      const title = await page.title()
      return {
        url,
        title,
        ready: true,
      }
    },
  }
}
