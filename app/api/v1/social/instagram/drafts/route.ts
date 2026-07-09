import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  createInstagramDraft,
  generateInstagramContent,
  listInstagramDrafts,
} from "@/lib/social/instagram-publishing"

const ModeSchema = z.enum(["manual_approval", "auto_publish"])

const CreateDraftSchema = z.object({
  organizationId: z.string().uuid().optional().nullable(),
  connectionId: z.string().uuid(),
  createdBy: z.string().optional().nullable(),
  mode: ModeSchema.optional(),
  title: z.string().optional().nullable(),
  caption: z.string().min(1).optional(),
  hashtags: z.array(z.string()).optional(),
  imagePrompt: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  scheduleTime: z.string().datetime().optional().nullable(),
  useGeneratedContent: z.boolean().optional(),
  topic: z.string().optional(),
  offer: z.string().optional(),
  audience: z.string().optional(),
  objective: z.string().optional(),
  tone: z.string().optional(),
  cta: z.string().optional(),
  delayMinutes: z.number().int().positive().optional(),
})

const ListDraftsSchema = z.object({
  connectionId: z.string().uuid().optional(),
  status: z
    .enum([
      "draft",
      "pending_approval",
      "approved",
      "scheduled",
      "publishing",
      "published",
      "failed",
      "cancelled",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const parsed = ListDraftsSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    )

    const drafts = await listInstagramDrafts(parsed)

    return NextResponse.json({
      success: true,
      count: drafts.length,
      drafts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load drafts"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = CreateDraftSchema.parse(body)

    const generated = input.useGeneratedContent
      ? generateInstagramContent({
          topic: input.topic,
          offer: input.offer,
          audience: input.audience,
          objective: input.objective,
          tone: input.tone,
          cta: input.cta,
          scheduleTime: input.scheduleTime,
          delayMinutes: input.delayMinutes,
        })
      : null

    const caption = input.caption || generated?.caption
    if (!caption) {
      return NextResponse.json(
        {
          success: false,
          message: "caption is required unless useGeneratedContent is true",
        },
        { status: 400 }
      )
    }

    const draft = await createInstagramDraft({
      organizationId: input.organizationId,
      connectionId: input.connectionId,
      createdBy: input.createdBy,
      mode: input.mode,
      title: input.title,
      caption,
      hashtags: input.hashtags || generated?.hashtags,
      imagePrompt: input.imagePrompt || generated?.imagePrompt,
      imageUrl: input.imageUrl,
      scheduleTime: input.scheduleTime || generated?.scheduleTime || null,
    })

    return NextResponse.json({
      success: true,
      draft,
      generated,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create draft"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
