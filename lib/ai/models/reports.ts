type RevenueModel = {
  estimatedMonthlyLoss: {
    low: number
    high: number
  }
  breakdown: {
    category: string
    estimatedLoss: number
    confidence: number
  }[]
}

type Bottleneck = {
  id: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  category: string
}

type BenchmarkComparison = {
  metric: string
  yourScore: number
  industryAverage: number
  topPerformers: number
}

type Recommendation = {
  id: string
  title: string
  summary: string
  estimatedImpact?: number
  executionDifficulty?: "easy" | "medium" | "hard"
  priority?: number
}

type FunnelModel = {
  stages: {
    name: string
    description: string
    optimizationGoal: string
  }[]
}

type AutomationPlan = {
  triggers: {
    event: string
    action: string
    delay: string
  }[]
}

export type Report = {
  id: string
  leadId: string
  businessName: string
  industry: string
  website?: string

  type: "snapshot" | "blueprint"
  status: "draft" | "generated" | "delivered"

  aiConfidenceScore: number // 0–100

  revenueModel: RevenueModel
  bottlenecks: Bottleneck[]
  benchmarks: BenchmarkComparison[]
  recommendations: Recommendation[]

  funnelModel?: FunnelModel
  automationPlan?: AutomationPlan

  createdAt: string
  updatedAt: string
}
