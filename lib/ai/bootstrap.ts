// ======================================================
// IgnitiaOS
// Agent Bootstrap — registers every collector/specialist/
// action exactly once.
// lib/ai/bootstrap.ts
// ======================================================
// Call registerAgents() once before running any pipeline
// (e.g. at the top of an API route or the test script).

import { registry } from "@/lib/ai/core/registry";
import { WebsiteCollector } from "@/lib/ai/collectors/website";
import { BusinessCollector } from "@/lib/ai/collectors/business";
import { SocialCollector } from "@/lib/ai/collectors/social";
import { CompetitorsCollector } from "@/lib/ai/collectors/competitors";
import { seoSpecialist } from "@/lib/ai/specialists/seo";
import { uxSpecialist } from "@/lib/ai/specialists/ux";
import { contentSpecialist } from "@/lib/ai/specialists/content";
import { conversionSpecialist } from "@/lib/ai/specialists/conversion";
import { brandingSpecialist } from "@/lib/ai/specialists/branding";
import { copywritingSpecialist } from "@/lib/ai/specialists/copywriting";
import { accessibilitySpecialist } from "@/lib/ai/specialists/accessibility";
import { trustSpecialist } from "@/lib/ai/specialists/trust";
import { socialSpecialist } from "@/lib/ai/specialists/social";
import { googleSpecialist } from "@/lib/ai/specialists/google";
import { reputationSpecialist } from "@/lib/ai/specialists/reputation";
import { competitorSpecialist } from "@/lib/ai/specialists/competitors";
import { ReportBuilderTask } from "@/lib/ai/report-builder";

let registered = false;

export function registerAgents() {
  if (registered) return;

  // Collectors
  registry.register(new WebsiteCollector());
  registry.register(new BusinessCollector());
  registry.register(new SocialCollector());
  registry.register(new CompetitorsCollector());

  // Specialists
  registry.register(seoSpecialist);
  registry.register(uxSpecialist);
  registry.register(contentSpecialist);
  registry.register(conversionSpecialist);
  registry.register(brandingSpecialist);
  registry.register(copywritingSpecialist);
  registry.register(accessibilitySpecialist);
  registry.register(trustSpecialist);
  registry.register(socialSpecialist);
  registry.register(googleSpecialist);
  registry.register(reputationSpecialist);
  registry.register(competitorSpecialist);

  // Actions
  registry.register(new ReportBuilderTask());

  registered = true;
}
