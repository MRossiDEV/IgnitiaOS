import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { aiconn } from "@/ai/aiconn";

const aiRunner = aiconn;

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId required" },
        { status: 400 }
      );
    }

    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) throw error;

    const input = JSON.stringify(
      {
        business: {
          name: report.business_name,
          website: report.business_website,
          industry: report.industry,
          city: report.city,
          state: report.state,
          country: report.country,
        },

        website: report.website_analysis,
        seo: report.seo_analysis,
        google: report.google_business_analysis,
        social: report.social_analysis,
        branding: report.branding_analysis,
        funnel: report.funnel_analysis,
        leadGeneration: report.lead_generation_analysis,
        strategy: report.strategy_analysis,
        proposal: report.metadata?.proposal,
        ai: report.metadata?.ai_opportunities,
      },
      null,
      2
    );

    const completion = await (aiRunner as any).responses.create({
      model: "gpt-5.5",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
                You are the final Report Builder for Ignitia AI.

                Merge every audit into ONE final consulting report.

                Return ONLY valid JSON.

                {
                "executiveSummary":"",
                "overallScore":0,
                "health":"Excellent",
                "sections":[
                    {
                    "title":"",
                    "score":0,
                    "summary":"",
                    "strengths":[],
                    "weaknesses":[],
                    "recommendations":[]
                    }
                ],
                "quickWins":[],
                "roadmap":[],
                "proposal":{},
                "finalThoughts":""
                }
                `,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const finalReport = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    const reportSlug =
      report.report_slug ||
      `${report.business_name || "report"}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        report.id.slice(0, 8);

    await supabaseAdmin
      .from("reports")
      .update({
        overall_score: finalReport.overallScore || report.overall_score,
        executive_summary: finalReport.executiveSummary,
        content: finalReport,
        report_slug: reportSlug,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      completed: true,
      reportId,
      reportSlug,
      reportUrl: `/report/${reportSlug}`,
      report: finalReport,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}