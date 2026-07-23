// ======================================================
// Social Media Specialist
// lib/ai/specialists/social/agent.ts
// ======================================================

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { SocialAudit } from "./types";
import { socialPrompt } from "./prompt";
import { socialSchema } from "./schema";

interface SocialInput {
  websiteTitle: string;
  websiteDescription: string;
  profiles: Record<string, any>;
}

export class SocialSpecialist extends BaseAgent<SocialInput, SocialAudit> {
  readonly id = "analyst.social";
  readonly name = "Social Media Specialist";
  readonly description = "Analyzes the business's social presence from the collected profile data.";
  readonly prompt = socialPrompt;
  readonly schema = socialSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): SocialInput {
    const site = memory.collected.website;

    return {
      websiteTitle: site.title,
      websiteDescription: site.description,
      profiles: memory.collected.social,
    };
  }

  protected saveResult(memory: ReportMemory, result: SocialAudit): void {
    memory.analysis.social = result;
  }
}
