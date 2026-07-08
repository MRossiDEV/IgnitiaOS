import { NextRequest, NextResponse } from "next/server";
import { aiconn } from "@/ai/aiconn";
import { supabaseAdmin } from "@/lib/supabase/server";

const aiRunner = aiconn;

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        {
          error: "Missing reportId",
        },
        {
          status: 400,
        }
      );
    }

    const { data: report } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    const { data: source } = await supabaseAdmin
      .from("report_sources")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (!report || !source) {
      return NextResponse.json(
        {
          error: "Report not found",
        },
        {
          status: 404,
        }
      );
    }

    const prompt = `
You are a Senior Branding Consultant.

Business

${report.business_name}

Industry

${report.industry}

Website

${report.business_website}

Title

${source.homepage_title}

Description

${source.homepage_description}

H1

${JSON.stringify(source.metadata?.h1)}

Technologies

${JSON.stringify(source.technologies)}

Analyze the business branding.

Evaluate:

- Brand Positioning
- Trust
- Professionalism
- Visual Identity
- Messaging
- Unique Value Proposition
- Brand Consistency
- Brand Authority
- Emotional Appeal

Return ONLY JSON.

{
    "overall_score":0,

    "visual_identity":0,

    "brand_consistency":0,

    "brand_message":0,

    "professionalism":0,

    "trust":0,

    "authority":0,

    "unique_value":0,

    "emotional_connection":0,

    "strengths":[
        ""
    ],

    "weaknesses":[
        ""
    ],

    "quick_wins":[
        ""
    ],

    "recommendations":[
        ""
    ],

    "summary":""
}
`;

    const completion =
      await (aiRunner as any).responses.create({
        model: "gpt-5.5",
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert branding consultant. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const analysis = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    await supabaseAdmin
      .from("reports")
      .update({
        branding_analysis: analysis,
      })
      .eq("id", reportId);

    return NextResponse.json({
      success: true,
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