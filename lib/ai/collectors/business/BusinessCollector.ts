// ======================================================
// Business Collector
// lib/ai/collectors/business/BusinessCollector.ts
// ======================================================
// Rules for collectors: no AI, no reasoning, gather data
// once, save into shared memory. Never analyze.
//
// This is the ONE place that calls Google Places. The
// upcoming Google collector should read memory.collected.business
// instead of calling Places again — see note in agent.ts of
// any specialist that needs Google Business data.

import { PipelineTask } from "@/lib/ai/core/registry";
import { ReportMemory } from "@/lib/ai/core/types";
import { findPlace } from "@/lib/ai/tools/google";
import { aiLogger } from "@/lib/ai/core/logger";

function buildQuery(memory: ReportMemory): string {
  const { name, city, country } = memory.business;
  return [name, city, country].filter(Boolean).join(", ");
}

export class BusinessCollector implements PipelineTask {
  readonly id = "collector.business";
  readonly name = "Business Collector";
  readonly description =
    "Looks up the business on Google Places and stores NAP/rating/hours data in shared memory.";
  readonly stage = "collector" as const;

  async execute(memory: ReportMemory): Promise<void> {
    const query = buildQuery(memory);

    if (!query) {
      aiLogger.warning(
        this.name,
        "No business name/city/country set — skipping Places lookup."
      );
      return;
    }

    try {
      const place = await findPlace(query);
      memory.collected.business = place;

      if (place) {
        aiLogger.info(this.name, "Business found on Google Places", {
          query,
          placeId: place.placeId,
        });
      } else {
        aiLogger.warning(
          this.name,
          "No Google Places match found — not treated as an error.",
          { query }
        );
      }
    } catch (error: any) {
      aiLogger.error(this.name, "Places lookup failed", error.message);
      memory.collected.business = null;
    }
  }
}
