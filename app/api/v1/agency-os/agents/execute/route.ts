import { NextRequest, NextResponse } from "next/server"
import { executeAgentBySlug } from "@/lib/agency-os/executor"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const agentSlug = typeof body.agentSlug === "string" ? body.agentSlug : ""
    const input = body.input && typeof body.input === "object" ? body.input : {}
    const persistRun = typeof body.persistRun === "boolean" ? body.persistRun : true

    if (!agentSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required field: agentSlug",
        },
        { status: 400 }
      )
    }

    const result = await executeAgentBySlug(
      {
        agentSlug,
        input,
      },
      {
        persistRun,
      }
    )

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    )
  }
}
