import { getAuth, getCookie, json, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { siteUrl, stripeRequest } from '../../_lib/stripe.js';
import { attachReferralToUser, normalizeAffiliateCode, referralForUser } from '../../_lib/affiliates.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const auth = await getAuth(context.request, context.env);
    if (!auth) return json({ error: 'Login required before checkout.' }, 401);
    const input = await readJson(context.request).catch(() => ({}));
    const requestedPlan = String(input.plan || 'monthly').toLowerCase();
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
    const metadata = {
      user_id: auth.user.id,
      product: 'verge-five-membership',
      plan,
      affiliate_id: referral ? referral.affiliate_id : '',
      affiliate_code: referral ? referral.referral_code : ''
    };
    const session = await stripeRequest(context.env, '/checkout/sessions', {
      mode: 'subscription',
      customer_email: auth.user.stripeCustomerId ? undefined : auth.user.email,
      customer: auth.user.stripeCustomerId || undefined,
      client_reference_id: auth.user.id,
      'line_items': [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/?checkout=success`,
      cancel_url: `${origin}/membership/?checkout=cancel&plan=${encodeURIComponent(plan)}`,
      allow_promotion_codes: true,
      'metadata': metadata,
      'subscription_data': { metadata }
    });
    if (session instanceof Response) return session;
    return json({ url: session.url });
  } catch (error) {
    console.error('checkout session failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to start checkout.' }, 500);
  }
}
