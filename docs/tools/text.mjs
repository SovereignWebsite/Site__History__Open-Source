// Shared text helpers: HTML to plain text, and the normalisation used to compare a quote with its source.
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', copy: '©', reg: '®', trade: '™', eacute: 'é' };
export function decodeEntities(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));
}
export function htmlToText(html) {
  return decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|section|article|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ''))
    .replace(/[ \t\r\f\v]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{2,}/g, '\n').trim() + '\n';
}
// Typographic differences do not make a quote wrong: compare on plain quotes, plain dashes, single spaces.
export function norm(s) {
  return s.normalize('NFKC')
    .replace(/[‘’‚′`]/g, "'").replace(/[“”„″]/g, '"')
    .replace(/[‐-―−]/g, '-').replace(/…/g, '...')
    .replace(/[­​‌‍﻿]/g, '').replace(/\s+/g, ' ').trim();
}
// A quote may skip text with " [...] "; every part must appear in the source, in order.
export function quoteInSource(quote, sourceText) {
  const src = norm(sourceText); let from = 0;
  for (const part of quote.split('[...]').map(norm).filter(Boolean)) {
    const at = src.indexOf(part, from);
    if (at < 0) return { ok: false, missing: part };
    from = at + part.length;
  }
  return { ok: true };
}
