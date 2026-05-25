const fs = require('fs');
const path = require('path');
const { chromium } = require('../tools/homepage-promo-video/node_modules/playwright');

const BASE_URL = process.env.VF_AUDIT_URL || 'https://backend-progress.vergefive.pages.dev';
const EMAIL = process.env.VF_AUDIT_EMAIL || 'qa-paid-path@example.com';
const PASSWORD = process.env.VF_AUDIT_PASSWORD || 'set-vf-audit-password';
const OUT_DIR = path.join(__dirname, 'critical-system-audit');
const REPORT_PATH = path.join(OUT_DIR, 'report.json');
const SUMMARY_PATH = path.join(OUT_DIR, 'summary.md');

const publicRoutes = [
  '/', '/whats-inside/', '/membership/', '/login/', '/signup/',
  '/business-credit-answers/', '/blog/', '/privacy-policy/', '/terms/', '/contact/'
];

const lessons = [
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
  { path: '/cd-business-loans/', next: '/final-readiness-summary/', top: 'Previous module|Final summary' }
];

const memberRoutes = [
  '/homeefe757a6/', '/start-here/', ...lessons.map((lesson) => lesson.path),
  '/revolving-business-credit-cards/', '/nav-ecredable/', '/final-readiness-summary/',
  '/downloads/', '/business-visibility-audit/', '/conversational-ai-bot/', '/support/', '/account/'
];

const skipClickText = /(logout|log out|manage billing|customer portal|delete|remove|checkout|choose monthly|choose annual|get access)/i;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function fullUrl(route) {
  return new URL(route, BASE_URL).href;
}

function routePath(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

async function login(page) {
  await page.goto(fullUrl('/login/'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const email = page.locator('input[type="email"], input[name*="email" i]').first();
  const password = page.locator('input[type="password"], input[name*="password" i]').first();
  if (await email.count()) await email.fill(EMAIL);
  if (await password.count()) await password.fill(PASSWORD);
  const submit = page.locator('button:has-text("Login"), button:has-text("Log in"), button[type="submit"], input[type="submit"]').first();
  if (await submit.count()) await submit.click();
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(1200);
}

async function inspectPage(page, route) {
  const result = {
    route,
    finalPath: '',
    status: 0,
    title: '',
    blank: false,
    overflow: false,
    consoleErrors: [],
    failedRequests: [],
    brokenImages: [],
    internalLinkFailures: [],
    clickResults: [],
    lesson: null
  };

  page.removeAllListeners('console');
  page.removeAllListeners('requestfailed');
  page.on('console', (message) => {
    if (['error'].includes(message.type())) result.consoleErrors.push(clean(message.text()));
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    result.failedRequests.push(`${request.url()} ${failure ? failure.errorText : ''}`.trim());
  });

  const response = await page.goto(fullUrl(route), { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((error) => {
    result.consoleErrors.push(`Navigation failed: ${error.message}`);
    return null;
  });
  result.status = response ? response.status() : 0;
  await page.waitForTimeout(700);
  result.finalPath = routePath(page.url());
  result.title = await page.title().catch(() => '');

  Object.assign(result, await page.evaluate(() => {
    const bodyText = document.body ? document.body.innerText.trim() : '';
    const brokenImages = Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src || img.alt || 'unknown image');
    return {
      blank: bodyText.length < 80,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      brokenImages
    };
  }).catch(() => ({})));

  const links = await page.$$eval('a[href]', (anchors) => anchors
    .map((a) => ({ text: a.innerText.trim(), href: a.href }))
    .filter((item) => {
      try {
        const url = new URL(item.href);
        return url.origin === location.origin && !url.hash && !url.href.includes('mailto:') && !url.href.includes('tel:');
      } catch {
        return false;
      }
    })
    .slice(0, 35));

  const seen = new Set();
  for (const link of links) {
    const href = link.href.replace(/#.*$/, '');
    if (seen.has(href)) continue;
    seen.add(href);
    const response = await page.context().request.get(href, { maxRedirects: 2 }).catch((error) => ({ error }));
    const status = typeof response.status === 'function' ? response.status() : 0;
    if (!status || status >= 400) result.internalLinkFailures.push({ text: clean(link.text), href, status });
  }

  const clickables = await page.locator('a, button, [role="button"], input[type="submit"]').evaluateAll((nodes) => nodes
    .map((node, index) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        index,
        text: (node.innerText || node.value || node.getAttribute('aria-label') || node.getAttribute('title') || '').trim(),
        href: node.href || node.getAttribute('href') || '',
        visible: style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
      };
    })
    .filter((item) => item.visible)
    .slice(0, 24));

  for (const item of clickables) {
    const label = clean(item.text || item.href || `clickable-${item.index}`);
    if (!label || skipClickText.test(label) || skipClickText.test(item.href || '')) continue;
    if (/^#/.test(item.href || '')) continue;
    const before = page.url();
    try {
      const target = page.locator('a, button, [role="button"], input[type="submit"]').nth(item.index);
      await target.click({ timeout: 2500 });
      await page.waitForTimeout(300);
      result.clickResults.push({ label, from: routePath(before), to: routePath(page.url()) });
      if (page.url() !== before) {
        await page.goto(fullUrl(route), { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(250);
      }
    } catch (error) {
      result.clickResults.push({ label, error: error.message.split('\n')[0] });
    }
  }

  const lesson = lessons.find((item) => item.path === route);
  if (lesson) {
    result.lesson = await auditLesson(page, lesson);
  }

  return result;
}

async function auditLesson(page, lesson) {
  await page.goto(fullUrl(lesson.path), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const before = await page.evaluate(() => ({
    topNavText: document.querySelector('.lesson-nav-strip')?.innerText || '',
    topNavVisible: !!document.querySelector('.lesson-nav-strip') && getComputedStyle(document.querySelector('.lesson-nav-strip')).display !== 'none',
    bottomNavCount: document.querySelectorAll('.lesson-nav-bottom').length,
    bottomNavVisible: Array.from(document.querySelectorAll('.lesson-nav-bottom')).some((el) => {
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.getBoundingClientRect().height > 1;
    })
  }));

  const checks = page.locator('.lesson-check, [data-lesson-check], .action-checklist input[type="checkbox"], input[type="checkbox"]');
  const count = await checks.count();
  for (let index = 0; index < count; index += 1) {
    const box = checks.nth(index);
    const tag = await box.evaluate((node) => node.tagName.toLowerCase()).catch(() => '');
    const checked = await box.isChecked().catch(() => false);
    if (tag === 'input') {
      if (!checked) await box.check({ force: true }).catch(() => {});
    } else {
      await box.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(120);
  }

  await page.waitForTimeout(500);
  const gate = page.locator('[data-gated], .lesson-complete, .completion-gate').first();
  const gateVisible = await gate.isVisible().catch(() => false);
  const cta = gate.locator('a.btn, a.button, a, button').first();
  const ctaText = await cta.textContent().catch(() => '');
  const ctaHref = await cta.evaluate((node) => node.href || node.getAttribute('href') || '').catch(() => '');
  if (await cta.count()) {
    await cta.click({ timeout: 4000 }).catch(() => {});
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(500);
  }

  const topText = clean(before.topNavText);
  const [expectedPrev, expectedNext] = lesson.top.split('|');

  return {
    path: lesson.path,
    expectedNext: lesson.next,
    checkboxes: count,
    gateVisible,
    ctaText: clean(ctaText),
    ctaHref,
    landedPath: routePath(page.url()),
    topNavVisible: before.topNavVisible,
    topNavText: topText,
    topNavMatches: topText.includes(expectedPrev) && topText.includes(expectedNext),
    bottomNavCount: before.bottomNavCount,
    bottomNavVisible: before.bottomNavVisible
  };
}

function summarize(results) {
  const failures = [];
  for (const result of results) {
    if (!result.status || result.status >= 400) failures.push(`${result.route}: bad status ${result.status}`);
    if (result.blank) failures.push(`${result.route}: appears blank`);
    if (result.overflow) failures.push(`${result.route}: horizontal overflow`);
    for (const image of result.brokenImages || []) failures.push(`${result.route}: broken image ${image}`);
    for (const link of result.internalLinkFailures || []) failures.push(`${result.route}: broken link ${link.status} ${link.href}`);
    for (const error of result.consoleErrors || []) failures.push(`${result.route}: console error ${error}`);
    for (const request of result.failedRequests || []) failures.push(`${result.route}: failed request ${request}`);
    for (const click of result.clickResults || []) {
      if (click.error) failures.push(`${result.route}: click failed "${click.label}" - ${click.error}`);
    }
    if (result.lesson) {
      const lesson = result.lesson;
      if (!lesson.topNavVisible) failures.push(`${lesson.path}: top previous/next nav missing`);
      if (!lesson.topNavMatches) failures.push(`${lesson.path}: top nav labels mismatch (${lesson.topNavText})`);
      if (lesson.bottomNavVisible) failures.push(`${lesson.path}: bottom previous/next nav still visible`);
      if (!lesson.gateVisible) failures.push(`${lesson.path}: completion gate did not appear`);
      if (lesson.landedPath !== lesson.expectedNext) failures.push(`${lesson.path}: completion CTA landed on ${lesson.landedPath}, expected ${lesson.expectedNext}`);
    }
  }

  return {
    checkedRoutes: results.length,
    failures,
    passed: failures.length === 0
  };
}

(async () => {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const results = [];

  for (const route of publicRoutes) {
    results.push(await inspectPage(page, route));
  }

  await login(page);

  for (const route of memberRoutes) {
    results.push(await inspectPage(page, route));
  }

  await browser.close();

  const summary = summarize(results);
  const report = { baseUrl: BASE_URL, generatedAt: new Date().toISOString(), summary, results };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  const markdown = [
    `# Verge Five critical system audit`,
    ``,
    `Base URL: ${BASE_URL}`,
    `Generated: ${report.generatedAt}`,
    `Routes checked: ${summary.checkedRoutes}`,
    `Status: ${summary.passed ? 'PASS' : 'FAIL'}`,
    ``,
    `## Failures`,
    ...(summary.failures.length ? summary.failures.map((item) => `- ${item}`) : ['- None'])
  ].join('\n');
  fs.writeFileSync(SUMMARY_PATH, markdown);
  console.log(markdown);
  process.exit(summary.passed ? 0 : 1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
