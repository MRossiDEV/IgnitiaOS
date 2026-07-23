// ======================================================
// Competitors Collector — Types
// lib/ai/collectors/competitors/types.ts
// ======================================================

import { WebsiteData } from "@/lib/ai/collectors/website/types";

export interface CompetitorData {
  url: string;
  found: boolean;
  website?: WebsiteData;
  error?: string;
}
