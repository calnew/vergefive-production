const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, 'existing-video-replacements.json'), 'utf8'));
const outputDir = path.join(root, 'public/Resources/videos');
const audioDir = path.join(root, 'public/Resources/audio');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function htmlFor(item, audioBase64) {
  return `<!doctype html><html><body style="margin:0;background:#06172a"><canvas id="c" width="1280" height="720"></canvas><script>
const item=${JSON.stringify(item)};
const audioUrl='data:audio/wav;base64,${audioBase64}';
const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
const W=1280,H=720,fps=30;let duration=60;
function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function wrap(text,x,y,max,line){const words=text.split(' ');let current='';for(const word of words){const test=current?current+' '+word:word;if(ctx.measureText(test).width>max&&current){ctx.fillText(current,x,y);current=word;y+=line}else current=test}ctx.fillText(current,x,y)}
function slideAt(t){const i=Math.min(item.slides.length-1,Math.floor(t/(duration/item.slides.length)));return {slide:item.slides[i],index:i}}
function render(t){
  const progress=Math.min(1,t/duration);const {slide,index}=slideAt(t);const slot=duration/item.slides.length;const a=Math.min(1,ease(((t%slot)/slot)*2));
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#06172a');bg.addColorStop(.58,'#0b3558');bg.addColorStop(1,'#f5efe2');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.1;ctx.fillStyle='#22d3ee';ctx.beginPath();ctx.arc(1030,104,230,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c49b45';ctx.beginPath();ctx.arc(1085,658,245,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,.96)';rr(70,62,1140,586,18);ctx.fill();ctx.strokeStyle='rgba(191,216,237,.78)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#0b3558';rr(116,104,214,40,20);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 16px Arial, sans-serif';ctx.fillText(item.tag.toUpperCase(),138,130);
  ctx.fillStyle='#5b6473';ctx.font='800 18px Arial, sans-serif';ctx.fillText(item.subtitle,116,178);
  ctx.globalAlpha=a;ctx.fillStyle='#071733';ctx.font='900 52px Arial, sans-serif';wrap(slide[0],116,258,710,60);ctx.fillStyle='#334155';ctx.font='400 30px Arial, sans-serif';wrap(slide[1],118,360,710,42);ctx.globalAlpha=1;
  ctx.fillStyle='#f8fbff';rr(888,140,240,318,14);ctx.fill();ctx.strokeStyle='#d6e2ee';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#1769aa';ctx.font='900 22px Arial, sans-serif';ctx.fillText('Lesson Focus',918,190);
  item.checks.forEach((label,i)=>{const y=232+i*48;ctx.fillStyle=i<=index?'#e7f5ee':'#eef3f8';rr(916,y,184,34,8);ctx.fill();ctx.fillStyle=i<=index?'#16825f':'#5b6473';ctx.font='800 15px Arial, sans-serif';ctx.fillText((i<=index?'✓ ':'• ')+label,930,y+23)});
  ctx.fillStyle='#93a4b8';ctx.font='800 17px Arial, sans-serif';ctx.fillText('VERGE FIVE  |  FROM VISION TO VENTURE',116,576);
  ctx.fillStyle='#dce6f1';rr(116,604,996,9,5);ctx.fill();ctx.fillStyle='#1769aa';rr(116,604,996*progress,9,5);ctx.fill();
}
async function record(){
  const audio=new Audio(audioUrl);audio.preload='auto';await new Promise((res,rej)=>{audio.addEventListener('loadedmetadata',res,{once:true});audio.addEventListener('error',rej,{once:true});audio.load()});
  duration=Math.max(35,Math.ceil(audio.duration+1.25));
  const ac=new AudioContext();const source=ac.createMediaElementSource(audio);const dest=ac.createMediaStreamDestination();source.connect(dest);
  const stream=canvas.captureStream(fps);dest.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
  const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')?'video/webm;codecs=vp9,opus':'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:2300000,audioBitsPerSecond:128000});
  const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise(res=>recorder.onstop=res);
  await ac.resume();recorder.start();audio.currentTime=0;await audio.play();
  for(let frame=0;frame<=duration*fps;frame++){render(frame/fps);await new Promise(r=>setTimeout(r,1000/fps))}
  audio.pause();recorder.stop();await done;const blob=new Blob(chunks,{type:'video/webm'});const buf=await blob.arrayBuffer();return Array.from(new Uint8Array(buf));
}
</script></body></html>`;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, args: ['--autoplay-policy=no-user-gesture-required'] });
  const targets = process.argv.slice(2);
  const selected = targets.length ? lessons.filter(item => targets.includes(item.id)) : lessons;
  for (const item of selected) {
    const audioFile = path.join(audioDir, `${item.id}-source-narration.wav`);
    const outputFile = path.join(outputDir, `${item.id}-recreated.webm`);
    const audioBase64 = fs.readFileSync(audioFile).toString('base64');
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.setContent(htmlFor(item, audioBase64), { waitUntil: 'load' });
    const bytes = await page.evaluate(() => record());
    fs.writeFileSync(outputFile, Buffer.from(bytes));
    await page.close();
    console.log(outputFile);
  }
  await browser.close();
})();
