import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { runAdminReportPipeline } from "@/lib/ai/runAdminReportPipeline";
import {
  VALID_SPECIALIST_IDS,
  DEFAULT_SPECIALIST_IDS,
} from "@/lib/ai/pipeline/custom-report";

// POST /api/v1/reports/regenerate
// Re-runs the AI pipeline on an EXISTING report row (by id or slug) instead
// of creating a new one. Reuses the report's stored specialist selection, or
// an optional new selection passed in the body, and refreshes all analysis
// columns in place.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!id && !slug) {
      return NextResponse.json(
        { error: "A report id or slug is required." },
        { status: 400 }
      );
    }

    // Load the existing report.
    const query = supabaseAdmin
      .from("reports")
      .select("id, business_website, status, metadata");

    const { data: report, error } = id
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("report_slug", slug).maybeSingle();

    if (error) throw error;
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (report.status === "processing" || report.status === "queued") {
      return NextResponse.json(
        { error: "This report is already being generated." },
        { status: 409 }
      );
    }

    if (!report.business_website) {
      return NextResponse.json(
        { error: "This report has no business website to analyze." },
        { status: 400 }
      );
    }

    const existingMetadata =
      report.metadata &&
      typeof report.metadata === "object" &&
      !Array.isArray(report.metadata)
        ? (report.metadata as Record<string, any>)
        : {};

    // Prefer a selection passed in the request; otherwise reuse the report's
    // stored selection; otherwise fall back to the default set.
    const requested: string[] = Array.isArray(body.agents)
      ? body.agents.filter(
          (a: unknown): a is string =>
            typeof a === "string" && VALID_SPECIALIST_IDS.has(a)
        )
      : [];

    const stored: string[] = Array.isArray(existingMetadata.selectedAgents)
      ? existingMetadata.selectedAgents.filter(
          (a: unknown): a is string =>
            typeof a === "string" && VALID_SPECIALIST_IDS.has(a)
        )
      : [];

    const selectedAgents =
      requested.length > 0
        ? requested
        : stored.length > 0
        ? stored
        : DEFAULT_SPECIALIST_IDS;

    // Reset run state: clear any prior error/progress, re-arm status, and
    // persist the selection the pipeline will read.
    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        status: "queued",
        metadata: {
          ...existingMetadata,
          selectedAgents,
          error: null,
          progress: null,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", report.id);

    if (updateError) throw updateError;

    after(() => runAdminReportPipeline(report.id));

    return NextResponse.json({
      success: true,
      id: report.id,
      status: "queued",
      selectedAgents,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
