const { chromium } = require('../tools/homepage-promo-video/node_modules/playwright');
async function run(email, password, viewport) {
  const base = 'https://backend-progress.vergefive.pages.dev';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/login/', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[name*="email" i]').first().fill(email);
  await page.locator('input[type="password"], input[name*="password" i]').first().fill(password);
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
  await page.waitForTimeout(1700);
  const result = {
    email,
    viewport,
    visible: await page.locator('[data-member-guide-modal].active').isVisible().catch(() => false),
    heading: await page.locator('[data-member-guide-modal] h2').textContent().catch(() => ''),
    steps: await page.locator('.member-guide-steps span').count(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2),
    trigger: await page.locator('[data-member-guide-trigger]').isVisible().catch(() => false),
    errors
  };
  await browser.close();
  return result;
}
(async () => {
  const paidMobile = await run('qa-paid-path@example.com', (process.env.VF_AUDIT_PASSWORD || 'set-vf-audit-password'), { width: 390, height: 844 });
  const trialDesktop = await run('qa-free-path@example.com', 'VergeFree12345', { width: 1365, height: 900 });
  console.log(JSON.stringify({ paidMobile, trialDesktop }, null, 2));
})().catch((error) => { console.error(error); process.exit(1); });
