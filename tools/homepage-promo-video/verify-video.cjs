const { chromium } = require('playwright');
const path = require('path');
(async()=>{
  const file='D:/Cowork/veregefive/vergefive_cloudflare/public/Resources/videos/verge-five-homepage-promo.webm';
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.setContent(`<video id="v" src="file:///${file}" muted controls style="width:1280px;height:720px;background:#071733"></video>`);
  const data=await page.evaluate(async()=>{
    const v=document.getElementById('v');
    await new Promise((res,rej)=>{v.onloadedmetadata=res;v.onerror=rej;});
    v.currentTime=1;
    await new Promise(res=>{v.onseeked=res;});
    return {duration:v.duration,videoWidth:v.videoWidth,videoHeight:v.videoHeight,readyState:v.readyState};
  });
  await page.screenshot({path:'D:/Cowork/veregefive/vergefive_cloudflare/public/Resources/images/verge-five-homepage-promo-poster.png'});
  await browser.close();
  console.log(JSON.stringify(data));
})();
