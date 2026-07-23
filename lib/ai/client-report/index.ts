// ======================================================
// Client Report — orchestrator
// lib/ai/client-report/index.ts
// ======================================================
// Given a persisted `reports` row, produces agency-style narrative and
// renders it into a polished HTML/PDF. The narrative is the expensive
// (AI) step, so it is cached on the row (metadata.clientReport) and
// reused by both the in-browser preview and the PDF download — see
// resolveClientContent(). DB writes live in persist.ts, not here.

import { AgentUsage } from "@/lib/ai/core/types";
import { writeClientNarrative, NarrativeInputSection } from "./writeNarrative";
import { renderClientReportHtml, RenderMeta, ScorecardEntry } from "./renderHtml";
import { htmlToPdf } from "./generatePdf";
import { ClientReportContent } from "./schema";

export type { ClientReportContent } from "./schema";

export interface ReportRowLike {
  id: string;
  business_name?: string | null;
  business_website?: string | null;
  industry?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  overall_score?: number | null;
  report_code?: string | null;
  metadata?: Record<string, any> | null;
}

export interface ResolvedContent {
  content: ClientReportContent;
  usage?: AgentUsage;
  model?: string;
  cached: boolean;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "report"
  );
}

/** Pulls the analysis sections off the report row (throws if none). */
export function getReportSections(row: ReportRowLike): NarrativeInputSection[] {
  const metadata = (row.metadata ?? {}) as Record<string, any>;
  const raw: any[] = metadata.report?.sections ?? metadata.sections ?? [];

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(
      "This report has no completed analysis yet. Generate the report before exporting a client PDF."
    );
  }

  return raw.map((s) => ({
    key: String(s.key ?? ""),
    label: String(s.label ?? s.key ?? ""),
    score: Number(s.score ?? 0),
    summary: String(s.summary ?? ""),
    strengths: Array.isArray(s.strengths) ? s.strengths : [],
    weaknesses: Array.isArray(s.weaknesses) ? s.weaknesses : [],
    opportunities: Array.isArray(s.opportunities) ? s.opportunities : [],
    quickWins: Array.isArray(s.quickWins) ? s.quickWins : [],
  }));
}

function overallScoreOf(row: ReportRowLike): number {
  const metadata = (row.metadata ?? {}) as Record<string, any>;
  return Number(row.overall_score ?? metadata.report?.overallScore ?? 0) || 0;
}

/**
 * Returns the client-report narrative for a row: the cached copy if one
 * exists (and refresh isn't requested), otherwise a freshly written one.
 * Does not persist — the caller decides when to save (see persist.ts).
 */
export async function resolveClientContent(
  row: ReportRowLike,
  opts: { refresh?: boolean } = {}
): Promise<ResolvedContent> {
  const metadata = (row.metadata ?? {}) as Record<string, any>;
  const cached = metadata.clientReport as ClientReportContent | undefined;

  if (!opts.refresh && cached && Array.isArray(cached.sections)) {
    return { content: cached, cached: true };
  }

  const sections = getReportSections(row);
  const narrative = await writeClientNarrative(
    {
      business: {
        name: row.business_name || "the business",
        website: row.business_website ?? undefined,
        industry: row.industry ?? undefined,
        city: row.city ?? undefined,
        country: row.country ?? undefined,
      },
      overallScore: overallScoreOf(row),
      sections,
    },
    row.id
  );

  return {
    content: narrative.content,
    usage: narrative.usage,
    model: narrative.model,
    cached: false,
  };
}

function buildRenderMeta(row: ReportRowLike): RenderMeta {
  const location = [row.city, row.state, row.country].filter(Boolean).join(", ");
  const scorecard: ScorecardEntry[] = getReportSections(row).map((s) => ({
    label: s.label,
    score: Math.round(s.score),
  }));

  return {
    businessName: row.business_name || "the business",
    website: row.business_website ?? undefined,
    industry: row.industry ?? undefined,
    location: location || undefined,
    overallScore: overallScoreOf(row),
    reportCode: row.report_code ?? undefined,
    generatedDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    scorecard,
    brandName: process.env.NEXT_PUBLIC_APP_NAME || "Ignitia",
  };
}

/** Renders the full client report to standalone HTML. */
export function renderReportHtml(
  row: ReportRowLike,
  content: ClientReportContent
): string {
  return renderClientReportHtml(content, buildRenderMeta(row));
}

/** Renders the client report to a PDF buffer + suggested file name. */
export async function renderReportPdf(
  row: ReportRowLike,
  content: ClientReportContent
): Promise<{ pdf: Buffer; fileName: string }> {
  const html = renderReportHtml(row, content);
  const pdf = await htmlToPdf(html);
  return {
    pdf,
    fileName: `${slugify(row.business_name || "report")}-growth-report.pdf`,
  };
}
