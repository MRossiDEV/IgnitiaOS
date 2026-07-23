import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { resolveClientContent, renderReportPdf } from "@/lib/ai/client-report";
import { persistClientReport } from "@/lib/ai/client-report/persist";

// Chromium + a possible AI call — must run on the Node runtime, with headroom.
export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// POST /api/v1/reports/pdf  { id? , slug? , refresh? }
// Generates a polished, client-facing PDF for a completed report and
// streams it back as a download. Reuses the cached narrative unless
// `refresh` is set.
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

    // Persist newly-written narrative (and its token cost) for reuse.
    if (!resolved.cached) {
      await persistClientReport(row, resolved.content, resolved.usage, resolved.model);
    }

    const { pdf, fileName } = await renderReportPdf(row, resolved.content);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
