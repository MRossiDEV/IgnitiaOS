import { NextRequest, NextResponse } from "next/server";
import { aiconn } from "@/ai/aiconn";
import { supabaseAdmin } from "@/lib/supabase/server";

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

    const { data: source } = await supabaseAdmin
      .from("report_sources")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (!source) {
      return NextResponse.json(
        { error: "Website not crawled." },
        { status: 404 }
      );
    }

    const prompt = `
You are a Senior SEO Consultant.

Analyze this website.

Title:
${source.homepage_title}

Description:
${source.homepage_description}

Metadata:
${JSON.stringify(source.metadata)}

Technologies:
${JSON.stringify(source.technologies)}

Return ONLY valid JSON.

{
    "overall_score":0,

    "title_score":0,
    "description_score":0,
    "headings_score":0,
    "content_score":0,
    "keywords_score":0,
    "internal_links_score":0,
    "images_score":0,
    "schema_score":0,
    "performance_score":0,

    "strengths":[
        ""
    ],

    "issues":[
        ""
    ],

    "quick_wins":[
        ""
    ],

    "missing_keywords":[
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
            "You are a senior SEO expert. Return JSON only.",
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
        seo_analysis: analysis,
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