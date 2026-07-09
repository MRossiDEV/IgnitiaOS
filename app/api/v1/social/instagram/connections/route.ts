import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// Returns active Instagram connections so the publisher can auto-select one
// instead of requiring a manually pasted connection UUID. The access token is
// never included in the response.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("social_platform_connections")
      .select(
        "id,account_id,account_name,is_active,last_validated_at,updated_at"
      )
      .eq("platform", "instagram")
      .eq("is_active", true)
      .order("last_validated_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false, nullsFirst: false })

    if (error) {
      throw new Error(error.message)
    }

    const connections = (data || []).map((row) => ({
      id: String(row.id),
      accountId: row.account_id ? String(row.account_id) : null,
      accountName: row.account_name ? String(row.account_name) : null,
      lastValidatedAt: row.last_validated_at
        ? String(row.last_validated_at)
        : null,
    }))

    return NextResponse.json({
      success: true,
      count: connections.length,
      connections,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load connections"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
