-- ============================================================================
-- MIGRATION: AI Agents Accent Color
-- Purpose:
--   Add a dedicated accent color field that UI can fetch and render per agent.
--
-- Safe to re-run with IF NOT EXISTS and guarded constraints.
-- ============================================================================

alter table public.ai_agents
  add column if not exists accent_color text default '#22c55e';

update public.ai_agents
set accent_color = '#22c55e'
where accent_color is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ai_agents_accent_color_hex_check'
      and conrelid = 'public.ai_agents'::regclass
  ) then
    alter table public.ai_agents
      add constraint ai_agents_accent_color_hex_check
      check (
        accent_color is null
        or accent_color ~* '^#[0-9a-f]{6}$'
      );
  end if;
end $$;

create index if not exists idx_ai_agents_accent_color
  on public.ai_agents(accent_color);
