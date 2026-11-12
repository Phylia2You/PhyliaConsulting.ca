#!/usr/bin/env node
/** Public portfolio checks. --inventory accepts a GitHub tree for unchanged binary assets in a partial checkout. */
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2);
const inventory=args[0]==='--inventory'?new Set(JSON.parse(fs.readFileSync(args[1],'utf8')).tree.filter(x=>x.type==='blob').map(x=>x.path)):new Set();
const exists=p=>fs.existsSync(p)||(/\.(png|jpg|ico)$/i.test(p)&&inventory.has(p));
const read=p=>fs.readFileSync(p,'utf8');
const errors=[];
const pages=['index.html','contact.html','resume.html','logo-tests/index.html'];
const ids=new Map();
for(const page of pages){
 const s=read(page),found=[...s.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);
 ids.set(page,new Set(found));
 if(found.length!==ids.get(page).size)errors.push(page+': duplicate IDs');
 if((s.match(/<h1(?:\s|>)/g)||[]).length!==1&&!page.startsWith('logo-tests'))errors.push(page+': needs exactly one H1');
 if(/Phylia(?!consulting\.ca)|Consulting project inquiry|book a call|request a quote|founder of|assets\/documents\/Joanna_Ross_Resume\.pdf/i.test(s))errors.push(page+': old business branding or resume reference');
 for(const m of s.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1]);}catch{errors.push(page+': invalid structured data');}}
}
for(const page of pages){
 for(const m of read(page).matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
  if(/^(?:https?:|mailto:|tel:|data:)/.test(m[1]))continue;
  const [ref,fragment]=m[1].split('#'),file=ref?path.posix.normalize(path.posix.join(path.posix.dirname(page),ref.split('?')[0])):page;
  if(!exists(file))errors.push(page+': missing '+file);
  if(fragment&&ids.has(file)&&!ids.get(file).has(fragment))errors.push(page+': missing anchor '+m[1]);
 }
 for(const a of read(page).matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)){if(!/rel="[^"]*noopener/.test(a[0]))errors.push(page+': external link needs noopener');}
}
for(const file of ['assets/js/theme.js','assets/js/portfolio.js']){try{new Function(read(file));}catch(e){errors.push(file+': '+e.message);}}
const manifest=JSON.parse(read('assets/images/site.webmanifest'));
for(const ref of [manifest.start_url,...manifest.icons.map(x=>x.src)]){
 const file=path.posix.normalize(path.posix.join('assets/images',ref.split('?')[0]));
 if(!exists(file))errors.push('Manifest missing '+file);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Portfolio audit passed: pages, headings, anchors, assets, external links, structured data, scripts, manifest and business-reference checks.');

