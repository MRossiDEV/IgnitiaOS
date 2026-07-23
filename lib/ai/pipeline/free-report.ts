// ======================================================
// Pipeline Definition: Free Report
// lib/ai/pipeline/free-report.ts
// ======================================================
// Tuned to exactly what free_reports' score columns need:
// seo_score, google_score, social_score, conversion_score,
// plus a general website_score rolled up from UX/Content/
// Branding in ReportService. Kept smaller than growth-report
// on purpose — this runs on a public, unauthenticated form,
// so fewer Claude calls = faster + cheaper per submission.

import { Pipeline } from "@/lib/ai/core/pipelines";

export const freeReportPipeline: Pipeline = {
  id: "free-report",
  name: "Free Report",
  description:
    "Public free-report flow: SEO, UX, Content, Conversion, Branding, Google Business, Social.",
  collectors: [
    { id: "collector.website" },
    { id: "collector.business" },
    { id: "collector.social" },
  ],
  analysts: [
    { id: "analyst.seo" },
    { id: "analyst.ux" },
    { id: "analyst.content" },
    { id: "analyst.conversion" },
    { id: "analyst.branding" },
    { id: "analyst.google" },
    { id: "analyst.social" },
  ],
  actions: [{ id: "action.report-builder" }],
};
