-- Applied after inventory_and_staff.sql as workspace_history_integrity.
-- Keep movement units compatible with the current item and retain valid shifts
-- using explicit idempotent CREATE OR REPLACE FUNCTION definitions.

create or replace function public.inventory_normalize()
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

  if tg_op = 'UPDATE' and old.unit <> base and (
    exists (
      select 1
        from public.kitchen_recipe_lines
       where ingredient_id = old.id
         and user_id = old.user_id
    )
    or exists (
      select 1
        from public.inventory_movements
       where item_id = old.id
         and user_id = old.user_id
    )
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

create or replace function public.staff_save_member(
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
    if exists (
      select 1
        from public.staff_shifts
       where member_id = p_id
         and user_id = auth.uid()
         and date < (p_member->>'employed_on')::date
    ) then
      raise exception 'Data zatrudnienia nie może wykluczyć istniejących zmian';
    end if;

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
