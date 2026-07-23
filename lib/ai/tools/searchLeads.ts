import { Tool } from "../types"
import { supabaseAdmin } from "@/lib/supabase/server"

export const searchLeads: Tool = {
  name: "search_leads",

  description: "Search leads from CRM",

  async run(input) {
    const query = input.query || ""

    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(20)

    if (error) throw error

    return data
  },
}