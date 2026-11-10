import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import { detectFileKind, ownsUpload, validateUpload, type UploadedFile } from '@/utils/uploads';

async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { response: NextResponse.json({ error: 'Zaloguj się ponownie.' }, { status: 401 }) };
  }
  if (!(await isSubscriber(supabase, user.id))) {
    return { response: NextResponse.json({ error: 'Wymagana aktywna subskrypcja.' }, { status: 403 }) };
  }
  return { supabase, user };
}

async function listFiles(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .list(userId, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return (data || [])
    .filter(file => file.id)
    .map(file => ({
      name: file.name.replace(/^[0-9a-f-]{36}--/, ''),
      path: userId + '/' + file.name,
      size: Number(file.metadata?.size || 0),
      uploaded_at: file.created_at || '',
    })) satisfies UploadedFile[];
}

function failure() {
  return NextResponse.json(
    { error: 'Nie udało się wykonać operacji na plikach. Spróbuj ponownie.' },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await context();
    if (ctx.response) return ctx.response;
    const path = request.nextUrl.searchParams.get('path');
    if (path !== null) {
      if (!ownsUpload(path, ctx.user.id)) {
        return NextResponse.json({ error: 'Nieprawidłowy plik.' }, { status: 400 });
      }
      const { data, error } = await ctx.supabase.storage
        .from('user-uploads')
        .createSignedUrl(path, 60, { download: true });
      if (error) throw error;
      return NextResponse.json(
        { url: data.signedUrl },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    return NextResponse.json(
      { files: await listFiles(ctx.supabase, ctx.user.id) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch {
    return failure();
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await context();
    if (ctx.response) return ctx.response;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Wybierz plik.' }, { status: 400 });
    }
    const errorMessage = validateUpload(file.name, file.size, await listFiles(ctx.supabase, ctx.user.id));
    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signature = detectFileKind(file.name, bytes);
    if (!signature.valid) {
      return NextResponse.json({ error: signature.error }, { status: 400 });
    }
    const safeName = file.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = ctx.user.id + '/' + crypto.randomUUID() + '--' + safeName;
    const { error } = await ctx.supabase.storage
      .from('user-uploads')
      .upload(path, file, { upsert: false, contentType: signature.mime });
    if (error) throw error;
    return NextResponse.json(
      {
        file: {
          name: safeName,
          path,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch {
    return failure();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await context();
    if (ctx.response) return ctx.response;
    const { path } = await request.json();
    if (!ownsUpload(path, ctx.user.id)) {
      return NextResponse.json({ error: 'Nieprawidłowy plik.' }, { status: 400 });
    }
    const { data: months, error: monthError } = await ctx.supabase
      .from('panel_months')
      .select('period,files')
      .eq('user_id', ctx.user.id);
    if (monthError) throw monthError;
    if (
      months?.some(month =>
        Object.values(month.files as Record<string, { path: string }>).some(file => file.path === path),
      )
    ) {
      return NextResponse.json(
        { error: 'Plik jest używany w analizie miesięcznej. Najpierw zastąp go w panelu.' },
        { status: 409 },
      );
    }
    const { data: imports, error: importError } = await ctx.supabase
      .from('kitchen_imports')
      .select('id')
      .eq('user_id', ctx.user.id)
      .contains('files', [{ path }])
      .limit(1);
    if (importError) throw importError;
    if (imports?.length) {
      return NextResponse.json(
        { error: 'Plik jest źródłem importu kuchni i musi pozostać dostępny.' },
        { status: 409 },
      );
    }
    const { error } = await ctx.supabase.storage.from('user-uploads').remove([path]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return failure();
  }
}
