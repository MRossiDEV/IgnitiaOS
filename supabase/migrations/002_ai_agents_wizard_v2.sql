-- ============================================================================
-- MIGRATION: AI Agents Wizard v2 Fields
-- Purpose:
--   Extend public.ai_agents to store all selections/configurations collected
--   by the new multi-step agent wizard.
--
-- Safe to re-run: uses IF NOT EXISTS and guarded DO blocks.
-- ============================================================================

-- Add new columns used by wizard v2
ALTER TABLE public.ai_agents
  ADD COLUMN IF NOT EXISTS slug character varying(255),
  ADD COLUMN IF NOT EXISTS version character varying(50) DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS provider character varying(100),
  ADD COLUMN IF NOT EXISTS reasoning character varying(20),
  ADD COLUMN IF NOT EXISTS response_format character varying(30),
  ADD COLUMN IF NOT EXISTS visibility character varying(20) DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tool_configs jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS workflow jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personality_preset character varying(30);

-- Backfill existing rows for JSON columns and common defaults
UPDATE public.ai_agents
SET
  tools = COALESCE(tools, '[]'::jsonb),
  tool_configs = COALESCE(tool_configs, '{}'::jsonb),
  workflow = COALESCE(workflow, '[]'::jsonb),
  visibility = COALESCE(visibility, 'internal'),
  version = COALESCE(version, '1.0.0')
WHERE
  tools IS NULL
  OR tool_configs IS NULL
  OR workflow IS NULL
  OR visibility IS NULL
  OR version IS NULL;

-- Optional shape/enum checks for controlled fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ai_agents_reasoning_check'
      AND conrelid = 'public.ai_agents'::regclass
  ) THEN
    ALTER TABLE public.ai_agents
      ADD CONSTRAINT ai_agents_reasoning_check
      CHECK (reasoning IS NULL OR reasoning IN ('low', 'medium', 'high'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ai_agents_response_format_check'
      AND conrelid = 'public.ai_agents'::regclass
  ) THEN
    ALTER TABLE public.ai_agents
      ADD CONSTRAINT ai_agents_response_format_check
      CHECK (
        response_format IS NULL
        OR response_format IN ('Markdown', 'JSON', 'HTML', 'Plain Text')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ai_agents_visibility_check'
      AND conrelid = 'public.ai_agents'::regclass
  ) THEN
    ALTER TABLE public.ai_agents
      ADD CONSTRAINT ai_agents_visibility_check
      CHECK (visibility IS NULL OR visibility IN ('private', 'internal', 'public'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ai_agents_personality_preset_check'
      AND conrelid = 'public.ai_agents'::regclass
  ) THEN
    ALTER TABLE public.ai_agents
      ADD CONSTRAINT ai_agents_personality_preset_check
      CHECK (
        personality_preset IS NULL
        OR personality_preset IN ('analyst', 'consultant', 'engineer', 'marketing')
      );
  END IF;
END $$;

-- Helpful indexes for admin listing/filtering
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON public.ai_agents(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_provider ON public.ai_agents(provider);
CREATE INDEX IF NOT EXISTS idx_ai_agents_slug ON public.ai_agents(slug);

-- Ensure updated_at auto-maintenance trigger exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_ai_agents_updated_at'
  ) THEN
    CREATE TRIGGER update_ai_agents_updated_at
    BEFORE UPDATE ON public.ai_agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
