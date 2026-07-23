import { AITool } from "./AITool"
import type { Tool } from "../types"

export const Rewrite: Tool = {
  name: "ai_rewrite",
  description: "Rewrite content for clarity, tone, or conversion",
  async run(input) {
    return AITool.run({
      ...input,
      objective: "Rewrite the provided content",
      outputFormat: input.outputFormat || "rewritten version",
    })
  },
}
