import { AIProviders, getAIProvider } from "./Providers"

export type AIModelRecord = {
  provider: string
  model: string
  enabled: boolean
}

export function listAIModels(): AIModelRecord[] {
  return Object.values(AIProviders).map((provider) => ({
    provider: provider.id,
    model: provider.model || "unknown",
    enabled: provider.enabled,
  }))
}

export function resolveDefaultAIModel(provider?: string) {
  const selected = getAIProvider(provider)
  return selected.model || "unknown"
}
