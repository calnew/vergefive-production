import { getAuth, json, rateLimit, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { createEmailVerification } from '../../_lib/security.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const auth = await getAuth(context.request, context.env);
    if (!auth) return json({ error: 'Login required.' }, 401);
    if (auth.user.emailVerifiedAt) return json({ ok: true, alreadyVerified: true });
    const limited = await rateLimit(context.env, `verify:${auth.user.id}`, { limit: 3, windowSeconds: 3600 });
    if (!limited.ok) return limited.response;
    const url = await createEmailVerification(context.env, auth.user.id, auth.user.email, context.request);
    return json({
      ok: true,
      emailProviderConfigured: !!(context.env.RESEND_API_KEY && context.env.EMAIL_FROM),
      verificationUrl: context.env.RESEND_API_KEY ? undefined : url
    });
  } catch (error) {
    console.error('resend verification failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to send verification email.' }, 500);
  }
}
