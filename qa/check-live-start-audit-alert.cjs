const { chromium } = require('../tools/homepage-promo-video/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  await page.goto('https://backend-progress.vergefive.pages.dev/login/', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[name*="email" i]').first().fill('qa-paid-path@example.com');
  await page.locator('input[type="password"], input[name*="password" i]').first().fill((process.env.VF_AUDIT_PASSWORD || 'set-vf-audit-password'));
  await page.locator('button:has-text("Login"), button:has-text("Log in"), button[type="submit"]').first().click();
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(1000);
  await page.goto('https://backend-progress.vergefive.pages.dev/start-here/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const data = await page.evaluate(() => {
    const el = document.querySelector('[data-start-audit-alert]');
    return {
      exists: !!el,
      text: el ? el.innerText.replace(/\s+/g, ' ').trim() : '',
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
