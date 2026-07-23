import { chromium } from "playwright";
import type { Tool } from "../types";

export const PlaywrightTool: Tool = {

  name: "Playwright",

  description: "Control a real browser",

  async run(input) {

    const website =
      input.url ?? input.website;

    if (!website) {
      throw new Error("No website provided.");
    }

    const browser = await chromium.launch({

      headless: true,

    });

    const page = await browser.newPage({

      viewport: {
        width: 1440,
        height: 900,
      },

    });

    await page.goto(website, {

      waitUntil: "networkidle",

      timeout: 60000,

    });

    const title = await page.title();

    const html = await page.content();

    const url = page.url();

    const screenshot =
      await page.screenshot({

        fullPage: true,

        type: "png",

      });

    const metadata = await page.evaluate(() => {

      return {

        description:
          document
            .querySelector(
              'meta[name="description"]'
            )
            ?.getAttribute("content"),

        keywords:
          document
            .querySelector(
              'meta[name="keywords"]'
            )
            ?.getAttribute("content"),

        lang:
          document.documentElement.lang,

        h1:
          document.querySelector("h1")
            ?.textContent,

      };

    });

    const links =
      await page.$$eval(
        "a",
        (elements) =>
          elements.map((a) => ({
            href: a.href,
            text: a.textContent,
          }))
      );

    const images =
      await page.$$eval(
        "img",
        (elements) =>
          elements.map((img) => ({
            src: img.src,
            alt: img.alt,
          }))
      );

    const result = {

      url,

      title,

      html,

      screenshot,

      metadata,

      links,

      images,

    };

    await browser.close();

    return result;

  },

};
