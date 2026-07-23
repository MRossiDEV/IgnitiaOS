import { SEOSpecialist } from "./agent";

export { SEOSpecialist } from "./agent";
export type { SEOAudit } from "./types";

// Single shared instance — registered once in bootstrap.ts
export const seoSpecialist = new SEOSpecialist();
