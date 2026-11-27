# Security and sustainability

The promise that many eyes make bugs shallow, and what happened when critical projects turned out to have very few eyes on them.

### May 1997: Raymond coined "Linus's Law": given enough eyeballs, all bugs are shallow.

Step 1. The promise: given enough eyeballs, all bugs are shallow.

> Or, less formally, ``Given enough eyeballs, all bugs are shallow.'' I dub this: ``Linus's Law''.

- Source (primary, document): [The Cathedral and the Bazaar: Release Early, Release Often](http://catb.org/~esr/writings/cathedral-bazaar/cathedral-bazaar/ar01s04.html), Eric S. Raymond (catb.org), published May 1997. Read 27 November 2026.
- Note: The wording and the name are Raymond's, not Torvalds's. Text read is version 3.0 of the essay.
- Connects: Eric S. Raymond, Linus Torvalds, The Cathedral and the Bazaar
- Fact id: `linuss-law-1997`

### 7 April 2014: In April 2014 the Heartbleed bug in the open source OpenSSL library exposed information protected by the encryption that secures much of the internet.

Step 2. Heartbleed: a serious flaw in a library the internet depends on.

> The Heartbleed Bug is a serious vulnerability in the popular OpenSSL cryptographic software library. This weakness allows stealing the information protected, under normal conditions, by the SSL/TLS encryption used to secure the Internet.

- Source (primary, report): [The Heartbleed Bug](https://heartbleed.com/), Codenomicon (heartbleed.com), published 2014. Read 27 November 2026.
- Note: The date is that of the fixed release: the same page says "OpenSSL 1.0.1g released on 7th of April 2014 fixes the bug."
- Connects: Heartbleed
- Fact id: `heartbleed-2014`

### 2014: The Linux Foundation founded the Core Infrastructure Initiative in response to Heartbleed, to fund critical open source projects.

Step 3. Industry funds critical projects in response.

> The Linux Foundation’s Core Infrastructure Initiative (CII), founded in response to the 2014 Heartbleed bug

- Source (primary, press-release): [Technology and Enterprise Leaders Combine Efforts to Improve Open Source Security](https://openssf.org/blog/2020/08/03/technology-and-enterprise-leaders-combine-efforts-to-improve-open-source-security/), Open Source Security Foundation (The Linux Foundation), published 3 August 2020. Read 27 November 2026.
- Note: Stated in the Linux Foundation's 2020 announcement of the Open Source Security Foundation; the original April 2014 press release is no longer at its address (404).
- Connects: The Linux Foundation, Open Source Security Foundation, Heartbleed
- Fact id: `core-infrastructure-initiative-2014`

### 3 August 2020: In August 2020 the Linux Foundation formed the Open Source Security Foundation, folding in the Core Infrastructure Initiative; Microsoft, Google, IBM, Red Hat and GitHub were among its founding board members.

Step 4. The effort is consolidated in the Open Source Security Foundation.

> It combines efforts from the Core Infrastructure Initiative, GitHub’s Open Source Security Coalition and other open source security work from founding governing board members GitHub, Google, IBM, JPMorgan Chase, Microsoft, NCC Group, OWASP Foundation and Red Hat, among others.

- Source (primary, press-release): [Technology and Enterprise Leaders Combine Efforts to Improve Open Source Security](https://openssf.org/blog/2020/08/03/technology-and-enterprise-leaders-combine-efforts-to-improve-open-source-security/), Open Source Security Foundation (The Linux Foundation), published 3 August 2020. Read 27 November 2026.
- Connects: The Linux Foundation, Open Source Security Foundation, GitHub, Google, IBM, Microsoft, Red Hat
- Fact id: `openssf-founded-2020`

### December 2021: The Log4Shell vulnerability (CVE-2021-44228) in the Apache Log4j logging library allowed attackers to run arbitrary code; Apache rates it 10.0, critical.

Step 5. Log4Shell: a critical flaw in a ubiquitous logging library.

> JNDI lookup can be exploited to execute arbitrary code loaded from an LDAP server

- Source (primary, report): [Apache Logging Services: Security (vulnerability reports)](https://logging.apache.org/security.html), The Apache Software Foundation. Read 27 November 2026.
- Note: From the Apache Logging Services security page, which lists the CVSS score as "10.0 CRITICAL" and credits Chen Zhaojun of Alibaba Cloud Security Team with the discovery. The page gives no disclosure date; December 2021 is from the CVE number and the wider record. The CISA statement returned 403.
- Connects: Apache Group and Apache Software Foundation, Log4Shell
- Fact id: `log4shell-2021`

### 29 March 2024: On 29 March 2024 Andres Freund reported to the oss-security list that the xz compression library had been backdoored upstream, in a way that compromised SSH servers.

Step 6. A deliberate backdoor is found in xz.

> The upstream xz repository and the xz tarballs have been backdoored.

- Source (primary, mailing-list): [backdoor in upstream xz/liblzma leading to ssh server compromise](https://www.openwall.com/lists/oss-security/2024/03/29/4), oss-security mailing list (Openwall), published 29 March 2024. Read 27 November 2026.
- Connects: Andres Freund, The xz backdoor
- Fact id: `xz-backdoor-2024`

### 10 December 2024: The European Union's Cyber Resilience Act entered into force on 10 December 2024, with its main obligations applying from 11 December 2027.

Step 7. The European Union legislates on software security.

> The CRA entered into force on 10 December 2024. The main obligations introduced by the Act will apply from 11 December 2027, with reporting obligations to apply as of 11 September 2026.

- Source (primary, document): [Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act), European Commission. Read 27 November 2026.
- Connects: European Union, Cyber Resilience Act (Regulation (EU) 2024/2847)
- Fact id: `cra-in-force-2024`

### 10 December 2024: The Act creates a new legal category, the open source software steward, for bodies that sustain open source products used commercially, under a lighter regime than manufacturers.

Step 8. The law gives open source foundations a defined role.

> the novel legal category of open-source software stewards is introduced. These are legal persons who provide support on a sustained basis for the development of such products which are intended for commercial activities, and who play a main role in ensuring their viability, and are subject to a light-touch and tailor-made regulatory regime.

- Source (primary, document): [The Cyber Resilience Act and open source](https://digital-strategy.ec.europa.eu/en/policies/cra-open-source), European Commission. Read 27 November 2026.
- Note: From the European Commission's explanatory page. The text of the Regulation on EUR-Lex returned a 202 challenge page and could not be read with the fetch tool.
- Connects: European Union, Cyber Resilience Act (Regulation (EU) 2024/2847)
- Fact id: `cra-open-source-stewards`


Other threads: [From shared software to free software to open source](https://open-source.history.sovereignweb.site/threads/free-software-to-open-source/), [The label, 1998](https://open-source.history.sovereignweb.site/threads/the-label-1998/), [The hostility](https://open-source.history.sovereignweb.site/threads/the-hostility/), [Corporate adoption](https://open-source.history.sovereignweb.site/threads/corporate-adoption/), [Microsoft and Linux: from "a cancer" to "Microsoft loves Linux"](https://open-source.history.sovereignweb.site/threads/microsoft-and-linux/), [Licences and relicensing](https://open-source.history.sovereignweb.site/threads/licences-and-relicensing/), [Where things stand](https://open-source.history.sovereignweb.site/threads/state-now/), [Where open source meets Agile](https://open-source.history.sovereignweb.site/threads/bridge-agile/).

---
The history of open source · https://open-source.history.sovereignweb.site/threads/security-and-sustainability/ · 149 facts, 87% from primary sources. Data: https://open-source.history.sovereignweb.site/data/facts.json
