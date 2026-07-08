-- ============================================================================
-- MIGRATION: Agent Settings JSON
-- Purpose:
--   Add a flexible settings document to public.ai_agents so the single-agent
--   settings workspace can persist richer identity, prompt, permissions,
--   memory, collaboration, and runtime configuration.
--
-- Safe to re-run: guarded with IF NOT EXISTS and null backfill.
-- ============================================================================

ALTER TABLE public.ai_agents
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

UPDATE public.ai_agents
SET settings = '{}'::jsonb
WHERE settings IS NULL;