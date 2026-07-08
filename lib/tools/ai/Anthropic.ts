import { AI_PROVIDER_IDS } from "./constants"
import type { AIProviderConfig } from "./AITypes"

export const AnthropicProvider: AIProviderConfig = {
  id: "anthropic",
  name: "Anthropic",
  description: "Anthropic Claude and other Anthropic-hosted models",
  model: "claude-haiku-4-5-20251001",
  enabled: Boolean(process.env.ANTHROPIC_API_KEY),
}

export function isAnthropicEnabled() {
  return AnthropicProvider.enabled && AI_PROVIDER_IDS.includes(AnthropicProvider.id)
}
