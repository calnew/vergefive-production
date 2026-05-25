const fs = require('fs');
const path = require('path');
const { chromium } = require('../tools/homepage-promo-video/node_modules/playwright');

const BASE_URL = process.env.VF_AUDIT_URL || 'https://backend-progress.vergefive.pages.dev';
const EMAIL = process.env.VF_AUDIT_EMAIL || 'qa-paid-path@example.com';
const PASSWORD = process.env.VF_AUDIT_PASSWORD || 'set-vf-audit-password';
const OUT_DIR = path.join(__dirname, 'deep-click-audit');
const REPORT_PATH = path.join(OUT_DIR, 'report.json');
const SUMMARY_PATH = path.join(OUT_DIR, 'summary.md');

const memberLessons = [
  { path: '/phones-and-411/', next: '/business-address/', top: 'Back to dashboard|Next section' },
  { path: '/business-address/', next: '/website-domain-email/', top: 'Previous section|Next section' },
  { path: '/website-domain-email/', next: '/llc-vs-corporation/', top: 'Previous section|Next module' },
  { path: '/llc-vs-corporation/', next: '/contact-list/', top: 'Previous module|Next section' },
  { path: '/contact-list/', next: '/ein/', top: 'Previous section|Next section' },
  { path: '/ein/', next: '/bank-account/', top: 'Previous section|Next module' },
  { path: '/bank-account/', next: '/bank-rating/', top: 'Previous module|Next section' },
  { path: '/bank-rating/', next: '/business-plan/', top: 'Previous section|Next module' },
  { path: '/business-plan/', next: '/business-plan-report/', top: 'Previous module|Next section' },
  { path: '/business-plan-report/', next: '/equifax-business/', top: 'Previous section|Next module' },
  { path: '/equifax-business/', next: '/comparable-credit/', top: 'Previous module|Next section' },
  { path: '/comparable-credit/', next: '/business-credit-criteria/', top: 'Previous section|Next section' },
  { path: '/business-credit-criteria/', next: '/about-net-30/', top: 'Previous section|Next module' },
  { path: '/about-net-30/', next: '/cd-business-loans/', top: 'Previous module|Next module' },
  { path: '/revolving-business-credit-cards/', next: '/nav-ecredable/', top: 'Previous module|Next section' },
  { path: '/nav-ecredable/', next: '/cd-business-loans/', top: 'Previous section|Next module' },
  { path: '/cd-business-loans/', next: '/final-readiness-summary/', top: 'Previous module|Final summary' }
];

const protectedRoutes = [
  '/homeefe757a6/',
  '/start-here/',
  ...memberLessons.map((item) => item.path),
  '/revolving-business-credit-cards/',
  '/nav-ecredable/',
  '/final-readiness-summary/',
  '/downloads/',
  '/business-visibility-audit/',
  '/conversational-ai-bot/',
  '/support/',
  '/account/'
];

const publicRoutes = [
  '/',
  '/whats-inside/',
  '/membership/',
  '/login/',
  '/signup/',
  '/business-credit-answers/',
  '/blog/',
  '/privacy-policy/',
  '/terms/',
  '/contact/'
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function urlFor(route) {
  return new URL(route, BASE_URL).href;
}

function pathOnly(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function shouldSkipClick(text, href) {
  const value = `${text} ${href}`.toLowerCase();
  return /logout|manage billing|checkout|customer portal|delete|remove|stripe|mailto:|tel:/.test(value);
}

function routeName(route) {
  return route.replace(/^\/$/, 'home').replace(/^\/|\/$/g, '').replace(/[\/?&=]+/g, '_') || 'home';
}

async function login(context) {
  const page = await context.newPage();
  await page.goto(urlFor('/login/'), { waitUntil: 'domcontentloaded' });
  await page.fill('input[type=email], input[name=email]', EMAIL);
  await page.fill('input[type=password], input[name=password]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 12000 }).catch(() => {}),
    page.click('button[type=submit]')
  ]);
  await page.waitForTimeout(1200);
  const ok = !page.url().includes('/login/');
  await page.close();
  return ok;
}

async function capturePageSignals(page) {
  return page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : '',
    path: location.pathname,
    topNavText: document.querySelector('.member-main > .lesson-nav-strip') ? document.querySelector('.member-main > .lesson-nav-strip').innerText.trim() : '',
    topNavVisible: !!document.querySelector('.member-main > .lesson-nav-strip') && getComputedStyle(document.querySelector('.member-main > .lesson-nav-strip')).display !== 'none',
    bottomNavExists: !!document.querySelector('.lesson-nav-bottom'),
    overflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    brokenImages: Array.from(document.images).filter((img) => img.src && (!img.complete || img.naturalWidth === 0)).map((img) => img.src).slice(0, 8)
  }));
}

async function gotoWithLogs(page, route) {
  const events = { console: [], pageErrors: [], failedRequests: [] };
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) events.console.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => events.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    events.failedRequests.push(`${request.method()} ${request.url()} ${failure ? failure.errorText : ''}`);
  });
  const response = await page.goto(urlFor(route), { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((error) => {
    events.pageErrors.push(`goto failed: ${error.message}`);
    return null;
  });
  await page.waitForTimeout(700);
  return { status: response ? response.status() : 0, events };
}

async function collectClickables(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('a[href],button')).map((el, index) => {
    const rect = el.getBoundingClientRect();
    const href = el.tagName === 'A' ? el.getAttribute('href') : '';
    return {
      index,
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().replace(/\s+/g, ' '),
      href,
      visible: rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none',
      disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true'
    };
  }).filter((item) => item.visible && !item.disabled && (item.text || item.href)));
}

async function auditPage(browser, route, authenticated) {
  const context = await browser.newContext({ viewport: { width: 1365, height: 920 }, ignoreHTTPSErrors: true });
  if (authenticated) await login(context);
  const page = await context.newPage();
  const nav = await gotoWithLogs(page, route);
  const signals = await capturePageSignals(page).catch((error) => ({ error: error.message }));
  const clickables = await collectClickables(page).catch(() => []);
  const clicks = [];

  for (let i = 0; i < clickables.length; i += 1) {
    const item = clickables[i];
    if (shouldSkipClick(item.text, item.href)) {
      clicks.push({ ...item, skipped: true, reason: 'side-effect or external commerce/logout action' });
      continue;
    }
    if (item.href && /^(https?:)?\/\//i.test(item.href) && !item.href.includes(new URL(BASE_URL).host)) {
      clicks.push({ ...item, skipped: true, reason: 'external link' });
      continue;
    }
    const clickPage = await context.newPage();
    const local = await gotoWithLogs(clickPage, route);
    let afterUrl = clickPage.url();
    let ok = true;
    let note = '';
    try {
      const selector = item.tag === 'a'
        ? `a[href="${item.href.replace(/"/g, '\\"')}"]`
        : `button >> nth=${Array.from(clickables.slice(0, i + 1)).filter((c) => c.tag === 'button').length - 1}`;
      if (item.tag === 'a') {
        const link = clickPage.locator(selector).first();
        await Promise.all([
          clickPage.waitForLoadState('domcontentloaded', { timeout: 8000 }).catch(() => {}),
          link.click({ timeout: 5000 })
        ]);
      } else {
        await clickPage.locator('button').nth(Array.from(clickables.slice(0, i + 1)).filter((c) => c.tag === 'button').length - 1).click({ timeout: 5000 });
        await clickPage.waitForTimeout(500);
      }
      afterUrl = clickPage.url();
      const bodyText = await clickPage.locator('body').innerText({ timeout: 2000 }).catch(() => '');
      if (/404|not found/i.test(bodyText) && !/Business 411/i.test(bodyText)) {
        ok = false;
        note = 'possible not-found page after click';
      }
    } catch (error) {
      ok = false;
      note = error.message;
    }
    clicks.push({
      ...item,
      ok,
      note,
      beforePath: route,
      afterPath: pathOnly(afterUrl),
      afterUrl,
      console: local.events.console.slice(0, 4),
      pageErrors: local.events.pageErrors.slice(0, 4)
    });
    await clickPage.close();
  }

  const screenshotPath = path.join(OUT_DIR, `${authenticated ? 'member' : 'public'}-${routeName(route)}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  await context.close();

  return {
    route,
    authenticated,
    status: nav.status,
    finalUrl: page.url(),
    signals,
    console: nav.events.console.slice(0, 8),
    pageErrors: nav.events.pageErrors.slice(0, 8),
    failedRequests: nav.events.failedRequests.filter((item) => !item.includes('favicon')).slice(0, 8),
    clickableCount: clickables.length,
    clicks,
    screenshot: screenshotPath
  };
}

async function auditLessonCompletion(browser, lesson) {
  const context = await browser.newContext({ viewport: { width: 1365, height: 920 }, ignoreHTTPSErrors: true });
  await login(context);
  const page = await context.newPage();
  await page.goto(urlFor(lesson.path), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const topText = await page.locator('.member-main > .lesson-nav-strip').innerText({ timeout: 3000 }).catch(() => '');
  await page.locator('.lesson-check').evaluateAll((buttons) => buttons.forEach((button) => {
    if (!button.classList.contains('checked')) button.click();
  })).catch(() => {});
  await page.waitForTimeout(700);
  const gatedVisible = await page.locator('[data-gated]').isVisible().catch(() => false);
  const cta = await page.locator('[data-gated] a.btn').first().evaluate((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href')
  })).catch(() => ({ text: '', href: '' }));
  let clickedPath = '';
  let clickOk = false;
  if (cta.href) {
    await page.locator('[data-gated] a.btn').first().click().catch(() => {});
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(300);
    clickedPath = pathOnly(page.url());
    clickOk = clickedPath === lesson.next;
  }
  await context.close();
  return {
    route: lesson.path,
    expectedNext: lesson.next,
    topText: clean(topText),
    topOk: lesson.top.split('|').every((part) => topText.includes(part)),
    gatedVisible,
    cta,
    clickedPath,
    clickOk
  };
}

async function run() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });

  const report = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    publicPages: [],
    memberPages: [],
    lessonCompletion: []
  };

  for (const route of publicRoutes) {
    report.publicPages.push(await auditPage(browser, route, false));
  }
  for (const route of Array.from(new Set(protectedRoutes))) {
    report.memberPages.push(await auditPage(browser, route, true));
  }
  for (const lesson of memberLessons) {
    report.lessonCompletion.push(await auditLessonCompletion(browser, lesson));
  }

  await browser.close();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  const allPages = [...report.publicPages, ...report.memberPages];
  const pageIssues = allPages.filter((page) =>
    page.status >= 400 ||
    page.finalUrl.includes('/login/') && page.authenticated ||
    page.signals.error ||
    page.signals.overflowX > 8 ||
    page.signals.brokenImages && page.signals.brokenImages.length ||
    page.pageErrors.length ||
    page.clicks.some((click) => !click.skipped && click.ok === false)
  );
  const lessonIssues = report.lessonCompletion.filter((item) => !item.topOk || !item.gatedVisible || !item.clickOk);
  const clickFailures = allPages.flatMap((page) => page.clicks
    .filter((click) => !click.skipped && click.ok === false)
    .map((click) => ({ route: page.route, text: click.text, href: click.href, note: click.note, afterPath: click.afterPath })));

  const lines = [];
  lines.push('# Verge Five Deep Click Audit');
  lines.push('');
  lines.push(`Base URL: ${BASE_URL}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Public pages audited: ${report.publicPages.length}`);
  lines.push(`- Authenticated member pages audited: ${report.memberPages.length}`);
  lines.push(`- Lesson completion paths audited: ${report.lessonCompletion.length}`);
  lines.push(`- Page issues: ${pageIssues.length}`);
  lines.push(`- Click failures: ${clickFailures.length}`);
  lines.push(`- Lesson completion/nav failures: ${lessonIssues.length}`);
  lines.push('');
  lines.push('## Click Failures');
  if (!clickFailures.length) lines.push('- None found in this pass.');
  clickFailures.slice(0, 80).forEach((item) => {
    lines.push(`- ${item.route}: "${clean(item.text || item.href)}" -> ${item.afterPath || item.href || 'no path'} (${clean(item.note)})`);
  });
  lines.push('');
  lines.push('## Lesson Completion Paths');
  report.lessonCompletion.forEach((item) => {
    lines.push(`- ${item.topOk && item.gatedVisible && item.clickOk ? 'PASS' : 'FAIL'} ${item.route}: CTA "${item.cta.text}" -> ${item.clickedPath || item.cta.href}, expected ${item.expectedNext}`);
  });
  lines.push('');
  lines.push('## Page Issues');
  if (!pageIssues.length) lines.push('- None found in this pass.');
  pageIssues.slice(0, 80).forEach((page) => {
    lines.push(`- ${page.authenticated ? 'member' : 'public'} ${page.route}: status ${page.status}, final ${page.finalUrl}, overflow ${page.signals.overflowX}`);
    if (page.pageErrors.length) lines.push(`  - Page errors: ${page.pageErrors.join(' | ')}`);
    if (page.signals.brokenImages && page.signals.brokenImages.length) lines.push(`  - Broken images: ${page.signals.brokenImages.join(' | ')}`);
  });
  lines.push('');
  lines.push(`Full JSON report: ${REPORT_PATH}`);
  fs.writeFileSync(SUMMARY_PATH, lines.join('\n'));
  console.log(lines.join('\n'));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
