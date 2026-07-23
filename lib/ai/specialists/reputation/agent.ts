// ======================================================
// Reputation Specialist
// lib/ai/specialists/reputation/agent.ts
// ======================================================
// Reads memory.collected.business (fetched once by the
// Business Collector via Google Places) — does not call
// Places again, per the "no duplicated extraction" rule.

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { ReputationAudit } from "./types";
import { reputationPrompt } from "./prompt";
import { reputationSchema } from "./schema";

interface ReputationInput {
  found: boolean;
  rating?: number | null;
  userRatingsTotal?: number | null;
  businessStatus?: string;
}

export class ReputationSpecialist extends BaseAgent<ReputationInput, ReputationAudit> {
  readonly id = "analyst.reputation";
  readonly name = "Reputation Specialist";
  readonly description = "Analyzes review rating/volume signals from the collected Places data.";
  readonly prompt = reputationPrompt;
  readonly schema = reputationSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): ReputationInput {
    const place = memory.collected.business;

    if (!place) {
      return { found: false };
    }

    return {
      found: true,
      rating: place.rating,
      userRatingsTotal: place.userRatingsTotal,
      businessStatus: place.businessStatus,
    };
  }

  protected saveResult(memory: ReportMemory, result: ReputationAudit): void {
    memory.analysis.reputation = result;
  }
}
