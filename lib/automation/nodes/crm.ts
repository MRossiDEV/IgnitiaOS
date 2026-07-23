// ======================================================
// CRM Nodes
// lib/automation/nodes/crm.ts
// ======================================================
// Real — read/write the existing `leads` table plus the new
// `contacts`/`deals` tables (see 0004_workflow_crm_extensions.sql).

import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { supabaseAdmin } from "@/lib/supabase/server";
import { evaluateLead } from "@/lib/leads/evaluateLead";

const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

export const crmNodes: Record<string, NodeTypeDefinition> = {
  "crm.createLead": {
    type: "crm.createLead",
    category: "crm",
    label: "Create Lead",
    description:
      "Creates a new row in the leads table. Outputs the full inserted lead row (id, name, email, company, website, industry, status, source, priority, estimated_value, created_at, ...). Reference {{id}} downstream to update/score this lead later, or {{email}} to send it something.",
    configFields: [
      { key: "name", label: "Name", type: "text", placeholder: "{{name}}" },
      { key: "email", label: "Email", type: "text", placeholder: "{{email}}" },
      { key: "company", label: "Company", type: "text" },
      { key: "website", label: "Website", type: "text" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      {
        key: "source",
        label: "Source",
        type: "select",
        options: [
          { value: "audit", label: "Audit" },
          { value: "manual", label: "Manual" },
          { value: "referral", label: "Referral" },
          { value: "campaign", label: "Campaign" },
        ],
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "hot", label: "Hot" },
          { value: "warm", label: "Warm" },
          { value: "cold", label: "Cold" },
        ],
      },
      { key: "estimatedValue", label: "Estimated value", type: "number" },
    ],
    async execute(input, config) {
      const email = resolveTemplate(config.email ?? "", input);
      if (!email) throw new Error("Create Lead: email is required.");

      const { data, error } = await supabaseAdmin
        .from("leads")
        .insert({
          name: resolveTemplate(config.name ?? "", input) || null,
          email,
          company: resolveTemplate(config.company ?? "", input) || null,
          website: resolveTemplate(config.website ?? "", input) || null,
          industry: resolveTemplate(config.industry ?? "", input) || null,
          message: resolveTemplate(config.message ?? "", input) || null,
          status: "new",
          source: config.source ?? "manual",
          priority: config.priority ?? "warm",
          estimated_value: config.estimatedValue ?? null,
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(`Create Lead: ${error?.message ?? "insert failed"}`);
      return { output: data };
    },
  },

  "crm.updateLead": {
    type: "crm.updateLead",
    category: "crm",
    label: "Update Lead",
    description:
      "Updates an existing lead by id. Outputs the full updated lead row. Reference {{status}}, {{priority}}, {{email}}, etc. downstream the same as any other lead row.",
    configFields: [
      { key: "leadId", label: "Lead ID", type: "text", placeholder: "{{id}}" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: LEAD_STATUSES.map((s) => ({ value: s, label: s })),
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "hot", label: "Hot" },
          { value: "warm", label: "Warm" },
          { value: "cold", label: "Cold" },
        ],
      },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "estimatedValue", label: "Estimated value", type: "number" },
    ],
    async execute(input, config) {
      const leadId = resolveTemplate(config.leadId ?? "", input);
      if (!leadId) throw new Error("Update Lead: leadId is required.");

      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (config.status) {
        updates.status = config.status;
        if (config.status === "converted") updates.converted_at = new Date().toISOString();
      }
      if (config.priority) updates.priority = config.priority;
      if (config.notes) updates.notes = resolveTemplate(config.notes, input);
      if (config.estimatedValue !== undefined && config.estimatedValue !== "") {
        updates.estimated_value = config.estimatedValue;
      }

      const { data, error } = await supabaseAdmin
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select("*")
        .single();

      if (error || !data) throw new Error(`Update Lead: ${error?.message ?? "lead not found"}`);
      return { output: data };
    },
  },

  "crm.findLead": {
    type: "crm.findLead",
    category: "crm",
    label: "Find Lead",
    description:
      "Looks up a lead by id or email. Outputs the matching lead row, or { found: false } if none matched. Reference {{id}}, {{email}}, {{status}}, etc. downstream — check {{found}} first if the lookup might miss.",
    configFields: [
      {
        key: "by",
        label: "Find by",
        type: "select",
        options: [
          { value: "id", label: "ID" },
          { value: "email", label: "Email" },
        ],
      },
      { key: "value", label: "Value", type: "text", placeholder: "{{email}}" },
    ],
    async execute(input, config) {
      const field = config.by === "id" ? "id" : "email";
      const value = resolveTemplate(config.value ?? "", input);
      if (!value) throw new Error("Find Lead: a value to search for is required.");

      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .eq(field, value)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw new Error(`Find Lead: ${error.message}`);
      return { output: data?.[0] ?? { found: false } };
    },
  },

  "crm.leadScore": {
    type: "crm.leadScore",
    category: "crm",
    label: "Lead Score",
    description:
      "Scores a lead (value, seriousness, action likelihood). Uses the lead object from upstream input, or fetches by leadId if provided. Outputs { estimatedValue, seriousnessScore, actionScore, overallRank, insights[], recommendation }. Reference {{overallRank}} or {{recommendation}} downstream — e.g. feed into an If node checking overallRank.",
    configFields: [{ key: "leadId", label: "Lead ID (optional)", type: "text", placeholder: "{{id}}" }],
    async execute(input, config) {
      let lead = input;
      const leadId = resolveTemplate(config.leadId ?? "", input);
      if (leadId) {
        const { data, error } = await supabaseAdmin.from("leads").select("*").eq("id", leadId).single();
        if (error || !data) throw new Error(`Lead Score: ${error?.message ?? "lead not found"}`);
        lead = data;
      }
      if (!lead || typeof lead !== "object") throw new Error("Lead Score: no lead data available to score.");
      return { output: evaluateLead(lead) };
    },
  },

  "crm.leadAssignment": {
    type: "crm.leadAssignment",
    category: "crm",
    label: "Lead Assignment",
    description:
      "Assigns a lead to an owner (sets leads.assigned_to). Outputs the full updated lead row. Reference {{assigned_to}} downstream, e.g. to notify the new owner.",
    configFields: [
      { key: "leadId", label: "Lead ID", type: "text", placeholder: "{{id}}" },
      { key: "assignTo", label: "Assign to", type: "text", placeholder: "owner@ignitiaai.app" },
    ],
    async execute(input, config) {
      const leadId = resolveTemplate(config.leadId ?? "", input);
      const assignTo = resolveTemplate(config.assignTo ?? "", input);
      if (!leadId || !assignTo) throw new Error("Lead Assignment: leadId and assignTo are both required.");

      const { data, error } = await supabaseAdmin
        .from("leads")
        .update({ assigned_to: assignTo, updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .select("*")
        .single();

      if (error || !data) throw new Error(`Lead Assignment: ${error?.message ?? "lead not found"}`);
      return { output: data };
    },
  },

  "crm.pipelineStage": {
    type: "crm.pipelineStage",
    category: "crm",
    label: "Pipeline Stage",
    description:
      "Moves a lead to a pipeline stage (backed by the leads.status field). Outputs the full updated lead row. Reference {{status}} downstream to confirm the new stage.",
    configFields: [
      { key: "leadId", label: "Lead ID", type: "text", placeholder: "{{id}}" },
      {
        key: "stage",
        label: "Stage",
        type: "select",
        options: LEAD_STATUSES.map((s) => ({ value: s, label: s })),
      },
    ],
    async execute(input, config) {
      const leadId = resolveTemplate(config.leadId ?? "", input);
      if (!leadId || !config.stage) throw new Error("Pipeline Stage: leadId and stage are both required.");

      const updates: Record<string, any> = { status: config.stage, updated_at: new Date().toISOString() };
      if (config.stage === "converted") updates.converted_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select("*")
        .single();

      if (error || !data) throw new Error(`Pipeline Stage: ${error?.message ?? "lead not found"}`);
      return { output: data };
    },
  },

  "crm.createContact": {
    type: "crm.createContact",
    category: "crm",
    label: "Create Contact",
    description:
      "Creates a Contact, optionally linked to a Lead. Outputs the full inserted contact row (id, lead_id, name, email, phone, role, created_at). Reference {{id}} downstream to attach a Deal to this contact.",
    configFields: [
      { key: "leadId", label: "Lead ID (optional)", type: "text", placeholder: "{{id}}" },
      { key: "name", label: "Name", type: "text", placeholder: "{{name}}" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "role", label: "Role", type: "text" },
    ],
    async execute(input, config) {
      const name = resolveTemplate(config.name ?? "", input);
      if (!name) throw new Error("Create Contact: name is required.");

      const { data, error } = await supabaseAdmin
        .from("contacts")
        .insert({
          lead_id: resolveTemplate(config.leadId ?? "", input) || null,
          name,
          email: resolveTemplate(config.email ?? "", input) || null,
          phone: resolveTemplate(config.phone ?? "", input) || null,
          role: resolveTemplate(config.role ?? "", input) || null,
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(`Create Contact: ${error?.message ?? "insert failed"}`);
      return { output: data };
    },
  },

  "crm.createDeal": {
    type: "crm.createDeal",
    category: "crm",
    label: "Create Deal",
    description:
      "Creates a Deal, optionally linked to a Lead and/or Contact. Outputs the full inserted deal row (id, lead_id, contact_id, name, value, stage, status, created_at). Reference {{id}} or {{stage}} downstream.",
    configFields: [
      { key: "leadId", label: "Lead ID (optional)", type: "text", placeholder: "{{id}}" },
      { key: "contactId", label: "Contact ID (optional)", type: "text" },
      { key: "name", label: "Deal name", type: "text" },
      { key: "value", label: "Value", type: "number" },
      {
        key: "stage",
        label: "Stage",
        type: "select",
        options: [
          { value: "opportunity", label: "Opportunity" },
          { value: "proposal", label: "Proposal" },
          { value: "negotiation", label: "Negotiation" },
          { value: "won", label: "Won" },
          { value: "lost", label: "Lost" },
        ],
      },
    ],
    async execute(input, config) {
      const name = resolveTemplate(config.name ?? "", input);
      if (!name) throw new Error("Create Deal: name is required.");

      const { data, error } = await supabaseAdmin
        .from("deals")
        .insert({
          lead_id: resolveTemplate(config.leadId ?? "", input) || null,
          contact_id: resolveTemplate(config.contactId ?? "", input) || null,
          name,
          value: config.value ?? 0,
          stage: config.stage ?? "opportunity",
          status: config.stage === "won" || config.stage === "lost" ? "closed" : "open",
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(`Create Deal: ${error?.message ?? "insert failed"}`);
      return { output: data };
    },
  },
};
