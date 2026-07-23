// ======================================================
// IgnitiaOS
// Shared Audit Schema — used by every specialist
// lib/ai/schemas/audit.ts
// ======================================================
// Rule: specialists never invent their own output shape from
// scratch. They extend this so the Report Builder can treat
// every specialist result identically.

export interface AuditFinding {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface BaseAudit {
  score: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  quickWins: string[];
  findings: AuditFinding[];
}

// Reusable JSON schema fragment (for Anthropic tool-use input_schema).
// Specialists spread this and only add fields unique to their domain.
export const baseAuditSchemaProperties = {
  score: {
    type: "number",
    description: "Overall score for this domain, 0-100.",
  },
  summary: {
    type: "string",
    description: "2-3 sentence plain-language summary of the finding.",
  },
  strengths: { type: "array", items: { type: "string" } },
  weaknesses: { type: "array", items: { type: "string" } },
  opportunities: { type: "array", items: { type: "string" } },
  quickWins: { type: "array", items: { type: "string" } },
  findings: {
    type: "array",
    items: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        severity: { type: "string", enum: ["low", "medium", "high"] },
      },
      required: ["title", "description", "severity"],
    },
  },
} as const;

export const baseAuditRequired = [
  "score",
  "summary",
  "strengths",
  "weaknesses",
  "opportunities",
  "quickWins",
  "findings",
];
