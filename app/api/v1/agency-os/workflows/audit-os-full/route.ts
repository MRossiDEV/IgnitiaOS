import { NextRequest, NextResponse } from "next/server"
import { executeWorkflowBySlug } from "@/lib/agency-os/executor"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const website = typeof body.website === "string" ? body.website : ""
    const businessName = typeof body.businessName === "string" ? body.businessName : ""
    const industry = typeof body.industry === "string" ? body.industry : ""
    const location = typeof body.location === "string" ? body.location : ""
    const competitors = Array.isArray(body.competitors)
      ? body.competitors.filter((c: unknown) => typeof c === "string")
      : []

    if (!website) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required field: website",
        },
        { status: 400 }
      )
    }

    const result = await executeWorkflowBySlug("audit-os-full", {
      website,
      businessName,
      industry,
      location,
      competitors,
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow execution failed"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    )
  }
}
