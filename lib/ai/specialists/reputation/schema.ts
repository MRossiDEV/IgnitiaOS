import { baseAuditSchemaProperties, baseAuditRequired } from "@/lib/ai/schemas/audit";
export const reputationSchema = {
  type: "object",
  properties: { ...baseAuditSchemaProperties },
  required: [...baseAuditRequired],
} as const;
