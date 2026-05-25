const path = require('path');
const { chromium } = require('playwright');

const videoPath = path.resolve(__dirname, '../public/Resources/videos/start-here-nap-overview.webm');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const videoUrl = `data:video/webm;base64,${require('fs').readFileSync(videoPath).toString('base64')}`;

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><video id="v" src="${videoUrl}" width="1280" height="720" muted controls></video></body></html>`);
  await page.waitForFunction(() => document.querySelector('#v').readyState >= 1);
  for (const second of [36, 43, 51]) {
    await page.$eval('#v', (video, time) => {
      video.currentTime = time;
    }, second);
    await page.waitForFunction((time) => {
      const video = document.querySelector('#v');
      return video.readyState >= 2 && Math.abs(video.currentTime - time) < 0.5;
    }, second);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.resolve(__dirname, `../public/Resources/images/nap-video-check-${second}.png`) });
  }
  await browser.close();
})();
