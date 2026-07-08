import { ToolExecutor } from "@/lib/runtime/registry";

export const DatabaseTool: ToolExecutor = {
  name: "Supabase Database",

  description: "Reads and writes data to Supabase",

  version: "1.0.0",

  async execute({
    node,
    context,
    memory,
  }) {

    const action =
      node.config?.action ?? "insert";

    const table =
      node.config?.table ?? "reports";

    switch (action) {

      //---------------------------------------------------
      // INSERT
      //---------------------------------------------------

      case "insert": {

        const payload =
          node.config?.payload ??
          memory.getVariable("report");

        if (!payload)
          throw new Error(
            "Nothing to insert."
          );

        const { data, error } =
          await context.supabase
            .from(table)
            .insert(payload)
            .select()
            .single();

        if (error)
          throw error;

        memory.setVariable(
          `${table}_insert`,
          data
        );

        return data;
      }

      //---------------------------------------------------
      // UPDATE
      //---------------------------------------------------

      case "update": {

        const id =
          node.config?.id ??
          memory.getVariable("id");

        if (!id)
          throw new Error(
            "Missing record id."
          );

        const payload =
          node.config?.payload ??
          memory.getVariable("report");

        const { data, error } =
          await context.supabase
            .from(table)
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error)
          throw error;

        memory.setVariable(
          `${table}_update`,
          data
        );

        return data;
      }

      //---------------------------------------------------
      // UPSERT
      //---------------------------------------------------

      case "upsert": {

        const payload =
          node.config?.payload ??
          memory.getVariable("report");

        const { data, error } =
          await context.supabase
            .from(table)
            .upsert(payload)
            .select();

        if (error)
          throw error;

        memory.setVariable(
          `${table}_upsert`,
          data
        );

        return data;
      }

      //---------------------------------------------------
      // DELETE
      //---------------------------------------------------

      case "delete": {

        const id =
          node.config?.id ??
          memory.getVariable("id");

        const { error } =
          await context.supabase
            .from(table)
            .delete()
            .eq("id", id);

        if (error)
          throw error;

        return {
          deleted: true,
          id,
        };
      }

      //---------------------------------------------------
      // SELECT
      //---------------------------------------------------

      case "select": {

        const filters =
          node.config?.filters ?? {};

        let query =
          context.supabase.from(table).select("*");

        Object.entries(filters).forEach(
          ([key, value]) => {
            query = query.eq(
              key,
              value
            );
          }
        );

        const { data, error } =
          await query;

        if (error)
          throw error;

        memory.setVariable(
          `${table}_rows`,
          data
        );

        return data;
      }

      //---------------------------------------------------
      // COUNT
      //---------------------------------------------------

      case "count": {

        const { count, error } =
          await context.supabase
            .from(table)
            .select("*", {
              count: "exact",
              head: true,
            });

        if (error)
          throw error;

        memory.setVariable(
          `${table}_count`,
          count
        );

        return {
          count,
        };
      }

      default:

        throw new Error(
          `Unsupported database action: ${action}`
        );
    }
  },
};