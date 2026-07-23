// ======================================================
// Human Node
// lib/automation/nodes/human.ts
// ======================================================
// One node, many modes — covers the workflows where a human,
// not the AI, is the final decision-maker. Every mode except
// "Assign task" pauses the run via the pause/resume mechanism;
// "Assign task" is fire-and-forget (writes to workflow_tasks).

import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { supabaseAdmin } from "@/lib/supabase/server";

const MODES = [
  { value: "approval", label: "Approval" },
  { value: "review", label: "Review" },
  { value: "ask_question", label: "Ask Question" },
  { value: "assign_task", label: "Assign Task" },
  { value: "collect_information", label: "Collect Information" },
  { value: "manual_edit", label: "Manual Edit" },
  { value: "reject_approve", label: "Reject / Approve" },
  { value: "escalate", label: "Escalate" },
];

export const humanNodes: Record<string, NodeTypeDefinition> = {
  human: {
    type: "human",
    category: "human",
    label: "Human",
    description:
      "Routes a step to a human — approval, review, a question, an assignment, or an escalation. \"Assign Task\" mode outputs the inserted workflow_tasks row (reference {{id}}) without pausing. Every other mode pauses until resumed: Approval/Reject-Approve modes output { approved: boolean } and route to the \"approved\"/\"rejected\" handle; all other modes output { reply: string } — reference {{reply}} downstream.",
    outputHandles: ["approved", "rejected"],
    configFields: [
      { key: "mode", label: "Mode", type: "select", options: MODES },
      { key: "message", label: "Message", type: "textarea", placeholder: "{{field}} supported" },
      { key: "assignee", label: "Assignee (assign task / escalate)", type: "text" },
    ],
    async execute(input, config) {
      const message = resolveTemplate(config.message ?? "", input) || "Human input requested.";
      const mode = config.mode ?? "approval";

      if (mode === "assign_task") {
        const { data, error } = await supabaseAdmin
          .from("workflow_tasks")
          .insert({
            title: message,
            assignee: resolveTemplate(config.assignee ?? "", input) || null,
          })
          .select("*")
          .single();

        if (error || !data) throw new Error(`Human (assign task): ${error?.message ?? "insert failed"}`);
        return { output: data };
      }

      const kind = mode === "approval" || mode === "reject_approve" ? "reject-approve" : "text";

      return {
        output: input,
        pause: true,
        pendingRequest: { message: `[${mode}] ${message}`, kind },
      };
    },
  },
};
