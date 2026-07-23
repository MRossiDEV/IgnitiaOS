// ======================================================
// Conversion Specialist
// lib/ai/specialists/conversion/agent.ts
// ======================================================

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { WebsiteHeadings, WebsiteForm } from "@/lib/ai/collectors/website/types";
import { ConversionAudit } from "./types";
import { conversionPrompt } from "./prompt";
import { conversionSchema } from "./schema";

interface ConversionInput {
  url: string;
  headings: WebsiteHeadings;
  links: string[];
  forms: WebsiteForm[];
  metadata: Record<string, string>;
}

export class ConversionSpecialist extends BaseAgent<ConversionInput, ConversionAudit> {
  readonly id = "analyst.conversion";
  readonly name = "Conversion Specialist";
  readonly description = "Analyzes conversion-path clarity and friction from the collected website data.";
  readonly prompt = conversionPrompt;
  readonly schema = conversionSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): ConversionInput {
    const site = memory.collected.website;
    return {
      url: site.url,
      headings: site.headings,
      links: site.links,
      forms: site.forms,
      metadata: site.metadata,
    };
  }

  protected saveResult(memory: ReportMemory, result: ConversionAudit): void {
    memory.analysis.conversion = result;
  }
}
