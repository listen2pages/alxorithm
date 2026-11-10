import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import { locales, localizedPath, type Locale } from '@/i18n/routing';
import { boundPaymentLink, siteOrigin, stripeConfig, stripeRequest } from '@/utils/stripe/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function requestLocale(request: NextRequest): Locale {
  const value = request.headers.get('x-alxorithm-locale') || request.cookies.get('alxorithm-locale')?.value;
  return locales.includes(value as Locale) ? (value as Locale) : 'en';
}

function redirect(url: string) {
  const response = NextResponse.redirect(url, 303);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

/**
 * Starts the subscription checkout for the signed-in user.
 * Checkout is always bound to the Supabase user id, so payments can never be
 * orphaned from the account that will use the workspace.
 */
export async function GET(request: NextRequest) {
  const locale = requestLocale(request);
  const origin = siteOrigin(request.nextUrl.origin);
  const page = (path: string) => origin + localizedPath(path, locale);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return redirect(page('/cennik'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect(page('/login?next=' + encodeURIComponent('/cennik')));

  try {
    if (await isSubscriber(supabase, user.id)) return redirect(page('/home'));
  } catch {
    return redirect(page('/cennik?checkout=error'));
  }

  const config = stripeConfig();
  if (!config.secretKey || !config.priceId) return redirect(boundPaymentLink(config.paymentLink, user, locale));

  try {
    const { data: existing } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
    const customer = typeof existing?.stripe_customer_id === 'string' ? existing.stripe_customer_id : null;
    const session = await stripeRequest<{ url: string }>(config.secretKey, 'POST', '/checkout/sessions', {
      mode: 'subscription',
      client_reference_id: user.id,
      customer: customer ?? undefined,
      customer_email: customer ? undefined : user.email ?? undefined,
      line_items: [{ price: config.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      locale: locale === 'en' ? 'en' : locale,
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
        trial_period_days: config.trialDays > 0 ? config.trialDays : undefined,
      },
      success_url: page('/home') + '?checkout=success',
      cancel_url: page('/cennik') + '?checkout=cancelled',
    });
    return redirect(session.url);
  } catch (error) {
    console.error('Stripe checkout failed', error instanceof Error ? error.message : error);
    return redirect(page('/cennik?checkout=error'));
  }
}
