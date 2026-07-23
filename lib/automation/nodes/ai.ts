// ======================================================
// AI Nodes
// lib/automation/nodes/ai.ts
// ======================================================
// All real — every node here calls the same Anthropic
// wrapper used by the SEO/UX specialist nodes (lib/ai/provider.ts),
// each with its own JSON-schema tool-call shape. Every node also:
//   - exposes a Model selector (defaults to claude-sonnet-5 if left blank)
//   - stamps { _usage: { model, inputTokens, outputTokens, totalTokens,
//     costUsd, durationMs } } onto its output for the canvas to show live
//     token/cost stats per node (see nodes/aiUsage.ts)
//   - exposes whatever text is literally sent to Claude as an editable
//     config field, so you can see exactly what each node is asking for
//
// Dedicated connectors (ComfyUI-style, left = in / right = out): every
// node here declares inputHandles: ["input", "systemPrompt", ...] — wire
// a System Prompt node (ai.systemPrompt) into "systemPrompt" and/or an
// Output Schema node (ai.outputSchema) into "schema" instead of typing
// them into this node's config. Each node's config field for that same
// thing (systemPrompt/instructions/schema) is only a fallback used when
// nothing is connected — never silently overridden, never required.

import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { aiProvider } from "@/lib/ai/provider";
import { withUsage, MODEL_OPTIONS } from "./aiUsage";

const FREE_TEXT_SCHEMA = {
  type: "object",
  properties: { response: { type: "string" } },
  required: ["response"],
};

const MODEL_FIELD = {
  key: "model",
  label: "Model",
  type: "select" as const,
  options: [{ value: "", label: "Default (Claude Sonnet 5)" }, ...MODEL_OPTIONS],
};

// A node with inputHandles declared receives its execute() input keyed by
// handle name (see executeWorkflow.ts) instead of the plain upstream shape.
// These three helpers pull the pieces every AI node needs back out of that
// wrapper — safe to call even if a given connector isn't wired up.
function mainInputOf(rawInput: any): any {
  return rawInput?.input ?? {};
}
function connectedPromptOf(rawInput: any): string | undefined {
  return rawInput?.systemPrompt?.prompt;
}
function connectedSchemaOf(rawInput: any): any | undefined {
  return rawInput?.schema?.schema;
}

export const aiNodes: Record<string, NodeTypeDefinition> = {
  "ai.chat": {
    type: "ai.chat",
    category: "ai",
    label: "AI Chat",
    description:
      "Sends a message to Claude and returns a free-text response. Has a dedicated System Prompt connector (left side) — wire a System Prompt node in instead of using the config field below, which is only a fallback. Outputs { response: string, _usage }. Reference it downstream with {{response}}.",
    inputHandles: ["input", "systemPrompt"],
    configFields: [
      { key: "systemPrompt", label: "System prompt (fallback if no System Prompt node is connected)", type: "textarea" },
      { key: "message", label: "Message", type: "textarea", placeholder: "{{field}} supported" },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);

      const message = resolveTemplate(config.message ?? "", mainInput);
      const result = await aiProvider.run({
        name: "AI Chat (workflow)",
        prompt: connectedPrompt || config.systemPrompt || "Respond helpfully and concisely.",
        schema: FREE_TEXT_SCHEMA,
        input: { message, context: mainInput },
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Chat failed.");
      return { output: withUsage(result.data as { response: string }, result) };
    },
  },

  "ai.prompt": {
    type: "ai.prompt",
    category: "ai",
    label: "AI Prompt",
    description:
      "The general-purpose AI node: define your own JSON output schema, or leave it blank for a plain text response ({ response: string }). Has dedicated System Prompt and Output Schema connectors (left side) — wire in ai.systemPrompt / ai.outputSchema nodes instead of the config fields below, which are only fallbacks. Whatever keys your schema defines become this node's output (plus _usage) — reference them downstream with {{yourKey}} (e.g. {{response}} if left blank).",
    inputHandles: ["input", "systemPrompt", "schema"],
    configFields: [
      { key: "systemPrompt", label: "System prompt (fallback if no System Prompt node is connected)", type: "textarea" },
      { key: "message", label: "Message", type: "textarea", placeholder: "{{field}} supported" },
      {
        key: "outputSchema",
        label: "Output JSON schema (fallback if no Output Schema node is connected)",
        type: "textarea",
        placeholder: '{"type":"object","properties":{"response":{"type":"string"}},"required":["response"]}',
      },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);
      const connectedSchema = connectedSchemaOf(rawInput);

      const message = resolveTemplate(config.message ?? "", mainInput);
      let schema = connectedSchema ?? FREE_TEXT_SCHEMA;
      if (!connectedSchema && config.outputSchema) {
        try {
          schema = JSON.parse(config.outputSchema);
        } catch {
          throw new Error("AI Prompt: outputSchema is not valid JSON.");
        }
      }
      const result = await aiProvider.run({
        name: "AI Prompt (workflow)",
        prompt: connectedPrompt || config.systemPrompt || "Respond helpfully and concisely.",
        schema,
        input: { message, context: mainInput },
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Prompt failed.");
      return { output: withUsage(result.data as object, result) };
    },
  },

  "ai.agent": {
    type: "ai.agent",
    category: "ai",
    label: "AI Agent",
    description:
      "Single-call AI reasoning over a goal and your own output schema. True multi-step, tool-calling agent loops are future work — this runs one aiProvider call, same as AI Prompt. Has dedicated System Prompt and Output Schema connectors (left side) — wire ai.systemPrompt / ai.outputSchema nodes in instead of the config fields below, which are only fallbacks. Outputs whatever your schema defines (default { response: string }) plus _usage — reference downstream with {{response}} or your own key names.",
    inputHandles: ["input", "systemPrompt", "schema"],
    configFields: [
      { key: "systemPrompt", label: "System prompt / role (fallback if no System Prompt node is connected)", type: "textarea" },
      { key: "goal", label: "Goal", type: "textarea", placeholder: "{{field}} supported" },
      {
        key: "outputSchema",
        label: "Output JSON schema (fallback if no Output Schema node is connected)",
        type: "textarea",
        placeholder: '{"type":"object","properties":{"response":{"type":"string"}},"required":["response"]}',
      },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);
      const connectedSchema = connectedSchemaOf(rawInput);

      const goal = resolveTemplate(config.goal ?? "", mainInput);
      let schema = connectedSchema ?? FREE_TEXT_SCHEMA;
      if (!connectedSchema && config.outputSchema) {
        try {
          schema = JSON.parse(config.outputSchema);
        } catch {
          throw new Error("AI Agent: outputSchema is not valid JSON.");
        }
      }
      const result = await aiProvider.run({
        name: "AI Agent (workflow)",
        prompt: connectedPrompt || config.systemPrompt || "You are an autonomous agent working toward the given goal.",
        schema,
        input: { goal, context: mainInput },
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Agent failed.");
      return { output: withUsage(result.data as object, result) };
    },
  },

  "ai.systemPrompt": {
    type: "ai.systemPrompt",
    category: "ai",
    label: "System Prompt",
    description:
      "Defines a system prompt as its own node instead of a config field, so you can build, reuse, and swap an agent's role/instructions independently of whatever uses it. Wire its output into another node's dedicated \"systemPrompt\" connector rather than a plain data edge — every AI node in this category has one. Supports {{field}} templating against whatever flows into this node. Outputs { prompt: string }.",
    configFields: [
      {
        key: "prompt",
        label: "Prompt",
        type: "textarea",
        placeholder: "You are a real-estate lead-qualification agent. {{field}} supported.",
      },
    ],
    async execute(input, config) {
      return { output: { prompt: resolveTemplate(config.prompt ?? "", input) } };
    },
  },

  "ai.outputSchema": {
    type: "ai.outputSchema",
    category: "ai",
    label: "Output Schema",
    description:
      "Defines a JSON output schema as its own node instead of a config field, so you can build, reuse, and swap the structured shape an AI node must return independently of whatever uses it. Wire its output into another node's dedicated \"schema\" connector (AI Prompt, AI Agent, AI Extractor). Outputs { schema: object }.",
    configFields: [
      {
        key: "schema",
        label: "JSON schema",
        type: "textarea",
        placeholder: '{"type":"object","properties":{"phone":{"type":"string"}},"required":[]}',
      },
    ],
    async execute(_input, config) {
      if (!config.schema) throw new Error("Output Schema: a JSON schema is required.");
      let schema: any;
      try {
        schema = JSON.parse(config.schema);
      } catch {
        throw new Error("Output Schema: schema is not valid JSON.");
      }
      return { output: { schema } };
    },
  },

  "ai.classifier": {
    type: "ai.classifier",
    category: "ai",
    label: "AI Classifier",
    description:
      "Classifies the input into one of a fixed set of categories. Has a dedicated System Prompt connector (left side) — wire an ai.systemPrompt node in instead of the Extra instructions field below, which is only a fallback. Outputs { category: string, _usage }. Reference it downstream with {{category}} — to branch on it, feed this into an If node checking category equals one of your values (this node only has a single output, it doesn't branch visually).",
    inputHandles: ["input", "systemPrompt"],
    configFields: [
      { key: "categories", label: "Categories (comma-separated)", type: "text", placeholder: "spam, qualified, luxury" },
      {
        key: "instructions",
        label: "Extra instructions (fallback if no System Prompt node is connected)",
        type: "textarea",
      },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);

      const categories = (config.categories ?? "")
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean);
      if (categories.length === 0) throw new Error("AI Classifier: at least one category is required.");

      const instructions = connectedPrompt || config.instructions || "";
      const result = await aiProvider.run({
        name: "AI Classifier (workflow)",
        prompt: `${instructions}\n\nClassify the input into exactly one of these categories: ${categories.join(", ")}.`.trim(),
        schema: {
          type: "object",
          properties: { category: { type: "string", enum: categories } },
          required: ["category"],
        },
        input: mainInput,
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Classifier failed.");
      const data = withUsage(result.data as { category: string }, result);
      return { output: data, branch: data.category };
    },
  },

  "ai.extractor": {
    type: "ai.extractor",
    category: "ai",
    label: "AI Extractor",
    description:
      "Extracts structured fields from the input according to your JSON schema. Has dedicated System Prompt and Output Schema connectors (left side) — wire ai.systemPrompt / ai.outputSchema nodes in instead of the config fields below, which are only fallbacks (the schema one is required one way or the other). Outputs exactly the fields your schema defines, plus _usage — reference each with {{yourFieldName}} downstream (e.g. {{phone}} for the example schema above).",
    inputHandles: ["input", "systemPrompt", "schema"],
    configFields: [
      {
        key: "schema",
        label: "Extraction JSON schema (fallback if no Output Schema node is connected)",
        type: "textarea",
        placeholder: '{"type":"object","properties":{"phone":{"type":"string"}},"required":[]}',
      },
      {
        key: "instructions",
        label: "Extra instructions (fallback if no System Prompt node is connected)",
        type: "textarea",
      },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);
      const connectedSchema = connectedSchemaOf(rawInput);

      let schema = connectedSchema;
      if (!schema) {
        if (!config.schema) throw new Error("AI Extractor: a JSON schema is required (config field or Output Schema node).");
        try {
          schema = JSON.parse(config.schema);
        } catch {
          throw new Error("AI Extractor: schema is not valid JSON.");
        }
      }

      const result = await aiProvider.run({
        name: "AI Extractor (workflow)",
        prompt: connectedPrompt || config.instructions || "Extract the requested fields from the input.",
        schema,
        input: mainInput,
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Extractor failed.");
      return { output: withUsage(result.data as object, result) };
    },
  },

  "ai.summarizer": {
    type: "ai.summarizer",
    category: "ai",
    label: "AI Summarizer",
    description:
      "Summarizes the input into a short passage, in the language and format you choose. Has a dedicated System Prompt connector (left side) — wire an ai.systemPrompt node in instead of the What-to-focus-on field below, which is only a fallback. Set Format to \"HTML (email-ready)\" to get a summary that can go straight into an Email node's Body field with no manual cleanup. Outputs { summary: string, _usage }. Reference it downstream with {{summary}}.",
    inputHandles: ["input", "systemPrompt"],
    configFields: [
      { key: "maxWords", label: "Max words (optional)", type: "number" },
      {
        key: "language",
        label: "Response language",
        type: "select",
        options: [
          { value: "", label: "Match the input's language (default: English)" },
          { value: "English", label: "English" },
          { value: "Spanish", label: "Spanish" },
          { value: "Portuguese", label: "Portuguese" },
          { value: "French", label: "French" },
          { value: "German", label: "German" },
          { value: "Italian", label: "Italian" },
        ],
      },
      {
        key: "format",
        label: "Output format",
        type: "select",
        options: [
          { value: "plain", label: "Plain text" },
          { value: "html", label: "HTML (email-ready)" },
          { value: "bullets", label: "Bullet points (plain text)" },
        ],
      },
      {
        key: "instructions",
        label: "What to focus on (fallback if no System Prompt node is connected; added on top of the language/format settings, doesn't replace them)",
        type: "textarea",
        placeholder: "Summarize the input concisely.",
      },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);

      const instructions = connectedPrompt
        ? connectedPrompt
        : config.instructions
        ? config.instructions
        : config.maxWords
        ? `Summarize the input in ${config.maxWords} words or fewer.`
        : "Summarize the input concisely.";

      const language = config.language
        ? `Respond in ${config.language}.`
        : "Respond in the same language as the input; default to English if that's unclear.";

      const formatInstruction =
        config.format === "html"
          ? "Return the summary as a clean, email-ready HTML fragment: use <p> for paragraphs, <ul>/<li> for lists, and <strong> for emphasis where it helps. Do not include <html>, <head>, or <body> tags, markdown syntax, or code fences — the string must be ready to paste directly into an email body with no further editing."
          : config.format === "bullets"
          ? "Return the summary as plain-text bullet points (one point per line, starting with \"- \"), no markdown headers, no HTML."
          : "Return the summary as plain text — no markdown syntax and no HTML tags.";

      const prompt = [instructions, language, formatInstruction].join("\n\n");

      const result = await aiProvider.run({
        name: "AI Summarizer (workflow)",
        prompt,
        schema: {
          type: "object",
          properties: { summary: { type: "string" } },
          required: ["summary"],
        },
        input: mainInput,
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Summarizer failed.");
      return { output: withUsage(result.data as { summary: string }, result) };
    },
  },

  "ai.decision": {
    type: "ai.decision",
    category: "ai",
    label: "AI Decision",
    description:
      "Asks Claude a yes/no question about the input and branches on the answer. Has a dedicated System Prompt connector (left side) — wire an ai.systemPrompt node in instead of the config field below, which is only a fallback. Outputs { decision: boolean, reason: string, _usage } and routes to the \"true\" or \"false\" handle. Reference {{reason}} downstream, or connect nodes to the true/false outputs to branch.",
    inputHandles: ["input", "systemPrompt"],
    outputHandles: ["true", "false"],
    configFields: [
      { key: "question", label: "Question", type: "textarea", placeholder: "{{field}} supported" },
      {
        key: "systemPrompt",
        label: "System prompt (fallback if no System Prompt node is connected)",
        type: "textarea",
        placeholder: "Answer the question about the input with a boolean decision and a short reason.",
      },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);

      const question = resolveTemplate(config.question ?? "", mainInput);
      if (!question) throw new Error("AI Decision: a question is required.");

      const result = await aiProvider.run({
        name: "AI Decision (workflow)",
        prompt:
          connectedPrompt ||
          config.systemPrompt ||
          "Answer the question about the input with a boolean decision and a short reason.",
        schema: {
          type: "object",
          properties: {
            decision: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["decision"],
        },
        input: { question, context: mainInput },
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Decision failed.");
      const data = withUsage(result.data as { decision: boolean; reason: string }, result);
      return { output: data, branch: data.decision ? "true" : "false" };
    },
  },

  "ai.validator": {
    type: "ai.validator",
    category: "ai",
    label: "AI Validator",
    description:
      'Validates the input against a rule (e.g. "is this a real phone number?", "is this spam?"). Has a dedicated System Prompt connector (left side) — wire an ai.systemPrompt node in to fully replace the validation instruction, or leave it disconnected to use the Validation rule field dynamically. Outputs { valid: boolean, reason: string, _usage } and routes to the "true" or "false" handle. Reference {{reason}} downstream, or connect nodes to the true/false outputs to branch.',
    inputHandles: ["input", "systemPrompt"],
    outputHandles: ["true", "false"],
    configFields: [
      { key: "rule", label: "Validation rule", type: "textarea", placeholder: "Is this a good lead?" },
      MODEL_FIELD,
    ],
    async execute(rawInput, config) {
      const mainInput = mainInputOf(rawInput);
      const connectedPrompt = connectedPromptOf(rawInput);

      if (!connectedPrompt && !config.rule) {
        throw new Error("AI Validator: a validation rule is required (config field or System Prompt node).");
      }

      const result = await aiProvider.run({
        name: "AI Validator (workflow)",
        prompt: connectedPrompt || `Validate the input against this rule: "${config.rule}". Return whether it's valid and why.`,
        schema: {
          type: "object",
          properties: {
            valid: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["valid"],
        },
        input: mainInput,
        model: config.model || undefined,
        context: { reportId: "automation" },
      });
      if (!result.success) throw new Error(result.error ?? "AI Validator failed.");
      const data = withUsage(result.data as { valid: boolean; reason: string }, result);
      return { output: data, branch: data.valid ? "true" : "false" };
    },
  },
};
