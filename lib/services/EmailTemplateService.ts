// ======================================================
// Email Template Service — the ONLY file that writes to
// email_templates
// lib/services/EmailTemplateService.ts
// ======================================================

import { supabaseAdmin } from "@/lib/supabase/server";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertEmailTemplateInput {
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}

export class EmailTemplateService {
  static async list(): Promise<EmailTemplate[]> {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list templates: ${error.message}`);
    }

    return data ?? [];
  }

  static async get(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return data;
  }

  static async create(
    input: UpsertEmailTemplateInput
  ): Promise<EmailTemplate> {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .insert({
        name: input.name,
        subject: input.subject,
        body_html: input.bodyHtml,
        body_text: input.bodyText ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create template: ${error?.message}`);
    }

    return data;
  }

  static async update(
    id: string,
    input: Partial<UpsertEmailTemplateInput>
  ): Promise<EmailTemplate> {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.subject !== undefined ? { subject: input.subject } : {}),
        ...(input.bodyHtml !== undefined
          ? { body_html: input.bodyHtml }
          : {}),
        ...(input.bodyText !== undefined
          ? { body_text: input.bodyText }
          : {}),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to update template: ${error?.message}`);
    }

    return data;
  }

  static async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("email_templates")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }
}
