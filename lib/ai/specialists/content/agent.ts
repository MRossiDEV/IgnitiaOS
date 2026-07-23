// ======================================================
// Content Specialist
// lib/ai/specialists/content/agent.ts
// ======================================================
// Rules for specialists: never crawl, never fetch, only
// analyze this domain, produce structured JSON, store in
// memory.analysis.

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { WebsiteHeadings } from "@/lib/ai/collectors/website/types";
import { ContentAudit } from "./types";
import { contentPrompt } from "./prompt";
import { contentSchema } from "./schema";

const MAX_TEXT_CHARS = 6000;

interface ContentInput {
  url: string;
  title: string;
  description: string;
  headings: WebsiteHeadings;
  text: string;
}

export class ContentSpecialist extends BaseAgent<
  ContentInput,
  ContentAudit
> {
  readonly id = "analyst.content";
  readonly name = "Content Specialist";
  readonly description =
    "Analyzes messaging quality and content structure from the collected website data.";
  readonly prompt = contentPrompt;
  readonly schema = contentSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): ContentInput {
    const site = memory.collected.website;

    return {
      url: site.url,
      title: site.title,
      description: site.description,
      headings: site.headings,
      // Trimmed to keep token usage predictable per your Token
      // Philosophy — never send more than the specialist needs.
      text: site.text.slice(0, MAX_TEXT_CHARS),
    };
  }

  protected saveResult(memory: ReportMemory, result: ContentAudit): void {
    memory.analysis.content = result;
  }
}
