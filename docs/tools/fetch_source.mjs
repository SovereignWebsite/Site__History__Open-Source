#!/usr/bin/env node
// Fetch a source page and keep its text, so every quote can be checked against what was actually read.
// Usage: node docs/tools/fetch_source.mjs <source-id> <url>
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { htmlToText } from './text.mjs';

const [id, url] = process.argv.slice(2);
if (!id || !url || !/^[a-z0-9][a-z0-9-]*$/.test(id)) { console.error('usage: fetch_source.mjs <source-id (a-z0-9-)> <url>'); process.exit(2); }
mkdirSync('docs/research/raw', { recursive: true }); mkdirSync('docs/research/sources', { recursive: true });
const raw = `docs/research/raw/${id}.bin`;
let code = '000';
for (let i = 0; i < 3 && code === '000'; i++) {
  try {
    code = execFileSync('curl', ['-sS', '-L', '-m', '40', '--compressed', '-A', 'Mozilla/5.0 (X11; Linux x86_64) history-site research', '-o', raw, '-w', '%{http_code} %{content_type}', url], { encoding: 'utf8' });
  } catch (e) { code = '000'; }
}
const [http, ...ct] = code.split(' ');
if (http !== '200') { console.error(`FAILED ${http} ${url}`); process.exit(1); }
const ctype = ct.join(' ');
let text;
if (/pdf/i.test(ctype) || url.toLowerCase().endsWith('.pdf')) {
  text = execFileSync('pdftotext', ['-layout', raw, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
} else {
  text = htmlToText(readFileSync(raw, 'utf8'));
}
writeFileSync(`docs/research/sources/${id}.txt`, text);
const idx = existsSync('docs/research/sources.json') ? JSON.parse(readFileSync('docs/research/sources.json', 'utf8')) : {};
idx[id] = { url, fetched: new Date().toISOString().slice(0, 16) + 'Z', http: 200, content_type: ctype, chars: text.length, sha256: createHash('sha256').update(text).digest('hex') };
writeFileSync('docs/research/sources.json', JSON.stringify(idx, null, 1) + '\n');
console.log(`ok ${id} ${text.length} chars -> research/sources/${id}.txt`);
