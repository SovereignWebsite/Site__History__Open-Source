#!/usr/bin/env node
// data/facts.json + data/story.json -> data/entities.json, data/timeline.json (derived: never edit by hand).
import { readFileSync, writeFileSync } from 'node:fs';
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const facts = J('site/data/facts.json').facts, story = J('site/data/story.json');
const TYPES = ['people', 'organisations', 'events', 'documents'];
const byDate = (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
const sorted = [...facts].sort(byDate);
const entities = [];
for (const type of TYPES) for (const e of story.entities[type] || []) {
  const fs = sorted.filter(f => (f[type] || []).includes(e.id));
  const related = {};
  for (const f of fs) for (const t of TYPES) for (const x of f[t] || []) if (!(t === type && x === e.id)) related[`${t}/${x}`] = (related[`${t}/${x}`] || 0) + 1;
  entities.push({ ...e, type, facts: fs.map(f => f.id), first: fs[0]?.date || e.date || null, last: fs.at(-1)?.date || e.date || null,
    related: Object.entries(related).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, n]) => ({ ref: k, shared_facts: n })) });
}
const timeline = sorted.map(f => ({ date: f.date, fact: f.id, claim: f.claim, era: f.era, threads: f.threads || [],
  people: f.people || [], organisations: f.organisations || [], events: f.events || [], documents: f.documents || [],
  source: { type: f.source.type, kind: f.source.kind, url: f.source.url, title: f.source.title }, quote_status: f.quote_status }));
const head = { derived_from: ['site/data/facts.json', 'site/data/story.json'], by: 'tools/derive.mjs', note: 'Derived. Do not edit by hand.' };
writeFileSync('site/data/entities.json', JSON.stringify({ ...head, entities }, null, 1) + '\n');
writeFileSync('site/data/timeline.json', JSON.stringify({ ...head, timeline }, null, 1) + '\n');
console.log(`derived ${entities.length} entities, ${timeline.length} timeline rows`);
