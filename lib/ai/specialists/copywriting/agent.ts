// ======================================================
// Copywriting Specialist
// lib/ai/specialists/copywriting/agent.ts
// ======================================================

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { WebsiteHeadings } from "@/lib/ai/collectors/website/types";
import { CopywritingAudit } from "./types";
import { copywritingPrompt } from "./prompt";
import { copywritingSchema } from "./schema";

const MAX_TEXT_CHARS = 6000;

interface CopywritingInput {
  url: string;
  title: string;
  description: string;
  headings: WebsiteHeadings;
  text: string;
}

export class CopywritingSpecialist extends BaseAgent<CopywritingInput, CopywritingAudit> {
  readonly id = "analyst.copywriting";
  readonly name = "Copywriting Specialist";
  readonly description = "Analyzes headline and body copy quality from the collected website data.";
  readonly prompt = copywritingPrompt;
  readonly schema = copywritingSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): CopywritingInput {
    const site = memory.collected.website;
    return {
      url: site.url,
      title: site.title,
      description: site.description,
      headings: site.headings,
      text: site.text.slice(0, MAX_TEXT_CHARS),
    };
  }

  protected saveResult(memory: ReportMemory, result: CopywritingAudit): void {
    memory.analysis.copywriting = result;
  }
}
