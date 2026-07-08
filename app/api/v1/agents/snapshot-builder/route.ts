import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { aiconn } from "@/ai/aiconn";

const aiRunner = aiconn;

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId" },
        { status: 400 }
      );
    }

    const { data: report } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const prompt = `
Business Name:
${report.business_name}

Industry:
${report.industry}

Website Audit:
${JSON.stringify(report.website_analysis)}

SEO Audit:
${JSON.stringify(report.seo_analysis)}

Google Business:
${JSON.stringify(report.google_business_analysis)}

Social Media:
${JSON.stringify(report.social_analysis)}

Branding:
${JSON.stringify(report.branding_analysis)}

Conversion:
${JSON.stringify(report.conversion_analysis)}

Lead Generation:
${JSON.stringify(report.lead_generation_analysis)}

Using ONLY the information above create a FREE business snapshot.

Return ONLY JSON.

{
    "overall_score":0,
    "website_score":0,
    "seo_score":0,
    "google_score":0,
    "social_score":0,
    "branding_score":0,
    "ai_score":0,

    "executive_summary":"",

    "quick_wins":[
        ""
    ],

    "strengths":[
        ""
    ],

    "weaknesses":[
        ""
    ],

    "opportunities":[
        ""
    ],

    "recommendations":[
        ""
    ],

    "estimated_monthly_leads":0,

    "estimated_lost_revenue":0
}
`;

    const completion = await (aiRunner as any).responses.create({
      model: "gpt-5.5",
      temperature: 0.2,
      input:
        "You are an expert business growth consultant. Return valid JSON only.\n\n" +
        prompt,
    });

    const snapshot = JSON.parse(
      completion.output?.[0]?.content?.[0]?.text || "{}"
    );

    await supabaseAdmin.from("report_snapshot").upsert({
      report_id: reportId,

      overall_score: snapshot.overall_score,

      website_score: snapshot.website_score,

      seo_score: snapshot.seo_score,

      google_score: snapshot.google_score,

      social_score: snapshot.social_score,

      branding_score: snapshot.branding_score,

      ai_score: snapshot.ai_score,

      executive_summary: snapshot.executive_summary,

      quick_wins: snapshot.quick_wins,

      strengths: snapshot.strengths,

      weaknesses: snapshot.weaknesses,

      opportunities: snapshot.opportunities,

      recommendations: snapshot.recommendations,

      estimated_monthly_leads:
        snapshot.estimated_monthly_leads,

      estimated_lost_revenue:
        snapshot.estimated_lost_revenue,

      generated_at: new Date(),
    });

    await supabaseAdmin
      .from("reports")
      .update({
        overall_score: snapshot.overall_score,
        snapshot_completed: true,
        snapshot_generated_at: new Date(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      snapshot,
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