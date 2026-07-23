import { baseAuditSchemaProperties, baseAuditRequired } from "@/lib/ai/schemas/audit";
export const accessibilitySchema = {
  type: "object",
  properties: { ...baseAuditSchemaProperties },
  required: [...baseAuditRequired],
} as const;
