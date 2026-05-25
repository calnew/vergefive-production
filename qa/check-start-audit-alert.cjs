const { chromium } = require('../tools/homepage-promo-video/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', 'public');
const port = 8188;
function type(file){if(file.endsWith('.css'))return 'text/css'; if(file.endsWith('.js'))return 'application/javascript'; if(file.endsWith('.png'))return 'image/png'; if(file.endsWith('.webm'))return 'video/webm'; return 'text/html';}
const server = http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1:'+port);let file=path.join(root,decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))file=path.join(file,'index.html');if(!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}fs.readFile(file,(err,body)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'content-type':type(file)});res.end(body);});});
(async()=>{await new Promise(r=>server.listen(port,'127.0.0.1',r));const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1365,height:900}});await page.goto('http://127.0.0.1:'+port+'/start-here/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(900);const data=await page.evaluate(()=>{const el=document.querySelector('[data-start-audit-alert]');return {exists:!!el,text:el?el.innerText.replace(/\s+/g,' ').trim():'',overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2}});console.log(JSON.stringify(data,null,2));await page.screenshot({path:path.join(root,'..','qa-start-here-audit-alert.png'),fullPage:false});await browser.close();server.close();})().catch(e=>{console.error(e);server.close();process.exit(1)});
