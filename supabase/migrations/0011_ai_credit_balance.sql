-- ======================================================
-- AI Credit Balance
-- supabase/migrations/0011_ai_credit_balance.sql
-- ======================================================
-- Singleton row tracking a user-set starting balance minus
-- cumulative AI spend (in the same USD-equivalent unit
-- lib/ai/core/tokenTracker.ts's estimateCost() returns).
-- increment_credit_consumption() is a single atomic UPDATE so
-- concurrent AI calls can't race each other on a read-then-write.

create table if not exists public.ai_credit_balance (
  id uuid not null default gen_random_uuid(),
  initial_amount numeric(14, 4) not null default 0,
  consumed_amount numeric(14, 4) not null default 0,
  updated_at timestamptz not null default now(),
  constraint ai_credit_balance_pkey primary key (id)
);

-- Seed the one singleton row this table is meant to hold.
insert into public.ai_credit_balance (id, initial_amount, consumed_amount)
values ('00000000-0000-0000-0000-000000000001', 0, 0)
on conflict (id) do nothing;

create or replace function public.increment_credit_consumption(
  p_id uuid,
  p_amount numeric
)
returns public.ai_credit_balance
language plpgsql
as $$
declare
  result public.ai_credit_balance;
begin
  update public.ai_credit_balance
  set consumed_amount = consumed_amount + p_amount,
      updated_at = now()
  where id = p_id
  returning * into result;

  return result;
end;
$$;
