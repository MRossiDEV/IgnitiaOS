import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { runAdminReportPipeline } from "@/lib/ai/runAdminReportPipeline";
import { VALID_SPECIALIST_IDS } from "@/lib/ai/pipeline/custom-report";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getFirstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function getOptionalString(...values: unknown[]) {
  const value = getFirstNonEmptyString(...values);
  return value || null;
}

function parseDateOrNull(value: unknown) {
  const str = getFirstNonEmptyString(value);
  return str || null;
}

function parseVersion(value: unknown) {
  const parsed = Number.parseInt(String(value ?? "1"), 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function parseTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [] as string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const businessName = getFirstNonEmptyString(
      body.business_name,
      body.businessName
    );

    const businessWebsite = getOptionalString(
      body.business_website,
      body.website
    );

    const industry = getOptionalString(body.industry);
    const businessSize = getOptionalString(body.business_size, body.businessSize);

    const businessEmail = getOptionalString(body.business_email, body.email);
    const businessPhone = getOptionalString(body.business_phone, body.phone);

    const city = getOptionalString(body.city);
    const state = getOptionalString(body.state);
    const country = getOptionalString(body.country);
    const address = getOptionalString(body.address);

    const reportCode = getOptionalString(body.report_code, body.reportCode);
    const version = parseVersion(body.version);

    const auditDate = parseDateOrNull(body.audit_date);
    const expiresAt = parseDateOrNull(body.expires_at);

    const tags = parseTags(body.tags);

    const facebook = getOptionalString(body.facebook);
    const instagram = getOptionalString(body.instagram);
    const linkedin = getOptionalString(body.linkedin);
    const youtube = getOptionalString(body.youtube);
    const googleBusiness = getOptionalString(
      body.google_business_url,
      body.googleBusinessUrl
    );

    const notes = getOptionalString(body.notes);

    // Only keep specialist ids the pipeline actually knows about.
    const selectedAgents: string[] = Array.isArray(body.agents)
      ? body.agents.filter(
          (agent: unknown): agent is string =>
            typeof agent === "string" && VALID_SPECIALIST_IDS.has(agent)
        )
      : [];

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name required" },
        { status: 400 }
      );
    }

    if (selectedAgents.length === 0) {
      return NextResponse.json(
        { error: "Select at least one specialist to run." },
        { status: 400 }
      );
    }

    if (!businessWebsite) {
      return NextResponse.json(
        { error: "A business website is required to run the analysis." },
        { status: 400 }
      );
    }

    const slugBase = getFirstNonEmptyString(
      body.slug,
      body.report_slug,
      businessName
    );

    const slug =
      slugify(slugBase) + "-" + Math.random().toString(36).substring(2, 8);

    const generatedReportCode =
      reportCode ||
      `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const metadata =
      body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
        ? body.metadata
        : {};

    const existingSocialLinks =
      metadata.socialLinks &&
      typeof metadata.socialLinks === "object" &&
      !Array.isArray(metadata.socialLinks)
        ? metadata.socialLinks
        : {};

    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .insert({
        report_code: generatedReportCode,
        slug,
        report_slug: slug,
        // The pipeline flips this to processing -> completed | failed.
        status: "queued",
        version,

        client_id: getOptionalString(body.client_id, body.clientId),
        generated_by: getOptionalString(body.generated_by, body.generatedBy),

        business_name: businessName,
        business_website: businessWebsite,

        industry,
        business_size: businessSize,

        city,
        state,
        country,
        address,

        business_email: businessEmail,
        business_phone: businessPhone,

        audit_date: auditDate,
        expires_at: expiresAt,

        tags,

        metadata: {
          ...metadata,
          socialLinks: {
            ...existingSocialLinks,
            facebook,
            instagram,
            linkedin,
            youtube,
            googleBusiness,
          },
          notes,
          selectedAgents,
        },
      })
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget: runs after the response is sent. The report view
    // polls status until it flips to completed | failed.
    after(() => runAdminReportPipeline(report.id));

    return NextResponse.json({
      success: true,
      id: report.id,
      slug: report.report_slug,
      status: report.status,
      redirect: `/admin/reports/${report.report_slug}`,
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
