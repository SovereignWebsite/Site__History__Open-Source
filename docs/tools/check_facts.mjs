#!/usr/bin/env node
// The facts gate: the shape of every record, every link, and every quote against the source text that was read.
// Usage: node docs/tools/check_facts.mjs [--no-sources]   (--no-sources: skip the quote check where research/sources/ is absent, e.g. in CI)
import { readFileSync, existsSync } from 'node:fs';
import { quoteInSource } from './text.mjs';
const noSources = process.argv.includes('--no-sources');
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const facts = J('site/data/facts.json'), story = J('site/data/story.json');
const srcIdx = existsSync('docs/research/sources.json') ? J('docs/research/sources.json') : {};
const errs = [], warns = [];
const E = (id, m) => errs.push(`${id}: ${m}`);
const ids = new Set();
const ent = {}; for (const t of ['people', 'organisations', 'events', 'documents']) ent[t] = new Set((story.entities?.[t] || []).map(e => e.id));
const eras = new Set((story.eras || []).map(e => e.id)), threads = new Set((story.threads || []).map(t => t.id));
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const QS = ['verified', 'paraphrase', 'disputed'];
for (const f of facts.facts) {
  const id = f.id || '(no id)';
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) E(id, 'id must be a-z, 0-9 and hyphens');
  if (ids.has(id)) E(id, 'duplicate id'); ids.add(id);
  if (!f.claim || f.claim.length < 15) E(id, 'claim missing');
  if (/—/.test(JSON.stringify({ c: f.claim, n: f.note }))) E(id, 'em dash in our own words');
  if (!DATE.test(f.date || '')) E(id, 'date must be YYYY, YYYY-MM or YYYY-MM-DD');
  if (!eras.has(f.era)) E(id, `era "${f.era}" is not in story.json`);
  for (const t of f.threads || []) if (!threads.has(t)) E(id, `thread "${t}" is not in story.json`);
  for (const t of ['people', 'organisations', 'events', 'documents']) for (const x of f[t] || []) if (!ent[t].has(x)) E(id, `${t} "${x}" is not in story.json entities`);
  if (!QS.includes(f.quote_status)) E(id, `quote_status must be one of ${QS.join(', ')}`);
  const s = f.source || {};
  if (!/^https?:\/\//.test(s.url || '')) E(id, 'source.url missing');
  if (!['primary', 'secondary'].includes(s.type)) E(id, 'source.type must be primary or secondary');
  if (!s.kind) E(id, 'source.kind missing'); if (!s.title) E(id, 'source.title missing'); if (!s.publisher) E(id, 'source.publisher missing');
  if (s.published != null && !DATE.test(s.published)) E(id, 'source.published must be a date or null');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.read || '')) E(id, 'source.read (date read) missing');
  if (!f.quote || f.quote.length < 8) E(id, 'quote missing: every fact carries the exact words of its source');
  if (!s.id || !srcIdx[s.id]) { if (!noSources) E(id, `source.id "${s.id}" is not in docs/research/sources.json (fetch it with docs/tools/fetch_source.mjs)`); }
  else if (existsSync(`docs/research/sources/${s.id}.txt`)) {
    const r = quoteInSource(f.quote || '', readFileSync(`docs/research/sources/${s.id}.txt`, 'utf8'));
    if (!r.ok) E(id, `quote not found in the source text read (${s.id}): "${r.missing.slice(0, 90)}"`);
  } else if (!noSources) E(id, `docs/research/sources/${s.id}.txt missing`);
  if (f.quote_status !== 'verified' && !f.note) E(id, 'a paraphrased or disputed quote needs a note saying what is disputed and by whom');
  if (f.disputed && !(f.disputed.what && Array.isArray(f.disputed.positions) && f.disputed.positions.length)) E(id, 'disputed needs what and positions[]');
}
// every [f:id] in story.json must exist
const refs = [...JSON.stringify(story).matchAll(/\[f:([a-z0-9-]+)\]/g)].map(m => m[1]);
for (const r of refs) if (!ids.has(r)) E('story.json', `[f:${r}] is not a fact`);
for (const th of story.threads || []) for (const st of th.steps || []) if (!ids.has(st.fact)) E('story.json', `thread ${th.id} step fact "${st.fact}" is not a fact`);
for (const d of story.disputed || []) for (const x of d.facts || []) if (!ids.has(x)) E('story.json', `disputed ${d.id} fact "${x}" is not a fact`);
if (/—/.test(JSON.stringify(story))) E('story.json', 'em dash in prose');
const used = new Set(refs); for (const th of story.threads || []) for (const st of th.steps || []) used.add(st.fact);
const prim = facts.facts.filter(f => f.source?.type === 'primary').length;
console.log(`${facts.facts.length} facts, ${prim} from primary sources, ${Object.keys(srcIdx).length} sources fetched, ${errs.length} errors`);
if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
console.log('OK');
