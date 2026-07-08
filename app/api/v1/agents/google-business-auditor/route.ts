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
You are a Google Business Profile expert.

Business

${report.business_name}

Website

${report.business_website}

Location

${report.city}, ${report.state}, ${report.country}

Website Metadata

${JSON.stringify(source.metadata)}

Evaluate the business Google presence.

If information is unavailable infer likely opportunities instead of inventing facts.

Return ONLY JSON.

{
    "overall_score":0,

    "profile_found":true,

    "verified":false,

    "rating":0,

    "reviews":0,

    "photos_score":0,

    "information_score":0,

    "local_seo_score":0,

    "posting_score":0,

    "qa_score":0,

    "strengths":[
        ""
    ],

    "issues":[
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
            "You are an expert Google Business consultant. Return JSON only.",
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
        google_business_analysis: analysis,
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