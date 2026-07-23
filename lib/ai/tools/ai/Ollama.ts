import type { AIProviderConfig } from "./AITypes"

export const OllamaProvider: AIProviderConfig = {
  id: "ollama",
  name: "Ollama",
  description: "Local OpenAI-compatible models served by Ollama",
  model: process.env.OLLAMA_MODEL || "llama3.1",
  enabled: Boolean(process.env.OLLAMA_HOST || process.env.OLLAMA_API_KEY),
}
