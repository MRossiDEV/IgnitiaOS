// ======================================================
// Competitor Specialist
// lib/ai/specialists/competitors/agent.ts
// ======================================================
// Reads memory.collected.competitors (crawled once by the
// Competitors Collector) — never crawls competitor sites
// itself.

import { BaseAgent } from "@/lib/ai/core/BaseAgent";
import { ReportMemory } from "@/lib/ai/core/types";
import { CompetitorAudit } from "./types";
import { competitorPrompt } from "./prompt";
import { competitorSchema } from "./schema";

interface CompetitorSummary {
  url: string;
  found: boolean;
  title?: string;
  description?: string;
  headings?: string[];
}

interface CompetitorInput {
  business: {
    title: string;
    description: string;
    headings: string[];
  };
  competitors: CompetitorSummary[];
}

export class CompetitorSpecialist extends BaseAgent<CompetitorInput, CompetitorAudit> {
  readonly id = "analyst.competitors";
  readonly name = "Competitor Specialist";
  readonly description = "Compares the business's website against crawled competitor websites.";
  readonly prompt = competitorPrompt;
  readonly schema = competitorSchema;
  readonly stage = "analyst" as const;

  protected buildInput(memory: ReportMemory): CompetitorInput {
    const site = memory.collected.website;
    const competitors = memory.collected.competitors.competitors ?? [];

    return {
      business: {
        title: site.title,
        description: site.description,
        headings: [...site.headings.h1, ...site.headings.h2],
      },
      competitors: competitors.map((c: any) => ({
        url: c.url,
        found: c.found,
        title: c.website?.title,
        description: c.website?.description,
        headings: c.website
          ? [...c.website.headings.h1, ...c.website.headings.h2]
          : undefined,
      })),
    };
  }

  protected saveResult(memory: ReportMemory, result: CompetitorAudit): void {
    memory.analysis.competitors = result;
  }
}
