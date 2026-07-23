import { baseAuditSchemaProperties, baseAuditRequired } from "@/lib/ai/schemas/audit";
export const socialSchema = {
  type: "object",
  properties: { ...baseAuditSchemaProperties },
  required: [...baseAuditRequired],
} as const;
