import type { CheerioAPI } from "cheerio"
import type { WebsiteSEO } from "./WebsiteTypes"

function countMatches(html: string, pattern: RegExp) {
  return html.match(pattern)?.length ?? 0
}

export function analyzeSEO($: CheerioAPI, html: string): WebsiteSEO {
  const imageTags = $("img")
  const imagesWithoutAlt = imageTags.filter((_, el) => {
    const alt = $(el).attr("alt")
    return !alt || !alt.trim()
  }).length

  const internalLinks = $("a[href]").filter((_, el) => {
    const href = ($(el).attr("href") ?? "").trim()
    return href.startsWith("/") && !href.startsWith("//")
  }).length

  const ctaSignals = countMatches(
    html,
    /(get started|book a call|request demo|contact us|start now|try free|sign up|learn more)/gi
  )

  const h1Count = $("h1").length
  const h2Count = $("h2").length
  const forms = $("form").length
  const buttons = $("button").length

  const findings: string[] = []

  if (h1Count !== 1) findings.push(`Expected 1 H1 but found ${h1Count}`)
  if (!$("title").first().text().trim()) findings.push("Missing title tag")
  if (!$("meta[name='description']").attr("content")) findings.push("Missing meta description")
  if ($("link[rel='canonical']").length === 0) findings.push("Missing canonical tag")
  if (imagesWithoutAlt > 0) findings.push(`${imagesWithoutAlt} image(s) missing alt text`)
  if (ctaSignals === 0) findings.push("No clear CTA signals detected")

  return {
    h1Count,
    h2Count,
    imageCount: imageTags.length,
    imagesWithoutAlt,
    internalLinks,
    forms,
    buttons,
    ctaSignals,
    findings,
  }
}
