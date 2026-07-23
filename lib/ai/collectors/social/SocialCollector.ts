// ======================================================
// Social Collector
// lib/ai/collectors/social/SocialCollector.ts
// ======================================================
// Rules for collectors: no AI, no reasoning, gather data
// once, save into shared memory. Never analyze.
//
// Approach: no social APIs (none requested yet). Finds the
// business's own social links from the website links already
// collected by WebsiteCollector, then fetches each public
// profile page with the existing crawlWebsite tool and keeps
// only what's visible in raw HTML (title, description, og:image).
// Platforms that block server-side fetches or require login
// are recorded as `found: false` rather than failing the run.

import { PipelineTask } from "@/lib/ai/core/registry";
import { ReportMemory } from "@/lib/ai/core/types";
import { crawlWebsite } from "@/lib/ai/tools/crawl";
import { aiLogger } from "@/lib/ai/core/logger";
import { SocialData, SocialPlatform, SocialProfileData } from "./types";

const PLATFORM_HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  twitter: ["twitter.com", "x.com"],
  linkedin: ["linkedin.com"],
  youtube: ["youtube.com", "youtu.be"],
  tiktok: ["tiktok.com"],
};

function detectPlatform(url: string): SocialPlatform | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");

    for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS)) {
      if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
        return platform as SocialPlatform;
      }
    }
  } catch {
    // Not an absolute URL — ignore (relative links can't be a social profile).
  }

  return null;
}

function findProfileLinks(
  links: string[]
): Partial<Record<SocialPlatform, string>> {
  const found: Partial<Record<SocialPlatform, string>> = {};

  for (const link of links) {
    const platform = detectPlatform(link);
    if (platform && !found[platform]) {
      found[platform] = link;
    }
  }

  return found;
}

export class SocialCollector implements PipelineTask {
  readonly id = "collector.social";
  readonly name = "Social Collector";
  readonly description =
    "Finds the business's social profile links from the website and fetches what's publicly visible in each profile's HTML.";
  readonly stage = "collector" as const;

  async execute(memory: ReportMemory): Promise<void> {
    const links = memory.collected.website?.links ?? [];
    const profileLinks = findProfileLinks(links);
    const platforms = Object.keys(profileLinks) as SocialPlatform[];

    if (platforms.length === 0) {
      aiLogger.warning(
        this.name,
        "No recognizable social links found on the website — skipping."
      );
      return;
    }

    const social: SocialData = {};

    for (const platform of platforms) {
      const url = profileLinks[platform]!;

      try {
        const page = await crawlWebsite(url);

        const profile: SocialProfileData = {
          platform,
          url,
          found: Boolean(page.title || page.description),
          title: page.title,
          description: page.description,
          ogImage: page.metadata["og:image"] ?? "",
        };

        social[platform] = profile;

        aiLogger.info(this.name, `Fetched ${platform} profile`, { url });
      } catch (error: any) {
        social[platform] = {
          platform,
          url,
          found: false,
          title: "",
          description: "",
          ogImage: "",
          error: error.message,
        };

        aiLogger.warning(
          this.name,
          `${platform} blocked the fetch or is unreachable — recorded as not found.`,
          { url, error: error.message }
        );
      }
    }

    memory.collected.social = social;
  }
}
