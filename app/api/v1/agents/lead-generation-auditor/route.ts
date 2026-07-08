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
        website: report.website_analysis,
        seo: report.seo_analysis,
        social: report.social_analysis,
        google: report.google_business_analysis,
        funnel: report.funnel_analysis,
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
You are a Growth Marketing consultant.

Audit every lead acquisition channel.

Evaluate:

- Organic SEO
- Google Maps
- Google Ads
- Facebook Ads
- Instagram
- LinkedIn
- Email Marketing
- Referral
- Cold Outreach
- Local Partnerships
- Retargeting
- Lead Magnets
- CRM Capture
- Newsletter
- Remarketing

Estimate:

• monthly visitors
• monthly leads
• qualified leads
• conversion rate
• biggest acquisition opportunities

Return ONLY valid JSON.

{
  "score":0,
  "summary":"",
  "estimatedTraffic":0,
  "estimatedLeads":0,
  "estimatedQualifiedLeads":0,
  "estimatedConversionRate":0,
  "channels":[
    {
      "name":"",
      "score":0,
      "status":"",
      "opportunity":""
    }
  ],
  "strengths":[],
  "weaknesses":[],
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
        lead_generation_analysis: analysis,
        estimated_monthly_leads: analysis.estimatedLeads ?? 0,
        estimated_conversion_rate:
          analysis.estimatedConversionRate ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      nextAgent: "ai-opportunity-auditor",
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