import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

/**
 * POST /api/audit
 * 
 * Handles free audit report generation
 * Creates lead and generates free report
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.email || !body.industry || !body.businessName) {
      return NextResponse.json(
        { error: "Missing required fields: email, industry, businessName" },
        { status: 400 }
      )
    }

    // Get organization ID (default to first org for now)
    // TODO: Get from authenticated user session
    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (!orgs) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 400 }
      )
    }

    // Create lead in database
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        organization_id: orgs.id,
        name: body.businessName,
        email: body.email,
        industry: body.industry,
        website: body.website,
        status: 'new',
        source: 'audit',
        priority: 'warm',
        estimated_value: 0, // Free report has no monetary value
        notes: body.pains?.join(', ') || '',
        metadata: {
          businessSize: body.businessSize,
          revenueRange: body.revenueRange,
          pains: body.pains,
          growthGaps: body.growthGaps,
          otherPain: body.otherPain,
          otherGap: body.otherGap,
          reportType: 'free',
        },
      })
      .select()
      .single()

    if (leadError) {
      console.error("Database error creating lead:", leadError)
      throw leadError
    }

    console.log("Free audit requested and lead created:", {
      leadId: lead.id,
      email: body.email,
      businessName: body.businessName,
      industry: body.industry,
    })

    // TODO: Implement actual audit generation logic
    // 1. Generate AI-powered audit report
    // 2. Send email with report
    // 3. Update report status

    return NextResponse.json(
      {
        success: true,
        message: "Audit generation started",
        reportId: `report_free_${Date.now()}`,
        leadId: lead.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing audit request:", error)
    return NextResponse.json(
      { error: "Failed to process audit request" },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  )
}

