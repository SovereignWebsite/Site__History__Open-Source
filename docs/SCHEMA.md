# The data model (facts first)

Everything on the site is rendered from two authored files; nothing is written straight into a page.

## docs/research/ (how a source is read)

`node docs/tools/fetch_source.mjs <source-id> <url>` fetches the page with curl and saves its plain text to
`docs/research/sources/<source-id>.txt` and a row in `docs/research/sources.json` (url, time fetched, sha256).
**A quote is only allowed if it is found, word for word, in that saved text.** `node docs/tools/check_facts.mjs` checks it.
Never take a quote from a search-result snippet, from memory or from a summarising tool.

## site/data/facts.json

```json
{ "facts": [ {
  "id": "manifesto-signed-snowbird-2001",
  "claim": "One sentence, in our own words, British English, no em dashes, saying only what the quote supports.",
  "quote": "The exact words from the source. Skipped text is marked [...] and each part must appear in order.",
  "quote_status": "verified | paraphrase | disputed",
  "date": "2001-02-13",                      // when it happened: YYYY, YYYY-MM or YYYY-MM-DD, only as precise as the source
  "era": "<era id from story.json>",
  "threads": ["<thread id>", "..."],
  "people": ["<id>"], "organisations": ["<id>"], "events": ["<id>"], "documents": ["<id>"],
  "source": {
    "id": "<source-id used with fetch_source.mjs>",
    "url": "https://...", "title": "...", "publisher": "...", "author": "... or null",
    "type": "primary | secondary",          // primary: the document, speech, press release, archive, the person's own post
    "kind": "document | speech | press-release | archive | own-post | mailing-list | licence | report | reporting | book | encyclopaedia | interview",
    "published": "YYYY[-MM[-DD]] or null", "read": "2026-11-27"
  },
  "note": "Needed when quote_status is not verified: what is paraphrased or disputed, and by whom. Optional otherwise.",
  "disputed": null                           // or { "what": "...", "positions": [ { "who": "...", "says": "...", "fact": "<fact id or null>" } ] }
} ] }
```

- `quote_status`: `verified` = the quote is the source's own words and the source is where they were first said or written, or a
  primary record of it. `paraphrase` = widely repeated wording that the source does not have in that form (say what it does say).
  `disputed` = attribution, wording or date is contested (say by whom, with a fact for each side where possible).
- A person quoted in a newspaper: the newspaper is `secondary` for what happened but it is the record of the words; say so in `note` if no transcript exists.
- People: public, professional facts only.

## site/data/story.json

```json
{
  "site": { "title": "...", "tagline": "...", "one_screen": ["Paragraph with fact marks [f:fact-id].", "..."],
            "state_now": ["Paragraphs on where things stand, each claim marked [f:id]."] },
  "eras": [ { "id": "before-2001", "title": "...", "from": "1957", "to": "2000", "summary": "Two to four sentences with [f:id] marks." } ],
  "threads": [ { "id": "microsoft-and-linux", "title": "...", "intro": "...", "steps": [ { "fact": "<fact id>", "text": "What changed at this step, one or two sentences." } ] } ],
  "entities": {
    "people": [ { "id": "kent-beck", "name": "Kent Beck", "summary": "One line, professional, with [f:id]." } ],
    "organisations": [ { "id": "...", "name": "...", "summary": "..." } ],
    "events": [ { "id": "...", "name": "...", "date": "2001-02", "summary": "..." } ],
    "documents": [ { "id": "...", "name": "...", "url": "https://...", "date": "2001-02", "summary": "..." } ]
  },
  "disputed": [ { "id": "...", "title": "...", "summary": "What is disputed and where the evidence stands, with [f:id].", "facts": ["<fact id>"] } ],
  "bridge": [ { "fact": "<fact id>", "other_site": "agile | open-source", "text": "Why this fact is where the two histories meet." } ]
}
```

Every sentence of prose that states something carries a `[f:id]` mark; the build turns it into a numbered link to the fact and its source.
`site/data/entities.json` and `site/data/timeline.json` are derived by `node docs/tools/derive.mjs` (written by c.history): never edit them by hand.
