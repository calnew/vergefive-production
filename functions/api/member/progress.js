import { cleanLimited, getAuth, json, readJson, requireSameOrigin } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const progress = await context.env.DB.prepare('select page_path, completed_indexes, last_opened_at from lesson_progress where user_id = ?').bind(auth.user.id).all();
  const signals = await context.env.DB.prepare('select signal_type, selected_keys, updated_at from readiness_signals where user_id = ?').bind(auth.user.id).all();
  const resume = await context.env.DB.prepare('select page_path, page_title, breadcrumb, updated_at from resume_locations where user_id = ?').bind(auth.user.id).first();
  return json({ progress: progress.results || [], signals: signals.results || [], resume: resume || null });
}

export async function onRequestPut(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const input = await readJson(context.request);
  if (input.pagePath) {
    const indexes = Array.isArray(input.completedIndexes)
      ? input.completedIndexes.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 0 && item < 100).slice(0, 100)
      : [];
    await context.env.DB.prepare(
      `insert into lesson_progress (user_id, page_path, completed_indexes, last_opened_at)
       values (?, ?, ?, datetime("now"))
       on conflict(user_id, page_path) do update set
        completed_indexes = excluded.completed_indexes,
        last_opened_at = datetime("now")`
    ).bind(auth.user.id, cleanLimited(input.pagePath, 160), JSON.stringify(indexes)).run();
    await context.env.DB.prepare(
      `insert into resume_locations (user_id, page_path, page_title, breadcrumb, updated_at)
       values (?, ?, ?, ?, datetime("now"))
       on conflict(user_id) do update set
        page_path = excluded.page_path,
        page_title = excluded.page_title,
        breadcrumb = excluded.breadcrumb,
        updated_at = datetime("now")`
    ).bind(auth.user.id, cleanLimited(input.pagePath, 160), cleanLimited(input.pageTitle, 180), cleanLimited(input.breadcrumb, 180)).run();
  }
  if (input.signalType) {
    const keys = Array.isArray(input.selectedKeys)
      ? input.selectedKeys.map((item) => cleanLimited(item, 80)).filter(Boolean).slice(0, 100)
      : [];
    await context.env.DB.prepare(
      `insert into readiness_signals (user_id, signal_type, selected_keys, updated_at)
       values (?, ?, ?, datetime("now"))
       on conflict(user_id, signal_type) do update set
        selected_keys = excluded.selected_keys,
        updated_at = datetime("now")`
    ).bind(auth.user.id, cleanLimited(input.signalType, 80), JSON.stringify(keys)).run();
  }
  return json({ ok: true });
}
