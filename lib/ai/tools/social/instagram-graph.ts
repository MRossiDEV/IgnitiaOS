const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v23.0"
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`

type GraphApiError = {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

export type InstagramPublishResult = {
  mediaId: string
  permalink: string | null
  containerId: string
}

function assertHttpsUrl(value: string, field: string) {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== "https:") {
      throw new Error(`${field} must be an https URL`)
    }
  } catch {
    throw new Error(`${field} must be a valid https URL`)
  }
}

function normalizeCaption(caption: string, hashtags: string[] = []) {
  const cleanCaption = String(caption || "").trim()
  const cleanTags = hashtags
    .map((tag) => String(tag || "").trim().replace(/^#*/, ""))
    .filter(Boolean)
    .slice(0, 30)

  if (cleanTags.length === 0) {
    return cleanCaption
  }

  const hashtagBlock = cleanTags.map((tag) => `#${tag}`).join(" ")
  return cleanCaption ? `${cleanCaption}\n\n${hashtagBlock}` : hashtagBlock
}

async function parseGraphResponse(response: Response) {
  const json = (await response.json()) as Record<string, any> & GraphApiError

  if (!response.ok) {
    const message =
      json?.error?.message ||
      `Instagram Graph API request failed with status ${response.status}`

    const details = {
      status: response.status,
      type: json?.error?.type,
      code: json?.error?.code,
      subcode: json?.error?.error_subcode,
      trace: json?.error?.fbtrace_id,
    }

    throw new Error(`${message} | details=${JSON.stringify(details)}`)
  }

  return json
}

async function graphPost(path: string, searchParams: Record<string, string>) {
  const body = new URLSearchParams(searchParams)

  const response = await fetch(`${GRAPH_BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  })

  return parseGraphResponse(response)
}

async function graphGet(path: string, searchParams: Record<string, string>) {
  const qs = new URLSearchParams(searchParams)
  const response = await fetch(`${GRAPH_BASE_URL}/${path}?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  return parseGraphResponse(response)
}

export async function validateInstagramConnection(input: {
  igUserId: string
  accessToken: string
}) {
  const igUserId = String(input.igUserId || "").trim()
  const accessToken = String(input.accessToken || "").trim()

  if (!igUserId) {
    throw new Error("igUserId is required")
  }

  if (!accessToken) {
    throw new Error("accessToken is required")
  }

  const profile = await graphGet(igUserId, {
    fields: "id,username,account_type,media_count",
    access_token: accessToken,
  })

  return {
    id: profile.id as string,
    username: (profile.username as string | undefined) || null,
    accountType: (profile.account_type as string | undefined) || null,
    mediaCount: typeof profile.media_count === "number" ? profile.media_count : null,
  }
}

export async function publishInstagramImagePost(input: {
  igUserId: string
  accessToken: string
  imageUrl: string
  caption: string
  hashtags?: string[]
}) : Promise<InstagramPublishResult> {
  const igUserId = String(input.igUserId || "").trim()
  const accessToken = String(input.accessToken || "").trim()
  const imageUrl = String(input.imageUrl || "").trim()

  if (!igUserId) {
    throw new Error("igUserId is required")
  }

  if (!accessToken) {
    throw new Error("accessToken is required")
  }

  assertHttpsUrl(imageUrl, "imageUrl")

  const caption = normalizeCaption(input.caption, input.hashtags)

  const mediaContainer = await graphPost(`${igUserId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  })

  const containerId = String(mediaContainer.id || "").trim()

  if (!containerId) {
    throw new Error("Instagram API did not return a media container id")
  }

  const published = await graphPost(`${igUserId}/media_publish`, {
    creation_id: containerId,
    access_token: accessToken,
  })

  const mediaId = String(published.id || "").trim()

  if (!mediaId) {
    throw new Error("Instagram API did not return a media id")
  }

  const mediaMeta = await graphGet(mediaId, {
    fields: "id,permalink,timestamp",
    access_token: accessToken,
  })

  return {
    mediaId,
    permalink:
      typeof mediaMeta.permalink === "string" ? mediaMeta.permalink : null,
    containerId,
  }
}
