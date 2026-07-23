// ======================================================
// Pipeline Definition: Custom Report (admin)
// lib/ai/pipeline/custom-report.ts
// ======================================================
// Unlike the fixed free/growth/marketing pipelines, the admin
// "New Report" screen lets an operator pick exactly which
// specialists to run. This module is the single source of
// truth for:
//   1. the catalog of selectable specialists (shown in the UI), and
//   2. buildCustomPipeline(), which turns a selection into a real
//      Pipeline — pulling in only the collectors those specialists
//      depend on, in the right order, and always ending with the
//      Report Builder action.
//
// Keep SPECIALIST_CATALOG in sync with what bootstrap.ts registers.

import { Pipeline } from "@/lib/ai/core/pipelines";

export type SpecialistTier = "basic" | "pro" | "full";

export interface SpecialistDef {
  /** Registry task id, e.g. "analyst.seo". Sent from the UI as the selection value. */
  id: string;
  /** Human label shown in the UI. */
  label: string;
  /** Short description of what it audits. */
  description: string;
  /** Grouping / relative cost tier in the UI. */
  tier: SpecialistTier;
  /** Indicative credit cost, shown in the UI. */
  cost: number;
  /** Collector task ids this specialist needs run first. */
  collectors: string[];
}

// Collector ids (must match the collectors registered in bootstrap.ts).
const WEBSITE = "collector.website";
const BUSINESS = "collector.business";
const SOCIAL = "collector.social";
const COMPETITORS = "collector.competitors";

// The only "action" — always appended, never user-selectable.
export const REPORT_BUILDER_ACTION = "action.report-builder";

// Collectors are ordered by dependency: website first (social reads the
// links website collected), then business, social, competitors.
const COLLECTOR_ORDER = [WEBSITE, BUSINESS, SOCIAL, COMPETITORS];

export const SPECIALIST_CATALOG: SpecialistDef[] = [
  // --- Basic: on-page website analysis (website crawl only) ---
  {
    id: "analyst.seo",
    label: "SEO",
    description: "On-page SEO signals: titles, meta, headings, schema, links.",
    tier: "basic",
    cost: 1,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.ux",
    label: "User Experience",
    description: "Usability, navigation, and layout of the site.",
    tier: "basic",
    cost: 1,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.content",
    label: "Content",
    description: "Content depth, clarity, and messaging quality.",
    tier: "basic",
    cost: 1,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.branding",
    label: "Branding",
    description: "Brand consistency, positioning, and visual identity cues.",
    tier: "basic",
    cost: 1,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.copywriting",
    label: "Copywriting",
    description: "Headlines, value proposition, and persuasive copy.",
    tier: "basic",
    cost: 1,
    collectors: [WEBSITE],
  },

  // --- Pro: deeper website + presence analysis ---
  {
    id: "analyst.conversion",
    label: "Conversion",
    description: "CTAs, funnels, and conversion friction on the site.",
    tier: "pro",
    cost: 3,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.trust",
    label: "Trust",
    description: "Trust signals: proof, guarantees, contact, security.",
    tier: "pro",
    cost: 3,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.accessibility",
    label: "Accessibility",
    description: "Accessibility of the page for assistive technology.",
    tier: "pro",
    cost: 3,
    collectors: [WEBSITE],
  },
  {
    id: "analyst.social",
    label: "Social Media",
    description: "Public social presence found from the website.",
    tier: "pro",
    cost: 3,
    collectors: [WEBSITE, SOCIAL],
  },
  {
    id: "analyst.google",
    label: "Google Business",
    description: "Google Business Profile completeness (via Places).",
    tier: "pro",
    cost: 3,
    collectors: [BUSINESS],
  },

  // --- Full: external data / reasoning ---
  {
    id: "analyst.reputation",
    label: "Reputation",
    description: "Review rating and volume signals (via Places).",
    tier: "full",
    cost: 5,
    collectors: [BUSINESS],
  },
  {
    id: "analyst.competitors",
    label: "Competitors",
    description: "Comparison against crawled competitor websites.",
    tier: "full",
    cost: 5,
    collectors: [WEBSITE, COMPETITORS],
  },
];

const CATALOG_BY_ID = new Map(SPECIALIST_CATALOG.map((s) => [s.id, s]));

/** Valid selectable specialist ids (for server-side validation). */
export const VALID_SPECIALIST_IDS = new Set(CATALOG_BY_ID.keys());

/**
 * Fallback selection used when regenerating a report that has no stored
 * specialist list (e.g. rows created by an older flow). Covers the
 * website-only specialists so it runs without external API dependencies.
 */
export const DEFAULT_SPECIALIST_IDS = [
  "analyst.seo",
  "analyst.ux",
  "analyst.content",
  "analyst.branding",
  "analyst.copywriting",
  "analyst.conversion",
  "analyst.trust",
  "analyst.accessibility",
];

/**
 * Turn a list of selected specialist ids into an executable Pipeline.
 * Unknown ids are ignored. Collectors are derived from the selection
 * (deduped, dependency-ordered). The Report Builder action is always
 * appended so `memory.metadata.report` is populated at the end.
 */
export function buildCustomPipeline(selectedIds: string[]): Pipeline {
  const analystIds = selectedIds.filter((id) => CATALOG_BY_ID.has(id));

  const neededCollectors = new Set<string>();
  for (const id of analystIds) {
    for (const collector of CATALOG_BY_ID.get(id)!.collectors) {
      neededCollectors.add(collector);
    }
  }

  const collectors = COLLECTOR_ORDER.filter((id) =>
    neededCollectors.has(id)
  ).map((id) => ({ id }));

  const analysts = analystIds.map((id) => ({ id }));

  return {
    id: "custom-report",
    name: "Custom Report",
    description: "Operator-selected specialists for a single business audit.",
    collectors,
    analysts,
    actions: [{ id: REPORT_BUILDER_ACTION }],
  };
}
