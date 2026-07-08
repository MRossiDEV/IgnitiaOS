import { Tool } from "../types"

type AuditFocus = "seo" | "conversion" | "general"

function toAbsoluteUrl(raw: string): string {
  const value = raw.trim()

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `https://${value}`
}

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim()
}

function clamp(input: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, input))
}

export const websiteAudit: Tool = {
  name: "website_audit",

  description: "Run a lightweight SEO and conversion audit for a webpage",

  async run(input) {
    const rawUrl = String(input.url ?? "").trim()
    const focus = (input.focus ?? "general") as AuditFocus

    if (!rawUrl) {
      throw new Error("Missing url for website audit")
    }

    const url = toAbsoluteUrl(rawUrl)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "IgnitiaAgentAuditBot/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Unable to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const descriptionMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i
    )
    const canonicalMatch = html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([\s\S]*?)["'][^>]*>/i
    )

    const h1Count = (html.match(/<h1\b/gi) ?? []).length
    const h2Count = (html.match(/<h2\b/gi) ?? []).length

    const imageTags = html.match(/<img\b[^>]*>/gi) ?? []
    const imagesWithoutAlt = imageTags.filter(
      (tag) => !/\salt\s*=\s*['"][^'"]*['"]/i.test(tag)
    ).length

    const internalLinks = (html.match(/<a\b[^>]*href=["']\/(?!\/)[^"']*["'][^>]*>/gi) ?? []).length

    const hasOpenGraph = /<meta[^>]+property=["']og:/i.test(html)
    const hasTwitterCard = /<meta[^>]+name=["']twitter:/i.test(html)
    const hasRobotsMeta = /<meta[^>]+name=["']robots["']/i.test(html)

    const ctaMatches = html.match(/(get started|start now|book|buy now|sign up|try free|contact us|request demo)/gi) ?? []
    const formCount = (html.match(/<form\b/gi) ?? []).length
    const buttonCount = (html.match(/<button\b/gi) ?? []).length

    let seoScore = 100
    if (!titleMatch) seoScore -= 18
    if (!descriptionMatch) seoScore -= 18
    if (!canonicalMatch) seoScore -= 12
    if (h1Count !== 1) seoScore -= 12
    if (imagesWithoutAlt > 0) seoScore -= clamp(imagesWithoutAlt * 2, 0, 14)
    if (!hasOpenGraph) seoScore -= 8
    if (!hasTwitterCard) seoScore -= 6
    if (!hasRobotsMeta) seoScore -= 4
    seoScore = clamp(seoScore, 0, 100)

    let conversionScore = 100
    if (ctaMatches.length === 0) conversionScore -= 30
    if (formCount === 0) conversionScore -= 25
    if (buttonCount < 2) conversionScore -= 12
    if (internalLinks < 3) conversionScore -= 8
    conversionScore = clamp(conversionScore, 0, 100)

    const seoFindings: string[] = []
    const conversionFindings: string[] = []

    if (!titleMatch) seoFindings.push("Missing <title> tag")
    if (!descriptionMatch) seoFindings.push("Missing meta description")
    if (!canonicalMatch) seoFindings.push("Missing canonical URL")
    if (h1Count !== 1) seoFindings.push(`Expected 1 H1 but found ${h1Count}`)
    if (imagesWithoutAlt > 0) seoFindings.push(`${imagesWithoutAlt} image(s) missing alt text`)
    if (!hasOpenGraph) seoFindings.push("Open Graph tags not detected")
    if (!hasTwitterCard) seoFindings.push("Twitter card tags not detected")

    if (ctaMatches.length === 0) conversionFindings.push("No clear CTA language detected")
    if (formCount === 0) conversionFindings.push("No form detected for lead capture")
    if (buttonCount < 2) conversionFindings.push("Low number of buttons may limit action paths")
    if (internalLinks < 3) conversionFindings.push("Limited internal linking for deeper engagement")

    const topFixes = [
      ...(seoFindings.slice(0, 3).map((f) => `SEO: ${f}`)),
      ...(conversionFindings.slice(0, 3).map((f) => `Conversion: ${f}`)),
    ].slice(0, 5)

    return {
      tool: "website_audit",
      focus,
      url,
      title: cleanText(titleMatch?.[1]),
      metaDescription: cleanText(descriptionMatch?.[1]),
      canonical: cleanText(canonicalMatch?.[1]),
      metrics: {
        seoScore,
        conversionScore,
        h1Count,
        h2Count,
        imageCount: imageTags.length,
        imagesWithoutAlt,
        internalLinks,
        formCount,
        buttonCount,
        ctaMatches: ctaMatches.length,
      },
      findings: {
        seo: seoFindings,
        conversion: conversionFindings,
      },
      topFixes,
    }
  },
}
