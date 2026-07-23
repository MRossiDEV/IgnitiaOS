// ======================================================
// Branding Specialist
// lib/ai/specialists/branding/agent.ts
// ======================================================

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { WebsiteHeadings } from "@/lib/ai/collectors/website/types";
import { BrandingAudit } from "./types";
import { brandingPrompt } from "./prompt";
import { brandingSchema } from "./schema";

interface BrandingInput {
  url: string;
  title: string;
  description: string;
  headings: WebsiteHeadings;
  schema: string[];
  metadata: Record<string, string>;
}

export class BrandingSpecialist extends BaseAgent<BrandingInput, BrandingAudit> {
  readonly id = "analyst.branding";
  readonly name = "Branding Specialist";
  readonly description = "Analyzes brand identity consistency from the collected website data.";
  readonly prompt = brandingPrompt;
  readonly schema = brandingSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): BrandingInput {
    const site = memory.collected.website;
    return {
      url: site.url,
      title: site.title,
      description: site.description,
      headings: site.headings,
      schema: site.schema,
      metadata: site.metadata,
    };
  }

  protected saveResult(memory: ReportMemory, result: BrandingAudit): void {
    memory.analysis.branding = result;
  }
}
