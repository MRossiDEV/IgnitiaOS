// ======================================================
// Client Report — persistence
// lib/ai/client-report/persist.ts
// ======================================================
// Saves the generated narrative onto the report row so it can be reused
// (preview + download share it), and folds the writer's tokens into the
// report's cost summary. Server-only (touches supabaseAdmin).

import { supabaseAdmin } from "@/lib/supabase/server";
import { summarizeUsage, UsageRecord } from "@/lib/ai/core/tokenTracker";
import { AgentUsage } from "@/lib/ai/core/types";
import { ClientReportContent, ReportRowLike } from "./index";

export const WRITER_AGENT = "Client Report Writer";

export async function persistClientReport(
  row: ReportRowLike,
  content: ClientReportContent,
  usage?: AgentUsage,
  model?: string
): Promise<void> {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, any>)
      : {};

  // Replace any prior writer entry so repeated generations don't stack up.
  const prior: UsageRecord[] = Array.isArray(metadata.usage?.byAgent)
    ? metadata.usage.byAgent
    : [];
  const records: UsageRecord[] = prior.filter((r) => r.agent !== WRITER_AGENT);

  if (usage) {
    records.push({
      agent: WRITER_AGENT,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    });
  }

  await supabaseAdmin
    .from("reports")
    .update({
      metadata: {
        ...metadata,
        clientReport: content,
        usage: summarizeUsage(records),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}
