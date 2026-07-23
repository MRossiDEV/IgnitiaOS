export type Campaign = {
  id: string
  name: string
  partnerId: string
  dealId?: string
  channel: "email" | "social" | "search" | "display" | "sms"
  objective: "awareness" | "leads" | "sales" | "retention"
  status: "draft" | "active" | "paused" | "completed" | "archived"
  budget: number
  spent: number
  impressions: number
  clicks: number
  leads: number
  conversions: number
  revenue: number
  startDate: string
  endDate?: string
  notes?: string
}
