import {
  baseAuditSchemaProperties,
  baseAuditRequired,
} from "@/lib/ai/schemas/audit";

export const seoSchema = {
  type: "object",
  properties: {
    ...baseAuditSchemaProperties,
  },
  required: [...baseAuditRequired],
} as const;
