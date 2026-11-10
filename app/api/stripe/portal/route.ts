import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { locales, localizedPath, type Locale } from '@/i18n/routing';
import { siteOrigin, stripeConfig, stripeRequest } from '@/utils/stripe/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORT_EMAIL = 'yousifhussein1996@gmail.com';
const unavailable = {
  en: 'Online subscription management is temporarily unavailable. To cancel or change your plan, email ',
  pl: 'Zarządzanie subskrypcją online jest chwilowo niedostępne. Aby anulować lub zmienić plan, napisz na ',
  ru: 'Управление подпиской онлайн временно недоступно. Чтобы отменить или изменить тариф, напишите на ',
};

function requestLocale(request: NextRequest): Locale {
  const value = request.headers.get('x-alxorithm-locale') || request.cookies.get('alxorithm-locale')?.value;
  return locales.includes(value as Locale) ? (value as Locale) : 'en';
}

function redirect(url: string) {
  const response = NextResponse.redirect(url, 303);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

/** Opens the Stripe Customer Portal so subscribers can cancel, update cards and download invoices. */
export async function GET(request: NextRequest) {
  const locale = requestLocale(request);
  const origin = siteOrigin(request.nextUrl.origin);
  const page = (path: string) => origin + localizedPath(path, locale);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return redirect(page('/login'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect(page('/login'));

  const config = stripeConfig();
  try {
    if (config.secretKey) {
      const { data: row } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
      let customer = typeof row?.stripe_customer_id === 'string' ? row.stripe_customer_id : null;
      if (!customer && user.email) {
        const found = await stripeRequest<{ data: Array<{ id: string }> }>(config.secretKey, 'GET', '/customers', { email: user.email, limit: 1 });
        customer = found.data[0]?.id ?? null;
      }
      if (customer) {
        const session = await stripeRequest<{ url: string }>(config.secretKey, 'POST', '/billing_portal/sessions', {
          customer,
          return_url: page('/home'),
          locale: locale === 'en' ? 'en' : locale,
        });
        return redirect(session.url);
      }
    }
    if (config.portalLink) {
      const url = new URL(config.portalLink);
      if (user.email) url.searchParams.set('prefilled_email', user.email);
      return redirect(url.toString());
    }
  } catch (error) {
    console.error('Stripe portal failed', error instanceof Error ? error.message : error);
  }

  const message = unavailable[locale];
  const html = `<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>alxorithm</title><body style="font-family:system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 24px;color:#29402e;line-height:1.6"><p>${message}<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p><p><a href="${page('/home')}">alxorithm</a></p></body></html>`;
  return new NextResponse(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } });
}
