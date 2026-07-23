import type { Tool } from "../types";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const LLMTool: Tool = {
  name: "LLM",

  description:
    "AI reasoning engine",

  async run(input) {
    const prompt =
      input.prompt ??
      "Analyze this website";

    const markdown =
      input.markdown ?? "";

    const completion =
      await client.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 4096,
        system: prompt,
        messages: [
          {
            role: "user",
            content: String(markdown).slice(
              0,
              12000
            ),
          },
        ],
      });

    const response =
      completion.content[0]?.type === "text"
        ? completion.content[0].text
        : "";

    return {
      analysis: response,
    };
  },
};
