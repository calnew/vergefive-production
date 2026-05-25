const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const root = path.resolve(__dirname, '..', 'public');
const port = 8177;
const baseUrl = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, '') : '';
const demoUrl = baseUrl ? `${baseUrl}/demo/` : `http://127.0.0.1:${port}/demo/`;
const homeUrl = baseUrl ? `${baseUrl}/` : `http://127.0.0.1:${port}/`;

function contentType(file) {
  if (file.endsWith('.css')) return 'text/css';
  if (file.endsWith('.js')) return 'application/javascript';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  if (file.endsWith('.webm')) return 'video/webm';
  if (file.endsWith('.mp4')) return 'video/mp4';
  return 'text/html';
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    if (!file.startsWith(root)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    fs.readFile(file, (err, body) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': contentType(file) });
      res.end(body);
    });
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}

async function checkPage(page, url, viewport, name) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const metrics = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    title: document.title,
  }));
  const overflow = metrics.scrollWidth > metrics.width + 2;
  await page.screenshot({ path: path.join(__dirname, `demo-${name}.png`), fullPage: true });
  return { name, overflow, ...metrics };
}

(async () => {
  const server = baseUrl ? null : await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  results.push(await checkPage(page, demoUrl, { width: 1365, height: 900 }, 'desktop'));
  results.push(await checkPage(page, demoUrl, { width: 390, height: 844 }, 'mobile'));

  await page.setViewportSize({ width: 1365, height: 900 });
  await page.goto(demoUrl, { waitUntil: 'load' });
  await page.locator('[data-demo-preset="ready"]').click();
  await page.waitForTimeout(150);
  const presetScore = await page.locator('[data-demo-score]').first().textContent();
  const presetVendorReady = await page.locator('[data-demo-vendor-count]').textContent();
  const presetCardReady = await page.locator('[data-demo-card-count]').textContent();
  await page.locator('[data-demo-preset="start"]').click();
  await page.waitForTimeout(150);
  await page.locator('[data-demo-signal="entity"]').check();
  await page.locator('[data-demo-signal="ein"]').check();
  await page.locator('[data-demo-signal="phone"]').check();
  await page.locator('[data-demo-signal="address"]').check();
  await page.locator('[data-demo-signal="bank"]').check();
  await page.waitForTimeout(150);
  const score = await page.locator('[data-demo-score]').first().textContent();
  const vendorReady = await page.locator('[data-demo-vendor-count]').textContent();
  const waitCards = await page.locator('.demo-sample-card.wait').count();
  await page.locator('[data-demo-report-open]').click();
  await page.waitForTimeout(150);
  const reportVisible = await page.locator('[data-demo-report-modal]:not(.hide) .sample-report-doc').count();
  const reportScroll = await page.locator('.demo-report-card').evaluate(el => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    canScroll: el.scrollHeight > el.clientHeight + 2,
  }));
  await page.screenshot({ path: path.join(__dirname, 'demo-report-modal.png'), fullPage: true });

  results.push(await checkPage(page, homeUrl, { width: 390, height: 844 }, 'homepage-mobile'));
  const homeHasDemo = await page.locator('[data-demo-cta]').count();
  const homeQuickDemo = await page.locator('.homepage-quick-demo').count();
  if (homeQuickDemo) {
    await page.locator('.homepage-quick-demo [data-demo-preset="ready"]').click();
    await page.waitForTimeout(150);
  }
  const homeQuickScore = homeQuickDemo ? await page.locator('.homepage-quick-demo [data-demo-score]').textContent() : '0';

  await browser.close();
  if (server) server.close();
  console.log(JSON.stringify({ results, score, vendorReady, waitCards, homeHasDemo, homeQuickDemo, homeQuickScore, presetScore, presetVendorReady, presetCardReady, reportVisible, reportScroll }, null, 2));

  if (results.some(r => r.overflow)) process.exit(1);
  if (!Number(score)) process.exit(1);
  if (Number(presetScore) < 90) process.exit(1);
  if (!reportVisible) process.exit(1);
  if (!reportScroll.canScroll) process.exit(1);
  if (!homeQuickDemo || Number(homeQuickScore) < 90) process.exit(1);
  if (!homeHasDemo) process.exit(1);
})();
