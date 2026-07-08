import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const h = await headers();

    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "";

    const userAgent = h.get("user-agent") || "";

    const {
      // Landing Page
      source,
      campaign,
      landing_page,
      funnel,

      // Contact
      first_name,
      last_name,
      company,
      email,
      phone,

      preferred_contact,

      // Location
      language,
      timezone,
      country,
      state,
      city,
      postal_code,

      latitude,
      longitude,

      // Lead
      lead_type,
      industry,
      category,

      urgency,

      // Marketing
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,

      // AI
      ai_summary,
      ai_tags,
      ai_score,
      quality_score,

      // Custom
      custom_fields,
      metadata,
    } = body;

    if (!email && !phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Email or phone is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // Duplicate Lead
    // ----------------------------------------

    let duplicateQuery = supabaseAdmin
      .from("leads")
      .select("id")
      .limit(1);

    if (email) duplicateQuery = duplicateQuery.eq("email", email);

    if (!email && phone)
      duplicateQuery = duplicateQuery.eq("phone", phone);

    const { data: duplicate } =
      await duplicateQuery.maybeSingle();

    if (duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        id: duplicate.id,
      });
    }

    // ----------------------------------------
    // Insert Lead
    // ----------------------------------------

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        status: "new",
        stage: "new",

        source,
        campaign,
        landing_page,
        funnel,

        first_name,
        last_name,
        company,
        email,
        phone,

        preferred_contact,

        language,
        timezone,

        country,
        state,
        city,
        postal_code,

        latitude,
        longitude,

        lead_type,
        industry,
        category,

        urgency,

        ai_summary,

        ai_tags: ai_tags ?? [],

        ai_score: ai_score ?? 0,

        quality_score: quality_score ?? 0,

        ip,

        browser: userAgent,

        device: userAgent,

        operating_system: userAgent,

        referrer,

        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,

        custom_fields: custom_fields ?? {},

        metadata: {
          ...metadata,
          user_agent: userAgent,
          received_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      lead: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    success: true,
    leads: data,
  });
}