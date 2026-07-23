/**
 * Offer Model
 * Represents one of the three productized services
 */

export type OfferType = 'audit' | 'optimization' | 'growth_automation'

export interface Offer {
  id: OfferType
  name: string
  description: string
  price_min: number
  price_max: number
  delivery_days_min: number
  delivery_days_max: number
  deliverables: string[]
  icon: string // Icon name for UI
  features: string[]
}

export const OFFERS: Record<OfferType, Offer> = {
  audit: {
    id: 'audit',
    name: 'AI SEO & Growth Audit',
    description: 'Get a comprehensive analysis of your website and growth potential',
    price_min: 249,
    price_max: 349,
    delivery_days_min: 3,
    delivery_days_max: 5,
    deliverables: [
      'Website crawl & analysis',
      'SEO scoring report',
      'Competitor analysis',
      'Quick wins checklist',
      '30-minute strategy call'
    ],
    icon: 'TrendingUp',
    features: [
      'Technical SEO review',
      'Keyword research',
      'Competitor insights',
      'Action plan'
    ]
  },
  optimization: {
    id: 'optimization',
    name: 'Website & AI Content Optimization',
    description: 'Get your site optimized and new AI-generated content implemented',
    price_min: 500,
    price_max: 900,
    delivery_days_min: 7,
    delivery_days_max: 14,
    deliverables: [
      'Website optimization',
      'AI-generated content',
      'Implementation',
      'SEO improvements',
      'Before/after report'
    ],
    icon: 'Code',
    features: [
      'On-page optimization',
      'Content creation',
      'Technical fixes',
      'Handoff & training'
    ]
  },
  growth_automation: {
    id: 'growth_automation',
    name: 'Monthly AI Growth & Automation',
    description: 'Recurring monthly service with ongoing optimization and automation setup',
    price_min: 500,
    price_max: 1500,
    delivery_days_min: 30,
    delivery_days_max: 30,
    deliverables: [
      'Monthly optimization',
      'Automation setup',
      'Lead nurturing',
      'Monthly reports',
      'Ongoing support'
    ],
    icon: 'Zap',
    features: [
      'Continuous improvements',
      'Automation workflows',
      'Lead management',
      'Monthly analytics'
    ]
  }
}

// Helper to get offer by ID
export function getOffer(id: OfferType): Offer {
  return OFFERS[id]
}

// Get all offers
export function getAllOffers(): Offer[] {
  return Object.values(OFFERS)
}
