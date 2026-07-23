// ======================================================
// Client Report — HTML -> PDF (headless Chromium)
// lib/ai/client-report/generatePdf.ts
// ======================================================
// Renders the designed HTML template to a print-quality A4 PDF using
// Playwright's bundled Chromium. Node runtime only.

import { chromium } from "playwright";

export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
