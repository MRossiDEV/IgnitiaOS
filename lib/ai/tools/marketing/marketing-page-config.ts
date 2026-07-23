import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { SiX } from "react-icons/si";

export type SocialAccountAuth = {
  type: "oauth" | "token" | "password";
  username: string;
  hasSecret: boolean;
  updatedAt: string | null;
};

export type SocialAccountSettings = {
  timezone: string;
  postingWindow: string;
  autoPublish: boolean;
  defaultHashtags: string[];
  brandVoice: string;
};

export type SocialAccount = {
  id: string;
  name: string;
  icon: IconType;
  connected: boolean;
  account: string;
  color: string;
  settings: SocialAccountSettings;
  auth: SocialAccountAuth;
};

export const DEFAULT_ACCOUNT_AUTH: SocialAccountAuth = {
  type: "token",
  username: "",
  hasSecret: false,
  updatedAt: null,
};

export const DEFAULT_ACCOUNT_SETTINGS: SocialAccountSettings = {
  timezone: "UTC",
  postingWindow: "09:00-12:00",
  autoPublish: false,
  defaultHashtags: [],
  brandVoice: "Professional",
};

export function normalizeAccountSettings(input: unknown): SocialAccountSettings {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return DEFAULT_ACCOUNT_SETTINGS;
  }

  const row = input as Record<string, unknown>;
  const timezone =
    typeof row.timezone === "string" && row.timezone.trim().length > 0
      ? row.timezone.trim()
      : DEFAULT_ACCOUNT_SETTINGS.timezone;

  const postingWindow =
    typeof row.postingWindow === "string" && row.postingWindow.trim().length > 0
      ? row.postingWindow.trim()
      : DEFAULT_ACCOUNT_SETTINGS.postingWindow;

  const brandVoice =
    typeof row.brandVoice === "string" && row.brandVoice.trim().length > 0
      ? row.brandVoice.trim()
      : DEFAULT_ACCOUNT_SETTINGS.brandVoice;

  const defaultHashtags = Array.isArray(row.defaultHashtags)
    ? row.defaultHashtags
        .map((tag) =>
          typeof tag === "string" ? tag.trim().replace(/^#+/, "") : ""
        )
        .filter(Boolean)
        .slice(0, 30)
    : [];

  return {
    timezone,
    postingWindow,
    autoPublish: Boolean(row.autoPublish),
    defaultHashtags,
    brandVoice,
  };
}

export function hashtagsToText(tags: string[]): string {
  return tags.join(", ");
}

export function parseHashtagsText(text: string): string[] {
  return text
    .split(",")
    .map((tag) => tag.trim().replace(/^#+/, ""))
    .filter(Boolean)
    .slice(0, 30);
}

export const defaultSocialAccounts = [
  {
    id: "instagram",
    name: "Instagram",
    icon: FaInstagram,
    connected: true,
    account: "@ignitia.ai",
    color: "from-pink-500 to-orange-500",
    settings: DEFAULT_ACCOUNT_SETTINGS,
    auth: DEFAULT_ACCOUNT_AUTH,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: FaFacebook,
    connected: true,
    account: "Ignitia AI",
    color: "from-blue-500 to-blue-700",
    settings: DEFAULT_ACCOUNT_SETTINGS,
    auth: DEFAULT_ACCOUNT_AUTH,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: FaLinkedin,
    connected: false,
    account: "Not Connected",
    color: "from-sky-500 to-blue-600",
    settings: DEFAULT_ACCOUNT_SETTINGS,
    auth: DEFAULT_ACCOUNT_AUTH,
  },
  {
    id: "x",
    name: "X",
    icon: SiX,
    connected: false,
    account: "Not Connected",
    color: "from-zinc-600 to-zinc-800",
    settings: DEFAULT_ACCOUNT_SETTINGS,
    auth: DEFAULT_ACCOUNT_AUTH,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: FaTiktok,
    connected: false,
    account: "Not Connected",
    color: "from-fuchsia-500 to-pink-500",
    settings: DEFAULT_ACCOUNT_SETTINGS,
    auth: DEFAULT_ACCOUNT_AUTH,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: FaYoutube,
    connected: false,
    account: "Not Connected",
    color: "from-red-500 to-red-700",
    settings: DEFAULT_ACCOUNT_SETTINGS,
    auth: DEFAULT_ACCOUNT_AUTH,
  },
] satisfies SocialAccount[];

export type EditableAccountDraft = {
  account: string;
  connected: boolean;
  settings: SocialAccountSettings;
  hashtagsText: string;
  authType: "oauth" | "token" | "password";
  authUsername: string;
  authSecret: string;
  hasStoredSecret: boolean;
  error: string | null;
};

export type AccountSettingsRow = {
  platform: string;
  connected: boolean;
  account_label: string | null;
  settings: Record<string, any> | null;
  auth?: {
    type?: "oauth" | "token" | "password";
    username?: string | null;
    hasSecret?: boolean;
    updatedAt?: string | null;
  } | null;
};

export function mergeAccountSettings(rows: AccountSettingsRow[]): SocialAccount[] {
  const byPlatform = new Map<string, AccountSettingsRow>();
  for (const row of rows) {
    byPlatform.set(row.platform, row);
  }

  return defaultSocialAccounts.map((base) => {
    const row = byPlatform.get(base.id);
    if (!row) {
      return base;
    }

    const connected = Boolean(row.connected);
    const accountLabel =
      typeof row.account_label === "string" && row.account_label.trim().length > 0
        ? row.account_label.trim()
        : connected
          ? base.account
          : "Not Connected";

    return {
      ...base,
      connected,
      account: accountLabel,
      settings:
        row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
          ? normalizeAccountSettings(row.settings)
          : DEFAULT_ACCOUNT_SETTINGS,
      auth: {
        type: row.auth?.type || "token",
        username: row.auth?.username || "",
        hasSecret: Boolean(row.auth?.hasSecret),
        updatedAt: row.auth?.updatedAt || null,
      },
    };
  });
}

export type DbMarketingAgent = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  accent_color?: string | null;
  color?: string | null;
};

export type MarketingAgentCard = {
  id: string;
  name: string;
  badge: string;
  description: string;
  accentColor: string;
  jobs: number;
  status: string;
};

export type PublisherAction =
  | "publish_now"
  | "create_draft"
  | "list_drafts"
  | "approve_draft"
  | "publish_draft"
  | "run_scheduler"
  | "create_post"
  | "schedule_post";

export type PublisherMediaType = "image" | "video" | null;

export type PlatformPublisherProfile = {
  headline: string;
  description: string;
  contentLabel: string;
  contentPlaceholder: string;
  secondaryLabel: string;
  secondaryPlaceholder: string;
  titleLabel: string;
  titlePlaceholder: string;
  actionOptions: Array<{ value: PublisherAction; label: string }>;
  supportsApiPublishing: boolean;
};

export type InstagramDraftSummary = {
  id: string;
  status: string;
  caption: string | null;
  scheduled_for: string | null;
};

export type InstagramConnectionSummary = {
  id: string;
  accountId: string | null;
  accountName: string | null;
  lastValidatedAt: string | null;
};

type PlatformCardMeta = {
  accountType: string;
  permissions: string;
  followers: string;
};

export type CalendarDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type CalendarPlatform = SocialAccount["id"] | "content";

export type CalendarItem = {
  id: string;
  title: string;
  platform: CalendarPlatform;
};

export type CalendarBoard = Record<CalendarDay, CalendarItem[]>;

export const WEEK_DAYS: CalendarDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const initialCalendarBoard: CalendarBoard = {
  Monday: [{ id: "cal-ig", title: "Instagram", platform: "instagram" }],
  Tuesday: [{ id: "cal-li", title: "LinkedIn", platform: "linkedin" }],
  Wednesday: [{ id: "cal-fb", title: "Facebook", platform: "facebook" }],
  Thursday: [{ id: "cal-reel", title: "Reel", platform: "instagram" }],
  Friday: [{ id: "cal-blog", title: "Blog", platform: "content" }],
};

export function calendarPlatformAccent(platform: CalendarPlatform) {
  switch (platform) {
    case "instagram":
      return "from-pink-500 to-orange-500";
    case "facebook":
      return "from-blue-500 to-blue-700";
    case "linkedin":
      return "from-sky-500 to-blue-600";
    case "x":
      return "from-zinc-500 to-zinc-700";
    case "tiktok":
      return "from-fuchsia-500 to-pink-500";
    case "youtube":
      return "from-red-500 to-red-700";
    default:
      return "from-emerald-500 to-teal-600";
  }
}

export const platformCardMeta: Record<SocialAccount["id"], PlatformCardMeta> = {
  instagram: {
    accountType: "Business Account",
    permissions: "publish_content, insights",
    followers: "12.4K",
  },
  facebook: {
    accountType: "Page",
    permissions: "pages_manage_posts, pages_read_engagement",
    followers: "8.7K",
  },
  linkedin: {
    accountType: "Company Page",
    permissions: "w_member_social, rw_organization_admin",
    followers: "3.2K",
  },
  x: {
    accountType: "Professional",
    permissions: "tweet.read, tweet.write",
    followers: "5.1K",
  },
  tiktok: {
    accountType: "Business",
    permissions: "video.publish, user.info.basic",
    followers: "18.9K",
  },
  youtube: {
    accountType: "Brand Channel",
    permissions: "youtube.upload, youtube.readonly",
    followers: "2.9K",
  },
};

export function formatLastSync(isoDate: string | null) {
  if (!isoDate) {
    return "Never";
  }

  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) {
    return "Unknown";
  }

  return dt.toLocaleString();
}

export const publisherProfileByPlatform: Record<SocialAccount["id"], PlatformPublisherProfile> = {
  instagram: {
    headline: "Instagram Publisher",
    description: "Draft, approve, publish, and run scheduler for Instagram Graph API.",
    contentLabel: "Caption",
    contentPlaceholder: "Write an Instagram caption...",
    secondaryLabel: "Hashtags",
    secondaryPlaceholder: "ai, marketing, growth",
    titleLabel: "Draft Title",
    titlePlaceholder: "Product launch carousel",
    actionOptions: [
      { value: "publish_now", label: "Publish Now" },
      { value: "create_draft", label: "Create Draft" },
      { value: "list_drafts", label: "List Drafts" },
      { value: "approve_draft", label: "Approve Draft" },
      { value: "publish_draft", label: "Publish Draft" },
      { value: "run_scheduler", label: "Run Scheduler" },
    ],
    supportsApiPublishing: true,
  },
  facebook: {
    headline: "Facebook Publisher",
    description: "Compose page-focused posts with media/link context and publish workflows.",
    contentLabel: "Post Copy",
    contentPlaceholder: "Write the Facebook post copy...",
    secondaryLabel: "Media or Link",
    secondaryPlaceholder: "https://...",
    titleLabel: "Post Theme",
    titlePlaceholder: "Community update",
    actionOptions: [
      { value: "create_post", label: "Create Post Brief" },
      { value: "schedule_post", label: "Schedule Post Brief" },
    ],
    supportsApiPublishing: false,
  },
  linkedin: {
    headline: "LinkedIn Publisher",
    description: "Design professional thought-leadership posts with business context.",
    contentLabel: "Professional Post",
    contentPlaceholder: "Write the LinkedIn post...",
    secondaryLabel: "Link or CTA",
    secondaryPlaceholder: "https://...",
    titleLabel: "Topic",
    titlePlaceholder: "Industry insight",
    actionOptions: [
      { value: "create_post", label: "Create Post Brief" },
      { value: "schedule_post", label: "Schedule Post Brief" },
    ],
    supportsApiPublishing: false,
  },
  x: {
    headline: "X Publisher",
    description: "Prepare concise high-impact posts or thread-ready drafts.",
    contentLabel: "Post Text",
    contentPlaceholder: "Write a concise X post...",
    secondaryLabel: "Thread Notes",
    secondaryPlaceholder: "Optional thread continuation",
    titleLabel: "Angle",
    titlePlaceholder: "Hot take / announcement",
    actionOptions: [
      { value: "create_post", label: "Create Post Brief" },
      { value: "schedule_post", label: "Schedule Post Brief" },
    ],
    supportsApiPublishing: false,
  },
  tiktok: {
    headline: "TikTok Publisher",
    description: "Build short-form video briefs with hooks and CTA planning.",
    contentLabel: "Caption / Hook",
    contentPlaceholder: "Write TikTok caption and opening hook...",
    secondaryLabel: "Video Asset",
    secondaryPlaceholder: "Video URL or shot list",
    titleLabel: "Video Concept",
    titlePlaceholder: "Behind the scenes",
    actionOptions: [
      { value: "create_post", label: "Create Post Brief" },
      { value: "schedule_post", label: "Schedule Post Brief" },
    ],
    supportsApiPublishing: false,
  },
  youtube: {
    headline: "YouTube Publisher",
    description: "Prepare long-form video metadata and scheduling notes.",
    contentLabel: "Description",
    contentPlaceholder: "Write YouTube video description...",
    secondaryLabel: "Tags / Keywords",
    secondaryPlaceholder: "ai, automation, sales",
    titleLabel: "Video Title",
    titlePlaceholder: "How to automate marketing",
    actionOptions: [
      { value: "create_post", label: "Create Video Brief" },
      { value: "schedule_post", label: "Schedule Video Brief" },
    ],
    supportsApiPublishing: false,
  },
};

export const fallbackMarketingAgents: MarketingAgentCard[] = [
  {
    id: "fallback-1",
    name: "Marketing Director",
    badge: "MD",
    description: "Plans and coordinates every marketing campaign.",
    accentColor: "#22d3ee",
    jobs: 2,
    status: "active",
  },
  {
    id: "fallback-2",
    name: "Copywriter",
    badge: "CW",
    description: "Writes captions, ads, blogs and emails.",
    accentColor: "#f472b6",
    jobs: 4,
    status: "active",
  },
  {
    id: "fallback-3",
    name: "Image Creator",
    badge: "IC",
    description: "Generates social media images.",
    accentColor: "#fb923c",
    jobs: 1,
    status: "paused",
  },
];

const accentFallbacks = [
  "#22d3ee",
  "#f472b6",
  "#fb923c",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f59e0b",
  "#14b8a6",
];

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

export function withAlpha(hex: string, alphaHex: string) {
  return `${hex}${alphaHex}`;
}

function pickAgentBadge(name: string) {
  const words = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "");

  return words.join("") || "AG";
}

export function toMarketingAgentCard(agent: DbMarketingAgent, index: number): MarketingAgentCard {
  const name = agent.name || `Marketing Agent ${index + 1}`;
  const accentColor = isHexColor(agent.accent_color)
    ? agent.accent_color
    : isHexColor(agent.color)
      ? agent.color
      : accentFallbacks[index % accentFallbacks.length];

  return {
    id: agent.id,
    name,
    badge: pickAgentBadge(name),
    description:
      agent.description ||
      "Executes campaign tasks, content production, and channel optimization.",
    accentColor,
    jobs: (index % 6) + 1,
    status: agent.status || "active",
  };
}
