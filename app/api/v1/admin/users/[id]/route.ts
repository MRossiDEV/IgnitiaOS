// app/api/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("SUPABASE ERROR:", error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: data,
    })
  } catch (error) {
    console.error("GET USER ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}