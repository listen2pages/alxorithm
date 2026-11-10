import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber, safeReturnPath } from '@/utils/supabase/subscription';
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const destination = await isSubscriber(supabase, user.id) ? '/home' : safeReturnPath(searchParams.get('next'));
          return NextResponse.redirect(new URL(destination, origin));
        } catch {
          return NextResponse.redirect(new URL('/login?message=Nie+można+sprawdzić+subskrypcji.+Spróbuj+ponownie.', origin));
        }
      }
    }
  }
  return NextResponse.redirect(new URL('/login?message=Logowanie+nie+powiodło+się.+Spróbuj+ponownie.', origin));
}
