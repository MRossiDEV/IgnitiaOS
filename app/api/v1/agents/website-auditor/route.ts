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

    const { data: source } = await supabaseAdmin
      .from("report_sources")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (!source) {
      return NextResponse.json(
        { error: "Website source not found." },
        { status: 404 }
      );
    }

    const prompt = `
        You are a senior UX, CRO and Website Consultant.

        Analyze this website.

        Title:
        ${source.homepage_title}

        Description:
        ${source.homepage_description}

        H1:
        ${JSON.stringify(source.metadata?.h1)}

        H2:
        ${JSON.stringify(source.metadata?.h2)}

        Technologies:
        ${JSON.stringify(source.technologies)}

        Return ONLY valid JSON.

        {
            "overall_score":0,

            "mobile_friendly":0,
            "visual_design":0,
            "branding":0,
            "trust":0,
            "calls_to_action":0,
            "navigation":0,
            "copywriting":0,
            "contact_information":0,
            "conversion":0,

            "strengths":[
                ""
            ],

            "weaknesses":[
                ""
            ],

            "quick_wins":[
                ""
            ],

            "issues":[
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
            "You are a senior website auditor. Return JSON only.",
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
        website_analysis: analysis,
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