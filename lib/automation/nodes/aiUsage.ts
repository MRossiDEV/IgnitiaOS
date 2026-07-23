// ======================================================
// AI Node Usage/Cost Helper
// lib/automation/nodes/aiUsage.ts
// ======================================================
// Every AI-category node attaches a `_usage` field to its output
// so the canvas can show live token/cost stats per node, reusing
// the same pricing table the report pipeline's cost tracking uses.

import { estimateCost } from "@/lib/ai/core/tokenTracker";
import type { AgentResult } from "@/lib/ai/core/types";

export const MODEL_OPTIONS = [
  { value: "claude-sonnet-5", label: "Claude Sonnet 5 (balanced)" },
  { value: "claude-opus-4-8", label: "Claude Opus 4.8 (most capable)" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (fastest/cheapest)" },
];

export interface UsageStamp {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}

/** Merges the resolved model + token/cost stats onto an AI node's output. */
export function withUsage<T extends object>(data: T, result: AgentResult<unknown>): T & { _usage: UsageStamp } {
  const usage = result.usage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  return {
    ...data,
    _usage: {
      model: result.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      costUsd: estimateCost(usage, result.model),
      durationMs: result.duration,
    },
  };
}
