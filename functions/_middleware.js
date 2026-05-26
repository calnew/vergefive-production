import { getAuth, isAdminEmail, isTrialExpired, isTrialMembership, redirect } from './_lib/auth.js';

const PROTECTED_PREFIXES = [
  '/account/',
  '/start-here/',
  '/homeefe757a6/',
  '/phones-and-411/',
  '/business-address/',
  '/website-domain-email/',
  '/llc-vs-corporation/',
  '/newpage87229491/',
  '/newpage7c157847/',
  '/contact-list/',
  '/ein/',
  '/bank-account/',
  '/bank-rating/',
  '/your-bank-rating/',
  '/business-plan/',
  '/equifax-business/',
  '/comparable-credit/',
  '/business-credit-criteria/',
  '/newpagea5b34995/',
  '/about-net-30/',
  '/nav-ecredable/',
  '/nav-boot/',
  '/revolving-business-credit-cards/',
  '/cd-business-loans/',
  '/starter-net-30-vendors/',
  '/office-and-cleaning/',
  '/building-and-industrial/',
  '/retail-and-wholesale/',
  '/retail-and-fleet/',
  '/gas-fleet-and-auto/',
  '/starter-cards/',
  '/general-credit-cards/',
  '/final-readiness-summary/',
  '/Resources/files/sample-restaurant-business-plan.pdf',
  '/Resources/files/sample-restaurant-business-plan.html',
  '/downloads/',
  '/business-visibility-audit/',
  '/ai-visibility-audit/',
  '/conversational-ai-bot/',
  '/support/',
  '/high-tech-auto-vendors/',
  '/business-assets-equipment/',
  '/newpagebd8ae2e6/',
  '/newpageed554e37/'
];

const LEGACY_ROUTE_MAP = {
  '/demo/': '/whats-inside/',
  '/ai-visibility-audit/': '/business-visibility-audit/',
  '/nav-boot/': '/nav-ecredable/',
  '/newpage87229491/': '/website-domain-email/',
  '/newpage7c157847/': '/llc-vs-corporation/',
  '/newpagea5b34995/': '/business-credit-criteria/',
  '/newpagebd8ae2e6/': '/high-tech-auto-vendors/',
  '/newpageed554e37/': '/business-assets-equipment/'
};

const TRIAL_ALLOWED_FULL_PREFIXES = [
  '/account/',
  '/start-here/',
  '/homeefe757a6/',
  '/business-visibility-audit/',
  '/ai-visibility-audit/',
  '/phones-and-411/'
];

const TRIAL_PREVIEW_PREFIXES = PROTECTED_PREFIXES.filter((prefix) => (
  !prefix.startsWith('/Resources/files/') &&
  prefix !== '/downloads/'
));

const TRIAL_ALLOWED_MEMBER_API_PREFIXES = [
  '/api/member/guide',
  '/api/member/profile',
  '/api/member/progress',
  '/api/member/visibility-audits'
];

function isProtected(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function isMemberApi(pathname) {
  return pathname.startsWith('/api/member/');
}

function isAdminPath(pathname) {
  return pathname === '/admin/' || pathname.startsWith('/api/admin/');
}

function isTrialAllowedPath(pathname) {
  return TRIAL_PREVIEW_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function isTrialAllowedMemberApi(pathname) {
  return TRIAL_ALLOWED_MEMBER_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (LEGACY_ROUTE_MAP[url.pathname]) {
    return redirect(LEGACY_ROUTE_MAP[url.pathname] + url.search);
  }
  if (!isProtected(url.pathname) && !isMemberApi(url.pathname) && !isAdminPath(url.pathname)) {
    return context.next();
  }

  const auth = await getAuth(context.request, context.env);
  if (!auth) {
    if (isMemberApi(url.pathname) || url.pathname.startsWith('/api/admin/')) {
      return new Response(JSON.stringify({ error: isAdminPath(url.pathname) ? 'Admin access required.' : 'Login required.' }), {
        status: isAdminPath(url.pathname) ? 403 : 401,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
    return redirect(`/login/?next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const isAdmin = isAdminEmail(auth.user.email, context.env);

  if (isAdminPath(url.pathname)) {
    if (!isAdmin) {
      if (url.pathname.startsWith('/api/admin/')) {
        return new Response(JSON.stringify({ error: 'Admin access required.' }), {
          status: 403,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        });
      }
      return redirect('/account/');
    }
    context.data.auth = auth;
    return context.next();
  }

  if (url.pathname === '/account/' || url.pathname.startsWith('/api/billing/')) {
    context.data.auth = auth;
    return context.next();
  }

  if (isAdmin) {
    context.data.auth = auth;
    return context.next();
  }

  if (isTrialMembership(auth.membership.status)) {
    if (isTrialExpired(auth.membership.status, auth.membership.currentPeriodEnd)) {
      if (isMemberApi(url.pathname)) {
        return new Response(JSON.stringify({ error: 'Your free test drive has expired. Choose a plan to continue.' }), {
          status: 402,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        });
      }
      return redirect(`/membership/?trial=expired&next=${encodeURIComponent(url.pathname + url.search)}`);
    }
    if (isTrialAllowedPath(url.pathname) || isTrialAllowedMemberApi(url.pathname)) {
      context.data.auth = auth;
      return context.next();
    }
    if (isMemberApi(url.pathname)) {
      return new Response(JSON.stringify({ error: 'Upgrade to unlock this member tool.' }), {
        status: 402,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
    return redirect(`/membership/?trial=locked&next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  if (!auth.active) {
    if (isMemberApi(url.pathname)) {
      return new Response(JSON.stringify({ error: 'Active membership required.' }), {
        status: 402,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
    return redirect(`/membership/?next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  context.data.auth = auth;
  return context.next();
}
