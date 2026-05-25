const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../public');
const outDir = path.resolve(__dirname, '../qa');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webm': 'video/webm',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  let file = path.join(root, decodeURIComponent(url.pathname));
  if (url.pathname === '/') file = path.join(root, 'index.html');
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size
    });
    fs.createReadStream(file).pipe(res);
  });
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

  for (const shot of [
    { name: 'qa-homepage-hero-scan-desktop.png', width: 1440, height: 1100 },
    { name: 'qa-homepage-hero-scan-mobile.png', width: 390, height: 1200 }
  ]) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, shot.name), fullPage: false });
    const data = await page.evaluate(() => ({
      title: document.querySelector('.hero h1') && document.querySelector('.hero h1').textContent,
      hasHeroScan: !!document.querySelector('.hero [data-public-scan]'),
      hasSeparateScan: !!document.querySelector('.public-scan-section'),
      promoImmediatelyAfterHero: document.querySelector('.hero') &&
        document.querySelector('.hero').nextElementSibling &&
        document.querySelector('.hero').nextElementSibling.classList.contains('homepage-promo-video'),
      painAfterPromo: document.querySelector('.homepage-promo-video') &&
        document.querySelector('.homepage-promo-video').nextElementSibling &&
        document.querySelector('.homepage-promo-video').nextElementSibling.classList.contains('burned-buyer-section')
    }));
    console.log(JSON.stringify({ shot: shot.name, ...data }));
    await page.close();
  }

  await browser.close();
  server.close();
})();
