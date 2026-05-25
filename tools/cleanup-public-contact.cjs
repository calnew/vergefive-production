const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'public');
function walk(dir){
  let out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out=out.concat(walk(p));
    else if(/\.(html|txt|xml|json)$/i.test(ent.name)) out.push(p);
  }
  return out;
}
let changed=0;
for(const file of walk(root)){
  let s=fs.readFileSync(file,'utf8');
  let original=s;
  s=s.replace(/,\s*"email"\s*:\s*"admin@vergefive\.com"/g,'');
  s=s.replace(/<br>\s*admin@vergefive\.com/g,'');
  s=s.replace(/Contact Us:admin@vergefive\.com/g,'Contact Us: /contact/');
  s=s.replace(/contact us at admin@vergefive\.com/gi,'contact us through the Contact page');
  s=s.replace(/contacting us at admin@vergefive\.com/gi,'using the Contact page');
  s=s.replace(/admin@vergefive\.com/g,'/contact/');
  s=s.replace(/mailto:\/contact\//g,'/contact/');
  s=s.replace(/>Privacy<\/a>\s*&nbsp;\s*<a href=['"]\/terms\/['"]>Terms<\/a>\s*&nbsp;\s*<a href=['"]\/contact\/['"]>Contact<\/a>/g, ">Privacy Policy</a> &nbsp; <a href='/terms/'>Terms &amp; Conditions</a> &nbsp; <a href='/contact/'>Contact</a>");
  s=s.replace(/>Privacy<\/a>\s*&nbsp;\s*<a href=['"]\/terms\/['"]>Terms<\/a>/g, ">Privacy Policy</a> &nbsp; <a href='/terms/'>Terms &amp; Conditions</a>");
  if(s!==original){fs.writeFileSync(file,s); changed++;}
}
console.log('updated files', changed);
