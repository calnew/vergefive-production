const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const video = path.resolve(__dirname, '../../public/Resources/videos/verge-five-homepage-promo.webm');
const outDir = path.resolve(__dirname, '../../qa/homepage-promo-frames');
fs.mkdirSync(outDir, { recursive: true });

const server = http.createServer((req, res) => {
  const stat = fs.statSync(video);
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    res.writeHead(206, {
      'Content-Type': 'video/webm',
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(video, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'video/webm',
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes'
  });
  fs.createReadStream(video).pipe(res);
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const src = `http://127.0.0.1:${server.address().port}/video`;
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(`<video id="v" src="${src}" muted controls style="width:1280px;height:720px"></video>`);
  await page.evaluate(async () => {
    const v = document.getElementById('v');
    await new Promise((resolve) => v.addEventListener('loadedmetadata', resolve, { once: true }));
    await v.play();
  });
  let previous = 0;
  for (const second of [2, 14, 30, 48, 62, 74, 84]) {
    await page.waitForTimeout((second - previous) * 1000);
    previous = second;
    await page.screenshot({ path: path.join(outDir, `promo-${second}s.png`), fullPage: true });
  }
  await browser.close();
  server.close();
  console.log(outDir);
})();
