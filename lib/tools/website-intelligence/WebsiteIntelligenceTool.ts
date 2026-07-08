import * as cheerio from "cheerio"
import type { Tool } from "../types"
import { WEBSITE_INTELLIGENCE_TIMEOUT_MS, WEBSITE_INTELLIGENCE_USER_AGENT } from "./constants"
import { analyzeAccessibility } from "./AccessibilityAnalyzer"
import { analyzeMetadata } from "./MetadataAnalyzer"
import { analyzePerformance } from "./PerformanceAnalyzer"
import { analyzeSEO } from "./SEOAnalyzer"
import { analyzeSchema } from "./SchemaAnalyzer"
import { extractContacts } from "./ContactExtractor"
import { extractSocials } from "./SocialExtractor"
import { detectTechnology } from "./TechnologyDetector"
import { calculateWebsiteScore } from "./WebsiteScore"
import type { WebsiteIntelligenceInput } from "./WebsiteTypes"

function withProtocol(rawUrl: string): string {
  const value = rawUrl.trim()
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function getUrl(input: WebsiteIntelligenceInput) {
  return withProtocol(String(input.url || input.website || ""))
}

async function fetchSnapshot(url: string) {
  const startedAt = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WEBSITE_INTELLIGENCE_TIMEOUT_MS)

  const response = await fetch(url, {
    headers: {
      "User-Agent": WEBSITE_INTELLIGENCE_USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
    signal: controller.signal,
  })

  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const headers = Object.fromEntries(response.headers.entries())

  return {
    url,
    html,
    headers,
    timing: {
      responseMs: Date.now() - startedAt,
      htmlBytes: Buffer.byteLength(html, "utf8"),
    },
  }
}

function pickFocusData(focus: WebsiteIntelligenceInput["focus"], report: ReturnType<typeof buildReport>) {
  if (!focus || focus === "full") {
    return report
  }

  const fieldMap: Partial<Record<NonNullable<WebsiteIntelligenceInput["focus"]>, keyof typeof report>> = {
    seo: "seo",
    accessibility: "accessibility",
    technology: "technology",
    performance: "performance",
    contacts: "contacts",
    social: "socials",
    schema: "schema",
  }

  const field = fieldMap[focus]

  return {
    url: report.url,
    [focus]: field ? report[field] : undefined,
    score: report.score,
  }
}

function buildReport(snapshot: Awaited<ReturnType<typeof fetchSnapshot>>) {
  const $ = cheerio.load(snapshot.html)

  const metadata = analyzeMetadata($)
  const seo = analyzeSEO($, snapshot.html)
  const accessibility = analyzeAccessibility($)
  const technology = detectTechnology(snapshot.html, snapshot.headers)
  const performance = analyzePerformance(snapshot.html, snapshot.timing.responseMs, snapshot.timing.htmlBytes)
  const contacts = extractContacts($)
  const socials = extractSocials($)
  const schema = analyzeSchema($)
  const score = calculateWebsiteScore(seo, accessibility, technology, performance)

  return {
    url: snapshot.url,
    metadata,
    seo,
    accessibility,
    technology,
    performance,
    contacts,
    socials,
    schema,
    score,
  }
}

export const WebsiteIntelligenceTool: Tool = {
  name: "website_intelligence",
  description: "Analyze a website into structured intelligence covering metadata, SEO, accessibility, technology, performance, contacts, social links, and schema",
  async run(input: Record<string, any>) {
    const url = getUrl(input as WebsiteIntelligenceInput)

    if (!url) {
      throw new Error("Missing url for website intelligence")
    }

    const snapshot = await fetchSnapshot(url)
    const report = buildReport(snapshot)

    return pickFocusData((input.focus || "full") as WebsiteIntelligenceInput["focus"], report)
  },
}
