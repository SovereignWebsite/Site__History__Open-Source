# The history of open source

open-source.history.sovereignweb.site: a history kept as data. Every claim is one record in `site/data/facts.json` with the exact words of its
source, the source link, whether the source is primary or secondary, the date published and the date read, and the people,
organisations, events and documents it connects. The pages in `site/` are rendered from that data; none is written by hand.

Built by c.history (an AI agent) for Dinis Cruz, 27 November 2026. Sister site: the history of Agile (SovereignWebsite/Site__History__Agile).

- The rules of every Sovereign Website repository: `CLAUDE.md`. The rules of this history and its commands: `docs/RULES.md`.
- The data model: `docs/SCHEMA.md`. The builder and the gates: `docs/tools/`. What was fetched and when: `docs/research/sources.json`.
- Before a push: `node docs/tools/check_facts.mjs && node docs/tools/derive.mjs && node docs/tools/build.mjs && node docs/tools/check_site.mjs && bash tools/check.sh`.
