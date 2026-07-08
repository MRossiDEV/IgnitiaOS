import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    campaigns: data,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      objective,
      channel,
      status,
      budget,
      start_date,
      end_date,

      industry,
      description,
      ai_prompt,

      target_country,
      target_city,
      language,

      offer,

      landing_page_enabled,
      chatbot_enabled,
      facebook_ads_enabled,
      google_ads_enabled,
      email_sequence_enabled,

      qualification_questions,
      score_weights,

      estimated_cpc,
      estimated_conversion,
      estimated_lead_value,
      projected_profit,
    } = body;

    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .insert([
        {
          name,
          objective,
          channel,
          status,
          budget,
          start_date,
          end_date,

          industry,
          description,
          ai_prompt,

          target_country,
          target_city,
          language,

          offer,

          landing_page_enabled,
          chatbot_enabled,
          facebook_ads_enabled,
          google_ads_enabled,
          email_sequence_enabled,

          qualification_questions,
          score_weights,

          estimated_cpc,
          estimated_conversion,
          estimated_lead_value,
          projected_profit,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign: data,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}