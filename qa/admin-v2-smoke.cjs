const { chromium } = require('../tools/homepage-promo-video/node_modules/playwright');
(async () => {
  const base = 'https://backend-progress.vergefive.pages.dev';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/login/', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[name*="email" i]').first().fill('qa-paid-path@example.com');
  await page.locator('input[type="password"], input[name*="password" i]').first().fill((process.env.VF_AUDIT_PASSWORD || 'set-vf-audit-password'));
  await page.locator('button:has-text("Login"), button:has-text("Log in"), button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(1000);
  await page.goto(base + '/admin/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const adminData = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    rows: document.querySelectorAll('[data-admin-members] tr').length,
    metrics: document.querySelector('[data-admin-totals]')?.innerText || '',
    hasExport: !!document.querySelector('[data-admin-export], a[href="/api/admin/members?format=csv"]'),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    body: document.body.innerText.slice(0, 500)
  }));
  await page.locator('[data-admin-member-id]').first().click();
  await page.waitForTimeout(1800);
  const detail = await page.evaluate(() => ({
    hasControls: !!document.querySelector('.admin-control-panel'),
    hasNotes: !!document.querySelector('[data-admin-note-form]'),
    hasReset: !!document.querySelector('[data-admin-action="reset-password"]'),
    hasClear: !!document.querySelector('[data-admin-action="clear-progress"]'),
    hasActivity: document.body.innerText.includes('Admin activity'),
    detailText: document.querySelector('[data-admin-member-detail-body]')?.innerText.slice(0, 700) || ''
  }));
  const csv = await page.context().request.get(base + '/api/admin/members?format=csv');
  console.log(JSON.stringify({ adminData, detail, csvStatus: csv.status(), csvType: csv.headers()['content-type'], errors }, null, 2));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
