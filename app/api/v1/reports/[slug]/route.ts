

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function toSlug(value?: string | null) {
  if (!value) return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeReport(record: Record<string, any>, fallbackSlug?: string) {
  const report = { ...record };

  report.slug = report.slug || fallbackSlug || "";
  report.company_name = report.company_name || report.business_name || "";
  report.business_name = report.business_name || report.company_name || "";
  report.executive_summary =
    report.executive_summary ||
    report.summary ||
    report.overview ||
    "AI-generated report content is available in the database.";

  return report;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug" },
        { status: 400 }
      );
    }

    const normalizedSlug = decodeURIComponent(slug).trim();

    try {
      const { data, error } = await supabaseAdmin
        .from("reports")
        .select("*")
        .eq("report_slug", normalizedSlug)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          report: normalizeReport(data, normalizedSlug),
        });
      }
    } catch {
      // Fall through to a more flexible fallback lookup.
    }

    const { data: rows, error: fallbackError } = await supabaseAdmin
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fallbackError) {
      return NextResponse.json(
        { error: fallbackError.message },
        { status: 404 }
      );
    }

    const targetSlug = toSlug(normalizedSlug);
    const matched = rows?.find((row: Record<string, any>) => {
      const candidates = [
        row.slug,
        row.business_name,
        row.company_name,
        row.name,
      ].filter(Boolean);

      return candidates.some((candidate) => toSlug(String(candidate)) === targetSlug);
    });

    if (!matched) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      report: normalizeReport(matched, normalizedSlug),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
