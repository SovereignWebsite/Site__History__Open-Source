# Not found, or not readable from this machine (27 November 2026)

What the brief asked for and could not be sourced to the standard (an exact quote from a page fetched with
`tools/fetch_source.mjs`). Nothing here is in `data/facts.json` unless a second-best source is named.

## Left out entirely

- **The Linux Foundation's founding (2007, merger of OSDL and the Free Standards Group).** The press release is gone from
  linuxfoundation.org (404 at two addresses), tech-insider.org returns 410, eWeek 403, pcper.com no connection. The Linux
  Foundation appears only through its later releases (CNCF 2015, Microsoft joining 2016, OpenSSF 2020, OpenTofu 2023, Valkey 2024).
- **CodePlex, the hosting site (2006), and the renaming of the CodePlex Foundation to Outercurve (2010).** Only Microsoft's
  2009 post on the CodePlex Foundation was found; it says nothing of 2006 or of the later name.
- **The Core Infrastructure Initiative's own April 2014 press release.** 404 at linuxfoundation.org; the SANS diary copy
  locked this address out. The CII is sourced only from the Linux Foundation's 2020 OpenSSF announcement.
- **SCO v. IBM from court records, and the 2010 jury verdict that Novell owned the Unix copyrights.** Groklaw 403, Justia 403,
  the Novell press page now redirects to an unrelated OpenText page. The case is covered only by two 2021 news reports (The
  Register, ZDNET); the Novell verdict is not in the data.
- **The .NET Foundation's own founding statement (2014).** dotnetfoundation.org/about has no date or founding text; the
  foundation is mentioned only inside Microsoft's November 2014 press release.
- **Visual Studio Code's first public preview (April 2015).** Only the November 2015 open source release is in the data.
- **GitHub's own post on the Microsoft acquisition** was fetched (github-microsoft-2018) but not used; Microsoft's two posts are.
- **Linus Torvalds's own messages on creating Git (April 2005).** lore.kernel.org answers with an Anubis bot challenge; the
  one marc.info message fetched does not mention git. Git's origin is from the Pro Git book (secondary) and the first README.
- **Torvalds's view on the name "GNU/Linux".** Not searched to the standard; only the GNU Project's side is sourced, and
  the dispute entry says so.
- **Stallman's role as disputed by others (for example over the FSF board in 2021).** Not researched; nothing is claimed.
- **The Debian mailing-list originals** (Perens's 1999 message, the 1997 DFSG announcement): lists.debian.org answers with a
  proof-of-work challenge. Perens's 1999 message is read from LWN's copy; the 1997 announcement is replaced by the Social
  Contract page itself.
- **Google's own announcements of Kubernetes (10 June 2014) and of Summer of Code (1 June 2005).** Both Blogger pages were
  fetched, but the post body sits in a block that the fetch tool strips, so no quote could be checked. Kubernetes is sourced
  from the project's documentation and a 2018 post on its blog; Summer of Code from Google's current "about" page.
- **The Open Source AI Definition's list of endorsers and the FSF's later (2025) position.** Not fetched.
- **Octoverse figures for open source alone.** GitHub's 2024 and 2025 headline figures mix public, private and open source
  activity; only those are in the data, with a note.
- **DevOps as a term ("devopsdays gave the movement its name", Patrick Debois's own account).** The devopsdays page says only
  that the first event was in Ghent in 2009. The naming is not claimed.
- **The year CruiseControl was first released by Thoughtworks.** Only the SourceForge registration date (2001-03-23) is sourced.
- **The start date of Ward Cunningham's Smallest Federated Wiki.** github.com and api.github.com returned 403; the ReadMe is
  undated, so the fact is dated to the year it was read (2026) and says so.
- **JUnit's original (1997) licence.** Only the current JUnit 4 licence file (Eclipse Public License 1.0) was read.
- **Martin Fowler on open source in the current "The New Methodology".** The section exists only in the original July 2000
  version, which Fowler republishes; that is what is quoted.

## In the data, but from a second-best source (each fact's note says so)

- **Steve Ballmer, Chicago Sun-Times, 1 June 2001.** The interview could not be read (suntimes.com 404, Internet Archive
  unreachable). Quoted from The Register, 2 June 2001.
- **Ballmer in 2016 (Reuters).** reuters.com returns 401. Read as carried by The Star (Malaysia), first two paragraphs only;
  "right for the time" is Reuters's paraphrase, only "in the rearview mirror" is quoted speech.
- **Brad Smith, 2020.** The Verge's report only; it says "a recent MIT event" and does not name CSAIL. No recording or
  transcript was checked.
- **"Microsoft loves Linux", 20 October 2014.** No Microsoft transcript or release with the phrase was found. Sourced from The
  Register and PCWorld (reporters at the event) and from Microsoft's own Windows Server blog of 6 May 2015.
- **Jim Allchin, February 2001.** Bloomberg News report as carried by CNET; no transcript.
- **IBM's $1 billion (Gerstner, December 2000).** CNET report; no IBM transcript found.
- **Microsoft's acknowledgement of the Halloween memorandum.** Only Eric Raymond's own statement that Microsoft admitted it
  (recorded as "paraphrase"); no Microsoft statement from 1998 was found.
- **The Halloween memorandum itself.** Read in Raymond's annotated copy; Microsoft never published it.
- **Netscape's press release of 22 January 1998.** Read as reproduced in full by Mitchell Baker in 2008 (and its first
  paragraph as forwarded to the Linux kernel list on the day); the netscape.com original is only in the Internet Archive.
- **O'Reilly's summit press release (April 1998).** oreilly.com returns 403; read from Linux Gazette issue 28's reprint.
- **HashiCorp's own announcement of the Business Source License (10 August 2023).** hashicorp.com returned 429 on every
  attempt. The change is sourced from the OpenTofu manifesto (the objectors' words) and the Linux Foundation's release.
- **Sun's own press release on Java and the GPL (November 2006).** Gone; sourced from the FSF's release of 15 November 2006.
- **Get the Facts (2004).** eWeek report; no Microsoft release found.
- **The Cyber Resilience Act's text.** EUR-Lex returns a 202 challenge page; the Commission's two explanatory pages are used.
- **Log4Shell.** The CISA statement returns 403; Apache's own security page is used, which has no disclosure date.
- **SHARE's library and IBM distributing source.** Wikipedia only (one fact).
- **Linus Torvalds's 25 August 1991 post.** Read in a compilation of the Usenet posts hosted at Carnegie Mellon University.
- **Bill Gates's Open Letter.** Read in the Wikisource transcription.

## Hosts that blocked or failed

web.archive.org (no connection), https://www.gnu.org and https://gnu.org (no connection; http://www.gnu.org works, with
occasional 503 that clears on retry), www.catb.org (no connection or 503; http://catb.org works), lore.kernel.org (Anubis
challenge), lists.debian.org (proof-of-work challenge), github.com and api.github.com (403; raw.githubusercontent.com works),
www.oreilly.com/pub/pr (403; the openbook pages work), reuters.com (401), hashicorp.com (429), eur-lex.europa.eu (202
challenge), cisa.gov (403), groklaw.net (403), law.justia.com (403), eweek.com (403 on a second article), money.cnn.com (503;
fortune.com works), tech-insider.org (410), marc.info for one message (410), isc.sans.edu (locked out), diswww.mit.edu and
pcper.com (no connection), suntimes.com old article address (404), en.wikipedia.org and en.wikisource.org (429 when fetched
in parallel; fine one at a time), bell-labs.com (410; the Ritchie pages now live on nokia.com).
