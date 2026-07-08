import { AITool } from "./AITool"
import type { Tool } from "../types"

export const Classification: Tool = {
  name: "ai_classification",
  description: "Classify text, leads, messages, or documents into structured labels",
  async run(input) {
    return AITool.run({
      ...input,
      objective: "Classify the provided input into useful labels",
      outputFormat: input.outputFormat || "classification labels and reasoning",
      tone: input.tone || "analytical",
    })
  },
}
