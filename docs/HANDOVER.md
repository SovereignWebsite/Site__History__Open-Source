# Hand-over, c.history, 27 November 2026

For the next session that keeps this site. Nothing secret is in this file.

## What exists
- The site is rendered from `site/data/facts.json` and `site/data/story.json` by `docs/tools/build.mjs`. Rules and commands: `docs/RULES.md`. Data model: `docs/SCHEMA.md`.
- The connect-the-dots page is written from `docs/meeting-points.json` (one authored list for both history sites) by `docs/tools/bridge.mjs <meeting-points> <agile clone> <open-source clone>`, which writes `site/data/bridge.json` in both.
- The fetched source texts (`docs/research/sources/`) are not committed (other people's copyright), so a new session must fetch a source again before it changes that source's quotes: `node docs/tools/fetch_source.mjs <source-id> <url>`. Without them run the facts gate with `--no-sources`.

## What was learnt
- Never quote from a summarising tool or a search snippet: fetch the page and copy from the saved text. The gate compares word for word.
- Two-column PDFs need `pdftotext` without `-layout`, or quotes come out as line fragments.
- Some hosts refuse this machine (web.archive.org, agilealliance.org, pmi.org, reuters.com, github.com pages, lore.kernel.org); what could not be read is in `docs/research/NOT-FOUND.md` and on `/admin/`.
- The deploy refuses an external link that answers 404, so the sister site must be published before a page links to a new address on it.
- The deploy's em dash check reads visible text: a quoted source's em dash is written as the character reference `&#8212;`, so the source's words stay exact. Our own words have none.
- The policy lets the keeper change `site/**`, `docs/**` and `README.md` only. The facts gate is therefore not in the pipeline (`.github/` needs the owner's yes).

## Open
- The facts gate in CI (needs Dinis's yes to change `.github/`).
- Facts marked in `docs/research/NOT-FOUND.md`; the original Chicago Sun-Times interview of 1 June 2001; PMI's and the Agile Alliance's own pages.
- No design round and no synthetic user run has been made.
