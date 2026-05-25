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
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && key.indexOf('vf-member-guide-seen:') === 0) localStorage.removeItem(key);
    }
  });
  await page.goto(base + '/start-here/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600);
  const visible = await page.locator('[data-member-guide-modal].active').isVisible().catch(() => false);
  const heading = visible ? await page.locator('[data-member-guide-modal] h2').textContent() : '';
  const steps = await page.locator('.member-guide-steps span').count();
  await page.locator('button[data-member-guide-close]:has-text("Keep working"), button[data-member-guide-close]:has-text("Close")').first().click();
  await page.waitForTimeout(300);
  const dismissed = !(await page.locator('[data-member-guide-modal].active').isVisible().catch(() => false));
  await page.locator('[data-member-guide-trigger]').click();
  await page.waitForTimeout(300);
  const reopened = await page.locator('[data-member-guide-modal].active').isVisible().catch(() => false);
  const trigger = await page.locator('[data-member-guide-trigger]').isVisible().catch(() => false);
  console.log(JSON.stringify({ url: page.url(), visible, heading, steps, dismissed, reopened, trigger, errors }, null, 2));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
