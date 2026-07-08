export const DEFAULT_AI_PROVIDER = "anthropic"
export const DEFAULT_AI_MODEL = "claude-haiku-4-5-20251001"
export const DEFAULT_AI_TEMPERATURE = 0.3
export const DEFAULT_AI_MAX_TOKENS = 4000

export const AI_PROVIDER_IDS = [
  "anthropic",
  "openai",
  "gemini",
  "ollama",
] as const
