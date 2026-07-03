/* Functional check: fix-page checklist persists to D1 across a reload. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/calne/node_modules/playwright');

const BASE = 'https://vergefive-next-dev.turncomvoice.workers.dev';
const creds = JSON.parse(fs.readFileSync(path.join(__dirname, 'scan-first-qa-user.json'), 'utf8'));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const login = await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: creds.email, password: creds.password },
    headers: { 'content-type': 'application/json', origin: BASE },
  });
  console.log('login:', login.status());

  const page = await context.newPage();
  await page.goto(`${BASE}/fix/address/`, { waitUntil: 'networkidle' });

  const boxes = page.locator('input[type=checkbox]');
  const before = await boxes.evaluateAll((els) => els.map((el) => el.checked));
  console.log('before:', JSON.stringify(before));

  await boxes.nth(0).check();
  await boxes.nth(2).check();
  await page.waitForTimeout(1500); // debounce + PUT
  const savedNote = await page.getByText('Progress saved').count();
  console.log('saved indicator visible:', savedNote > 0);

  await page.reload({ waitUntil: 'networkidle' });
  const after = await page.locator('input[type=checkbox]').evaluateAll((els) => els.map((el) => el.checked));
  console.log('after reload:', JSON.stringify(after));
  const pass = after[0] === true && after[2] === true && after[1] === false;
  console.log(pass ? 'PASS: checklist persisted' : 'FAIL: checklist did not persist');
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
