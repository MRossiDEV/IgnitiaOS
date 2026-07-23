export type CreditTransactionType =
  | "purchase"
  | "spend"
  | "refund"
  | "grant"
  | "adjustment"

export type CreditSpendCategory =
  | "lead_unlock"
  | "ai_audit"
  | "report"
  | "workflow_run"
  | "voicebot_minute"
  | "marketplace_purchase"

export type CreditTransactionStatus = "completed" | "pending" | "failed" | "reversed"

export type CreditTransaction = {
  id: string
  partnerId: string
  type: CreditTransactionType
  amount: number
  balanceAfter: number
  category?: CreditSpendCategory
  reference?: string
  description: string
  status: CreditTransactionStatus
  createdAt: string
}

export type CreditPackage = {
  id: string
  name: string
  credits: number
  price: number
  bonusCredits: number
  popular?: boolean
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "pkg_starter", name: "Starter", credits: 1000, price: 49, bonusCredits: 0 },
  { id: "pkg_growth", name: "Growth", credits: 5000, price: 199, bonusCredits: 500, popular: true },
  { id: "pkg_scale", name: "Scale", credits: 15000, price: 499, bonusCredits: 2500 },
  { id: "pkg_enterprise", name: "Enterprise", credits: 50000, price: 1499, bonusCredits: 10000 },
]
