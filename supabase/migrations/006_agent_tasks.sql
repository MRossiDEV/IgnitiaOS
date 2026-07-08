-- ============================================================================
-- MIGRATION: Agent Tasks (per-agent CRUD + execution logs)
-- Purpose:
--   Create a dedicated task manager table for AI agents in the admin panel.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status character varying(20) NOT NULL DEFAULT 'queued',
  priority character varying(20) NOT NULL DEFAULT 'medium',
  due_at timestamptz,
  execution_notes text,
  last_run_at timestamptz,
  last_run_result text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agent_tasks_status_check'
      AND conrelid = 'public.agent_tasks'::regclass
  ) THEN
    ALTER TABLE public.agent_tasks
      ADD CONSTRAINT agent_tasks_status_check
      CHECK (status IN ('queued', 'running', 'blocked', 'done', 'cancelled'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agent_tasks_priority_check'
      AND conrelid = 'public.agent_tasks'::regclass
  ) THEN
    ALTER TABLE public.agent_tasks
      ADD CONSTRAINT agent_tasks_priority_check
      CHECK (priority IN ('low', 'medium', 'high', 'critical'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_due_at ON public.agent_tasks(due_at);

CREATE OR REPLACE FUNCTION public.update_agent_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_agent_tasks_updated_at'
  ) THEN
    CREATE TRIGGER trg_agent_tasks_updated_at
    BEFORE UPDATE ON public.agent_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_agent_tasks_updated_at();
  END IF;
END;
$$;
