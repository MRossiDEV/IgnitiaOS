import { Tool } from "../types"
import { supabase } from "@/lib/supabase/client"

export const createLead: Tool = {
  name: "create_lead",
  description: "Create a new lead",

  run: async (input) => {
    const { name, email } = input

    const { data, error } = await supabase
      .from("leads")
      .insert([{ name, email }])
      .select()
      .single()

    if (error) throw error

    return data
  },
}