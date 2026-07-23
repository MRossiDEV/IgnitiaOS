import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { z } from "zod"
import { CrmEventService } from "@/lib/services/CrmEventService"
// import { sendLeadConfirmationEmail, sendInternalLeadNotification } from "@/lib/email/service"

// Validation schema for lead creation
const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  website: z.string().url("Invalid website URL"),
  industry: z.string().min(1, "Industry is required"),
  primaryGoal: z.string().min(5, "Primary goal must be at least 5 characters"),
  source: z.enum(["audit", "optimization", "automation"]),
  metadata: z.object({
    formSubmissionTime: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
})

type LeadInput = z.infer<typeof leadSchema>

/**
 * POST /api/leads
 *
 * Creates a new lead from offer page submission
 * - Validates all required fields
 * - Checks for duplicate emails (same email within 24h skips)
 * - Auto-tags by source (audit/optimization/automation)
 * - Creates draft order for paid offers (audit)
 * - Returns lead object with ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = leadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const data: LeadInput = validation.data

    // Get default organization
    // const { data: org, error: orgError } = await supabaseAdmin
    //   .from('organizations')
    //   .select('id')
    //   .limit(1)
    //   .single()

    // if (!org || orgError) {
    //   return NextResponse.json(
    //     { error: "Organization not configured" },
    //     { status: 500 }
    //   )
    // }

    // Check for duplicate lead (same email in last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id, email')
      .eq('email', data.email)      
      .gte('created_at', twentyFourHoursAgo)
      .limit(1)
      .single()

    if (existingLead) {
      return NextResponse.json(
        { 
          error: "Lead already exists",
          id: existingLead.id,
          message: "A lead with this email was already submitted today"
        },
        { status: 409 }
      )
    }

    // Determine priority based on source and other factors
    let priority: 'hot' | 'warm' | 'cold' = 'warm'
    let estimatedValue = 500

    if (data.source === 'audit') {
      priority = 'hot' // Direct purchase offers are hot leads
      estimatedValue = 750
    } else if (data.source === 'automation') {
      priority = 'warm'
      estimatedValue = 1000
    }

    // Create lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
     
        name: data.name,
        email: data.email,
        company: data.company,
        website: data.website,
        industry: data.industry,
        status: 'new',
        source: data.source,
        priority,
        estimated_value: estimatedValue,
        message: data.primaryGoal,
        metadata: {
          ...data.metadata,
          source: data.source,
          formType: 'offer_page',
        },
      })
      .select('id, email, created_at')
      .single()

    if (leadError || !lead) {
      console.error("Failed to create lead:", leadError)
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      )
    }

    // For paid offers (audit), create draft order
    if (data.source === 'audit') {
      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          lead_id: lead.id,
          status: 'draft',
          type: 'audit',
          amount: 497,
          currency: 'USD',
          metadata: {
            source: 'lead_form_audit',
            createdAt: new Date().toISOString(),
          },
        })

      if (orderError) {
        console.error("Failed to create draft order:", orderError)
        // Log but don't fail - lead is created, order is secondary
      }
    }

    // TODO: Send confirmation email
    // await sendLeadConfirmationEmail({
    //   name: data.name,
    //   email: data.email,
    //   source: data.source,
    //   company: data.company,
    // })

    // TODO: Send internal notification
    // await sendInternalLeadNotification({
    //   name: data.name,
    //   email: data.email,
    //   source: data.source,
    //   company: data.company,
    // })

    // Fire any workflows connected to "lead.created" (e.g. auto-email) —
    // fire-and-forget, must never block/fail the lead creation response.
    CrmEventService.trigger("lead.created", {
      id: lead.id,
      name: data.name,
      email: data.email,
      company: data.company,
      website: data.website,
      industry: data.industry,
      primaryGoal: data.primaryGoal,
      source: data.source,
      createdAt: lead.created_at,
    }).catch((err) => console.error("CrmEventService.trigger(lead.created) failed:", err))

    console.log("Lead created successfully:", {
      id: lead.id,
      email: lead.email,
      source: data.source,
      company: data.company,
    })

    return NextResponse.json(
      {
        success: true,
        id: lead.id,
        email: lead.email,
        source: data.source,
        createdAt: lead.created_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { error: "Failed to create lead", details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads
 *
 * Retrieves all leads (for admin dashboard)
 */
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  )
}

