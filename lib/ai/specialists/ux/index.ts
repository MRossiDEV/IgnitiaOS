import { UXSpecialist } from "./agent";

export { UXSpecialist } from "./agent";
export type { UXAudit } from "./types";

// Single shared instance — registered once in bootstrap.ts
export const uxSpecialist = new UXSpecialist();
