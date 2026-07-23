// ======================================================
// Free Report Pipeline Runner
// lib/ai/runFreeReportPipeline.ts
// ======================================================
// Orchestrates one full free-report run: loads the pending
// row's intake data into memory, runs the pipeline, and
// persists results via ReportService. Called from the API
// route with Next.js `after()` so the HTTP response returns
// immediately (fire-and-forget) instead of waiting.

import { registerAgents } from "@/lib/ai/bootstrap";
import { AIMemory } from "@/lib/ai/core/memory";
import { PipelineRunner } from "@/lib/ai/core/pipelines";
import { freeReportPipeline } from "@/lib/ai/pipeline/free-report";
import { ReportBuilder, AssembledReport } from "@/lib/ai/report-builder";
import { ReportService } from "@/lib/services/ReportService";
import { NotificationService } from "@/lib/services/NotificationService";
import { generateReportPdf } from "@/lib/pdf/generateReportPdf";
import { storeReportPdf } from "@/lib/pdf/storeReportPdf";
import { supabaseAdmin } from "@/lib/supabase/server";
import { aiLogger } from "@/lib/ai/core/logger";

export async function runFreeReportPipeline(
  reportId: string
): Promise<void> {
  registerAgents();

  await ReportService.markProcessing(reportId);

  const { data: row, error } = await supabaseAdmin
    .from("free_reports")
    .select(
      "report_code, access_code, full_name, email, business_name, website, industry, business_type, city, country, primary_goal, biggest_challenge, competitors"
    )
    .eq("id", reportId)
    .single();

  if (error || !row) {
    aiLogger.error(
      "FreeReportPipeline",
      "Could not load report row",
      error?.message
    );
    await ReportService.failReport(
      reportId,
      error?.message ?? "Report row not found"
    );
    return;
  }

  const memory = AIMemory.create(reportId);

  memory.business.name = row.business_name ?? "";
  memory.business.website = row.website ?? "";
  memory.business.industry = row.industry ?? "";
  memory.business.businessType = row.business_type ?? "";
  memory.business.city = row.city ?? "";
  memory.business.country = row.country ?? "";
  memory.business.goal = row.primary_goal ?? "";
  memory.business.challenge = row.biggest_challenge ?? "";
  memory.business.competitorUrls = Array.isArray(row.competitors)
    ? row.competitors
    : [];

  try {
    const runner = new PipelineRunner();
    await runner.execute(freeReportPipeline, memory, true);

    const report: AssembledReport =
      (memory.metadata.report as unknown as AssembledReport) ??
      new ReportBuilder().build(memory);

    await ReportService.completeReport(reportId, report);

    aiLogger.success("FreeReportPipeline", "Report completed", {
      reportId,
    });

    // PDF generation/storage failure shouldn't fail the whole run —
    // the report data itself is already saved successfully.
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateReportPdf(report, memory.business);
      const pdfUrl = await storeReportPdf(reportId, pdfBuffer);
      await ReportService.attachPdfUrl(reportId, pdfUrl);
    } catch (pdfError: any) {
      aiLogger.error(
        "FreeReportPipeline",
        "PDF generation/storage failed — continuing without it",
        pdfError.message
      );
    }

    await NotificationService.sendReportReadyEmail({
      to: row.email,
      fullName: row.full_name,
      businessName: row.business_name,
      reportCode: row.report_code,
      accessCode: row.access_code,
      pdfBuffer,
    });
  } catch (err: any) {
    aiLogger.error("FreeReportPipeline", "Pipeline failed", err.message);
    await ReportService.failReport(
      reportId,
      err.message ?? "Unknown pipeline error"
    );
  } finally {
    AIMemory.destroy(reportId);
  }
}
