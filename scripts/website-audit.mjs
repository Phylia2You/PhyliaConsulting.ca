#!/usr/bin/env node
/** CI checks for references shared by the public website and intake Worker. */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';


const root = process.cwd();
const errors = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const cleanReference = (value) => decodeURIComponent(value.split(/[?#]/, 1)[0]);

const pages = ['index.html', 'contact.html'];
const pageIds = new Map();

for (const page of pages) {
  const source = read(page);
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${page}: duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
  pageIds.set(page, new Set(ids));
}

for (const page of pages) {
  const source = read(page);
  const references = [...source.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)]
    .map((match) => match[1]);
  for (const tag of source.matchAll(/<meta\b[^>]*>/g)) {
    if (!/\bname=["']msapplication-config["']/.test(tag[0])) continue;
    const content = tag[0].match(/\bcontent=["']([^"']+)["']/);
    if (content) references.push(content[1]);
  }
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/.test(reference)) continue;
    const [pathname, fragment] = reference.split('#', 2);
    const target = cleanReference(pathname || page);
    if (target && !exists(target)) errors.push(`${page}: missing local reference ${reference}`);
    if (fragment && pageIds.has(target) && !pageIds.get(target).has(fragment)) {
      errors.push(`${page}: missing anchor ${reference}`);
    }
  }
}

for (const cssFile of ['assets/css/main.css', 'assets/css/project-form.css']) {
  const source = read(cssFile);
  for (const match of source.matchAll(/url\(\s*["']?([^)'"]+)/g)) {
    const reference = cleanReference(match[1].trim());
    if (/^(?:https?:|data:|\/\/)/.test(reference)) continue;
    const target = path.normalize(path.join(path.dirname(cssFile), reference));
    if (!exists(target)) errors.push(`${cssFile}: missing CSS asset ${match[1]}`);
  }
}

const manifestFile = 'assets/images/site.webmanifest';
const manifest = JSON.parse(read(manifestFile));
for (const reference of [manifest.start_url, ...(manifest.icons || []).map((icon) => icon.src)]) {
  if (!reference) continue;
  const target = path.normalize(path.join(path.dirname(manifestFile), cleanReference(reference)));
  if (!exists(target)) errors.push(`${manifestFile}: missing manifest reference ${reference}`);
}

for (const script of ['assets/js/theme.js', 'assets/js/contact.js']) {
  try {
    new Function(read(script));
  } catch (error) {
    errors.push(`${script}: JavaScript syntax error: ${error.message}`);
  }
}

const workerPathMatch = read('wrangler.toml').match(/^main\s*=\s*["']([^"']+)["']/m);
if (!workerPathMatch || !exists(workerPathMatch[1])) {
  errors.push('wrangler.toml: configured Worker entry point does not exist');
} else {
  const workerSource = read(workerPathMatch[1]);
  try {
    new Function(workerSource.replace(/export\s+default/, 'return'));
  } catch (error) {
    errors.push(`${workerPathMatch[1]}: Worker syntax error: ${error.message}`);
  }

  const formSource = read('assets/js/contact.js');
  const payload = formSource.match(/\bconst\s+data\s*=\s*\{([\s\S]*?)^\s*\};/m);
  const allowlist = workerSource.match(/\bconst\s+fieldNames\s*=\s*\[([\s\S]*?)\];/);
  if (!payload || !allowlist) {
    errors.push('Unable to inspect form-to-Worker field mapping');
  } else {
    const sent = [...payload[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)].map((m) => m[1]);
    const allowed = new Set([...allowlist[1].matchAll(/["']([A-Za-z_$][\w$]*)["']/g)].map((m) => m[1]));
    for (const field of sent) {
      if (!allowed.has(field)) errors.push(`Contact form field is dropped by Worker: ${field}`);
    }
  }
}

if (errors.length) {
  console.error(`Website audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Website audit passed: ${pages.length} pages, local assets, anchors, scripts, manifest, and intake fields.`);
