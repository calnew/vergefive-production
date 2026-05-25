import { getAuth, json, requireSameOrigin } from '../../_lib/auth.js';
import { siteUrl, stripeRequest } from '../../_lib/stripe.js';

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  if (!auth.user.stripeCustomerId) return json({ error: 'No Stripe customer is linked to this account yet.' }, 400);
  const portal = await stripeRequest(context.env, '/billing_portal/sessions', {
    customer: auth.user.stripeCustomerId,
    return_url: `${siteUrl(context.request, context.env)}/account/`
  });
  if (portal instanceof Response) return portal;
  return json({ url: portal.url });
}
