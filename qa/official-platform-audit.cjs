const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('../tools/homepage-promo-video/node_modules/playwright');

const BASE_URL = process.env.VF_AUDIT_URL || 'https://www.vergefive.com';
const EMAIL = process.env.VF_AUDIT_EMAIL || 'qa-free-path@example.com';
const PASSWORD = process.env.VF_AUDIT_PASSWORD || 'VergeFree12345';
const OUT_DIR = path.join(__dirname, 'official-platform-audit');
const REPORT_JSON = path.join(OUT_DIR, 'report.json');
const REPORT_MD = path.join(OUT_DIR, 'OFFICIAL_PLATFORM_AUDIT.md');
const DESKTOP = { width: 1365, height: 900 };
const MOBILE = devices['iPhone 13'];

const publicRoutes = [
  '/', '/whats-inside/', '/membership/', '/business-credit-answers/', '/contact/',
  '/login/', '/signup/', '/forgot-password/', '/privacy-policy/', '/terms/',
  '/blog/', '/sitemap.xml', '/robots.txt', '/llms.txt', '/manifest.json'
];

const protectedRoutes = [
  '/homeefe757a6/', '/start-here/', '/business-visibility-audit/', '/nap-overview/',
  '/phones-and-411/', '/business-address/', '/website-domain-email/', '/llc-vs-corporation/',
  '/contact-list/', '/ein/', '/bank-account/', '/bank-rating/', '/business-plan/',
  '/business-plan-report/', '/equifax-business/', '/comparable-credit/', '/business-credit-criteria/',
  '/about-net-30/', '/revolving-business-credit-cards/', '/cd-business-loans/', '/final-readiness-summary/',
  '/downloads/', '/account/', '/admin/'
];

const lessonVideoUrls = [
  'https://pub-15820b1cee7544748132a3028ca4c32a.r2.dev/LiAShjxGRy2IefFnUSSJ_Biz%20411-v.mp4',
  '/Resources/videos/start-here-nap-overview.webm',
  '/Resources/videos/phones-and-411-phone-recreated.webm',
  '/Resources/videos/phones-and-411-411-recreated.webm',
  '/Resources/videos/business-address-recreated.webm',
  '/Resources/videos/newpage87229491-recreated.webm',
  '/Resources/videos/newpage7c157847-lesson.webm',
  '/Resources/videos/contact-list-lesson.webm',
  '/Resources/videos/ein-recreated.webm',
  '/Resources/videos/bank-account-recreated.webm',
  '/Resources/videos/bank-rating-lesson.webm',
  '/Resources/videos/business-plan-recreated.webm',
  '/Resources/videos/equifax-business-lesson.webm',
  '/Resources/videos/comparable-credit-lesson.webm',
  '/Resources/videos/newpagea5b34995-lesson.webm',
  '/Resources/videos/about-net-30-recreated.webm',
  '/Resources/videos/nav-boot-recreated.webm',
  '/Resources/videos/revolving-business-credit-cards-recreated.webm',
  '/Resources/videos/cd-business-loans-lesson.webm'
];

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function fullUrl(route) { return new URL(route, BASE_URL).href; }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function status(ok) { return ok ? 'PASS' : 'FAIL'; }
function review(note) { return { status: 'REVIEW', evidence: note }; }
function pass(evidence) { return { status: 'PASS', evidence }; }
function fail(evidence) { return { status: 'FAIL', evidence }; }

async function getText(request, route) {
  const response = await request.get(fullUrl(route));
  return { status: response.status(), url: response.url(), text: await response.text().catch(() => '') };
}

async function inspectBrowserPage(browser, route, mode = 'desktop') {
  const context = await browser.newContext(mode === 'mobile' ? { ...MOBILE } : { viewport: DESKTOP });
  const page = await context.newPage();
  const failedRequests = [];
  const consoleErrors = [];
  page.on('requestfailed', req => {
    const reason = req.failure() ? req.failure().errorText : 'failed';
    if (!/favicon/i.test(req.url()) && !/ERR_ABORTED/i.test(reason)) failedRequests.push(`${req.method()} ${req.url()} ${reason}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const response = await page.goto(fullUrl(route), { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
  await page.waitForTimeout(600);
  const metrics = await page.evaluate(() => {
    const images = Array.from(document.images).map(img => ({ src: img.currentSrc || img.src, complete: img.complete, width: img.naturalWidth, height: img.naturalHeight, alt: img.getAttribute('alt') || '' }));
    const buttons = Array.from(document.querySelectorAll('a,button')).map(el => {
      const rect = el.getBoundingClientRect();
      return { text: el.textContent.trim().replace(/\s+/g, ' '), href: el.href || '', width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 };
    });
    return {
      title: document.title,
      h1: (document.querySelector('h1') && document.querySelector('h1').textContent || '').trim().replace(/\s+/g, ' '),
      path: location.pathname,
      overflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
      links: Array.from(document.querySelectorAll('a[href]')).map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.href })),
      brokenImages: images.filter(img => img.src && (!img.complete || img.width === 0 || img.height === 0)).map(img => img.src).slice(0, 10),
      missingAltImages: images.filter(img => img.src && !img.alt).length,
      smallTapTargets: buttons.filter(b => b.visible && b.width > 0 && b.height > 0 && (b.width < 36 || b.height < 36)).slice(0, 10),
      body: document.body.innerText.slice(0, 8000)
    };
  }).catch(error => ({ error: error.message }));
  await context.close();
  return { route, mode, status: response ? response.status() : 0, finalUrl: page.url(), failedRequests, consoleErrors, metrics };
}

async function postJson(request, route, data, headers = {}) {
  const response = await request.post(fullUrl(route), { data, headers: { Origin: BASE_URL, ...headers } });
  const text = await response.text().catch(() => '');
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch {}
  return { status: response.status(), ok: response.ok(), body, text };
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const requestContext = await browser.newContext({ baseURL: BASE_URL });
  const request = requestContext.request;
  const results = [];
  const details = { generatedAt: new Date().toISOString(), baseUrl: BASE_URL, public: [], mobile: [], protected: [], api: {}, media: [] };

  // Public website basics.
  for (const route of publicRoutes) {
    const info = await inspectBrowserPage(browser, route, 'desktop');
    details.public.push(info);
    const isAsset = /\.(xml|txt|json)$/.test(route);
    results.push({ section: 'Public website', item: `Desktop route ${route}`, ...((info.status >= 200 && info.status < 400 && (isAsset || info.metrics.h1 || route === '/forgot-password/')) ? pass(`${info.status} ${clean(info.metrics.title || info.metrics.h1 || info.finalUrl)}`) : fail(`${info.status} ${info.finalUrl}`)) });
    results.push({ section: 'Public website', item: `No horizontal overflow ${route}`, ...((info.metrics.overflowX || 0) <= 2 ? pass(`overflowX ${info.metrics.overflowX}`) : fail(`overflowX ${info.metrics.overflowX}`)) });
    results.push({ section: 'Public website', item: `No broken images ${route}`, ...(info.metrics.brokenImages && info.metrics.brokenImages.length === 0 ? pass('0 broken images') : fail((info.metrics.brokenImages || []).join(', ') || 'image check unavailable')) });
    results.push({ section: 'Public website', item: `No blocking browser errors ${route}`, ...(info.failedRequests.length === 0 && info.consoleErrors.length === 0 ? pass('No failed requests or console errors') : fail([...info.failedRequests, ...info.consoleErrors].slice(0, 3).join(' | '))) });
  }

  const home = details.public.find(p => p.route === '/');
  const homeLinks = home ? home.metrics.links : [];
  const requiredNav = ['Home', "What's Inside", 'Price', 'Answers', 'Contact', 'Login', 'Test Drive'];
  for (const label of requiredNav) {
    const found = homeLinks.some(link => clean(link.text).toLowerCase() === label.toLowerCase() || clean(link.text).toLowerCase().includes(label.toLowerCase()));
    results.push({ section: 'Public website', item: `Header/nav includes ${label}`, ...(found ? pass('Found on homepage') : fail('Not found on homepage nav/link text')) });
  }
  const footerRequired = ['Privacy', 'Terms', 'Contact'];
  for (const label of footerRequired) {
    const found = homeLinks.some(link => clean(link.text).toLowerCase().includes(label.toLowerCase()));
    results.push({ section: 'Trust/compliance', item: `Footer includes ${label}`, ...(found ? pass('Found on homepage footer/links') : fail('Not found on homepage links')) });
  }

  // Mobile basics.
  for (const route of ['/', '/whats-inside/', '/membership/', '/login/', '/signup/', '/contact/', '/business-credit-answers/']) {
    const info = await inspectBrowserPage(browser, route, 'mobile');
    details.mobile.push(info);
    results.push({ section: 'Mobile', item: `Mobile route ${route}`, ...(info.status >= 200 && info.status < 400 ? pass(`${info.status}, overflowX ${info.metrics.overflowX}`) : fail(`${info.status} ${info.finalUrl}`)) });
    results.push({ section: 'Mobile', item: `Mobile tap targets ${route}`, ...(info.metrics.smallTapTargets && info.metrics.smallTapTargets.length === 0 ? pass('No visible tap targets under 36px') : fail(JSON.stringify(info.metrics.smallTapTargets || []).slice(0, 240))) });
  }

  // Public copy/dev URL checks.
  const textRoutes = ['/', '/whats-inside/', '/membership/', '/business-credit-answers/', '/contact/', '/privacy-policy/', '/terms/'];
  for (const route of textRoutes) {
    const page = await getText(request, route);
    const badDev = /backend-progress|pages\.dev|feature-admin|localhost|127\.0\.0\.1/i.test(page.text);
    const textForBrandCheck = page.text.replace(/Verge Five/g, '').replace(/www\.vergefive\.com/gi, '').replace(/vergefive\.com/gi, '');
    const badBrand = /vergefive/i.test(textForBrandCheck);
    const oldModules = /8\s*-?\s*module|eight-module|Module\s+8/i.test(page.text);
    results.push({ section: 'Public website', item: `No dev URLs on ${route}`, ...(!badDev ? pass('No dev/staging URL strings found') : fail('Dev/staging URL string found')) });
    results.push({ section: 'Public website', item: `Brand/module wording on ${route}`, ...(!badBrand && !oldModules ? pass('No obvious bad brand or 8-module wording') : fail(`badBrand=${badBrand}, oldModules=${oldModules}`)) });
  }

  // Conversion and API flows.
  const config = await getText(request, '/api/config');
  details.api.config = config.text;
  results.push({ section: 'Security/abuse', item: 'Runtime config endpoint', ...(config.status === 200 && /turnstileConfigured/.test(config.text) ? pass(config.text.slice(0, 180)) : fail(`${config.status} ${config.text.slice(0, 180)}`)) });

  const membershipPage = await inspectBrowserPage(browser, '/membership/', 'desktop');
  const membershipBody = membershipPage.metrics.body || '';
  results.push({ section: 'Conversion', item: 'Monthly and annual plan labels visible', ...(/Monthly access/i.test(membershipBody) && /Annual access/i.test(membershipBody) ? pass('Monthly and annual labels visible') : fail('Missing monthly or annual label')) });
  results.push({ section: 'Conversion', item: 'Coupon field visible', ...(/coupon/i.test(membershipBody) && /VPI4545|Apply/i.test(membershipBody) ? pass('Coupon area visible') : fail('Coupon area not detected')) });

  const monthlyCheckout = await postJson(request, '/api/billing/create-checkout-session', { plan: 'monthly', name: 'QA Checkout', email: 'qa-checkout@example.com' });
  const annualCheckout = await postJson(request, '/api/billing/create-checkout-session', { plan: 'annual', name: 'QA Checkout', email: 'qa-checkout@example.com' });
  results.push({ section: 'Conversion', item: 'Monthly Stripe checkout URL', ...(monthlyCheckout.ok && /^https:\/\/checkout\.stripe\.com\//.test(monthlyCheckout.body.url || '') ? pass('Stripe monthly URL returned') : fail(`${monthlyCheckout.status} ${monthlyCheckout.text.slice(0, 180)}`)) });
  results.push({ section: 'Conversion', item: 'Annual Stripe checkout URL', ...(annualCheckout.ok && /^https:\/\/checkout\.stripe\.com\//.test(annualCheckout.body.url || '') ? pass('Stripe annual URL returned') : fail(`${annualCheckout.status} ${annualCheckout.text.slice(0, 180)}`)) });

  const scanMissing = await postJson(request, '/api/visibility-scan', { businessName: 'Audit Test', state: 'NC' });
  const scanComplete = await postJson(request, '/api/visibility-scan', { businessName: 'Audit Test', state: 'NC', phone: '844-480-2800', website: 'https://www.vergefive.com', address: 'Henderson, NC 27536' });
  results.push({ section: 'Conversion', item: 'Visibility scan requires full identifiers', ...(scanMissing.status === 400 ? pass(scanMissing.text.slice(0, 180)) : fail(`${scanMissing.status} should be 400`)) });
  results.push({ section: 'Conversion', item: 'Visibility scan returns score', ...(scanComplete.ok && /score/.test(scanComplete.text) ? pass(scanComplete.text.slice(0, 180)) : fail(`${scanComplete.status} ${scanComplete.text.slice(0, 180)}`)) });

  const resetReq = await postJson(request, '/api/auth/request-password-reset', { email: EMAIL });
  const resetBad = await postJson(request, '/api/auth/reset-password', { token: 'not-a-real-token', password: 'Newpass12345' });
  results.push({ section: 'Conversion', item: 'Password reset request accepts known/unknown email safely', ...(resetReq.status === 200 ? pass(resetReq.text.slice(0, 180)) : fail(`${resetReq.status} ${resetReq.text.slice(0, 180)}`)) });
  results.push({ section: 'Security/abuse', item: 'Invalid reset token handled cleanly', ...(resetBad.status === 400 && /invalid|expired|used/i.test(resetBad.text) ? pass(resetBad.text.slice(0, 180)) : fail(`${resetBad.status} ${resetBad.text.slice(0, 180)}`)) });

  const contactBad = await postJson(request, '/api/contact', { name: '', email: '', message: '' });
  const feedbackBad = await postJson(request, '/api/feedback', { message: '' });
  results.push({ section: 'Trust/compliance', item: 'Contact form validates missing input', ...(contactBad.status >= 400 && contactBad.status < 500 ? pass(contactBad.text.slice(0, 180)) : fail(`${contactBad.status} ${contactBad.text.slice(0, 180)}`)) });
  results.push({ section: 'Member/support', item: 'Feedback/report problem validates missing input', ...(feedbackBad.status >= 400 && feedbackBad.status < 500 ? pass(feedbackBad.text.slice(0, 180)) : fail(`${feedbackBad.status} ${feedbackBad.text.slice(0, 180)}`)) });

  // Auth/protected routes.
  for (const route of protectedRoutes) {
    const response = await request.get(fullUrl(route), { maxRedirects: 0 }).catch(() => null);
    const st = response ? response.status() : 0;
    const loc = response ? response.headers()['location'] || '' : '';
    details.protected.push({ route, status: st, location: loc });
    const ok = (st >= 300 && st < 400 && /login/i.test(loc)) || (route === '/admin/' && st >= 300 && st < 400);
    results.push({ section: 'Security/abuse', item: `Logged-out protected redirect ${route}`, ...(ok ? pass(`${st} -> ${loc}`) : fail(`${st} -> ${loc}`)) });
  }

  const login = await postJson(request, '/api/auth/login', { email: EMAIL, password: PASSWORD });
  details.api.login = { status: login.status, text: login.text.slice(0, 180) };
  if (login.ok) {
    results.push({ section: 'Member entry', item: 'QA member login', pass: true, status: 'PASS', evidence: `Login OK for ${EMAIL}` });
  } else if (login.status === 429) {
    results.push({ section: 'Member entry', item: 'QA member login', status: 'REVIEW', evidence: 'Endpoint rate-limited this audit IP. This confirms protection, but member authenticated crawl should be rerun after rate limit clears.' });
  } else {
    results.push({ section: 'Member entry', item: 'QA member login', status: 'FAIL', evidence: `${login.status} ${login.text.slice(0, 180)}` });
  }

  // Reset double-click browser guard.
  const resetContext = await browser.newContext();
  const resetPage = await resetContext.newPage();
  let resetCount = 0;
  await resetPage.route('**/api/auth/reset-password', async route => {
    resetCount += 1;
    await new Promise(resolve => setTimeout(resolve, 350));
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Password reset link is invalid or expired.' }) });
  });
  await resetPage.goto(fullUrl('/reset-password/?token=fake-token-for-double-submit-test'), { waitUntil: 'networkidle' });
  await resetPage.fill('input[name="password"]', 'Newpass12345');
  const btn = resetPage.locator('button[type="submit"]').first();
  await Promise.all([btn.click(), btn.click({ timeout: 1000 }).catch(() => {})]);
  await resetPage.waitForTimeout(800);
  await resetContext.close();
  results.push({ section: 'Security/abuse', item: 'Password reset double-click sends one request', ...(resetCount === 1 ? pass('One reset request sent under double-click') : fail(`${resetCount} reset requests sent`)) });

  // Media and SEO assets.
  for (const url of lessonVideoUrls) {
    const absolute = url.startsWith('http') ? url : fullUrl(url);
    const response = await request.head(absolute).catch(() => null);
    const st = response ? response.status() : 0;
    const type = response ? response.headers()['content-type'] || '' : '';
    details.media.push({ url: absolute, status: st, type });
    results.push({ section: 'Technical/SEO/media', item: `Video asset ${path.basename(url)}`, ...(st === 200 && /video\//i.test(type) ? pass(`${st} ${type}`) : fail(`${st} ${type}`)) });
  }

  const sitemap = await getText(request, '/sitemap.xml');
  const robots = await getText(request, '/robots.txt');
  const manifest = await getText(request, '/manifest.json');
  results.push({ section: 'Technical/SEO/media', item: 'Sitemap includes production domain', ...(sitemap.status === 200 && /www\.vergefive\.com/.test(sitemap.text) ? pass('Sitemap uses www.vergefive.com') : fail(`${sitemap.status} sitemap missing production domain`)) });
  results.push({ section: 'Technical/SEO/media', item: 'Robots available', ...(robots.status === 200 && /Sitemap:/i.test(robots.text) ? pass('robots.txt available with sitemap') : fail(`${robots.status} robots missing sitemap`)) });
  results.push({ section: 'Technical/SEO/media', item: 'Manifest and favicon basics', ...(manifest.status === 200 && /Verge Five/i.test(manifest.text) ? pass('manifest.json available') : fail(`${manifest.status} manifest missing Verge Five`)) });

  const summary = {
    generatedAt: details.generatedAt,
    baseUrl: BASE_URL,
    total: results.length,
    pass: results.filter(r => r.status === 'PASS').length,
    fail: results.filter(r => r.status === 'FAIL').length,
    review: results.filter(r => r.status === 'REVIEW').length,
    results,
    details
  };
  fs.writeFileSync(REPORT_JSON, JSON.stringify(summary, null, 2));
  fs.writeFileSync(REPORT_MD, renderMarkdown(summary));
  await requestContext.close();
  await browser.close();
  console.log(JSON.stringify({ report: REPORT_MD, total: summary.total, pass: summary.pass, fail: summary.fail, review: summary.review }, null, 2));
  if (summary.fail > 0) process.exitCode = 2;
}

function renderMarkdown(summary) {
  const sections = Array.from(new Set(summary.results.map(r => r.section)));
  const lines = [];
  lines.push('# Verge Five Official Platform Audit');
  lines.push('');
  lines.push(`Base URL: ${summary.baseUrl}`);
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total checks: ${summary.total}`);
  lines.push(`- PASS: ${summary.pass}`);
  lines.push(`- FAIL: ${summary.fail}`);
  lines.push(`- REVIEW: ${summary.review}`);
  lines.push('');
  for (const section of sections) {
    lines.push(`## ${section}`);
    lines.push('');
    lines.push('| Status | Check | Evidence |');
    lines.push('| --- | --- | --- |');
    for (const row of summary.results.filter(r => r.section === section)) {
      lines.push(`| ${row.status} | ${escapeMd(row.item)} | ${escapeMd(row.evidence || '')} |`);
    }
    lines.push('');
  }
  lines.push('## Official Rerun Command');
  lines.push('');
  lines.push('```powershell');
  lines.push('$env:VF_AUDIT_URL="https://www.vergefive.com"');
  lines.push('$env:VF_AUDIT_EMAIL="qa-free-path@example.com"');
  lines.push('$env:VF_AUDIT_PASSWORD="VergeFree12345"');
  lines.push('node qa\\official-platform-audit.cjs');
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

function escapeMd(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 500);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});


