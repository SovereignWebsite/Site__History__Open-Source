#!/usr/bin/env node
// data/ -> site/ : every page and its markdown twin, llms.txt, sitemap.xml. No dependencies (Node 18+).
// Nothing is written straight into a page: the pages are rendered from data/facts.json and data/story.json.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const J = p => JSON.parse(readFileSync(p, 'utf8'));
const cfg = J('site/data/site.json'), story = J('site/data/story.json'), facts = J('site/data/facts.json').facts;
const entities = J('site/data/entities.json').entities;
const bridge = existsSync('site/data/bridge.json') ? J('site/data/bridge.json') : null;
const notFound = existsSync('docs/research/NOT-FOUND.md') ? readFileSync('docs/research/NOT-FOUND.md', 'utf8') : '';
const F = Object.fromEntries(facts.map(f => [f.id, f]));
const TYPES = [['people', 'People', 'person'], ['organisations', 'Organisations', 'organisation'], ['documents', 'Documents', 'document'], ['events', 'Events', 'event']];
const ENT = Object.fromEntries(entities.map(e => [`${e.type}/${e.id}`, e]));
const ERA = Object.fromEntries(story.eras.map(e => [e.id, e])), THREAD = Object.fromEntries(story.threads.map(t => [t.id, t]));
const DESIGNS = [['1', 'Reading room', 'Cream paper, a book serif'], ['2', 'Broadsheet', 'Black on white, newspaper rules'], ['3', 'Terminal', 'Dark, monospace, green ink'], ['4', 'Index cards', 'Bright cards, a plain sans'], ['5', 'Blueprint', 'Deep blue, drawn on a grid']];
const OUT = 'site';

// ---------- small helpers
// An em dash only ever comes from a quoted source or a source's title (our own words have none: check_facts refuses them).
// It is written as a character reference, so the words of the source stay exact.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\u2014/g, '&#8212;');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = d => { if (!d) return ''; const [y, m, day] = d.split('-'); return [day && String(+day), m && MONTHS[+m - 1], y].filter(Boolean).join(' '); };
const year = d => (d || '').slice(0, 4);
const byDate = (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
const primaryShare = Math.round(100 * facts.filter(f => f.source.type === 'primary').length / Math.max(1, facts.length));
const sourcesMap = new Map();
for (const f of facts) { const k = f.source.url; if (!sourcesMap.has(k)) sourcesMap.set(k, { ...f.source, facts: [] }); sourcesMap.get(k).facts.push(f.id); }
const sources = [...sourcesMap.values()];
const strip = t => t.replace(/\s*\[f:[a-z0-9-]+\]/g, '').replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1').replace(/\*\*/g, '');

// ---------- inline markup: [f:id] fact marks, [[label|href]] links, **bold**
function inlineHtml(text, ctx) {
  return esc(text)
    .replace(/\s*\[f:([a-z0-9-]+)\]/g, (_, id) => { let n = ctx.cites.indexOf(id) + 1; if (!n) n = ctx.cites.push(id); return `<sup class="cite"><a href="#src-${n}" title="${esc(F[id].source.title)}">${n}</a></sup>`; })
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, l, h) => `<a href="${h}">${l}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
function inlineMd(text, ctx) {
  return text
    .replace(/\s*\[f:([a-z0-9-]+)\]/g, (_, id) => { let n = ctx.cites.indexOf(id) + 1; if (!n) n = ctx.cites.push(id); return ` [${n}]`; })
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, l, h) => `[${l}](${h.startsWith('/') ? cfg.url.replace(/\/$/, '') + h : h})`);
}
const entLink = ref => { const e = ENT[ref]; return e ? `[[${e.name}|/${e.type}/${e.id}/]]` : ref; };
const badge = f => `<span class="badge ${f.source.type}">${f.source.type === 'primary' ? 'Primary' : 'Secondary'} source: ${esc(f.source.kind)}</span>`;
const statusNote = f => f.quote_status === 'verified' ? '' : (f.quote_status === 'disputed' ? 'Disputed. ' : 'Usually paraphrased. ');

function factHtml(f, ctx, { step } = {}) {
  const links = TYPES.map(([t]) => (f[t] || []).map(x => `${t}/${x}`)).flat().filter(r => ENT[r]);
  ctx.ids = ctx.ids || new Set(); const idAttr = ctx.ids.has(f.id) ? '' : ` id="${f.id}"`; ctx.ids.add(f.id);
  return `<article class="fact"${idAttr} data-era="${f.era}" data-threads="${(f.threads || []).join(' ')}" data-type="${f.source.type}" data-status="${f.quote_status}">
<p class="when"><time datetime="${f.date}">${fmtDate(f.date)}</time> <a class="era" href="/eras/${f.era}/">${esc(ERA[f.era].title)}</a></p>
${step ? `<p class="step">${inlineHtml(step, ctx)}</p>` : ''}<${ctx.h2 ? 'h3' : 'h2'} class="claim">${esc(f.claim)}</${ctx.h2 ? 'h3' : 'h2'}>
<blockquote cite="${esc(f.source.url)}"><p>${esc(f.quote)}</p></blockquote>
<p class="src">${badge(f)} <a href="${esc(f.source.url)}" rel="noopener">${esc(f.source.title)}</a>, ${esc(f.source.publisher)}${f.source.author ? ', by ' + esc(f.source.author) : ''}${f.source.published ? ', published ' + fmtDate(f.source.published) : ''}. Read ${fmtDate(f.source.read)}.</p>
${f.quote_status !== 'verified' || f.note ? `<p class="note ${f.quote_status}"><strong>${statusNote(f)}</strong>${esc(f.note || '')}</p>` : ''}
${links.length ? `<p class="links">Connects: ${links.map(r => `<a href="/${r}/">${esc(ENT[r].name)}</a>`).join(', ')}</p>` : ''}
<p class="perma"><a href="/facts/#${f.id}">Link to this fact</a></p>
</article>`;
}
function factMd(f, ctx, { step } = {}) {
  const links = TYPES.map(([t]) => (f[t] || []).map(x => `${t}/${x}`)).flat().filter(r => ENT[r]);
  return `### ${fmtDate(f.date)}: ${f.claim}\n\n${step ? inlineMd(step, ctx) + '\n\n' : ''}> ${f.quote}\n\n- Source (${f.source.type}, ${f.source.kind}): [${f.source.title}](${f.source.url}), ${f.source.publisher}${f.source.published ? ', published ' + fmtDate(f.source.published) : ''}. Read ${fmtDate(f.source.read)}.\n${f.quote_status !== 'verified' || f.note ? `- Note: ${statusNote(f)}${f.note || ''}\n` : ''}${links.length ? `- Connects: ${links.map(r => ENT[r].name).join(', ')}\n` : ''}- Fact id: \`${f.id}\`\n`;
}

// ---------- blocks -> html and markdown
function renderBlocks(blocks, ctx, md) {
  const out = [];
  for (const b of blocks) {
    if (!b) continue;
    if (b.t === 'h2') ctx.h2 = true;
    if (b.t === 'h2') out.push(md ? `## ${b.text}` : `<h2${b.id ? ` id="${b.id}"` : ''}>${esc(b.text)}</h2>`);
    else if (b.t === 'p') out.push(md ? inlineMd(b.text, ctx) : `<p${b.cls ? ` class="${b.cls}"` : ''}>${inlineHtml(b.text, ctx)}</p>`);
    else if (b.t === 'ul' || b.t === 'ol') out.push(md ? b.items.map((x, i) => `${b.t === 'ol' ? i + 1 + '.' : '-'} ${inlineMd(x, ctx)}`).join('\n') : `<${b.t}${b.cls ? ` class="${b.cls}"` : ''}>${b.items.map(x => `<li>${inlineHtml(x, ctx)}</li>`).join('\n')}</${b.t}>`);
    else if (b.t === 'facts') out.push(md ? b.ids.map(id => factMd(F[id], ctx)).join('\n') : `<div class="facts">${b.ids.map(id => factHtml(F[id], ctx)).join('\n')}</div>`);
    else if (b.t === 'steps') out.push(md ? b.steps.map((s, i) => factMd(F[s.fact], ctx, { step: `Step ${i + 1}. ${s.text}` })).join('\n') : `<ol class="steps">${b.steps.map(s => `<li>${factHtml(F[s.fact], ctx, { step: s.text })}</li>`).join('\n')}</ol>`);
    else if (b.t === 'raw') out.push(md ? b.md : b.html);
  }
  return out.join(md ? '\n\n' : '\n');
}
function citesHtml(ctx) {
  if (!ctx.cites.length) return '';
  return `<section class="page-sources" aria-labelledby="ps"><h2 id="ps">Sources on this page</h2><ol>${ctx.cites.map((id, i) => { const f = F[id]; return `<li id="src-${i + 1}"><q>${esc(f.quote)}</q> ${badge(f)} <a href="${esc(f.source.url)}" rel="noopener">${esc(f.source.title)}</a>, ${esc(f.source.publisher)}. Read ${fmtDate(f.source.read)}. <a href="/facts/#${id}">The fact</a>${f.quote_status !== 'verified' ? ` <em>(${statusNote(f).trim()} See the note on the fact.)</em>` : ''}</li>`; }).join('\n')}</ol></section>`;
}
function citesMd(ctx) {
  if (!ctx.cites.length) return '';
  return `\n\n## Sources on this page\n\n${ctx.cites.map((id, i) => { const f = F[id]; return `${i + 1}. "${f.quote}" (${f.source.type}) [${f.source.title}](${f.source.url}), ${f.source.publisher}. Read ${fmtDate(f.source.read)}.${f.quote_status !== 'verified' ? ' ' + statusNote(f).trim() : ''}`; }).join('\n')}`;
}

// ---------- the page shell
const NAV = [['/', 'Home'], ['/timeline/', 'Timeline'], ['/eras/', 'Eras'], ['/threads/', 'How it evolved'], ['/people/', 'People'], ['/organisations/', 'Organisations'], ['/documents/', 'Documents'], ['/disputed/', 'What is disputed'], ['/sources/', 'Sources'], ['/connect/', 'Connect the dots']];
const chooser = `<details class="chooser"><summary>Choose a design</summary><div class="chooser-panel"><ul class="cards">${DESIGNS.map(([n, name, d]) => `<li><a href="/designs/${n}.html"><span class="swatch d${n}" aria-hidden="true">Aa</span><strong>${n}. ${name}</strong><span>${d}</span></a></li>`).join('')}</ul><p class="all"><a href="/designs/">All five, side by side</a></p></div></details>`;
const family = `<details class="family-credit"><summary><span aria-hidden="true">⋮</span><span class="vh">Sovereign Website</span></summary><ul><li><a href="/start/">Start here</a></li><li><a href="/agents/">Use with your AI</a></li><li class="family-gap"><a href="/admin/">How this site was made</a></li><li><a href="https://sovereignwebsite.ai/">Sovereign Website</a></li><li><a href="https://sovereignwebsite.org/">Principles</a></li><li><a href="https://sovereignwebsite.site/">Hosted</a></li><li><a href="https://hub.sovereignweb.site/">Hub</a></li><li><a href="https://agents.sovereignweb.site/">Agents</a></li><li><a href="https://vault.sovereignwebsite.site/">Vault</a></li><li><a href="https://agenticcells.ai/">AgentiCCells</a></li><li><a href="https://riskmandate.ai/">RiskMandate</a></li><li><a href="https://newsroom.sgit.ai/">Newsroom</a></li></ul></details>`;
const pages = [];
function page({ path, title, summary, blocks, lead, design, bodyClass, banner, section }) {
  const ctxH = { cites: [] }, ctxM = { cites: [] };
  const isHome = path === '';
  const full = isHome || design ? cfg.title : `${title} · ${section ? section + ' · ' : ''}${cfg.title}`;
  const twin = '/' + (path.endsWith('.html') ? path.replace(/\.html$/, '.md') : path + 'index.md');
  const main = renderBlocks(blocks, ctxH, false);
  const desc = esc(strip(summary)) || esc(cfg.title);
  const html = `<!doctype html>
<html lang="en-GB"${design ? ` data-design="${design}" data-preview` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="${isHome ? 'website' : 'article'}">
<meta property="og:site_name" content="${esc(cfg.title)}">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="${cfg.url}${path}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${cfg.url}assets/share/card-1200x630.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(cfg.title)}: every claim with its source">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${cfg.url}assets/share/card-1200x630.jpg">
<link rel="canonical" href="${cfg.url}${design ? '' : path}">
<link rel="alternate" type="text/markdown" href="${twin}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>try{var h=document.documentElement;if(!h.hasAttribute('data-preview')){var d=localStorage.getItem('design');if(d)h.setAttribute('data-design',d)}}catch(e){}</script>
<link rel="stylesheet" href="/style.css?v=${cssV}">
<style>html:not([data-design]),html[data-design="1"]{--accent:${cfg.colour}}</style>
<script src="/app.js?v=${cssV}" defer></script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to the content</a>
<header class="site">
<p class="brand"><a href="/">${esc(cfg.title)}</a></p>
<nav aria-label="Sections"><ul>${NAV.map(([h, l]) => `<li><a href="${h}"${('/' + path === h) ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul></nav>
<div class="tools">${chooser}${family}</div>
</header>
${banner || ''}
<main id="main">
<p class="version">${facts.length} facts, ${primaryShare}% from primary sources · <a href="${twin}">This page as markdown</a></p>
<h1>${esc(title)}</h1>
${lead ? `<p class="lead">${inlineHtml(lead, ctxH)}</p>` : ''}
${main}
${citesHtml(ctxH)}
</main>
<footer class="site">
<p>${esc(cfg.title)}: a history kept as data. Every claim carries the exact words of its source, the link and the date it was read. Found a mistake? <a href="/start/">Here is how to correct a fact</a>.</p>
<p><a href="/data/facts.json">facts.json</a> · <a href="/data/entities.json">entities.json</a> · <a href="/data/timeline.json">timeline.json</a> · <a href="/llms.txt">llms.txt</a> · <a href="${cfg.sister.url}">${esc(cfg.sister.title)}</a></p>
<p>Static files. No cookies, no tracking, no third-party scripts. Built by c.history (an AI agent) for Dinis Cruz.</p>
<p><a href="/start/">Start here</a> · <a href="/agents/">Use with your AI</a> · <a href="/admin/">How this site was made</a> · <a href="/policy/">How this site is governed</a> · Source: <a href="https://github.com/${cfg.repo}">github.com/${cfg.repo}</a></p>
</footer>
</body>
</html>
`;
  const md = `# ${title}\n\n${lead ? inlineMd(lead, ctxM) + '\n\n' : ''}${renderBlocks(blocks, ctxM, true)}${citesMd(ctxM)}\n\n---\n${cfg.title} · ${cfg.url}${path} · ${facts.length} facts, ${primaryShare}% from primary sources. Data: ${cfg.url}data/facts.json\n`;
  const file = path.endsWith('.html') ? path : path + 'index.html';
  write(file, html); write(file.replace(/\.html$/, '.md'), md);
  if (!design && !path.startsWith('designs/') && path !== '404.html') pages.push({ path, title, summary: strip(summary) });
}
const written = [];
function write(file, text) { const p = join(OUT, file); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); written.push(file); }

// ---------- assets
// Only what an earlier build wrote is removed: the seed's files (CNAME, policy/, keys/, the share card, data/) are never touched.
if (existsSync('docs/generated.json')) for (const f of J('docs/generated.json')) rmSync(join(OUT, f), { force: true });
const css = readFileSync('docs/assets/style.css', 'utf8'), js = readFileSync('docs/assets/app.js', 'utf8');
let h = 0; for (const c of css + js) h = (h * 31 + c.charCodeAt(0)) >>> 0; const cssV = h.toString(16);
write('style.css', css); write('app.js', js);
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${cfg.colour}"/><path d="M14 46h36M18 46V26m14 20V18m14 28V32" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></svg>\n`);
write('.nojekyll', '');

// ---------- content blocks shared by pages
const eraFacts = id => facts.filter(f => f.era === id).sort(byDate);
const cardList = (items) => ({ t: 'raw', html: `<ul class="cardlist">${items.map(i => `<li><a href="${i.href}"><strong>${esc(i.title)}</strong></a>${i.meta ? ` <span class="meta">${esc(i.meta)}</span>` : ''}<span>${esc(strip(i.text || ''))}</span></li>`).join('\n')}</ul>`, md: items.map(i => `- [${i.title}](${cfg.url.replace(/\/$/, '')}${i.href})${i.meta ? ` (${i.meta})` : ''}: ${strip(i.text || '')}`).join('\n') });
const span = e => !(e.from || e.to) ? '' : e.from === e.to ? `${e.from}` : `${e.from || ''} to ${e.to || 'now'}`;

function homeBlocks() {
  return [
    ...story.site.one_screen.map(text => ({ t: 'p', text, cls: 'story' })),
    { t: 'h2', text: 'The eras' },
    cardList(story.eras.map(e => ({ href: `/eras/${e.id}/`, title: e.title, meta: span(e), text: `${eraFacts(e.id).length} facts` }))),
    { t: 'h2', text: 'How it evolved' },
    cardList(story.threads.map(t => ({ href: `/threads/${t.id}/`, title: t.title, meta: `${t.steps.length} steps`, text: t.intro }))),
    { t: 'h2', text: 'Where things stand' },
    ...story.site.state_now.map(text => ({ t: 'p', text })),
    { t: 'h2', text: 'How to read this site' },
    { t: 'p', text: `This is a history kept as data: **${facts.length} facts**, ${primaryShare}% of them from primary sources (the document, the speech, the press release, the person's own post), from ${sources.length} sources. Each fact shows the exact words of its source, the link and the date it was read. Start with [[the timeline|/timeline/]], follow one of the threads above, or see [[what is disputed|/disputed/]] and [[where this history meets ${cfg.sister.title.replace('The history', 'the history')}|/connect/]].` },
  ];
}

// ---------- pages
page({ path: '', title: cfg.title, summary: story.site.tagline, lead: story.site.tagline, blocks: homeBlocks(), bodyClass: 'home' });
for (const [n, name, d] of DESIGNS) page({ path: `designs/${n}.html`, title: cfg.title, summary: story.site.tagline, lead: story.site.tagline, blocks: homeBlocks(), design: n, bodyClass: 'home',
  banner: `<aside class="design-banner" aria-label="Design preview"><p>You are looking at design ${n} of 5: <strong>${name}</strong>. ${d}.</p><p><button type="button" data-use-design="${n}">Use this design</button> <a href="/designs/">All five</a> <a href="/">Back to the site</a></p></aside>` });
page({ path: 'designs/', title: 'Choose a design', summary: 'Five designs for the same facts. Pick the one you like to read.', lead: 'The same facts, five ways to read them. Your choice is kept in this browser only (nothing is sent anywhere).', blocks: [
  { t: 'raw', html: `<ul class="designs">${DESIGNS.map(([n, name, d]) => `<li><a href="/designs/${n}.html"><span class="swatch big d${n}" aria-hidden="true"><b>${esc(cfg.title)}</b><i>Every claim with its source</i></span><strong>${n}. ${name}</strong></a><span>${d}</span> <button type="button" data-use-design="${n}">Use this design</button></li>`).join('')}</ul>`, md: DESIGNS.map(([n, name, d]) => `- [${n}. ${name}](${cfg.url}designs/${n}.html): ${d}`).join('\n') }] });

// timeline
{
  const opts = (arr, f) => arr.map(x => `<option value="${x.id}">${esc(f(x))}</option>`).join('');
  const controls = `<form class="filters" aria-label="Filter the timeline" onsubmit="return false"><label>Era <select id="f-era"><option value="">All eras</option>${opts(story.eras, e => e.title)}</select></label><label>Thread <select id="f-thread"><option value="">All threads</option>${opts(story.threads, t => t.title)}</select></label><label>Source <select id="f-type"><option value="">Primary and secondary</option><option value="primary">Primary only</option><option value="secondary">Secondary only</option></select></label><label>Words <input id="f-q" type="search" placeholder="a name, a year, a word"></label><p id="f-count" role="status" aria-live="polite">${facts.length} facts</p></form>`;
  const blocks = [{ t: 'raw', html: controls, md: `Filters work in the browser. All ${facts.length} facts follow, oldest first.` }];
  let decade = '';
  const sorted = [...facts].sort(byDate);
  const ctxNote = [];
  for (const f of sorted) { const dec = year(f.date).slice(0, 3) + '0s'; if (dec !== decade) { decade = dec; ctxNote.push({ t: 'h2', text: dec, id: 'd' + dec }); } ctxNote.push({ t: 'facts', ids: [f.id] }); }
  page({ path: 'timeline/', title: 'Timeline', summary: `Every fact in date order, from ${year(sorted[0]?.date)} to ${year(sorted.at(-1)?.date)}, with filters by era, thread and source type.`, lead: `Every fact in date order, from ${year(sorted[0]?.date)} to ${year(sorted.at(-1)?.date)}. Filter by era, by thread or by kind of source.`, blocks: [...blocks, { t: 'raw', html: '<div id="timeline">', md: '' }, ...ctxNote, { t: 'raw', html: '</div>', md: '' }], bodyClass: 'timeline' });
}
// facts (permalinks)
page({ path: 'facts/', title: 'All the facts', summary: `All ${facts.length} facts by identifier: the permanent address of each one.`, lead: 'One record per claim: the claim in our words, the exact words of the source, the link, the kind of source, the date published and the date read, and what it connects.', blocks: [{ t: 'facts', ids: [...facts].sort(byDate).map(f => f.id) }] });
// eras
page({ path: 'eras/', title: 'Eras', summary: 'The history in eras, each with its facts.', lead: 'The story in order. Each era page has a short account and every fact that belongs to it.', blocks: [cardList(story.eras.map(e => ({ href: `/eras/${e.id}/`, title: e.title, meta: span(e), text: e.summary })))] });
story.eras.forEach((e, i) => page({ section: 'Era', path: `eras/${e.id}/`, title: e.title, summary: e.summary, lead: span(e) ? `${span(e)}.` : '', blocks: [{ t: 'p', text: e.summary }, { t: 'h2', text: 'The facts of this era' }, { t: 'facts', ids: eraFacts(e.id).map(f => f.id) },
  { t: 'p', text: [story.eras[i - 1] && `Before: [[${story.eras[i - 1].title}|/eras/${story.eras[i - 1].id}/]].`, story.eras[i + 1] && `Next: [[${story.eras[i + 1].title}|/eras/${story.eras[i + 1].id}/]].`].filter(Boolean).join(' '), cls: 'prevnext' }] }));
// threads
page({ path: 'threads/', title: 'How it evolved', summary: 'Threads through the history: one change followed step by step, each step a sourced fact.', lead: 'Each thread follows one change through time, step by step. Every step is a fact with its source.', blocks: [cardList(story.threads.map(t => ({ href: `/threads/${t.id}/`, title: t.title, meta: `${t.steps.length} steps, ${year(F[t.steps[0]?.fact]?.date)} to ${year(F[t.steps.at(-1)?.fact]?.date)}`, text: t.intro })))] });
for (const t of story.threads) page({ section: 'How it evolved', path: `threads/${t.id}/`, title: t.title, summary: t.intro, lead: t.intro, blocks: [{ t: 'steps', steps: t.steps }, { t: 'p', text: `Other threads: ${story.threads.filter(x => x.id !== t.id).map(x => `[[${x.title}|/threads/${x.id}/]]`).join(', ')}.`, cls: 'prevnext' }] });
// entities
for (const [type, label, one] of TYPES) {
  const list = entities.filter(e => e.type === type).sort((a, b) => a.name.localeCompare(b.name));
  if (!list.length) continue;
  page({ path: `${type}/`, title: label, summary: `${label} in this history, each with the facts that mention them.`, lead: type === 'people' ? 'Public, professional facts only, each with its source.' : `Every ${one} here is linked from at least one sourced fact.`, blocks: [cardList(list.map(e => ({ href: `/${type}/${e.id}/`, title: e.name, meta: `${e.facts.length} fact${e.facts.length === 1 ? '' : 's'}${e.first ? ', ' + year(e.first) + (year(e.last) !== year(e.first) ? ' to ' + year(e.last) : '') : ''}`, text: e.summary })))] });
  for (const e of list) page({ section: label, path: `${type}/${e.id}/`, title: e.name, summary: e.summary, lead: '', blocks: [
    { t: 'p', text: e.summary },
    e.url ? { t: 'p', text: `The document itself: [[${e.url}|${e.url}]]` } : null,
    e.related.length ? { t: 'h2', text: 'Connect the dots' } : null,
    e.related.length ? { t: 'ul', cls: 'related', items: e.related.filter(r => ENT[r.ref]).slice(0, 24).map(r => `${entLink(r.ref)} (${r.shared_facts} shared fact${r.shared_facts === 1 ? '' : 's'})`) } : null,
    { t: 'h2', text: e.facts.length ? 'The facts' : 'No facts yet' },
    e.facts.length ? { t: 'facts', ids: e.facts } : { t: 'p', text: 'Nothing sourced links here yet.' }] });
}
// disputed
{
  const flagged = facts.filter(f => f.quote_status !== 'verified' && !(story.disputed || []).some(d => d.facts.includes(f.id))).sort(byDate);
  const blocks = [];
  for (const d of story.disputed || []) { blocks.push({ t: 'h2', text: d.title, id: d.id }, { t: 'p', text: d.summary }, { t: 'facts', ids: d.facts }); }
  if (flagged.length) blocks.push({ t: 'h2', text: 'Other quotes that are paraphrased or contested', id: 'other' }, { t: 'facts', ids: flagged.map(f => f.id) });
  page({ path: 'disputed/', title: 'What is disputed', summary: 'Where the record is contested: famous quotes that are paraphrased, attributions that are argued over, studies that were challenged.', lead: 'A history that hides its arguments is not honest. Here is what is contested, who says what, and what the sources we read actually say.', blocks });
}
// sources
{
  const row = s => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>, ${esc(s.publisher)}${s.author ? ', by ' + esc(s.author) : ''}${s.published ? ', ' + fmtDate(s.published) : ''}. <span class="meta">${esc(s.kind)}, read ${fmtDate(s.read)}.</span> Facts: ${s.facts.map((id, i) => `<a href="/facts/#${id}" title="${esc(F[id].claim)}">${i + 1}</a>`).join(' ')}</li>`;
  const rowMd = s => `- [${s.title}](${s.url}), ${s.publisher}${s.published ? ', ' + fmtDate(s.published) : ''} (${s.kind}, read ${fmtDate(s.read)}). Facts: ${s.facts.map(id => '`' + id + '`').join(', ')}`;
  const sec = type => { const l = sources.filter(s => s.type === type).sort((a, b) => (a.published || '9').localeCompare(b.published || '9')); return { t: 'raw', html: `<ul class="sources">${l.map(row).join('\n')}</ul>`, md: l.map(rowMd).join('\n') }; };
  const np = sources.filter(s => s.type === 'primary').length;
  page({ path: 'sources/', title: 'Sources', summary: `The ${sources.length} sources behind the ${facts.length} facts: ${np} primary, ${sources.length - np} secondary.`, lead: `The ${sources.length} sources behind the ${facts.length} facts, oldest first. Each was fetched and read on the date shown, and every quote on this site was checked, word for word, against the text that was read.`, blocks: [
    { t: 'h2', text: `Primary sources (${np})`, id: 'primary' }, { t: 'p', text: 'The document itself, the speech, the press release, the archive, the person\'s own post.' }, sec('primary'),
    { t: 'h2', text: `Secondary sources (${sources.length - np})`, id: 'secondary' }, { t: 'p', text: 'Reporting, books and encyclopaedias, used where the primary record could not be read. A newspaper that quotes someone is the record of the words, not proof of what they describe.' }, sec('secondary')] });
}
// connect the dots
{
  const blocks = [];
  if (bridge) {
    blocks.push({ t: 'raw', html: graphSvg(bridge), md: 'The graph is drawn on the web page. The same connections follow as text.' });
    for (const m of bridge.meeting_points) {
      blocks.push({ t: 'h2', text: m.title, id: 'mp-' + m.id }, { t: 'p', text: m.text });
      if (m.here.length) blocks.push({ t: 'facts', ids: m.here.filter(id => F[id]) });
      if (m.there.length) blocks.push({ t: 'raw', html: `<div class="there"><h3>In ${esc(cfg.sister.title.replace('The history', 'the history'))}</h3><ul>${m.there.map(x => `<li><time datetime="${x.date}">${fmtDate(x.date)}</time>: <a href="${cfg.sister.url}facts/#${x.id}">${esc(x.claim)}</a> <span class="meta">Source: <a href="${esc(x.source_url)}" rel="noopener">${esc(x.source_title)}</a></span></li>`).join('')}</ul></div>`, md: `In ${cfg.sister.title}:\n\n${m.there.map(x => `- ${fmtDate(x.date)}: [${x.claim}](${cfg.sister.url}facts/#${x.id}) (source: ${x.source_url})`).join('\n')}` });
    }
  } else for (const b of story.bridge || []) blocks.push({ t: 'p', text: b.text }, { t: 'facts', ids: [b.fact] });
  page({ path: 'connect/', title: 'Connect the dots', summary: `Where ${cfg.title.replace('The history', 'the history')} meets ${cfg.sister.title.replace('The history', 'the history')}: the people, tools and ideas the two share, each connection sourced on both sides.`, lead: `Two histories, kept as two sets of facts. Here is where they meet: the same people, the same tools, the same ideas. Each line in the graph is a sourced fact on one side or the other.`, blocks, bodyClass: 'connect' });
}
function graphSvg(br) {
  const W = 1000, colL = 300, colR = 700, boxW = 270, rowH = 58, mpH = 64;
  const wrap = (s, n) => { const w = s.split(' '), lines = ['']; for (const x of w) { if ((lines.at(-1) + ' ' + x).trim().length > n) lines.push(x); else lines[lines.length - 1] = (lines.at(-1) + ' ' + x).trim(); } return lines; };
  let y = 54; const parts = [];
  const short = (c, n = 3) => { const l = wrap(c, 36); return l.length > n ? [...l.slice(0, n - 1), l[n - 1].replace(/.{0,2}$/, '') + '…'] : l; };
  for (const m of br.meeting_points) {
    const L = m.here.filter(id => F[id]).map(id => ({ id, date: F[id].date, claim: F[id].claim, href: `/facts/#${id}` }));
    const R = m.there.map(x => ({ ...x, href: `${cfg.sister.url}facts/#${x.id}` }));
    const rows = Math.max(L.length, R.length, 1), hgt = rows * rowH, cy = y + hgt / 2;
    const node = (x, i, n, f, side) => { const ny = y + (hgt - n * rowH) / 2 + i * rowH; const lines = short(f.claim);
      return `<path class="edge" d="M${side === 'L' ? x + boxW : x} ${ny + 24} C ${side === 'L' ? x + boxW + 50 : x - 50} ${ny + 24}, ${side === 'L' ? 500 - 150 : 500 + 150} ${cy}, ${side === 'L' ? 500 - 90 : 500 + 90} ${cy}"/><a href="${f.href}"><rect class="node ${side}" x="${x}" y="${ny}" width="${boxW}" height="${rowH - 8}" rx="6"/><text x="${x + 8}" y="${ny + 14}" class="yr">${year(f.date)}</text>${lines.map((l, k) => `<text x="${x + 46}" y="${ny + 14 + k * 13}">${esc(l)}</text>`).join('')}</a>`; };
    parts.push(L.map((f, i) => node(colL - boxW, i, L.length, f, 'L')).join(''), R.map((f, i) => node(colR, i, R.length, f, 'R')).join(''));
    const tl = wrap(m.title, 22);
    parts.push(`<a href="#mp-${m.id}"><rect class="mp" x="${500 - 90}" y="${cy - mpH / 2}" width="180" height="${mpH}" rx="${mpH / 2}"/>${tl.map((l, k) => `<text class="mpt" x="500" y="${cy + 4 + (k - (tl.length - 1) / 2) * 15}" text-anchor="middle">${esc(l)}</text>`).join('')}</a>`);
    y += Math.max(hgt, mpH) + 22;
  }
  const mine = cfg.title, theirs = cfg.sister.title;
  return `<figure class="graph" role="group" aria-labelledby="gcap"><div class="graph-scroll"><svg viewBox="0 0 ${W} ${y}" width="${W}" height="${y}" aria-labelledby="gtitle gdesc"><title id="gtitle">Where the two histories meet</title><desc id="gdesc">${br.meeting_points.length} meeting points in the middle, joined to facts from ${esc(mine)} on the left and ${esc(theirs)} on the right. The same connections are listed as text below.</desc><text class="colh" x="${colL - boxW}" y="26">${esc(mine)}</text><text class="colh" x="${colR + boxW}" y="26" text-anchor="end">${esc(theirs)}</text><text class="colh mid" x="500" y="26" text-anchor="middle">Where they meet</text>${parts.join('')}</svg></div><figcaption id="gcap">Each box is a sourced fact (select it to read the quote and the source). On a phone, scroll the graph sideways, or read the same connections below.</figcaption></figure>`;
}

// the standard pages
const repo = cfg.repo;
page({ path: 'start/', title: 'Start here', summary: 'For whoever keeps this site: where the files are, how to correct a fact, how to add one, and what the checks refuse.', lead: 'This page is for whoever keeps this site. Readers can go straight to [[the home page|/]].', blocks: [
  { t: 'h2', text: 'Take the site over' }, { t: 'ol', items: ['Make a GitHub account at [[github.com/signup|https://github.com/signup]], if you do not have one, and send your GitHub login to the person who made this site. You get two invitations: one to the repository, with write access, and one to join the SovereignWebsite organisation as a member (membership gives access to nothing else; it lets your own Claude work with your repository).', `Accept the repository invitation (signed in to GitHub, open [[the repository|https://github.com/${repo}]] and press View invitation), then the organisation invitation at [[github.com/orgs/SovereignWebsite/invitation|https://github.com/orgs/SovereignWebsite/invitation]].`, 'If your own AI assistant will make changes, ask it first to make its own signing key and publish the public half in `site/keys/`, as [[llms.txt|/llms.txt]] says. Your own edits on GitHub need no key.', `To ask for a change instead, open an issue at [[the repository's issues|https://github.com/${repo}/issues/new]].`, 'It is yours: the files, the history and the address are in a repository you control, and can move anywhere, at any time.'] },
  { t: 'h2', text: 'What you hold' }, { t: 'ul', items: [`The files and their history: the repository [[${repo}|https://github.com/${repo}]]. The site is the static files in its \`site/\` folder on the \`dev\` branch; \`main\` is never pushed to.`, 'The facts: `site/data/facts.json` (one record per claim) and `site/data/story.json` (the eras, the threads, the people and the prose, each sentence pointing at its facts). Everything else is derived or rendered from those two.', 'No server code, no database, no cookies, no tracking.'] },
  { t: 'h2', text: 'Correct a fact' }, { t: 'ol', items: ['Find the fact on [[the facts page|/facts/]]; its identifier is in its link.', 'Open `site/data/facts.json`, change the record, and keep the quote exactly as the source has it.', 'Fetch the source so the quote can be checked: `node docs/tools/fetch_source.mjs <source-id> <url>`.', 'Run `node docs/tools/check_facts.mjs`, `node docs/tools/derive.mjs`, `node docs/tools/build.mjs` and `node docs/tools/check_site.mjs`. The first refuses a quote that is not in the source text.', 'Run `bash tools/check.sh` (the checks the deploy runs), then commit and push to `dev`. The site follows in a minute or two.'] },
  { t: 'h2', text: 'Add a fact' }, { t: 'p', text: 'The same steps, with a new record. The shape of a record is in `docs/SCHEMA.md` in the repository. A claim without a source that was read is not added; a famous quote that cannot be found in a source is recorded as paraphrased or disputed, with a note saying so.' },
  { t: 'h2', text: 'Ask an AI to do it' }, { t: 'p', text: 'Give your AI this site\'s [[llms.txt|/llms.txt]] and [[the page for agents|/agents/]]. It must follow the same rule: never invent a fact, a date or a quote.' }] });
page({ path: 'agents/', title: 'Use this site with your AI', summary: 'For AI agents and the people using them: the data files, the rule for quoting, and how to propose a correction.', lead: 'Everything on this site is also data. An agent should read the data, not scrape the pages.', blocks: [
  { t: 'h2', text: 'If you are visiting' }, { t: 'p', text: 'Paste this into any assistant that can read web pages:' }, { t: 'raw', html: `<pre>Read ${cfg.url}llms.txt and follow the instructions for a reader.\nThen answer my questions about ${esc(cfg.title.replace('The history', 'the history'))}, with the source link for each point,\nand say plainly when the site does not say something.</pre>`, md: `    Read ${cfg.url}llms.txt and follow the instructions for a reader.` },
  { t: 'h2', text: 'If you own this site' }, { t: 'p', text: 'Give your agent write access to the repository (see [[Start here|/start/]]), then tell it:' }, { t: 'raw', html: `<pre>Read ${cfg.url}llms.txt and follow the instructions for the owner.\nI want to change: [describe the change].</pre>`, md: `    Read ${cfg.url}llms.txt and follow the instructions for the owner.` },
  { t: 'h2', text: 'Read' }, { t: 'ul', items: ['[[llms.txt|/llms.txt]]: the map of the site, written for agents.', '[[data/facts.json|/data/facts.json]]: one record per claim, with the exact quote, the source link, the source type (primary or secondary), the date published, the date read and what it connects.', '[[data/entities.json|/data/entities.json]] and [[data/timeline.json|/data/timeline.json]]: derived from the facts.', '[[data/story.json|/data/story.json]]: the eras, the threads and the prose, each sentence marked with the facts it rests on.', 'Every page has a markdown twin: add `index.md` to its address.'] },
  { t: 'h2', text: 'Answer' }, { t: 'ul', items: ['Answer from the facts, and give the source link of each fact you use, with the date it was read.', 'Where a quote is marked paraphrased or disputed, say so. Do not repair it into a cleaner quote.', 'Where this site does not say something, say that it does not. Do not fill the gap.'] },
  { t: 'h2', text: 'Change' }, { t: 'p', text: 'Only for the site\'s owner, through the repository, on the `dev` branch, following its `CLAUDE.md` and [[the start page|/start/]]. The checks refuse a quote that is not found in the source text.' }] });
{
  const nf = notFound.trim();
  page({ path: 'admin/', title: 'How this site was made', summary: 'Who built this site, from what brief, by what method, and what could not be sourced.', lead: 'Built on 27 November 2026 by c.history, an AI agent working for Dinis Cruz, with one research sub-agent per history. Nothing here is hidden: the method, the checks and the gaps.', blocks: [
    { t: 'h2', text: 'The brief' }, { t: 'p', text: 'Dinis Cruz asked for "a mix of Wikipedia, research, state of affairs": where it starts, what happened, the evolutions and where things stand, for someone who wants to learn, with "the whole provenance model" so a reader can "connect the dots".' },
    { t: 'h2', text: 'The method: facts as data first' }, { t: 'ol', items: ['Each source was fetched and its text kept (`docs/tools/fetch_source.mjs`).', 'Each claim was written as one record with the exact words of the source (`site/data/facts.json`).', `A check compares every quote, word for word, with the text that was fetched, and refuses the build if one is not there (\`docs/tools/check_facts.mjs\`). All ${facts.length} quotes pass.`, 'c.history then re-read a sample of the facts against their sources by hand, and removed or corrected what did not hold.', 'The people, organisations, events and documents, and the timeline, are derived from the facts (`docs/tools/derive.mjs`).', 'The pages and their markdown twins are rendered from the data (`docs/tools/build.mjs`). No page is written by hand.'] },
    { t: 'h2', text: 'The numbers' }, { t: 'ul', items: [`${facts.length} facts from ${sources.length} sources; ${primaryShare}% of the facts rest on a primary source.`, `${facts.filter(f => f.quote_status !== 'verified').length} quotes are marked paraphrased or disputed, with a note. See [[what is disputed|/disputed/]].`, `${entities.length} people, organisations, events and documents; ${story.eras.length} eras; ${story.threads.length} threads.`, 'The version of each build is made by the publishing pipeline and shown at the foot of every page.'] },
    { t: 'h2', text: 'What a check cannot do' }, { t: 'p', text: 'The check proves that a quote is in the source that was read. It does not prove that the source is right, that the claim in our words is a fair reading of the quote, or that nothing important is missing. Those are judgements, made by an AI agent and reviewed by a second pass, and they can be wrong. If you find one, [[here is how to correct it|/start/]].' },
    { t: 'h2', text: 'What could not be sourced' }, nf ? { t: 'raw', html: `<pre class="notfound">${esc(nf)}</pre>`, md: nf } : { t: 'p', text: 'Nothing is recorded as not found.' },
    { t: 'h2', text: 'The request and every change' }, { t: 'ul', items: ['The site began as one request in the Sovereign Website factory: [[SovereignWebsite__IaC|https://github.com/SovereignWebsite/SovereignWebsite__IaC/tree/dev/requests]]. Its pipeline made the repository, the address and its certificate.', `[[The commits|https://github.com/${repo}/commits/dev]]: who changed what, and when. [[The workflow runs|https://github.com/${repo}/actions]]: each publish of the site.`, 'The agents that work on this site are in [[data/agents.json|/data/agents.json]]; their keys are in `site/keys/` and at [[agents.sovereignweb.site|https://agents.sovereignweb.site/]].', 'No design round by the design agent and no synthetic user run has been made on this site yet.'] },
    { t: 'h2', text: 'Who' }, { t: 'ul', items: ['c.history (SovereignWebsite), an AI agent on Claude, started by c.maestro at Dinis Cruz\'s word on 27 November 2026. Only Dinis instructs it.', 'Two research sub-agents, one per history, run inside c.history\'s session.', `The sister site: [[${cfg.sister.title}|${cfg.sister.url}]].`] }] });
}
page({ path: '404.html', title: 'Page not found', summary: 'That address is not on this site.', lead: 'That address is not on this site.', blocks: [{ t: 'p', text: 'Try [[the home page|/]], [[the timeline|/timeline/]] or [[all the facts|/facts/]].' }] });

// llms.txt, sitemap, robots
write('llms.txt', `# ${cfg.title}

> ${strip(story.site.tagline)} A history kept as data: ${facts.length} facts, ${primaryShare}% from primary sources, each with the exact quote, the source link and the date read.

This file is for AI agents and the people using them. The site is ${cfg.url}, static files in the public repository https://github.com/${repo} (served from site/ on the dev branch).

## If you act for a reader (read-only)

- Read the data first: ${cfg.url}data/facts.json (one record per claim), ${cfg.url}data/timeline.json, ${cfg.url}data/entities.json, ${cfg.url}data/story.json.
- Answer from the facts, with each fact's source link and the date it was read. Where a quote is marked paraphrased or disputed, say so.
- When the site does not say something, say so plainly; never fill the gap with a guess.

## If you act for the site's owner

- Work on the dev branch only; main is never pushed to. Read the repository's CLAUDE.md and ${cfg.url}start/ first.
- Never invent a fact, a date or a quote. A quote must be found, word for word, in the source text fetched with docs/tools/fetch_source.mjs; docs/tools/check_facts.mjs refuses it otherwise.
- Keep the site static: no server code, no cookies, no tracking.
- Before your first commit, make your own signing key (bash tools/setup-signing.sh <your-name> <your-session-url>) and commit only site/keys/<name>.json, signed with it, with the trailers Agent: and Claude-Session:. Sign every commit after that the same way. The owner's own commits on GitHub need no key.
- Before every push run bash tools/check.sh.

## Pages (each has a markdown twin at the same address plus index.md)

${pages.map(p => `- [${p.title}](${cfg.url}${p.path}): ${p.summary}`).join('\n')}

## More

- Use this site with AI: ${cfg.url}agents/
- How this site was made: ${cfg.url}admin/
- How this site is governed: ${cfg.url}policy/
- The agents that work on this site: ${cfg.url}data/agents.json
- The sister history: ${cfg.sister.url}

No cookies, no tracking.
`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `<url><loc>${cfg.url}${p.path}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${cfg.url}sitemap.xml\n`);
writeFileSync('docs/generated.json', JSON.stringify(written.sort(), null, 1) + '\n');
console.log(`built ${pages.length} pages (+5 design previews) into ${OUT}/`);
