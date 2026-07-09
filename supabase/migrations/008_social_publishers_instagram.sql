-- ============================================================================
-- MIGRATION: Social Publishers + Instagram Queue
-- Purpose:
--   1) Store connected social accounts securely on the backend.
--   2) Persist AI-generated social drafts with approval and scheduling states.
--   3) Track publishing attempts and outcomes for auditability.
--   4) Seed publisher tools for multi-platform agent orchestration.
--
-- Safe to re-run with IF NOT EXISTS and ON CONFLICT guards.
-- ============================================================================

create table if not exists public.social_platform_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  platform text not null,
  account_id text not null,
  account_name text,
  facebook_page_id text,
  access_token text not null,
  token_expires_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, account_id)
);

create index if not exists idx_social_platform_connections_org
  on public.social_platform_connections(organization_id);

create index if not exists idx_social_platform_connections_platform
  on public.social_platform_connections(platform, is_active);

create table if not exists public.social_post_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  connection_id uuid not null references public.social_platform_connections(id) on delete cascade,
  platform text not null,
  mode text not null default 'manual_approval',
  status text not null default 'draft',
  title text,
  caption text not null,
  hashtags text[] not null default '{}'::text[],
  image_prompt text,
  image_url text,
  schedule_time timestamptz,
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  external_post_url text,
  external_payload jsonb,
  error_message text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_social_post_drafts_connection_status
  on public.social_post_drafts(connection_id, status);

create index if not exists idx_social_post_drafts_schedule
  on public.social_post_drafts(schedule_time)
  where status in ('approved', 'scheduled', 'pending_approval');

create index if not exists idx_social_post_drafts_platform_status
  on public.social_post_drafts(platform, status);

create table if not exists public.social_publish_events (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.social_post_drafts(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_social_publish_events_draft_id
  on public.social_publish_events(draft_id, created_at desc);

-- Constraints added in guarded blocks to avoid duplicate-constraint errors.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'social_platform_connections_platform_check'
      and conrelid = 'public.social_platform_connections'::regclass
  ) then
    alter table public.social_platform_connections
      add constraint social_platform_connections_platform_check
      check (platform in (
        'instagram',
        'facebook',
        'linkedin',
        'x',
        'tiktok',
        'pinterest',
        'youtube_community'
      ));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'social_post_drafts_mode_check'
      and conrelid = 'public.social_post_drafts'::regclass
  ) then
    alter table public.social_post_drafts
      add constraint social_post_drafts_mode_check
      check (mode in ('manual_approval', 'auto_publish'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'social_post_drafts_status_check'
      and conrelid = 'public.social_post_drafts'::regclass
  ) then
    alter table public.social_post_drafts
      add constraint social_post_drafts_status_check
      check (status in (
        'draft',
        'pending_approval',
        'approved',
        'scheduled',
        'publishing',
        'published',
        'failed',
        'cancelled'
      ));
  end if;
end $$;

-- Keep updated_at in sync on row updates.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'touch_social_platform_connections_updated_at') then
    create trigger touch_social_platform_connections_updated_at
    before update on public.social_platform_connections
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'touch_social_post_drafts_updated_at') then
    create trigger touch_social_post_drafts_updated_at
    before update on public.social_post_drafts
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- Seed tool catalog for publisher strategy.
insert into public.tools (slug, category, name, description, icon, color, sort_order, is_system, is_active)
values
  ('instagram-publisher', 'Social', 'Instagram Publisher', 'Publish approved image posts to Instagram Graph API.', 'Instagram', 'pink', 910, true, true),
  ('facebook-publisher', 'Social', 'Facebook Publisher', 'Publish social content to connected Facebook pages.', 'Facebook', 'blue', 920, true, true),
  ('linkedin-publisher', 'Social', 'LinkedIn Publisher', 'Publish social content to LinkedIn company pages.', 'Linkedin', 'sky', 930, true, true),
  ('x-publisher', 'Social', 'X Publisher', 'Publish content to X (Twitter) profiles.', 'AtSign', 'slate', 940, true, true),
  ('tiktok-publisher', 'Social', 'TikTok Publisher', 'Publish short-form content to TikTok accounts.', 'Music2', 'rose', 950, true, true),
  ('pinterest-publisher', 'Social', 'Pinterest Publisher', 'Publish pins to Pinterest boards.', 'Pin', 'red', 960, true, true),
  ('youtube-community-publisher', 'Social', 'YouTube Community Publisher', 'Publish updates to YouTube Community.', 'Youtube', 'red', 970, true, true)
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
