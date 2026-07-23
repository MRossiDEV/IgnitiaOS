// ======================================================
// GET  /api/v1/automation/workflows  -> list all
// POST /api/v1/automation/workflows  -> create one
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

export async function GET() {
  try {
    const workflows = await WorkflowService.list();
    return NextResponse.json({ workflows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const workflow = await WorkflowService.create({
      name: body.name,
      description: body.description,
    });
    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
