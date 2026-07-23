// ======================================================
// SEO Specialist
// lib/ai/specialists/seo/agent.ts
// ======================================================
// Rules for specialists: never crawl, never fetch, only
// analyze this domain, produce structured JSON, store in
// memory.analysis.

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { WebsiteHeadings } from "@/lib/ai/collectors/website/types";
import { SEOAudit } from "./types";
import { seoPrompt } from "./prompt";
import { seoSchema } from "./schema";

interface SEOInput {
  url: string;
  title: string;
  description: string;
  headings: WebsiteHeadings;
  links: string[];
  schema: string[];
  metadata: Record<string, string>;
}

export class SEOSpecialist extends BaseAgent<SEOInput, SEOAudit> {
  readonly id = "analyst.seo";
  readonly name = "SEO Specialist";
  readonly description =
    "Analyzes on-page SEO signals from the collected website data.";
  readonly prompt = seoPrompt;
  readonly schema = seoSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): SEOInput {
    const site = memory.collected.website;

    return {
      url: site.url,
      title: site.title,
      description: site.description,
      headings: site.headings,
      links: site.links,
      schema: site.schema,
      metadata: site.metadata,
    };
  }

  protected saveResult(memory: ReportMemory, result: SEOAudit): void {
    memory.analysis.seo = result;
  }
}
