import { json } from '../_lib/auth.js';

export async function onRequestGet(context) {
  return json({
    turnstileSiteKey: context.env.TURNSTILE_SITE_KEY || '',
    turnstileConfigured: !!context.env.TURNSTILE_SECRET_KEY,
    emailProviderConfigured: !!(context.env.RESEND_API_KEY && context.env.EMAIL_FROM),
    emailVerificationRequired: String(context.env.REQUIRE_EMAIL_VERIFICATION || '').toLowerCase() === 'true',
    passwordResetDebugLinks: String(context.env.PASSWORD_RESET_DEBUG_LINKS || '').toLowerCase() === 'true',
    stripeSecretConfigured: !!context.env.STRIPE_SECRET_KEY,
    stripeMonthlyConfigured: !!(context.env.STRIPE_PRICE_ID_MONTHLY || context.env.STRIPE_PRICE_ID),
    stripeAnnualConfigured: !!context.env.STRIPE_PRICE_ID_ANNUAL,
    stripeWebhookConfigured: !!context.env.STRIPE_WEBHOOK_SECRET
  });
}
