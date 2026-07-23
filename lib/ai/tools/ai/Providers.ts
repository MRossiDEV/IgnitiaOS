import { AnthropicProvider } from "./Anthropic"
import { GeminiProvider } from "./Gemini"
import { OllamaProvider } from "./Ollama"
import { OpenAIProvider } from "./OpenAI"
import type { AIProviderConfig, AIProviderId } from "./AITypes"

export const AIProviders: Record<AIProviderId, AIProviderConfig> = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  ollama: OllamaProvider,
}

export function getAIProvider(provider?: string): AIProviderConfig {
  const key = (provider || "anthropic").toLowerCase() as AIProviderId

  return AIProviders[key] ?? AIProviders.anthropic
}

export function listAIProviders() {
  return Object.values(AIProviders)
}
