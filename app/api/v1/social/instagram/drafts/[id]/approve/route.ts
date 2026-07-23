import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { approveInstagramDraft, publishInstagramDraft } from "@/lib/ai/tools/social/instagram-publishing"

interface RouteContext {
  params: {
    id: string
  }
}

const ApproveSchema = z.object({
  approvedBy: z.string().optional().nullable(),
  publishNow: z.boolean().optional(),
})

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json().catch(() => ({}))
    const input = ApproveSchema.parse(body)

    const approved = await approveInstagramDraft({
      draftId: params.id,
      approvedBy: input.approvedBy,
    })

    if (input.publishNow) {
      const published = await publishInstagramDraft(params.id)
      return NextResponse.json({
        success: true,
        approved,
        published,
      })
    }

    return NextResponse.json({
      success: true,
      approved,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve draft"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
