const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--autoplay-policy=no-user-gesture-required','--allow-file-access-from-files']});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.goto('about:blank');
  await page.setContent(`<video id="v" src="file:///D:/Cowork/veregefive/vergefive_cloudflare/public/Resources/videos/verge-five-homepage-promo.webm" muted controls style="width:1280px;height:720px"></video>`);
  const data=await page.evaluate(async()=>{
    const v=document.getElementById('v');
    v.play().catch(()=>{});
    await new Promise(r=>setTimeout(r,5000));
    return {currentTime:v.currentTime,duration:v.duration,networkState:v.networkState,readyState:v.readyState,error:v.error&&v.error.code};
  });
  await browser.close();
  console.log(JSON.stringify(data));
})();
