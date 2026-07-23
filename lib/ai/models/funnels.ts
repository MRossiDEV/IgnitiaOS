export type Funnel = {
  id: string
  dealId: string
  name: string
  createdAt: string
  updatedAt: string
  steps: FunnelStep[]
}

export type FunnelStep = {
  id: string
  type: "hero" | "features" | "form" | "testimonial" | "cta"
  content: string
  order: number
}
