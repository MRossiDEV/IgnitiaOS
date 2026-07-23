// ======================================================
// POST /api/v1/intelligence/settings/workflows/[id]/run
// ======================================================
// Manually runs a connected workflow right now, from the Property
// Intelligence settings panel — [id] is the re_connected_workflows
// row id, not the workflow id itself.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { WorkflowService } from "@/lib/services/WorkflowService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: connection, error } = await supabaseAdmin
    .from("re_connected_workflows")
    .select("workflow_id")
    .eq("id", id)
    .single();

  if (error || !connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  try {
    const run = await WorkflowService.run(connection.workflow_id, "manual");
    return NextResponse.json({ run });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
