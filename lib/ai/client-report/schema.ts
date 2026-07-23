// ======================================================
// Client Report — AI narrative schema
// lib/ai/client-report/schema.ts
// ======================================================
// The structured output the copywriter agent must return. The
// renderer turns this into a designed, client-facing PDF. The whole
// point is prose that reads like a consultancy wrote it — not a dump
// of scores and bullet lists.

export interface ClientReportSection {
  key: string;
  headline: string; // punchy, benefit-oriented section title
  narrative: string; // 1-2 short paragraphs of persuasive prose
  keyPoints: string[]; // 2-4 crisp takeaways
}

export interface ClientReportPriority {
  title: string;
  rationale: string; // why it matters, in business terms
  impact: "High" | "Medium" | "Low";
  timeframe: string; // e.g. "0-30 days"
}

export interface ClientReportContent {
  tagline: string; // cover subtitle, one compelling line
  headline: string; // the report's big-picture headline
  executiveSummary: string; // 2-3 paragraphs, confident and specific
  overallVerdict: string; // one strong sentence summarizing standing
  sections: ClientReportSection[];
  priorities: ClientReportPriority[]; // 3-5 prioritized moves
  closing: string; // warm, forward-looking CTA paragraph
}

export const clientReportSchema = {
  type: "object",
  properties: {
    tagline: {
      type: "string",
      description:
        "One compelling subtitle line for the cover, e.g. 'A growth audit and roadmap for <business>'.",
    },
    headline: {
      type: "string",
      description:
        "The big-picture headline of the report — the single most important message for the client.",
    },
    executiveSummary: {
      type: "string",
      description:
        "2-3 short paragraphs. Confident, specific, benefit-oriented. Speak to the business owner. Reference concrete findings but frame them as opportunity, not just problems.",
    },
    overallVerdict: {
      type: "string",
      description:
        "One strong sentence summarizing where the business stands today.",
    },
    sections: {
      type: "array",
      description:
        "One entry per analysis area provided in the input. Rewrite each as persuasive prose, not a list.",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "The section key from the input." },
          headline: {
            type: "string",
            description: "Punchy, benefit-oriented title for this section.",
          },
          narrative: {
            type: "string",
            description:
              "1-2 short paragraphs of persuasive, plain-language prose about this area.",
          },
          keyPoints: {
            type: "array",
            items: { type: "string" },
            description: "2-4 crisp, concrete takeaways.",
          },
        },
        required: ["key", "headline", "narrative", "keyPoints"],
      },
    },
    priorities: {
      type: "array",
      description: "3-5 prioritized recommendations framed as business moves.",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          rationale: {
            type: "string",
            description: "Why it matters, in business/revenue terms.",
          },
          impact: { type: "string", enum: ["High", "Medium", "Low"] },
          timeframe: {
            type: "string",
            description: "Suggested window, e.g. '0-30 days', '30-60 days'.",
          },
        },
        required: ["title", "rationale", "impact", "timeframe"],
      },
    },
    closing: {
      type: "string",
      description:
        "A warm, forward-looking closing paragraph that invites the client to act. No hard sell.",
    },
  },
  required: [
    "tagline",
    "headline",
    "executiveSummary",
    "overallVerdict",
    "sections",
    "priorities",
    "closing",
  ],
} as const;
