import { getAuth, getCookie, json, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { requireDevStripeTestMode, siteUrl, stripeGet, stripeRequest } from '../../_lib/stripe.js';

import { attachReferralToUser, normalizeAffiliateCode, referralForUser } from '../../_lib/affiliates.js';

const CHECKOUT_SESSION_LIST_LIMIT = 20;
const OPEN_CHECKOUT_WINDOW_SECONDS = 45 * 60;

function pickOpenCheckoutSessionUrl(sessions, userId, plan, priceId) {
  const now = Math.floor(Date.now() / 1000);
  if (!Array.isArray(sessions)) return null;
  for (let i = 0; i < sessions.length; i += 1) {
    const session = sessions[i];
    if (!session || typeof session !== 'object') continue;
    if (session.status !== 'open') continue;
    if (String(session.client_reference_id || '') !== String(userId || '')) continue;
    if (String(session.metadata && session.metadata.plan) !== String(plan || '')) continue;
    if (String(session.metadata && session.metadata.price_id) !== String(priceId || '')) continue;
    const created = Number(session.created || 0);
    if (!created || now - created > OPEN_CHECKOUT_WINDOW_SECONDS) continue;
    if (!session.url) continue;
    return session.url;
  }
  return null;
}

async function findOpenCheckoutSessionUrl(env, userId, customerId, plan, priceId) {
  if (!customerId) return null;
  const sessionList = await stripeGet(env, '/checkout/sessions', { customer: customerId, limit: CHECKOUT_SESSION_LIST_LIMIT });
  if (sessionList instanceof Response) return null;
  if (!sessionList || sessionList.error) return null;
  return pickOpenCheckoutSessionUrl(sessionList.data || [], userId, plan, priceId);
}

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const devModeError = requireDevStripeTestMode(context.request, context.env);
    if (devModeError) return devModeError;
    const auth = await getAuth(context.request, context.env);
    if (!auth) return json({ error: 'Login required before checkout.' }, 401);
    const input = await readJson(context.request).catch(() => ({}));
    const productPlan = String(input.productPlan || input.product_plan || 'self-serve').toLowerCase().replace(/_/g, '-');
    if (productPlan && productPlan !== 'self-serve') {
      return json({ error: 'Done-With-You checkout is not configured for self-service yet. Please contact Verge Five support.' }, 400);
    }
    const requestedPlan = String(input.plan || input.billing || 'monthly').toLowerCase();
    const plan = requestedPlan === 'annual' || requestedPlan === 'yearly' ? 'annual' : 'monthly';
    const priceId = plan === 'annual'
      ? context.env.STRIPE_PRICE_ID_ANNUAL
      : (context.env.STRIPE_PRICE_ID_MONTHLY || context.env.STRIPE_PRICE_ID);
    if (!priceId) {
      return json({ error: plan === 'annual' ? 'Annual Stripe price ID is not configured.' : 'Monthly Stripe price ID is not configured.' }, 500);
    }

    const origin = siteUrl(context.request, context.env);
    const postedCode = normalizeAffiliateCode(input.affiliateCode || input.ref || '');
    const cookieCode = normalizeAffiliateCode(getCookie(context.request, 'vf_affiliate'));
    let referral = await referralForUser(context.env, auth.user.id);
    if (!referral && (postedCode || cookieCode)) {
      const affiliate = await attachReferralToUser(context.env, auth.user.id, postedCode || cookieCode, context.request);
      if (!affiliate && postedCode) return json({ error: 'That affiliate code is not active.' }, 400);
      referral = await referralForUser(context.env, auth.user.id);
    }
    const existingSessionUrl = await findOpenCheckoutSessionUrl(
      context.env,
      auth.user.id,
      auth.user.stripeCustomerId,
      plan,
      priceId
    );
    if (existingSessionUrl) return json({ url: existingSessionUrl });
    const metadata = {
      user_id: auth.user.id,
      product: 'verge-five-membership',
      plan,
      price_id: priceId,
      product_plan: productPlan,
      affiliate_id: referral ? referral.affiliate_id : '',
      affiliate_code: referral ? referral.referral_code : ''
    };
    const idempotencyKey = `legacy-checkout:${auth.user.id}:${plan}`;
    const session = await stripeRequest(context.env, '/checkout/sessions', {
      mode: 'subscription',
      customer_email: auth.user.stripeCustomerId ? undefined : auth.user.email,
      customer: auth.user.stripeCustomerId || undefined,
      client_reference_id: auth.user.id,
      'line_items': [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/?checkout=success`,
      cancel_url: `${origin}/signup?plan=self-serve&billing=${encodeURIComponent(plan === 'annual' ? 'yearly' : 'monthly')}&canceled=1`,
      allow_promotion_codes: true,
      'metadata': metadata,
      'subscription_data': { metadata }
    }, { idempotencyKey });
    if (session instanceof Response) return session;
    return json({ url: session.url });
  } catch (error) {
    console.error('checkout session failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to start checkout.' }, 500);
  }
}
