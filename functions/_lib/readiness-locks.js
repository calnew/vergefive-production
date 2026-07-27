import { cleanLimited } from './auth.js';

export const ADVANCED_READINESS_PREFIXES = [
  '/about-net-30/',
  '/nav-ecredable/',
  '/revolving-business-credit-cards/',
  '/starter-net-30-vendors/',
  '/office-and-cleaning/',
  '/building-and-industrial/',
  '/retail-and-wholesale/',
  '/retail-and-fleet/',
  '/gas-fleet-and-auto/',
  '/high-tech-auto-vendors/',
  '/starter-cards/',
  '/general-credit-cards/',
  '/business-assets-equipment/',
  '/cd-business-loans/',
  '/business-plan-report/',
  '/final-readiness-summary/',
  '/downloads/',
  '/Resources/files/'
];

const FAST_CLICK_WINDOW_MINUTES = 30;
const FAST_CLICK_DISTINCT_PAGES = 12;
const FAST_CLICK_LOCK_DAYS = 7;

export function isAdvancedReadinessPath(pathname) {
  return ADVANCED_READINESS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export async function ensureReadinessLockSchema(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured.');
}

export async function recordMemberPageAccess(env, userId, pathname) {
  if (!env.DB || !userId || !pathname || pathname.startsWith('/api/')) return null;
  await ensureReadinessLockSchema(env);
  await env.DB.prepare(
    `insert into member_access_events (id, user_id, page_path, event_type, created_at)
     values (?, ?, ?, 'page_view', datetime('now'))`
  ).bind(crypto.randomUUID(), userId, cleanLimited(pathname, 160)).run();
  return evaluateFastClickRisk(env, userId);
}

export async function readinessLockForPath(env, userId, pathname, options = {}) {
  if (!env.DB || !userId || !isAdvancedReadinessPath(pathname)) return { locked: false };
  await ensureReadinessLockSchema(env);

  const existing = await env.DB.prepare(
    `select user_id, status, reason, message, flagged_at, unlock_after, admin_unlocked_at, admin_unlocked_by, updated_at
     from member_readiness_locks
     where user_id = ?
     limit 1`
  ).bind(userId).first();
  if (existing && existing.admin_unlocked_at) return { locked: false, lock: existing };
  if (existing && existing.status === 'review') {
    return { locked: true, lock: existing, code: 'review' };
  }
  if (existing && existing.status === 'settling' && isFuture(existing.unlock_after)) {
    return { locked: true, lock: existing, code: 'settling' };
  }

  const scan = await latestBaselineScan(env, userId);
  if (!scan) {
    return {
      locked: true,
      code: 'baseline_required',
      lock: await upsertReadinessLock(env, userId, {
        status: 'settling',
        reason: 'baseline_required',
        message: 'Run the Business Visibility Audit first so Verge Five can save the baseline before advanced sections open.',
        unlockAfter: null
      })
    };
  }

  const settleHours = Math.max(0, Number(options.settleHours || 72));
  const unlockAt = new Date(Date.parse(scan.created_at) + settleHours * 60 * 60 * 1000).toISOString();
  if (settleHours && Date.parse(unlockAt) > Date.now()) {
    return {
      locked: true,
      code: 'settling',
      lock: await upsertReadinessLock(env, userId, {
        status: 'settling',
        reason: 'signal_settling_window',
        message: 'Advanced sections are paused while your business visibility signals have time to settle after the baseline scan.',
        unlockAfter: unlockAt
      })
    };
  }

  if (existing && existing.status !== 'clear') await clearReadinessLock(env, userId, 'settling window passed');
  return { locked: false };
}

export async function getReadinessLockSummary(env, userId) {
  if (!env.DB || !userId) return { locked: false };
  await ensureReadinessLockSchema(env);
  const lock = await env.DB.prepare(
    `select user_id, status, reason, message, flagged_at, unlock_after, admin_unlocked_at, admin_unlocked_by, updated_at
     from member_readiness_locks
     where user_id = ?
     limit 1`
  ).bind(userId).first();
  const events = await env.DB.prepare(
    `select page_path, created_at
     from member_access_events
     where user_id = ?
     order by created_at desc
     limit 20`
  ).bind(userId).all();
  return {
    locked: !!(lock && lock.status !== 'clear' && !lock.admin_unlocked_at && (!lock.unlock_after || isFuture(lock.unlock_after) || lock.status === 'review')),
    lock: lock || null,
    recentEvents: events.results || []
  };
}

export async function adminUnlockReadiness(env, auth, userId) {
  await ensureReadinessLockSchema(env);
  const email = auth && auth.user ? cleanLimited(auth.user.email, 180) : '';
  await env.DB.prepare(
    `insert into member_readiness_locks (user_id, status, reason, message, flagged_at, unlock_after, admin_unlocked_at, admin_unlocked_by, updated_at)
     values (?, 'clear', 'admin_unlocked', '', null, null, datetime('now'), ?, datetime('now'))
     on conflict(user_id) do update set
      status = 'clear',
      reason = 'admin_unlocked',
      message = '',
      unlock_after = null,
      admin_unlocked_at = datetime('now'),
      admin_unlocked_by = excluded.admin_unlocked_by,
      updated_at = datetime('now')`
  ).bind(userId, email).run();
}

export async function adminRequireReadinessReview(env, userId, message = '') {
  await upsertReadinessLock(env, userId, {
    status: 'review',
    reason: 'manual_review',
    message: message || 'Advanced sections require admin review before they reopen.',
    unlockAfter: null
  });
}

async function evaluateFastClickRisk(env, userId) {
  const windowStart = new Date(Date.now() - FAST_CLICK_WINDOW_MINUTES * 60 * 1000).toISOString();
  const counts = await env.DB.prepare(
    `select count(distinct page_path) as distinct_pages, count(*) as total_events
     from member_access_events
     where user_id = ? and created_at >= ?`
  ).bind(userId, windowStart).first();
  const completed = await env.DB.prepare(
    `select count(*) as completed_pages
     from lesson_progress
     where user_id = ? and completed_indexes not in ('[]', '')`
  ).bind(userId).first();
  if (Number(counts && counts.distinct_pages || 0) >= FAST_CLICK_DISTINCT_PAGES && Number(completed && completed.completed_pages || 0) < 4) {
    return upsertReadinessLock(env, userId, {
      status: 'review',
      reason: 'fast_clickthrough',
      message: 'This account moved through the platform faster than the normal buildout sequence. Advanced sections are paused until the progress path is reviewed.',
      unlockAfter: new Date(Date.now() + FAST_CLICK_LOCK_DAYS * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return null;
}

async function latestBaselineScan(env, userId) {
  try {
    return await env.DB.prepare(
      `select id, score, created_at
       from visibility_audits
       where user_id = ? and mode = 'before'
       order by created_at desc
       limit 1`
    ).bind(userId).first();
  } catch (error) {
    return null;
  }
}

async function upsertReadinessLock(env, userId, options) {
  const row = {
    status: cleanLimited(options.status || 'settling', 40),
    reason: cleanLimited(options.reason || '', 80),
    message: cleanLimited(options.message || '', 600),
    unlockAfter: options.unlockAfter || null
  };
  await env.DB.prepare(
    `insert into member_readiness_locks (user_id, status, reason, message, flagged_at, unlock_after, admin_unlocked_at, admin_unlocked_by, updated_at)
     values (?, ?, ?, ?, datetime('now'), ?, null, null, datetime('now'))
     on conflict(user_id) do update set
      status = excluded.status,
      reason = excluded.reason,
      message = excluded.message,
      flagged_at = coalesce(member_readiness_locks.flagged_at, datetime('now')),
      unlock_after = excluded.unlock_after,
      admin_unlocked_at = null,
      admin_unlocked_by = null,
      updated_at = datetime('now')`
  ).bind(userId, row.status, row.reason, row.message, row.unlockAfter).run();
  return env.DB.prepare(
    `select user_id, status, reason, message, flagged_at, unlock_after, admin_unlocked_at, admin_unlocked_by, updated_at
     from member_readiness_locks
     where user_id = ?
     limit 1`
  ).bind(userId).first();
}

async function clearReadinessLock(env, userId, reason) {
  await env.DB.prepare(
    `update member_readiness_locks
     set status = 'clear', reason = ?, message = '', unlock_after = null, updated_at = datetime('now')
     where user_id = ?`
  ).bind(cleanLimited(reason, 80), userId).run();
}

function isFuture(value) {
  return value && Date.parse(value) > Date.now();
}
