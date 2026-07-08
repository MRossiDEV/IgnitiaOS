-- ============================================================================
-- MIGRATION: Normalize Agent Tools to Many-to-Many
-- Purpose:
--   1) Create a reusable tools catalog with UI metadata.
--   2) Create agent_tools join table for per-agent tool assignment.
--   3) Backfill agent_tools from legacy ai_agents.tools jsonb array.
--   4) Seed catalog from existing runtime tool registry ids.
--
-- Safe to re-run:
--   - Uses CREATE TABLE IF NOT EXISTS
--   - Uses CREATE INDEX IF NOT EXISTS
--   - Uses ON CONFLICT upserts
-- ============================================================================

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  color text,
  version text not null default '1.0.0',
  endpoint text,
  code text,
  schema jsonb,
  config jsonb,
  permissions jsonb,
  is_system boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_tools (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.ai_agents(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  enabled boolean not null default true,
  configuration jsonb,
  created_at timestamptz not null default now(),
  unique (agent_id, tool_id)
);

create index if not exists idx_agent_tools_agent_id on public.agent_tools(agent_id);
create index if not exists idx_agent_tools_tool_id on public.agent_tools(tool_id);
create index if not exists idx_agent_tools_enabled on public.agent_tools(enabled);
create index if not exists idx_tools_category on public.tools(category);
create index if not exists idx_tools_active_sort on public.tools(is_active, sort_order);

-- Keep updated_at current on tools updates.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'touch_tools_updated_at') then
    create trigger touch_tools_updated_at
    before update on public.tools
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- Seed base tools catalog with visual metadata.
insert into public.tools (slug, category, name, description, icon, color, sort_order, is_system, is_active)
values
  ('browser', 'Web', 'Browser', 'Browse websites like a real user.', 'Globe', 'cyan', 10, true, true),
  ('website-intelligence', 'Web', 'Website Intelligence', 'Analyze pages, metadata, stack, and signals.', 'Radar', 'sky', 20, true, true),
  ('website-recorder', 'Web', 'Website Recorder', 'Capture site interactions and recordings.', 'Camera', 'indigo', 30, true, true),
  ('security-scanner', 'Web', 'Security Scanner', 'Run lightweight web security checks.', 'Shield', 'red', 40, true, true),

  ('gpt', 'AI', 'GPT', 'General reasoning and generation.', 'Brain', 'emerald', 110, true, true),
  ('image-generation', 'AI', 'Image Generation', 'Generate and transform images.', 'Image', 'fuchsia', 120, true, true),
  ('vision', 'AI', 'Vision', 'Understand and inspect images.', 'ScanEye', 'violet', 130, true, true),
  ('speech', 'AI', 'Speech', 'Speech synthesis and transcription.', 'Mic', 'rose', 140, true, true),

  ('pdf', 'Documents', 'PDF', 'Read and generate PDF files.', 'FileText', 'amber', 210, true, true),
  ('word', 'Documents', 'Word', 'Read and generate DOCX files.', 'FileType', 'blue', 220, true, true),
  ('excel', 'Documents', 'Excel', 'Read and generate spreadsheet files.', 'Sheet', 'green', 230, true, true),

  ('google', 'Research', 'Google', 'Search Google and collect findings.', 'Search', 'yellow', 310, true, true),
  ('reddit', 'Research', 'Reddit', 'Search and summarize Reddit discussions.', 'MessageCircle', 'orange', 320, true, true),
  ('linkedin', 'Research', 'LinkedIn', 'Research companies and professionals.', 'Briefcase', 'blue', 330, true, true),
  ('youtube', 'Research', 'YouTube', 'Search and summarize video content.', 'PlayCircle', 'red', 340, true, true),

  ('automation', 'Automation', 'Automation', 'Trigger and orchestrate automated tasks.', 'Zap', 'teal', 410, true, true),
  ('memory', 'Knowledge', 'Memory', 'Persist and retrieve contextual memory.', 'Database', 'slate', 510, true, true),
  ('reports', 'Documents', 'Reports', 'Generate final reports and summaries.', 'FileBarChart', 'purple', 240, true, true)
on conflict (slug) do update
set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_system = excluded.is_system,
  is_active = excluded.is_active,
  updated_at = now();

-- Add legacy runtime slugs if they do not exist yet.
insert into public.tools (slug, category, name, description, icon, color, sort_order, is_system, is_active)
select
  legacy.slug,
  legacy.category,
  legacy.name,
  legacy.description,
  legacy.icon,
  legacy.color,
  legacy.sort_order,
  true,
  true
from (
  values
    ('playwright', 'Web', 'Playwright', 'Full browser automation.', 'Monitor', 'blue', 50),
    ('firecrawl', 'Web', 'Firecrawl', 'Extract structured website data.', 'Globe2', 'cyan', 60),
    ('tavily', 'Research', 'Tavily Search', 'AI powered web search.', 'SearchCheck', 'amber', 350),
    ('ocr', 'AI', 'OCR', 'Extract text from images.', 'ScanText', 'violet', 150),
    ('terminal', 'Automation', 'Terminal', 'Execute shell commands.', 'TerminalSquare', 'zinc', 420),
    ('python', 'Automation', 'Python', 'Execute Python code.', 'Code2', 'yellow', 430),
    ('supabase', 'Database', 'Supabase', 'Query Supabase projects.', 'DatabaseZap', 'emerald', 610),
    ('postgres', 'Database', 'PostgreSQL', 'Run SQL queries.', 'Database', 'sky', 620),
    ('redis', 'Database', 'Redis', 'Cache and queue operations.', 'HardDrive', 'red', 630),
    ('filesystem', 'Documents', 'Filesystem', 'Read and write files.', 'FolderOpen', 'slate', 250),
    ('email', 'Communication', 'Email', 'Send and manage emails.', 'Mail', 'blue', 710),
    ('slack', 'Communication', 'Slack', 'Send Slack notifications.', 'MessageSquare', 'purple', 720),
    ('docker', 'Infrastructure', 'Docker', 'Run containers and tasks.', 'Boxes', 'cyan', 810),
    ('queue', 'Infrastructure', 'Queue', 'Queue background jobs.', 'ListChecks', 'indigo', 820),
    ('webhook', 'Infrastructure', 'Webhook', 'Receive and dispatch webhook events.', 'Webhook', 'emerald', 830)
) as legacy(slug, category, name, description, icon, color, sort_order)
where not exists (
  select 1 from public.tools t where t.slug = legacy.slug
);

-- Backfill join table from legacy ai_agents.tools json array.
insert into public.agent_tools (agent_id, tool_id, enabled)
select
  a.id as agent_id,
  t.id as tool_id,
  true as enabled
from public.ai_agents a
cross join lateral jsonb_array_elements_text(coalesce(a.tools, '[]'::jsonb)) as jt(tool_slug)
join public.tools t on t.slug = jt.tool_slug
on conflict (agent_id, tool_id) do nothing;
