import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function normalizeReport(record: Record<string, any>) {
  const report = { ...record };

  report.slug =
    report.report_slug ||
    report.slug ||
    "";

  report.company_name =
    report.company_name ||
    report.business_name ||
    "";

  report.business_name =
    report.business_name ||
    report.company_name ||
    "";

  report.executive_summary =
    report.executive_summary ||
    report.summary ||
    report.overview ||
    "AI-generated report content is available.";

  return report;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const reports = (data ?? []).map(normalizeReport);

    return NextResponse.json({
      reports,
      total: reports.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err?.message,
      },
      {
        status: 500,
      }
    );
  }
}