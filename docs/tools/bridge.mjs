#!/usr/bin/env node
// Writes data/bridge.json in both history repositories from one authored file of meeting points.
// Usage: node docs/tools/bridge.mjs <meeting-points.json> <agile repo dir> <open-source repo dir>
import { readFileSync, writeFileSync } from 'node:fs';
const [src, a, o] = process.argv.slice(2);
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const mp = J(src).meeting_points, FA = Object.fromEntries(J(`${a}/site/data/facts.json`).facts.map(f => [f.id, f])), FO = Object.fromEntries(J(`${o}/site/data/facts.json`).facts.map(f => [f.id, f]));
const digest = (F, ids) => ids.map(id => { const f = F[id]; if (!f) throw new Error(`no fact ${id}`); return { id, date: f.date, claim: f.claim, source_url: f.source.url, source_title: f.source.title, source_type: f.source.type }; }).sort((x, y) => x.date.localeCompare(y.date));
const sortIds = (F, ids) => { ids.forEach(id => { if (!F[id]) throw new Error(`no fact ${id}`); }); return [...ids].sort((x, y) => F[x].date.localeCompare(F[y].date)); };
const head = { note: 'Where the two histories meet. Written by tools/bridge.mjs from one authored list of meeting points; the facts of the other site are copied as digests with their sources.' };
writeFileSync(`${a}/site/data/bridge.json`, JSON.stringify({ ...head, meeting_points: mp.map(m => ({ id: m.id, title: m.title, text: m.text, here: sortIds(FA, m.agile), there: digest(FO, m.open_source) })) }, null, 1) + '\n');
writeFileSync(`${o}/site/data/bridge.json`, JSON.stringify({ ...head, meeting_points: mp.map(m => ({ id: m.id, title: m.title, text: m.text, here: sortIds(FO, m.open_source), there: digest(FA, m.agile) })) }, null, 1) + '\n');
console.log(`bridge: ${mp.length} meeting points written to both sites`);
