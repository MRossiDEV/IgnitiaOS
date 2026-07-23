import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { LeadStatus, LeadPriority } from "@/lib/ai/models/lead"




/**
 * PATCH /api/leads/[id]
 *
 * Updates a lead's properties (status, priority, notes, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    // Update allowed fields
    if (body.status && ["new", "contacted", "qualified", "converted", "lost"].includes(body.status)) {
      updates.status = body.status

      // Auto-set converted_at if status changed to converted
      if (body.status === "converted") {
        updates.converted_at = new Date().toISOString()
      }
    }

    if (body.priority && ["hot", "warm", "cold"].includes(body.priority)) {
      updates.priority = body.priority
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes
    }

    if (body.lastContactedAt) {
      updates.last_contacted_at = body.lastContactedAt
    }

    if (body.nextFollowUpAt) {
      updates.next_follow_up_at = body.nextFollowUpAt
    }

    if (body.estimatedValue !== undefined) {
      updates.estimated_value = body.estimatedValue
    }

    if (body.actualValue !== undefined) {
      updates.actual_value = body.actualValue
    }

    // Update the lead in database
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        )
      }
      console.error("Database error:", error)
      throw error
    }

    console.log("Lead updated:", {
      id: lead.id,
      status: lead.status,
      priority: lead.priority,
    })

    return NextResponse.json(
      {
        success: true,
        lead,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads/[id]
 *
 * Retrieves a single lead by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        )
      }
      console.error("Database error:", error)
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        lead,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    )
  }
}

