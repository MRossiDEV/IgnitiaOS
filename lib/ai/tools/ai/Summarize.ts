import { AITool } from "./AITool"
import type { Tool } from "../types"

export const Summarize: Tool = {
  name: "ai_summarize",
  description: "Summarize long content into concise business-ready bullets",
  async run(input) {
    return AITool.run({
      ...input,
      objective: "Summarize the provided content",
      outputFormat: input.outputFormat || "summary with key takeaways",
      tone: input.tone || "concise",
    })
  },
}
