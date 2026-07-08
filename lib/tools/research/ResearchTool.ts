import * as cheerio from "cheerio"
import { RESEARCH_LIMIT, RESEARCH_TIMEOUT_MS, RESEARCH_USER_AGENT } from "./constants"
import type { ResearchResult, ResearchSource, ResearchSummary } from "./ResearchTypes"
import type { Tool } from "../types"

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function withProtocol(raw: string): string {
  const value = raw.trim()
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function uniqByUrl(results: ResearchResult[]) {
  const seen = new Set<string>()
  return results.filter((result) => {
    if (!result.url || seen.has(result.url)) return false
    seen.add(result.url)
    return true
  })
}

function buildSearchUrl(source: ResearchSource, query: string) {
  const encoded = encodeURIComponent(query)

  switch (source) {
    case "google":
      return `https://www.google.com/search?q=${encoded}&num=${RESEARCH_LIMIT}`
    case "bing":
      return `https://www.bing.com/search?q=${encoded}&count=${RESEARCH_LIMIT}`
    case "reddit":
      return `https://www.reddit.com/search/?q=${encoded}&sort=relevance&t=all`
    case "youtube":
      return `https://www.youtube.com/results?search_query=${encoded}`
    case "news":
      return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`
  }
}

async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), RESEARCH_TIMEOUT_MS)

  const response = await fetch(url, {
    headers: {
      "User-Agent": RESEARCH_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: controller.signal,
    cache: "no-store",
  })

  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

function extractResultsFromHtml(html: string, source: ResearchSource, fallbackQuery: string): ResearchResult[] {
  const $ = cheerio.load(html)
  const results: ResearchResult[] = []

  const addResult = (title: string, url: string, snippet: string) => {
    const normalizedTitle = title.trim()
    const normalizedUrl = url.trim()
    if (!normalizedTitle || !normalizedUrl) return
    if (/^(javascript:|#)/i.test(normalizedUrl)) return
    results.push({
      title: normalizedTitle,
      url: normalizedUrl,
      snippet: snippet.trim(),
      source,
    })
  }

  if (source === "news") {
    $("item").each((_, item) => {
      const title = $(item).find("title").text()
      const url = $(item).find("link").text()
      const snippet = $(item).find("description").text()
      addResult(title, url, snippet)
    })
    return uniqByUrl(results).slice(0, RESEARCH_LIMIT)
  }

  const selectors =
    source === "youtube"
      ? ["a#video-title", "a[href*='/watch']"]
      : source === "reddit"
        ? ["a[href*='/comments/']", "a[href*='reddit.com/r/']"]
        : ["a[href]"]

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const href = ($(element).attr("href") ?? "").trim()
      const title = $(element).text().replace(/\s+/g, " ").trim()
      const snippet = $(element).closest("article, div, li, section").text().replace(/\s+/g, " ").trim()
      const absoluteUrl = href.startsWith("http")
        ? href
        : href.startsWith("/")
          ? new URL(href, source === "youtube" ? "https://www.youtube.com" : "https://www.reddit.com").toString()
          : href

      if (title.length > 8 && absoluteUrl) {
        addResult(title, absoluteUrl, snippet || fallbackQuery)
      }
    })
  }

  return uniqByUrl(results).slice(0, RESEARCH_LIMIT)
}

export async function fetchSearchResults(source: ResearchSource, query: string) {
  const trimmedQuery = normalizeText(query)
  if (!trimmedQuery) {
    return [] as ResearchResult[]
  }

  const url = buildSearchUrl(source, trimmedQuery)
  const html = await fetchHtml(url)
  return extractResultsFromHtml(html, source, trimmedQuery)
}

export function buildSearchTool(
  source: ResearchSource,
  name: string,
  description: string
): Tool {
  return {
    name,
    description,
    async run(input) {
      const query = normalizeText(input.query || input.topic || input.keyword || input.company || input.name)

      if (!query) {
        throw new Error(`Missing query for ${name}`)
      }

      const results = await fetchSearchResults(source, query)

      return {
        query,
        source,
        count: results.length,
        results,
      }
    },
  }
}

async function inspectWebsite(url: string) {
  const normalized = withProtocol(url)
  if (!normalized) {
    throw new Error("Missing website URL")
  }

  const html = await fetchHtml(normalized)
  const $ = cheerio.load(html)

  const text = $("body").text().replace(/\s+/g, " ")
  const emails = Array.from(new Set((html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((value) => value.toLowerCase())))
  const phones = Array.from(new Set((html.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [])))

  const socials: Record<string, string[]> = {
    linkedin: [],
    facebook: [],
    instagram: [],
    x: [],
    youtube: [],
  }

  $("a[href]").each((_, element) => {
    const href = ($(element).attr("href") ?? "").trim()
    if (/linkedin\.com/i.test(href)) socials.linkedin.push(href)
    if (/facebook\.com/i.test(href)) socials.facebook.push(href)
    if (/instagram\.com/i.test(href)) socials.instagram.push(href)
    if (/(twitter\.com|x\.com)/i.test(href)) socials.x.push(href)
    if (/youtube\.com|youtu\.be/i.test(href)) socials.youtube.push(href)
  })

  return {
    url: normalized,
    title: $("title").text().trim(),
    description: $("meta[name='description']").attr("content")?.trim() || "",
    bodyText: text,
    emails,
    phones,
    socials: Object.fromEntries(Object.entries(socials).map(([key, values]) => [key, Array.from(new Set(values))])),
  }
}

export const ResearchTool: Tool = {
  name: "research_tool",
  description: "Runs a multi-source research workflow and aggregates search output",
  async run(input) {
    const query = normalizeText(input.query || input.topic || input.company || input.name)

    if (!query) {
      throw new Error("Missing research query")
    }

    const requestedSources = Array.isArray(input.sources)
      ? input.sources.map((value: unknown) => String(value).toLowerCase()).filter((value): value is ResearchSource => ["google", "bing", "reddit", "youtube", "news"].includes(value))
      : (["google", "bing", "news"] as ResearchSource[])

    const summaries: ResearchSummary[] = []

    for (const source of requestedSources) {
      try {
        summaries.push({
          query,
          source,
          results: await fetchSearchResults(source, query),
        })
      } catch (error) {
        summaries.push({
          query,
          source,
          results: [],
        })
      }
    }

    return {
      query,
      sources: summaries,
      totalResults: summaries.reduce((count, summary) => count + summary.results.length, 0),
    }
  },
}

export async function buildCompanyResearchProfile(input: Record<string, any>) {
  const name = normalizeText(input.company || input.name || input.query)
  if (!name) {
    throw new Error("Missing company name")
  }

  const websiteCandidate = normalizeText(input.website || input.url)
  const sourceQuery = websiteCandidate || name
  const sources: ResearchSummary[] = []

  for (const source of ["google", "bing", "news"] as ResearchSource[]) {
    try {
      sources.push({
        query: sourceQuery,
        source,
        results: await fetchSearchResults(source, sourceQuery),
      })
    } catch {
      sources.push({ query: sourceQuery, source, results: [] })
    }
  }

  const website = websiteCandidate || sources.flatMap((summary) => summary.results).find((result) => /^https?:\/\//i.test(result.url))?.url

  let websiteSummary = {
    url: "",
    title: "",
    description: "",
    bodyText: "",
    emails: [] as string[],
    phones: [] as string[],
    socials: {} as Record<string, string[]>,
  }

  if (website) {
    try {
      websiteSummary = await inspectWebsite(website)
    } catch {
      websiteSummary = {
        url: website,
        title: "",
        description: "",
        bodyText: "",
        emails: [],
        phones: [],
        socials: {},
      }
    }
  }

  return {
    name,
    website: websiteSummary.url || website,
    description: websiteSummary.description,
    emails: websiteSummary.emails,
    phones: websiteSummary.phones,
    socials: websiteSummary.socials,
    sources,
  }
}

export async function buildCompetitorResearchProfile(input: Record<string, any>) {
  const target = normalizeText(input.company || input.name || input.target || input.query)
  const competitors = Array.isArray(input.competitors)
    ? input.competitors.map((value: unknown) => normalizeText(value)).filter(Boolean)
    : []

  if (!target) {
    throw new Error("Missing target company for competitor research")
  }

  const profiles = [] as Array<{ name: string; website?: string; title?: string; description?: string; emailCount: number; phoneCount: number; socialCount: number }>

  for (const competitor of competitors.slice(0, 10)) {
    try {
      const searchResults = await fetchSearchResults("google", competitor)
      const website = searchResults[0]?.url
      const page = website ? await inspectWebsite(website) : undefined

      profiles.push({
        name: competitor,
        website,
        title: page?.title,
        description: page?.description,
        emailCount: page?.emails.length ?? 0,
        phoneCount: page?.phones.length ?? 0,
        socialCount: Object.values(page?.socials ?? {}).reduce((sum, values) => sum + values.length, 0),
      })
    } catch {
      profiles.push({
        name: competitor,
        emailCount: 0,
        phoneCount: 0,
        socialCount: 0,
      })
    }
  }

  return {
    target,
    competitors: profiles,
    gapSummary: {
      positioning: [
        "Review market positioning and headline clarity",
        "Compare CTA depth and conversion paths",
      ],
      content: [
        "Assess case studies, FAQs, and service comparison pages",
        "Map content clusters competitors own that you do not",
      ],
      acquisition: [
        "Check organic visibility and news mentions",
        "Compare lead capture friction and scheduling flows",
      ],
    },
  }
}

export async function buildMarketResearchReport(input: Record<string, any>) {
  const topic = normalizeText(input.topic || input.industry || input.keyword || input.query)

  if (!topic) {
    throw new Error("Missing market research topic")
  }

  const keywordSeed = normalizeText(input.location)
  const keywords = [
    topic,
    `${topic} trends`,
    `${topic} market`,
    `${topic} competitors`,
    keywordSeed ? `${topic} ${keywordSeed}` : "",
  ].filter(Boolean)

  const sources: ResearchSummary[] = []

  for (const source of ["google", "bing", "news", "reddit"] as ResearchSource[]) {
    try {
      sources.push({
        query: keywords[0],
        source,
        results: await fetchSearchResults(source, keywords[0]),
      })
    } catch {
      sources.push({ query: keywords[0], source, results: [] })
    }
  }

  const insights = [
    `Track demand signals around ${topic} across search, news, and community sources.`,
    `Build content around problem-aware and solution-aware queries for ${topic}.`,
    `Use competitor gaps to prioritize positioning, pricing, and service differentiation.`,
  ]

  return {
    topic,
    keywords,
    sources,
    insights,
  }
}
