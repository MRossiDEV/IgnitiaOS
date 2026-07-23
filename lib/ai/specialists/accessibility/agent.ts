// ======================================================
// Accessibility Specialist
// lib/ai/specialists/accessibility/agent.ts
// ======================================================
// NOTE: crawlWebsite does not yet capture image alt text.
// This specialist is scoped around that known gap — see
// prompt.ts. Add alt-text extraction to the crawler tool
// later, then extend AccessibilityInput accordingly.

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { WebsiteHeadings, WebsiteForm } from "@/lib/ai/collectors/website/types";
import { AccessibilityAudit } from "./types";
import { accessibilityPrompt } from "./prompt";
import { accessibilitySchema } from "./schema";

interface AccessibilityInput {
  url: string;
  language: string;
  headings: WebsiteHeadings;
  forms: WebsiteForm[];
  imageCount: number;
  metadata: Record<string, string>;
}

export class AccessibilitySpecialist extends BaseAgent<AccessibilityInput, AccessibilityAudit> {
  readonly id = "analyst.accessibility";
  readonly name = "Accessibility Specialist";
  readonly description = "Analyzes accessibility signals visible in the collected website data.";
  readonly prompt = accessibilityPrompt;
  readonly schema = accessibilitySchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): AccessibilityInput {
    const site = memory.collected.website;
    return {
      url: site.url,
      language: site.language,
      headings: site.headings,
      forms: site.forms,
      imageCount: site.images.length,
      metadata: site.metadata,
    };
  }

  protected saveResult(memory: ReportMemory, result: AccessibilityAudit): void {
    memory.analysis.accessibility = result;
  }
}
