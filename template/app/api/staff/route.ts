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
import { text, numeric } from '@/utils/kitchen/validate';
import { validDate, datesBetween } from '@/utils/workspace/dates';
import { validPeriod } from '@/utils/panel/types';
import { shiftHours, type Shift } from '@/utils/staff/math';

export async function GET() {
  try {
    const { supabase, userId } = await context();
    const [members, shifts, rates] = await Promise.all([
      readAll((a, b) =>
        supabase.from('staff_members').select('*').eq('user_id', userId).order('id').range(a, b),
      ),
      readAll((a, b) =>
        supabase.from('staff_shifts').select('*').eq('user_id', userId).order('id').range(a, b),
      ),
      readAll((a, b) =>
        supabase.from('staff_pay_rates').select('*').eq('user_id', userId).order('id').range(a, b),
      ),
    ]);
    const signedUrls = await signWorkspaceImages(
      supabase,
      userId,
      members.map(m => m.image_path),
    );
    return json({
      userId,
      members: members.map(m => ({
        ...m,
        image_url: (m.image_path && signedUrls.get(m.image_path)) || null,
      })),
      shifts,
      rates,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await context();
    const body = await request.json();
    if (body.action === 'shifts') {
      if (!Array.isArray(body.shifts) || !body.shifts.length || body.shifts.length > 93) {
        throw new HttpError('Zaplanuj od 1 do 93 dni.');
      }
      const shifts: Shift[] = body.shifts.map((s: Shift) => {
        if (!validDate(s.date) || !validPeriod(s.date.slice(0, 7))) {
          throw new HttpError('Dozwolone lata: 2025–2027.');
        }
        shiftHours(s);
        return {
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
          break_minutes: s.break_minutes,
          notes: text(s.notes || '', 'Notatka', 4000),
        };
      });
      const dates = shifts.map(s => s.date).sort();
      datesBetween(dates[0], dates[dates.length - 1]);
      const { data, error } = await supabase.rpc('staff_save_shifts', {
        p_member: body.member_id,
        p_shifts: shifts,
        p_replace: body.replace === true,
      });
      if (error) {
        throw new HttpError(
          'Nie zapisano grafiku. Sprawdź nakładające się zmiany, datę zatrudnienia i zakres do 3 miesięcy. Zaznacz zastąpienie, jeśli edytujesz istniejące zmiany.',
          409,
        );
      }
      return json({ count: data });
    }

    const m = body.member;
    const p = body.pay;
    if (
      !m ||
      !p ||
      !validDate(m.employed_on) ||
      !validDate(p.effective_on) ||
      !['hourly', 'monthly'].includes(p.pay_type)
    ) {
      throw new HttpError('Sprawdź daty i rodzaj wynagrodzenia.');
    }
    if (m.image_path && !ownsUpload(m.image_path, userId)) {
      throw new HttpError('Nieprawidłowe zdjęcie.');
    }
    const name = text(m.name, 'Imię i nazwisko');
    const position = text(m.position, 'Stanowisko');
    const category = text(m.category, 'Kategoria');
    if (!name || !position || !category) {
      throw new HttpError('Podaj imię, stanowisko i kategorię.');
    }

    let previousImage: string | null = null;
    if (m.id) {
      const { data: existing } = await supabase
        .from('staff_members')
        .select('image_path')
        .eq('id', m.id)
        .eq('user_id', userId)
        .maybeSingle();
      previousImage = existing?.image_path || null;
    }

    const nextImage = m.image_path || null;
    const { data, error } = await supabase.rpc('staff_save_member', {
      p_id: m.id || null,
      p_revision: m.revision || null,
      p_member: {
        name,
        position,
        category,
        employed_on: m.employed_on,
        image_path: nextImage,
        notes: text(m.notes || '', 'Notatki', 4000),
      },
      p_pay: {
        effective_on: p.effective_on,
        pay_type: p.pay_type,
        rate: numeric(p.rate, 'Wynagrodzenie', false),
      },
    });
    if (error) {
      throw new HttpError(
        'Nie zapisano pracownika. Sprawdź datę obowiązywania stawki i odśwież dane.',
        409,
      );
    }
    if (previousImage && previousImage !== nextImage && ownsUpload(previousImage, userId)) {
      invalidateWorkspaceImage(previousImage);
      await supabase.storage.from('workspace-images').remove([previousImage]);
    }
    return json({ id: data });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, userId } = await context();
    const body = await request.json();
    if (body.confirm !== true) throw new HttpError('Potwierdź trwałe usunięcie.');
    if (body.kind === 'shift') {
      const { data, error } = await supabase
        .from('staff_shifts')
        .delete()
        .eq('id', body.id)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();
      if (error || !data) throw new HttpError('Nie usunięto zmiany. Odśwież widok.', 409);
    } else if (body.kind === 'member') {
      const { data, error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', body.id)
        .eq('revision', body.revision)
        .eq('user_id', userId)
        .select('image_path')
        .maybeSingle();
      if (error || !data) throw new HttpError('Nie usunięto pracownika. Odśwież widok.', 409);
      if (data.image_path && ownsUpload(data.image_path, userId)) {
        invalidateWorkspaceImage(data.image_path);
        await supabase.storage.from('workspace-images').remove([data.image_path]);
      }
    } else {
      throw new HttpError('Nieprawidłowa operacja.');
    }
    return json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
