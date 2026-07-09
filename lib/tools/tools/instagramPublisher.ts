import type { Tool } from "@/lib/tools/types"
import {
  approveInstagramDraft,
  connectInstagramAccount,
  createInstagramDraft,
  generateInstagramContent,
  listInstagramDrafts,
  postInstagram,
  publishDueInstagramDrafts,
  publishInstagramDraft,
} from "@/lib/social/instagram-publishing"

type PublisherAction =
  | "generate_content"
  | "connect_account"
  | "create_draft"
  | "post_instagram"
  | "approve_draft"
  | "publish_draft"
  | "run_scheduler"
  | "list_drafts"

function parseAction(input: Record<string, any>): PublisherAction {
  const action = String(input.action || "generate_content").trim().toLowerCase()

  const allowed: PublisherAction[] = [
    "generate_content",
    "connect_account",
    "create_draft",
    "post_instagram",
    "approve_draft",
    "publish_draft",
    "run_scheduler",
    "list_drafts",
  ]

  if (!allowed.includes(action as PublisherAction)) {
    throw new Error(`Unsupported instagram_publisher action: ${action}`)
  }

  return action as PublisherAction
}

export const instagramPublisher: Tool = {
  name: "instagram_publisher",
  description:
    "Generates Instagram content, saves approval drafts, and publishes through the Instagram Graph API from a secure backend",
  async run(input) {
    const action = parseAction(input)

    switch (action) {
      case "generate_content": {
        return {
          action,
          platform: "instagram",
          content: generateInstagramContent({
            offer: input.offer,
            topic: input.topic,
            audience: input.audience,
            objective: input.objective,
            tone: input.tone,
            cta: input.cta,
            scheduleTime: input.scheduleTime,
            delayMinutes: input.delayMinutes,
          }),
        }
      }

      case "connect_account": {
        const connection = await connectInstagramAccount({
          organizationId: input.organizationId,
          accountId: input.accountId,
          accountName: input.accountName,
          facebookPageId: input.facebookPageId,
          accessToken: input.accessToken,
          tokenExpiresAt: input.tokenExpiresAt,
          metadata: input.metadata,
        })

        return {
          action,
          platform: "instagram",
          connection,
        }
      }

      case "create_draft": {
        const draft = await createInstagramDraft({
          organizationId: input.organizationId,
          connectionId: input.connectionId,
          createdBy: input.createdBy,
          mode: input.mode,
          title: input.title,
          caption: input.caption,
          hashtags: input.hashtags,
          imagePrompt: input.imagePrompt,
          imageUrl: input.imageUrl,
          scheduleTime: input.scheduleTime,
        })

        return {
          action,
          platform: "instagram",
          draft,
        }
      }

      case "post_instagram": {
        const result = await postInstagram({
          organizationId: input.organizationId,
          connectionId: input.connectionId,
          accountId: input.accountId,
          createdBy: input.createdBy,
          title: input.title,
          caption: input.caption,
          hashtags: input.hashtags,
          imagePrompt: input.imagePrompt,
          imageUrl: input.image_url ?? input.imageUrl,
          scheduleTime: input.schedule_time ?? input.scheduleTime,
        })

        return {
          action,
          platform: "instagram",
          ...result,
        }
      }

      case "approve_draft": {
        const draft = await approveInstagramDraft({
          draftId: input.draftId,
          approvedBy: input.approvedBy,
        })

        return {
          action,
          platform: "instagram",
          draft,
        }
      }

      case "publish_draft": {
        const draft = await publishInstagramDraft(String(input.draftId || ""))
        return {
          action,
          platform: "instagram",
          draft,
        }
      }

      case "run_scheduler": {
        const summary = await publishDueInstagramDrafts(Number(input.limit ?? 20))
        return {
          action,
          platform: "instagram",
          ...summary,
        }
      }

      case "list_drafts": {
        const drafts = await listInstagramDrafts({
          connectionId: input.connectionId,
          status: input.status,
          limit: input.limit,
        })

        return {
          action,
          platform: "instagram",
          count: drafts.length,
          drafts,
        }
      }

      default:
        throw new Error(`Unsupported instagram_publisher action: ${action}`)
    }
  },
}
