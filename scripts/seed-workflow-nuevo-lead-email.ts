// ======================================================
// Seed workflow: Nuevo lead -> Email de bienvenida
// scripts/seed-workflow-nuevo-lead-email.ts
// ======================================================
// Fires whenever a new lead is inserted via POST /api/v1/leads
// (CrmEventService.trigger("lead.created", ...)) and sends a
// welcome/confirmation email to the lead's own address.
//
// This is a starting point to tweak, not a final copy — subject
// and body below are placeholders.
//
// Usage: npx tsx scripts/seed-workflow-nuevo-lead-email.ts

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { WorkflowService } from "@/lib/services/WorkflowService";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { WorkflowNode, WorkflowEdge } from "@/lib/automation/types";

const EVENT_TYPE = "lead.created";

const nodes: WorkflowNode[] = [
  {
    id: "crm-event-1",
    type: "input.crmEvent",
    position: { x: 40, y: 160 },
    data: { label: "CRM Event", config: { event: EVENT_TYPE } },
  },
  {
    id: "send-email-1",
    type: "action.sendEmail",
    position: { x: 420, y: 160 },
    data: {
      label: "Send Email",
      config: {
        to: "{{email}}",
        subject: "Gracias por tu consulta, {{name}}",
        bodyHtml:
          "<p>Hola {{name}},</p><p>Gracias por contactarnos desde {{company}}. Recibimos tu consulta y en breve nos pondremos en contacto.</p>",
        account: "mrossi",
      },
    },
  },
];

const edges: WorkflowEdge[] = [{ id: "e-crmevent-sendemail", source: "crm-event-1", target: "send-email-1" }];

async function main() {
  const workflow = await WorkflowService.create({
    name: "Nuevo lead -> Email de bienvenida",
    description:
      "Se dispara cuando se crea un nuevo lead (POST /api/v1/leads) y envia un email de confirmacion al email del lead. Base para tweaking: ajustar asunto/cuerpo y remitente segun necesidad.",
  });

  await WorkflowService.save(workflow.id, { nodes, edges });

  const { error: connectError } = await supabaseAdmin
    .from("crm_event_workflows")
    .insert({ event_type: EVENT_TYPE, workflow_id: workflow.id });

  if (connectError) {
    console.error("Failed to connect workflow to lead.created event:", connectError.message);
  }

  console.log(`Created workflow: ${workflow.id}`);
  console.log(`Open it at /admin/automation/${workflow.id}`);
  console.log(`Connected to event: ${EVENT_TYPE}`);
  console.log("");
  console.log("Notes:");
  console.log("  - Requires migration 0013_crm_event_workflows.sql applied (creates the crm_event_workflows table)");
  console.log("  - Subject/body are placeholders — edit them (or the 'account' sender) in the canvas before relying on this in production");
  console.log("  - Multiple workflows can be connected to the same event_type; this script only adds this one");
  console.log("  - To disconnect later: delete the row in crm_event_workflows where workflow_id = '" + workflow.id + "'");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
