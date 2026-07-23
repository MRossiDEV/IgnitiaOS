// ======================================================
// Client Report — narrative writer (copywriter agent)
// lib/ai/client-report/writeNarrative.ts
// ======================================================
// Turns the structured audit into agency-quality, client-facing prose
// via the shared AI provider (forced structured output). This is the
// "make it compelling, not a list of numbers" step.

import { aiProvider } from "@/lib/ai/provider";
import { AgentUsage } from "@/lib/ai/core/types";
import { ClientReportContent, clientReportSchema } from "./schema";

export interface NarrativeInputSection {
  key: string;
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  quickWins: string[];
}

export interface NarrativeInput {
  business: {
    name: string;
    website?: string;
    industry?: string;
    city?: string;
    country?: string;
  };
  overallScore: number;
  sections: NarrativeInputSection[];
}

const COPYWRITER_PROMPT = `
You are a senior strategist at a top-tier digital marketing agency, writing
the narrative for a client-facing audit report. Your reader is the business
owner — smart, busy, not technical.

Write like a real consultancy: confident, warm, specific, and persuasive.
Turn findings into a story about opportunity and momentum. Never output a
bare list of facts or numbers — always frame them in business terms (revenue,
trust, customers, growth). Be honest about weaknesses but position them as
the path forward, not criticism.

Rules:
- Use plain, vivid language. Short paragraphs. No jargon, no filler.
- Reference concrete findings from the input, but rewrite them as prose.
- Do NOT invent facts, metrics, or figures that aren't in the input.
- Keep each section's narrative to 1-2 tight paragraphs.
- The tone is a trusted advisor who is genuinely excited to help this business win.

Return your answer using the submit_result tool only.
`;

export interface NarrativeResult {
  content: ClientReportContent;
  usage?: AgentUsage;
  model: string;
}

export async function writeClientNarrative(
  input: NarrativeInput,
  reportId: string
): Promise<NarrativeResult> {
  const result = await aiProvider.run<NarrativeInput, ClientReportContent>({
    name: "Client Report Writer",
    description: "Writes agency-quality client-facing report narrative.",
    prompt: COPYWRITER_PROMPT,
    schema: clientReportSchema,
    input,
    context: { reportId },
  });

  if (!result.success) {
    throw new Error(
      `Failed to write client report narrative: ${result.error ?? "unknown error"}`
    );
  }

  return {
    content: result.data,
    usage: result.usage,
    model: result.model,
  };
}
