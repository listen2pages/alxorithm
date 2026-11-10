import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber, safeReturnPath } from '@/utils/supabase/subscription';
import { locales, localizedPath, stripLocale, type Locale } from '@/i18n/routing';
export async function GET(request: Request) {
  const {searchParams,origin}=new URL(request.url);
  const selected=searchParams.get('locale')||(await cookies()).get('alxorithm-locale')?.value;
  const locale:Locale=locales.includes(selected as Locale)?selected as Locale:'en';
  const finish=(destination:string)=>{const response=NextResponse.redirect(new URL(localizedPath(destination,locale),origin));response.cookies.set('alxorithm-locale',locale,{path:'/',maxAge:31536000,sameSite:'lax',secure:origin.startsWith('https:')});response.headers.set('Cache-Control','private, no-store');return response;};
  if(searchParams.get('code')&&process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){
    const supabase=await createClient();
    const {error}=await supabase.auth.exchangeCodeForSession(searchParams.get('code')!);
    if(!error){const {data:{user}}=await supabase.auth.getUser();if(user){try{return finish(await isSubscriber(supabase,user.id)?'/home':stripLocale(safeReturnPath(searchParams.get('next'))));}catch{return finish('/login?message='+encodeURIComponent({en:'Cannot check your subscription. Try again.',pl:'Nie można sprawdzić subskrypcji. Spróbuj ponownie.',ru:'Не удалось проверить подписку. Попробуйте снова.'}[locale]));}}}
  }
  return finish('/login?message='+encodeURIComponent({en:'Sign-in failed. Try again.',pl:'Logowanie nie powiodło się. Spróbuj ponownie.',ru:'Не удалось войти. Попробуйте снова.'}[locale]));
}
