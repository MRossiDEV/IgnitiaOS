import {
  baseAuditSchemaProperties,
  baseAuditRequired,
} from "@/lib/ai/schemas/audit";

export const contentSchema = {
  type: "object",
  properties: {
    ...baseAuditSchemaProperties,
  },
  required: [...baseAuditRequired],
} as const;
