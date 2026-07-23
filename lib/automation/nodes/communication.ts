// ======================================================
// Communication Nodes
// lib/automation/nodes/communication.ts
// ======================================================
// Send Email lives in nodeTypes.ts (existing, just recategorized).
// Send WhatsApp / Send SMS are stubs: no Twilio/WhatsApp SDK is
// installed in this project yet (see package.json). Request
// Approval / Wait For Reply use the pause/resume mechanism in
// executeWorkflow.ts + WorkflowService.resume().

import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { supabaseAdmin } from "@/lib/supabase/server";

export const communicationNodes: Record<string, NodeTypeDefinition> = {
  "communication.sendWhatsApp": {
    type: "communication.sendWhatsApp",
    category: "communication",
    label: "Send WhatsApp",
    description:
      "STUB — no WhatsApp Business API integration is wired up yet. Outputs everything from its input unchanged, plus _stub: true and _stubNote (string). Reference any upstream field downstream exactly as before, e.g. {{email}}.",
    configFields: [
      { key: "to", label: "To (phone)", type: "text", placeholder: "{{phone}}" },
      { key: "message", label: "Message", type: "textarea" },
    ],
    async execute(input, config) {
      return {
        output: {
          ...input,
          _stub: true,
          _stubNote: `Would send WhatsApp to ${resolveTemplate(config.to ?? "", input) || "?"} (not yet wired).`,
        },
      };
    },
  },

  "communication.sendSMS": {
    type: "communication.sendSMS",
    category: "communication",
    label: "Send SMS",
    description:
      "STUB — no SMS/Twilio integration is wired up yet. Outputs everything from its input unchanged, plus _stub: true and _stubNote (string). Reference any upstream field downstream exactly as before, e.g. {{email}}.",
    configFields: [
      { key: "to", label: "To (phone)", type: "text", placeholder: "{{phone}}" },
      { key: "message", label: "Message", type: "textarea" },
    ],
    async execute(input, config) {
      return {
        output: {
          ...input,
          _stub: true,
          _stubNote: `Would send SMS to ${resolveTemplate(config.to ?? "", input) || "?"} (not yet wired).`,
        },
      };
    },
  },

  "communication.internalNotification": {
    type: "communication.internalNotification",
    category: "communication",
    label: "Internal Notification",
    description:
      "Writes a real row to the notifications table (no notification-center UI yet). Outputs the full inserted notification row (id, recipient, title, body, created_at). Reference {{id}} downstream if you need to track it.",
    configFields: [
      { key: "recipient", label: "Recipient", type: "text", placeholder: "team@ignitiaai.app" },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    async execute(input, config) {
      const title = resolveTemplate(config.title ?? "", input);
      if (!title) throw new Error("Internal Notification: title is required.");

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert({
          recipient: resolveTemplate(config.recipient ?? "", input) || null,
          title,
          body: resolveTemplate(config.body ?? "", input) || null,
          source: "workflow",
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(`Internal Notification: ${error?.message ?? "insert failed"}`);
      return { output: data };
    },
  },

  "communication.createTask": {
    type: "communication.createTask",
    category: "communication",
    label: "Create Task",
    description:
      "Creates a row in workflow_tasks. Outputs the full inserted task row (id, title, description, assignee, due_at, status, created_at). Reference {{id}} downstream if you need to track it.",
    configFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "assignee", label: "Assignee", type: "text" },
      { key: "dueAt", label: "Due at (ISO date, optional)", type: "text" },
    ],
    async execute(input, config) {
      const title = resolveTemplate(config.title ?? "", input);
      if (!title) throw new Error("Create Task: title is required.");

      const { data, error } = await supabaseAdmin
        .from("workflow_tasks")
        .insert({
          title,
          description: resolveTemplate(config.description ?? "", input) || null,
          assignee: resolveTemplate(config.assignee ?? "", input) || null,
          due_at: config.dueAt || null,
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(`Create Task: ${error?.message ?? "insert failed"}`);
      return { output: data };
    },
  },

  "communication.requestApproval": {
    type: "communication.requestApproval",
    category: "communication",
    label: "Request Approval",
    description:
      "Pauses the run and waits for an approve/reject decision via the run's resume API. Also writes a notification row so an approver has something to act on. Once resumed, outputs { approved: boolean } and routes to the \"approved\" or \"rejected\" handle — reference {{approved}} downstream, or connect nodes to those two outputs to branch.",
    outputHandles: ["approved", "rejected"],
    configFields: [
      { key: "approver", label: "Approver", type: "text", placeholder: "team@ignitiaai.app" },
      { key: "message", label: "Message", type: "textarea", placeholder: "{{field}} supported" },
    ],
    async execute(input, config) {
      const message = resolveTemplate(config.message ?? "", input) || "Approval requested.";

      await supabaseAdmin.from("notifications").insert({
        recipient: resolveTemplate(config.approver ?? "", input) || null,
        title: "Workflow approval requested",
        body: message,
        source: "workflow",
      });

      return {
        output: input,
        pause: true,
        pendingRequest: { message, kind: "reject-approve" },
      };
    },
  },

  "communication.waitForReply": {
    type: "communication.waitForReply",
    category: "communication",
    label: "Wait For Reply",
    description:
      "Pauses the run until a reply is supplied via the run's resume API. Real pause/resume mechanism — but nothing auto-forwards an actual WhatsApp/SMS reply into it yet, since neither is wired up. Once resumed, outputs { reply: string } — reference it downstream with {{reply}}.",
    configFields: [{ key: "prompt", label: "What are you waiting for?", type: "textarea" }],
    async execute(input, config) {
      const message = resolveTemplate(config.prompt ?? "", input) || "Waiting for a reply.";
      return {
        output: input,
        pause: true,
        pendingRequest: { message, kind: "text" },
      };
    },
  },
};
