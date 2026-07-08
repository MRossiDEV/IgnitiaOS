import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data, error } =
      await supabaseAdmin
        .from("leads")
        .select("*")
        .order("created_at", {
          ascending: false,
        })

    if (error) throw error

    return NextResponse.json({
      success: true,
      leads: data || [],
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load leads",
      },
      {
        status: 500,
      }
    )
  }
}