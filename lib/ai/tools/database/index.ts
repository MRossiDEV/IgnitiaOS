import type { Tool } from "../types";
import { supabaseAdmin } from "@/lib/supabase/server";

export const DatabaseTool: Tool = {
  name: "Supabase Database",

  description: "Reads and writes data to Supabase",

  async run(input) {

    const action = input.action ?? "insert";

    const table = input.table ?? "reports";

    switch (action) {

      //---------------------------------------------------
      // INSERT
      //---------------------------------------------------

      case "insert": {

        const payload = input.payload ?? input.report;

        if (!payload)
          throw new Error(
            "Nothing to insert."
          );

        const { data, error } =
          await supabaseAdmin
            .from(table)
            .insert(payload)
            .select()
            .single();

        if (error)
          throw error;

        return data;
      }

      //---------------------------------------------------
      // UPDATE
      //---------------------------------------------------

      case "update": {

        const id = input.id;

        if (!id)
          throw new Error(
            "Missing record id."
          );

        const payload = input.payload ?? input.report;

        const { data, error } =
          await supabaseAdmin
            .from(table)
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error)
          throw error;

        return data;
      }

      //---------------------------------------------------
      // UPSERT
      //---------------------------------------------------

      case "upsert": {

        const payload = input.payload ?? input.report;

        const { data, error } =
          await supabaseAdmin
            .from(table)
            .upsert(payload)
            .select();

        if (error)
          throw error;

        return data;
      }

      //---------------------------------------------------
      // DELETE
      //---------------------------------------------------

      case "delete": {

        const id = input.id;

        const { error } =
          await supabaseAdmin
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

        const filters = input.filters ?? {};

        let query =
          supabaseAdmin.from(table).select("*");

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

        return data;
      }

      //---------------------------------------------------
      // COUNT
      //---------------------------------------------------

      case "count": {

        const { count, error } =
          await supabaseAdmin
            .from(table)
            .select("*", {
              count: "exact",
              head: true,
            });

        if (error)
          throw error;

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
