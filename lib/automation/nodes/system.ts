// ======================================================
// System Nodes
// lib/automation/nodes/system.ts
// ======================================================
// HTTP Request lives in nodeTypes.ts (existing action.httpRequest,
// just recategorized). Database and File are new.
//
// Database is intentionally restricted to an allowlist — the
// underlying client (supabaseAdmin) bypasses RLS, so letting a
// workflow read/write an arbitrary table name would be an
// unrestricted data-exfil/tamper primitive.

import { NodeTypeDefinition } from "../types";
import { resolveTemplate } from "../resolveTemplate";
import { getPath } from "../pathCompare";
import { supabaseAdmin } from "@/lib/supabase/server";

const ALLOWED_TABLES = ["leads", "contacts", "deals", "workflow_tasks", "notifications"];

async function ensureBucket(bucketName: string) {
  const { data: existing } = await supabaseAdmin.storage.getBucket(bucketName);
  if (!existing) {
    const { error } = await supabaseAdmin.storage.createBucket(bucketName, { public: true });
    if (error && !/already exists/i.test(error.message)) {
      throw new Error(`File: failed to create bucket "${bucketName}": ${error.message}`);
    }
  }
}

export const systemNodes: Record<string, NodeTypeDefinition> = {
  "system.database": {
    type: "system.database",
    category: "system",
    label: "Database",
    description: `Reads/writes a table directly. Restricted to: ${ALLOWED_TABLES.join(", ")}. Select outputs the raw array of matching rows directly (not wrapped in an object) — feed it into a Loop node to process each row, since a bare array isn't addressable with {{field}}. Insert/Update output the single affected row — reference its fields downstream, e.g. {{id}}.`,
    configFields: [
      {
        key: "table",
        label: "Table",
        type: "select",
        options: ALLOWED_TABLES.map((t) => ({ value: t, label: t })),
      },
      {
        key: "operation",
        label: "Operation",
        type: "select",
        options: [
          { value: "select", label: "Select" },
          { value: "insert", label: "Insert" },
          { value: "update", label: "Update" },
        ],
      },
      { key: "filterField", label: "Filter field (select/update)", type: "text", placeholder: "id" },
      { key: "filterValue", label: "Filter value", type: "text", placeholder: "{{id}}" },
      { key: "data", label: "Data (JSON, insert/update)", type: "textarea", placeholder: '{"status":"contacted"}' },
    ],
    async execute(input, config) {
      const table = config.table;
      if (!ALLOWED_TABLES.includes(table)) {
        throw new Error(`Database: table "${table}" is not in the allowlist (${ALLOWED_TABLES.join(", ")}).`);
      }

      const operation = config.operation ?? "select";

      if (operation === "select") {
        let query: any = supabaseAdmin.from(table).select("*");
        if (config.filterField) {
          query = query.eq(config.filterField, resolveTemplate(config.filterValue ?? "", input));
        }
        const { data, error } = await query;
        if (error) throw new Error(`Database: ${error.message}`);
        return { output: data ?? [] };
      }

      let payload: Record<string, any> = {};
      if (config.data) {
        try {
          payload = JSON.parse(resolveTemplate(config.data, input));
        } catch {
          throw new Error("Database: data is not valid JSON.");
        }
      }

      if (operation === "insert") {
        const { data, error } = await (supabaseAdmin.from(table) as any).insert(payload).select("*").single();
        if (error || !data) throw new Error(`Database: ${error?.message ?? "insert failed"}`);
        return { output: data };
      }

      if (operation === "update") {
        if (!config.filterField) throw new Error("Database: update requires a filter field.");
        const { data, error } = await (supabaseAdmin.from(table) as any)
          .update(payload)
          .eq(config.filterField, resolveTemplate(config.filterValue ?? "", input))
          .select("*")
          .single();
        if (error || !data) throw new Error(`Database: ${error?.message ?? "update failed"}`);
        return { output: data };
      }

      throw new Error(`Database: unknown operation "${operation}".`);
    },
  },

  "system.file": {
    type: "system.file",
    category: "system",
    label: "File",
    description:
      "Uploads content to Supabase Storage and returns its public URL. Outputs { bucket, path, url }. Reference {{url}} downstream, e.g. to include a link in an Email node's Body.",
    configFields: [
      { key: "bucket", label: "Bucket", type: "text", placeholder: "workflow-files" },
      { key: "path", label: "Path", type: "text", placeholder: "workflow/{{id}}.json" },
      { key: "contentField", label: "Content field (dot path, blank = whole input)", type: "text" },
    ],
    async execute(input, config) {
      const bucket = config.bucket || "workflow-files";
      const path = resolveTemplate(config.path ?? "", input) || `workflow/${Date.now()}.json`;
      const raw = config.contentField ? getPath(input, config.contentField) : input;
      const content = typeof raw === "string" ? raw : JSON.stringify(raw ?? {}, null, 2);

      await ensureBucket(bucket);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, Buffer.from(content), { upsert: true });

      if (uploadError) throw new Error(`File: ${uploadError.message}`);

      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
      return { output: { bucket, path, url: data.publicUrl } };
    },
  },
};
