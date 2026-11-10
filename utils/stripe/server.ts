/**
 * Minimal, dependency-free Stripe REST client used by the billing routes.
 *
 * Only server code may import this module: it reads secret environment variables.
 * Every helper degrades gracefully when Stripe is not configured so that local
 * development and preview deployments keep working with the hosted Payment Link.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Legacy hosted Payment Link shared with the original Polish deployment. */
export const LEGACY_PAYMENT_LINK = 'https://buy.stripe.com/28E9ASacmewvaWQ0843Je04';
const STRIPE_API = 'https://api.stripe.com/v1';

export type StripeConfig = {
  secretKey: string | null;
  priceId: string | null;
  webhookSecret: string | null;
  paymentLink: string;
  portalLink: string | null;
  trialDays: number;
};

export function stripeConfig(env: Record<string, string | undefined> = process.env): StripeConfig {
  const trialDays = Number.parseInt(env.STRIPE_TRIAL_DAYS || '7', 10);
  return {
    secretKey: env.STRIPE_SECRET_KEY || null,
    priceId: env.STRIPE_PRICE_ID || null,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || null,
    paymentLink: env.STRIPE_PAYMENT_LINK || LEGACY_PAYMENT_LINK,
    portalLink: env.STRIPE_CUSTOMER_PORTAL_URL || null,
    trialDays: Number.isFinite(trialDays) && trialDays >= 0 && trialDays <= 30 ? trialDays : 7,
  };
}

type FormValue = string | number | boolean | null | undefined | FormValue[] | { [key: string]: FormValue };

/** Encodes nested objects the way the Stripe API expects (`a[b][0][c]=value`). */
export function encodeStripeForm(params: Record<string, FormValue>): string {
  const pairs: string[] = [];
  const walk = (prefix: string, value: FormValue) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(`${prefix}[${index}]`, item));
    } else if (typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) walk(`${prefix}[${key}]`, item);
    } else {
      pairs.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`);
    }
  };
  for (const [key, value] of Object.entries(params)) walk(key, value);
  return pairs.join('&');
}

export class StripeApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function stripeRequest<T>(
  secretKey: string,
  method: 'GET' | 'POST',
  path: string,
  params: Record<string, FormValue> = {},
  fetcher: typeof fetch = fetch,
): Promise<T> {
  const body = encodeStripeForm(params);
  const url = method === 'GET' && body ? `${STRIPE_API}${path}?${body}` : `${STRIPE_API}${path}`;
  const response = await fetcher(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20',
    },
    body: method === 'POST' ? body : undefined,
    cache: 'no-store',
  });
  const json = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!response.ok) throw new StripeApiError(json.error?.message || 'Stripe request failed', response.status);
  return json as T;
}

/** Builds a Payment Link URL bound to the signed-in Supabase user. */
export function boundPaymentLink(base: string, user: { id: string; email?: string | null }, locale: string): string {
  const url = new URL(base);
  url.searchParams.set('client_reference_id', user.id);
  if (user.email) url.searchParams.set('prefilled_email', user.email);
  if (['en', 'pl', 'ru'].includes(locale)) url.searchParams.set('locale', locale);
  return url.toString();
}

/**
 * Verifies a `Stripe-Signature` header (v1 HMAC-SHA256 scheme).
 * Rejects stale timestamps to prevent replay attacks.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
  now = Math.floor(Date.now() / 1000),
): boolean {
  if (!header || !secret) return false;
  const parts = header.split(',').map(part => part.trim().split('='));
  const timestamp = Number(parts.find(([key]) => key === 't')?.[1]);
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!Number.isFinite(timestamp) || !signatures.length) return false;
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex'), 'utf8');
  return signatures.some(signature => {
    const candidate = Buffer.from(signature || '', 'utf8');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

export type StripeSubscription = {
  id: string;
  customer: string | { id: string };
  status: string;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

/** Maps a Stripe subscription onto the shared `public.subscriptions` row shape. */
export function subscriptionRow(subscription: StripeSubscription, userId: string) {
  return {
    user_id: userId,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: subscription.items?.data?.[0]?.price?.id ?? null,
  };
}

/** Public site origin used for Stripe return URLs. */
export function siteOrigin(requestOrigin: string, env: Record<string, string | undefined> = process.env): string {
  const configured = env.NEXT_PUBLIC_SITE_URL;
  if (configured && /^https?:\/\//.test(configured)) return configured.replace(/\/$/, '');
  return requestOrigin;
}
