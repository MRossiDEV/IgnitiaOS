-- ======================================================
-- CRM Event Workflows
-- supabase/migrations/0013_crm_event_workflows.sql
-- ======================================================
-- Connects automation workflows to CRM events (e.g. "lead.created")
-- so real app actions (a lead being inserted) can trigger a
-- workflow run automatically — same "connect a workflow to a
-- trigger source" pattern as re_connected_workflows, generalized
-- to any event_type instead of being Intelligence-specific.
-- Multiple workflows can be connected to the same event.

create table if not exists public.crm_event_workflows (
  id uuid not null default gen_random_uuid(),
  event_type character varying(50) not null,
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint crm_event_workflows_pkey primary key (id),
  constraint crm_event_workflows_event_workflow_key unique (event_type, workflow_id)
);

create index if not exists idx_crm_event_workflows_event_type on public.crm_event_workflows (event_type);
