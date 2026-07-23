// ======================================================
// Pipeline Definition: Growth Report
// lib/ai/pipeline/growth-report.ts
// ======================================================
// Matches the "Growth Report" template from the architecture
// doc: SEO, UX, Content, Conversion, Branding.

import { Pipeline } from "@/lib/ai/core/pipelines";

export const growthReportPipeline: Pipeline = {
  id: "growth-report",
  name: "Growth Report",
  description:
    "SEO, UX, Content, Conversion, and Branding analysis for a business website.",
  collectors: [{ id: "collector.website" }],
  analysts: [
    { id: "analyst.seo" },
    { id: "analyst.ux" },
    { id: "analyst.content" },
    { id: "analyst.conversion" },
    { id: "analyst.branding" },
  ],
  actions: [{ id: "action.report-builder" }],
};
