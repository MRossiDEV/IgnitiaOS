import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

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

const AGENT_ENDPOINTS: Record<string, string> = {
  "Website Crawler": "/api/v1/agents/website-crawler",
  "Google Business": "/api/v1/agents/google-business-auditor",
  "Social Media": "/api/v1/agents/social-media-auditor",
  Branding: "/api/v1/agents/branding-auditor",
  "Report Builder": "/api/v1/agents/report-builder",
  "SEO Auditor": "/api/v1/agents/seo-auditor",
  Conversion: "/api/v1/agents/conversion-auditor",
  "Lead Generation": "/api/v1/agents/lead-generation-auditor",
  "Growth Strategist": "/api/v1/agents/growth-strategyst",
  "Website Auditor": "/api/v1/agents/website-auditor",
  "AI Opportunities": "/api/v1/agents/ai-opportunity-auditor",
  "Proposal Generator": "/api/v1/agents/proposal-generator",
};

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
    const status = getFirstNonEmptyString(body.status, "draft");
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

    const selectedAgents: string[] = Array.isArray(body.agents)
      ? body.agents.filter((agent: unknown): agent is string => typeof agent === "string")
      : [];

    if (!businessName)
      return NextResponse.json(
        {
          error: "Business name required",
        },
        {
          status: 400,
        }
      );

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
        status,
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

    const defaultAgents = Object.values(AGENT_ENDPOINTS);
    const selectedAgentEndpoints =
      selectedAgents.length > 0
        ? selectedAgents
            .map((agentName) => AGENT_ENDPOINTS[agentName])
            .filter((endpoint): endpoint is string => Boolean(endpoint))
        : defaultAgents;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    // Fire-and-forget
    (async () => {
      for (const endpoint of selectedAgentEndpoints) {
        try {
          await fetch(`${appUrl}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reportId: report.id,
            }),
          });
        } catch (e) {
          console.error(endpoint, e);
        }
      }
    })();

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