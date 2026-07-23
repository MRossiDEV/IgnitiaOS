// ======================================================
// DELETE /api/v1/intelligence/settings/workflows/[id]
// ======================================================
// Disconnects a workflow from Intelligence — does not touch the
// underlying automation workflow itself, only the connection row.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin.from("re_connected_workflows").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
