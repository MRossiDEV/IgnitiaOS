// ======================================================
// Report Builder
// lib/ai/report-builder/ReportBuilder.ts
// ======================================================
// Rules: no AI during MVP. Only assembles Scores, Charts,
// Recommendations, Strengths, Weaknesses, Opportunities,
// Quick Wins. Never invents information — only formats
// what specialists already produced.

import { ReportMemory } from "@/lib/ai/core/types";
import { BaseAudit } from "@/lib/ai/schemas/audit";

export interface ReportSection {
  key: string;
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  quickWins: string[];
  findings: BaseAudit["findings"];
}

export interface AssembledReport {
  reportId: string;
  business: ReportMemory["business"];
  overallScore: number;
  sections: ReportSection[];
  generatedAt: string;
}

const SECTION_LABELS: Record<string, string> = {
  website: "Website",
  seo: "SEO",
  content: "Content",
  ux: "User Experience",
  conversion: "Conversion",
  branding: "Branding",
  copywriting: "Copywriting",
  social: "Social Media",
  google: "Google Business",
  reputation: "Reputation",
  competitors: "Competitors",
  performance: "Performance",
  accessibility: "Accessibility",
  trust: "Trust",
  analytics: "Analytics",
  crm: "CRM",
  sales: "Sales",
  email: "Email Marketing",
  strategy: "Strategy",
};

export class ReportBuilder {
  build(memory: ReportMemory): AssembledReport {
    const sections: ReportSection[] = [];

    for (const [key, audit] of Object.entries(memory.analysis)) {
      if (!audit) continue;

      const typed = audit as BaseAudit;

      sections.push({
        key,
        label: SECTION_LABELS[key] ?? key,
        score: typed.score ?? 0,
        summary: typed.summary ?? "",
        strengths: typed.strengths ?? [],
        weaknesses: typed.weaknesses ?? [],
        opportunities: typed.opportunities ?? [],
        quickWins: typed.quickWins ?? [],
        findings: typed.findings ?? [],
      });
    }

    const overallScore =
      sections.length === 0
        ? 0
        : Math.round(
            sections.reduce((sum, s) => sum + s.score, 0) / sections.length
          );

    return {
      reportId: memory.reportId,
      business: memory.business,
      overallScore,
      sections,
      generatedAt: new Date().toISOString(),
    };
  }
}
