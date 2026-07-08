export type AIAgentStatus = "active" | "paused" | "training" | "error"

export type AIAgentRole =
  | "lead_qualifier"
  | "auditor"
  | "content_writer"
  | "voicebot"
  | "router"
  | "report_composer"
  | "outreach"
  | "pricing"

export type AIAgentModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3.5-sonnet"
  | "claude-3.5-haiku"
  | "gemini-1.5-pro"

export type AIAgent = {
  id: string
  name: string
  role: AIAgentRole
  description: string
  status: AIAgentStatus
  model: AIAgentModel
  promptTemplate?: string
  capabilities: string[]
  totalRuns: number
  successRate: number
  avgLatencyMs: number
  creditsConsumed: number
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}
