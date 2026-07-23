-- ======================================================
-- Intelligence Center: Connected Workflows
-- supabase/migrations/0008_intelligence_workflow_connections.sql
-- ======================================================
-- Lets the Property Intelligence settings panel connect one or
-- more automation workflows (built in /admin/automation using the
-- "Scrape Real Estate Listings" node) as data sources — replaces
-- the earlier MARKET_TIMELINE_WORKFLOW_ID env var with a
-- UI-managed, multi-workflow list.

create table if not exists public.re_connected_workflows (
  id uuid not null default gen_random_uuid(),
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  label text,
  created_at timestamptz not null default now(),
  constraint re_connected_workflows_pkey primary key (id),
  constraint re_connected_workflows_workflow_id_key unique (workflow_id)
);
