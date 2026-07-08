import { AITool } from "./AITool"
import type { Tool } from "../types"

export const Chat: Tool = {
  name: "ai_chat",
  description: "Conversational AI chat for business questions and agent support",
  async run(input) {
    return AITool.run({
      ...input,
      objective: input.objective || input.prompt || input.message || "Have a helpful business conversation",
      outputFormat: input.outputFormat || "chat response",
    })
  },
}
