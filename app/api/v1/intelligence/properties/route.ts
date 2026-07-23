// ======================================================
// GET /api/v1/intelligence/properties?q=...
// ======================================================
// Searches re_properties by address/neighborhood/city.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  let query = supabaseAdmin
    .from("re_properties")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(25);

  if (q) {
    query = query.or(`address.ilike.%${q}%,neighborhood.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ properties: data ?? [] });
}
