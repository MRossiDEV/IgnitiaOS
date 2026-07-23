-- ======================================================
-- Workflows + Workflow Runs
-- supabase/migrations/0003_workflows.sql
-- ======================================================
-- Run this before using the Automation admin section.
-- Reuses set_updated_at() from migration 0001 if you already
-- ran that one.

create table public.workflows (
  id uuid not null default gen_random_uuid(),
  name character varying(150) not null,
  description text null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  status character varying(20) not null default 'draft',
  trigger_type character varying(20) not null default 'manual',
  trigger_config jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint workflows_pkey primary key (id)
) TABLESPACE pg_default;

create trigger trg_set_workflows_updated_at
before update on workflows
for each row
execute function public.set_updated_at();

create table public.workflow_runs (
  id uuid not null default gen_random_uuid(),
  workflow_id uuid not null,
  status character varying(20) not null default 'running',
  trigger_source character varying(50) null,
  node_results jsonb not null default '[]'::jsonb,
  error text null,
  started_at timestamp with time zone null default now(),
  finished_at timestamp with time zone null,
  constraint workflow_runs_pkey primary key (id),
  constraint workflow_runs_workflow_id_fkey foreign key (workflow_id)
    references workflows (id) on delete cascade
) TABLESPACE pg_default;

create index idx_workflow_runs_workflow_id on public.workflow_runs (workflow_id);
