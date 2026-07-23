// ======================================================
// UX Specialist
// lib/ai/specialists/ux/agent.ts
// ======================================================

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import {
  WebsiteHeadings,
  WebsiteForm,
} from "@/lib/ai/collectors/website/types";
import { UXAudit } from "./types";
import { uxPrompt } from "./prompt";
import { uxSchema } from "./schema";

interface UXInput {
  url: string;
  headings: WebsiteHeadings;
  links: string[];
  images: string[];
  forms: WebsiteForm[];
  metadata: Record<string, string>;
}

export class UXSpecialist extends BaseAgent<UXInput, UXAudit> {
  readonly id = "analyst.ux";
  readonly name = "UX Specialist";
  readonly description =
    "Analyzes user experience signals from the collected website data.";
  readonly prompt = uxPrompt;
  readonly schema = uxSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): UXInput {
    const site = memory.collected.website;

    return {
      url: site.url,
      headings: site.headings,
      links: site.links,
      images: site.images,
      forms: site.forms,
      metadata: site.metadata,
    };
  }

  protected saveResult(memory: ReportMemory, result: UXAudit): void {
    memory.analysis.ux = result;
  }
}
