// ======================================================
// GET    /api/v1/automation/workflows/[id]  -> fetch one
// PUT    /api/v1/automation/workflows/[id]  -> save nodes/edges
// DELETE /api/v1/automation/workflows/[id]  -> delete
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workflow = await WorkflowService.get(id);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({ workflow });
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
    // Only pass through fields the caller actually sent — nodes/edges must
    // stay untouched on a metadata-only edit (name/description/category from
    // the workflow list), not get wiped to [] by omission.
    const workflow = await WorkflowService.save(id, {
      name: body.name,
      description: body.description,
      category: body.category,
      ...(body.nodes !== undefined ? { nodes: body.nodes } : {}),
      ...(body.edges !== undefined ? { edges: body.edges } : {}),
      status: body.status,
    });
    return NextResponse.json({ workflow });
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
    await WorkflowService.remove(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
