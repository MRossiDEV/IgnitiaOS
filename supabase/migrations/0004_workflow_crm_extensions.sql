-- ======================================================
-- Workflow CRM Extensions: assigned_to, contacts, deals
-- supabase/migrations/0004_workflow_crm_extensions.sql
-- ======================================================
-- Adds what the CRM-category automation nodes need on top
-- of the existing `leads` table: an assignment field, plus
-- minimal Contact and Deal tables (Lead -> Contact -> Deal).

alter table public.leads
  add column if not exists assigned_to text;

create table if not exists public.contacts (
  id uuid not null default gen_random_uuid(),
  lead_id uuid null references public.leads (id) on delete set null,
  name character varying(150) not null,
  email text null,
  phone text null,
  role character varying(100) null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_pkey primary key (id)
);

create index if not exists idx_contacts_lead_id on public.contacts (lead_id);

create table if not exists public.deals (
  id uuid not null default gen_random_uuid(),
  lead_id uuid null references public.leads (id) on delete set null,
  contact_id uuid null references public.contacts (id) on delete set null,
  name character varying(150) not null,
  value numeric(12, 2) null default 0,
  stage character varying(30) not null default 'opportunity',
  status character varying(20) not null default 'open',
  probability integer null default 50,
  expected_close_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deals_pkey primary key (id)
);

create index if not exists idx_deals_lead_id on public.deals (lead_id);
create index if not exists idx_deals_contact_id on public.deals (contact_id);

create trigger trg_set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

create trigger trg_set_deals_updated_at
before update on public.deals
for each row
execute function public.set_updated_at();
