import {
  baseAuditSchemaProperties,
  baseAuditRequired,
} from "@/lib/ai/schemas/audit";

export const uxSchema = {
  type: "object",
  properties: {
    ...baseAuditSchemaProperties,
  },
  required: [...baseAuditRequired],
} as const;
