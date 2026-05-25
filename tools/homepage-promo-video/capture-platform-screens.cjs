const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const project = __dirname;
const assets = path.join(project, 'assets');
fs.mkdirSync(assets, { recursive: true });
const base = 'https://3418f05f.vergefive.pages.dev';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function shot(page, selector, name) {
  const el = await page.$(selector);
  if (!el) throw new Error(`Missing selector ${selector}`);
  await el.screenshot({ path: path.join(assets, name) });
}

async function checkSignals(page, selector, signals) {
  for (const sig of signals) {
    const input = await page.$(`${selector} input[data-${selector.includes('card') ? 'card' : 'vendor'}-signal="${sig}"]`);
    if (input) {
      const checked = await input.isChecked();
      if (!checked) await input.click();
    }
  }
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await shot(page, '.hero', 'homepage-hero.png');

  await page.goto(`${base}/start-here/`, { waitUntil: 'networkidle' });
  await shot(page, '.orientation-lead-panel', 'start-here-roadmap.png');

  await page.goto(`${base}/about-net-30/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-vendor-match-tool]');
  await page.locator('[data-vendor-match-tool]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, '[data-vendor-match-tool]', 'net30-before.png');
  await checkSignals(page, '[data-vendor-match-tool]', ['entity','ein','phone','411','address','website','email','bank','duns','time','pg']);
  await shot(page, '[data-vendor-match-tool]', 'net30-after.png');
  const firstVendor = await page.$('[data-vendor-detail]');
  if (firstVendor) {
    await firstVendor.click();
    await page.waitForSelector('.vendor-detail-modal:not(.hide)');
    await shot(page, '.vendor-detail-card', 'net30-detail.png');
  }

  await page.goto(`${base}/revolving-business-credit-cards/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-card-match-tool]', { timeout: 10000 });
  await page.locator('[data-card-match-tool]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await shot(page, '[data-card-match-tool]', 'cards-before.png');
  await checkSignals(page, '[data-card-match-tool]', ['entity','ein','phone','address','website','email','bank','time','tradelines','goodCredit','pgOk','deposit','revenue']);
  await shot(page, '[data-card-match-tool]', 'cards-after.png');

  await browser.close();
  console.log('captured platform screenshots to', assets);
})();
