export type LandingPage = {
  id: string
  name: string
  slug: string
  partnerId: string
  dealId?: string
  campaignId?: string
  template: "hero" | "long-form" | "lead-magnet" | "webinar" | "product"
  status: "draft" | "published" | "paused" | "archived"
  visits: number
  uniqueVisitors: number
  conversions: number
  bounceRate: number
  avgTimeOnPage: number
  publishedAt?: string
  updatedAt: string
}
