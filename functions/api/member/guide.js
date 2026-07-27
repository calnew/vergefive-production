import { getAuth, json, requireSameOrigin } from '../../_lib/auth.js';

const GUIDE_KEY = 'member-guide-v1';

export async function onRequestGet(context) {
  const auth = await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const row = await context.env.DB.prepare(
    'select preference_value, updated_at from member_preferences where user_id = ? and preference_key = ?'
  ).bind(auth.user.id, GUIDE_KEY).first();
  return json({ seen: row ? row.preference_value === 'seen' : false, updatedAt: row ? row.updated_at : '' });
}

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  await context.env.DB.prepare(
    `insert into member_preferences (user_id, preference_key, preference_value, updated_at)
     values (?, ?, 'seen', datetime('now'))
     on conflict(user_id, preference_key) do update set
       preference_value = 'seen',
       updated_at = datetime('now')`
  ).bind(auth.user.id, GUIDE_KEY).run();
  return json({ ok: true, seen: true });
}
