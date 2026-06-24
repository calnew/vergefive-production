import { getAuth, isAdminEmail, isTrialExpired, isTrialMembership, redirect } from './_lib/auth.js';
import { isAdvancedReadinessPath, readinessLockForPath, recordMemberPageAccess } from './_lib/readiness-locks.js';

const PROTECTED_PREFIXES = [
  '/dashboard/',
  '/vf-app.html',
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
  '/dashboard/': '/vf-app.html?page=dashboard',
  '/run-scan/': '/vf-app.html?page=scan',
  '/fix-list/': '/vf-app.html?page=fixlist',
  '/account-matches/': '/vf-app.html?page=accounts',
  '/full-buildout/': '/vf-app.html?page=buildout',
  '/support/': '/vf-app.html?page=support',
  '/report-card/': '/vf-app.html?page=report',
  '/mobile/': '/vf-app.html?page=mobile',
  '/homeefe757a6/': '/vf-app.html?page=dashboard',
  '/business-visibility-audit/': '/vf-app.html?page=scan',
  '/ai-visibility-audit/': '/vf-app.html?page=scan',
  '/nap-overview/': '/vf-app.html?page=fix&fix=nap',
  '/phones-and-411/': '/vf-app.html?page=fix&fix=phones',
  '/business-address/': '/vf-app.html?page=fix&fix=address',
  '/website-domain-email/': '/vf-app.html?page=fix&fix=website',
  '/newpage87229491/': '/vf-app.html?page=fix&fix=website',
  '/llc-vs-corporation/': '/vf-app.html?page=fix&fix=llc',
  '/newpage7c157847/': '/vf-app.html?page=fix&fix=llc',
  '/contact-list/': '/vf-app.html?page=fix&fix=sos',
  '/ein/': '/vf-app.html?page=fix&fix=ein',
  '/bank-account/': '/vf-app.html?page=fix&fix=bank',
  '/bank-rating/': '/vf-app.html?page=fix&fix=bankrating',
  '/your-bank-rating/': '/vf-app.html?page=fix&fix=bankrating',
  '/business-plan/': '/vf-app.html?page=fix&fix=businessplan',
  '/business-plan-report/': '/vf-app.html?page=report',
  '/equifax-business/': '/vf-app.html?page=fix&fix=bureaus',
  '/comparable-credit/': '/vf-app.html?page=fix&fix=bureaus',
  '/business-credit-criteria/': '/vf-app.html?page=fix&fix=criteria',
  '/newpagea5b34995/': '/vf-app.html?page=fix&fix=criteria',
  '/about-net-30/': '/vf-app.html?page=fix&fix=net30',
  '/starter-net-30-vendors/': '/vf-app.html?page=accounts&tab=vendor',
  '/nav-ecredable/': '/vf-app.html?page=accounts&tab=cards',
  '/nav-boot/': '/vf-app.html?page=accounts&tab=cards',
  '/revolving-business-credit-cards/': '/vf-app.html?page=accounts&tab=cards',
  '/cd-business-loans/': '/vf-app.html?page=accounts&tab=funding',
  '/office-and-cleaning/': '/vf-app.html?page=accounts&tab=vendor',
  '/building-and-industrial/': '/vf-app.html?page=accounts&tab=vendor',
  '/retail-and-wholesale/': '/vf-app.html?page=accounts&tab=vendor',
  '/retail-and-fleet/': '/vf-app.html?page=accounts&tab=vendor',
  '/gas-fleet-and-auto/': '/vf-app.html?page=accounts&tab=vendor',
  '/starter-cards/': '/vf-app.html?page=accounts&tab=cards',
  '/general-credit-cards/': '/vf-app.html?page=accounts&tab=cards',
  '/final-readiness-summary/': '/vf-app.html?page=report',
  '/downloads/': '/vf-app.html?page=buildout',
  '/conversational-ai-bot/': '/vf-app.html?page=support',
  '/newpagebd8ae2e6/': '/vf-app.html?page=accounts&tab=vendor',
  '/newpageed554e37/': '/vf-app.html?page=accounts&tab=funding',
  '/high-tech-auto-vendors/': '/vf-app.html?page=accounts&tab=vendor',
  '/business-assets-equipment/': '/vf-app.html?page=accounts&tab=funding'
};

const TRIAL_ALLOWED_FULL_PREFIXES = [
  '/dashboard/',
  '/vf-app.html',
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

function mappedRedirectTarget(target, search) {
  if (!search) return target;
  return target + (target.includes('?') ? '&' : '?') + search.slice(1);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (LEGACY_ROUTE_MAP[url.pathname]) {
    return redirect(mappedRedirectTarget(LEGACY_ROUTE_MAP[url.pathname], url.search));
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
