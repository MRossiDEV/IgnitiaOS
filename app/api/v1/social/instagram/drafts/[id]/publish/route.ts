import { NextResponse } from "next/server"
import { publishInstagramDraft } from "@/lib/ai/tools/social/instagram-publishing"

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const draft = await publishInstagramDraft(params.id)

    return NextResponse.json({
      success: true,
      draft,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish draft"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
