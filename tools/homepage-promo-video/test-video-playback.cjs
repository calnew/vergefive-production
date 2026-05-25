const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const videoPath = process.argv[2];
if (!videoPath) {
  console.error('Usage: node test-video-playback.cjs <absolute-video-path-or-url>');
  process.exit(1);
}

(async () => {
  let server;
  let src = videoPath;
  if (!/^https?:\/\//.test(videoPath)) {
    if (process.env.SERVE_LOCAL === '1') {
      const absolute = path.resolve(videoPath);
      server = http.createServer((req, res) => {
        const stat = fs.statSync(absolute);
        res.writeHead(200, {
          'Content-Type': absolute.endsWith('.webm') ? 'video/webm' : 'video/mp4',
          'Content-Length': stat.size,
          'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(absolute).pipe(res);
      });
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
      src = `http://127.0.0.1:${server.address().port}/video`;
    } else {
      src = `file:///${videoPath.replace(/\\/g, '/')}`;
    }
  }
  const launchOptions = {
    args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files']
  };
  if (process.env.USE_SYSTEM_CHROME !== '0') {
    launchOptions.executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(`<video id="v" src="${src}" muted controls style="width:1280px;height:720px"></video>`);
  const data = await page.evaluate(async () => {
    const v = document.getElementById('v');
    const result = {
      duration: null,
      currentTime: 0,
      networkState: 0,
      readyState: 0,
      error: null
    };

    v.play().catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 5000));

    result.duration = Number.isFinite(v.duration) ? v.duration : null;
    result.currentTime = v.currentTime;
    result.networkState = v.networkState;
    result.readyState = v.readyState;
    result.error = v.error && v.error.code;
    return result;
  });
  await browser.close();
  if (server) {
    server.close();
  }
  console.log(JSON.stringify({ src, ...data }, null, 2));
})();
