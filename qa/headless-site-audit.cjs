const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const BASE_URL = process.env.VF_AUDIT_URL || 'https://vergefive.pages.dev';
const OUT_DIR = path.join(__dirname, 'headless-audit');
const REPORT_PATH = path.join(OUT_DIR, 'report.json');
const SUMMARY_PATH = path.join(OUT_DIR, 'summary.md');
const DESKTOP = { width: 1365, height: 900 };
const MOBILE = devices['iPhone 13'];

const publicPages = [
  '/',
  '/membership/',
  '/login/',
  '/signup/',
  '/blog/',
  '/privacy-policy/',
  '/terms/',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/manifest.json'
];

const protectedPages = [
  '/homeefe757a6/',
  '/start-here/',
  '/phones-and-411/',
  '/business-address/',
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
  '/newpagea5b34995/',
  '/about-net-30/',
  '/nav-boot/',
  '/revolving-business-credit-cards/',
  '/cd-business-loans/',
  '/starter-net-30-vendors/',
  '/starter-cards/',
  '/general-credit-cards/',
  '/final-readiness-summary/',
  '/downloads/',
  '/ai-visibility-audit/',
  '/support/'
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function fullUrl(route) {
  return new URL(route, BASE_URL).href;
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function newContext(browser, mode) {
  if (mode === 'mobile') {
    return browser.newContext({
      ...MOBILE,
      ignoreHTTPSErrors: true
    });
  }
  return browser.newContext({
    viewport: DESKTOP,
    ignoreHTTPSErrors: true
  });
}

async function inspectPage(page, route, mode) {
  const errors = [];
  const failedRequests = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleErrors.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      reason: failure ? failure.errorText : 'request failed'
    });
  });

  const response = await page.goto(fullUrl(route), { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((error) => {
    errors.push(`goto failed: ${error.message}`);
    return null;
  });
  await page.waitForTimeout(700).catch(() => {});

  const status = response ? response.status() : 0;
  const finalUrl = page.url();
  const title = await page.title().catch(() => '');
  const h1 = await page.locator('h1').first().textContent({ timeout: 1500 }).catch(() => '');
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0) - window.innerWidth;
    const clickable = Array.from(document.querySelectorAll('a,button,input,select,textarea')).length;
    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute('alt') || '',
      complete: img.complete,
      width: img.naturalWidth,
      height: img.naturalHeight,
      rect: img.getBoundingClientRect().toJSON()
    }));
    const videos = Array.from(document.querySelectorAll('video')).map((video) => ({
      src: video.currentSrc || (video.querySelector('source') && video.querySelector('source').src) || '',
      readyState: video.readyState,
      width: video.videoWidth,
      height: video.videoHeight,
      rect: video.getBoundingClientRect().toJSON()
    }));
    const buttons = Array.from(document.querySelectorAll('button,.btn')).slice(0, 20).map((el) => ({
      text: el.textContent.trim(),
      href: el.href || '',
      rect: el.getBoundingClientRect().toJSON()
    }));
    return {
      path: location.pathname,
      overflowX,
      scrollHeight: doc.scrollHeight,
      viewportHeight: window.innerHeight,
      clickable,
      imageCount: images.length,
      brokenImages: images.filter((img) => img.src && (!img.complete || img.width === 0 || img.height === 0)).slice(0, 10),
      missingAltImages: images.filter((img) => img.src && !img.alt).length,
      videos,
      buttons
    };
  }).catch((error) => ({ error: error.message }));

  const screenshotName = `${mode}-${route.replace(/^\/$/, 'home').replace(/^\/|\/$/g, '').replace(/[\/?&=]+/g, '_') || 'home'}.png`;
  const screenshotPath = path.join(OUT_DIR, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

  return {
    route,
    mode,
    status,
    finalUrl,
    title,
    h1: cleanText(h1),
    errors,
    consoleErrors: consoleErrors.slice(0, 12),
    failedRequests: failedRequests.filter((item) => !item.url.includes('favicon')).slice(0, 12),
    metrics,
    screenshot: screenshotPath
  };
}

async function testMembershipSelection(page) {
  const result = { route: '/membership/', ok: false, notes: [] };
  await page.goto(fullUrl('/membership/'), { waitUntil: 'domcontentloaded' });
  await page.click('[data-select-plan][data-plan="monthly"]');
  const monthlySelected = await page.locator('[data-plan-card="monthly"].selected-plan').count();
  const monthlyMessage = await page.locator('[data-auth-message]').textContent().catch(() => '');
  await page.click('[data-select-plan][data-plan="annual"]');
  const annualSelected = await page.locator('[data-plan-card="annual"].selected-plan').count();
  const annualMessage = await page.locator('[data-auth-message]').textContent().catch(() => '');
  result.ok = monthlySelected === 1 && annualSelected === 1 && /monthly/i.test(monthlyMessage) && /annual/i.test(annualMessage);
  result.notes.push(`monthly selected count: ${monthlySelected}`);
  result.notes.push(`monthly message: ${cleanText(monthlyMessage)}`);
  result.notes.push(`annual selected count: ${annualSelected}`);
  result.notes.push(`annual message: ${cleanText(annualMessage)}`);
  return result;
}

async function testProtectedRedirect(page) {
  await page.goto(fullUrl('/homeefe757a6/'), { waitUntil: 'domcontentloaded' });
  return {
    route: '/homeefe757a6/',
    ok: page.url().includes('/login/'),
    finalUrl: page.url()
  };
}

async function testVisibilityScan(page) {
  const result = { route: '/', ok: false, notes: [] };
  await page.goto(fullUrl('/'), { waitUntil: 'domcontentloaded' });
  await page.fill('[data-public-scan] input[name="businessName"]', 'Verge Five LLC');
  await page.fill('[data-public-scan] input[name="state"]', 'North Carolina');
  await page.click('[data-public-scan] button[type="submit"]');
  await page.waitForSelector('.scan-score', { timeout: 20000 });
  const score = await page.locator('.scan-score').first().textContent();
  result.ok = /\d+\s*\/\s*10/.test(score);
  result.notes.push(`scan score text: ${cleanText(score)}`);
  return result;
}

async function loginIfConfigured(context) {
  const email = process.env.VF_AUDIT_EMAIL;
  const password = process.env.VF_AUDIT_PASSWORD;
  if (!email || !password) return { ok: false, reason: 'VF_AUDIT_EMAIL/VF_AUDIT_PASSWORD not provided' };
  const response = await context.request.post(fullUrl('/api/auth/login'), {
    data: { email, password }
  });
  return { ok: response.ok(), status: response.status(), body: await response.text().catch(() => '') };
}

async function main() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const report = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    publicPages: [],
    protectedRedirects: [],
    memberPages: [],
    flows: []
  };

  for (const mode of ['desktop', 'mobile']) {
    const context = await newContext(browser, mode);
    const page = await context.newPage();
    for (const route of publicPages) {
      report.publicPages.push(await inspectPage(page, route, mode));
    }
    await context.close();
  }

  {
    const context = await newContext(browser, 'desktop');
    const page = await context.newPage();
    for (const flow of [testMembershipSelection, testProtectedRedirect, testVisibilityScan]) {
      try {
        report.flows.push(await flow(page));
      } catch (error) {
        report.flows.push({ route: 'flow', ok: false, notes: [error.message] });
      }
    }
    for (const route of protectedPages) {
      const item = await inspectPage(page, route, 'protected-logged-out');
      report.protectedRedirects.push({
        route,
        status: item.status,
        finalUrl: item.finalUrl,
        ok: item.finalUrl.includes('/login/')
      });
    }
    await context.close();
  }

  {
    const context = await newContext(browser, 'desktop');
    const login = await loginIfConfigured(context);
    report.authenticatedLogin = login;
    if (login.ok) {
      const page = await context.newPage();
      for (const route of protectedPages) {
        report.memberPages.push(await inspectPage(page, route, 'member-desktop'));
      }
    }
    await context.close();
  }

  await browser.close();

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  const allPages = [...report.publicPages];
  const memberIssues = report.memberPages.filter((item) =>
    item.status >= 400 ||
    item.finalUrl.includes('/login/') ||
    (item.metrics && item.metrics.overflowX > 8) ||
    item.errors.length ||
    item.failedRequests.length ||
    (item.metrics && item.metrics.brokenImages && item.metrics.brokenImages.length)
  );
  const pageIssues = allPages.filter((item) =>
    item.status >= 400 ||
    (item.metrics && item.metrics.overflowX > 8) ||
    item.errors.length ||
    item.failedRequests.length ||
    (item.metrics && item.metrics.brokenImages && item.metrics.brokenImages.length)
  );
  const badRedirects = report.protectedRedirects.filter((item) => !item.ok);
  const badFlows = report.flows.filter((item) => !item.ok);

  const lines = [];
  lines.push(`# Verge Five Headless Audit`);
  lines.push(``);
  lines.push(`Base URL: ${BASE_URL}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`- Public page checks: ${report.publicPages.length}`);
  lines.push(`- Protected logged-out route checks: ${report.protectedRedirects.length}`);
  lines.push(`- Flow checks: ${report.flows.length}`);
  lines.push(`- Authenticated member page checks: ${report.memberPages.length}`);
  lines.push(`- Public page issues found: ${pageIssues.length}`);
  lines.push(`- Member page issues found: ${memberIssues.length}`);
  lines.push(`- Protected route failures: ${badRedirects.length}`);
  lines.push(`- Flow failures: ${badFlows.length}`);
  lines.push(``);
  lines.push(`## Flow Results`);
  report.flows.forEach((flow) => {
    lines.push(`- ${flow.ok ? 'PASS' : 'FAIL'} ${flow.route}: ${(flow.notes || []).join(' | ') || flow.finalUrl || ''}`);
  });
  lines.push(``);
  lines.push(`## Public Page Issues`);
  if (!pageIssues.length) lines.push(`- None found in the automated pass.`);
  pageIssues.forEach((item) => {
    lines.push(`- ${item.mode} ${item.route} -> status ${item.status}, overflowX ${item.metrics && item.metrics.overflowX}`);
    if (item.errors.length) lines.push(`  - Page errors: ${item.errors.join(' | ')}`);
    if (item.failedRequests.length) lines.push(`  - Failed requests: ${item.failedRequests.map((r) => `${r.method} ${r.url} (${r.reason})`).join(' | ')}`);
    if (item.metrics && item.metrics.brokenImages && item.metrics.brokenImages.length) lines.push(`  - Broken images: ${item.metrics.brokenImages.map((img) => img.src).join(' | ')}`);
  });
  lines.push(``);
  lines.push(`## Protected Route Results`);
  if (!badRedirects.length) lines.push(`- All protected routes redirected logged-out users to login.`);
  badRedirects.forEach((item) => lines.push(`- FAIL ${item.route} -> ${item.finalUrl}`));
  lines.push(``);
  lines.push(`## Authenticated Member Page Issues`);
  if (!report.authenticatedLogin || !report.authenticatedLogin.ok) {
    lines.push(`- Authenticated crawl was not run: ${report.authenticatedLogin ? report.authenticatedLogin.reason || report.authenticatedLogin.body : 'No login data'}`);
  } else if (!memberIssues.length) {
    lines.push(`- None found in the automated authenticated pass.`);
  }
  memberIssues.forEach((item) => {
    lines.push(`- ${item.route} -> status ${item.status}, finalUrl ${item.finalUrl}, overflowX ${item.metrics && item.metrics.overflowX}`);
    if (item.errors.length) lines.push(`  - Page errors: ${item.errors.join(' | ')}`);
    if (item.failedRequests.length) lines.push(`  - Failed requests: ${item.failedRequests.map((r) => `${r.method} ${r.url} (${r.reason})`).join(' | ')}`);
    if (item.metrics && item.metrics.brokenImages && item.metrics.brokenImages.length) lines.push(`  - Broken images: ${item.metrics.brokenImages.map((img) => img.src).join(' | ')}`);
  });
  lines.push(``);
  lines.push(`Full JSON report: ${REPORT_PATH}`);
  fs.writeFileSync(SUMMARY_PATH, lines.join('\n'));

  console.log(lines.join('\n'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
