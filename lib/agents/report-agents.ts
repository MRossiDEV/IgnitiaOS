export type AgentStage = "collector" | "snapshot" | "premium";

export interface ReportAgent {
  id: string;
  name: string;
  endpoint: string;
  stage: AgentStage;
  order: number;
  premium: boolean;
}

export const REPORT_AGENTS: ReportAgent[] = [
  // ======================================================
  // STAGE 1
  // DATA COLLECTION
  // ======================================================

  {
    id: "website-crawler",
    name: "Website Crawler",
    endpoint: "/api/agents/website-crawler",
    stage: "collector",
    order: 1,
    premium: false,
  },

  {
    id: "website-auditor",
    name: "Website Auditor",
    endpoint: "/api/agents/website-auditor",
    stage: "collector",
    order: 2,
    premium: false,
  },

  {
    id: "seo-auditor",
    name: "SEO Auditor",
    endpoint: "/api/agents/seo-auditor",
    stage: "collector",
    order: 3,
    premium: false,
  },

  {
    id: "google-business",
    name: "Google Business",
    endpoint: "/api/agents/google-business-auditor",
    stage: "collector",
    order: 4,
    premium: false,
  },

  {
    id: "social-media",
    name: "Social Media",
    endpoint: "/api/agents/social-media-auditor",
    stage: "collector",
    order: 5,
    premium: false,
  },

  {
    id: "branding",
    name: "Branding",
    endpoint: "/api/agents/branding-auditor",
    stage: "collector",
    order: 6,
    premium: false,
  },

  {
    id: "conversion",
    name: "Conversion Funnel",
    endpoint: "/api/agents/conversion-auditor",
    stage: "collector",
    order: 7,
    premium: false,
  },

  {
    id: "lead-generation",
    name: "Lead Generation",
    endpoint: "/api/agents/lead-generation-auditor",
    stage: "collector",
    order: 8,
    premium: false,
  },

  // ======================================================
  // STAGE 2
  // FREE SNAPSHOT
  // ======================================================

  {
    id: "snapshot-builder",
    name: "Snapshot Builder",
    endpoint: "/api/agents/snapshot-builder",
    stage: "snapshot",
    order: 100,
    premium: false,
  },

  // ======================================================
  // PREMIUM
  // ======================================================

  {
    id: "competitor-analysis",
    name: "Competitor Analysis",
    endpoint: "/api/agents/competitor-analysis",
    stage: "premium",
    order: 200,
    premium: true,
  },

  {
    id: "keyword-research",
    name: "Keyword Research",
    endpoint: "/api/agents/keyword-research",
    stage: "premium",
    order: 201,
    premium: true,
  },

  {
    id: "growth-strategy",
    name: "Growth Strategy",
    endpoint: "/api/agents/growth-strategist",
    stage: "premium",
    order: 202,
    premium: true,
  },

  {
    id: "proposal",
    name: "Proposal Generator",
    endpoint: "/api/agents/proposal-generator",
    stage: "premium",
    order: 203,
    premium: true,
  },

  {
    id: "report-builder",
    name: "Final Report Builder",
    endpoint: "/api/agents/report-builder",
    stage: "premium",
    order: 204,
    premium: true,
  },
];

export const COLLECTION_AGENTS = REPORT_AGENTS.filter(
  (a) => a.stage === "collector"
);

export const SNAPSHOT_AGENTS = REPORT_AGENTS.filter(
  (a) => a.stage === "snapshot"
);

export const PREMIUM_AGENTS = REPORT_AGENTS.filter(
  (a) => a.stage === "premium"
);