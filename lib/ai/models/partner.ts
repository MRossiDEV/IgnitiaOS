export type PartnerStatus = "active" | "paused" | "archived"

export interface Partner {
  id: string

  // Basic info
  name: string
  companyName?: string
  email: string
  phone?: string
  website?: string

  // Business context
  industry?: string
  country?: string
  city?: string

  // Partnership status
  status: PartnerStatus

  // Internal notes
  notes?: string

  // Metadata
  createdAt: string
  updatedAt: string
}
