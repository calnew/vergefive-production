import { getAuth, isAdminEmail, isTrialExpired, isTrialMembership, redirect } from './_lib/auth.js';
import { isAdvancedReadinessPath, readinessLockForPath, recordMemberPageAccess } from './_lib/readiness-locks.js';

const PROTECTED_PREFIXES = [
  '/dashboard/',
  '/run-scan/',
  '/fix-list/',
  '/account-matches/',
  '/full-buildout/',
  '/report-card/',
  '/mobile/',
  '/account/',
  '/start-here/',
  '/homeefe757a6/',
  '/nap-overview/',
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
  '/business-plan-report/',
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
  '/homeefe757a6/': '/dashboard/',
  '/business-visibility-audit/': '/run-scan/',
  '/ai-visibility-audit/': '/run-scan/',
  '/nap-overview/': '/dashboard/?page=fix&fix=nap',
  '/phones-and-411/': '/dashboard/?page=fix&fix=phones',
  '/business-address/': '/dashboard/?page=fix&fix=address',
  '/website-domain-email/': '/dashboard/?page=fix&fix=website',
  '/newpage87229491/': '/dashboard/?page=fix&fix=website',
  '/llc-vs-corporation/': '/dashboard/?page=fix&fix=llc',
  '/newpage7c157847/': '/dashboard/?page=fix&fix=llc',
  '/contact-list/': '/dashboard/?page=fix&fix=sos',
  '/ein/': '/dashboard/?page=fix&fix=ein',
  '/bank-account/': '/dashboard/?page=fix&fix=bank',
  '/bank-rating/': '/dashboard/?page=fix&fix=bankrating',
  '/your-bank-rating/': '/dashboard/?page=fix&fix=bankrating',
  '/business-plan/': '/dashboard/?page=fix&fix=businessplan',
  '/business-plan-report/': '/report-card/',
  '/equifax-business/': '/dashboard/?page=fix&fix=bureaus',
  '/comparable-credit/': '/dashboard/?page=fix&fix=bureaus',
  '/business-credit-criteria/': '/dashboard/?page=fix&fix=criteria',
  '/newpagea5b34995/': '/dashboard/?page=fix&fix=criteria',
  '/about-net-30/': '/dashboard/?page=fix&fix=net30',
  '/starter-net-30-vendors/': '/dashboard/?page=fix&fix=net30',
  '/nav-ecredable/': '/account-matches/?tab=cards',
  '/nav-boot/': '/account-matches/?tab=cards',
  '/revolving-business-credit-cards/': '/account-matches/?tab=cards',
  '/cd-business-loans/': '/account-matches/?tab=funding',
  '/office-and-cleaning/': '/account-matches/?tab=vendor',
  '/building-and-industrial/': '/account-matches/?tab=vendor',
  '/retail-and-wholesale/': '/account-matches/?tab=vendor',
  '/retail-and-fleet/': '/account-matches/?tab=vendor',
  '/gas-fleet-and-auto/': '/account-matches/?tab=vendor',
  '/starter-cards/': '/account-matches/?tab=cards',
  '/general-credit-cards/': '/account-matches/?tab=cards',
  '/final-readiness-summary/': '/report-card/',
  '/downloads/': '/full-buildout/',
  '/conversational-ai-bot/': '/support/',
  '/newpagebd8ae2e6/': '/account-matches/?tab=vendor',
  '/newpageed554e37/': '/account-matches/?tab=funding',
  '/high-tech-auto-vendors/': '/account-matches/?tab=vendor',
  '/business-assets-equipment/': '/account-matches/?tab=funding'
};

const TRIAL_ALLOWED_FULL_PREFIXES = [
  '/dashboard/',
  '/run-scan/',
  '/fix-list/',
  '/account-matches/',
  '/full-buildout/',
  '/report-card/',
  '/mobile/',
  '/account/',
  '/start-here/',
  '/homeefe757a6/',
  '/business-visibility-audit/',
  '/ai-visibility-audit/',
  '/nap-overview/',
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
      if (!isMemberApi(url.pathname)) await recordMemberPageAccess(context.env, auth.user.id, url.pathname).catch(() => null);
      if (!isMemberApi(url.pathname) && isAdvancedReadinessPath(url.pathname)) {
        const settleHours = Number(context.env.READINESS_SETTLE_HOURS || 72);
        const readiness = await readinessLockForPath(context.env, auth.user.id, url.pathname, { settleHours }).catch(() => ({ locked: false }));
        if (readiness.locked) {
          const message = encodeURIComponent(readiness.lock && readiness.lock.message || 'Advanced sections are paused until your business readiness path is reviewed.');
          return redirect(`/homeefe757a6/?readiness=locked&reason=${encodeURIComponent(readiness.code || 'readiness_locked')}&message=${message}&next=${encodeURIComponent(url.pathname + url.search)}`);
        }
      }
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

  if (!isMemberApi(url.pathname)) {
    await recordMemberPageAccess(context.env, auth.user.id, url.pathname).catch(() => null);
  }
  if (isAdvancedReadinessPath(url.pathname)) {
    const settleHours = Number(context.env.READINESS_SETTLE_HOURS || 72);
    const readiness = await readinessLockForPath(context.env, auth.user.id, url.pathname, { settleHours }).catch(() => ({ locked: false }));
    if (readiness.locked) {
      const message = encodeURIComponent(readiness.lock && readiness.lock.message || 'Advanced sections are paused until your business readiness path is reviewed.');
      if (isMemberApi(url.pathname)) {
        return new Response(JSON.stringify({ error: readiness.lock && readiness.lock.message || 'Advanced sections are paused until your business readiness path is reviewed.', code: readiness.code || 'readiness_locked' }), {
          status: 423,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        });
      }
      return redirect(`/homeefe757a6/?readiness=locked&reason=${encodeURIComponent(readiness.code || 'readiness_locked')}&message=${message}&next=${encodeURIComponent(url.pathname + url.search)}`);
    }
  }

  context.data.auth = auth;
  return context.next();
}
