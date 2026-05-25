const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:8091/phones-and-411/',{waitUntil:'networkidle'});
 await page.fill('[data-profile-field="businessName"]','Print Test LLC');
 page.on('dialog',d=>d.dismiss().catch(()=>{}));
 const popupPromise = page.waitForEvent('popup');
 await page.click('[data-print-report]');
 const popup = await popupPromise;
 await popup.waitForLoadState('domcontentloaded');
 const text=await popup.locator('body').textContent();
 console.log(JSON.stringify({hasBusiness:text.includes('Print Test LLC'), hasLessonPlan:text.includes('Choose one business phone provider')||text.includes('Recommended options'), hasProgress:text.includes('Current page completion')},null,2));
 await browser.close();
})();
