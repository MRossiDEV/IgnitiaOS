// ======================================================
// Admin Report Pipeline Runner
// lib/ai/runAdminReportPipeline.ts
// ======================================================
// Drives one admin "New Report" run. Mirrors runFreeReportPipeline
// but for the authenticated admin `reports` table and a dynamic,
// operator-selected set of specialists (see pipeline/custom-report.ts).
//
// Called from /api/v1/reports/generate via Next.js `after()` so the
// HTTP response returns immediately while the pipeline runs in the
// background. The report row's status moves draft -> processing ->
// completed | failed, and the assembled result is stored in
// reports.metadata.report for the report view to render.

import { registerAgents } from "@/lib/ai/bootstrap";
import { AIMemory } from "@/lib/ai/core/memory";
import { PipelineRunner } from "@/lib/ai/core/pipelines";
import { ReportMemory } from "@/lib/ai/core/types";
import { buildCustomPipeline } from "@/lib/ai/pipeline/custom-report";
import { ReportBuilder, AssembledReport } from "@/lib/ai/report-builder";
import { summarizeUsage, UsageRecord } from "@/lib/ai/core/tokenTracker";
import { supabaseAdmin } from "@/lib/supabase/server";
import { aiLogger } from "@/lib/ai/core/logger";

/** Rolls per-agent usage recorded in memory into a costed summary. */
function buildUsage(memory: ReportMemory) {
  const records =
    ((memory.metadata as Record<string, any>).usageByAgent as UsageRecord[]) ?? [];
  return summarizeUsage(records);
}

// Section keys (from ReportBuilder) that map onto a dedicated *_score
// column on the reports table.
const SCORE_COLUMN_BY_KEY: Record<string, string> = {
  seo: "seo_score",
  social: "social_score",
  google: "google_score",
  branding: "branding_score",
};

// General website-quality sections are averaged into website_score,
// since the table has no per-specialist column for them.
const WEBSITE_SCORE_KEYS = [
  "ux",
  "content",
  "conversion",
  "copywriting",
  "accessibility",
  "trust",
];

// Section keys that have a dedicated *_analysis jsonb column for the
// raw specialist output.
const ANALYSIS_COLUMN_BY_KEY: Record<string, string> = {
  seo: "seo_analysis",
  google: "google_business_analysis",
  social: "social_analysis",
  conversion: "conversion_analysis",
  ux: "website_analysis",
};

/**
 * Maps an AssembledReport onto the reports table's dedicated columns
 * (scores, summaries, strength/weakness lists, raw analyses) — this is
 * where the report list and detail views actually read from. The full
 * structured report is also kept under metadata.report for the richer
 * per-section cards.
 */
function toReportColumns(
  existingMetadata: Record<string, any>,
  report: AssembledReport,
  memory: ReportMemory
) {
  const sectionByKey = new Map(report.sections.map((s) => [s.key, s]));

  const scoreColumns: Record<string, number> = {};
  for (const [key, column] of Object.entries(SCORE_COLUMN_BY_KEY)) {
    const section = sectionByKey.get(key);
    if (section) scoreColumns[column] = section.score;
  }

  const websiteSections = WEBSITE_SCORE_KEYS.map((k) => sectionByKey.get(k)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );
  const websiteScore =
    websiteSections.length > 0
      ? Math.round(
          websiteSections.reduce((sum, s) => sum + s.score, 0) /
            websiteSections.length
        )
      : 0;

  const analysisColumns: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(ANALYSIS_COLUMN_BY_KEY)) {
    const audit = (memory.analysis as Record<string, unknown>)[key];
    if (audit) analysisColumns[column] = audit;
  }

  // Flatten each specialist's lists, prefixed with its label so the UI
  // can tell where each item came from.
  const withLabel = (
    pick: (s: AssembledReport["sections"][number]) => string[]
  ) => report.sections.flatMap((s) => pick(s).map((t) => `${s.label}: ${t}`));

  const aiSummary = report.sections
    .map((s) => `${s.label} (${s.score}/100): ${s.summary}`)
    .join("\n\n");

  const executiveSummary =
    `Analyzed ${memory.business.name || "the business"} across ` +
    `${report.sections.length} area${report.sections.length === 1 ? "" : "s"}. ` +
    `Overall score: ${report.overallScore}/100.`;

  return {
    overall_score: report.overallScore,
    website_score: websiteScore,
    ...scoreColumns,
    ...analysisColumns,
    executive_summary: executiveSummary,
    ai_summary: aiSummary,
    strengths: withLabel((s) => s.strengths),
    weaknesses: withLabel((s) => s.weaknesses),
    opportunities: withLabel((s) => s.opportunities),
    quick_wins: withLabel((s) => s.quickWins),
    metadata: {
      ...existingMetadata,
      report,
      sections: report.sections,
      generated_at: report.generatedAt,
      usage: buildUsage(memory),
    },
  };
}

// Turns a task into a human-friendly "current action" line for the UI.
function progressLabel(stage: string, name: string): string {
  const clean = name.replace(/\s+(Specialist|Collector|Task)$/i, "").trim();
  if (stage === "collector") return `Collecting data · ${clean}`;
  if (stage === "analyst") return `Analyzing · ${clean}`;
  return `Assembling report`;
}

export async function runAdminReportPipeline(reportId: string): Promise<void> {
  registerAgents();

  await supabaseAdmin
    .from("reports")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", reportId);

  const { data: row, error } = await supabaseAdmin
    .from("reports")
    .select(
      "id, business_name, business_website, industry, city, state, country, metadata"
    )
    .eq("id", reportId)
    .single();

  if (error || !row) {
    aiLogger.error(
      "AdminReportPipeline",
      "Could not load report row",
      error?.message
    );
    await supabaseAdmin
      .from("reports")
      .update({
        status: "failed",
        metadata: { error: error?.message ?? "Report row not found" },
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    return;
  }

  const existingMetadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? row.metadata
      : {};

  const selectedIds: string[] = Array.isArray(existingMetadata.selectedAgents)
    ? existingMetadata.selectedAgents.filter(
        (id: unknown): id is string => typeof id === "string"
      )
    : [];

  const memory = AIMemory.create(reportId);
  memory.business.name = row.business_name ?? "";
  memory.business.website = row.business_website ?? "";
  memory.business.industry = row.industry ?? "";
  memory.business.city = row.city ?? "";
  memory.business.country = row.country ?? "";

  try {
    const pipeline = buildCustomPipeline(selectedIds);

    if (pipeline.analysts.length === 0) {
      throw new Error("No valid specialists selected for this report.");
    }

    const runner = new PipelineRunner();
    await runner.execute(pipeline, memory, true, async (info) => {
      // Persist a small progress object the report view polls and renders.
      await supabaseAdmin
        .from("reports")
        .update({
          metadata: {
            ...existingMetadata,
            selectedAgents: selectedIds,
            progress: {
              completed: info.index,
              total: info.total,
              stage: info.stage,
              label: progressLabel(info.stage, info.name),
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);
    });

    const report: AssembledReport =
      (memory.metadata.report as unknown as AssembledReport) ??
      new ReportBuilder().build(memory);

    // PipelineRunner does not throw when a specialist's AI call fails — it
    // just leaves that analysis slot empty. If NONE of the selected
    // specialists produced anything, treat the whole run as failed instead
    // of silently saving an empty "completed" report.
    if (report.sections.length === 0) {
      const agentErrors =
        (memory.metadata as Record<string, any>).agentErrors as
          | { agent: string; error: string }[]
          | undefined;

      const detail =
        agentErrors && agentErrors.length > 0
          ? agentErrors.map((e) => `${e.agent}: ${e.error}`).join(" · ")
          : "Check ANTHROPIC_API_KEY, model access, and that the website could be crawled.";

      throw new Error(`No specialist produced any analysis. ${detail}`);
    }

    await supabaseAdmin
      .from("reports")
      .update({
        status: "completed",
        snapshot_completed: true,
        snapshot_generated_at: new Date().toISOString(),
        ...toReportColumns(existingMetadata, report, memory),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    aiLogger.success("AdminReportPipeline", "Report completed", {
      reportId,
      specialists: pipeline.analysts.map((a) => a.id),
    });
  } catch (err: any) {
    aiLogger.error("AdminReportPipeline", "Pipeline failed", err?.message);
    await supabaseAdmin
      .from("reports")
      .update({
        status: "failed",
        metadata: {
          ...existingMetadata,
          error: err?.message ?? "Unknown pipeline error",
          // Persist whatever tokens were spent before the failure.
          usage: buildUsage(memory),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);
  } finally {
    AIMemory.destroy(reportId);
  }
}
