import type { Tool } from "../types"

export type ResearchSource =
  | "google"
  | "bing"
  | "reddit"
  | "youtube"
  | "news"

export type ResearchResult = {
  title: string
  url: string
  snippet: string
  source: ResearchSource
}

export type ResearchSummary = {
  query: string
  source: ResearchSource
  results: ResearchResult[]
}

export type CompanyProfile = {
  name: string
  website?: string
  description?: string
  emails: string[]
  phones: string[]
  socials: Record<string, string[]>
  sources: ResearchSummary[]
}

export type CompetitorProfile = {
  name: string
  website?: string
  signals: {
    title?: string
    description?: string
    emailCount: number
    phoneCount: number
    socialCount: number
  }
}

export type MarketResearchReport = {
  topic: string
  keywords: string[]
  sources: ResearchSummary[]
  insights: string[]
}

export type ResearchToolInput = Record<string, any>

