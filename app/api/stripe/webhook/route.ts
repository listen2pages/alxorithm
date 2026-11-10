import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { stripeConfig, stripeRequest, verifyStripeSignature, type StripeSubscription } from '@/utils/stripe/server';
import { handleStripeEvent, type StripeEvent } from '@/utils/stripe/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook: keeps `public.subscriptions` in sync with Stripe.
 * Register https://alxorithm.com/api/stripe/webhook in Stripe for the
 * checkout.session.completed and customer.subscription.* events.
 */
export async function POST(request: NextRequest) {
  const config = stripeConfig();
  const admin = createAdminClient();
  if (!config.webhookSecret || !config.secretKey || !admin) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const payload = await request.text();
  if (payload.length > 1_000_000) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  if (!verifyStripeSignature(payload, request.headers.get('stripe-signature'), config.webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const secretKey = config.secretKey;
  try {
    const result = await handleStripeEvent(event, {
      fetchSubscription: id => stripeRequest<StripeSubscription>(secretKey, 'GET', `/subscriptions/${encodeURIComponent(id)}`),
      async findUserId({ customerId, subscriptionId }) {
        const filters = [subscriptionId && `stripe_subscription_id.eq.${subscriptionId}`, customerId && `stripe_customer_id.eq.${customerId}`].filter(Boolean).join(',');
        if (!filters) return null;
        const { data, error } = await admin.from('subscriptions').select('user_id').or(filters).limit(1).maybeSingle();
        if (error) throw error;
        return typeof data?.user_id === 'string' ? data.user_id : null;
      },
      async upsertSubscription(row) {
        const { error } = await admin.from('subscriptions').upsert(row, { onConflict: 'user_id' });
        if (error) throw error;
      },
    });
    if (!result.handled && result.reason === 'unknown-user') console.warn('Stripe webhook: no user for event', event.id);
    return NextResponse.json({ received: true, handled: result.handled });
  } catch (error) {
    console.error('Stripe webhook failed', event.id, error instanceof Error ? error.message : error);
    // A 500 makes Stripe retry with exponential back-off.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
