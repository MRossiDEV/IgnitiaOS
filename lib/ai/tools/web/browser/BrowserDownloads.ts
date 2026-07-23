import type { Page } from "playwright"

export function createBrowserDownloads(page: Page) {
  return {
    async waitForDownload(action: () => Promise<unknown>) {
      const downloadPromise = page.waitForEvent("download")
      await action()
      const download = await downloadPromise
      return {
        suggestedFilename: download.suggestedFilename(),
        url: download.url(),
        saveAs: async (path: string) => download.saveAs(path),
      }
    },
  }
}
