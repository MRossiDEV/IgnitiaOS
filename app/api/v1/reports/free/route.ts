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
      teamSize,
      website,
      industry,
      category,
      city,
      country,
      goal,
      problems,
      marketing,
      competitor,
    } = body;

    const reportCode = generateReportCode();
    const accessCode = generateAccessCode();

    const { data: report, error } = await supabase
      .from("free_reports")
      .insert({
        report_code: reportCode,
        access_code: accessCode,
        status: "new",        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        viewed_at: null,
        viewed_count: 0,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), 
        business_name: businessName,
        website: website,
        industry: industry,
        business_type: category,
        business_size: teamSize || null,
        city: city,
        country: country,
        primary_goal: goal,
        biggest_challenge: problems,
        monthly_leads: null,
        marketing_channels: marketing,
        competitors: competitor,
        full_name: body.fullName,
        email: body.email,
        phone: body.phone,
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

    if (report) {

    const { error: crmError } = await supabaseAdmin
      .from("lead_crm")
      .insert({

        report_id: report.id,

        status: "New",

        priority: "Medium",

        owner: null,

        notes: null,

        follow_up: null,

        proposal_sent_at: null,

        won_at: null,

        lost_at: null,

        estimated_value: null,

        probability: 50,

        last_contact_at: null,

        next_action: null,

        stage_order: 0,

        tags: [],

        activity: [
          {
            type: "Lead Created",
            message: "Free report submitted.",
            date: new Date().toISOString(),
          },
        ],

      });

    if (crmError) {

      console.error(
        "Failed creating CRM record",
        crmError
      );

    }

  }



    return NextResponse.json({
      success: true,
      reportId: report.report_code,
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