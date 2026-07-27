import { cleanLimited, json } from '../../_lib/auth.js';
import { stripeGet, verifyStripeSignature } from '../../_lib/stripe.js';
import { ensureCommissionForCheckout, recordPaidInvoice } from '../../_lib/affiliates.js';

const VERGE_FIVE_PRODUCT = 'verge-five-membership';

function configuredPriceId(env, plan) {
  return String(plan || '') === 'annual'
    ? String(env.STRIPE_PRICE_ID_ANNUAL || '')
    : String(env.STRIPE_PRICE_ID_MONTHLY || env.STRIPE_PRICE_ID || '');
}

function isConfiguredPlanPrice(env, plan, priceId) {
  const expected = configuredPriceId(env, plan);
  return !!expected && String(priceId || '') === expected;
}

function subscriptionPriceId(subscription) {
  const metadataPrice = subscription && subscription.metadata && subscription.metadata.price_id;
  const itemPrice = subscription && subscription.items && subscription.items.data
    && subscription.items.data[0] && subscription.items.data[0].price;
  return String(itemPrice && (itemPrice.id || itemPrice) || metadataPrice || '');
}

function stripeEventModeAllowed(env, event) {
  const appEnvironment = String(env.APP_ENVIRONMENT || '').toLowerCase();
  const requiredMode = String(env.STRIPE_MODE_REQUIRED || '').toLowerCase();
  if (appEnvironment === 'development' || requiredMode === 'test') return event.livemode === false;
  if (appEnvironment === 'production' || requiredMode === 'live') return event.livemode === true;
  return true;
}

async function checkoutPriceId(env, session) {
  const embedded = session && session.line_items && session.line_items.data
    && session.line_items.data[0] && session.line_items.data[0].price;
  if (embedded) return String(embedded.id || embedded);
  const sessionId = String(session && session.id || '');
  if (!sessionId) return '';
  const lineItems = await stripeGet(env, `/checkout/sessions/${encodeURIComponent(sessionId)}/line_items`, { limit: 1 });
  if (lineItems instanceof Response) throw new Error('Stripe checkout line items could not be verified.');
  const price = lineItems && lineItems.data && lineItems.data[0] && lineItems.data[0].price;
  return String(price && (price.id || price) || '');
}

async function verifiedVergeFiveCheckoutPriceId(env, session) {
  const metadata = session && session.metadata || {};
  const actualPriceId = await checkoutPriceId(env, session);
  const valid = metadata.product === VERGE_FIVE_PRODUCT
    && metadata.product_plan === 'self-serve'
    && ['monthly', 'annual'].includes(String(metadata.plan || ''))
    && (!metadata.price_id || isConfiguredPlanPrice(env, metadata.plan, metadata.price_id))
    && isConfiguredPlanPrice(env, metadata.plan, actualPriceId);
  return valid ? actualPriceId : '';
}

async function reserveEvent(env, event) {
  const id = String(event.id || '').trim();
  if (!id) return { process: true, id: '' };
  const existing = await env.DB.prepare(
    'select status, updated_at from stripe_webhook_events where id = ? limit 1',
  ).bind(id).first();
  if (existing && existing.status === 'completed') return { process: false, duplicate: true, id };
  if (existing && existing.status === 'processing' && Date.parse(existing.updated_at || '') > Date.now() - 5 * 60 * 1000) {
    return { process: false, busy: true, id };
  }
  if (existing) {
    await env.DB.prepare(
      `update stripe_webhook_events
       set status = 'processing', attempts = attempts + 1, updated_at = datetime('now'), last_error = null
       where id = ?`,
    ).bind(id).run();
    return { process: true, id };
  }
  try {
    await env.DB.prepare(
      `insert into stripe_webhook_events
        (id, event_type, status, attempts, created_at, updated_at)
       values (?, ?, 'processing', 1, datetime('now'), datetime('now'))`,
    ).bind(id, String(event.type || '')).run();
    return { process: true, id };
  } catch {
    const raced = await env.DB.prepare(
      'select status from stripe_webhook_events where id = ? limit 1',
    ).bind(id).first();
    if (raced && raced.status === 'completed') return { process: false, duplicate: true, id };
    return { process: false, busy: true, id };
  }
}

async function completeEvent(env, id) {
  if (!id) return;
  await env.DB.prepare(
    `update stripe_webhook_events
     set status = 'completed', completed_at = datetime('now'), updated_at = datetime('now'), last_error = null
     where id = ?`,
  ).bind(id).run();
}

async function failEvent(env, id, error) {
  if (!id) return;
  await env.DB.prepare(
    `update stripe_webhook_events
     set status = 'failed', updated_at = datetime('now'), last_error = ?
     where id = ?`,
  ).bind(cleanLimited(error && error.message || error, 500), id).run();
}

export async function onRequestPost(context) {
  if (!context.env.DB) return json({ error: 'D1 binding DB is not configured.' }, 500);
  const rawBody = await context.request.text();
  const verified = await verifyStripeSignature(context.request, context.env, rawBody);
  if (!verified) return json({ error: 'Invalid webhook signature.' }, 400);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid webhook payload.' }, 400);
  }
  if (!stripeEventModeAllowed(context.env, event)) {
    return json({ error: 'Stripe event mode does not match this environment.' }, 403);
  }

  const reservation = await reserveEvent(context.env, event);
  if (reservation.duplicate) return json({ received: true, duplicate: true });
  if (reservation.busy) return json({ error: 'Webhook event is already processing.' }, 409);

  const object = event.data && event.data.object ? event.data.object : {};
  try {
    if (event.type === 'checkout.session.completed' && object.metadata && object.metadata.product === VERGE_FIVE_PRODUCT) {
      const verifiedPriceId = await verifiedVergeFiveCheckoutPriceId(context.env, object);
      if (!verifiedPriceId) {
        throw new Error('Verge Five checkout price or metadata did not match the configured product.');
      }
      await handleCheckoutCompleted(context.env, object, verifiedPriceId);
    }
    if (event.type === 'invoice.paid') {
      await recordPaidInvoice(context.env, object);
    }
    if (
      (event.type === 'customer.subscription.created'
        || event.type === 'customer.subscription.updated'
        || event.type === 'customer.subscription.deleted')
      && await subscriptionBelongsToVergeFive(context.env, object)
    ) {
      await handleSubscription(context.env, object);
    }
    if (event.type === 'invoice.payment_failed') {
      await markBySubscription(context.env, object.subscription, 'past_due', '');
    }
    await completeEvent(context.env, reservation.id);
    return json({ received: true });
  } catch (error) {
    await failEvent(context.env, reservation.id, error).catch(() => null);
    return json({ error: 'Webhook handler failed.' }, 500);
  }
}

async function handleCheckoutCompleted(env, session, verifiedPriceId) {
  const userId = session.client_reference_id || session.metadata && session.metadata.user_id;
  if (!userId) return;
  await env.DB.prepare('update users set stripe_customer_id = ? where id = ?').bind(session.customer || '', userId).run();
  await upsertMembership(env, {
    userId,
    customerId: session.customer || '',
    subscriptionId: session.subscription || '',
    status: session.payment_status === 'paid' ? 'active' : 'pending',
    periodEnd: '',
    plan: session.metadata && session.metadata.plan || '',
    priceId: verifiedPriceId
  });
  await ensureCommissionForCheckout(env, session);
}

async function subscriptionBelongsToVergeFive(env, subscription) {
  const metadata = subscription && subscription.metadata || {};
  const priceId = subscriptionPriceId(subscription);
  if (metadata.product === VERGE_FIVE_PRODUCT) {
    return metadata.product_plan === 'self-serve'
      && ['monthly', 'annual'].includes(String(metadata.plan || ''))
      && (!metadata.price_id || isConfiguredPlanPrice(env, metadata.plan, metadata.price_id))
      && isConfiguredPlanPrice(env, metadata.plan, priceId);
  }
  const id = String(subscription && subscription.id || '');
  if (!id) return false;
  const row = await env.DB.prepare(
    'select user_id, plan, stripe_price_id from memberships where stripe_subscription_id = ? limit 1',
  ).bind(id).first();
  if (!row) return false;
  if (!priceId) return true;
  if (!isConfiguredPlanPrice(env, row.plan, priceId)) return false;
  return !row.stripe_price_id || String(row.stripe_price_id) === priceId;
}

async function handleSubscription(env, subscription) {
  const userId = subscription.metadata && subscription.metadata.user_id
    ? subscription.metadata.user_id
    : await userIdBySubscription(env, subscription.id);
  if (!userId) return;
  await upsertMembership(env, {
    userId,
    customerId: subscription.customer || '',
    subscriptionId: subscription.id || '',
    status: subscription.status || 'pending',
    periodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : '',
    plan: subscription.metadata && subscription.metadata.plan || '',
    priceId: subscriptionPriceId(subscription)
  });
}

async function markBySubscription(env, subscriptionId, status, periodEnd) {
  const userId = await userIdBySubscription(env, subscriptionId);
  if (!userId) return;
  await upsertMembership(env, { userId, customerId: '', subscriptionId, status, periodEnd, plan: '', priceId: '' });
}

async function userIdBySubscription(env, subscriptionId) {
  if (!subscriptionId) return '';
  const row = await env.DB.prepare(
    'select user_id from memberships where stripe_subscription_id = ? limit 1',
  ).bind(subscriptionId).first();
  return row ? row.user_id : '';
}

async function upsertMembership(env, data) {
  await env.DB.prepare(
    `insert into memberships
      (user_id, status, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan, current_period_end, updated_at, created_at)
     values (?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
     on conflict(user_id) do update set
      status = excluded.status,
      stripe_customer_id = coalesce(nullif(excluded.stripe_customer_id, ''), memberships.stripe_customer_id),
      stripe_subscription_id = coalesce(nullif(excluded.stripe_subscription_id, ''), memberships.stripe_subscription_id),
      stripe_price_id = coalesce(nullif(excluded.stripe_price_id, ''), memberships.stripe_price_id),
      plan = coalesce(nullif(excluded.plan, ''), memberships.plan),
      current_period_end = coalesce(nullif(excluded.current_period_end, ''), memberships.current_period_end),
      updated_at = datetime("now")`
  ).bind(
    data.userId,
    data.status,
    data.customerId || '',
    data.subscriptionId || '',
    data.priceId || '',
    data.plan || '',
    data.periodEnd || '',
  ).run();
  if (data.customerId) {
    await env.DB.prepare('update users set stripe_customer_id = ? where id = ?').bind(data.customerId, data.userId).run();
  }
}
