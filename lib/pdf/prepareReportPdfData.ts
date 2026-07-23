// ======================================================
// Prepare Report PDF Data
// lib/pdf/prepareReportPdfData.ts
// ======================================================
// Transforms a real AssembledReport (from ReportBuilder) into
// the flat page-shaped data the PDF document needs. Kept
// separate from ReportDocument.tsx so the PDF component stays
// purely presentational.

import { AssembledReport, ReportSection } from "@/lib/ai/report-builder";
import { ReportMemory } from "@/lib/ai/core/types";

export interface CoverPdfData {
  hook: string;
  subtitle: string;
  businessName: string;
  industry: string;
  location: string;
  website: string;
  date: string;
  overallScore: number;
  ratingLabel: string;
}

export interface SummaryPdfData {
  headline: string;
  body: string;
  sections: { label: string; score: number }[];
}

export interface InsightPdfItem {
  number: number;
  headline: string;
  body: string;
  takeaways: string[];
}

export interface RoadmapPdfItem {
  title: string;
  impact: "high" | "medium" | "low";
  timeframe: string;
  body: string;
}

export interface ClosingPdfData {
  headline: string;
  body: string;
  ctaText: string;
  businessName: string;
}

export interface ReportPdfData {
  cover: CoverPdfData;
  summary: SummaryPdfData;
  insights: InsightPdfItem[];
  roadmap: RoadmapPdfItem[];
  closing: ClosingPdfData;
}

function ratingLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 45) return "Developing";
  return "Needs Attention";
}

function buildHook(overallScore: number, sections: ReportSection[]): string {
  const weakest = [...sections].sort((a, b) => a.score - b.score)[0];
  const strongest = [...sections].sort((a, b) => b.score - a.score)[0];

  if (!weakest || !strongest || weakest.key === strongest.key) {
    return "Here's where the real opportunity is.";
  }

  return `Your ${strongest.label.toLowerCase()} is strong \u2014 your ${weakest.label.toLowerCase()} is leaving opportunity on the table.`;
}

function buildRoadmap(
  sections: ReportSection[],
  limit = 5
): RoadmapPdfItem[] {
  const timeframes = ["0-30 days", "0-30 days", "30-60 days", "30-60 days", "60-90 days"];

  const candidates = [...sections]
    .sort((a, b) => a.score - b.score)
    .flatMap((section) =>
      (section.quickWins.length ? section.quickWins : section.opportunities).map(
        (text) => ({ text, score: section.score })
      )
    )
    .slice(0, limit);

  return candidates.map((item, i) => ({
    title: item.text,
    impact: item.score < 50 ? "high" : item.score < 75 ? "medium" : "low",
    timeframe: timeframes[i] ?? "60-90 days",
    body: "",
  }));
}

export function prepareReportPdfData(
  report: AssembledReport,
  business: ReportMemory["business"]
): ReportPdfData {
  const sections = report.sections;

  const cover: CoverPdfData = {
    hook: buildHook(report.overallScore, sections),
    subtitle: `A growth audit and 90-day roadmap for ${business.name}.`,
    businessName: business.name,
    industry: business.industry || "\u2014",
    location: [business.city, business.country].filter(Boolean).join(", ") || "\u2014",
    website: business.website || "\u2014",
    date: new Date(report.generatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    overallScore: report.overallScore,
    ratingLabel: ratingLabel(report.overallScore),
  };

  const summary: SummaryPdfData = {
    headline: `Where ${business.name} stands today`,
    body: `${business.name} scored ${report.overallScore}/100 overall across ${sections.length} areas we analyzed. This report breaks down what's working, what isn't, and the order to fix it in.`,
    sections: sections.map((s) => ({ label: s.label, score: s.score })),
  };

  const insights: InsightPdfItem[] = sections.map((s, i) => ({
    number: i + 1,
    headline: `${s.label}: ${s.score}/100`,
    body: s.summary,
    takeaways: (s.quickWins.length ? s.quickWins : s.strengths).slice(0, 3),
  }));

  const roadmap = buildRoadmap(sections);

  const closing: ClosingPdfData = {
    headline: "Ready to turn this roadmap into results?",
    body: `You've built something worth scaling. With a focused push on the priorities above, the next two quarters can look very different for ${business.name}.`,
    ctaText: "Book your strategy session",
    businessName: business.name,
  };

  return { cover, summary, insights, roadmap, closing };
}
