// ======================================================
// GET /api/v1/reports/free/[reportCode]
// ======================================================
// Polling endpoint for the frontend while a report is
// generating. Requires the access_code as a query param
// since this is a public, unauthenticated route — without
// it, anyone could enumerate report_codes and read other
// people's business data.
//
// Usage: GET /api/v1/reports/free/IGN-AB3XQ9?code=Z8K2P1QW4M
//
// NOTE: adjust the response shape below to match whatever
// app/report/v1/free/[reportCode]/page.tsx already expects
// if that page pre-dates this route.

import { NextRequest, NextResponse } from "next/server";
import { ReportService } from "@/lib/services/ReportService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportCode: string }> }
) {
  const { reportCode } = await params;
  const accessCode = request.nextUrl.searchParams.get("code");

  const report = await ReportService.getByReportCode(reportCode);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (!accessCode || accessCode !== report.access_code) {
    return NextResponse.json(
      { error: "Invalid or missing access code" },
      { status: 403 }
    );
  }

  return NextResponse.json({ report });
}
