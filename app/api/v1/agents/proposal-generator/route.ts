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
        },
        strategy: report.strategy_analysis,
        website: report.website_analysis,
        seo: report.seo_analysis,
        social: report.social_analysis,
        funnel: report.funnel_analysis,
        automation: report.metadata?.ai_opportunities,
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
                You are the Sales Director of Ignitia AI.

                Create a professional consulting proposal.

                Recommend ONLY services that truly benefit this company.

                Available services:

                - Website Redesign
                - Landing Pages
                - CRM
                - AI Chatbot
                - AI Lead Qualification
                - AI Appointment Booking
                - Marketing Automation
                - Email Automation
                - Google Ads
                - Facebook Ads
                - SEO
                - Local SEO
                - Content Marketing
                - Analytics Dashboard
                - AI Reports
                - Reputation Management

                Estimate realistic pricing.

                Return ONLY JSON.

                {
                "summary":"",
                "proposalValue":0,
                "monthlyRetainer":0,
                "estimatedROI":0,
                "timeline":"90 Days",
                "services":[
                    {
                    "service":"",
                    "price":0,
                    "priority":"Critical",
                    "reason":""
                    }
                ],
                "deliverables":[
                    ""
                ],
                "phases":[
                    {
                    "phase":"Phase 1",
                    "duration":"30 days",
                    "tasks":[]
                    }
                ]
                }
                `,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const proposal = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    await supabaseAdmin
      .from("reports")
      .update({
        proposal_value: proposal.proposalValue || 0,
        estimated_roi: proposal.estimatedROI || 0,
        recommended_services: proposal.services || [],
        roadmap: proposal.phases || [],
        metadata: {
          ...(report.metadata || {}),
          proposal,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      nextAgent: "report-builder",
      reportId,
      proposal,
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