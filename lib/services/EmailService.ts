// ======================================================
// Email Service — the ONLY file that writes to email_logs.
// Also owns the "send as the company" action: calls the
// generic sendEmail tool, then logs the result.
// lib/services/EmailService.ts
// ======================================================

import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/ai/tools/email";

export interface SendComposedEmailInput {
  to: string;
  toName?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  templateId?: string;
  reportId?: string;
  sentBy?: string;
}

export interface EmailLog {
  id: string;
  template_id: string | null;
  report_id: string | null;
  to_email: string;
  to_name: string | null;
  subject: string;
  body_html: string;
  body_text: string | null;
  status: "sent" | "failed";
  error: string | null;
  message_id: string | null;
  sent_by: string | null;
  sent_at: string;
}

export interface LeadOption {
  reportId: string;
  fullName: string;
  email: string;
  businessName: string;
}

export class EmailService {
  static async sendAndLog(
    input: SendComposedEmailInput
  ): Promise<EmailLog> {
    const result = await sendEmail({
      to: input.to,
      subject: input.subject,
      html: input.bodyHtml,
      text: input.bodyText,
      account: "mrossi",
    });

    const { data, error } = await supabaseAdmin
      .from("email_logs")
      .insert({
        template_id: input.templateId ?? null,
        report_id: input.reportId ?? null,
        to_email: input.to,
        to_name: input.toName ?? null,
        subject: input.subject,
        body_html: input.bodyHtml,
        body_text: input.bodyText ?? null,
        status: result.success ? "sent" : "failed",
        error: result.error ?? null,
        message_id: result.messageId ?? null,
        sent_by: input.sentBy ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Email sent but failed to log it: ${error?.message}`);
    }

    if (!result.success) {
      // Surface the send failure to the caller even though logging succeeded.
      throw new Error(result.error ?? "Failed to send email");
    }

    return data;
  }

  static async listHistory(params: {
    limit?: number;
    offset?: number;
  }): Promise<{ items: EmailLog[]; total: number }> {
    const limit = params.limit ?? 25;
    const offset = params.offset ?? 0;

    const { data, error, count } = await supabaseAdmin
      .from("email_logs")
      .select("*", { count: "exact" })
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to load email history: ${error.message}`);
    }

    return { items: data ?? [], total: count ?? 0 };
  }

  // Read-only helper for the recipient picker — doesn't write
  // anything, so it doesn't violate the one-service-per-table rule.
  static async searchLeads(query: string): Promise<LeadOption[]> {
    if (!query || query.trim().length < 2) return [];

    const { data, error } = await supabaseAdmin
      .from("free_reports")
      .select("id, full_name, email, business_name")
      .or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,business_name.ilike.%${query}%`
      )
      .limit(10);

    if (error || !data) return [];

    return data.map((row: any) => ({
      reportId: row.id,
      fullName: row.full_name,
      email: row.email,
      businessName: row.business_name,
    }));
  }
}
