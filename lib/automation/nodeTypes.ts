// ======================================================
// Node Type Registry
// lib/automation/nodeTypes.ts
// ======================================================
// Each node type wraps something you already built — the
// crawler tool, a specialist's prompt/schema, the email tool,
// etc. — behind a generic (input, config) => output contract
// so the graph executor doesn't need to know what's inside.
//
// This file holds the original Phase 1 nodes (recategorized
// into the 8-category taxonomy below). Everything added since
// lives in ./nodes/{input,ai,crm,communication,logic,data,system,human}.ts
// and is spread into nodeRegistry at the bottom of this file.

import { NodeTypeDefinition } from "./types";
import { resolveTemplate } from "./resolveTemplate";
import { getPath, compare } from "./pathCompare";
import { crawlWebsite } from "@/lib/ai/tools/crawl";
import { sendEmail } from "@/lib/ai/tools/email";
import { aiProvider } from "@/lib/ai/provider";
import { seoPrompt } from "@/lib/ai/specialists/seo/prompt";
import { seoSchema } from "@/lib/ai/specialists/seo/schema";
import { uxPrompt } from "@/lib/ai/specialists/ux/prompt";
import { uxSchema } from "@/lib/ai/specialists/ux/schema";
import { withUsage, MODEL_OPTIONS } from "./nodes/aiUsage";
import { inputNodes } from "./nodes/input";
import { aiNodes } from "./nodes/ai";
import { crmNodes } from "./nodes/crm";
import { communicationNodes } from "./nodes/communication";
import { logicNodes } from "./nodes/logic";
import { dataNodes } from "./nodes/data";
import { systemNodes } from "./nodes/system";
import { humanNodes } from "./nodes/human";
import { dataSourceNodes } from "./nodes/dataSources";

const originalNodes: Record<string, NodeTypeDefinition> = {
  // ----------------------------------------------------
  // INPUT
  // ----------------------------------------------------
  "trigger.manual": {
    type: "trigger.manual",
    category: "input",
    label: "Manual Trigger",
    description:
      "Starts the workflow when you click Run. Outputs whatever the run was started with — empty ({}) for a plain manual Run. There's nothing to reference from this node itself; it's just the starting point.",
    configFields: [],
    async execute(input) {
      return { output: input ?? {} };
    },
  },

  "collector.website": {
    type: "collector.website",
    category: "input",
    label: "Website Collector",
    description:
      "Crawls a website. Outputs { url, title, description, language, headings: {h1..h6}, links, images, forms, scripts, stylesheets, schema, metadata, text, html }. Reference any field in the next node with {{title}}, {{description}}, {{headings.h1}}, etc.",
    configFields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://example.com or {{website}}" },
    ],
    async execute(input, config) {
      const url = resolveTemplate(config.url ?? "", input);
      if (!url) throw new Error("Website Collector: no URL provided.");
      const data = await crawlWebsite(url);
      return { output: data };
    },
  },

  // ----------------------------------------------------
  // AI (bonus, pre-existing specialists)
  // ----------------------------------------------------
  "specialist.seo": {
    type: "specialist.seo",
    category: "ai",
    label: "SEO Specialist",
    description:
      "Analyzes SEO signals. Expects Website Collector-shaped data on the main input. Has a dedicated System Prompt connector (left side) to override the built-in audit prompt with an ai.systemPrompt node, if you want a custom take instead of the standard SEO audit. Outputs { score, summary, strengths[], weaknesses[], opportunities[], quickWins[], findings[], _usage }. Reference downstream with {{score}}, {{summary}}, etc.",
    inputHandles: ["input", "systemPrompt"],
    configFields: [
      { key: "model", label: "Model", type: "select", options: [{ value: "", label: "Default (Claude Sonnet 5)" }, ...MODEL_OPTIONS] },
    ],
    async execute(rawInput, config) {
      const input = rawInput?.input ?? {};
      const connectedPrompt = rawInput?.systemPrompt?.prompt;

      const result = await aiProvider.run({
        name: "SEO Specialist (workflow)",
        prompt: connectedPrompt || seoPrompt,
        schema: seoSchema,
        input: {
          url: input.url,
          title: input.title,
          description: input.description,
          headings: input.headings,
          links: input.links,
          schema: input.schema,
          metadata: input.metadata,
        },
        model: config.model || undefined,
        context: { reportId: "automation" },
      });

      if (!result.success) throw new Error(result.error ?? "SEO Specialist failed.");
      return { output: withUsage(result.data as object, result) };
    },
  },

  "specialist.ux": {
    type: "specialist.ux",
    category: "ai",
    label: "UX Specialist",
    description:
      "Analyzes UX signals. Expects Website Collector-shaped data on the main input. Has a dedicated System Prompt connector (left side) to override the built-in audit prompt with an ai.systemPrompt node, if you want a custom take instead of the standard UX audit. Outputs { score, summary, strengths[], weaknesses[], opportunities[], quickWins[], findings[], _usage }. Reference downstream with {{score}}, {{summary}}, etc.",
    inputHandles: ["input", "systemPrompt"],
    configFields: [
      { key: "model", label: "Model", type: "select", options: [{ value: "", label: "Default (Claude Sonnet 5)" }, ...MODEL_OPTIONS] },
    ],
    async execute(rawInput, config) {
      const input = rawInput?.input ?? {};
      const connectedPrompt = rawInput?.systemPrompt?.prompt;

      const result = await aiProvider.run({
        name: "UX Specialist (workflow)",
        prompt: connectedPrompt || uxPrompt,
        schema: uxSchema,
        input: {
          url: input.url,
          headings: input.headings,
          links: input.links,
          images: input.images,
          forms: input.forms,
          metadata: input.metadata,
        },
        model: config.model || undefined,
        context: { reportId: "automation" },
      });

      if (!result.success) throw new Error(result.error ?? "UX Specialist failed.");
      return { output: withUsage(result.data as object, result) };
    },
  },

  // ----------------------------------------------------
  // COMMUNICATION / SYSTEM / LOGIC (bonus, pre-existing actions)
  // ----------------------------------------------------
  "action.sendEmail": {
    type: "action.sendEmail",
    category: "communication",
    label: "Send Email",
    description:
      "Sends an email, resolving {{field}} in To/Subject/Body from upstream node output. Outputs { to, subject, messageId }. Reference downstream with {{messageId}} to confirm delivery.",
    configFields: [
      { key: "to", label: "To", type: "text", placeholder: "{{email}}" },
      { key: "subject", label: "Subject", type: "text" },
      { key: "bodyHtml", label: "Body (HTML)", type: "textarea" },
      {
        key: "account",
        label: "Send as",
        type: "select",
        options: [
          { value: "mrossi", label: "mrossi@ (client comms)" },
          { value: "reports", label: "reports@ (automated)" },
        ],
      },
    ],
    async execute(input, config) {
      const to = resolveTemplate(config.to ?? "", input);
      const subject = resolveTemplate(config.subject ?? "", input);
      const bodyHtml = resolveTemplate(config.bodyHtml ?? "", input);

      if (!to || !subject || !bodyHtml) {
        throw new Error("Send Email: to, subject, and bodyHtml are all required.");
      }

      const result = await sendEmail({
        to,
        subject,
        html: bodyHtml,
        account: config.account === "reports" ? "reports" : "mrossi",
      });

      if (!result.success) throw new Error(result.error ?? "Failed to send email.");
      return { output: { to, subject, messageId: result.messageId } };
    },
  },

  "action.delay": {
    type: "action.delay",
    category: "logic",
    label: "Wait",
    description:
      "Real multi-day delays need a durable job queue — a serverless function can't sleep that long. This currently just logs and passes through immediately. Outputs everything from its input unchanged, plus _delayNote (string). Reference any upstream field downstream exactly as before, e.g. {{email}}.",
    configFields: [
      { key: "amount", label: "Amount", type: "number" },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        options: [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
        ],
      },
    ],
    async execute(input, config) {
      // Intentionally NOT a real sleep — see description above.
      return {
        output: {
          ...input,
          _delayNote: `Would wait ${config.amount ?? "?"} ${config.unit ?? "minutes"} here (Phase 2, not yet real).`,
        },
      };
    },
  },

  "action.httpRequest": {
    type: "action.httpRequest",
    category: "system",
    label: "HTTP Request",
    description:
      "Calls any external URL — the generic escape hatch for anything not built as a node yet. Outputs the response body directly: a parsed JSON object if the response is JSON (reference its fields with {{fieldName}}), or a plain string otherwise.",
    configFields: [
      { key: "url", label: "URL", type: "text" },
      {
        key: "method",
        label: "Method",
        type: "select",
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ],
      },
      { key: "body", label: "Body (JSON, optional)", type: "textarea" },
    ],
    async execute(input, config) {
      const url = resolveTemplate(config.url ?? "", input);
      const method = config.method ?? "GET";
      const bodyStr = config.body ? resolveTemplate(config.body, input) : undefined;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" && bodyStr ? bodyStr : undefined,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const output = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(output)}`);
      }

      return { output };
    },
  },

  // ----------------------------------------------------
  // LOGIC
  // ----------------------------------------------------
  "logic.condition": {
    type: "logic.condition",
    category: "logic",
    label: "If",
    description:
      "Branches the workflow based on a field from upstream output. Doesn't change the data — outputs its input unchanged on whichever handle matches (true/false), so downstream nodes reference the same fields as before, e.g. {{email}}.",
    outputHandles: ["true", "false"],
    configFields: [
      { key: "field", label: "Field (dot path)", type: "text", placeholder: "score" },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        options: [
          { value: "eq", label: "=" },
          { value: "neq", label: "\u2260" },
          { value: "gt", label: ">" },
          { value: "lt", label: "<" },
          { value: "gte", label: "\u2265" },
          { value: "lte", label: "\u2264" },
          { value: "contains", label: "contains" },
        ],
      },
      { key: "value", label: "Value", type: "text" },
    ],
    async execute(input, config) {
      const fieldValue = getPath(input, config.field ?? "");
      const passed = compare(fieldValue, config.operator ?? "eq", config.value ?? "");
      return { output: input, branch: passed ? "true" : "false" };
    },
  },
};

export const nodeRegistry: Record<string, NodeTypeDefinition> = {
  ...originalNodes,
  ...inputNodes,
  ...aiNodes,
  ...crmNodes,
  ...communicationNodes,
  ...logicNodes,
  ...dataNodes,
  ...systemNodes,
  ...humanNodes,
  ...dataSourceNodes,
};

export function listNodeTypes(): NodeTypeDefinition[] {
  return Object.values(nodeRegistry);
}
