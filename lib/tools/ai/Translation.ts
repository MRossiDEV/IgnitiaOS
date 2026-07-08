import { AITool } from "./AITool"
import type { Tool } from "../types"

export const Translation: Tool = {
  name: "ai_translation",
  description: "Translate content between languages while preserving meaning",
  async run(input) {
    return AITool.run({
      ...input,
      objective: `Translate the content into ${String(input.targetLanguage || input.language || "the requested language")}`,
      outputFormat: input.outputFormat || "translated text",
      tone: input.tone || "natural",
    })
  },
}
