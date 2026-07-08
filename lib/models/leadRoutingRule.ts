export type LeadRoutingRuleStatus = "active" | "paused" | "draft"
export type LeadRoutingActionType =
  | "assign_partner"
  | "list_marketplace"
  | "queue_review"
  | "auto_nurture"
  | "discard"

export type LeadRoutingMatchMode = "all" | "any"

export type LeadRoutingCondition = {
  field: "industry" | "source" | "priority" | "leadScore" | "estimatedValue" | "country"
  operator: "equals" | "in" | "gte" | "lte"
  value: string | number | string[]
}

export type LeadRoutingRule = {
  id: string
  name: string
  description?: string
  priority: number
  status: LeadRoutingRuleStatus
  matchMode: LeadRoutingMatchMode
  conditions: LeadRoutingCondition[]
  action: LeadRoutingActionType
  actionTarget?: string
  matchedLeads: number
  routedLeads: number
  conversions: number
  createdAt: string
  updatedAt: string
}
