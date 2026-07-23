// ======================================================
// Pipeline Definition: Marketing Report
// lib/ai/pipeline/marketing-report.ts
// ======================================================
// Matches the "Marketing Report" template from the architecture
// doc: SEO, Social, Google Business, Content, Email.
// Email Specialist doesn't exist yet (no email platform
// collector wired up) — omitted until that's built. Add it
// to `analysts` once available, no other change needed.

import { Pipeline } from "@/lib/ai/core/pipelines";

export const marketingReportPipeline: Pipeline = {
  id: "marketing-report",
  name: "Marketing Report",
  description:
    "SEO, Social Media, Google Business, and Content analysis for a business.",
  collectors: [
    { id: "collector.website" },
    { id: "collector.social" },
    { id: "collector.business" },
  ],
  analysts: [
    { id: "analyst.seo" },
    { id: "analyst.social" },
    { id: "analyst.google" },
    { id: "analyst.content" },
    // { id: "analyst.email" }, // TODO: add once Email Specialist + collector exist
  ],
  actions: [{ id: "action.report-builder" }],
};
