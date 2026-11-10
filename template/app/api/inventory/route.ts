import { requestSettings } from '@/utils/global-settings';
import { NextRequest } from 'next/server';
import {
  context,
  json,
  failure,
  HttpError,
  readAll,
  ownsUpload,
  signWorkspaceImages,
  invalidateWorkspaceImage,
} from '@/utils/workspace/server';
import { normalizePurchase, type InventoryItem } from '@/utils/inventory/math';
import { text } from '@/utils/kitchen/validate';
import { today, validDate } from '@/utils/workspace/dates';
import { validPeriod } from '@/utils/panel/types';

export async function GET() {
  try {
    const { supabase, userId } = await context();
    const [items, movements] = await Promise.all([
      readAll((a, b) =>
        supabase.from('inventory_items').select('*').eq('user_id', userId).order('id').range(a, b),
      ),
      readAll((a, b) =>
        supabase
          .from('inventory_movements')
          .select('*')
          .eq('user_id', userId)
          .order('occurred_on', { ascending: false })
          .order('id')
          .range(a, b),
      ),
    ]);
    const signedUrls = await signWorkspaceImages(
      supabase,
      userId,
      items.map(i => i.image_path),
    );
    return json({
      userId,
      items: items.map(i => ({
        ...i,
        image_url: (i.image_path && signedUrls.get(i.image_path)) || null,
      })),
      movements,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await context();
    const body = await request.json();
    if (body.action === 'movement') {
      if (
        !validDate(body.date) ||
        !validPeriod(body.date.slice(0, 7)) ||
        body.date > today(requestSettings(request).timeZone)
      ) {
        throw new HttpError('Wybierz datę z lat 2025–2027, nie późniejszą niż dziś.');
      }
      if (
        !['order', 'use', 'waste', 'adjustment'].includes(body.kind) ||
        !Number.isFinite(body.quantity) ||
        !body.quantity
      ) {
        throw new HttpError('Sprawdź rodzaj i ilość ruchu.');
      }
      const { data, error } = await supabase.rpc('inventory_record_movement', {
        p_item: body.item_id,
        p_request: body.request_id,
        p_kind: body.kind,
        p_date: body.date,
        p_quantity: body.quantity,
        p_notes: text(body.notes || '', 'Notatka', 4000),
      });
      if (error) {
        throw new HttpError(
          'Nie zapisano historii. Sprawdź cenę, datę i ilość. Odśwież widok.',
          409,
        );
      }
      return json({ id: data });
    }

    const i = body.item as InventoryItem;
    if (!i || !['food', 'drink', 'cleaning', 'other'].includes(i.kind)) {
      throw new HttpError('Wybierz kategorię pozycji.');
    }
    if (i.purchase_price === null) throw new HttpError('Podaj cenę zakupu.');
    const normalized = normalizePurchase(i);
    const name = text(i.name, 'Nazwa');
    if (!name) throw new HttpError('Podaj nazwę.');
    if (i.image_path && !ownsUpload(i.image_path, userId)) {
      throw new HttpError('Nieprawidłowe zdjęcie.');
    }

    let previousImage: string | null = null;
    if (i.id) {
      const { data: existing } = await supabase
        .from('inventory_items')
        .select('image_path')
        .eq('id', i.id)
        .eq('user_id', userId)
        .maybeSingle();
      previousImage = existing?.image_path || null;
    }

    const nextImage = i.image_path || null;
    const values = {
      name,
      kind: i.kind,
      purchase_price: i.purchase_price,
      purchase_quantity: i.purchase_quantity,
      purchase_unit: i.purchase_unit,
      units_per_pack: i.units_per_pack,
      content_quantity: i.content_quantity,
      content_unit: i.content_unit,
      ...normalized,
      supplier_name: text(i.supplier_name, 'Dostawca'),
      supplier_contact: text(i.supplier_contact, 'Kontakt'),
      description: text(i.description, 'Opis', 4000),
      notes: text(i.notes, 'Notatki', 4000),
      image_path: nextImage,
      price_origin: 'manual',
      source_url: null,
      checked_at: null,
    };
    const q = i.id
      ? supabase
          .from('inventory_items')
          .update(values)
          .eq('id', i.id)
          .eq('user_id', userId)
          .eq('revision', i.revision)
      : supabase.from('inventory_items').insert({ ...values, user_id: userId });
    const { data, error } = await q.select('id').maybeSingle();
    if (error || !data) {
      throw new HttpError(
        'Nie zapisano pozycji. Sprawdź duplikat nazwy, jednostki powiązanych receptur lub odśwież dane.',
        409,
      );
    }
    if (previousImage && previousImage !== nextImage && ownsUpload(previousImage, userId)) {
      invalidateWorkspaceImage(previousImage);
      await supabase.storage.from('workspace-images').remove([previousImage]);
    }
    return json({ id: data.id });
  } catch (error) {
    return failure(error);
  }
}
