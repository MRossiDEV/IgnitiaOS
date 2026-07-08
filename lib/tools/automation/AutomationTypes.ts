import type { Tool } from "../types"

export type AutomationChannel = "workflow" | "webhook" | "scheduler" | "email" | "slack" | "whatsapp" | "n8n"

export type AutomationStatus = "queued" | "scheduled" | "sent" | "completed" | "fallback"

export type AutomationJob = {
  channel: AutomationChannel
  status: AutomationStatus
  title: string
  payload: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
}

export type AutomationToolInput = Record<string, any>

export type AutomationTool = Tool
