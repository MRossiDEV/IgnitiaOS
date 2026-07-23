import type { Page } from "playwright"

function locator(page: Page, selector: string) {
  return page.locator(selector)
}

export function createBrowserActions(page: Page) {
  return {
    async click(selector: string) {
      await locator(page, selector).click()
      return { success: true as const, selector }
    },
    async doubleClick(selector: string) {
      await locator(page, selector).dblclick()
      return { success: true as const, selector }
    },
    async rightClick(selector: string) {
      await locator(page, selector).click({ button: "right" })
      return { success: true as const, selector }
    },
    async hover(selector: string) {
      await locator(page, selector).hover()
      return { success: true as const, selector }
    },
    async dragAndDrop(source: string, target: string) {
      await page.dragAndDrop(source, target)
      return { success: true as const, source, target }
    },
    async press(key: string) {
      await page.keyboard.press(key)
      return { success: true as const, key }
    },
    async shortcut(...keys: string[]) {
      await page.keyboard.press(keys.join("+"))
      return { success: true as const, keys }
    },
    async keyboardType(text: string) {
      await page.keyboard.type(text)
      return { success: true as const, text }
    },
  }
}
