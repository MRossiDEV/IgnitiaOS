// ======================================================
// GET /api/v1/emails/leads?q=search
// ======================================================
// Recipient picker source — searches free_reports by name,
// email, or business name.

import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/services/EmailService";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const leads = await EmailService.searchLeads(query);
    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
