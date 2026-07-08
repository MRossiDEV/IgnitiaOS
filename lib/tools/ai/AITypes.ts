import type { Tool } from "../types"

export type AIProviderId = "anthropic" | "openai" | "gemini" | "ollama"

export type AIProviderConfig = {
  id: AIProviderId
  name: string
  description: string
  model?: string
  enabled: boolean
}

export type AIMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type AITaskResult = {
  provider: AIProviderId
  model: string
  prompt: string
  output: string
}

export type AIInput = Record<string, any>

export type AITool = Tool
