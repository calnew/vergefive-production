const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{ if(m.type()==='error') errors.push(m.text()); });
 await page.goto('http://127.0.0.1:8091/phones-and-411/',{waitUntil:'networkidle'});
 const vals=await page.evaluate(()=>({path:location.pathname, main:!!document.querySelector('.member-main'), firstVideo:!!document.querySelector('.member-main .lesson-video'), intake:!!document.querySelector('[data-business-profile-intake]'), scriptHas: Array.from(document.scripts).map(s=>s.src)}));
 console.log(JSON.stringify({vals,errors},null,2));
 await browser.close();
})();
