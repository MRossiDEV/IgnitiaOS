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
You are a Senior Social Media Marketing Consultant.

Business

${report.business_name}

Industry

${report.industry}

Website

${report.business_website}

Social Links

${JSON.stringify(source.social)}

Website Metadata

${JSON.stringify(source.metadata)}

Analyze the company's social media presence.

If no profiles are available, explain the missed opportunities.

Return ONLY valid JSON.

{
    "overall_score":0,

    "facebook_score":0,
    "instagram_score":0,
    "linkedin_score":0,
    "youtube_score":0,
    "tiktok_score":0,

    "posting_frequency_score":0,
    "branding_consistency_score":0,
    "engagement_score":0,

    "profiles_found":[
        {
            "platform":"",
            "url":"",
            "found":true
        }
    ],

    "strengths":[
        ""
    ],

    "weaknesses":[
        ""
    ],

    "quick_wins":[
        ""
    ],

    "content_opportunities":[
        ""
    ],

    "recommendations":[
        ""
    ],

    "summary":""
}
`;

    const completion = await (aiRunner as any).responses.create({
      model: "gpt-5.5",
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are a senior social media growth consultant. Return JSON only.",
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
        social_analysis: analysis,
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