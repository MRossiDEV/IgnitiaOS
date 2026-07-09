import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectInstagramAccount } from "@/lib/social/instagram-publishing"

const ConnectInstagramSchema = z.object({
  organizationId: z.string().uuid().optional().nullable(),
  accountId: z.string().min(1),
  accountName: z.string().optional().nullable(),
  facebookPageId: z.string().optional().nullable(),
  accessToken: z.string().min(1),
  tokenExpiresAt: z.string().datetime().optional().nullable(),
  metadata: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = ConnectInstagramSchema.parse(body)

    const connection = await connectInstagramAccount(input)

    return NextResponse.json({
      success: true,
      connection,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect Instagram account"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
