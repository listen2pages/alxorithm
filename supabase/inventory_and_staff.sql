-- Phase 9: preserve ingredient IDs and recipe links while making inventory the shared catalogue.
alter table public.kitchen_ingredients rename to inventory_items;
alter table public.inventory_items drop constraint kitchen_ingredients_unit_check;
alter table public.inventory_items add constraint inventory_base_unit check (unit in ('kg', 'l', 'szt', 'm'));

alter table public.inventory_items
  add column purchase_price numeric(14, 4),
  add column purchase_quantity numeric(14, 4) not null default 1 check (purchase_quantity > 0),
  add column purchase_unit text not null default 'szt' check (purchase_unit in ('mg', 'g', 'kg', 'ml', 'cl', 'dl', 'l', 'szt', 'cm', 'm', 'opak')),
  add column units_per_pack numeric(14, 4) not null default 1 check (units_per_pack > 0),
  add column content_quantity numeric(14, 4) not null default 1 check (content_quantity > 0),
  add column content_unit text not null default 'szt' check (content_unit in ('mg', 'g', 'kg', 'ml', 'cl', 'dl', 'l', 'szt', 'cm', 'm')),
  add column purchase_base_quantity numeric not null default 1,
  add column kind text not null default 'food' check (kind in ('food', 'drink', 'cleaning', 'other')),
  add column supplier_name text not null default '',
  add column supplier_contact text not null default '',
  add column image_path text,
  add column description text not null default '',
  add column notes text not null default '',
  add column updated_at timestamptz not null default now();

update public.inventory_items
   set purchase_price = price,
       purchase_unit = unit,
       content_unit = unit;

create function public.inventory_measure_factor(u text)
returns numeric
language sql
immutable
security invoker
set search_path = ''
as $$
  select case u
    when 'mg' then 0.000001
    when 'g'  then 0.001
    when 'ml' then 0.001
    when 'cl' then 0.01
    when 'dl' then 0.1
    when 'cm' then 0.01
    when 'kg' then 1
    when 'l'  then 1
    when 'm'  then 1
    when 'szt' then 1
    else null
  end;
$$;

create function public.inventory_normalize()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  measure text;
  quantity numeric;
  base text;
begin
  if tg_op = 'INSERT' and new.purchase_price is null then
    new.purchase_price := new.price;
    new.purchase_unit := new.unit;
    new.purchase_quantity := 1;
  end if;

  measure := case when new.purchase_unit = 'opak' then new.content_unit else new.purchase_unit end;
  quantity := new.purchase_quantity
    * case when new.purchase_unit = 'opak' then new.units_per_pack * new.content_quantity else 1 end
    * public.inventory_measure_factor(measure);
  base := case
    when measure in ('mg', 'g', 'kg') then 'kg'
    when measure in ('ml', 'cl', 'dl', 'l') then 'l'
    when measure in ('cm', 'm') then 'm'
    else 'szt'
  end;

  if quantity is null or quantity <= 0 or new.purchase_price < 0 then
    raise exception 'Nieprawidłowa cena lub jednostka';
  end if;

  if tg_op = 'UPDATE' and old.unit <> base and exists (
    select 1
      from public.kitchen_recipe_lines
     where ingredient_id = old.id
       and user_id = old.user_id
  ) then
    raise exception 'Zmień najpierw jednostki w powiązanych recepturach';
  end if;

  new.unit := base;
  new.price := new.purchase_price / quantity;
  new.purchase_base_quantity := quantity;
  new.revision := gen_random_uuid();
  new.updated_at := now();
  return new;
end $$;

create trigger inventory_normalized_price
  before insert or update on public.inventory_items
  for each row execute function public.inventory_normalize();

-- Explicit function replacement after renaming kitchen_ingredients -> inventory_items.
create or replace function public.kitchen_accept_import(p_import_id uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  draft jsonb;
  state text;
  d jsonb;
  l jsonb;
  v_dish uuid;
  v_ing uuid;
  n integer := 0;
begin
  select i.draft, i.status
    into draft, state
    from public.kitchen_imports i
   where id = p_import_id
     and user_id = auth.uid()
   for update;

  if state = 'approved' then
    return 0;
  end if;
  if state is distinct from 'draft' then
    raise exception 'Import nie jest gotowy.';
  end if;

  for d in select * from jsonb_array_elements(draft) loop
    v_dish := public.kitchen_save_dish(null, null, d, '[]'::jsonb);
    update public.kitchen_items
       set source_import_id = p_import_id,
           source_item_index = n
     where id = v_dish
       and user_id = auth.uid();

    for l in select * from jsonb_array_elements(d->'recipe') loop
      insert into public.inventory_items (
        user_id, name, unit, price, price_origin, source_url, checked_at
      )
      values (
        auth.uid(),
        l->>'name',
        l->>'price_unit',
        (l->>'price')::numeric,
        l->>'price_origin',
        l->>'source_url',
        (l->>'checked_at')::timestamptz
      )
      on conflict (user_id, name, unit) do nothing;

      select id
        into v_ing
        from public.inventory_items
       where user_id = auth.uid()
         and name = l->>'name'
         and unit = l->>'price_unit';

      insert into public.kitchen_recipe_lines (user_id, dish_id, ingredient_id, quantity, unit)
      values (auth.uid(), v_dish, v_ing, (l->>'quantity')::numeric, l->>'unit');
    end loop;

    n := n + 1;
  end loop;

  update public.kitchen_imports
     set status = 'approved'
   where id = p_import_id
     and user_id = auth.uid();

  return n;
end $$;

alter table public.kitchen_recipe_lines drop constraint kitchen_recipe_lines_unit_check;
alter table public.kitchen_recipe_lines add constraint recipe_measure check (unit in ('mg', 'g', 'kg', 'ml', 'cl', 'dl', 'l', 'szt', 'cm', 'm'));

create or replace function public.kitchen_check_units()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  base text;
begin
  select unit
    into base
    from public.inventory_items
   where id = new.ingredient_id
     and user_id = new.user_id;

  if base is null or not (
    new.unit = base
    or (new.unit in ('mg', 'g') and base = 'kg')
    or (new.unit in ('ml', 'cl', 'dl') and base = 'l')
    or (new.unit = 'cm' and base = 'm')
  ) then
    raise exception 'Niezgodne jednostki składnika.';
  end if;
  return new;
end $$;

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id uuid not null,
  request_id uuid not null,
  kind text not null check (kind in ('order', 'use', 'waste', 'adjustment')),
  occurred_on date not null check (occurred_on between '2025-01-01' and '2027-12-31'),
  quantity numeric(14, 4) not null,
  base_quantity numeric not null,
  base_unit text not null,
  cost numeric(14, 2) not null,
  package_label text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  foreign key (item_id, user_id) references public.inventory_items(id, user_id),
  unique (user_id, request_id)
);

create index inventory_movements_item_owner on public.inventory_movements(item_id, user_id, occurred_on);
create index inventory_movements_owner_date on public.inventory_movements(user_id, occurred_on);

create function public.inventory_record_movement(
  p_item uuid,
  p_request uuid,
  p_kind text,
  p_date date,
  p_quantity numeric,
  p_notes text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item public.inventory_items;
  result uuid;
  amount numeric;
  value numeric;
  label text;
begin
  select id
    into result
    from public.inventory_movements
   where user_id = auth.uid()
     and request_id = p_request;

  if result is not null then
    return result;
  end if;

  select *
    into item
    from public.inventory_items
   where id = p_item
     and user_id = auth.uid()
   for update;

  if item.id is null then
    raise exception 'Nie znaleziono pozycji';
  end if;
  if p_quantity = 0 or abs(p_quantity) > 1000000 or (p_kind <> 'adjustment' and p_quantity < 0) then
    raise exception 'Nieprawidłowa ilość';
  end if;
  if item.price is null then
    raise exception 'Uzupełnij cenę pozycji w magazynie';
  end if;

  amount := case when p_kind = 'order' then p_quantity * item.purchase_base_quantity else p_quantity end;
  value := case when p_kind = 'order' then p_quantity * item.purchase_price else amount * item.price end;
  label := case
    when p_kind = 'order' then
      item.purchase_quantity || ' ' || item.purchase_unit ||
      case when item.purchase_unit = 'opak' then ' × ' || item.units_per_pack || ' × ' || item.content_quantity || ' ' || item.content_unit else '' end
    else item.unit
  end;

  insert into public.inventory_movements (
    user_id, item_id, request_id, kind, occurred_on,
    quantity, base_quantity, base_unit, cost, package_label, notes
  )
  values (
    auth.uid(), p_item, p_request, p_kind, p_date,
    p_quantity, amount, item.unit, round(value, 2), label, p_notes
  )
  returning id into result;

  return result;
end $$;

-- Phase 10: employee profiles, dated pay rates and daily shifts.
create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 300),
  position text not null,
  category text not null,
  employed_on date not null,
  image_path text,
  notes text not null default '',
  revision uuid not null default gen_random_uuid(),
  unique (id, user_id)
);

create index staff_members_owner on public.staff_members(user_id);

create table public.staff_pay_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  member_id uuid not null,
  effective_on date not null,
  pay_type text not null check (pay_type in ('hourly', 'monthly')),
  rate numeric(14, 2) not null check (rate >= 0),
  foreign key (member_id, user_id) references public.staff_members(id, user_id) on delete cascade,
  unique (member_id, effective_on)
);

create index staff_pay_owner on public.staff_pay_rates(user_id, member_id);
create index staff_pay_member_owner on public.staff_pay_rates(member_id, user_id);

create table public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  member_id uuid not null,
  date date not null check (date between '2025-01-01' and '2027-12-31'),
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 0 check (break_minutes >= 0 and break_minutes < 1440),
  notes text not null default '',
  foreign key (member_id, user_id) references public.staff_members(id, user_id) on delete cascade,
  unique (member_id, date)
);

create index staff_shifts_owner_date on public.staff_shifts(user_id, date);
create index staff_shifts_member_owner on public.staff_shifts(member_id, user_id);

create function public.staff_save_member(
  p_id uuid,
  p_revision uuid,
  p_member jsonb,
  p_pay jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result uuid;
begin
  if p_id is null then
    insert into public.staff_members (user_id, name, position, category, employed_on, image_path, notes)
    values (
      auth.uid(),
      p_member->>'name',
      p_member->>'position',
      p_member->>'category',
      (p_member->>'employed_on')::date,
      p_member->>'image_path',
      p_member->>'notes'
    )
    returning id into result;
  else
    update public.staff_members
       set name = p_member->>'name',
           position = p_member->>'position',
           category = p_member->>'category',
           employed_on = (p_member->>'employed_on')::date,
           image_path = p_member->>'image_path',
           notes = p_member->>'notes',
           revision = gen_random_uuid()
     where id = p_id
       and user_id = auth.uid()
       and revision = p_revision
    returning id into result;

    if result is null then
      raise exception 'Dane zmieniły się. Odśwież widok.';
    end if;
  end if;

  if (p_pay->>'effective_on')::date < (p_member->>'employed_on')::date then
    raise exception 'Stawka nie może obowiązywać przed zatrudnieniem';
  end if;

  insert into public.staff_pay_rates (user_id, member_id, effective_on, pay_type, rate)
  values (
    auth.uid(),
    result,
    (p_pay->>'effective_on')::date,
    p_pay->>'pay_type',
    (p_pay->>'rate')::numeric
  )
  on conflict (member_id, effective_on) do update
    set pay_type = excluded.pay_type,
        rate = excluded.rate;

  return result;
end $$;

create function public.staff_save_shifts(
  p_member uuid,
  p_shifts jsonb,
  p_replace boolean
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  person public.staff_members;
  s jsonb;
  d date;
  st time;
  en time;
  duration integer;
  start_date date;
  end_date date;
  n integer := 0;
  span tsrange;
begin
  select *
    into person
    from public.staff_members
   where id = p_member
     and user_id = auth.uid()
   for update;

  if person.id is null then
    raise exception 'Nie znaleziono pracownika';
  end if;
  if jsonb_array_length(p_shifts) not between 1 and 93 then
    raise exception 'Zakres do trzech miesięcy';
  end if;

  select min((x->>'date')::date), max((x->>'date')::date)
    into start_date, end_date
    from jsonb_array_elements(p_shifts) x;

  if end_date >= start_date + interval '3 months' then
    raise exception 'Zakres do trzech miesięcy';
  end if;

  if p_replace then
    delete from public.staff_shifts
     where member_id = p_member
       and user_id = auth.uid()
       and date in (select (x->>'date')::date from jsonb_array_elements(p_shifts) x);
  end if;

  for s in select * from jsonb_array_elements(p_shifts) loop
    d := (s->>'date')::date;
    st := (s->>'start_time')::time;
    en := (s->>'end_time')::time;
    duration := extract(epoch from (en - st)) / 60;
    if duration < 0 then
      duration := duration + 1440;
    end if;

    if d < person.employed_on or duration <= 0 or (s->>'break_minutes')::integer >= duration then
      raise exception 'Nieprawidłowa zmiana, przerwa lub data zatrudnienia';
    end if;

    span := tsrange(
      d + st,
      d + en + case when en < st then interval '1 day' else interval '0' end,
      '[)'
    );

    if exists (
      select 1
        from public.staff_shifts old
       where old.member_id = p_member
         and old.user_id = auth.uid()
         and tsrange(
               old.date + old.start_time,
               old.date + old.end_time + case when old.end_time < old.start_time then interval '1 day' else interval '0' end,
               '[)'
             ) && span
    ) then
      raise exception 'Zmiany pracownika nakładają się';
    end if;

    insert into public.staff_shifts (user_id, member_id, date, start_time, end_time, break_minutes, notes)
    values (auth.uid(), p_member, d, st, en, (s->>'break_minutes')::integer, s->>'notes');
    n := n + 1;
  end loop;

  return n;
end $$;

do $$
declare
  t text;
begin
  foreach t in array array['inventory_movements', 'staff_members', 'staff_pay_rates', 'staff_shifts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy workspace_owner on public.%I for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.subscriptions where user_id = (select auth.uid()) and status in (''active'', ''trialing''))) with check ((select auth.uid()) = user_id and exists (select 1 from public.subscriptions where user_id = (select auth.uid()) and status in (''active'', ''trialing'')))',
      t
    );
  end loop;
end $$;

revoke all on function public.inventory_normalize() from public, anon, authenticated;
revoke all on function public.inventory_measure_factor(text) from public, anon;
revoke all on function public.inventory_record_movement(uuid, uuid, text, date, numeric, text) from public, anon;
revoke all on function public.staff_save_member(uuid, uuid, jsonb, jsonb) from public, anon;
revoke all on function public.staff_save_shifts(uuid, jsonb, boolean) from public, anon;

grant execute on function
  public.inventory_measure_factor(text),
  public.inventory_record_movement(uuid, uuid, text, date, numeric, text),
  public.staff_save_member(uuid, uuid, jsonb, jsonb),
  public.staff_save_shifts(uuid, jsonb, boolean)
to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-images', 'workspace-images', false, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy workspace_images_owner
  on storage.objects for all to authenticated
  using (
    bucket_id = 'workspace-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status in ('active', 'trialing')
    )
  )
  with check (
    bucket_id = 'workspace-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status in ('active', 'trialing')
    )
  );

do $$
declare
  t text;
begin
  foreach t in array array['inventory_items', 'inventory_movements', 'staff_members', 'staff_shifts', 'staff_pay_rates'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
