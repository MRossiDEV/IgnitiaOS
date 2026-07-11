import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { nanoid } from "nanoid";


function generateReportCode() {
  return `RPT-${nanoid(8).toUpperCase()}`;
}


function generateAccessCode() {
  return nanoid(6).toUpperCase();
}



export async function POST(
  request: NextRequest
) {

  try {

    const supabase = supabaseAdmin;


    const body = await request.json();


    const {
      businessName,
      website,
      industry,
      category,
      city,
      country,
      goal,
      problems,
      marketing,
      competitor,

      fullName,
      email,
      phone,
      company,

    } = body;



    if (!email || !fullName) {

      return NextResponse.json(
        {
          error: "Name and email are required",
        },
        {
          status: 400,
        }
      );

    }



    const reportCode = generateReportCode();

    const accessCode = generateAccessCode();



    const { data: report, error } = await supabase
      .from("reports")
      .insert({

        report_code: reportCode,

        slug: reportCode.toLowerCase(),

        status: "processing",


        business_name:
          businessName || company,


        business_website:
          website,


        industry:
          industry || category,


        city,

        country,


        business_email:
          email,


        business_phone:
          phone,


        metadata: {

          contact: {

            name: fullName,

            email,

            phone,

          },


          wizard: {

            goal,

            problems,

            marketing,

            competitor,

          },


          access_code:
            accessCode,

        },


        audit_date:
          new Date().toISOString(),

      })
      .select()
      .single();



    if (error) {

      console.error(
        "CREATE REPORT ERROR:",
        error
      );


      return NextResponse.json(
        {
          error: "Could not create report",
        },
        {
          status: 500,
        }
      );

    }



    return NextResponse.json({

      success: true,

      reportId:
        report.report_code,

      accessCode,


    });



  } catch (error) {


    console.error(
      "REPORT POST ERROR:",
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