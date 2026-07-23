// ======================================================
// GET /api/v1/intelligence/properties/[id]/timeline
// ======================================================
// Returns a property plus its full re_property_snapshots history,
// oldest first — this is the "Market Timeline" changelog view.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: property, error: propertyError } = await supabaseAdmin
    .from("re_properties")
    .select("*")
    .eq("id", id)
    .single();

  if (propertyError || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data: snapshots, error: snapshotsError } = await supabaseAdmin
    .from("re_property_snapshots")
    .select("*")
    .eq("property_id", id)
    .order("captured_at", { ascending: true });

  if (snapshotsError) {
    return NextResponse.json({ error: snapshotsError.message }, { status: 500 });
  }

  return NextResponse.json({ property, snapshots: snapshots ?? [] });
}
