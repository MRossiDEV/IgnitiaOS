import type { WebsiteAccessibility, WebsitePerformance, WebsiteSEO, WebsiteTechnology, WebsiteScore } from "./WebsiteTypes"

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function calculateWebsiteScore(
  seo: WebsiteSEO,
  accessibility: WebsiteAccessibility,
  technology: WebsiteTechnology,
  performance: WebsitePerformance
): WebsiteScore {
  const seoScore = clamp(
    100 - (seo.findings.length * 8) - (seo.imagesWithoutAlt * 2) - (seo.h1Count !== 1 ? 10 : 0),
    0,
    100
  )
  const accessibilityScore = clamp(
    100 - (accessibility.findings.length * 12) - (accessibility.imagesWithoutAlt * 4),
    0,
    100
  )
  const technologyScore = clamp(
    100 - (technology.detected.length > 0 ? 0 : 10) - (technology.cdn ? 0 : 5),
    0,
    100
  )
  const performanceScore = clamp(
    100 - Math.round(performance.responseMs / 100) - performance.scriptCount * 2 - Math.max(0, performance.imageCount - 20),
    0,
    100
  )

  return {
    seo: seoScore,
    accessibility: accessibilityScore,
    technology: technologyScore,
    performance: performanceScore,
    overall: Math.round((seoScore + accessibilityScore + technologyScore + performanceScore) / 4),
  }
}
