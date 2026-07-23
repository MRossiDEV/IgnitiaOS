// ======================================================
// Trust Specialist
// lib/ai/specialists/trust/agent.ts
// ======================================================

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { TrustAudit } from "./types";
import { trustPrompt } from "./prompt";
import { trustSchema } from "./schema";

interface TrustInput {
  url: string;
  links: string[];
  schema: string[];
  forms: number;
  metadata: Record<string, string>;
  google: {
    rating: number | null;
    userRatingsTotal: number | null;
    businessStatus: string;
  } | null;
}

export class TrustSpecialist extends BaseAgent<TrustInput, TrustAudit> {
  readonly id = "analyst.trust";
  readonly name = "Trust Specialist";
  readonly description = "Analyzes trust signals from website data and Google business data.";
  readonly prompt = trustPrompt;
  readonly schema = trustSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): TrustInput {
    const site = memory.collected.website;
    const place = memory.collected.business;

    return {
      url: site.url,
      links: site.links,
      schema: site.schema,
      forms: site.forms.length,
      metadata: site.metadata,
      google: place
        ? {
            rating: place.rating,
            userRatingsTotal: place.userRatingsTotal,
            businessStatus: place.businessStatus,
          }
        : null,
    };
  }

  protected saveResult(memory: ReportMemory, result: TrustAudit): void {
    memory.analysis.trust = result;
  }
}
