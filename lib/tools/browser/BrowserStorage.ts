import type { Page } from "playwright"

export function createBrowserStorage(page: Page) {
  return {
    async getLocalStorage() {
      return page.evaluate(() => {
        const storage: Record<string, string> = {}
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index)
          if (key) storage[key] = localStorage.getItem(key) ?? ""
        }
        return storage
      })
    },
    async setLocalStorage(key: string, value: string) {
      await page.evaluate(
        ({ key, value }) => localStorage.setItem(key, value),
        { key, value }
      )
      return { success: true as const, key }
    },
    async clearLocalStorage() {
      await page.evaluate(() => localStorage.clear())
      return { success: true as const }
    },
    async getSessionStorage() {
      return page.evaluate(() => {
        const storage: Record<string, string> = {}
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index)
          if (key) storage[key] = sessionStorage.getItem(key) ?? ""
        }
        return storage
      })
    },
  }
}
