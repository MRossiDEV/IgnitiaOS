import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_agents")
      .select("id,name,slug,description,category,status,model,tools,workflow")
      .in("category", [
        "Discovery Department",
        "Development Department",
        "Marketing Department",
        "Automation Department",
        "Security Department",
      ])
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      agents: data ?? [],
      total: data?.length ?? 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    )
  }
}
