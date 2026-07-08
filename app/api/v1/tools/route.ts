import { NextResponse } from "next/server"
import { getAvailableTools, runTool } from "@/lib/tools/runner"

export async function GET() {
  return NextResponse.json({
    success: true,
    tools: getAvailableTools(),
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tool = typeof body.tool === "string" ? body.tool.trim() : ""
    const input =
      body.input && typeof body.input === "object" && !Array.isArray(body.input)
        ? body.input
        : {}

    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: "tool is required",
        },
        { status: 400 }
      )
    }

    const result = await runTool(tool, input)

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalid tool request",
      },
      { status: 400 }
    )
  }
}