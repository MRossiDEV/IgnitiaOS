// ======================================================
// Tool: Crawl Website
// lib/ai/tools/crawl/crawlWebsite.ts
// ======================================================
// Rules for tools: no AI, stateless, reusable, small, fast.
// Requires: npm install cheerio

import * as cheerio from "cheerio";
import { WebsiteData } from "@/lib/ai/collectors/website/types";

export async function crawlWebsite(url: string): Promise<WebsiteData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; IgnitiaOSBot/1.0; +https://ignitia.ai/bot)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const getHeadings = (tag: string) =>
    $(tag)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

  const links = $("a[href]")
    .map((_, el) => $(el).attr("href") || "")
    .get()
    .filter(Boolean);

  const images = $("img[src]")
    .map((_, el) => $(el).attr("src") || "")
    .get()
    .filter(Boolean);

  const forms = $("form")
    .map((_, el) => ({
      action: $(el).attr("action") || "",
      method: $(el).attr("method") || "get",
    }))
    .get();

  const scripts = $("script[src]")
    .map((_, el) => $(el).attr("src") || "")
    .get()
    .filter(Boolean);

  const stylesheets = $('link[rel="stylesheet"]')
    .map((_, el) => $(el).attr("href") || "")
    .get()
    .filter(Boolean);

  const schema = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).html() || "")
    .get()
    .filter(Boolean);

  const metadata: Record<string, string> = {};
  $("meta").each((_, el) => {
    const name = $(el).attr("name") || $(el).attr("property");
    const content = $(el).attr("content");
    if (name && content) metadata[name] = content;
  });

  const data: WebsiteData = {
    url,
    html,
    text: $("body").text().replace(/\s+/g, " ").trim(),
    title: $("title").first().text().trim(),
    description: metadata["description"] || "",
    language: $("html").attr("lang") || "",
    headings: {
      h1: getHeadings("h1"),
      h2: getHeadings("h2"),
      h3: getHeadings("h3"),
      h4: getHeadings("h4"),
      h5: getHeadings("h5"),
      h6: getHeadings("h6"),
    },
    links,
    images,
    forms,
    technologies: [], // Phase 2: detect via response headers / script fingerprints
    scripts,
    stylesheets,
    schema,
    metadata,
  };

  return data;
}
