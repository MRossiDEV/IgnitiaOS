// ======================================================
// Input Nodes
// lib/automation/nodes/input.ts
// ======================================================
// Trigger-style nodes: no incoming edges, so executeWorkflow
// feeds them whatever payload the run was started with (see
// the `rootInput` param) instead of the usual upstream output.

import { NodeTypeDefinition } from "../types";

export const inputNodes: Record<string, NodeTypeDefinition> = {
  "input.webhook": {
    type: "input.webhook",
    category: "input",
    label: "Webhook",
    description:
      "Starts the workflow when POST /api/v1/automation/webhooks/{workflowId} is called. Outputs the request body as-is — whatever JSON keys the caller sends are available downstream, e.g. {{email}} if the payload has an \"email\" field.",
    configFields: [],
    async execute(input) {
      return { output: input ?? {} };
    },
  },

  "input.schedule": {
    type: "input.schedule",
    category: "input",
    label: "Schedule",
    description:
      "Documents a cron schedule for this workflow. Automatic dispatch needs a cron runner and isn't wired yet — this node validates/stores the config for that follow-up. Outputs whatever the run was started with (usually {} today, since nothing dispatches it automatically yet) — nothing meaningful to reference downstream until that's wired up.",
    configFields: [
      { key: "cron", label: "Cron expression", type: "text", placeholder: "0 9 * * *" },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "America/New_York" },
    ],
    async execute(input) {
      return { output: input ?? {} };
    },
  },

  "input.formSubmission": {
    type: "input.formSubmission",
    category: "input",
    label: "Form Submission",
    description:
      "Starts the workflow from a form POST. Same payload contract as Webhook — outputs the request body as-is, so form fields are available downstream as {{fieldName}}.",
    configFields: [],
    async execute(input) {
      return { output: input ?? {} };
    },
  },

  "input.crmEvent": {
    type: "input.crmEvent",
    category: "input",
    label: "CRM Event",
    description:
      "Starts the workflow when a matching CRM event fires (currently: lead.created, triggered from POST /api/v1/leads after a successful insert). Connect this workflow to the event via a row in crm_event_workflows (event_type, workflow_id). Outputs the event payload as-is, so reference the lead's fields downstream as {{email}}, {{name}}, {{company}}, etc. The \"Event\" config field is documentation only — the actual filter is which event_type row(s) point at this workflow.",
    configFields: [
      {
        key: "event",
        label: "Event",
        type: "select",
        options: [
          { value: "lead.created", label: "Lead created" },
          { value: "lead.updated", label: "Lead updated" },
          { value: "lead.status_changed", label: "Lead status changed" },
        ],
      },
    ],
    async execute(input) {
      return { output: input ?? {} };
    },
  },
};
