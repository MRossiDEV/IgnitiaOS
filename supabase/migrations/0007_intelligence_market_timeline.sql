-- ======================================================
-- Intelligence Center: Market Timeline
-- supabase/migrations/0007_intelligence_market_timeline.sql
-- ======================================================
-- Prefixed re_ to namespace real-estate data distinctly from the
-- existing marketing-agency schema. re_properties/re_neighborhoods
-- hold the current row per entity; the *_snapshots tables are
-- append-only version history ("git for the housing market") —
-- a new row is only inserted when something meaningfully changed
-- since the last snapshot (see lib/market-timeline/diff.ts).
-- Reuses set_updated_at() from 0001_email_templates_and_logs.sql.

create table if not exists public.re_properties (
  id uuid not null default gen_random_uuid(),
  portal character varying(50) not null,
  external_id text not null,
  url text not null,
  address text,
  city character varying(100),
  neighborhood character varying(100),
  price numeric(14, 2),
  currency character varying(10) not null default 'USD',
  bedrooms integer,
  bathrooms integer,
  area_m2 numeric(10, 2),
  lat double precision,
  lng double precision,
  status character varying(20) not null default 'active',
  agency_name text,
  description text,
  photo_count integer not null default 0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint re_properties_pkey primary key (id),
  constraint re_properties_portal_external_id_key unique (portal, external_id),
  constraint re_properties_status_check check (status in ('active', 'sold', 'delisted'))
);

create index if not exists idx_re_properties_city on public.re_properties (city);
create index if not exists idx_re_properties_neighborhood on public.re_properties (neighborhood);
create index if not exists idx_re_properties_status on public.re_properties (status);

create trigger trg_set_re_properties_updated_at
before update on public.re_properties
for each row
execute function public.set_updated_at();

create table if not exists public.re_property_snapshots (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null references public.re_properties (id) on delete cascade,
  captured_at timestamptz not null default now(),
  price numeric(14, 2),
  status character varying(20),
  photo_count integer,
  description_hash text,
  description_text text,
  agency_name text,
  change_summary text,
  raw jsonb not null default '{}'::jsonb,
  constraint re_property_snapshots_pkey primary key (id)
);

create index if not exists idx_re_property_snapshots_property_id on public.re_property_snapshots (property_id);
create index if not exists idx_re_property_snapshots_captured_at on public.re_property_snapshots (captured_at desc);

create table if not exists public.re_neighborhoods (
  id uuid not null default gen_random_uuid(),
  name character varying(150) not null,
  city character varying(100) not null,
  median_price numeric(14, 2),
  inventory_count integer,
  avg_days_on_market numeric(8, 2),
  rental_yield numeric(6, 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint re_neighborhoods_pkey primary key (id),
  constraint re_neighborhoods_name_city_key unique (name, city)
);

create trigger trg_set_re_neighborhoods_updated_at
before update on public.re_neighborhoods
for each row
execute function public.set_updated_at();

create table if not exists public.re_neighborhood_snapshots (
  id uuid not null default gen_random_uuid(),
  neighborhood_id uuid not null references public.re_neighborhoods (id) on delete cascade,
  captured_at timestamptz not null default now(),
  median_price numeric(14, 2),
  inventory_count integer,
  avg_days_on_market numeric(8, 2),
  rental_yield numeric(6, 3),
  raw jsonb not null default '{}'::jsonb,
  constraint re_neighborhood_snapshots_pkey primary key (id)
);

create index if not exists idx_re_neighborhood_snapshots_neighborhood_id on public.re_neighborhood_snapshots (neighborhood_id);

-- No re_scrape_runs table: data gathering now happens via automation
-- workflows (lib/automation/nodes/data.ts "Scrape Real Estate Listings"
-- node), so job-run history is already tracked generically by the
-- existing workflow_runs table (supabase/migrations/0003_workflows.sql).
