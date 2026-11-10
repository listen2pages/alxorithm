const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { load } = require('./helpers/ts-loader.cjs');

test('stripe server utilities bind user identity, encode forms, and verify webhook signatures', () => {
  const stripe = load('utils/stripe/server.ts');

  const url = new URL(
    stripe.boundPaymentLink(
      stripe.LEGACY_PAYMENT_LINK,
      { id: '11111111-2222-3333-4444-555555555555', email: 'chef@alxorithm.com' },
      'pl',
    ),
  );
  assert.equal(url.origin, 'https://buy.stripe.com');
  assert.equal(url.searchParams.get('client_reference_id'), '11111111-2222-3333-4444-555555555555');
  assert.equal(url.searchParams.get('prefilled_email'), 'chef@alxorithm.com');
  assert.equal(url.searchParams.get('locale'), 'pl');

  const form = new URLSearchParams(
    stripe.encodeStripeForm({
      mode: 'subscription',
      line_items: [{ price: 'price_400_pln', quantity: 1 }],
      subscription_data: { trial_period_days: 7, metadata: { user_id: 'user-123' } },
    }),
  );
  assert.equal(form.get('mode'), 'subscription');
  assert.equal(form.get('line_items[0][price]'), 'price_400_pln');
  assert.equal(form.get('subscription_data[trial_period_days]'), '7');
  assert.equal(form.get('subscription_data[metadata][user_id]'), 'user-123');

  const secret = 'whsec_test_secret_key';
  const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
  const nowSec = 1760000000;
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${nowSec}.${payload}`, 'utf8')
    .digest('hex');

  assert.equal(
    stripe.verifyStripeSignature(payload, `t=${nowSec},v1=${sig}`, secret, 300, nowSec),
    true,
  );
  assert.equal(
    stripe.verifyStripeSignature(payload, `t=${nowSec},v1=deadbeef`, secret, 300, nowSec),
    false,
  );
  assert.equal(
    stripe.verifyStripeSignature(payload, `t=${nowSec - 600},v1=${sig}`, secret, 300, nowSec),
    false,
  );
});

test('stripe webhook handler syncs checkout and subscription lifecycle events to public.subscriptions', async () => {
  const { handleStripeEvent } = load('utils/stripe/webhook.ts');
  const userUuid = '11111111-2222-3333-4444-555555555555';
  const upserted = [];
  let currentStatus = 'trialing';

  const deps = {
    async fetchSubscription(id) {
      assert.equal(id, 'sub_live_1');
      return {
        id: 'sub_live_1',
        customer: 'cus_live_1',
        status: currentStatus,
        metadata: { user_id: userUuid },
        items: { data: [{ price: { id: 'price_400_pln' } }] },
      };
    },
    async findUserId({ customerId, subscriptionId }) {
      if (customerId === 'cus_live_1' || subscriptionId === 'sub_live_1') return userUuid;
      return null;
    },
    async upsertSubscription(row) {
      upserted.push(row);
    },
  };

  const checkoutResult = await handleStripeEvent(
    {
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          mode: 'subscription',
          client_reference_id: userUuid,
          customer: 'cus_live_1',
          subscription: 'sub_live_1',
        },
      },
    },
    deps,
  );

  assert.equal(checkoutResult.handled, true);
  assert.equal(checkoutResult.userId, userUuid);
  assert.equal(checkoutResult.status, 'trialing');
  assert.equal(upserted.length, 1);
  assert.equal(upserted[0].stripe_customer_id, 'cus_live_1');
  assert.equal(upserted[0].stripe_subscription_id, 'sub_live_1');
  assert.equal(upserted[0].price_id, 'price_400_pln');

  currentStatus = 'canceled';
  const deleteResult = await handleStripeEvent(
    {
      id: 'evt_delete',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_live_1',
          customer: 'cus_live_1',
          status: 'canceled',
        },
      },
    },
    deps,
  );

  assert.equal(deleteResult.handled, true);
  assert.equal(deleteResult.userId, userUuid);
  assert.equal(deleteResult.status, 'canceled');
  assert.equal(upserted[1].status, 'canceled');
});
