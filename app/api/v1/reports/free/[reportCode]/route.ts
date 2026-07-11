import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      reportCode: string;
    };
  }
) {
  try {
    const supabase = supabaseAdmin;

    const { reportCode } = params;

    if (!reportCode) {
      return NextResponse.json(
        {
          error: "Report code is required",
        },
        {
          status: 400,
        }
      );
    }


    const { data: report, error } = await supabase
      .from("reports")
      .select(`
        id,
        report_code,
        slug,
        status,

        business_name,
        business_website,
        industry,
        business_size,
        city,
        state,
        country,

        audit_date,
        created_at,

        ai_summary,
        executive_summary,

        strengths,
        weaknesses,
        opportunities,
        threats,

        overall_score,

        website_score,
        seo_score,
        google_score,
        social_score,
        branding_score,

        quick_wins,

        thumbnail_url
      `)
      .eq("report_code", reportCode)
      .single();



    if (error || !report) {

      console.error(
        "REPORT FETCH ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: "Report not found",
        },
        {
          status: 404,
        }
      );
    }



    return NextResponse.json(
      {
        success: true,

        report: {

          id: report.report_code,

          status: report.status,


          business: {

            name: report.business_name,

            website: report.business_website,

            industry: report.industry,

            size: report.business_size,

            location: [
              report.city,
              report.state,
              report.country,
            ]
              .filter(Boolean)
              .join(", "),
          },


          summary: {

            ai: report.ai_summary,

            executive: report.executive_summary,

          },


          scores: {

            overall: report.overall_score,

            website: report.website_score,

            seo: report.seo_score,

            google: report.google_score,

            social: report.social_score,

            branding: report.branding_score,

          },


          insights: {

            strengths: report.strengths,

            weaknesses: report.weaknesses,

            opportunities: report.opportunities,

            threats: report.threats,

          },


          quickWins: report.quick_wins,


          thumbnail: report.thumbnail_url,


          createdAt: report.created_at,

        },

      },
      {
        status: 200,
      }
    );


  } catch (error) {


    console.error(
      "FREE REPORT API ERROR:",
      error
    );


    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );

  }
}