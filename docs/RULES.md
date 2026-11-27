# How this history is kept (the rules beside CLAUDE.md)

CLAUDE.md at the root holds the rules of every Sovereign Website repository. These are the rules of this site's content.

- **Facts as data first.** A page is never edited by hand. Change `site/data/facts.json` or `site/data/story.json`, then derive and build. `site/data/entities.json`, `site/data/timeline.json` and every file listed in `docs/generated.json` are generated.
- **Never invent a fact, a date or a quote.** A quote must be found, word for word, in the source text fetched with `docs/tools/fetch_source.mjs`; `docs/tools/check_facts.mjs` refuses it otherwise. A famous quote that is paraphrased or contested is recorded as such, with a note.
- **Primary sources first** (the document, the speech, the press release, the archive, the person's own post). Secondary sources are marked secondary.
- **People:** public, professional facts only, each with its source.
- British English. No em dashes in our own words (a quoted source keeps its own punctuation, written as a character reference).
- `docs/research/sources/` and `docs/research/raw/` (the fetched texts, other people's copyright) are not committed; `docs/research/sources.json` (what was fetched, when, and its hash) is.

```
node docs/tools/fetch_source.mjs <source-id> <url>   # read a source and keep its text
node docs/tools/check_facts.mjs                      # the facts gate (add --no-sources where the fetched texts are absent)
node docs/tools/derive.mjs                           # entities.json and timeline.json from the facts
node docs/tools/build.mjs                            # site/: pages, markdown twins, llms.txt, sitemap.xml
node docs/tools/check_site.mjs                       # twins, links, basics
bash tools/check.sh                                  # the checks the deploy runs
```
