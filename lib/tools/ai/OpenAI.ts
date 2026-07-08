import type { AIProviderConfig } from "./AITypes"

export const OpenAIProvider: AIProviderConfig = {
  id: "openai",
  name: "OpenAI",
  description: "OpenAI GPT models via the OpenAI API",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  enabled: Boolean(process.env.OPENAI_API_KEY),
}
