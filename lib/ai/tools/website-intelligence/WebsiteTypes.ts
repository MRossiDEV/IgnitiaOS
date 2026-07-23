import type { Tool } from "../types"

export type WebsiteIntelligenceInput = {
  url?: string
  website?: string
  focus?: "full" | "seo" | "accessibility" | "technology" | "performance" | "contacts" | "social" | "schema"
}

export type WebsiteSnapshot = {
  url: string
  html: string
  headers: Record<string, string>
  timing: {
    responseMs: number
    htmlBytes: number
  }
}

export type WebsiteMetadata = {
  title: string
  description: string
  canonical: string
  robots: string
  viewport: string
  language: string
  openGraph: boolean
  twitterCard: boolean
}

export type WebsiteSEO = {
  h1Count: number
  h2Count: number
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  forms: number
  buttons: number
  ctaSignals: number
  findings: string[]
}

export type WebsiteAccessibility = {
  imagesWithoutAlt: number
  hasViewport: boolean
  hasLang: boolean
  hasAriaLabels: boolean
  findings: string[]
}

export type WebsiteTechnology = {
  detected: string[]
  server: string
  poweredBy: string
  cdn: boolean
}

export type WebsitePerformance = {
  responseMs: number
  htmlBytes: number
  scriptCount: number
  stylesheetCount: number
  imageCount: number
  findings: string[]
}

export type WebsiteContacts = {
  emails: string[]
  phones: string[]
  contactLinks: string[]
  forms: number
}

export type WebsiteSocials = {
  linkedin: string[]
  facebook: string[]
  instagram: string[]
  x: string[]
  threads: string[]
  youtube: string[]
}

export type WebsiteSchema = {
  jsonLdCount: number
  schemaTypes: string[]
  hasOrganization: boolean
  hasWebSite: boolean
  hasLocalBusiness: boolean
}

export type WebsiteScore = {
  seo: number
  accessibility: number
  technology: number
  performance: number
  overall: number
}

export type WebsiteIntelligenceReport = {
  url: string
  metadata: WebsiteMetadata
  seo: WebsiteSEO
  accessibility: WebsiteAccessibility
  technology: WebsiteTechnology
  performance: WebsitePerformance
  contacts: WebsiteContacts
  socials: WebsiteSocials
  schema: WebsiteSchema
  score: WebsiteScore
}

