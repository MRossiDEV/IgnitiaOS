// ======================================================
// GET /api/v1/emails/history?limit=25&offset=0
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/services/EmailService";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 25);
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);

  try {
    const { items, total } = await EmailService.listHistory({
      limit,
      offset,
    });
    return NextResponse.json({ items, total, limit, offset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
