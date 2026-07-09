import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"

const PlatformSchema = z.enum([
  "instagram",
  "facebook",
  "linkedin",
  "x",
  "tiktok",
  "youtube",
])

const SocialAccountSettingsSchema = z.object({
  timezone: z.string().trim().min(1).max(80).default("UTC"),
  postingWindow: z.string().trim().min(1).max(80).default("09:00-12:00"),
  autoPublish: z.boolean().default(false),
  defaultHashtags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  brandVoice: z.string().trim().min(1).max(120).default("Professional"),
})

const SocialAccountAuthSchema = z.object({
  type: z.enum(["oauth", "token", "password"]).default("token"),
  username: z.string().trim().max(120).optional().nullable(),
  secret: z.string().trim().max(1024).optional().nullable(),
})

const UpsertSocialAccountSchema = z.object({
  platform: PlatformSchema,
  connected: z.boolean(),
  accountLabel: z.string().optional().nullable(),
  settings: z.unknown().optional(),
  auth: z.unknown().optional(),
  organizationId: z.string().uuid().optional().nullable(),
})

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("social_account_settings")
      .select("id,organization_id,platform,connected,account_label,settings,updated_at,auth_type,auth_username,auth_secret,auth_updated_at")
      .order("platform", { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const accounts = (data ?? []).map((row: any) => ({
      id: row.id,
      organization_id: row.organization_id,
      platform: row.platform,
      connected: row.connected,
      account_label: row.account_label,
      settings: row.settings,
      updated_at: row.updated_at,
      auth: {
        type: row.auth_type || "token",
        username: row.auth_username || null,
        hasSecret: Boolean(row.auth_secret),
        updatedAt: row.auth_updated_at || null,
      },
    }))

    return NextResponse.json({
      success: true,
      accounts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load social account settings"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = UpsertSocialAccountSchema.parse(body)
    const settings = SocialAccountSettingsSchema.parse(input.settings ?? {})
    const auth = SocialAccountAuthSchema.parse(input.auth ?? {})

    const { data: existingRow } = await supabaseAdmin
      .from("social_account_settings")
      .select("auth_secret")
      .eq("platform", input.platform)
      .maybeSingle()

    const nextSecret =
      typeof auth.secret === "string" && auth.secret.trim().length > 0
        ? auth.secret.trim()
        : existingRow?.auth_secret ?? null

    const { data, error } = await supabaseAdmin
      .from("social_account_settings")
      .upsert(
        {
          organization_id: input.organizationId ?? null,
          platform: input.platform,
          connected: input.connected,
          account_label: input.accountLabel ?? null,
          settings,
          auth_type: auth.type,
          auth_username:
            typeof auth.username === "string" && auth.username.trim().length > 0
              ? auth.username.trim()
              : null,
          auth_secret: nextSecret,
          auth_updated_at: new Date().toISOString(),
        },
        {
          onConflict: "platform",
        }
      )
      .select("id,organization_id,platform,connected,account_label,settings,updated_at,auth_type,auth_username,auth_secret,auth_updated_at")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Keep Instagram publishing credentials in the connection table used by the Graph publisher.
    if (
      input.platform === "instagram" &&
      auth.username &&
      nextSecret &&
      input.connected
    ) {
      const { error: syncError } = await supabaseAdmin
        .from("social_platform_connections")
        .upsert(
          {
            organization_id: input.organizationId ?? null,
            platform: "instagram",
            account_id: auth.username,
            account_name: input.accountLabel ?? null,
            access_token: nextSecret,
            is_active: true,
            metadata: {
              source: "social_account_settings",
              authType: auth.type,
              syncedAt: new Date().toISOString(),
            },
            last_validated_at: null,
          },
          {
            onConflict: "platform,account_id",
          }
        )

      if (syncError) {
        throw new Error(`Saved settings, but Instagram sync failed: ${syncError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      account: {
        id: data.id,
        organization_id: data.organization_id,
        platform: data.platform,
        connected: data.connected,
        account_label: data.account_label,
        settings: data.settings,
        updated_at: data.updated_at,
        auth: {
          type: data.auth_type || "token",
          username: data.auth_username || null,
          hasSecret: Boolean(data.auth_secret),
          updatedAt: data.auth_updated_at || null,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save social account settings"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    )
  }
}
