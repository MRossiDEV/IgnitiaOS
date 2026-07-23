// ======================================================
// Google Business Specialist
// lib/ai/specialists/google/agent.ts
// ======================================================
// Reads memory.collected.business (fetched once by the
// Business Collector via Google Places) — does not call
// Places again, per the "no duplicated extraction" rule.

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { GoogleAudit } from "./types";
import { googlePrompt } from "./prompt";
import { googleSchema } from "./schema";

interface GoogleInput {
  found: boolean;
  name?: string;
  formattedAddress?: string;
  phone?: string;
  website?: string;
  types?: string[];
  openingHours?: string[];
  priceLevel?: number | null;
  photoCount?: number;
}

export class GoogleSpecialist extends BaseAgent<GoogleInput, GoogleAudit> {
  readonly id = "analyst.google";
  readonly name = "Google Business Specialist";
  readonly description = "Analyzes Google Business Profile completeness from the collected Places data.";
  readonly prompt = googlePrompt;
  readonly schema = googleSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): GoogleInput {
    const place = memory.collected.business;

    if (!place) {
      return { found: false };
    }

    return {
      found: true,
      name: place.name,
      formattedAddress: place.formattedAddress,
      phone: place.phone,
      website: place.website,
      types: place.types,
      openingHours: place.openingHours,
      priceLevel: place.priceLevel,
      photoCount: place.photos.length,
    };
  }

  protected saveResult(memory: ReportMemory, result: GoogleAudit): void {
    memory.analysis.google = result;
  }
}
