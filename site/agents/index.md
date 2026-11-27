# Use this site with your AI

Everything on this site is also data. An agent should read the data, not scrape the pages.

## If you are visiting

Paste this into any assistant that can read web pages:

    Read https://open-source.history.sovereignweb.site/llms.txt and follow the instructions for a reader.

## If you own this site

Give your agent write access to the repository (see [Start here](https://open-source.history.sovereignweb.site/start/)), then tell it:

    Read https://open-source.history.sovereignweb.site/llms.txt and follow the instructions for the owner.

## Read

- [llms.txt](https://open-source.history.sovereignweb.site/llms.txt): the map of the site, written for agents.
- [data/facts.json](https://open-source.history.sovereignweb.site/data/facts.json): one record per claim, with the exact quote, the source link, the source type (primary or secondary), the date published, the date read and what it connects.
- [data/entities.json](https://open-source.history.sovereignweb.site/data/entities.json) and [data/timeline.json](https://open-source.history.sovereignweb.site/data/timeline.json): derived from the facts.
- [data/story.json](https://open-source.history.sovereignweb.site/data/story.json): the eras, the threads and the prose, each sentence marked with the facts it rests on.
- Every page has a markdown twin: add `index.md` to its address.

## Answer

- Answer from the facts, and give the source link of each fact you use, with the date it was read.
- Where a quote is marked paraphrased or disputed, say so. Do not repair it into a cleaner quote.
- Where this site does not say something, say that it does not. Do not fill the gap.

## Change

Only for the site's owner, through the repository, on the `dev` branch, following its `CLAUDE.md` and [the start page](https://open-source.history.sovereignweb.site/start/). The checks refuse a quote that is not found in the source text.

---
The history of open source · https://open-source.history.sovereignweb.site/agents/ · 149 facts, 87% from primary sources. Data: https://open-source.history.sovereignweb.site/data/facts.json
