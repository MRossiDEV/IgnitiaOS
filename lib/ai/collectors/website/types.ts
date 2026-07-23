// ======================================================
// Website Collector — Types
// lib/ai/collectors/website/types.ts
// ======================================================

export interface WebsiteHeadings {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
}

export interface WebsiteForm {
  action: string;
  method: string;
}

export interface WebsiteData {
  url: string;
  html: string;
  text: string;
  title: string;
  description: string;
  language: string;
  headings: WebsiteHeadings;
  links: string[];
  images: string[];
  forms: WebsiteForm[];
  technologies: string[];
  scripts: string[];
  stylesheets: string[];
  schema: string[];
  metadata: Record<string, string>;
}
