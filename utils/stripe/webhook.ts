/**
 * Stripe webhook event processing, kept free of framework code so it can be unit tested.
 *
 * The handler always re-reads the subscription from Stripe instead of trusting the
 * event payload, which makes processing idempotent and safe against out-of-order delivery.
 */
import { subscriptionRow, type StripeSubscription } from './server';

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export type WebhookDeps = {
  fetchSubscription(id: string): Promise<StripeSubscription>;
  findUserId(lookup: { customerId: string | null; subscriptionId: string | null }): Promise<string | null>;
  upsertSubscription(row: ReturnType<typeof subscriptionRow>): Promise<void>;
};

const HANDLED = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idOf = (value: unknown): string | null =>
  typeof value === 'string' ? value : value && typeof value === 'object' && typeof (value as { id?: unknown }).id === 'string' ? (value as { id: string }).id : null;

export type WebhookResult = { handled: boolean; userId?: string; status?: string; reason?: string };

export async function handleStripeEvent(event: StripeEvent, deps: WebhookDeps): Promise<WebhookResult> {
  if (!HANDLED.has(event.type)) return { handled: false, reason: 'ignored' };
  const object = event.data.object;

  let subscriptionId: string | null;
  let hintedUserId: string | null = null;
  if (event.type === 'checkout.session.completed') {
    if (object.mode !== 'subscription') return { handled: false, reason: 'not-a-subscription' };
    subscriptionId = idOf(object.subscription);
    const metadata = (object.metadata || {}) as Record<string, unknown>;
    hintedUserId = (typeof object.client_reference_id === 'string' ? object.client_reference_id : null) || (typeof metadata.user_id === 'string' ? metadata.user_id : null);
  } else {
    subscriptionId = idOf(object.id);
  }
  if (!subscriptionId) return { handled: false, reason: 'missing-subscription' };

  const subscription = await deps.fetchSubscription(subscriptionId);
  const customerId = idOf(subscription.customer);
  const userId =
    [hintedUserId, subscription.metadata?.user_id].find(value => typeof value === 'string' && UUID.test(value)) ||
    (await deps.findUserId({ customerId, subscriptionId }));
  if (!userId || !UUID.test(userId)) return { handled: false, reason: 'unknown-user' };

  const row = subscriptionRow(subscription, userId);
  await deps.upsertSubscription(row);
  return { handled: true, userId, status: row.status };
}
