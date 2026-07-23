-- ======================================================
-- Workflow Tasks + Notifications
-- supabase/migrations/0005_workflow_tasks_notifications.sql
-- ======================================================
-- Backs the "Create Task" and "Internal Notification" nodes,
-- plus the "Assign Task" mode of the Human node. Deliberately
-- generic (not FK'd to ai_agents like agent_tasks is).

create table if not exists public.workflow_tasks (
  id uuid not null default gen_random_uuid(),
  title character varying(200) not null,
  description text null,
  assignee text null,
  due_at timestamptz null,
  status character varying(20) not null default 'open',
  source_workflow_id uuid null references public.workflows (id) on delete cascade,
  source_run_id uuid null references public.workflow_runs (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workflow_tasks_pkey primary key (id),
  constraint workflow_tasks_status_check check (status in ('open', 'in_progress', 'done', 'cancelled'))
);

create index if not exists idx_workflow_tasks_source_workflow_id on public.workflow_tasks (source_workflow_id);
create index if not exists idx_workflow_tasks_status on public.workflow_tasks (status);

create trigger trg_set_workflow_tasks_updated_at
before update on public.workflow_tasks
for each row
execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  title character varying(200) not null,
  body text null,
  recipient text null,
  source character varying(50) null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint notifications_pkey primary key (id)
);

create index if not exists idx_notifications_recipient on public.notifications (recipient);
create index if not exists idx_notifications_created_at on public.notifications (created_at desc);
