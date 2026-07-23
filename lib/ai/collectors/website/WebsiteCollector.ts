// ======================================================
// Website Collector
// lib/ai/collectors/website/WebsiteCollector.ts
// ======================================================
// Rules for collectors: no AI, no reasoning, gather data once,
// save into shared memory. Never analyze.

import { PipelineTask } from "@/lib/ai/core/registry";
import { ReportMemory } from "@/lib/ai/core/types";
import { crawlWebsite } from "@/lib/ai/tools/crawl";
import { aiLogger } from "@/lib/ai/core/logger";

export class WebsiteCollector implements PipelineTask {
  readonly id = "collector.website";
  readonly name = "Website Collector";
  readonly description =
    "Crawls the business website and stores structured page data in shared memory.";
  readonly stage = "collector" as const;

  async execute(memory: ReportMemory): Promise<void> {
    const url = memory.business.website;

    if (!url) {
      aiLogger.warning(
        this.name,
        "No website URL set on memory.business.website — skipping."
      );
      return;
    }

    const data = await crawlWebsite(url);
    memory.collected.website = data;

    aiLogger.info(this.name, "Website collected", { url });
  }
}
