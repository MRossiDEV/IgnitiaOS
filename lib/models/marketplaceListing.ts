export type MarketplaceListingStatus = "available" | "reserved" | "sold" | "expired"
export type MarketplaceExclusivity = "exclusive" | "shared"
export type MarketplaceIntent = "buy" | "subscribe" | "book" | "quote"

export type MarketplaceListing = {
  id: string
  leadId: string
  alias: string
  industry: string
  location: string
  intent: MarketplaceIntent
  exclusivity: MarketplaceExclusivity
  leadScore: number
  estimatedBudget: number
  price: number
  views: number
  reservations: number
  status: MarketplaceListingStatus
  partnerId?: string
  buyerPartnerId?: string
  listedAt: string
  expiresAt?: string
  soldAt?: string
}
