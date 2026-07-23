import type { CheerioAPI } from "cheerio"
import type { WebsiteAccessibility } from "./WebsiteTypes"

export function analyzeAccessibility($: CheerioAPI): WebsiteAccessibility {
  const imagesWithoutAlt = $("img").filter((_, el) => {
    const alt = $(el).attr("alt")
    return !alt || !alt.trim()
  }).length

  const hasViewport = $("meta[name='viewport']").length > 0
  const hasLang = Boolean($("html").attr("lang"))
  const hasAriaLabels = $("[aria-label], [aria-labelledby]").length > 0

  const findings: string[] = []
  if (!hasViewport) findings.push("Missing viewport meta tag")
  if (!hasLang) findings.push("Missing lang attribute on html")
  if (imagesWithoutAlt > 0) findings.push(`${imagesWithoutAlt} image(s) missing alt text`)
  if (!hasAriaLabels) findings.push("No ARIA labels detected")

  return {
    imagesWithoutAlt,
    hasViewport,
    hasLang,
    hasAriaLabels,
    findings,
  }
}
