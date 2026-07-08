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
          industry: report.industry,
          website: report.business_website,
        },

        website: report.website_analysis,
        seo: report.seo_analysis,
        google: report.google_business_analysis,
        social: report.social_analysis,
        branding: report.branding_analysis,
        funnel: report.funnel_analysis,
        leadGeneration: report.lead_generation_analysis,
        ai: report.metadata?.ai_opportunities || {},
      },
      null,
      2
    );

    const completion = await (aiRunner as any).responses.create({
      model: "gpt-5.5",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
You are the Chief Growth Officer of Ignitia AI.

Your mission is to create a complete business growth strategy.

Analyze every previous audit and produce an executive consulting report.

Generate:

• Executive Summary
• Current Business Situation
• Biggest Problems
• Biggest Opportunities
• SWOT Analysis
• Revenue Bottlenecks
• Marketing Priorities
• Sales Priorities
• AI Priorities
• Competitive Advantages
• Estimated Lost Revenue
• 30-Day Roadmap
• 60-Day Roadmap
• 90-Day Roadmap
• Long-Term Vision

Also rank every recommendation using:

Impact:
High / Medium / Low

Difficulty:
Easy / Medium / Hard

Priority:
Critical / High / Medium / Low

Return ONLY valid JSON.

{
  "executiveSummary":"",
  "overallScore":0,
  "businessMaturity":"",
  "estimatedLostRevenue":0,
  "biggestProblems":[],
  "biggestOpportunities":[],
  "swot":{
      "strengths":[],
      "weaknesses":[],
      "opportunities":[],
      "threats":[]
  },
  "priorities":[
      {
          "title":"",
          "impact":"High",
          "difficulty":"Medium",
          "priority":"Critical",
          "description":""
      }
  ],
  "roadmap":{
      "30days":[],
      "60days":[],
      "90days":[]
  },
  "vision":""
}
`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const strategy = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    await supabaseAdmin
      .from("reports")
      .update({
        executive_summary: strategy.executiveSummary,
        overall_score: strategy.overallScore,
        estimated_lost_revenue: strategy.estimatedLostRevenue,
        strategy_analysis: strategy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      nextAgent: "proposal-generator",
      reportId,
      strategy,
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