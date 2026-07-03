/* Functional check: Mark Complete updates fix status, shows the banner, and moves the readiness score. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/calne/node_modules/playwright');

const BASE = 'https://vergefive-next-dev.turncomvoice.workers.dev';
const creds = JSON.parse(fs.readFileSync(path.join(__dirname, 'scan-first-qa-user.json'), 'utf8'));

async function readScore(page) {
  await page.goto(`${BASE}/scan/`, { waitUntil: 'networkidle' });
  const text = await page.locator('svg[aria-label^="Readiness"]').first().getAttribute('aria-label');
  return Number((text.match(/Readiness (\d+)/) || [])[1]);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: creds.email, password: creds.password },
    headers: { 'content-type': 'application/json', origin: BASE },
  });
  const page = await context.newPage();

  const scoreBefore = await readScore(page);
  console.log('score before:', scoreBefore);

  await page.goto(`${BASE}/fix/address/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await page.waitForURL(/completed=1/, { timeout: 30000 });
  let banner = false;
  try {
    await page.getByText('marked complete').first().waitFor({ timeout: 10000 });
    banner = true;
  } catch { /* banner missing */ }
  console.log('completion banner:', banner, '| url:', page.url());

  const scoreAfter = await readScore(page);
  console.log('score after:', scoreAfter);

  // Undo so the QA account returns to a clean baseline.
  await page.goto(`${BASE}/fix/address/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /undo/i }).click();
  await page.waitForTimeout(2500);
  const scoreReset = await readScore(page);
  console.log('score after undo:', scoreReset);

  const pass = banner > 0 && scoreAfter > scoreBefore && scoreReset === scoreBefore;
  console.log(pass ? 'PASS: mark complete + undo flow works' : 'FAIL');
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
