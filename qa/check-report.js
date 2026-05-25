const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({acceptDownloads:true});
 await page.goto('http://127.0.0.1:8091/phones-and-411/',{waitUntil:'networkidle'});
 await page.fill('[data-profile-field="businessName"]','Acme Test LLC');
 await page.fill('[data-profile-field="entityType"]','LLC');
 await page.check('[data-profile-check="bank"]');
 await page.locator('[data-check]').first().click();
 const [download] = await Promise.all([
   page.waitForEvent('download'),
   page.click('[data-download-report]')
 ]);
 const savePath='D:/Cowork/veregefive/vergefive_cloudflare/qa/qa-member-progress-report.txt';
 await download.saveAs(savePath);
 const text=fs.readFileSync(savePath,'utf8');
 console.log(JSON.stringify({
   suggested:download.suggestedFilename(),
   hasBusiness:text.includes('Acme Test LLC'),
   hasLessonPlan:text.includes('Recommended options for this step')||text.includes('Choose one business phone provider')||text.includes('Business phone setup'),
   hasProprietaryNote:text.includes('platform training content remain inside Verge Five'),
   preview:text.split('\n').slice(0,18)
 },null,2));
 await browser.close();
})();
