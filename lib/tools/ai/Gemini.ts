import type { AIProviderConfig } from "./AITypes"

export const GeminiProvider: AIProviderConfig = {
  id: "gemini",
  name: "Gemini",
  description: "Google Gemini models",
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  enabled: Boolean(process.env.GEMINI_API_KEY),
}
