const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const project = __dirname;
const assets = path.join(project, 'assets');
const output = path.resolve(project, '../../public/Resources/videos/verge-five-homepage-promo.webm');
const posterOutput = path.resolve(project, '../../public/Resources/images/verge-five-homepage-promo-poster.png');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function dataUrl(file, mime) {
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

const imageNames = [
  'homepage-hero.png',
  'start-here-roadmap.png',
  'net30-before.png',
  'net30-after.png',
  'cards-before.png',
  'cards-after.png',
  'verge5-logo-mark.png'
];

const imageMap = Object.fromEntries(
  imageNames.map((name) => [name, dataUrl(path.join(assets, name), 'image/png')])
);
const audioUrl = dataUrl(path.join(assets, 'promo-narration.wav'), 'audio/wav');
const musicUrl = dataUrl(path.join(assets, 'promo-background.wav'), 'audio/wav');

function html() {
  return `<!doctype html><html><body style="margin:0;background:#071733"><canvas id="c" width="1280" height="720"></canvas><script>
const imageMap=${JSON.stringify(imageMap)};
const audioUrl=${JSON.stringify(audioUrl)};
const musicUrl=${JSON.stringify(musicUrl)};
const W=1280,H=720,fps=30;
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
let images={};

function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function fillRound(x,y,w,h,r,fill,stroke){
  rr(x,y,w,h,r);
  ctx.fillStyle=fill;
  ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}
}
function wrap(text,x,y,max,line){
  const words=String(text).split(' ');
  let current='';
  for(const word of words){
    const test=current?current+' '+word:word;
    if(ctx.measureText(test).width>max&&current){
      ctx.fillText(current,x,y);
      current=word;
      y+=line;
    } else {
      current=test;
    }
  }
  if(current) ctx.fillText(current,x,y);
  return y;
}
function wrapCentered(text,cx,y,max,line){
  const words=String(text).split(' ');
  const lines=[];
  let current='';
  for(const word of words){
    const test=current?current+' '+word:word;
    if(ctx.measureText(test).width>max&&current){
      lines.push(current);
      current=word;
    } else {
      current=test;
    }
  }
  if(current) lines.push(current);
  for(const lineText of lines){
    ctx.fillText(lineText,cx,y);
    y+=line;
  }
  return y;
}
function cover(img,x,y,w,h){
  const scale=Math.max(w/img.width,h/img.height);
  const sw=w/scale,sh=h/scale;
  const sx=(img.width-sw)/2,sy=(img.height-sh)/2;
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}
function contain(img,x,y,w,h){
  const scale=Math.min(w/img.width,h/img.height);
  const iw=img.width*scale,ih=img.height*scale;
  ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
}
function bg(){
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#071733');
  g.addColorStop(.7,'#0b3558');
  g.addColorStop(1,'#092035');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.12;
  ctx.fillStyle='#20c6d4';
  ctx.beginPath();
  ctx.arc(1030,105,210,0,Math.PI*2);
  ctx.fill();
  ctx.globalAlpha=1;
}
function logo(){
  fillRound(52,38,44,44,10,'#020617','rgba(255,255,255,.18)');
  contain(images['verge5-logo-mark.png'],58,44,32,32);
  ctx.fillStyle='#ffffff';
  ctx.font='800 19px Arial';
  ctx.fillText('Verge Five',108,66);
}
function label(text,x,y){
  ctx.fillStyle='#20c6d4';
  ctx.font='900 15px Arial';
  ctx.fillText(text.toUpperCase(),x,y);
}
function headline(text,x,y,max){
  ctx.fillStyle='#ffffff';
  ctx.font='900 48px Arial';
  return wrap(text,x,y,max,56);
}
function body(text,x,y,max){
  ctx.fillStyle='#d8e9f7';
  ctx.font='400 24px Arial';
  return wrap(text,x,y,max,34);
}
function shot(name,x,y,w,h){
  fillRound(x-8,y-8,w+16,h+16,18,'rgba(255,255,255,.12)','rgba(216,233,247,.22)');
  ctx.save();
  rr(x,y,w,h,14);
  ctx.clip();
  ctx.fillStyle='#f8fbff';
  ctx.fillRect(x,y,w,h);
  contain(images[name],x+18,y+18,w-36,h-36);
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.32)';
  ctx.lineWidth=1.5;
  rr(x,y,w,h,14);
  ctx.stroke();
}
function chip(text,x,y,type){
  const colors={
    danger:['#fff2ed','#9a3412'],
    ready:['#e8f6ef','#0f6b4d'],
    neutral:['#e8f2fb','#0b3558']
  };
  const c=colors[type]||colors.neutral;
  ctx.font='900 18px Arial';
  const w=ctx.measureText(text).width+36;
  fillRound(x,y,w,38,19,c[0],null);
  ctx.fillStyle=c[1];
  ctx.fillText(text,x+18,y+25);
  return w;
}
function footer(text){
  fillRound(76,642,1128,46,14,'rgba(7,23,51,.88)','rgba(216,233,247,.18)');
  ctx.fillStyle='#ffffff';
  ctx.font='800 21px Arial';
  ctx.fillText(text,100,672);
}
function cursor(x,y){
  fillRound(x,y,46,46,23,'#20c6d4','rgba(255,255,255,.4)');
  ctx.fillStyle='#071733';
  ctx.font='900 27px Arial';
  ctx.fillText('✓',x+13,y+31);
}
function readinessMock(x,y,w,h){
  fillRound(x,y,w,h,20,'#ffffff','rgba(216,233,247,.36)');
  ctx.fillStyle='#0b3558';
  ctx.font='900 25px Arial';
  ctx.fillText('Readiness dashboard',x+34,y+54);
  ctx.fillStyle='#64748b';
  ctx.font='500 17px Arial';
  ctx.fillText('Before the first application',x+34,y+84);
  const items=[
    ['Business Identity','Phone, address, website, email','Ready','ready'],
    ['Legal Setup','Entity and E-I-N','Ready','ready'],
    ['Banking Foundation','Bank account and history','Build','neutral'],
    ['Vendors and Credit','Locked until ready','Locked','danger']
  ];
  items.forEach((item,i)=>{
    const rowY=y+128+i*62;
    fillRound(x+30,rowY,w-60,46,10,i<2?'#edfdf5':'#f8fafc','#e2e8f0');
    fillRound(x+48,rowY+10,26,26,7,i<2?'#16825f':'#dbeafe',null);
    ctx.fillStyle=i<2?'#ffffff':'#0b3558';
    ctx.font='900 14px Arial';
    ctx.fillText(String(i+1),x+56,rowY+29);
    ctx.fillStyle='#071733';
    ctx.font='900 17px Arial';
    ctx.fillText(item[0],x+92,rowY+20);
    ctx.fillStyle='#475569';
    ctx.font='500 13px Arial';
    ctx.fillText(item[1],x+92,rowY+38);
    chip(item[2],x+w-150,rowY+6,item[3]);
  });
}
function applicationWarning(x,y,w,h){
  fillRound(x,y,w,h,20,'#ffffff','rgba(216,233,247,.36)');
  ctx.fillStyle='#9a3412';
  ctx.font='900 15px Arial';
  ctx.fillText('APPLICATION RISK',x+34,y+48);
  ctx.fillStyle='#071733';
  ctx.font='900 31px Arial';
  wrap('Applying before the profile is ready can create denials.',x+34,y+104,w-68,38);
  const cards=[
    ['Vendor list first','No readiness check','danger'],
    ['Card inquiry too early','Wrong path','danger'],
    ['Profile first','Safer timing','ready']
  ];
  cards.forEach((card,i)=>{
    const yy=y+228+i*74;
    fillRound(x+34,yy,w-68,56,12,i<2?'#fff7ed':'#ecfdf5',i<2?'#fed7aa':'#a7f3d0');
    ctx.fillStyle=i<2?'#9a3412':'#0f6b4d';
    ctx.font='900 18px Arial';
    ctx.fillText(card[0],x+56,yy+24);
    ctx.fillStyle='#334155';
    ctx.font='500 15px Arial';
    ctx.fillText(card[1],x+56,yy+44);
  });
}
function fiveStepGraphic(x,y,w,h){
  fillRound(x,y,w,h,20,'#ffffff','rgba(216,233,247,.36)');
  ctx.fillStyle='#0b3558';
  ctx.font='900 24px Arial';
  ctx.fillText('Five-step path',x+34,y+52);
  const steps=[
    'Business identifiers',
    'Entity formation',
    'Banking foundation',
    'Pre-application criteria',
    'Vendors and cards'
  ];
  steps.forEach((step,i)=>{
    const yy=y+96+i*64;
    ctx.strokeStyle=i<4?'#20c6d4':'#dbeafe';
    ctx.lineWidth=4;
    if(i<4){ctx.beginPath();ctx.moveTo(x+60,yy+28);ctx.lineTo(x+60,yy+74);ctx.stroke();}
    fillRound(x+40,yy,40,40,20,i<3?'#16825f':'#1769aa',null);
    ctx.fillStyle='#ffffff';
    ctx.font='900 17px Arial';
    ctx.fillText(String(i+1),x+55,yy+26);
    ctx.fillStyle='#071733';
    ctx.font='900 20px Arial';
    ctx.fillText(step,x+102,yy+26);
  });
}
function matcherCompare(x,y,w,h){
  const gap=34;
  const cardW=(w-gap)/2;
  const cards=[
    ['Before readiness','Build first','#fff7ed','#9a3412',['Missing 411 listing','Website not complete','Banking still new']],
    ['After readiness','Ready for review','#ecfdf5','#0f6b4d',['Phone verified','Business 411 listed','Core records match']]
  ];
  cards.forEach((card,i)=>{
    const xx=x+i*(cardW+gap);
    fillRound(xx,y,cardW,h,18,'#ffffff','rgba(216,233,247,.36)');
    fillRound(xx+28,y+28,cardW-56,48,24,card[2],null);
    ctx.fillStyle=card[3];
    ctx.font='900 20px Arial';
    ctx.fillText(card[0],xx+52,y+59);
    ctx.fillStyle='#071733';
    ctx.font='900 30px Arial';
    wrap(card[1],xx+34,y+126,cardW-68,36);
    card[4].forEach((line,j)=>{
      const yy=y+202+j*56;
      fillRound(xx+34,yy,cardW-68,40,10,'#f8fafc','#e2e8f0');
      fillRound(xx+52,yy+10,20,20,10,i===1?'#16825f':'#b88a2c',null);
      ctx.fillStyle=i===1?'#ffffff':'#071733';
      ctx.font='900 13px Arial';
      ctx.fillText(i===1?'✓':'!',xx+58,yy+25);
      ctx.fillStyle='#334155';
      ctx.font='800 16px Arial';
      ctx.fillText(line,xx+88,yy+26);
    });
  });
}
function lockedVendorMock(x,y,w,h){
  fillRound(x,y,w,h,20,'#ffffff','rgba(216,233,247,.36)');
  ctx.fillStyle='#9a3412';
  ctx.font='900 15px Arial';
  ctx.fillText('BUILD FIRST',x+34,y+46);
  ctx.fillStyle='#071733';
  ctx.font='900 30px Arial';
  wrap('Vendor pages stay locked until the company qualifies.',x+34,y+102,w-68,38);
  const vendors=['Quill','Uline','Grainger','Crown Office'];
  vendors.forEach((name,i)=>{
    const col=i%2,row=Math.floor(i/2);
    const xx=x+34+col*((w-88)/2+20);
    const yy=y+214+row*86;
    fillRound(xx,yy,(w-88)/2,62,12,'#f8fafc','#e2e8f0');
    ctx.fillStyle='#071733';
    ctx.font='900 18px Arial';
    ctx.fillText(name,xx+18,yy+26);
    chip(i<2?'Build first':'Locked',xx+18,yy+34,i<2?'danger':'neutral');
  });
}
function creditPathMock(x,y,w,h){
  fillRound(x,y,w,h,20,'#ffffff','rgba(216,233,247,.36)');
  ctx.fillStyle='#0b3558';
  ctx.font='900 25px Arial';
  ctx.fillText('Credit card path',x+34,y+54);
  const paths=[
    ['Secured card','May fit earlier','ready'],
    ['Store card','Review profile','neutral'],
    ['Fleet card','Match records','neutral'],
    ['Bank card','Build stronger first','danger'],
    ['No-PG corporate','Do not rush','danger']
  ];
  paths.forEach((path,i)=>{
    const yy=y+100+i*58;
    fillRound(x+34,yy,w-68,44,11,'#f8fafc','#e2e8f0');
    ctx.fillStyle='#071733';
    ctx.font='900 18px Arial';
    ctx.fillText(path[0],x+54,yy+27);
    const colors={
      danger:['#fff2ed','#9a3412'],
      ready:['#e8f6ef','#0f6b4d'],
      neutral:['#e8f2fb','#0b3558']
    };
    const c=colors[path[2]]||colors.neutral;
    const pillX=x+w-232;
    fillRound(pillX,yy+6,198,32,16,c[0],null);
    ctx.fillStyle=c[1];
    ctx.font='900 15px Arial';
    ctx.fillText(path[1],pillX+16,yy+27);
  });
}
function scene(t){
  if(t<10) return 1;
  if(t<23) return 2;
  if(t<38) return 3;
  if(t<56) return 4;
  if(t<68) return 5;
  if(t<79) return 6;
  return 7;
}
function render(t){
  bg();
  logo();
  const s=scene(t);
  if(s===1){
    label('For owners who have been burned',76,138);
    headline('Stop wasting business credit applications.',76,206,500);
    body('Verge Five helps you build the profile before you apply.',78,370,500);
    const firstChipWidth=chip('No guessing',78,480,'neutral');
    chip('No rushed applications',78+firstChipWidth+14,480,'danger');
    readinessMock(660,104,470,420);
    footer('The process starts with readiness, not hype.');
  }
  if(s===2){
    label('Where denials happen',76,132);
    headline('Vendor lists and card applications are not the starting point.',76,198,570);
    body('Applying before the company is ready can create denials and wasted inquiries.',78,440,540);
    chip('Applying too early',78,548,'danger');
    chip('Build readiness first',286,548,'ready');
    applicationWarning(680,108,455,410);
    footer('Every application should have a reason behind it.');
  }
  if(s===3){
    label('Build the foundation first',76,132);
    headline('Five steps. In the right order. No skipping.',76,198,520);
    body('Business identifiers, entity formation, banking, pre-application criteria, then vendor and credit card access.',78,388,560);
    fiveStepGraphic(680,106,450,420);
    footer('The foundation is checked before members touch applications.');
  }
  if(s===4){
    label('Net 30 readiness matcher',76,104);
    headline('Twelve criteria show what is ready and what is close.',76,164,740);
    matcherCompare(92,270,1096,306);
    if(t>47) cursor(1114,502);
    footer('The vendor list responds to the company profile.');
  }
  if(s===5){
    label('Locked until ready',76,126);
    headline('Build first. Then apply when the profile supports it.',76,192,600);
    body('Vendor pages stay locked until the company meets the readiness criteria.',78,390,540);
    lockedVendorMock(670,110,460,390);
    chip('Qualification matters',78,526,'neutral');
    footer('This keeps members from wasting applications too early.');
  }
  if(s===6){
    label('Credit card matcher',76,112);
    headline('Find the right card path before the inquiry.',76,178,560);
    body('The matcher helps separate secured, store, fleet, bank, and corporate card paths.',78,372,520);
    creditPathMock(660,110,470,420);
    footer('Credit card timing is part of the readiness system.');
  }
  if(s===7){
    ctx.textAlign='center';
    fillRound(570,92,140,140,28,'#020617','rgba(255,255,255,.2)');
    contain(images['verge5-logo-mark.png'],592,114,96,96);
    ctx.fillStyle='#20c6d4';
    ctx.font='900 16px Arial';
    ctx.fillText('FROM VISION TO VENTURE',640,282);
    ctx.fillStyle='#ffffff';
    ctx.font='900 54px Arial';
    wrapCentered('Build it right the first time.',640,370,760,62);
    ctx.fillStyle='#d8e9f7';
    ctx.font='400 25px Arial';
    wrapCentered('Start with the roadmap. Work the five steps. Apply when the company is actually ready.',640,508,760,36);
    fillRound(502,604,276,48,24,'#ffffff',null);
    ctx.fillStyle='#0b3558';
    ctx.font='900 24px Arial';
    ctx.fillText('vergefive.com',640,636);
    ctx.textAlign='left';
  }
}
async function loadImages(){
  for(const [name,src] of Object.entries(imageMap)){
    const img=new Image();
    img.src=src;
    await img.decode();
    images[name]=img;
  }
}
async function record(){
  await loadImages();
  const audio=new Audio(audioUrl);
  const music=new Audio(musicUrl);
  audio.preload='auto';
  music.preload='auto';
  await new Promise((resolve,reject)=>{
    audio.addEventListener('loadedmetadata',resolve,{once:true});
    audio.addEventListener('error',reject,{once:true});
    audio.load();
  });
  await new Promise((resolve,reject)=>{
    music.addEventListener('loadedmetadata',resolve,{once:true});
    music.addEventListener('error',reject,{once:true});
    music.load();
  });
  const duration=Math.ceil(audio.duration+1.5);
  const ac=new AudioContext();
  const source=ac.createMediaElementSource(audio);
  const musicSource=ac.createMediaElementSource(music);
  const musicGain=ac.createGain();
  musicGain.gain.value=0.18;
  const dest=ac.createMediaStreamDestination();
  source.connect(dest);
  musicSource.connect(musicGain);
  musicGain.connect(dest);
  const stream=canvas.captureStream(fps);
  dest.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
  const candidates=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  const mimeType=candidates.find(type=>MediaRecorder.isTypeSupported(type))||'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:3600000,audioBitsPerSecond:160000});
  const chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const done=new Promise(resolve=>recorder.onstop=resolve);
  render(0);
  await ac.resume();
  recorder.start();
  audio.currentTime=0;
  music.currentTime=0;
  await audio.play();
  await music.play();
  for(let frame=0;frame<=duration*fps;frame++){
    render(frame/fps);
    await new Promise(resolve=>setTimeout(resolve,1000/fps));
  }
  audio.pause();
  music.pause();
  recorder.stop();
  await done;
  const videoBlob=new Blob(chunks,{type:'video/webm'});
  const videoBytes=Array.from(new Uint8Array(await videoBlob.arrayBuffer()));
  render(0);
  const posterData=canvas.toDataURL('image/png').split(',')[1];
  return {videoBytes,posterData,duration,mimeType};
}
</script></body></html>`;
}

async function main() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(html(), { waitUntil: 'load' });
  const result = await page.evaluate(() => record());
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.mkdirSync(path.dirname(posterOutput), { recursive: true });
  fs.writeFileSync(output, Buffer.from(result.videoBytes));
  fs.writeFileSync(posterOutput, Buffer.from(result.posterData, 'base64'));
  await browser.close();
  console.log(JSON.stringify({ output, posterOutput, duration: result.duration, mimeType: result.mimeType }, null, 2));
}

module.exports = { html };

if (require.main === module) {
  main();
}
