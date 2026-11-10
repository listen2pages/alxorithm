create table public.kitchen_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 300),
  unit text not null check (unit in ('kg', 'l', 'szt')),
  price numeric(14, 4) check (price >= 0),
  price_origin text not null default 'manual' check (price_origin in ('manual', 'import', 'estimate')),
  source_url text,
  checked_at timestamptz,
  revision uuid not null default gen_random_uuid(),
  unique (id, user_id),
  unique (user_id, name, unit)
);

create table public.kitchen_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_hash text not null,
  files jsonb not null,
  draft jsonb,
  sources jsonb not null default '[]',
  notes jsonb not null default '[]',
  search_suggestions jsonb not null default '[]',
  status text not null check (status in ('uploaded', 'processing', 'draft', 'approved', 'error')),
  error text,
  lease_until timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, file_hash),
  unique (id, user_id)
);

create table public.kitchen_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 300),
  category text not null default 'Inne',
  sale_price numeric(14, 4) check (sale_price >= 0),
  vat numeric(5, 2) check (vat between 0 and 100),
  prep_minutes numeric(10, 2) check (prep_minutes >= 0),
  status text not null default 'Aktywny',
  diet text not null default '',
  allergens text[] not null default '{}',
  description text not null default '',
  portions numeric(12, 4) not null default 1 check (portions > 0),
  estimated_fields text[] not null default '{}',
  revision uuid not null default gen_random_uuid(),
  source_import_id uuid,
  source_item_index integer,
  unique (id, user_id),
  unique (source_import_id, source_item_index),
  foreign key (source_import_id, user_id) references public.kitchen_imports(id, user_id)
);

create index kitchen_items_user_idx on public.kitchen_items(user_id);
create index kitchen_items_import_owner_idx on public.kitchen_items(source_import_id, user_id);

create table public.kitchen_recipe_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  dish_id uuid not null,
  ingredient_id uuid not null,
  quantity numeric(14, 4) not null check (quantity >= 0),
  unit text not null check (unit in ('g', 'kg', 'ml', 'l', 'szt')),
  foreign key (dish_id, user_id) references public.kitchen_items(id, user_id) on delete cascade,
  foreign key (ingredient_id, user_id) references public.kitchen_ingredients(id, user_id),
  unique (dish_id, ingredient_id)
);

create index kitchen_recipe_owner_idx on public.kitchen_recipe_lines(user_id, dish_id);
create index kitchen_recipe_ingredient_idx on public.kitchen_recipe_lines(ingredient_id, user_id);
create index kitchen_recipe_dish_owner_idx on public.kitchen_recipe_lines(dish_id, user_id);

alter table public.kitchen_items enable row level security;
alter table public.kitchen_ingredients enable row level security;
alter table public.kitchen_recipe_lines enable row level security;
alter table public.kitchen_imports enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['kitchen_items', 'kitchen_ingredients', 'kitchen_recipe_lines', 'kitchen_imports'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
    execute format(
      'create policy kitchen_owner on public.%I for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.subscriptions s where s.user_id = (select auth.uid()) and s.status in (''active'', ''trialing''))) with check ((select auth.uid()) = user_id and exists (select 1 from public.subscriptions s where s.user_id = (select auth.uid()) and s.status in (''active'', ''trialing'')))',
      t
    );
  end loop;
end $$;

create function public.kitchen_check_units()
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
    from public.kitchen_ingredients
   where id = new.ingredient_id
     and user_id = new.user_id;

  if base is null or not (new.unit = base or (new.unit = 'g' and base = 'kg') or (new.unit = 'ml' and base = 'l')) then
    raise exception 'Niezgodne jednostki składnika.';
  end if;
  return new;
end $$;

create trigger kitchen_units
  before insert or update on public.kitchen_recipe_lines
  for each row execute function public.kitchen_check_units();

create function public.kitchen_save_dish(
  p_id uuid,
  p_revision uuid,
  p_dish jsonb,
  p_recipe jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  l jsonb;
begin
  if auth.uid() is null then
    raise exception 'Brak logowania';
  end if;

  if p_id is null then
    insert into public.kitchen_items (
      user_id, name, category, sale_price, vat, prep_minutes,
      status, diet, allergens, description, portions, estimated_fields
    )
    values (
      auth.uid(),
      p_dish->>'name',
      p_dish->>'category',
      (p_dish->>'sale_price')::numeric,
      (p_dish->>'vat')::numeric,
      (p_dish->>'prep_minutes')::numeric,
      p_dish->>'status',
      p_dish->>'diet',
      array(select jsonb_array_elements_text(p_dish->'allergens')),
      p_dish->>'description',
      (p_dish->>'portions')::numeric,
      array(select jsonb_array_elements_text(p_dish->'estimated_fields'))
    )
    returning id into v_id;
  else
    update public.kitchen_items
       set name = p_dish->>'name',
           category = p_dish->>'category',
           sale_price = (p_dish->>'sale_price')::numeric,
           vat = (p_dish->>'vat')::numeric,
           prep_minutes = (p_dish->>'prep_minutes')::numeric,
           status = p_dish->>'status',
           diet = p_dish->>'diet',
           allergens = array(select jsonb_array_elements_text(p_dish->'allergens')),
           description = p_dish->>'description',
           portions = (p_dish->>'portions')::numeric,
           estimated_fields = array(select jsonb_array_elements_text(p_dish->'estimated_fields')),
           revision = gen_random_uuid()
     where id = p_id
       and user_id = auth.uid()
       and revision = p_revision
    returning id into v_id;

    if v_id is null then
      raise exception 'Pozycja zmieniła się. Odśwież widok.';
    end if;

    delete from public.kitchen_recipe_lines
     where dish_id = v_id
       and user_id = auth.uid();
  end if;

  for l in select * from jsonb_array_elements(p_recipe) loop
    insert into public.kitchen_recipe_lines (user_id, dish_id, ingredient_id, quantity, unit)
    values (
      auth.uid(),
      v_id,
      (l->>'ingredient_id')::uuid,
      (l->>'quantity')::numeric,
      l->>'unit'
    );
  end loop;

  return v_id;
end $$;

create function public.kitchen_accept_import(p_import_id uuid)
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
      insert into public.kitchen_ingredients (
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
        from public.kitchen_ingredients
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

revoke all on function public.kitchen_check_units() from public, anon, authenticated;
revoke all on function public.kitchen_save_dish(uuid, uuid, jsonb, jsonb) from public, anon;
revoke all on function public.kitchen_accept_import(uuid) from public, anon;
grant execute on function public.kitchen_save_dish(uuid, uuid, jsonb, jsonb) to authenticated;
grant execute on function public.kitchen_accept_import(uuid) to authenticated;
