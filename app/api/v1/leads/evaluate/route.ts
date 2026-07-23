import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { evaluateLead, type LeadEvaluationMetrics } from "@/lib/leads/evaluateLead"

interface EvaluatedLead {
  id: string
  name?: string
  email: string
  company?: string
  status: string
  metrics: LeadEvaluationMetrics
}

/**
 * POST /api/leads/evaluate
 *
 * Evaluates all leads and ranks them by:
 * 1. Estimated value
 * 2. Seriousness (based on engagement patterns)
 * 3. Action likelihood (based on contact attempts, response patterns)
 */
export async function POST(req: NextRequest) {
  try {
    // Fetch all leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (leadsError) {
      console.error("Database error fetching leads:", leadsError)
      throw leadsError
    }

    // Evaluate each lead
    const evaluatedLeads: EvaluatedLead[] = leads.map((lead) => {
      const metrics = evaluateLead(lead)
      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        status: lead.status,
        metrics,
      }
    })

    // Sort by overall rank (descending)
    evaluatedLeads.sort((a, b) => b.metrics.overallRank - a.metrics.overallRank)

    return NextResponse.json(
      {
        success: true,
        totalLeads: evaluatedLeads.length,
        evaluatedLeads,
        summary: {
          highPriority: evaluatedLeads.filter(
            (l) => l.metrics.recommendation === "high-priority"
          ).length,
          mediumPriority: evaluatedLeads.filter(
            (l) => l.metrics.recommendation === "medium-priority"
          ).length,
          lowPriority: evaluatedLeads.filter(
            (l) => l.metrics.recommendation === "low-priority"
          ).length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error evaluating leads:", error)
    return NextResponse.json(
      { error: "Failed to evaluate leads" },
      { status: 500 }
    )
  }
}

