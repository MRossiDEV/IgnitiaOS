import { supabaseAdmin } from "@/lib/supabase/server"
import {
  publishInstagramImagePost,
  validateInstagramConnection,
} from "@/lib/social/instagram-graph"

export type PublishMode = "manual_approval" | "auto_publish"
export type DraftStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled"

export type InstagramContentDraft = {
  caption: string
  hashtags: string[]
  imagePrompt: string
  scheduleTime: string | null
}

function ensureString(value: unknown, field: string) {
  const output = typeof value === "string" ? value.trim() : ""
  if (!output) {
    throw new Error(`${field} is required`)
  }
  return output
}

function normalizeHashtags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const normalized = value
    .map((tag) => (typeof tag === "string" ? tag.trim().replace(/^#*/, "") : ""))
    .filter(Boolean)

  return Array.from(new Set(normalized)).slice(0, 30)
}

function normalizeScheduleTime(value: unknown): string | null {
  if (!value) {
    return null
  }

  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) {
    throw new Error("scheduleTime must be a valid ISO date")
  }

  return date.toISOString()
}

function defaultScheduleTime(input: {
  scheduleTime?: string | null
  delayMinutes?: number
}) {
  if (input.scheduleTime) {
    return input.scheduleTime
  }

  const delay = Number(input.delayMinutes ?? 60)
  const scheduled = new Date(Date.now() + Math.max(delay, 0) * 60_000)
  return scheduled.toISOString()
}

export function generateInstagramContent(input: {
  offer?: string
  topic?: string
  audience?: string
  objective?: string
  tone?: string
  cta?: string
  scheduleTime?: string | null
  delayMinutes?: number
}): InstagramContentDraft {
  const offer = String(input.offer || input.topic || "SEO Audit").trim()
  const audience = String(input.audience || "growing businesses").trim()
  const objective = String(input.objective || "book strategy calls").trim()
  const tone = String(input.tone || "confident, practical").trim()
  const cta = String(input.cta || "DM us \"AUDIT\" to get your action plan").trim()

  const caption = [
    `Your ${offer} should create measurable revenue, not just vanity metrics.`,
    `We built a practical framework for ${audience} to improve traffic quality, conversion rate, and speed to close.`,
    `Objective: ${objective}.`,
    cta,
  ].join("\n\n")

  const hashtags = [
    "digitalmarketing",
    "seo",
    "leadgeneration",
    "growthstrategy",
    "marketingautomation",
    "conversionrateoptimization",
    "agencylife",
    "businessgrowth",
  ]

  const imagePrompt = `Create a premium Instagram marketing visual for ${offer}. Tone: ${tone}. Audience: ${audience}. Include clean typography, bold contrast, and a concise CTA badge.`

  return {
    caption,
    hashtags,
    imagePrompt,
    scheduleTime: defaultScheduleTime({
      scheduleTime: normalizeScheduleTime(input.scheduleTime),
      delayMinutes: input.delayMinutes,
    }),
  }
}

export async function connectInstagramAccount(input: {
  organizationId?: string | null
  accountId: string
  accountName?: string | null
  facebookPageId?: string | null
  accessToken: string
  tokenExpiresAt?: string | null
  metadata?: Record<string, any>
}) {
  const accountId = ensureString(input.accountId, "accountId")
  const accessToken = ensureString(input.accessToken, "accessToken")

  const validation = await validateInstagramConnection({
    igUserId: accountId,
    accessToken,
  })

  const { data, error } = await supabaseAdmin
    .from("social_platform_connections")
    .upsert(
      {
        organization_id: input.organizationId ?? null,
        platform: "instagram",
        account_id: accountId,
        account_name: input.accountName ?? validation.username,
        facebook_page_id: input.facebookPageId ?? null,
        access_token: accessToken,
        token_expires_at: input.tokenExpiresAt ?? null,
        is_active: true,
        metadata: {
          ...(input.metadata || {}),
          accountType: validation.accountType,
          mediaCount: validation.mediaCount,
          lastValidatedByApi: new Date().toISOString(),
        },
        last_validated_at: new Date().toISOString(),
      },
      {
        onConflict: "platform,account_id",
      }
    )
    .select("id,platform,account_id,account_name,is_active,last_validated_at,metadata")
    .single()

  if (error) {
    throw new Error(`Failed to save Instagram connection: ${error.message}`)
  }

  return data
}

async function createPublishEvent(
  draftId: string,
  eventType: string,
  payload: Record<string, any>
) {
  await supabaseAdmin.from("social_publish_events").insert({
    draft_id: draftId,
    event_type: eventType,
    payload,
  })
}

export async function createInstagramDraft(input: {
  organizationId?: string | null
  connectionId: string
  createdBy?: string | null
  mode?: PublishMode
  title?: string | null
  caption: string
  hashtags?: string[]
  imagePrompt?: string | null
  imageUrl?: string | null
  scheduleTime?: string | null
}) {
  const connectionId = ensureString(input.connectionId, "connectionId")
  const caption = ensureString(input.caption, "caption")
  const hashtags = normalizeHashtags(input.hashtags)
  const mode: PublishMode = input.mode === "auto_publish" ? "auto_publish" : "manual_approval"
  const scheduleTime = normalizeScheduleTime(input.scheduleTime)

  const status: DraftStatus =
    mode === "auto_publish"
      ? scheduleTime
        ? "scheduled"
        : "approved"
      : "pending_approval"

  const { data, error } = await supabaseAdmin
    .from("social_post_drafts")
    .insert({
      organization_id: input.organizationId ?? null,
      connection_id: connectionId,
      platform: "instagram",
      mode,
      status,
      title: input.title ?? null,
      caption,
      hashtags,
      image_prompt: input.imagePrompt ?? null,
      image_url: input.imageUrl ?? null,
      schedule_time: scheduleTime,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to create draft: ${error.message}`)
  }

  await createPublishEvent(data.id, "draft_created", {
    mode,
    status,
    scheduleTime,
  })

  return data
}

async function resolveInstagramConnection(input: {
  organizationId?: string | null
  connectionId?: string | null
  accountId?: string | null
}) {
  if (input.connectionId) {
    const connectionId = String(input.connectionId).trim()
    if (!connectionId) {
      throw new Error("connectionId is required when provided")
    }

    const { data, error } = await supabaseAdmin
      .from("social_platform_connections")
      .select("id,platform,is_active")
      .eq("id", connectionId)
      .eq("platform", "instagram")
      .eq("is_active", true)
      .single()

    if (error || !data) {
      throw new Error("Instagram connection not found or inactive")
    }

    return data
  }

  let query = supabaseAdmin
    .from("social_platform_connections")
    .select("id,platform,is_active,last_validated_at,updated_at")
    .eq("platform", "instagram")
    .eq("is_active", true)
    .order("last_validated_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)

  if (input.organizationId) {
    query = query.eq("organization_id", input.organizationId)
  }

  if (input.accountId) {
    query = query.eq("account_id", input.accountId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to resolve Instagram connection: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error(
      "No active Instagram connection found. Connect an account first or pass connectionId"
    )
  }

  return data[0]
}

export async function postInstagram(input: {
  organizationId?: string | null
  connectionId?: string | null
  accountId?: string | null
  createdBy?: string | null
  title?: string | null
  caption: string
  hashtags?: string[]
  imageUrl: string
  imagePrompt?: string | null
  scheduleTime?: string | null
}) {
  const caption = ensureString(input.caption, "caption")
  const imageUrl = ensureString(input.imageUrl, "imageUrl")
  const normalizedSchedule = normalizeScheduleTime(input.scheduleTime)

  const connection = await resolveInstagramConnection({
    organizationId: input.organizationId,
    connectionId: input.connectionId,
    accountId: input.accountId,
  })

  const scheduleMs = normalizedSchedule
    ? new Date(normalizedSchedule).getTime()
    : Number.NaN
  const shouldSchedule =
    normalizedSchedule !== null &&
    !Number.isNaN(scheduleMs) &&
    scheduleMs > Date.now()

  const draft = await createInstagramDraft({
    organizationId: input.organizationId,
    connectionId: String(connection.id),
    createdBy: input.createdBy,
    mode: "auto_publish",
    title: input.title,
    caption,
    hashtags: input.hashtags,
    imagePrompt: input.imagePrompt,
    imageUrl,
    scheduleTime: shouldSchedule ? normalizedSchedule : null,
  })

  if (shouldSchedule) {
    return {
      status: "scheduled" as const,
      draft,
      scheduledFor: normalizedSchedule,
    }
  }

  const publishedDraft = await publishInstagramDraft(String(draft.id))

  return {
    status: "published" as const,
    draft: publishedDraft,
  }
}

export async function approveInstagramDraft(input: {
  draftId: string
  approvedBy?: string | null
}) {
  const draftId = ensureString(input.draftId, "draftId")

  const { data: draft, error: loadError } = await supabaseAdmin
    .from("social_post_drafts")
    .select("id,status,schedule_time")
    .eq("id", draftId)
    .single()

  if (loadError || !draft) {
    throw new Error("Draft not found")
  }

  const status: DraftStatus = draft.schedule_time ? "scheduled" : "approved"

  const { data, error } = await supabaseAdmin
    .from("social_post_drafts")
    .update({
      status,
      approved_by: input.approvedBy ?? null,
      approved_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to approve draft: ${error.message}`)
  }

  await createPublishEvent(draftId, "draft_approved", {
    approvedBy: input.approvedBy ?? null,
    status,
  })

  return data
}

export async function publishInstagramDraft(draftId: string) {
  const cleanDraftId = ensureString(draftId, "draftId")

  const { data: draft, error: draftError } = await supabaseAdmin
    .from("social_post_drafts")
    .select("*")
    .eq("id", cleanDraftId)
    .single()

  if (draftError || !draft) {
    throw new Error("Draft not found")
  }

  if (!draft.image_url) {
    throw new Error("Draft is missing image_url")
  }

  const { data: connection, error: connError } = await supabaseAdmin
    .from("social_platform_connections")
    .select("*")
    .eq("id", draft.connection_id)
    .eq("platform", "instagram")
    .single()

  if (connError || !connection) {
    throw new Error("Instagram connection not found")
  }

  await supabaseAdmin
    .from("social_post_drafts")
    .update({ status: "publishing", error_message: null })
    .eq("id", cleanDraftId)

  await createPublishEvent(cleanDraftId, "publish_started", {
    accountId: connection.account_id,
  })

  try {
    const result = await publishInstagramImagePost({
      igUserId: connection.account_id,
      accessToken: connection.access_token,
      imageUrl: draft.image_url,
      caption: draft.caption,
      hashtags: Array.isArray(draft.hashtags) ? draft.hashtags : [],
    })

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("social_post_drafts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        external_post_id: result.mediaId,
        external_post_url: result.permalink,
        external_payload: result,
      })
      .eq("id", cleanDraftId)
      .select("*")
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    await createPublishEvent(cleanDraftId, "publish_succeeded", {
      mediaId: result.mediaId,
      permalink: result.permalink,
    })

    return updated
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed"

    await supabaseAdmin
      .from("social_post_drafts")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("id", cleanDraftId)

    await createPublishEvent(cleanDraftId, "publish_failed", {
      message,
    })

    throw new Error(message)
  }
}

export async function publishDueInstagramDrafts(limit = 20) {
  const now = new Date().toISOString()

  const { data: candidateDrafts, error } = await supabaseAdmin
    .from("social_post_drafts")
    .select("id,status,schedule_time")
    .eq("platform", "instagram")
    .in("status", ["approved", "scheduled"])
    .order("created_at", { ascending: true })
    .limit(Math.max(1, Math.min(limit * 3, 300)))

  if (error) {
    throw new Error(`Failed to fetch due drafts: ${error.message}`)
  }

  const dueDrafts = (candidateDrafts || [])
    .filter((draft) => {
      if (!draft.schedule_time) {
        return true
      }

      const scheduledMs = new Date(String(draft.schedule_time)).getTime()
      if (Number.isNaN(scheduledMs)) {
        return false
      }

      return scheduledMs <= new Date(now).getTime()
    })
    .slice(0, Math.max(1, Math.min(limit, 100)))

  const published: string[] = []
  const failed: Array<{ id: string; message: string }> = []

  for (const draft of dueDrafts || []) {
    try {
      await publishInstagramDraft(String(draft.id))
      published.push(String(draft.id))
    } catch (publishError) {
      failed.push({
        id: String(draft.id),
        message:
          publishError instanceof Error
            ? publishError.message
            : "Unknown publish error",
      })
    }
  }

  return {
    scanned: (dueDrafts || []).length,
    published,
    failed,
  }
}

export async function listInstagramDrafts(input: {
  connectionId?: string
  status?: DraftStatus
  limit?: number
}) {
  const limit = Math.max(1, Math.min(Number(input.limit ?? 50), 200))

  let query = supabaseAdmin
    .from("social_post_drafts")
    .select("*")
    .eq("platform", "instagram")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (input.connectionId) {
    query = query.eq("connection_id", input.connectionId)
  }

  if (input.status) {
    query = query.eq("status", input.status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list drafts: ${error.message}`)
  }

  return data || []
}
