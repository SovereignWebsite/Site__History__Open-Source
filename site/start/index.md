# Start here

This page is for whoever keeps this site. Readers can go straight to [the home page](https://open-source.history.sovereignweb.site/).

## Take the site over

1. Make a GitHub account at [github.com/signup](https://github.com/signup), if you do not have one, and send your GitHub login to the person who made this site. You get two invitations: one to the repository, with write access, and one to join the SovereignWebsite organisation as a member (membership gives access to nothing else; it lets your own Claude work with your repository).
2. Accept the repository invitation (signed in to GitHub, open [the repository](https://github.com/SovereignWebsite/Site__History__Open-Source) and press View invitation), then the organisation invitation at [github.com/orgs/SovereignWebsite/invitation](https://github.com/orgs/SovereignWebsite/invitation).
3. If your own AI assistant will make changes, ask it first to make its own signing key and publish the public half in `site/keys/`, as [llms.txt](https://open-source.history.sovereignweb.site/llms.txt) says. Your own edits on GitHub need no key.
4. To ask for a change instead, open an issue at [the repository's issues](https://github.com/SovereignWebsite/Site__History__Open-Source/issues/new).
5. It is yours: the files, the history and the address are in a repository you control, and can move anywhere, at any time.

## What you hold

- The files and their history: the repository [SovereignWebsite/Site__History__Open-Source](https://github.com/SovereignWebsite/Site__History__Open-Source). The site is the static files in its `site/` folder on the `dev` branch; `main` is never pushed to.
- The facts: `site/data/facts.json` (one record per claim) and `site/data/story.json` (the eras, the threads, the people and the prose, each sentence pointing at its facts). Everything else is derived or rendered from those two.
- No server code, no database, no cookies, no tracking.

## Correct a fact

1. Find the fact on [the facts page](https://open-source.history.sovereignweb.site/facts/); its identifier is in its link.
2. Open `site/data/facts.json`, change the record, and keep the quote exactly as the source has it.
3. Fetch the source so the quote can be checked: `node docs/tools/fetch_source.mjs <source-id> <url>`.
4. Run `node docs/tools/check_facts.mjs`, `node docs/tools/derive.mjs`, `node docs/tools/build.mjs` and `node docs/tools/check_site.mjs`. The first refuses a quote that is not in the source text.
5. Run `bash tools/check.sh` (the checks the deploy runs), then commit and push to `dev`. The site follows in a minute or two.

## Add a fact

The same steps, with a new record. The shape of a record is in `docs/SCHEMA.md` in the repository. A claim without a source that was read is not added; a famous quote that cannot be found in a source is recorded as paraphrased or disputed, with a note saying so.

## Ask an AI to do it

Give your AI this site's [llms.txt](https://open-source.history.sovereignweb.site/llms.txt) and [the page for agents](https://open-source.history.sovereignweb.site/agents/). It must follow the same rule: never invent a fact, a date or a quote.

---
The history of open source · https://open-source.history.sovereignweb.site/start/ · 149 facts, 87% from primary sources. Data: https://open-source.history.sovereignweb.site/data/facts.json
