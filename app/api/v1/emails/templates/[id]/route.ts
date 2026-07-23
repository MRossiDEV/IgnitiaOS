// ======================================================
// GET    /api/v1/emails/templates/[id]  -> fetch one
// PUT    /api/v1/emails/templates/[id]  -> update
// DELETE /api/v1/emails/templates/[id]  -> delete
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { EmailTemplateService } from "@/lib/services/EmailTemplateService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await EmailTemplateService.get(id);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const template = await EmailTemplateService.update(id, {
      name: body.name,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
    });
    return NextResponse.json({ template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await EmailTemplateService.remove(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
