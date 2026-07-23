// ======================================================
// Competitors Collector
// lib/ai/collectors/competitors/CompetitorsCollector.ts
// ======================================================
// Rules for collectors: no AI, no reasoning, gather data
// once, save into shared memory. Never analyze.
//
// Each competitor URL is crawled EXACTLY ONCE here, using the
// same crawlWebsite tool as the main Website Collector. Every
// specialist that needs competitor data (Competitor Specialist,
// SEO Specialist doing a comparison, etc.) reads it from
// memory.collected.competitors — none of them crawl again.

import { PipelineTask } from "@/lib/ai/core/registry";
import { ReportMemory } from "@/lib/ai/core/types";
import { crawlWebsite } from "@/lib/ai/tools/crawl";
import { aiLogger } from "@/lib/ai/core/logger";
import { CompetitorData } from "./types";

export class CompetitorsCollector implements PipelineTask {
  readonly id = "collector.competitors";
  readonly name = "Competitors Collector";
  readonly description =
    "Crawls each user-supplied competitor URL exactly once and stores the results in shared memory.";
  readonly stage = "collector" as const;

  async execute(memory: ReportMemory): Promise<void> {
    const urls = memory.business.competitorUrls ?? [];

    if (urls.length === 0) {
      aiLogger.warning(
        this.name,
        "No competitor URLs provided on memory.business.competitorUrls — skipping."
      );
      return;
    }

    const competitors: CompetitorData[] = [];

    for (const url of urls) {
      try {
        const website = await crawlWebsite(url);

        competitors.push({
          url,
          found: true,
          website,
        });

        aiLogger.info(this.name, "Competitor crawled", { url });
      } catch (error: any) {
        competitors.push({
          url,
          found: false,
          error: error.message,
        });

        aiLogger.warning(this.name, "Competitor crawl failed", {
          url,
          error: error.message,
        });
      }
    }

    memory.collected.competitors = { competitors };
  }
}
