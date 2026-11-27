#!/usr/bin/env node
// The site gate: every page has a twin, every internal link lands, the basics of accessibility, no em dash in our own words, no tracker.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk('site'), htmls = files.filter(f => f.endsWith('.html') && !f.startsWith('site/policy/'))  /* the seed's policy page is not ours */, errs = [];
const idsOf = {}; const html = {};
for (const f of htmls) { html[f] = readFileSync(f, 'utf8'); idsOf[f] = new Set([...html[f].matchAll(/\sid="([^"]+)"/g)].map(m => m[1])); }
const resolve = p => { let t = join('site', p); if (p.endsWith('/')) t = join(t, 'index.html'); return t; };
const titles = new Map();
for (const f of htmls) {
  const h = html[f];
  if (!existsSync(f.replace(/\.html$/, '.md'))) errs.push(`${f}: no markdown twin`);
  if (!/<html lang="en-GB"/.test(h)) errs.push(`${f}: lang`);
  if ((h.match(/<h1[ >]/g) || []).length !== 1) errs.push(`${f}: needs exactly one h1`);
  if (!/<meta name="viewport"/.test(h) || !/<meta name="description" content="[^"]{8,}/.test(h)) errs.push(`${f}: viewport or description`);
  const t = h.match(/<title>([^<]*)/)[1]; if (!/designs\/\d/.test(f)) { if (titles.has(t)) errs.push(`${f}: title repeats ${titles.get(t)}`); titles.set(t, f); }
  for (const m of h.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) errs.push(`${f}: img without alt`);
  if (/google-analytics|googletagmanager|gtag\(|facebook\.net|document\.cookie|plausible|hotjar/i.test(h)) errs.push(`${f}: tracker`);
  for (const m of h.matchAll(/<script[^>]*src="(https?:)?\/\/[^"]+"/g)) errs.push(`${f}: third-party script`);
  // our own words: everything outside blockquotes, <q> and titles of sources
  const own = h.replace(/<blockquote[\s\S]*?<\/blockquote>/g, '').replace(/<q>[\s\S]*?<\/q>/g, '').replace(/<a [^>]*rel="noopener"[^>]*>[\s\S]*?<\/a>/g, '').replace(/title="[^"]*"/g, '').replace(/<pre[\s\S]*?<\/pre>/g, '');
  if (/—/.test(own)) errs.push(`${f}: em dash in our own words: "${own.match(/.{0,50}—.{0,30}/)[0].replace(/\s+/g, ' ')}"`);
  for (const m of h.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const u = m[1]; if (/^(https?:|mailto:|data:)/.test(u)) continue;
    if (u.startsWith('#')) { if (u.length > 1 && !idsOf[f].has(u.slice(1))) errs.push(`${f}: anchor ${u} missing`); continue; }
    if (!u.startsWith('/')) { errs.push(`${f}: relative link ${u}`); continue; }
    const [p, frag] = u.split('?')[0].split('#'); const t = resolve(p);
    if (!existsSync(t)) { errs.push(`${f}: link ${u} has no file`); continue; }
    const fr = u.includes('#') ? u.split('#')[1] : null; if (fr && t.endsWith('.html') && !idsOf[t]?.has(fr)) errs.push(`${f}: ${u} anchor missing`);
  }
}
for (const need of ['llms.txt', 'sitemap.xml', 'robots.txt', 'start/index.html', 'agents/index.html', 'admin/index.html', 'designs/index.html', 'designs/5.html', 'data/facts.json', 'data/entities.json', 'data/timeline.json', 'timeline/index.html', 'sources/index.html', 'disputed/index.html', 'connect/index.html', '404.html', 'policy/abp.json', 'CNAME', 'keys/c.history.json'])
  if (!existsSync(join('site', need))) errs.push(`missing site/${need}`);
console.log(`${htmls.length} pages checked, ${errs.length} errors`);
if (errs.length) { console.log([...new Set(errs)].slice(0, 60).join('\n')); process.exit(1); }
console.log('OK');
