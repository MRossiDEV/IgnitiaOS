import { baseAuditSchemaProperties, baseAuditRequired } from "@/lib/ai/schemas/audit";
export const brandingSchema = {
  type: "object",
  properties: { ...baseAuditSchemaProperties },
  required: [...baseAuditRequired],
} as const;
