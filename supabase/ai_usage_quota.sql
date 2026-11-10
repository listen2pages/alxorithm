-- Daily per-user AI & Google Search Grounding quota enforcement.
-- Protects Gemini and Search Grounding budgets against automated loops,
-- applying a stricter daily cap while a subscription is in 'trialing' status.

create table if not exists public.ai_usage_quotas (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default (now() at time zone 'utc')::date,
  kind text not null check (kind in ('panel_map', 'kitchen_analyze', 'kitchen_estimate')),
  calls integer not null default 0 check (calls >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date, kind)
);

alter table public.ai_usage_quotas enable row level security;
revoke all on public.ai_usage_quotas from anon;
grant select, insert, update on public.ai_usage_quotas to authenticated;

create policy ai_usage_quotas_owner
  on public.ai_usage_quotas for all to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status in ('active', 'trialing')
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status in ('active', 'trialing')
    )
  );

create or replace function public.consume_ai_quota(
  p_kind text,
  p_daily_limit integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_status text;
  v_effective_limit integer;
  v_calls integer;
begin
  if v_user is null then
    raise exception 'Brak logowania';
  end if;

  select s.status
    into v_status
    from public.subscriptions s
   where s.user_id = v_user
     and s.status in ('active', 'trialing')
   limit 1;

  if v_status is null then
    return false;
  end if;

  -- Trialing accounts receive half the standard daily quota (at least 5 calls).
  v_effective_limit := case
    when v_status = 'trialing' then greatest(5, p_daily_limit / 2)
    else p_daily_limit
  end;

  insert into public.ai_usage_quotas (user_id, usage_date, kind, calls, updated_at)
  values (v_user, (now() at time zone 'utc')::date, p_kind, 1, now())
  on conflict (user_id, usage_date, kind) do update
    set calls = public.ai_usage_quotas.calls + 1,
        updated_at = now()
  where public.ai_usage_quotas.calls < v_effective_limit
  returning calls into v_calls;

  return v_calls is not null;
end;
$$;

revoke all on function public.consume_ai_quota(text, integer) from public, anon;
grant execute on function public.consume_ai_quota(text, integer) to authenticated;
