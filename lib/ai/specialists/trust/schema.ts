import { baseAuditSchemaProperties, baseAuditRequired } from "@/lib/ai/schemas/audit";
export const trustSchema = {
  type: "object",
  properties: { ...baseAuditSchemaProperties },
  required: [...baseAuditRequired],
} as const;
