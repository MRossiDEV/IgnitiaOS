-- ======================================================
-- Email Templates + Email Logs
-- supabase/migrations/0001_email_templates_and_logs.sql
-- ======================================================
-- Run this before using the Emails admin page.
--
-- NOTE on set_updated_at(): if you already have a generic
-- "touch updated_at" trigger function in your project (you
-- have update_lead_crm_updated_at() for lead_crm — if that's
-- actually generic under the hood, feel free to reuse it
-- instead and skip creating this one).

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table public.email_templates (
  id uuid not null default gen_random_uuid(),
  name character varying(150) not null,
  subject character varying(255) not null,
  body_html text not null,
  body_text text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint email_templates_pkey primary key (id)
) TABLESPACE pg_default;

create trigger trg_set_email_templates_updated_at
before update on email_templates
for each row
execute function public.set_updated_at();

create table public.email_logs (
  id uuid not null default gen_random_uuid(),
  template_id uuid null,
  report_id uuid null,
  to_email text not null,
  to_name character varying(150) null,
  subject character varying(255) not null,
  body_html text not null,
  body_text text null,
  status character varying(20) not null default 'sent',
  error text null,
  message_id text null,
  sent_by character varying(150) null,
  sent_at timestamp with time zone null default now(),
  constraint email_logs_pkey primary key (id),
  constraint email_logs_template_id_fkey foreign key (template_id)
    references email_templates (id) on delete set null,
  constraint email_logs_report_id_fkey foreign key (report_id)
    references free_reports (id) on delete set null
) TABLESPACE pg_default;

create index idx_email_logs_report_id on public.email_logs (report_id);
create index idx_email_logs_sent_at on public.email_logs (sent_at desc);
