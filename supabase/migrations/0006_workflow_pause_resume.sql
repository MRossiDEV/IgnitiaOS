-- ======================================================
-- Workflow Pause/Resume
-- supabase/migrations/0006_workflow_pause_resume.sql
-- ======================================================
-- Lets a run stop mid-graph (Request Approval, Wait For Reply,
-- most Human modes) and continue later from a snapshot instead
-- of only ever running start-to-finish in one call.
-- workflow_runs.status has no CHECK constraint (see 0003), so
-- 'paused' is already a legal value — this just adds storage
-- for where it paused and what's needed to continue.

alter table public.workflow_runs
  add column if not exists paused_node_id text,
  add column if not exists pending_request jsonb,
  add column if not exists execution_snapshot jsonb;
