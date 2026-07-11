import { supabaseAdmin } from "@/lib/supabase/server";

export async function getPricingServices() {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_features (
        title,
        display_order
      ),
      service_categories (
        slug,
        name
      )
    `)
    .eq("active", true)
    .order("display_order")
    .order("display_order", {
      foreignTable: "service_features",
    });

  if (error) throw error;

  return data;
}