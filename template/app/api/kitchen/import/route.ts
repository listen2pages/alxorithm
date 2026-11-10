import { requestSettings } from '@/utils/global-settings';
import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';
import { kitchenContext, kitchenFailure, kitchenJson, KitchenError } from '@/utils/kitchen/server';
import { extractKitchen, estimatePrices, type Part } from '@/utils/kitchen/ai';
import { validateDraft } from '@/utils/kitchen/validate';
import { detectFileKind, ownsUpload } from '@/utils/uploads';
import { consumeAiQuota } from '@/utils/ai-quota';

export const runtime = 'nodejs';
export const maxDuration = 120;

type SourceFile = { name: string; path: string; size: number; hash: string };

const mime: Record<string, string> = {
  csv: 'text/csv',
  txt: 'text/plain',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
};

const SAFE_XLSX_OPTIONS: XLSX.ParsingOptions = {
  type: 'buffer',
  cellFormula: false,
  cellHTML: false,
  cellNF: false,
  bookDeps: false,
  bookFiles: false,
  bookProps: false,
  bookVBA: false,
  sheetRows: 5000,
};

export async function PUT(request: NextRequest) {
  try {
    const { supabase, userId } = await kitchenContext();
    const form = await request.formData();
    const files = form.getAll('files');
    if (!files.length || files.length > 3 || files.some(f => !(f instanceof File))) {
      throw new KitchenError('Dodaj od 1 do 3 dokumentów.');
    }
    const uploads = files as File[];
    if (
      uploads.reduce((s, f) => s + f.size, 0) > 12 * 1024 * 1024 ||
      uploads.some(f => !f.size || !mime[f.name.split('.').pop()!.toLowerCase()])
    ) {
      throw new KitchenError('Obsługiwane: CSV, XLSX, XLS, PDF, TXT, PNG, JPG. Łącznie do 12 MB.');
    }
    const buffers = await Promise.all(uploads.map(async f => Buffer.from(await f.arrayBuffer())));
    for (let i = 0; i < uploads.length; i++) {
      const check = detectFileKind(uploads[i].name, buffers[i]);
      if (!check.valid) throw new KitchenError(check.error);
    }
    const hashes = buffers.map(b => createHash('sha256').update(b).digest('hex'));
    const hash = createHash('sha256').update(JSON.stringify(hashes)).digest('hex');
    const { data: existing } = await supabase
      .from('kitchen_imports')
      .select('id,status')
      .eq('user_id', userId)
      .eq('file_hash', hash)
      .maybeSingle();
    if (existing) return kitchenJson(existing);

    const metadata: SourceFile[] = [];
    const uploadedPaths: string[] = [];
    try {
      for (let i = 0; i < uploads.length; i++) {
        const file = uploads[i];
        const name = file.name
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = userId + '/' + crypto.randomUUID() + '--' + name;
        const ext = name.split('.').pop()!.toLowerCase();
        const { error } = await supabase.storage
          .from('user-uploads')
          .upload(path, buffers[i], { contentType: mime[ext], upsert: false });
        if (error) throw new KitchenError('Nie udało się zapisać pliku.', 503);
        uploadedPaths.push(path);
        metadata.push({ name: file.name, path, size: file.size, hash: hashes[i] });
      }
      const { data, error } = await supabase
        .from('kitchen_imports')
        .insert({ user_id: userId, file_hash: hash, files: metadata, status: 'uploaded' })
        .select('id,status')
        .single();
      if (error) {
        throw new KitchenError('Pliki zapisano, ale import nie został utworzony. Spróbuj ponownie.', 503);
      }
      return kitchenJson(data);
    } catch (uploadError) {
      if (uploadedPaths.length) {
        try {
          const bucket = supabase.storage.from('user-uploads') as {
            remove?: (paths: string[]) => Promise<unknown>;
          };
          await bucket.remove?.(uploadedPaths);
        } catch {
          /* Best-effort storage rollback when DB insert fails. */
        }
      }
      throw uploadError;
    }
  } catch (error) {
    return kitchenFailure(error);
  }
}

export async function POST(request: NextRequest) {
  let claimed: { id: string; userId: string; lease: string; hasDraft: boolean } | null = null;
  try {
    const { supabase, userId } = await kitchenContext();
    const { id, action } = await request.json();
    if (!['analyze', 'estimate', 'approve'].includes(action) || typeof id !== 'string') {
      throw new KitchenError('Nieprawidłowa operacja importu.');
    }
    const { data: record, error } = await supabase
      .from('kitchen_imports')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error || !record) throw new KitchenError('Nie znaleziono importu.', 404);
    if (record.status === 'approved') return kitchenJson({ approved: true });
    if (action === 'approve') {
      validateDraft(record.draft);
      const { data, error: approveError } = await supabase.rpc('kitchen_accept_import', {
        p_import_id: id,
      });
      if (approveError) {
        throw new KitchenError(
          'Nie można zatwierdzić importu. Sprawdź jednostki lub powtarzające się składniki.',
          409,
        );
      }
      return kitchenJson({ approved: true, count: data });
    }

    const aiKind =
      action === 'analyze' && !record.draft
        ? 'kitchen_analyze'
        : action === 'estimate'
          ? 'kitchen_estimate'
          : null;
    if (aiKind) {
      const quota = await consumeAiQuota(supabase, userId, aiKind);
      if (!quota.allowed) throw new KitchenError(quota.message, 429);
    }

    const lease = new Date(Date.now() + 180000).toISOString();
    const { data: locked, error: lockError } = await supabase
      .from('kitchen_imports')
      .update({ status: 'processing', lease_until: lease, error: null })
      .eq('id', id)
      .eq('user_id', userId)
      .neq('status', 'approved')
      .or(`lease_until.is.null,lease_until.lt.${new Date().toISOString()}`)
      .select('id')
      .maybeSingle();
    if (lockError || !locked) throw new KitchenError('Import jest już przetwarzany.', 409);
    claimed = { id, userId, lease, hasDraft: Boolean(record.draft) };

    let draft = record.draft;
    let sources = record.sources || [];
    let notes = record.notes || [];
    let searchSuggestions = record.search_suggestions || [];
    let remaining = 0;

    if (action === 'analyze' && !record.draft) {
      const parts: Part[] = [];
      for (const file of record.files as SourceFile[]) {
        if (!ownsUpload(file.path, userId)) throw new KitchenError('Nieprawidłowy plik.');
        const { data, error: downloadError } = await supabase.storage
          .from('user-uploads')
          .download(file.path);
        if (downloadError || !data) throw new KitchenError('Nie można pobrać dokumentu.', 503);
        const bytes = Buffer.from(await data.arrayBuffer());
        if (createHash('sha256').update(bytes).digest('hex') !== file.hash) {
          throw new KitchenError('Dokument zmienił się. Dodaj plik ponownie.', 409);
        }
        const ext = file.name.split('.').pop()!.toLowerCase();
        if (ext === 'xlsx' || ext === 'xls') {
          const check = detectFileKind(file.name, bytes);
          if (!check.valid) throw new KitchenError(check.error);
          const workbook = XLSX.read(bytes, SAFE_XLSX_OPTIONS);
          const text = workbook.SheetNames.slice(0, 20)
            .map(name => 'ARKUSZ ' + name + '\n' + XLSX.utils.sheet_to_csv(workbook.Sheets[name]))
            .join('\n');
          if (text.length > 500000) {
            throw new KitchenError('Arkusz jest zbyt duży. Podziel go na mniejsze dokumenty.');
          }
          parts.push({ text });
        } else if (ext === 'csv' || ext === 'txt') {
          const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
          if (text.length > 500000) {
            throw new KitchenError('Dokument jest zbyt duży. Podziel go na mniejsze pliki.');
          }
          parts.push({ text });
        } else {
          parts.push({ inline_data: { mime_type: mime[ext], data: bytes.toString('base64') } });
        }
      }
      draft = await extractKitchen(parts, requestSettings(request));
    } else if (action === 'estimate') {
      const result = await estimatePrices(validateDraft(record.draft), requestSettings(request));
      draft = result.items;
      sources = [...sources, ...result.sources];
      notes = [...notes, ...result.notes];
      searchSuggestions = [...searchSuggestions, ...result.searchSuggestions];
      remaining = result.remaining;
    }

    const { data: saved, error: saveError } = await supabase
      .from('kitchen_imports')
      .update({
        draft,
        sources,
        notes,
        search_suggestions: searchSuggestions,
        status: 'draft',
        error: null,
        lease_until: null,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('lease_until', lease)
      .select('id')
      .maybeSingle();
    if (saveError || !saved) throw new KitchenError('Nie udało się zapisać wersji roboczej.', 503);
    claimed = null;
    return kitchenJson({ ready: true, remaining });
  } catch (error) {
    if (claimed) {
      try {
        const { supabase } = await kitchenContext();
        await supabase
          .from('kitchen_imports')
          .update({
            status: claimed.hasDraft ? 'draft' : 'error',
            error: error instanceof Error ? error.message : 'Błąd importu',
            lease_until: null,
          })
          .eq('id', claimed.id)
          .eq('user_id', claimed.userId)
          .eq('lease_until', claimed.lease);
      } catch {
        /* Expiring lease allows recovery if authentication or the database is unavailable. */
      }
    }
    return kitchenFailure(error);
  }
}
