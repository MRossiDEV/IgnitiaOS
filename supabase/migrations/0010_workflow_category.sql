-- ======================================================
-- Workflow Category
-- supabase/migrations/0010_workflow_category.sql
-- ======================================================
-- Free-text category/tag for organizing the workflow list
-- (e.g. "Intelligence", "CRM", "Marketing") — the list page
-- suggests previously-used values but doesn't enforce a fixed set.

alter table public.workflows
  add column if not exists category character varying(50);

create index if not exists idx_workflows_category on public.workflows (category);
