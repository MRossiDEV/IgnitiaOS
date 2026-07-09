-- ============================================================================
-- MIGRATION: Social Account Settings
-- Purpose:
--   Persist editable social account profile info and per-platform settings
--   for the Marketing Command Center.
-- ============================================================================

create table if not exists public.social_account_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  platform text not null,
  connected boolean not null default false,
  account_label text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform)
);

create index if not exists idx_social_account_settings_platform
  on public.social_account_settings(platform);

create index if not exists idx_social_account_settings_org
  on public.social_account_settings(organization_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'social_account_settings_platform_check'
      and conrelid = 'public.social_account_settings'::regclass
  ) then
    alter table public.social_account_settings
      add constraint social_account_settings_platform_check
      check (platform in (
        'instagram',
        'facebook',
        'linkedin',
        'x',
        'tiktok',
        'youtube'
      ));
  end if;
end $$;

update public.social_account_settings
set settings = '{}'::jsonb
where jsonb_typeof(settings) is distinct from 'object';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'social_account_settings_settings_object_check'
      and conrelid = 'public.social_account_settings'::regclass
  ) then
    alter table public.social_account_settings
      add constraint social_account_settings_settings_object_check
      check (jsonb_typeof(settings) = 'object');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'touch_social_account_settings_updated_at'
  ) then
    create trigger touch_social_account_settings_updated_at
    before update on public.social_account_settings
    for each row execute function public.update_updated_at_column();
  end if;
end $$;
