# Instagram Publishing Integration Guide

This implementation lets your Marketing Agent generate content while a secure backend publishes via the official Instagram Graph API.

## Implemented Architecture

User -> Marketing Agent -> Content/Image Generation -> Approval Queue -> Instagram Publisher Tool -> Instagram Graph API -> Instagram Business Account

## What Was Added

- DB migration: `supabase/migrations/008_social_publishers_instagram.sql`
- Instagram Graph API client: `lib/social/instagram-graph.ts`
- Publishing + queue service: `lib/social/instagram-publishing.ts`
- Agent tool: `lib/tools/tools/instagramPublisher.ts`
- Tool registry integration: `lib/tools/registry.ts`
- API routes:
  - `POST /api/v1/social/instagram/connect`
  - `GET /api/v1/social/instagram/drafts`
  - `POST /api/v1/social/instagram/drafts`
  - `POST /api/v1/social/instagram/drafts/:id/approve`
  - `POST /api/v1/social/instagram/drafts/:id/publish`
  - `POST /api/v1/social/instagram/scheduler`

## Meta Setup Requirements

1. Convert account to Instagram Professional (Business/Creator).
2. Connect Instagram to a Facebook Page.
3. Create Meta app and add Instagram Graph API product.
4. Request required permissions in App Review (production).
5. Use long-lived access tokens for the connected account.

## Environment Variables

Add to `.env.local`:

- `META_GRAPH_API_VERSION` (optional, default: `v23.0`)
- `SOCIAL_SCHEDULER_SECRET` (optional but recommended for scheduler endpoint)

## API Usage

### 1) Connect Instagram account

```bash
curl -X POST http://localhost:3000/api/v1/social/instagram/connect \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "00000000-0000-0000-0000-000000000000",
    "accountId": "17841400000000000",
    "accountName": "Ignitia Marketing",
    "facebookPageId": "123456789012345",
    "accessToken": "EAAB..."
  }'
```

### 2) Create a generated draft (manual approval)

```bash
curl -X POST http://localhost:3000/api/v1/social/instagram/drafts \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "11111111-1111-1111-1111-111111111111",
    "mode": "manual_approval",
    "useGeneratedContent": true,
    "topic": "SEO Audit",
    "audience": "local businesses",
    "imageUrl": "https://cdn.example.com/ig/audit-creative-01.jpg"
  }'
```

### 3) Approve and publish now

```bash
curl -X POST http://localhost:3000/api/v1/social/instagram/drafts/<draft-id>/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "admin-user-id",
    "publishNow": true
  }'
```

### 4) Scheduler trigger for due posts

```bash
curl -X POST http://localhost:3000/api/v1/social/instagram/scheduler \
  -H "Content-Type: application/json" \
  -H "x-ignitia-scheduler-secret: <your-secret>" \
  -d '{"limit": 20}'
```

Run this endpoint from a cron job every 5-10 minutes.

## Agent Tool Contract

`instagram_publisher` supports actions:

- `generate_content`
- `connect_account`
- `create_draft`
- `post_instagram`
- `approve_draft`
- `publish_draft`
- `run_scheduler`
- `list_drafts`

### Direct tool call contract

Use this when the Marketing Agent should decide what to post and the backend handles auth/upload/publish/scheduling:

```ts
postInstagram({
  image_url: "https://cdn.example.com/my-image.jpg",
  caption: "Your caption",
  schedule_time: "2026-07-10T14:00:00.000Z", // optional
});
```

Behavior:

- Resolves active Instagram connection (or uses provided `connectionId`)
- Creates an internal auto-publish draft
- Publishes immediately if `schedule_time` is missing/past
- Schedules if `schedule_time` is in the future
- Logs lifecycle events in `social_publish_events`
- Returns structured errors from Graph API and persistence steps

Example (tool input):

```json
{
  "action": "create_draft",
  "connectionId": "11111111-1111-1111-1111-111111111111",
  "mode": "manual_approval",
  "caption": "Your caption",
  "hashtags": ["seo", "digitalmarketing"],
  "imageUrl": "https://cdn.example.com/my-image.jpg",
  "scheduleTime": "2026-07-10T14:00:00.000Z"
}
```

## Security Notes

- Access tokens are stored server-side only.
- Agent/UI should never call Instagram Graph directly.
- Use scheduler secret for cron endpoint authorization.
- Prefer encrypted token storage (KMS/secret vault) in production.

## Multi-platform Expansion

Tool catalog seeds were added for:

- Instagram Publisher
- Facebook Publisher
- LinkedIn Publisher
- X Publisher
- TikTok Publisher
- Pinterest Publisher
- YouTube Community Publisher

Use the same draft + approval + scheduler pattern per platform.
