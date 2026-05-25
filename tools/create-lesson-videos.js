const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dataPath = path.resolve(__dirname, 'lesson-video-data.json');
const lessons = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outputDir = path.resolve(__dirname, '../public/Resources/videos');
const audioDir = path.resolve(__dirname, '../public/Resources/audio');

function pageHtml(lesson, audioBase64, posterBase64, posterType) {
  return `<!doctype html><html><body style="margin:0;background:#06172a"><canvas id="c" width="1280" height="720"></canvas><script>
const lesson=${JSON.stringify(lesson)};
const audioUrl='data:audio/wav;base64,${audioBase64}';
const posterUrl=${JSON.stringify(posterBase64 ? `data:${posterType};base64,${posterBase64}` : '')};
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,fps=30;
let duration=42;
let bgImage=null;
function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function wrap(text,x,y,max,line){const words=text.split(' ');let out='';for(const word of words){const test=out?out+' '+word:word;if(ctx.measureText(test).width>max&&out){ctx.fillText(out,x,y);out=word;y+=line}else out=test}ctx.fillText(out,x,y)}
function slideAt(t){const slot=Math.min(lesson.slides.length-1,Math.floor(t/(duration/lesson.slides.length)));return {slide:lesson.slides[slot],index:slot}}
function drawCover(img){const scale=Math.max(W/img.width,H/img.height);const w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(W-w)/2,(H-h)/2,w,h)}
function loadPoster(){return new Promise(resolve=>{if(!posterUrl)return resolve();const img=new Image();img.onload=()=>{bgImage=img;resolve()};img.onerror=()=>resolve();img.src=posterUrl})}
function render(t){
  const progress=Math.min(1,t/duration);
  const {slide,index}=slideAt(t);
  const local=(t%(duration/lesson.slides.length))/(duration/lesson.slides.length);
  const alpha=Math.min(1,ease(local*2));
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#06172a');bg.addColorStop(.58,'#0b3558');bg.addColorStop(1,'#f5efe2');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  if(bgImage){ctx.save();ctx.globalAlpha=.34;drawCover(bgImage);ctx.restore()}
  ctx.fillStyle='rgba(6,23,42,.72)';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.18;ctx.fillStyle='#22d3ee';ctx.beginPath();ctx.arc(1030+Math.sin(t*.28)*18,104,230,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c49b45';ctx.beginPath();ctx.arc(1085,658,245,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,.94)';rr(70,62,1140,586,18);ctx.fill();ctx.strokeStyle='rgba(191,216,237,.9)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#0b3558';rr(116,104,206,40,20);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 16px Arial, sans-serif';ctx.fillText(lesson.tag.toUpperCase(),138,130);
  ctx.fillStyle='#5b6473';ctx.font='800 18px Arial, sans-serif';ctx.fillText(lesson.subtitle,116,178);
  ctx.globalAlpha=alpha;ctx.fillStyle='#071733';ctx.font='900 54px Arial, sans-serif';wrap(slide[0],116,260,710,62);
  ctx.fillStyle='#334155';ctx.font='400 31px Arial, sans-serif';wrap(slide[1],118,360,710,43);ctx.globalAlpha=1;
  ctx.fillStyle='#f8fbff';rr(888,140,240,318,14);ctx.fill();ctx.strokeStyle='#d6e2ee';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#1769aa';ctx.font='900 22px Arial, sans-serif';ctx.fillText('Lesson Focus',918,190);
  lesson.checks.forEach((item,i)=>{const y=232+i*48;ctx.fillStyle=i<=index?'#e7f5ee':'#eef3f8';rr(916,y,184,34,8);ctx.fill();ctx.fillStyle=i<=index?'#16825f':'#5b6473';ctx.font='800 15px Arial, sans-serif';ctx.fillText((i<=index?'âœ“ ':'â€¢ ')+item,930,y+23)});
  ctx.fillStyle='#93a4b8';ctx.font='800 17px Arial, sans-serif';ctx.fillText('VERGE FIVE  |  FROM VISION TO VENTURE',116,576);
  ctx.fillStyle='#dce6f1';rr(116,604,996,9,5);ctx.fill();ctx.fillStyle='#1769aa';rr(116,604,996*progress,9,5);ctx.fill();
}
async function record(){
  await loadPoster();
  const audio=new Audio(audioUrl);audio.preload='auto';await new Promise((res,rej)=>{audio.addEventListener('loadedmetadata',res,{once:true});audio.addEventListener('error',rej,{once:true});audio.load()});
  duration=Math.max(36,Math.ceil(audio.duration+1.25));
  const ac=new AudioContext();const src=ac.createMediaElementSource(audio);const dest=ac.createMediaStreamDestination();src.connect(dest);
  const stream=canvas.captureStream(fps);dest.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
  const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')?'video/webm;codecs=vp9,opus':'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:2300000,audioBitsPerSecond:128000});
  const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise(res=>recorder.onstop=res);
  await ac.resume();recorder.start();audio.currentTime=0;await audio.play();
  for(let frame=0;frame<=duration*fps;frame++){render(frame/fps);await new Promise(r=>setTimeout(r,1000/fps))}
  audio.pause();recorder.stop();await done;
  const blob=new Blob(chunks,{type:'video/webm'});const buf=await blob.arrayBuffer();return Array.from(new Uint8Array(buf));
}
</script></body></html>`;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, args: ['--autoplay-policy=no-user-gesture-required'] });
  const targets = process.argv.slice(2);
  const selected = targets.length ? lessons.filter(lesson => targets.includes(lesson.slug)) : lessons;
  for (const lesson of selected) {
    const audioFile = path.join(audioDir, `${lesson.slug}-narration.wav`);
    const outputFile = path.join(outputDir, `${lesson.slug}-lesson.webm`);
    const audioBase64 = fs.readFileSync(audioFile).toString('base64');
    const posterFile = lesson.poster ? path.resolve(__dirname, '..', lesson.poster.replace(/^\//, '')) : '';
    const posterBase64 = posterFile && fs.existsSync(posterFile) ? fs.readFileSync(posterFile).toString('base64') : '';
    const ext = path.extname(posterFile).toLowerCase();
    const posterType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.setContent(pageHtml(lesson, audioBase64, posterBase64, posterType), { waitUntil: 'load' });
    const bytes = await page.evaluate(() => record());
    fs.writeFileSync(outputFile, Buffer.from(bytes));
    await page.close();
    console.log(outputFile);
  }
  await browser.close();
})();


