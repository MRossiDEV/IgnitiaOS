import { supabaseAdmin } from "@/lib/supabase/server";

export async function generateFreeReport(reportId: string) {
  const supabase = supabaseAdmin;

  try {
    // Load report
    const { data: report, error } = await supabase
      .from("free_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      console.error("Report not found:", error);
      return;
    }

    // Mark as processing
    // await supabase
    //   .from("free_reports")
    //   .update({
    //     status: "processing",
    //   })
    //   .eq("id", reportId);

    // =====================================
    // TODO:
    // Replace this with your OpenAI Agents
    // =====================================

    await new Promise((resolve) =>
      setTimeout(resolve, 6000)
    );

    const summary = `
${report.business_name} has a good foundation but several
opportunities for digital growth.

The website requires SEO optimization, stronger calls-to-action,
better Google visibility and AI automation to improve lead generation.

Based on the information provided, IgnitiaOS estimates that
implementing the recommended improvements could significantly
increase qualified leads over the next 6-12 months.
`;

    // Save mock report
    await supabase
      .from("free_reports")
      .update({
        status: "completed",

        ai_summary: summary,

        overall_score: 76,

        website_score: 71,

        seo_score: 65,

        google_score: 81,

        social_score: 59,

        conversion_score: 73,

        strengths: [
          "Website available",
          "Clear business focus",
          "Good growth potential",
        ],

        opportunities: [
          "SEO improvements",
          "Lead capture optimization",
          "Google Business optimization",
          "AI automation",
        ],

        quick_wins: [
          "Improve page speed",
          "Optimize titles and metadata",
          "Create stronger CTAs",
        ],

        executive_score: 76,

        executive_preview: [
          "Good digital foundation",
          "SEO requires improvement",
          "High automation potential",
        ],

        recommended_services: [
          "Business Intelligence Report",
          "Professional Digital Presence",
          "Customer Machine",
        ],

        estimated_growth:
          "Estimated 20% - 40% increase in qualified leads.",

        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

  } catch (err) {
    console.error(err);

    await supabase
      .from("free_reports")
      .update({
        status: "failed",
      })
      .eq("id", reportId);
  }
}