import { getAuth, getCookie, json, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { siteUrl, stripeGet, stripeRequest } from '../../_lib/stripe.js';
import { attachReferralToUser, normalizeAffiliateCode, referralForUser } from '../../_lib/affiliates.js';

const EXPECTED_PRICE_AMOUNT = {
  monthly: 4900,
  annual: 59700
};
const EXPECTED_PRICE_INTERVAL = {
  monthly: 'month',
  annual: 'year'
};
const INTRO_MONTHLY_CODE = 'INTRO7';
const INTRO_MONTHLY_COUPON_ID = 'vf_intro_first_month_7';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const auth = await getAuth(context.request, context.env);
    const input = await readJson(context.request).catch(() => ({}));
    const requestedPlan = String(input.plan || 'monthly').toLowerCase();
    const plan = requestedPlan === 'annual' || requestedPlan === 'yearly' ? 'annual' : 'monthly';
    const guestEmail = auth ? '' : normalizeCheckoutEmail(input.email || input.customerEmail || '');
    const guestName = auth ? '' : cleanCheckoutText(input.name || input.customerName || '', 120);
    const priceId = plan === 'annual'
      ? context.env.STRIPE_PRICE_ID_ANNUAL
      : (context.env.STRIPE_PRICE_ID_MONTHLY || context.env.STRIPE_PRICE_ID);
    if (!priceId) {
      return json({ error: plan === 'annual' ? 'Annual Stripe price ID is not configured.' : 'Monthly Stripe price ID is not configured.' }, 500);
    }
    const priceGuard = await verifyCheckoutPrice(context.env, priceId, plan);
    if (priceGuard) return priceGuard;

    const origin = siteUrl(context.request, context.env);
    const couponCode = cleanCouponCode(input.couponCode || input.promoCode || input.discountCode || (plan === 'monthly' ? INTRO_MONTHLY_CODE : ''));
    let promotionCode = null;
    if (couponCode) {
      const promoList = await stripeGet(context.env, '/promotion_codes', { active: true, code: couponCode, limit: 1 });
      if (promoList instanceof Response) return promoList;
      promotionCode = promoList.data && promoList.data[0];
      if (!promotionCode && couponCode === INTRO_MONTHLY_CODE && plan === 'monthly') {
        promotionCode = await ensureMonthlyIntroPromotionCode(context.env);
        if (promotionCode instanceof Response) return promotionCode;
      }
      if (!promotionCode) return json({ error: 'That coupon code is not active.' }, 400);
    }
    const postedCode = normalizeAffiliateCode(input.affiliateCode || input.ref || '');
    const cookieCode = normalizeAffiliateCode(getCookie(context.request, 'vf_affiliate'));
    let referral = auth ? await referralForUser(context.env, auth.user.id) : null;
    if (auth && !referral && (postedCode || cookieCode)) {
      const affiliate = await attachReferralToUser(context.env, auth.user.id, postedCode || cookieCode, context.request);
      if (!affiliate && postedCode) return json({ error: 'That affiliate code is not active.' }, 400);
      referral = await referralForUser(context.env, auth.user.id);
    }
    const metadata = {
      user_id: auth ? auth.user.id : '',
      product: 'verge-five-membership',
      plan,
      checkout_name: guestName,
      checkout_email: guestEmail,
      affiliate_id: referral ? referral.affiliate_id : '',
      affiliate_code: referral ? referral.referral_code : (postedCode || cookieCode || ''),
      coupon_code: couponCode || ''
    };
    const checkoutPayload = {
      mode: 'subscription',
      customer_email: auth && !auth.user.stripeCustomerId ? auth.user.email : (guestEmail || undefined),
      customer: auth && auth.user.stripeCustomerId ? auth.user.stripeCustomerId : undefined,
      client_reference_id: auth ? auth.user.id : undefined,
      'line_items': [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout-success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/membership/?checkout=cancel&plan=${encodeURIComponent(plan)}`,
      allow_promotion_codes: promotionCode ? undefined : true,
      discounts: promotionCode ? [{ promotion_code: promotionCode.id }] : undefined,
      'metadata': metadata,
      'subscription_data': { metadata }
    };
    const session = await stripeRequest(context.env, '/checkout/sessions', checkoutPayload);
    if (session instanceof Response) return session;
    return json({ url: session.url });
  } catch (error) {
    console.error('checkout session failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to start checkout.' }, 500);
  }
}

async function verifyCheckoutPrice(env, priceId, plan) {
  const price = await stripeGet(env, `/prices/${encodeURIComponent(priceId)}`, {});
  if (price instanceof Response) return price;
  const expectedAmount = EXPECTED_PRICE_AMOUNT[plan];
  const expectedInterval = EXPECTED_PRICE_INTERVAL[plan];
  const actualAmount = Number(price.unit_amount || 0);
  const actualInterval = price.recurring && price.recurring.interval || '';
  if (actualAmount !== expectedAmount || actualInterval !== expectedInterval) {
    return json({
      error: plan === 'annual'
        ? 'Annual checkout is not ready. Stripe must point to a $597/year recurring price before this plan can be sold.'
        : 'Monthly checkout is not ready. Stripe must point to a $49/month recurring price before this plan can be sold.'
    }, 500);
  }
  return null;
}

async function ensureMonthlyIntroPromotionCode(env) {
  const coupon = await stripeRequest(env, '/coupons', {
    id: INTRO_MONTHLY_COUPON_ID,
    name: 'Verge Five first month for $7',
    amount_off: 4200,
    currency: 'usd',
    duration: 'once',
    metadata: {
      offer: 'monthly_intro_first_month_7'
    }
  });
  if (coupon instanceof Response) {
    // If the coupon already exists, Stripe rejects the duplicate create. Keep going
    // and attach the promotion code to the known coupon id.
  }
  const promotionCode = await stripeRequest(env, '/promotion_codes', {
    promotion: { type: 'coupon', coupon: INTRO_MONTHLY_COUPON_ID },
    code: INTRO_MONTHLY_CODE,
    active: true,
    metadata: {
      offer: 'monthly_intro_first_month_7'
    }
  });
  return promotionCode;
}

function cleanCouponCode(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64).toUpperCase();
}


function normalizeCheckoutEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 254);
}

function cleanCheckoutText(value, limit) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, limit || 120);
}
