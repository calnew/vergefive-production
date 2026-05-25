const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { html } = require('./render-promo-canvas.cjs');

const outDir = path.resolve(__dirname, '../../qa/homepage-promo-frames');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: 'load' });
  await page.evaluate(async () => {
    await loadImages();
  });

  for (const second of [2, 14, 30, 48, 62, 74, 84]) {
    await page.evaluate((time) => {
      render(time);
    }, second);
    await page.screenshot({ path: path.join(outDir, `promo-${second}s.png`), fullPage: true });
  }
  await browser.close();
  console.log(outDir);
})();
