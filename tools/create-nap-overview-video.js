const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outFile = path.resolve(__dirname, '../public/Resources/videos/start-here-nap-overview.webm');
const audioFile = path.resolve(__dirname, '../public/Resources/audio/start-here-nap-overview.wav');
const logoFile = path.resolve(__dirname, '../public/Resources/images/verge5-logo-mark.png');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function dataUrl(file, type) {
  return `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
}

const audioUrl = dataUrl(audioFile, 'audio/wav');
const logoUrl = dataUrl(logoFile, 'image/png');

const html = `<!doctype html>
<html>
<body style="margin:0;background:#06172a">
<canvas id="c" width="1280" height="720"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height, fps = 30;
const audioUrl = '${audioUrl}';
const logo = new Image();
logo.src = '${logoUrl}';
let duration = 61;
const slides = [
  { t: 0, tag: 'Pre-module orientation', title: 'NAP is your business identity fingerprint.', sub: 'Name. Address. Phone.', body: 'Before Module 1, understand the signal lenders and vendors use to verify that the business looks real.' },
  { t: 10, tag: 'What gets checked', title: 'The same business must show up everywhere.', sub: 'Website, Business 411, Google, maps, and directories', body: 'Your legal name, commercial address, and business phone should match across public records before applications.' },
  { t: 22, tag: 'Important note', title: 'This is awareness, not a required subscription.', sub: 'You can build business credit without buying a listing service.', body: 'The point is to know why consistency matters and to fix mismatches before vendors, banks, or lenders review the company.' },
  { t: 35, tag: 'Resource paths', title: 'Choose from the vendor list below.', sub: 'Done-for-you support or listing cleanup tools', body: 'Some options can help handle the process for you. Others can help manage or clean up NAP listings when public records do not match.' },
  { t: 49, tag: 'Remember this', title: 'Before applications, make the business look the same everywhere.', sub: 'Identity comes before vendors, cards, and funding.', body: 'That is why Verge Five starts with the business profile before moving into credit applications.' }
];
function ease(x){ return x < .5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2; }
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function wrap(text,x,y,max,line){
  const words = text.split(' ');
  let out = '';
  for (const word of words) {
    const test = out ? out + ' ' + word : word;
    if (ctx.measureText(test).width > max && out) {
      ctx.fillText(out, x, y);
      out = word;
      y += line;
    } else {
      out = test;
    }
  }
  ctx.fillText(out, x, y);
  return y + line;
}
function slideAt(t){
  let index = 0;
  for(let i=0;i<slides.length;i++) if(t >= slides[i].t) index = i;
  return { slide: slides[index], index };
}
function drawNapCard(x,y,label,text,active){
  ctx.fillStyle = active ? '#e7f5ee' : '#f8fbff';
  rr(x,y,250,108,14);
  ctx.fill();
  ctx.strokeStyle = active ? '#9fd5bd' : '#d6e2ee';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = active ? '#16825f' : '#1769aa';
  ctx.font = '900 42px Arial, sans-serif';
  ctx.fillText(label, x + 22, y + 52);
  ctx.fillStyle = '#17324d';
  ctx.font = '800 18px Arial, sans-serif';
  ctx.fillText(text, x + 22, y + 84);
}
function render(t){
  const { slide, index } = slideAt(t);
  const local = Math.max(0, t - slide.t);
  const p = Math.min(1, local / 1.1);
  const a = ease(p);
  const drift = Math.sin(t * .35) * 18;

  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#06172a');
  bg.addColorStop(.56,'#0b3558');
  bg.addColorStop(1,'#f5efe2');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  ctx.globalAlpha = .14;
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(1010 + drift, 130, 250, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#c49b45';
  ctx.beginPath();
  ctx.arc(1060 - drift, 650, 260, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(255,255,255,.96)';
  rr(72,62,1136,588,18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(191,216,237,.82)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#020617';
  rr(118,98,46,46,11);
  ctx.fill();
  if (logo.complete) ctx.drawImage(logo, 124, 104, 34, 34);
  ctx.fillStyle = '#071733';
  ctx.font = '900 22px Arial, sans-serif';
  ctx.fillText('Verge Five', 176, 128);

  ctx.fillStyle = '#0b3558';
  rr(118,164,236,38,19);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 15px Arial, sans-serif';
  ctx.fillText(slide.tag.toUpperCase(), 140, 189);

  ctx.globalAlpha = a;
  ctx.fillStyle = '#071733';
  ctx.font = '900 44px Arial, sans-serif';
  const titleBottom = wrap(slide.title, 118, 262, 650, 50);

  ctx.fillStyle = '#1769aa';
  ctx.font = '900 22px Arial, sans-serif';
  const subBottom = wrap(slide.sub, 120, Math.max(352, titleBottom + 18), 620, 30);

  ctx.fillStyle = '#334155';
  ctx.font = '400 24px Arial, sans-serif';
  wrap(slide.body, 120, Math.max(432, subBottom + 22), 640, 34);
  ctx.globalAlpha = 1;

  drawNapCard(854, 164, 'N', 'Business name', index >= 0);
  drawNapCard(854, 292, 'A', 'Commercial address', index >= 1);
  drawNapCard(854, 420, 'P', 'Business phone', index >= 1);

  const sources = ['Website', 'Business 411', 'Google Profile', 'Maps', 'Directories'];
  sources.forEach((item,i) => {
    const y = 548 + (i % 2) * 38;
    const x = 854 + Math.floor(i / 2) * 124;
    ctx.fillStyle = i <= index + 1 ? '#e8f2fb' : '#eef3f8';
    rr(x, y, 112, 27, 14);
    ctx.fill();
    ctx.fillStyle = '#0b3558';
    ctx.font = '800 12px Arial, sans-serif';
    ctx.fillText(item, x + 12, y + 18);
  });

  ctx.fillStyle = '#93a4b8';
  ctx.font = '800 17px Arial, sans-serif';
  ctx.fillText('PRE-MODULE OVERVIEW  |  NAP CONSISTENCY', 118, 610);
  ctx.fillStyle = '#dce6f1';
  rr(118, 628, 996, 9, 5);
  ctx.fill();
  ctx.fillStyle = '#1769aa';
  rr(118, 628, 996 * Math.min(1,t/duration), 9, 5);
  ctx.fill();
}
async function record(){
  await new Promise(resolve => {
    if (logo.complete) resolve();
    else logo.onload = resolve;
  });
  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
  await new Promise((resolve, reject) => {
    audio.addEventListener('loadedmetadata', resolve, { once: true });
    audio.addEventListener('error', reject, { once: true });
    audio.load();
  });
  duration = Math.max(60, Math.ceil(audio.duration + .75));
  const ac = new AudioContext();
  const source = ac.createMediaElementSource(audio);
  const destination = ac.createMediaStreamDestination();
  source.connect(destination);
  const stream = canvas.captureStream(fps);
  destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2400000, audioBitsPerSecond: 128000 });
  const chunks = [];
  recorder.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
  const done = new Promise(resolve => recorder.onstop = resolve);
  await ac.resume();
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
  const bytes = await page.evaluate(() => record());
  fs.writeFileSync(outFile, Buffer.from(bytes));
  await browser.close();
  console.log(outFile);
})();
