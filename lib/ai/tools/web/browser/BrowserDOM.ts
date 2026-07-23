import type { Locator, Page } from "playwright"

function locator(page: Page, selector: string): Locator {
  return page.locator(selector)
}

export function createBrowserDOM(page: Page) {
  return {
    locator(selector: string) {
      return locator(page, selector)
    },
    async text(selector: string) {
      return locator(page, selector).innerText()
    },
    async html() {
      return page.content()
    },
    async attribute(selector: string, attribute: string) {
      return locator(page, selector).getAttribute(attribute)
    },
    async value(selector: string) {
      return locator(page, selector).inputValue()
    },
    async exists(selector: string) {
      return (await locator(page, selector).count()) > 0
    },
    async isVisible(selector: string) {
      return locator(page, selector).isVisible()
    },
    async currentUrl() {
      return page.url()
    },
    async title() {
      return page.title()
    },
    async evaluate<T>(script: () => T) {
      return page.evaluate(script)
    },
    async evaluateSelector<T>(selector: string, callback: (element: Element) => T) {
      return page.$eval(selector, callback)
    },
  }
}
