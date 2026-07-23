export type Deal = {
  id: string
  partnerId: string

  name: string
  
  description?: string

  commissionType: "percentage" | "fixed"
  commissionValue: number
  price?: number

  payoutTrigger: "lead" | "sale" | "subscription"
  redemptions: number

  status: "active" | "paused" | "archived"

  startDate?: string
  endDate?: string

  notes?: string
}

