const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({acceptDownloads:true});
 await page.goto('https://22b844d0.vergefive.pages.dev/phones-and-411/',{waitUntil:'networkidle'});
 const hasIntake=await page.locator('[data-business-profile-intake]').count();
 await page.fill('[data-profile-field="businessName"]','Deploy Test LLC');
 await page.check('[data-profile-check="bank"]');
 await page.locator('[data-check]').first().click();
 const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-download-report]')]);
 const savePath='D:/Cowork/veregefive/vergefive_cloudflare/qa/qa-deployed-member-progress-report.txt';
 await download.saveAs(savePath);
 const text=fs.readFileSync(savePath,'utf8');
 console.log(JSON.stringify({hasIntake,filename:download.suggestedFilename(),hasBusiness:text.includes('Deploy Test LLC'),hasLessonPlan:text.includes('Choose one business phone provider')||text.includes('Recommended options for this step'),hasNote:text.includes('platform training content remain inside Verge Five')},null,2));
 await browser.close();
})();
