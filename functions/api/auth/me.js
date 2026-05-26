import { getAuth, isAdminEmail, json } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const auth = await getAuth(context.request, context.env);
  if (!auth) return json({ user: null, membership: { status: 'none' }, active: false });
  return json({ ...auth, isAdmin: isAdminEmail(auth.user.email, context.env) });
}
