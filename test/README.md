# Browser checks

`browser-check.mjs` drives the real app in headless Chromium through every screen and
all three demo personas, and asserts on what a reviewer would actually see — scores,
rupee amounts, rejection remarks, the charter clock, Hindi rendering, offline load.

```bash
python3 -m http.server 8099 &
npm install playwright
node test/browser-check.mjs
```

61 checks, covering all four personas, the 18-rule taxonomy, owner grouping and the bilingual drafts. It is not decoration: writing it caught three real defects during the build —
a mark-done control buried inside a collapsed section, a navigation dead end that stranded
users on the readiness screen once they were ready, and a label that read
"Needs 0 more years of service".
