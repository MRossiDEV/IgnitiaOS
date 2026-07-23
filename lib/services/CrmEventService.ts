// ======================================================
// CRM Event Service
// lib/services/CrmEventService.ts
// ======================================================
// Fires every workflow connected to a CRM event (crm_event_workflows)
// — e.g. "lead.created" — feeding the event payload into that
// workflow's "input.crmEvent" trigger node(s), same lookup pattern
// as the generic inbound webhook route. Call sites (like the leads
// API route) should treat this as fire-and-forget: a failing
// automation must never break the real app action that triggered it.

import { supabaseAdmin } from "@/lib/supabase/server";
import { WorkflowService } from "./WorkflowService";

export class CrmEventService {
  static async trigger(eventType: string, payload: Record<string, any>): Promise<void> {
    try {
      const { data: connections, error } = await supabaseAdmin
        .from("crm_event_workflows")
        .select("workflow_id")
        .eq("event_type", eventType);

      if (error) {
        console.error(`CrmEventService: failed to load connections for ${eventType}:`, error.message);
        return;
      }
      if (!connections || connections.length === 0) return;

      await Promise.all(
        connections.map(async ({ workflow_id }) => {
          try {
            const workflow = await WorkflowService.get(workflow_id);
            if (!workflow) return;

            const rootInput: Record<string, any> = {};
            for (const node of workflow.nodes) {
              if (node.type === "input.crmEvent") rootInput[node.id] = payload;
            }

            await WorkflowService.run(workflow_id, eventType, rootInput);
          } catch (err) {
            console.error(`CrmEventService: workflow ${workflow_id} failed for ${eventType}:`, err);
          }
        })
      );
    } catch (err) {
      console.error(`CrmEventService: trigger(${eventType}) failed:`, err);
    }
  }
}
