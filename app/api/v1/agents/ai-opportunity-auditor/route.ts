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
        business: report.business_name,
        industry: report.industry,
        website: report.website_analysis,
        seo: report.seo_analysis,
        google: report.google_business_analysis,
        social: report.social_analysis,
        branding: report.branding_analysis,
        funnel: report.funnel_analysis,
        leadGeneration: report.lead_generation_analysis,
      },
      null,
      2
    );

    const completion = await (aiRunner as any).responses.create({
      model: "gpt-5.5",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are a Senior AI Automation Consultant.

Your job is to discover EVERY opportunity where Artificial Intelligence
can increase revenue, reduce costs, automate operations or improve customer experience.

Audit the following areas:

• Sales
• Marketing
• CRM
• Lead Qualification
• Customer Service
• Appointment Booking
• Follow Ups
• Email
• Internal Operations
• Reporting
• Proposal Generation
• Content Creation
• Social Media
• SEO
• Advertising
• Analytics
• Document Processing
• Knowledge Base
• Recruiting
• Finance

Estimate:

- Hours saved per week
- Cost savings
- Revenue increase
- Automation difficulty
- ROI

Return ONLY valid JSON.

{
  "score":0,
  "summary":"",
  "estimatedHoursSavedPerWeek":0,
  "estimatedMonthlySavings":0,
  "estimatedRevenueIncrease":0,
  "overallROI":"High",
  "automations":[
    {
      "name":"",
      "priority":"High",
      "difficulty":"Medium",
      "hoursSaved":0,
      "roi":"High",
      "description":""
    }
  ],
  "quickWins":[],
  "recommendations":[]
}
`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const analysis = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    await supabaseAdmin
      .from("reports")
      .update({
        ai_score: analysis.score || 0,
        automation_score: analysis.score || 0,
        estimated_monthly_revenue:
          analysis.estimatedRevenueIncrease || 0,
        estimated_roi:
          analysis.overallROI === "High"
            ? 300
            : analysis.overallROI === "Medium"
            ? 180
            : 100,
        metadata: {
          ...(report.metadata || {}),
          ai_opportunities: analysis,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      nextAgent: "growth-strategist",
      reportId,
      analysis,
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