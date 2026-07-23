// ======================================================
// Social Collector — Types
// lib/ai/collectors/social/types.ts
// ======================================================

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "tiktok";

export interface SocialProfileData {
  platform: SocialPlatform;
  url: string;
  found: boolean;
  title: string;
  description: string;
  ogImage: string;
  error?: string;
}

export type SocialData = Partial<
  Record<SocialPlatform, SocialProfileData>
>;
