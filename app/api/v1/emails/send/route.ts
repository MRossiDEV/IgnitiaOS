// ======================================================
// POST /api/v1/emails/send
// ======================================================
// Composes-and-sends one email "as the company". Per the
// API Rule: Request -> Validate -> Call Service -> Return
// Response. No business logic here — see EmailService.

import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/services/EmailService";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { to, subject, bodyHtml } = body;

  if (!to || !subject || !bodyHtml) {
    return NextResponse.json(
      { error: "to, subject, and bodyHtml are required" },
      { status: 400 }
    );
  }

  try {
    const log = await EmailService.sendAndLog({
      to,
      toName: body.toName,
      subject,
      bodyHtml,
      bodyText: body.bodyText,
      templateId: body.templateId,
      reportId: body.reportId,
      sentBy: body.sentBy,
    });

    return NextResponse.json({ log }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
