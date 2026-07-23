import { PipelineResults } from "../core/schemas";

export interface WebsiteMemory {
  url?: string;

  pages: {
    url: string;
    title?: string;
    description?: string;
    content: string;
  }[];

  metadata: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  extracted: {
    businessName?: string;
    services: string[];
    products: string[];
    callsToAction: string[];
    contacts: string[];
    socialLinks: string[];
  };

  summary: string;
}

export interface ReportMemory {
  reportId: string;
  business: {
    name: string;
    industry?: string;
    businessType?: string;
    country?: string;
    city?: string;
    website?: string;
  };
  website?: WebsiteMemory;
  results: PipelineResults;
  createdAt: Date;
}

export function createReportMemory(
  reportId: string,
  data: any
): ReportMemory {

  return {
    reportId,
    business: {
      name:
        data.businessName || "",
      industry:
        data.industry || "",
      businessType:
        data.businessType || "",
      country:
        data.country || "",
      city:
        data.city || "",
      website:
        data.website || "",
    },
    results: {},
    createdAt:
      new Date(),
  };
}

export function clearReportMemory(
  memory: ReportMemory
) {
  memory.website = undefined;
  memory.results = {};
}