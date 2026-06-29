const SESSION_COOKIE = 'vf_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const PBKDF2_ITERATIONS = 100000;
const MAX_JSON_BYTES = 25 * 1024;

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export function redirect(path, status = 302, headers = {}) {
  return new Response(null, {
    status,
    headers: {
      location: path,
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export function clean(value) {
  return String(value || '').trim();
}

export function cleanLimited(value, max = 500) {
  return clean(value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').slice(0, max);
}

export function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

export async function readJson(request, maxBytes = MAX_JSON_BYTES) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length && length > maxBytes) throw new Error('REQUEST_TOO_LARGE');
  const text = await request.text();
  if (text.length > maxBytes) throw new Error('REQUEST_TOO_LARGE');
  return text ? JSON.parse(text) : {};
}

export function validatePasswordPolicy(password) {
  const value = String(password || '');
  if (value.length < 12) return 'Password must be at least 12 characters.';
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must include uppercase, lowercase, and a number.';
  }
  if (/(.)\1{4,}/.test(value)) return 'Password is too repetitive.';
  return '';
}

export function requireSameOrigin(context) {
  const method = context.request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return null;
  const origin = context.request.headers.get('origin');
  if (!origin) return null;
  const requestOrigin = new URL(context.request.url).origin;
  if (origin !== requestOrigin) return json({ error: 'Invalid request origin.' }, 403);
  return null;
}

export async function rateLimit(env, key, options = {}) {
  if (!env.DB) return { ok: true };
  const limit = Number(options.limit || 8);
  const windowSeconds = Number(options.windowSeconds || 900);
  const now = Date.now();
  const resetAt = new Date(now + windowSeconds * 1000).toISOString();
  await env.DB.prepare(
    `create table if not exists rate_limits (
      bucket text primary key,
      count integer not null default 0,
      reset_at text not null,
      updated_at text not null default (datetime('now'))
    )`
  ).run();
  const row = await env.DB.prepare('select count, reset_at from rate_limits where bucket = ?').bind(key).first();
  const expired = !row || Date.parse(row.reset_at) <= now;
  const nextCount = expired ? 1 : Number(row.count || 0) + 1;
  await env.DB.prepare(
    `insert into rate_limits (bucket, count, reset_at, updated_at)
     values (?, ?, ?, datetime("now"))
     on conflict(bucket) do update set count = excluded.count, reset_at = excluded.reset_at, updated_at = datetime("now")`
  ).bind(key, nextCount, expired ? resetAt : row.reset_at).run();
  if (nextCount > limit) {
    return { ok: false, response: json({ error: 'Too many attempts. Please wait and try again.' }, 429) };
  }
  return { ok: true };
}

export function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64Url(data);
}

export function base64Url(bytes) {
  let binary = '';
  new Uint8Array(bytes).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function sha256Hex(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt = randomToken(18)) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: fromBase64Url(salt),
      iterations: PBKDF2_ITERATIONS
    },
    key,
    256
  );
  return {
    salt,
    hash: base64Url(bits),
    iterations: PBKDF2_ITERATIONS
  };
}

export async function verifyPassword(password, user) {
  if (!user || !user.password_hash || !user.password_salt) return false;
  const result = await hashPassword(password, user.password_salt);
  return timingSafeEqual(result.hash, user.password_hash);
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  return cookie.split(';').map((part) => part.trim()).reduce((found, part) => {
    if (found) return found;
    const index = part.indexOf('=');
    if (index < 0) return '';
    return part.slice(0, index) === name ? decodeURIComponent(part.slice(index + 1)) : '';
  }, '');
}

export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function expiredSessionCookie(request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function createSession(env, userId, request) {
  const token = randomToken(36);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await env.DB.prepare(
    'insert into sessions (id, user_id, token_hash, expires_at, created_at) values (?, ?, ?, ?, datetime("now"))'
  ).bind(crypto.randomUUID(), userId, tokenHash, expiresAt).run();
  await env.DB.prepare('update users set last_login_at = datetime("now") where id = ?').bind(userId).run();
  return sessionCookie(token, request);
}

export async function destroySession(env, request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !env.DB) return;
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare('delete from sessions where token_hash = ?').bind(tokenHash).run();
}

export async function getAuth(request, env) {
  if (!env.DB) return null;
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `select
      u.id, u.email, u.name, u.stripe_customer_id, u.email_verified_at,
      m.status as membership_status, m.current_period_end, m.stripe_subscription_id
     from sessions s
     join users u on u.id = s.user_id
     left join memberships m on m.user_id = u.id
     where s.token_hash = ? and s.expires_at > datetime("now")
     limit 1`
  ).bind(tokenHash).first();
  if (!row) return null;
  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name || '',
      stripeCustomerId: row.stripe_customer_id || '',
      emailVerifiedAt: row.email_verified_at || ''
    },
    membership: {
      status: row.membership_status || 'none',
      currentPeriodEnd: row.current_period_end || '',
      stripeSubscriptionId: row.stripe_subscription_id || ''
    },
    active: isActiveMembership(row.membership_status, row.current_period_end)
  };
}

export function isAdminEmail(email, env) {
  const admins = String(env.ADMIN_EMAILS || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return admins.includes(String(email || '').toLowerCase());
}

export async function isAdminUser(email, env) {
  const normalized = String(email || '').toLowerCase().trim();
  if (!normalized) return false;
  if (isAdminEmail(normalized, env)) return true;
  if (!env.DB) return false;
  try {
    const fromActivity = await env.DB.prepare(
      'select 1 as ok from admin_activity_log where lower(admin_email) = ? limit 1'
    ).bind(normalized).first();
    if (fromActivity && fromActivity.ok) return true;
  } catch (_) {
    // Table may not exist yet in newer/emptier environments.
  }
  try {
    const fromNotes = await env.DB.prepare(
      'select 1 as ok from admin_notes where lower(admin_email) = ? limit 1'
    ).bind(normalized).first();
    if (fromNotes && fromNotes.ok) return true;
  } catch (_) {
    // Table may not exist yet in newer/emptier environments.
  }
  return false;
}

export function isTrialMembership(status) {
  return String(status || '').toLowerCase() === 'trial';
}

export function isTrialExpired(status, currentPeriodEnd) {
  if (!isTrialMembership(status)) return false;
  if (!currentPeriodEnd) return true;
  return Date.parse(currentPeriodEnd) <= Date.now();
}

export function isActiveMembership(status, currentPeriodEnd = '') {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'trial') return !isTrialExpired(normalized, currentPeriodEnd);
  return ['active', 'trialing', 'lifetime', 'paid'].includes(normalized);
}

export function requireDb(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured.');
}
