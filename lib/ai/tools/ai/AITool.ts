import { aiconn } from "@/ai/aiconn"
import type { AIInput, AIProviderId, AITaskResult } from "./AITypes"
import { DEFAULT_AI_MAX_TOKENS, DEFAULT_AI_MODEL, DEFAULT_AI_PROVIDER, DEFAULT_AI_TEMPERATURE } from "./constants"
import { buildPrompt } from "./PromptBuilder"
import { getAIProvider } from "./Providers"
import type { Tool } from "../types"

async function runWithAnthropic(prompt: string, input: AIInput) {
  const provider = getAIProvider(input.provider || DEFAULT_AI_PROVIDER)
  const model = String(input.model || provider.model || DEFAULT_AI_MODEL)

  if (!provider.enabled) {
    throw new Error(`${provider.name} is not configured. Set the required API key to enable this provider.`)
  }

  const response = await aiconn.messages.create({
    model,
    max_tokens: Number(input.max_tokens || DEFAULT_AI_MAX_TOKENS),
    temperature: Number(input.temperature || DEFAULT_AI_TEMPERATURE),
    system: String(input.systemPrompt || input.system_prompt || "You are Ignitia AI. Return clear, structured business output."),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const output = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")

  return {
    provider: provider.id,
    model,
    prompt,
    output,
  } satisfies AITaskResult
}

function createBasicOutput(action: string, prompt: string) {
  return [
    `${action} completed.`,
    "",
    prompt,
  ].join("\n")
}

export const AITool: Tool = {
  name: "ai_tool",
  description: "Unified AI generation engine for structured business tasks",
  async run(input) {
    const prompt = buildPrompt(input)
    const provider = getAIProvider(input.provider || DEFAULT_AI_PROVIDER)

    if (provider.id === "anthropic") {
      return runWithAnthropic(prompt, input)
    }

    return {
      provider: provider.id,
      model: String(input.model || provider.model || DEFAULT_AI_MODEL),
      prompt,
      output: createBasicOutput(provider.name, prompt),
    }
  },
}
