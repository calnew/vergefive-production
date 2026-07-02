/*
 * Visual QA for the scan-first platform redesign.
 * Registers (or reuses) a trial member on the dev Worker, seeds a scan,
 * captures desktop + mobile screenshots per route, and reports console
 * errors and elements that overflow the viewport.
 *
 * Usage: node qa/scan-first-visual-qa.cjs [/route/ ...]
 */
const fs = require('fs');
const path = require('path');
const playwrightPath = [
  '../tools/homepage-promo-video/node_modules/playwright',
  'playwright',
  'C:/Users/calne/node_modules/playwright',
].find((candidate) => { try { require.resolve(candidate); return true; } catch { return false; } });
const { chromium, devices } = require(playwrightPath);

const BASE = (process.env.VF_QA_URL || 'https://vergefive-next-dev.turncomvoice.workers.dev').replace(/\/$/, '');
const OUT_DIR = path.join(__dirname, 'scan-first-visual');
const CREDS_FILE = path.join(__dirname, 'scan-first-qa-user.json');
const DESKTOP = { width: 1365, height: 900 };
const MOBILE = devices['iPhone 13'];

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/dashboard/'];

const SCAN_BODY = {
  name: 'Ray Construction LLC',
  entityType: 'LLC',
  address: '212 Commerce St, Henderson, NC 27536',
  phone: '(252) 555-0142',
  website: 'rayconstruction-example.com',
  email: 'rayconstruction@gmail.com',
};

function slug(route) {
  return route.replace(/[^a-z0-9[\]-]+/gi, '-').replace(/^-|-$/g, '') || 'home';
}

async function api(request, route, body) {
  const response = await request.post(`${BASE}${route}`, {
    data: body,
    headers: { 'content-type': 'application/json', origin: BASE },
  });
  let json = null;
  try { json = await response.json(); } catch { /* non-JSON */ }
  return { status: response.status(), json, headers: response.headers() };
}

async function ensureUser(request) {
  if (fs.existsSync(CREDS_FILE)) {
    const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
    const login = await api(request, '/api/auth/login', { email: creds.email, password: creds.password });
    if (login.status === 200) return { creds, mode: 'login' };
    console.warn(`login failed (${login.status}) — registering a fresh QA user`);
  }
  const creds = {
    email: `qa-scan-first-${Date.now()}@example.com`,
    password: 'QaScanFirst12345!',
    name: 'QA ScanFirst',
  };
  const register = await api(request, '/api/auth/register', creds);
  if (register.status !== 200) throw new Error(`register failed: ${register.status} ${JSON.stringify(register.json)}`);
  fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2));
  return { creds, mode: 'register' };
}

async function capture(context, route, label, summary) {
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300)); });
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(800);
  const finalUrl = page.url();
  const overflow = await page.evaluate(() => {
    const bad = [];
    const vw = document.documentElement.clientWidth;
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 1 && (rect.right > vw + 1 || rect.left < -1)) {
        const cls = (el.className && typeof el.className === 'string') ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
        bad.push(`${el.tagName.toLowerCase()}${cls} [${Math.round(rect.left)}..${Math.round(rect.right)}] vw=${vw}`);
      }
    }
    return { pageScroll: document.documentElement.scrollWidth > vw + 1, items: bad.slice(0, 12) };
  });
  const file = path.join(OUT_DIR, `${slug(route)}-${label}.png`);
  await page.screenshot({ path: file, fullPage: true });
  summary.push({
    route, label,
    status: response ? response.status() : 'no-response',
    finalUrl,
    consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
    horizontalScroll: overflow.pageScroll,
    overflowItems: overflow.items,
    screenshot: path.relative(process.cwd(), file),
  });
  await page.close();
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const authContext = await browser.newContext({ viewport: DESKTOP });
  const { creds, mode } = await ensureUser(authContext.request);
  console.log(`auth: ${mode} as ${creds.email}`);

  const scan = await api(authContext.request, '/api/scan', SCAN_BODY);
  console.log(`seed scan: ${scan.status} ${JSON.stringify(scan.json)}`);

  const cookies = await authContext.cookies(BASE);
  const mobileContext = await browser.newContext({ ...MOBILE });
  await mobileContext.addCookies(cookies);

  const summary = [];
  for (const route of routes) {
    await capture(authContext, route, 'desktop', summary);
    await capture(mobileContext, route, 'mobile', summary);
  }
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
})();
