import type { WebsitePerformance } from "./WebsiteTypes"

export function analyzePerformance(html: string, responseMs: number, htmlBytes: number): WebsitePerformance {
  const scriptCount = (html.match(/<script\b[^>]*src=/gi) ?? []).length
  const stylesheetCount = (html.match(/<link\b[^>]*rel=["']stylesheet["']/gi) ?? []).length
  const imageCount = (html.match(/<img\b/gi) ?? []).length

  const findings: string[] = []
  if (responseMs > 2500) findings.push("Slow initial response time")
  if (scriptCount > 10) findings.push("High number of external scripts")
  if (stylesheetCount > 5) findings.push("Large number of stylesheets")
  if (imageCount > 30) findings.push("High image count may impact performance")

  return {
    responseMs,
    htmlBytes,
    scriptCount,
    stylesheetCount,
    imageCount,
    findings,
  }
}
