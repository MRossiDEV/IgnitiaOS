// ======================================================
// POST /api/v1/reports/free/start
// ======================================================
// Per the API Rule: Request -> Validate -> Call Service ->
// Return Response. No business logic lives here — see
// ReportService and runFreeReportPipeline for the real work.
//
// NOTE: replaces a previous version of this route that called
// `FreeReportPipeline.run(...)`, a method that didn't exist —
// leftover from an earlier, abandoned pipeline system. This
// version uses the real pipeline (core/pipelines.ts + registry).
//
// Requires Next.js 15+ for `after()`. If you're on an older
// version or a non-Vercel host that doesn't support it, swap
// the `after(...)` call below for `waitUntil(...)` from
// '@vercel/functions', or run runFreeReportPipeline via a
// proper background job/queue instead.

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { ReportService } from "@/lib/services/ReportService";
import { runFreeReportPipeline } from "@/lib/ai/runFreeReportPipeline";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fullName, email, businessName } = body;

  if (!fullName || !email || !businessName) {
    return NextResponse.json(
      { error: "fullName, email, and businessName are required" },
      { status: 400 }
    );
  }

  let pending;

  try {
    pending = await ReportService.createPendingReport({
      fullName,
      email,
      phone: body.phone,
      businessName,
      website: body.website,
      industry: body.industry,
      businessType: body.businessType,
      businessSize: body.businessSize,
      city: body.city,
      country: body.country,
      primaryGoal: body.primaryGoal,
      biggestChallenge: body.biggestChallenge,
      monthlyLeads: body.monthlyLeads,
      marketingChannels: body.marketingChannels,
      competitorUrls: body.competitorUrls,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to create report" },
      { status: 500 }
    );
  }

  // Fire-and-forget: scheduled to run after this response is
  // sent, instead of the request waiting on it.
  after(() => runFreeReportPipeline(pending.id));

  return NextResponse.json(
    {
      reportCode: pending.reportCode,
      accessCode: pending.accessCode,
      status: "pending",
    },
    { status: 202 }
  );
}
