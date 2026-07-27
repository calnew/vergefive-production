import { clean, json } from './auth.js';

const STRIPE_API = 'https://api.stripe.com/v1';
const STRIPE_VERSION = '2026-02-25.clover';

export async function stripeRequest(env, path, body, options = {}) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe secret key is not configured.' }, 500);
  }
  const headers = {
    authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    'stripe-version': STRIPE_VERSION,
    'content-type': 'application/x-www-form-urlencoded'
  };
  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = String(options.idempotencyKey);
  }
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers,
    body: encodeForm(body)
  });
  const data = await response.json();
  if (!response.ok) {
    return json({ error: data.error && data.error.message ? data.error.message : 'Stripe request failed.' }, response.status);
  }
  return data;
}

export async function stripeGet(env, path, params) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe secret key is not configured.' }, 500);
  }
  const query = encodeForm(params || {});
  const response = await fetch(`${STRIPE_API}${path}${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'stripe-version': STRIPE_VERSION
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({ error: data.error && data.error.message ? data.error.message : 'Stripe request failed.' }, response.status);
  }
  return data;
}


export function isDevStripeRequest(request) {
  const host = new URL(request.url).hostname.toLowerCase();
  return host.includes('localhost') || host.includes('127.0.0.1') || host.includes('pages.dev') || host.includes('-dev.') || host.includes('dev.');
}

export function requireDevStripeTestMode(request, env) {
  if (!isDevStripeRequest(request)) return null;
  const key = String(env.STRIPE_SECRET_KEY || '');
  if (!key) return null;
  if (!key.startsWith('sk_test_')) {
    return json({ error: 'Dev checkout must use a Stripe test-mode secret key.' }, 500);
  }
  return null;
}

export function requireExplicitDevelopmentStripeTestMode(request, env) {
  const appEnvironment = String(env.APP_ENVIRONMENT || '').toLowerCase();
  const requiredMode = String(env.STRIPE_MODE_REQUIRED || '').toLowerCase();
  const key = String(env.STRIPE_SECRET_KEY || '');
  if (appEnvironment !== 'development' || requiredMode !== 'test' || !key.startsWith('sk_test_')) {
    return json({ error: 'This Stripe test action is available only in the isolated development environment with a test-mode key.' }, 403);
  }
  return requireDevStripeTestMode(request, env);
}
export function encodeForm(obj, prefix) {
  const pairs = [];
  Object.entries(obj || {}).forEach(([key, value]) => {
    const name = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') pairs.push(...encodeForm(item, `${name}[${index}]`).split('&').filter(Boolean));
        else pairs.push(`${encodeURIComponent(`${name}[${index}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof value === 'object') {
      pairs.push(...encodeForm(value, name).split('&').filter(Boolean));
    } else {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  });
  return pairs.join('&');
}

export function siteUrl(request, env) {
  return clean(env.SITE_URL) || new URL(request.url).origin;
}

export async function verifyStripeSignature(request, env, rawBody) {
  if (!env.STRIPE_WEBHOOK_SECRET) return false;
  const header = request.headers.get('stripe-signature') || '';
  const parts = Object.fromEntries(header.split(',').map((part) => {
    const [key, value] = part.split('=');
    return [key, value];
  }));
  if (!parts.t || !parts.v1) return false;
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const payload = `${parts.t}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(expected, parts.v1);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
