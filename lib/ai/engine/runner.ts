import { ZodSchema } from "zod";

import { aiconn } from "@/ai/aiconn";

import {
  AgentResult,
  AgentRunOptions,
} from "./types";

export async function runAgent<TInput, TOutput>(
  options: AgentRunOptions<TInput, TOutput>,
): Promise<AgentResult<TOutput>> {
  const started = Date.now();

  const retries = options.retries ?? 2;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await aiconn.messages.create({
        model: options.model ?? "claude-sonnet-4-20250514",

        max_tokens: 4096,

        temperature: options.temperature ?? 0.2,

        system: `${options.prompt}

          IMPORTANT:
          Return ONLY valid JSON.
          Do not use markdown.
          Do not wrap the JSON in \`\`\`.
          Do not explain anything.`,

        messages: [
          {
            role: "user",
            content: JSON.stringify(options.input),
          },
        ],
      });

      const text = response.content
        .filter(
          (
            block,
          ): block is Extract<
            (typeof response.content)[number],
            { type: "text" }
          > => block.type === "text",
        )
        .map((block) => block.text)
        .join("");

      const parsed = JSON.parse(text);

      const validated = (
        options.schema as ZodSchema<TOutput>
      ).parse(parsed);

      return {
        success: true,

        agent: options.name,

        model: response.model,

        duration: Date.now() - started,

        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens:
            response.usage.input_tokens +
            response.usage.output_tokens,
        },

        data: validated,
      };
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise((r) =>
          setTimeout(r, 1000),
        );

        continue;
      }
    }
  }

  return {
    success: false,

    agent: options.name,

    model: options.model ?? "claude-sonnet-4-20250514",

    duration: Date.now() - started,

    error:
      lastError instanceof Error
        ? lastError.message
        : "Unknown AI error",

    data: {} as TOutput,
  };
}