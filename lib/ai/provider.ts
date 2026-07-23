// ======================================================
// IgnitiaOS
// AI Provider — the ONLY file that talks to Anthropic
// lib/ai/provider.ts
// ======================================================

import Anthropic from "@anthropic-ai/sdk";
import {
  AgentRunOptions,
  AgentResult,
  AgentUsage,
} from "@/lib/ai/core/types";
import { registerUsage, estimateCost } from "@/lib/ai/core/tokenTracker";
import { parseClaudeJSON } from "@/lib/ai/core/jsonParser";
import { CreditService } from "@/lib/services/CreditService";

// Lazy client: read the key at call time, not module load, so an empty
// key at import time (e.g. during build) can't get snapshotted and
// permanently break every call with "Could not resolve authentication method".
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

// This account can only reach the Claude 5 family — claude-sonnet-5,
// claude-opus-4-8, claude-haiku-4-5-20251001. Older ids like
// claude-3-5-sonnet-latest / claude-3-5-* / claude-sonnet-4-* all 404.
const DEFAULT_MODEL = "claude-sonnet-5";
const RESULT_TOOL_NAME = "submit_result";

export const aiProvider = {
  async run<TInput, TOutput>(
    options: AgentRunOptions<TInput, TOutput>
  ): Promise<AgentResult<TOutput>> {
    const started = Date.now();
    const model = options.model ?? DEFAULT_MODEL;

    try {
      // Claude 5 models reject `temperature` outright (400: "temperature is
      // deprecated for this model") — never send it, regardless of options.
      const message = await getClient().messages.create({
        model,
        max_tokens: 4096,
        system: options.prompt,
        messages: [
          {
            role: "user",
            content: JSON.stringify(options.input, null, 2),
          },
        ],
        tools: [
          {
            name: RESULT_TOOL_NAME,
            description: "Submit the structured analysis result.",
            input_schema: options.schema as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: "tool", name: RESULT_TOOL_NAME },
      });

      const toolUse = message.content.find(
        (block): block is Anthropic.ToolUseBlock =>
          block.type === "tool_use"
      );

      let data: TOutput;

      if (toolUse) {
        // Preferred path: Claude called the tool with structured input.
        data = toolUse.input as TOutput;
      } else {
        // Fallback: some responses may come back as plain text JSON.
        const textBlock = message.content.find(
          (block): block is Anthropic.TextBlock => block.type === "text"
        );

        if (!textBlock) {
          throw new Error("Claude returned no usable content.");
        }

        data = parseClaudeJSON<TOutput>(textBlock.text);
      }

      const usage: AgentUsage = {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        totalTokens:
          message.usage.input_tokens + message.usage.output_tokens,
      };

      registerUsage(options.name, usage);
      // Deduct real spend from the remaining-credits balance. This is the
      // one chokepoint every Claude call in the app goes through, so every
      // node/pipeline that calls aiProvider.run() is covered automatically —
      // recordUsage() never throws, so a tracking failure can't break the
      // call that triggered it.
      await CreditService.recordUsage(estimateCost(usage, model));

      return {
        success: true,
        agent: options.name,
        duration: Date.now() - started,
        model,
        usage,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        agent: options.name,
        duration: Date.now() - started,
        model,
        data: {} as TOutput,
        error: error.message ?? "Unknown provider error",
      };
    }
  },
};
