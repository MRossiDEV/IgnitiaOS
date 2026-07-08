import type { CheerioAPI } from "cheerio"
import type { WebsiteMetadata } from "./WebsiteTypes"

function clean(value: string | undefined | null) {
  return (value ?? "").replace(/\s+/g, " ").trim()
}

export function analyzeMetadata($: CheerioAPI): WebsiteMetadata {
  const title = clean($("title").first().text())
  const description = clean($("meta[name='description']").attr("content"))
  const canonical = clean($("link[rel='canonical']").attr("href"))
  const robots = clean($("meta[name='robots']").attr("content"))
  const viewport = clean($("meta[name='viewport']").attr("content"))
  const language = clean($("html").attr("lang"))

  return {
    title,
    description,
    canonical,
    robots,
    viewport,
    language,
    openGraph: $("meta[property^='og:']").length > 0,
    twitterCard: $("meta[name^='twitter:']").length > 0,
  }
}
