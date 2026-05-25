const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outFile = path.resolve(__dirname, '../public/Resources/videos/bank-rating-lesson.webm');
const audioFile = path.resolve(__dirname, '../public/Resources/audio/bank-rating-narration.wav');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const audioBase64 = fs.readFileSync(audioFile).toString('base64');

const html = `<!doctype html>
<html>
<body style="margin:0;background:#06172a">
<canvas id="c" width="1280" height="720"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const fps = 30;
let duration = 42;
const audioUrl = 'data:audio/wav;base64,${audioBase64}';
const slides = [
  { t: 0, title: 'Business Bank Rating', sub: 'Lesson 8 / Banking Foundation', body: 'Before higher-level approvals, lenders want to see stable banking behavior.', tag: 'Why it matters' },
  { t: 7, title: 'What Bank Rating Means', sub: 'Average balance + account history + clean activity', body: 'A business account with consistent deposits, healthy balances, and no returned items sends a stronger signal.', tag: 'Core concept' },
  { t: 14, title: 'The Low 5 Target', sub: 'A practical readiness checkpoint', body: 'A Low 5 rating is often discussed as a benchmark because it shows the account can support stronger credit requests.', tag: 'Target signal' },
  { t: 21, title: 'Do Not Rush Applications', sub: 'Timing matters', body: 'Applying while balances are too low, the account is too new, or activity is messy can weaken the business profile.', tag: 'Avoid this' },
  { t: 28, title: 'Build Better Banking Signals', sub: 'Season the account before moving forward', body: 'Keep money moving, avoid NSF activity, maintain target balances, and document statements for proof.', tag: 'Action plan' },
  { t: 35, title: 'Next Step', sub: 'Use the tracker on this page', body: 'Estimate your current bank rating, set a target balance plan, and save statements as proof before applying.', tag: 'Continue' }
];
function ease(x){ return x < .5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2; }
function drawRoundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function wrap(text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
  return y;
}
function currentSlide(t){
  let index = 0;
  for(let i=0;i<slides.length;i++){ if(t >= slides[i].t) index = i; }
  return { slide: slides[index], index };
}
function render(t){
  const { slide, index } = currentSlide(t);
  const local = Math.max(0, t - slide.t);
  const p = Math.min(1, local / 1.1);
  const inEase = ease(p);
  const drift = Math.sin(t * .5) * 10;

  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#06172a');
  bg.addColorStop(.52,'#0b3558');
  bg.addColorStop(1,'#f4efe2');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  ctx.globalAlpha = .18;
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(1040 + drift, 90, 210, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#c49b45';
  ctx.beginPath();
  ctx.arc(1050 - drift, 650, 260, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(255,255,255,.93)';
  drawRoundRect(82,82,1116,556,18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(191,216,237,.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0b3558';
  drawRoundRect(132, 122, 190, 42, 21);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '800 17px Arial, sans-serif';
  ctx.fillText(slide.tag.toUpperCase(), 154, 149);

  ctx.fillStyle = '#071733';
  ctx.font = '900 52px Arial, sans-serif';
  const titleBottom = wrap(slide.title, 130, 228 - (1-inEase)*18, 620, 56);

  ctx.fillStyle = '#1769aa';
  ctx.font = '800 23px Arial, sans-serif';
  ctx.fillText(slide.sub, 132, Math.max(292, titleBottom + 42));

  ctx.fillStyle = '#334155';
  ctx.font = '400 31px Arial, sans-serif';
  wrap(slide.body, 132, Math.max(366, titleBottom + 110), 660, 43);

  const meterX = 914;
  const meterY = 224;
  ctx.strokeStyle = '#e5edf5';
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(meterX, meterY, 100, -Math.PI*.75, Math.PI*.75);
  ctx.stroke();
  ctx.strokeStyle = index >= 2 ? '#16825f' : '#1769aa';
  ctx.beginPath();
  const pct = .34 + index * .1 + Math.sin(t*.8)*.015;
  ctx.arc(meterX, meterY, 100, -Math.PI*.75, -Math.PI*.75 + Math.PI*1.5*pct);
  ctx.stroke();
  ctx.fillStyle = '#071733';
  ctx.font = '900 40px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(index >= 2 ? 'Low 5' : 'Bank', meterX, meterY + 8);
  ctx.textAlign = 'left';

  const rows = [
    ['Average balance', index >= 1],
    ['Clean account history', index >= 1],
    ['No NSF activity', index >= 3],
    ['Documented statements', index >= 4]
  ];
  rows.forEach((row, i) => {
    const y = 380 + i * 50;
    ctx.fillStyle = row[1] ? '#e7f5ee' : '#eef3f8';
    drawRoundRect(810, y, 300, 34, 8);
    ctx.fill();
    ctx.fillStyle = row[1] ? '#16825f' : '#5b6473';
    ctx.font = '800 17px Arial, sans-serif';
    ctx.fillText((row[1] ? '✓ ' : '• ') + row[0], 828, y + 23);
  });

  ctx.fillStyle = '#93a4b8';
  ctx.font = '800 18px Arial, sans-serif';
  ctx.fillText('VERGE FIVE  |  FROM VISION TO VENTURE', 132, 592);

  ctx.fillStyle = '#dce6f1';
  drawRoundRect(132, 614, 996, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#1769aa';
  drawRoundRect(132, 614, 996 * Math.min(1,t/duration), 10, 5);
  ctx.fill();
}
async function record(){
  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
  await new Promise((resolve, reject) => {
    audio.addEventListener('loadedmetadata', resolve, { once: true });
    audio.addEventListener('error', reject, { once: true });
    audio.load();
  });
  duration = Math.max(42, Math.ceil(audio.duration + .75));
  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(audio);
  const destination = audioContext.createMediaStreamDestination();
  source.connect(destination);
  const stream = canvas.captureStream(fps);
  destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2400000, audioBitsPerSecond: 128000 });
  const chunks = [];
  recorder.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
  const done = new Promise(resolve => recorder.onstop = resolve);
  await audioContext.resume();
  recorder.start();
  audio.currentTime = 0;
  await audio.play();
  for(let frame=0; frame<=duration*fps; frame++){
    render(frame/fps);
    await new Promise(r => setTimeout(r, 1000/fps));
  }
  audio.pause();
  recorder.stop();
  await done;
  const blob = new Blob(chunks, { type: 'video/webm' });
  const buf = await blob.arrayBuffer();
  return Array.from(new Uint8Array(buf));
}
</script>
</body>
</html>`;

(async () => {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  if (process.argv.includes('--frames')) {
    const frameDir = path.resolve(__dirname, 'qa-bank-rating-frames');
    fs.mkdirSync(frameDir, { recursive: true });
    for (const second of [1, 8, 15, 22, 29, 36]) {
      await page.evaluate((value) => render(value), second);
      await page.screenshot({ path: path.join(frameDir, `bank-rating-${second}.png`) });
    }
    await browser.close();
    console.log(frameDir);
    return;
  }
  const bytes = await page.evaluate(() => record());
  fs.writeFileSync(outFile, Buffer.from(bytes));
  await browser.close();
  console.log(outFile);
})();
