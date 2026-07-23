import { ContentSpecialist } from "./agent";

export { ContentSpecialist } from "./agent";
export type { ContentAudit } from "./types";

// Single shared instance — registered once in bootstrap.ts
export const contentSpecialist = new ContentSpecialist();
