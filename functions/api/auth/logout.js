import { destroySession, expiredSessionCookie, json, requireSameOrigin } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  await destroySession(context.env, context.request);
  return json({ ok: true }, 200, { 'set-cookie': expiredSessionCookie(context.request) });
}
