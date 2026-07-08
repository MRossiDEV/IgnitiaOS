import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      reportId,
      businessName,
      website,
      industry,
      city,
      state,
      country,
    } = body;

    if (!reportId)
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );

    const metadata = {
      collectedAt: new Date().toISOString(),
      businessName,
      website,
      industry,
      location: {
        city,
        state,
        country,
      },
      pages: [],
      screenshots: [],
      technologies: [],
      emails: [],
      phones: [],
      socialLinks: {},
      dns: {},
      ssl: {},
      headers: {},
      firecrawl: {},
      google: {},
    };

    // ------------------------------------------------------------------
    // TODO:
    // Firecrawl crawl
    // Google Search
    // Google Maps
    // LinkedIn
    // Facebook
    // Instagram
    // Technology Detection
    // Screenshot generation
    // Page extraction
    // ------------------------------------------------------------------

    const { error } = await supabaseAdmin
      .from("reports")
      .update({
        business_name: businessName,
        business_website: website,
        industry,
        city,
        state,
        country,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      nextAgent: "website-auditor",
      reportId,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}