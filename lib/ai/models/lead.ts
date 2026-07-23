export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost"

export type LeadPriority = "hot" | "warm" | "cold"

export interface Lead {
  id: string

  // Source
  partnerId?: string
  dealId?: string

  // Lead identity
  name?: string
  email: string
  phone?: string
  company?: string

  // Context
  website?: string
  industry?: string
  message?: string

  // Tracking
  status: LeadStatus
  source: "audit" | "manual" | "referral" | "campaign"
  priority?: LeadPriority

  // Revenue tracking (future-proof)
  estimatedValue?: number
  actualValue?: number

  // Timestamps
  createdAt: string
  updatedAt: string
  convertedAt?: string
  lastContactedAt?: string
  nextFollowUpAt?: string

  // Additional notes
  notes?: string
}
