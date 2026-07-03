/* Functional check: account-matcher toggles re-tier accounts live; tabs filter. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/calne/node_modules/playwright');

const BASE = 'https://vergefive-next-dev.turncomvoice.workers.dev';
const creds = JSON.parse(fs.readFileSync(path.join(__dirname, 'scan-first-qa-user.json'), 'utf8'));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: creds.email, password: creds.password },
    headers: { 'content-type': 'application/json', origin: BASE },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/account-matches/`, { waitUntil: 'networkidle' });

  const readyBefore = await page.locator('text=Ready now').first().locator('xpath=preceding-sibling::b').textContent();
  console.log('ready count before toggles:', readyBefore.trim());

  // Toggle every core signal on
  for (const label of ['Legal entity formed', 'EIN issued by IRS', 'Business phone number', 'Valid business address', 'Website + domain email', 'Business bank account', 'Bank rating (Low-5+)', '12-point criteria met', 'Reporting tradelines']) {
    const box = page.getByLabel(label);
    if (!(await box.isChecked())) await box.check();
  }
  await page.waitForTimeout(300);
  const readyAfter = await page.locator('text=Ready now').first().locator('xpath=preceding-sibling::b').textContent();
  console.log('ready count with all core signals on:', readyAfter.trim());

  // Vendor tab should now be fully ready
  await page.getByRole('button', { name: /Vendor & Net 30/ }).click();
  await page.waitForTimeout(300);
  const vendorBuild = await page.locator('text=Build first').first().locator('xpath=preceding-sibling::b').textContent();
  console.log('vendor tab build-first count with all signals on:', vendorBuild.trim());

  // Reset to scan restores baseline
  await page.getByRole('button', { name: 'Reset to scan' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /All categories/ }).click();
  await page.waitForTimeout(300);
  const readyReset = await page.locator('text=Ready now').first().locator('xpath=preceding-sibling::b').textContent();
  console.log('ready count after reset:', readyReset.trim());

  // Modal opens
  await page.getByRole('button', { name: 'Learn more →' }).first().click();
  const modalVisible = await page.getByRole('dialog').isVisible();
  console.log('modal opens:', modalVisible);
  await page.keyboard.press('Escape');

  await page.screenshot({ path: path.join(__dirname, 'scan-first-visual', 'account-matches-viewport.png') });

  const pass = Number(readyAfter) > Number(readyBefore) && Number(vendorBuild) === 0 && readyReset.trim() === readyBefore.trim() && modalVisible;
  console.log(pass ? 'PASS: matcher re-tiers, filters, resets, and modal works' : 'FAIL');
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
