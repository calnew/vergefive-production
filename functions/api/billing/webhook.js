import { cleanLimited, json } from '../../_lib/auth.js';
import { verifyStripeSignature } from '../../_lib/stripe.js';
import { ensureCommissionForCheckout, recordPaidInvoice } from '../../_lib/affiliates.js';

const VERGE_FIVE_PRODUCT = 'verge-five-membership';

function isVergeFiveCheckout(session) {
  const metadata = session && session.metadata || {};
  return metadata.product === VERGE_FIVE_PRODUCT
    && metadata.product_plan === 'self-serve'
    && ['monthly', 'annual'].includes(String(metadata.plan || ''));
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

  const reservation = await reserveEvent(context.env, event);
  if (reservation.duplicate) return json({ received: true, duplicate: true });
  if (reservation.busy) return json({ error: 'Webhook event is already processing.' }, 409);

  const object = event.data && event.data.object ? event.data.object : {};
  try {
    if (event.type === 'checkout.session.completed' && isVergeFiveCheckout(object)) {
      await handleCheckoutCompleted(context.env, object);
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

async function handleCheckoutCompleted(env, session) {
  const userId = session.client_reference_id || session.metadata && session.metadata.user_id;
  if (!userId) return;
  await env.DB.prepare('update users set stripe_customer_id = ? where id = ?').bind(session.customer || '', userId).run();
  await upsertMembership(env, {
    userId,
    customerId: session.customer || '',
    subscriptionId: session.subscription || '',
    status: session.payment_status === 'paid' ? 'active' : 'pending',
    periodEnd: ''
  });
  await ensureCommissionForCheckout(env, session);
}

async function subscriptionBelongsToVergeFive(env, subscription) {
  if (subscription && subscription.metadata && subscription.metadata.product === VERGE_FIVE_PRODUCT) return true;
  const id = String(subscription && subscription.id || '');
  if (!id) return false;
  const row = await env.DB.prepare(
    'select user_id from memberships where stripe_subscription_id = ? limit 1',
  ).bind(id).first();
  return !!row;
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
    periodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : ''
  });
}

async function markBySubscription(env, subscriptionId, status, periodEnd) {
  const userId = await userIdBySubscription(env, subscriptionId);
  if (!userId) return;
  await upsertMembership(env, { userId, customerId: '', subscriptionId, status, periodEnd });
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
      (user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at, created_at)
     values (?, ?, ?, ?, ?, datetime("now"), datetime("now"))
     on conflict(user_id) do update set
      status = excluded.status,
      stripe_customer_id = coalesce(nullif(excluded.stripe_customer_id, ''), memberships.stripe_customer_id),
      stripe_subscription_id = coalesce(nullif(excluded.stripe_subscription_id, ''), memberships.stripe_subscription_id),
      current_period_end = coalesce(nullif(excluded.current_period_end, ''), memberships.current_period_end),
      updated_at = datetime("now")`
  ).bind(data.userId, data.status, data.customerId || '', data.subscriptionId || '', data.periodEnd || '').run();
  if (data.customerId) {
    await env.DB.prepare('update users set stripe_customer_id = ? where id = ?').bind(data.customerId, data.userId).run();
  }
}
