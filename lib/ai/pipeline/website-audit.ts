// ======================================================
// Pipeline Definition: Website Audit
// lib/ai/pipeline/website-audit.ts
// ======================================================
// Named, configurable pipeline. This is the "Basic Audit"
// style report: SEO + UX only. New report templates are
// added here as new Pipeline objects — no code elsewhere
// needs to change.

import { Pipeline } from "@/lib/ai/core/pipelines";

export const websiteAuditPipeline: Pipeline = {
  id: "website-audit",
  name: "Website Audit",
  description: "Basic audit covering SEO and UX for a business website.",
  collectors: [{ id: "collector.website" }],
  analysts: [
    { id: "analyst.seo" },
    { id: "analyst.ux" },
    { id: "analyst.content" },
  ],
  actions: [{ id: "action.report-builder" }],
};
