import { sessionManager } from "./SessionManager";
import type {
  BrowserResult,
  BrowserSession,
  OpenOptions,
  ScreenshotOptions,
} from "./types";

import type {
  Locator,
  Page,
} from "playwright";

export class BrowserTool {
  private session?: BrowserSession;

  async launch(options?: OpenOptions) {
    this.session = await sessionManager.create(options);
    return this.session.id;
  }

  private get page(): Page {
    if (!this.session) {
      throw new Error("Browser not initialized.");
    }

    return this.session.page;
  }

  /* -------------------------------------------------------------------------- */
  /* Navigation                                                                  */
  /* -------------------------------------------------------------------------- */

  async open(url: string): Promise<BrowserResult> {
    try {
      await this.page.goto(url, {
        waitUntil: "networkidle",
      });

      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: String(e),
      };
    }
  }

  async reload() {
    await this.page.reload({
      waitUntil: "networkidle",
    });
  }

  async back() {
    await this.page.goBack({
      waitUntil: "networkidle",
    });
  }

  async forward() {
    await this.page.goForward({
      waitUntil: "networkidle",
    });
  }

  async wait(milliseconds: number) {
    await this.page.waitForTimeout(milliseconds);
  }

  async waitForSelector(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /* -------------------------------------------------------------------------- */
  /* Locators                                                                    */
  /* -------------------------------------------------------------------------- */

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /* -------------------------------------------------------------------------- */
  /* Mouse                                                                       */
  /* -------------------------------------------------------------------------- */

  async click(selector: string) {
    await this.locator(selector).click();
  }

  async doubleClick(selector: string) {
    await this.locator(selector).dblclick();
  }

  async rightClick(selector: string) {
    await this.locator(selector).click({
      button: "right",
    });
  }

  async hover(selector: string) {
    await this.locator(selector).hover();
  }

  async dragAndDrop(source: string, target: string) {
    await this.page.dragAndDrop(source, target);
  }

  /* -------------------------------------------------------------------------- */
  /* Forms                                                                       */
  /* -------------------------------------------------------------------------- */

  async fill(selector: string, value: string) {
    await this.locator(selector).fill(value);
  }

  async clear(selector: string) {
    await this.locator(selector).clear();
  }

  async type(selector: string, value: string) {
    await this.locator(selector).type(value);
  }

  async select(selector: string, value: string) {
    await this.locator(selector).selectOption(value);
  }

  async check(selector: string) {
    await this.locator(selector).check();
  }

  async uncheck(selector: string) {
    await this.locator(selector).uncheck();
  }

  async upload(selector: string, path: string) {
    await this.locator(selector).setInputFiles(path);
  }

  async submit(selector: string) {
    await this.locator(selector).press("Enter");
  }

  /* -------------------------------------------------------------------------- */
  /* Keyboard                                                                    */
  /* -------------------------------------------------------------------------- */

  async press(key: string) {
    await this.page.keyboard.press(key);
  }

  async shortcut(...keys: string[]) {
    await this.page.keyboard.press(keys.join("+"));
  }

  async keyboardType(text: string) {
    await this.page.keyboard.type(text);
  }

  /* -------------------------------------------------------------------------- */
  /* Scroll                                                                      */
  /* -------------------------------------------------------------------------- */

  async scrollToTop() {
    await this.page.evaluate(() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    );
  }

  async scrollToBottom() {
    await this.page.evaluate(() =>
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    );
  }

  async scrollBy(x: number, y: number) {
    await this.page.evaluate(
      ({ x, y }) => {
        window.scrollBy(x, y);
      },
      { x, y }
    );
  }

  async scrollIntoView(selector: string) {
    await this.locator(selector).scrollIntoViewIfNeeded();
  }

  /* -------------------------------------------------------------------------- */
  /* Reading                                                                     */
  /* -------------------------------------------------------------------------- */

  async text(selector: string) {
    return this.locator(selector).innerText();
  }

  async html() {
    return this.page.content();
  }

  async attribute(selector: string, attribute: string) {
    return this.locator(selector).getAttribute(attribute);
  }

  async value(selector: string) {
    return this.locator(selector).inputValue();
  }

  async exists(selector: string) {
    return (await this.locator(selector).count()) > 0;
  }

  async isVisible(selector: string) {
    return this.locator(selector).isVisible();
  }

  async currentUrl() {
    return this.page.url();
  }

  async title() {
    return this.page.title();
  }

  /* -------------------------------------------------------------------------- */
  /* Screenshots                                                                 */
  /* -------------------------------------------------------------------------- */

  async screenshot(options?: ScreenshotOptions) {
    return this.page.screenshot({
      fullPage: options?.fullPage ?? true,
      path: options?.path,
    });
  }

  async elementScreenshot(
    selector: string,
    path?: string
  ) {
    return this.locator(selector).screenshot({
      path,
    });
  }

  /* -------------------------------------------------------------------------- */
  /* JavaScript                                                                  */
  /* -------------------------------------------------------------------------- */

  async evaluate<T>(script: () => T) {
    return this.page.evaluate(script);
  }

  async evaluateSelector<T>(
    selector: string,
    callback: (element: Element) => T
  ) {
    return this.page.$eval(selector, callback);
  }

  /* -------------------------------------------------------------------------- */
  /* Browser                                                                     */
  /* -------------------------------------------------------------------------- */

  async cookies() {
    return this.page.context().cookies();
  }

  async setViewport(
    width: number,
    height: number
  ) {
    await this.page.setViewportSize({
      width,
      height,
    });
  }

  async close() {
    if (!this.session) return;

    await sessionManager.destroy(this.session.id);

    this.session = undefined;
  }
}