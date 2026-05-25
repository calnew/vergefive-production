const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.setContent(`<video id="v" src="https://d3e30972.vergefive.pages.dev/Resources/videos/verge-five-homepage-promo.webm" muted controls></video>`);
  const data=await page.evaluate(async()=>{
    const v=document.getElementById('v');
    await new Promise((res,rej)=>{const to=setTimeout(()=>rej(new Error('metadata timeout')),30000);v.onloadedmetadata=()=>{clearTimeout(to);res()};v.onerror=()=>{clearTimeout(to);rej(new Error('video error'))};});
    return {duration:Math.round(v.duration*10)/10,width:v.videoWidth,height:v.videoHeight,readyState:v.readyState};
  });
  await browser.close();
  console.log(JSON.stringify(data));
})();
