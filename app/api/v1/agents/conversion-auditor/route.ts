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
        website: report.website_analysis,
        branding: report.branding_analysis,
        social: report.social_analysis,
        seo: report.seo_analysis,
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
                You are a CRO (Conversion Rate Optimization) expert.

                Audit the company's sales funnel.

                Evaluate:

                - Homepage
                - Landing Pages
                - CTA visibility
                - Offer
                - Lead Magnet
                - Contact Forms
                - Booking System
                - Trust Elements
                - Testimonials
                - Pricing
                - FAQ
                - Mobile Conversion
                - Speed
                - Navigation
                - Checkout
                - Chat Widget
                - Follow-up Process

                Estimate current conversion rate.

                Return ONLY JSON.

                {
                "score":0,
                "estimatedConversionRate":0,
                "summary":"",
                "strengths":[],
                "weaknesses":[],
                "missingElements":[],
                "quickWins":[],
                "recommendations":[],
                "funnel":{
                    "awareness":0,
                    "interest":0,
                    "consideration":0,
                    "conversion":0,
                    "retention":0
                }
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
        funnel_analysis: analysis,
        conversion_analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
      nextAgent: "lead-generation-auditor",
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