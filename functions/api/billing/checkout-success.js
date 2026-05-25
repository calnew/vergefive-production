import { json, normalizeEmail, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { stripeGet } from '../../_lib/stripe.js';
import { attachReferralToUser } from '../../_lib/affiliates.js';
import { createPasswordReset } from '../../_lib/security.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);

    const input = await readJson(context.request).catch(() => ({}));
    const sessionId = String(input.sessionId || input.session_id || '').trim();
    if (!/^cs_(test|live)_[a-zA-Z0-9]+/.test(sessionId)) {
      return json({ error: 'Checkout session is missing.' }, 400);
    }

    const session = await stripeGet(context.env, `/checkout/sessions/${encodeURIComponent(sessionId)}`, {});
    if (session instanceof Response) return session;
    if (session.status !== 'complete' || !['paid', 'no_payment_required'].includes(session.payment_status)) {
      return json({ error: 'Payment has not been confirmed yet. Please wait a moment and try again.' }, 409);
    }

    const userId = await resolvePaidCheckoutUser(context.env, session, context.request);
    if (!userId) return json({ error: 'We could not find the checkout email from Stripe.' }, 400);

    await upsertMembership(context.env, {
      userId,
      customerId: session.customer || '',
      subscriptionId: session.subscription || '',
      status: 'active',
      periodEnd: '',
      plan: session.metadata && session.metadata.plan || ''
    });

    const email = await emailForUser(context.env, userId);
    if (!email) return json({ error: 'Member email was not found.' }, 400);
    const reset = await createPasswordReset(context.env, userId, email, context.request);
    const emailResult = reset && reset.emailResult ? reset.emailResult : {};
    if (!emailResult.sent) {
      console.error('Resend password email failed', emailResult);
      return json({ error: 'Access link was created, but Resend did not accept the email.', detail: safeEmailError(emailResult) }, 502);
    }

    return json({ ok: true, message: 'Access email sent. Check the inbox used at checkout.', emailId: emailResult.id || '' });
  } catch (error) {
    console.error('checkout access recovery failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to send the access email yet.' }, 500);
  }
}

async function resolvePaidCheckoutUser(env, session, request) {
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
  if (existing && existing.id) {
    if (session.customer) await env.DB.prepare('update users set stripe_customer_id = ? where id = ?').bind(session.customer, existing.id).run();
    return existing.id;
  }

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
  return userId;
}

async function emailForUser(env, userId) {
  const row = await env.DB.prepare('select email from users where id = ? limit 1').bind(userId).first();
  return row && row.email ? row.email : '';
}

async function upsertMembership(env, data) {
  await env.DB.prepare(
    `insert into memberships
      (user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, plan, updated_at, created_at)
     values (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
     on conflict(user_id) do update set
      status = excluded.status,
      stripe_customer_id = coalesce(nullif(excluded.stripe_customer_id, ''), memberships.stripe_customer_id),
      stripe_subscription_id = coalesce(nullif(excluded.stripe_subscription_id, ''), memberships.stripe_subscription_id),
      current_period_end = coalesce(nullif(excluded.current_period_end, ''), memberships.current_period_end),
      plan = coalesce(nullif(excluded.plan, ''), memberships.plan),
      updated_at = datetime("now")`
  ).bind(data.userId, data.status, data.customerId || '', data.subscriptionId || '', data.periodEnd || '', data.plan || '').run();
  if (data.customerId) {
    await env.DB.prepare('update users set stripe_customer_id = ? where id = ?').bind(data.customerId, data.userId).run();
  }
}

function cleanCheckoutName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

function safeEmailError(result) {
  const raw = result && result.reason ? String(result.reason) : 'No response from email provider.';
  return raw.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]').slice(0, 500);
}
