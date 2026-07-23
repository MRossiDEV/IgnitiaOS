import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { resolveClientContent, renderReportHtml } from "@/lib/ai/client-report";
import { persistClientReport } from "@/lib/ai/client-report/persist";

// Uses the AI narrative writer (on first run) — Node runtime.
export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// POST /api/v1/reports/pdf/preview  { id? , slug? , refresh? }
// Returns the rendered client-report HTML (what the client sees) for an
// in-browser preview. Shares the cached narrative with the PDF download.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const refresh = body.refresh === true;

    if (!id && !slug) {
      return NextResponse.json(
        { error: "A report id or slug is required." },
        { status: 400 }
      );
    }

    const query = supabaseAdmin.from("reports").select("*");
    const { data: row, error } = id
      ? await query.eq("id", id).maybeSingle()
      : await query.eq("report_slug", slug).maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const resolved = await resolveClientContent(row, { refresh });

    if (!resolved.cached) {
      await persistClientReport(row, resolved.content, resolved.usage, resolved.model);
    }

    const html = renderReportHtml(row, resolved.content);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Report preview failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to render preview" },
      { status: 500 }
    );
  }
}
