-- ======================================================
-- External Datasets (generic bucket)
-- supabase/migrations/0009_external_datasets.sql
-- ======================================================
-- Catch-all storage for the MVP data-source pass (INE, BCU,
-- Intendencia permits, Catastro CSV extracts, IDEuy GIS features,
-- Google Trends, InsideAirbnb, etc.) — each source has a wildly
-- different native schema, so rather than modeling each one
-- individually right now, every row from any source lands here
-- tagged by `source`, as raw jsonb. Once a given source's shape
-- stabilizes and proves valuable, promote it to its own proper
-- table (the same path re_properties took) instead of querying
-- jsonb long-term.

create table if not exists public.re_external_datasets (
  id uuid not null default gen_random_uuid(),
  source character varying(100) not null,
  captured_at timestamptz not null default now(),
  row_index integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint re_external_datasets_pkey primary key (id)
);

create index if not exists idx_re_external_datasets_source on public.re_external_datasets (source);
create index if not exists idx_re_external_datasets_captured_at on public.re_external_datasets (captured_at desc);
