import { json } from '../_lib/auth.js';

export async function onRequestGet(context) {
  return json({
    turnstileSiteKey: context.env.TURNSTILE_SITE_KEY || '',
    emailVerificationRequired: String(context.env.REQUIRE_EMAIL_VERIFICATION || '').toLowerCase() === 'true'
  });
}
