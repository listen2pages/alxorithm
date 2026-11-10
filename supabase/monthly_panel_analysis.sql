create table public.panel_months (
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period ~ '^202[567]-(0[1-9]|1[0-2])$'),
  revision uuid not null default gen_random_uuid(),
  files jsonb not null default '{}'::jsonb check (jsonb_typeof(files) = 'object'),
  mapping jsonb,
  report jsonb,
  report_revision uuid,
  status text not null default 'idle' check (status in ('idle','mapping','mapped','analyzing','ready','error')),
  error text,
  lease_id uuid,
  lease_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, period)
);
alter table public.panel_months enable row level security;
grant select, insert, update, delete on public.panel_months to authenticated;
revoke all on public.panel_months from anon;
create policy panel_months_owner on public.panel_months for all to authenticated
using ((select auth.uid()) = user_id and exists (select 1 from public.subscriptions s where s.user_id=(select auth.uid()) and s.status in ('active','trialing')))
with check ((select auth.uid()) = user_id and exists (select 1 from public.subscriptions s where s.user_id=(select auth.uid()) and s.status in ('active','trialing')));
create index if not exists subscriptions_user_status_idx on public.subscriptions (user_id, status);
comment on table public.panel_months is 'One monthly CSV pair, reviewed Gemini mapping and deterministic dashboard snapshot per subscriber. No sample data.';
