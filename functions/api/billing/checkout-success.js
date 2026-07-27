import { cleanLimited, json, normalizeEmail, rateLimit, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { requireDevStripeTestMode, stripeGet } from '../../_lib/stripe.js';
import { attachReferralToUser } from '../../_lib/affiliates.js';
import { createPasswordReset } from '../../_lib/security.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const devModeError = requireDevStripeTestMode(context.request, context.env);
    if (devModeError) return devModeError;

    const input = await readJson(context.request).catch(() => ({}));
    const sessionId = String(input.sessionId || input.session_id || '').trim();
    if (!/^cs_(test|live)_[a-zA-Z0-9]+/.test(sessionId)) {
      return json({ error: 'Checkout session is missing.' }, 400);
    }
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const limited = await rateLimit(context.env, `checkout-success:${ip}:${sessionId}`, { limit: 4, windowSeconds: 3600 });
    if (!limited.ok) return limited.response;

    const session = await stripeGet(context.env, `/checkout/sessions/${encodeURIComponent(sessionId)}`, {});
    if (session instanceof Response) return session;
    if (session.status !== 'complete' || !['paid', 'no_payment_required'].includes(session.payment_status)) {
      return json({ error: 'Payment has not been confirmed yet. Please wait a moment and try again.' }, 409);
    }
    const verifiedPriceId = await verifiedVergeFiveCheckoutPriceId(context.env, session);
    if (!verifiedPriceId) {
      return json({ error: 'This checkout session does not belong to the Verge Five self-serve membership.' }, 400);
    }

    const reservation = await reserveCheckoutAccess(context.env, sessionId);
    if (reservation.completed) {
      return json({ ok: true, alreadyProcessed: true, message: 'Access was already prepared for this checkout.' });
    }
    if (reservation.busy) return json({ error: 'Checkout access is already being prepared.' }, 409);

    try {
      const userId = await resolvePaidCheckoutUser(context.env, session, context.request);
      if (!userId) throw new Error('Checkout user could not be resolved.');
      await context.env.DB.prepare(
        'update checkout_access_events set user_id = ?, updated_at = datetime("now") where session_id = ?',
      ).bind(userId, sessionId).run();

      await upsertMembership(context.env, {
        userId,
        customerId: session.customer || '',
        subscriptionId: session.subscription || '',
        status: 'active',
        periodEnd: '',
        plan: session.metadata && session.metadata.plan || '',
        priceId: verifiedPriceId
      });

      const email = await emailForUser(context.env, userId);
      if (!email) throw new Error('Member email was not found.');
      const reset = await createPasswordReset(context.env, userId, email, context.request);
      const emailResult = reset && reset.emailResult ? reset.emailResult : {};
      if (!emailResult.sent) {
        console.error('Resend password email failed', emailResult);
        await failCheckoutAccess(context.env, sessionId, safeEmailError(emailResult));
        return json({ error: 'Access link was created, but Resend did not accept the email.', detail: safeEmailError(emailResult) }, 502);
      }

      await completeCheckoutAccess(context.env, sessionId);
      return json({ ok: true, message: 'Access email sent. Check the inbox used at checkout.', emailId: emailResult.id || '' });
    } catch (error) {
      await failCheckoutAccess(context.env, sessionId, error && error.message || error).catch(() => null);
      throw error;
    }
  } catch (error) {
    console.error('checkout access recovery failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to send the access email yet.' }, 500);
  }
}

function configuredPriceId(env, plan) {
  return String(plan || '') === 'annual'
    ? String(env.STRIPE_PRICE_ID_ANNUAL || '')
    : String(env.STRIPE_PRICE_ID_MONTHLY || env.STRIPE_PRICE_ID || '');
}

async function verifiedVergeFiveCheckoutPriceId(env, session) {
  const metadata = session && session.metadata || {};
  const expectedPriceId = configuredPriceId(env, metadata.plan);
  const lineItems = await stripeGet(env, `/checkout/sessions/${encodeURIComponent(session.id)}/line_items`, { limit: 1 });
  if (lineItems instanceof Response) return false;
  const price = lineItems && lineItems.data && lineItems.data[0] && lineItems.data[0].price;
  const actualPriceId = String(price && (price.id || price) || '');
  const valid = session.mode === 'subscription'
    && String(session.subscription || '').startsWith('sub_')
    && metadata.product === 'verge-five-membership'
    && metadata.product_plan === 'self-serve'
    && ['monthly', 'annual'].includes(String(metadata.plan || ''))
    && !!expectedPriceId
    && (!metadata.price_id || String(metadata.price_id) === expectedPriceId)
    && actualPriceId === expectedPriceId;
  return valid ? actualPriceId : '';
}

async function reserveCheckoutAccess(env, sessionId) {
  const existing = await env.DB.prepare(
    'select status, updated_at from checkout_access_events where session_id = ? limit 1',
  ).bind(sessionId).first();
  if (existing && existing.status === 'completed') return { completed: true };
  if (existing && existing.status === 'processing' && Date.parse(existing.updated_at || '') > Date.now() - 5 * 60 * 1000) {
    return { busy: true };
  }
  if (existing) {
    await env.DB.prepare(
      `update checkout_access_events
       set status = 'processing', attempts = attempts + 1, updated_at = datetime('now')
       where session_id = ?`,
    ).bind(sessionId).run();
    return {};
  }
  try {
    await env.DB.prepare(
      `insert into checkout_access_events
        (session_id, status, attempts, created_at, updated_at)
       values (?, 'processing', 1, datetime('now'), datetime('now'))`,
    ).bind(sessionId).run();
    return {};
  } catch {
    return { busy: true };
  }
}

async function completeCheckoutAccess(env, sessionId) {
  await env.DB.prepare(
    `update checkout_access_events
     set status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
     where session_id = ?`,
  ).bind(sessionId).run();
}

async function failCheckoutAccess(env, sessionId, error) {
  await env.DB.prepare(
    `update checkout_access_events
     set status = 'failed', updated_at = datetime('now')
     where session_id = ?`,
  ).bind(sessionId).run();
  console.error('checkout access processing failed', cleanLimited(error, 500));
}

async function resolvePaidCheckoutUser(env, session, request) {
  const metadata = session.metadata || {};
  const existingUserId = session.client_reference_id || metadata.user_id || '';
  if (existingUserId) {
    const existing = await env.DB.prepare('select id from users where id = ? limit 1').bind(existingUserId).first();
    if (existing && existing.id) return existing.id;
  }

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
      (user_id, status, stripe_customer_id, stripe_subscription_id, stripe_price_id, current_period_end, plan, updated_at, created_at)
     values (?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
     on conflict(user_id) do update set
      status = excluded.status,
      stripe_customer_id = coalesce(nullif(excluded.stripe_customer_id, ''), memberships.stripe_customer_id),
      stripe_subscription_id = coalesce(nullif(excluded.stripe_subscription_id, ''), memberships.stripe_subscription_id),
      stripe_price_id = coalesce(nullif(excluded.stripe_price_id, ''), memberships.stripe_price_id),
      current_period_end = coalesce(nullif(excluded.current_period_end, ''), memberships.current_period_end),
      plan = coalesce(nullif(excluded.plan, ''), memberships.plan),
      updated_at = datetime("now")`
  ).bind(
    data.userId,
    data.status,
    data.customerId || '',
    data.subscriptionId || '',
    data.priceId || '',
    data.periodEnd || '',
    data.plan || '',
  ).run();
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
