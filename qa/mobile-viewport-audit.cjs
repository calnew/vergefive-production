const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const BASE_URL = process.env.VF_AUDIT_URL || 'https://vergefive.pages.dev';
const OUT_DIR = path.join(__dirname, 'mobile-viewport-audit');
const REPORT_PATH = path.join(OUT_DIR, 'report.json');
const SUMMARY_PATH = path.join(OUT_DIR, 'summary.md');
const MOBILE = devices['iPhone 13'];

const publicPages = [
  '/',
  '/membership/',
  '/login/',
  '/signup/',
  '/affiliate-signup/',
  '/blog/',
  '/blog/how-to-build-business-credit-in-the-right-order/'
];

const memberPages = [
  '/homeefe757a6/',
  '/start-here/',
  '/phones-and-411/',
  '/business-address/',
  '/newpage87229491/',
  '/newpage7c157847/',
  '/bank-account/',
  '/business-plan/',
  '/about-net-30/',
  '/revolving-business-credit-cards/',
  '/cd-business-loans/',
  '/final-readiness-summary/'
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function url(route) {
  return new URL(route, BASE_URL).href;
}

function filePart(route) {
  return route.replace(/^\/$/, 'home').replace(/^\/|\/$/g, '').replace(/[\/?&=]+/g, '_') || 'home';
}

async function inspect(page, route, group) {
  const pageErrors = [];
  const consoleMessages = [];
  const failedRequests = [];
  page.removeAllListeners();
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('requestfailed', (request) => {
    const type = request.resourceType();
    if (['media', 'font', 'image'].includes(type)) return;
    const failure = request.failure();
    failedRequests.push({
      type,
      url: request.url(),
      reason: failure ? failure.errorText : 'request failed'
    });
  });

  const response = await page.goto(url(route), { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((error) => {
    pageErrors.push(`goto failed: ${error.message}`);
    return null;
  });
  await page.waitForTimeout(1000);

  const metrics = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0) - viewportWidth;
    const visible = (el) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const outOfBounds = Array.from(document.querySelectorAll('body *'))
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          className: String(el.className || '').slice(0, 80),
          text: String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((item) => item.right > viewportWidth + 6 || item.left < -6)
      .slice(0, 20);
    const brokenImages = Array.from(document.images)
      .filter((img) => img.src && (!img.complete || !img.naturalWidth || !img.naturalHeight))
      .map((img) => img.src)
      .slice(0, 20);
    const crampedButtons = Array.from(document.querySelectorAll('a.btn,button,.btn'))
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right)
        };
      })
      .filter((item) => item.width < 42 || item.height < 34 || item.right > viewportWidth + 6 || item.left < -6)
      .slice(0, 20);
    return {
      viewportWidth,
      viewportHeight,
      scrollWidth: doc.scrollWidth,
      scrollHeight: doc.scrollHeight,
      overflowX,
      outOfBounds,
      brokenImages,
      crampedButtons
    };
  }).catch((error) => ({ error: error.message }));

  const screenshot = path.join(OUT_DIR, `${group}-${filePart(route)}.png`);
  await page.screenshot({ path: screenshot, fullPage: false }).catch(() => {});

  return {
    group,
    route,
    status: response ? response.status() : 0,
    finalUrl: page.url(),
    title: await page.title().catch(() => ''),
    pageErrors,
    consoleMessages: consoleMessages.slice(0, 10),
    failedRequests: failedRequests.slice(0, 10),
    metrics,
    screenshot
  };
}

function hasIssue(item) {
  const metrics = item.metrics || {};
  return item.status >= 400 ||
    (item.group === 'member-mobile' && item.finalUrl.includes('/login/')) ||
    (metrics.overflowX || 0) > 8 ||
    (metrics.outOfBounds || []).length > 0 ||
    (metrics.brokenImages || []).length > 0 ||
    (metrics.crampedButtons || []).length > 0 ||
    item.pageErrors.length > 0 ||
    item.failedRequests.length > 0;
}

async function login(context) {
  const email = process.env.VF_AUDIT_EMAIL;
  const password = process.env.VF_AUDIT_PASSWORD;
  if (!email || !password) return { ok: false, reason: 'VF_AUDIT_EMAIL/VF_AUDIT_PASSWORD not provided' };
  const response = await context.request.post(url('/api/auth/login'), { data: { email, password } });
  return { ok: response.ok(), status: response.status(), body: await response.text().catch(() => '') };
}

async function main() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ ...MOBILE, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const report = { baseUrl: BASE_URL, generatedAt: new Date().toISOString(), publicPages: [], memberPages: [] };

  for (const route of publicPages) report.publicPages.push(await inspect(page, route, 'public-mobile'));

  report.authenticatedLogin = await login(context);
  if (report.authenticatedLogin.ok) {
    for (const route of memberPages) report.memberPages.push(await inspect(page, route, 'member-mobile'));
  }

  await context.close();
  await browser.close();

  const publicIssues = report.publicPages.filter(hasIssue);
  const memberIssues = report.memberPages.filter(hasIssue);
  report.publicIssues = publicIssues;
  report.memberIssues = memberIssues;

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  const lines = [
    '# Verge Five Mobile Viewport Audit',
    '',
    `Base URL: ${BASE_URL}`,
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Public mobile pages checked: ${report.publicPages.length}`,
    `- Member mobile pages checked: ${report.memberPages.length}`,
    `- Public mobile issues: ${publicIssues.length}`,
    `- Member mobile issues: ${memberIssues.length}`,
    `- Authenticated crawl: ${report.authenticatedLogin.ok ? 'PASS' : 'SKIPPED/FAIL'} ${report.authenticatedLogin.reason || report.authenticatedLogin.status || ''}`,
    '',
    '## Issues'
  ];
  const issueLines = [...publicIssues, ...memberIssues];
  if (!issueLines.length) lines.push('- None found in the automated mobile viewport pass.');
  issueLines.forEach((item) => {
    const metrics = item.metrics || {};
    lines.push(`- ${item.group} ${item.route}: status ${item.status}, overflowX ${metrics.overflowX || 0}, final ${item.finalUrl}`);
    if ((metrics.outOfBounds || []).length) lines.push(`  - Out of bounds: ${metrics.outOfBounds.map((el) => `${el.tag}.${el.className} ${el.width}px`).join(' | ')}`);
    if ((metrics.crampedButtons || []).length) lines.push(`  - Cramped buttons: ${metrics.crampedButtons.map((btn) => `${btn.text} ${btn.width}x${btn.height}`).join(' | ')}`);
    if ((metrics.brokenImages || []).length) lines.push(`  - Broken images: ${metrics.brokenImages.join(' | ')}`);
    if (item.pageErrors.length) lines.push(`  - Page errors: ${item.pageErrors.join(' | ')}`);
    if (item.failedRequests.length) lines.push(`  - Failed requests: ${item.failedRequests.map((r) => `${r.type} ${r.url} (${r.reason})`).join(' | ')}`);
  });
  lines.push('');
  lines.push(`Full JSON report: ${REPORT_PATH}`);
  fs.writeFileSync(SUMMARY_PATH, lines.join('\n'));
  console.log(lines.join('\n'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
