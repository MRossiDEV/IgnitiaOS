// ======================================================
// GET  /api/v1/emails/templates       -> list all
// POST /api/v1/emails/templates       -> create one
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { EmailTemplateService } from "@/lib/services/EmailTemplateService";

export async function GET() {
  try {
    const templates = await EmailTemplateService.list();
    return NextResponse.json({ templates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.subject || !body?.bodyHtml) {
    return NextResponse.json(
      { error: "name, subject, and bodyHtml are required" },
      { status: 400 }
    );
  }

  try {
    const template = await EmailTemplateService.create({
      name: body.name,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
