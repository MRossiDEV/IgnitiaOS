import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { postInstagram } from "@/lib/ai/tools/social/instagram-publishing"

const PublishNowSchema = z.object({
  organizationId: z.string().uuid().optional().nullable(),
  connectionId: z.string().uuid().optional().nullable(),
  accountId: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  caption: z.string().min(1),
  hashtags: z.array(z.string()).optional(),
  imageUrl: z.string().url(),
  scheduleTime: z.string().datetime().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = PublishNowSchema.parse(body)

    const result = await postInstagram({
      organizationId: input.organizationId,
      connectionId: input.connectionId,
      accountId: input.accountId,
      createdBy: input.createdBy,
      title: input.title,
      caption: input.caption,
      hashtags: input.hashtags,
      imageUrl: input.imageUrl,
      scheduleTime: input.scheduleTime,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to publish Instagram post"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
