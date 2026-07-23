// ======================================================
// Report Service — the ONLY file that writes to free_reports
// lib/services/ReportService.ts
// ======================================================
// Per the Database Rule: one table, one service.

import { supabaseAdmin } from "@/lib/supabase/server";
import { AssembledReport, ReportSection } from "@/lib/ai/report-builder";

function randomCode(length: number, prefix = ""): string {
  // Ambiguous-looking characters (0/O, 1/I) removed on purpose —
  // these codes get typed/copy-pasted by real people.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix ? `${prefix}-${code}` : code;
}

export interface CreatePendingReportInput {
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  website?: string;
  industry?: string;
  businessType?: string;
  businessSize?: string;
  city?: string;
  country?: string;
  primaryGoal?: string;
  biggestChallenge?: string;
  monthlyLeads?: string;
  marketingChannels?: string[];
  competitorUrls?: string[];
}

export interface PendingReport {
  id: string;
  reportCode: string;
  accessCode: string;
}

// Maps specialist keys straight onto their dedicated free_reports columns.
const SECTION_SCORE_COLUMNS: Record<
  string,
  "seo_score" | "google_score" | "social_score" | "conversion_score"
> = {
  seo: "seo_score",
  google: "google_score",
  social: "social_score",
  conversion: "conversion_score",
};

// free_reports only has one generic "website_score" column — this is
// the average of every general website-quality specialist that ran.
const WEBSITE_SCORE_KEYS = [
  "ux",
  "content",
  "branding",
  "copywriting",
  "accessibility",
  "trust",
];

export class ReportService {
  static async createPendingReport(
    input: CreatePendingReportInput
  ): Promise<PendingReport> {
    const reportCode = randomCode(8, "IGN");
    const accessCode = randomCode(10);

    const { data, error } = await supabaseAdmin
      .from("free_reports")
      .insert({
        report_code: reportCode,
        access_code: accessCode,
        status: "pending",
        full_name: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        business_name: input.businessName,
        website: input.website ?? null,
        industry: input.industry ?? null,
        business_type: input.businessType ?? null,
        business_size: input.businessSize ?? null,
        city: input.city ?? null,
        country: input.country ?? null,
        primary_goal: input.primaryGoal ?? null,
        biggest_challenge: input.biggestChallenge ?? null,
        monthly_leads: input.monthlyLeads ?? null,
        marketing_channels: input.marketingChannels ?? [],
        competitors: input.competitorUrls ?? [],
      })
      .select("id, report_code, access_code")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create report: ${error?.message}`);
    }

    return {
      id: data.id,
      reportCode: data.report_code,
      accessCode: data.access_code,
    };
  }

  static async markProcessing(reportId: string): Promise<void> {
    await supabaseAdmin
      .from("free_reports")
      .update({ status: "processing" })
      .eq("id", reportId);
  }

  static async completeReport(
    reportId: string,
    report: AssembledReport
  ): Promise<void> {
    const sectionByKey = new Map(report.sections.map((s) => [s.key, s]));

    const scoreColumns: Record<string, number> = {};
    for (const [key, column] of Object.entries(SECTION_SCORE_COLUMNS)) {
      const section = sectionByKey.get(key);
      if (section) scoreColumns[column] = section.score;
    }

    const websiteSections = WEBSITE_SCORE_KEYS.map((key) =>
      sectionByKey.get(key)
    ).filter((s): s is ReportSection => Boolean(s));

    const websiteScore =
      websiteSections.length > 0
        ? Math.round(
            websiteSections.reduce((sum, s) => sum + s.score, 0) /
              websiteSections.length
          )
        : null;

    // Each entry keeps its source section so the frontend can group/label
    // them (e.g. "SEO: no meta description found").
    const strengths = report.sections.flatMap((s) =>
      s.strengths.map((text) => ({ section: s.label, text }))
    );
    const opportunities = report.sections.flatMap((s) =>
      s.opportunities.map((text) => ({ section: s.label, text }))
    );
    const quickWins = report.sections.flatMap((s) =>
      s.quickWins.map((text) => ({ section: s.label, text }))
    );

    // No AI synthesis step by design (architecture doc: "No Chief Agents").
    // Plain concatenation of each specialist's own summary for MVP.
    const aiSummary = report.sections
      .map((s) => `${s.label}: ${s.summary}`)
      .join("\n\n");

    const { error } = await supabaseAdmin
      .from("free_reports")
      .update({
        status: "completed",
        overall_score: report.overallScore,
        website_score: websiteScore,
        ...scoreColumns,
        strengths,
        opportunities,
        quick_wins: quickWins,
        ai_summary: aiSummary,
        metadata: {
          sections: report.sections,
          generatedAt: report.generatedAt,
        },
      })
      .eq("id", reportId);

    if (error) {
      throw new Error(`Failed to save completed report: ${error.message}`);
    }
  }

  static async attachPdfUrl(reportId: string, pdfUrl: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("free_reports")
      .update({ pdf_url: pdfUrl })
      .eq("id", reportId);

    if (error) {
      throw new Error(`Failed to save PDF URL: ${error.message}`);
    }
  }

  static async failReport(
    reportId: string,
    errorMessage: string
  ): Promise<void> {
    await supabaseAdmin
      .from("free_reports")
      .update({
        status: "failed",
        metadata: { error: errorMessage },
      })
      .eq("id", reportId);
  }

  static async getByReportCode(reportCode: string) {
    const { data, error } = await supabaseAdmin
      .from("free_reports")
      .select("*")
      .eq("report_code", reportCode)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}
