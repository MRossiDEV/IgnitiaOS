-- ============================================================================
-- MIGRATION: Social Account Auth Fields
-- Purpose:
--   Store per-platform posting credentials used by backend publishers.
-- ============================================================================

alter table public.social_account_settings
  add column if not exists auth_type text default 'token',
  add column if not exists auth_username text,
  add column if not exists auth_secret text,
  add column if not exists auth_updated_at timestamptz;

update public.social_account_settings
set auth_type = 'token'
where auth_type is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'social_account_settings_auth_type_check'
      and conrelid = 'public.social_account_settings'::regclass
  ) then
    alter table public.social_account_settings
      add constraint social_account_settings_auth_type_check
      check (auth_type in ('oauth', 'token', 'password'));
  end if;
end $$;

create index if not exists idx_social_account_settings_auth_type
  on public.social_account_settings(auth_type);
