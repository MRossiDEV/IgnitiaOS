import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { publishDueInstagramDrafts } from "@/lib/ai/tools/social/instagram-publishing"

const SchedulerInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  schedulerSecret: z.string().optional(),
})

function isAuthorized(req: NextRequest, schedulerSecret?: string) {
  const configuredSecret = process.env.SOCIAL_SCHEDULER_SECRET

  if (!configuredSecret) {
    return true
  }

  const headerSecret = req.headers.get("x-ignitia-scheduler-secret") || ""
  return Boolean(schedulerSecret && schedulerSecret === configuredSecret) || headerSecret === configuredSecret
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const input = SchedulerInputSchema.parse(body)

    if (!isAuthorized(req, input.schedulerSecret)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized scheduler request",
        },
        { status: 401 }
      )
    }

    const result = await publishDueInstagramDrafts(input.limit ?? 20)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduler run failed"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
