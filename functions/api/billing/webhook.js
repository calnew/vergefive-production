import { json, normalizeEmail } from '../../_lib/auth.js';
import { verifyStripeSignature } from '../../_lib/stripe.js';
import { attachReferralToUser, ensureCommissionForCheckout, recordPaidInvoice } from '../../_lib/affiliates.js';
import { createPasswordReset } from '../../_lib/security.js';

export async function onRequestPost(context) {
  if (!context.env.DB) return json({ error: 'D1 binding DB is not configured.' }, 500);
  const rawBody = await context.request.text();
  const verified = await verifyStripeSignature(context.request, context.env, rawBody);
  if (!verified) return json({ error: 'Invalid webhook signature.' }, 400);

  const event = JSON.parse(rawBody);
  const eventId = String(event.id || '').trim();
  if (eventId) {
    await context.env.DB.prepare(
      `create table if not exists stripe_webhook_events (
        id text primary key,
        event_type text,
        created_at text not null default (datetime('now'))
      )`
    ).run();
    try {
      await context.env.DB.prepare(
        'insert into stripe_webhook_events (id, event_type, created_at) values (?, ?, datetime("now"))'
      ).bind(eventId, String(event.type || '')).run();
    } catch (error) {
      return json({ received: true, duplicate: true });
    }
  }
  const object = event.data && event.data.object ? event.data.object : {};
  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(context.env, object, context.request);
    }
    if (event.type === 'invoice.paid') {
      await recordPaidInvoice(context.env, object);
    }
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await handleSubscription(context.env, object);
    }
    if (event.type === 'invoice.payment_failed') {
      await markByCustomer(context.env, object.customer, 'past_due', '');
    }
    return json({ received: true });
  } catch (error) {
    return json({ error: 'Webhook handler failed.' }, 500);
  }
}

async function handleCheckoutCompleted(env, session, request) {
  const userId = await resolveCheckoutUserId(env, session, request);
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

async function resolveCheckoutUserId(env, session, request) {
  const metadata = session.metadata || {};
  const existingUserId = session.client_reference_id || metadata.user_id || '';
  if (existingUserId) return existingUserId;

  const email = normalizeEmail(
    session.customer_details && session.customer_details.email ||
    session.customer_email ||
    metadata.checkout_email ||
    ''
  );
  if (!email) return '';

  const existing = await env.DB.prepare('select id from users where email = ? limit 1').bind(email).first();
  if (existing && existing.id) return existing.id;

  const userId = crypto.randomUUID();
  const name = cleanCheckoutName(
    session.customer_details && session.customer_details.name ||
    metadata.checkout_name ||
    ''
  );
  await env.DB.prepare(
    `insert into users (id, email, name, auth_provider, stripe_customer_id, email_verified_at, created_at)
     values (?, ?, ?, 'stripe_checkout', ?, datetime('now'), datetime('now'))`
  ).bind(userId, email, name, session.customer || '').run();

  const code = metadata.affiliate_code ? String(metadata.affiliate_code) : '';
  if (code) await attachReferralToUser(env, userId, code, request).catch(() => null);
  await createPasswordReset(env, userId, email, request).then((result) => { if (result && result.emailResult && !result.emailResult.sent) console.error('checkout password email failed', result.emailResult); }).catch((error) => console.error('checkout password reset failed', error && error.message ? error.message : error));
  return userId;
}

function cleanCheckoutName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}
async function handleSubscription(env, subscription) {
  const userId = subscription.metadata && subscription.metadata.user_id
    ? subscription.metadata.user_id
    : await userIdByCustomer(env, subscription.customer);
  if (!userId) return;
  await upsertMembership(env, {
    userId,
    customerId: subscription.customer || '',
    subscriptionId: subscription.id || '',
    status: subscription.status || 'pending',
    periodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : ''
  });
}

async function markByCustomer(env, customerId, status, periodEnd) {
  const userId = await userIdByCustomer(env, customerId);
  if (!userId) return;
  await upsertMembership(env, { userId, customerId, subscriptionId: '', status, periodEnd });
}

async function userIdByCustomer(env, customerId) {
  if (!customerId) return '';
  const row = await env.DB.prepare('select id from users where stripe_customer_id = ?').bind(customerId).first();
  return row ? row.id : '';
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
