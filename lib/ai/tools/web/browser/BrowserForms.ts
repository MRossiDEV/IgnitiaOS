import type { Page } from "playwright"

function locator(page: Page, selector: string) {
  return page.locator(selector)
}

export function createBrowserForms(page: Page) {
  return {
    async fill(selector: string, value: string) {
      await locator(page, selector).fill(value)
      return { success: true as const, selector }
    },
    async clear(selector: string) {
      await locator(page, selector).clear()
      return { success: true as const, selector }
    },
    async type(selector: string, value: string) {
      await locator(page, selector).type(value)
      return { success: true as const, selector }
    },
    async select(selector: string, value: string) {
      await locator(page, selector).selectOption(value)
      return { success: true as const, selector, value }
    },
    async check(selector: string) {
      await locator(page, selector).check()
      return { success: true as const, selector }
    },
    async uncheck(selector: string) {
      await locator(page, selector).uncheck()
      return { success: true as const, selector }
    },
    async upload(selector: string, path: string) {
      await locator(page, selector).setInputFiles(path)
      return { success: true as const, selector, path }
    },
    async submit(selector: string) {
      await locator(page, selector).press("Enter")
      return { success: true as const, selector }
    },
  }
}
