# Making Codex a real part of this build

The rules require Codex to be meaningfully involved, and your submission must explain how it
contributed. **Codex is free on the ChatGPT Free plan** — no paid membership, no card. Free-tier
usage is capped on a rolling window, so this file exists to make sure those tokens go into real
work rather than exploring the codebase.

Do not fake this. Do the pass, then write down what actually happened.

## Setup

```bash
npm install -g @openai/codex
cd /path/to/-Build-What-Moves-India
codex
```

Sign in with **ChatGPT** (not an API key) when prompted — that is the free route. An API key
would bill per token instead.

Serve the app in a second terminal so you can see your changes:

```bash
python3 -m http.server 8000
```

## Why not call an OpenAI model at runtime instead

The brief says "built with Codex **or** powered by an OpenAI model", so a live model call is a
second route in principle. Do not take it here: this is a static site with no backend, so any
API key would ship inside the page for anyone to read and spend. Building *with* Codex is both
compliant and safe. Leave runtime AI out.

## Three tasks, in priority order

Paste these one at a time. Each is scoped to be finishable within free-tier limits, and each
makes the submission genuinely stronger. Task 1 alone is enough to claim meaningful involvement.

---

### Task 1 — extend the rejection taxonomy (highest value)

> Read `assets/data.js` and `assets/engine.js` to understand the `REJECTION_RULES` structure.
> Research and add 5–8 more real EPF claim rejection reasons that are not already covered.
> Follow the existing rule shape exactly: `id`, `severity`, `owner`, `etaDays`, `epfoRemark`,
> `test`, optional `detail`, and `fix` with `steps` and `note`. Add matching entries to
> `rule` in BOTH the `en` and `hi` blocks of `assets/i18n.js`, and any new `detail.*` strings
> in both languages. Do not break key parity between the two languages. Then update the three
> synthetic members in `assets/data.js` so at least two of the new rules actually fire for
> someone, and tell me which personas changed.

This matters because the taxonomy *is* the product. A richer rule set is the single biggest
quality improvement available, and it is exactly the kind of research-plus-structured-editing
work Codex is good at.

---

### Task 2 — a fourth persona: the informal-sector worker

> Add a fourth demo member to `MEMBERS` in `assets/data.js`, UAN `100200300403`, OTP `123456`.
> Profile: a contract worker whose employer changed three times in four years, with two
> untransferred accounts, a contribution gap spanning six months, and a name recorded
> differently by each employer. Wire them into the demo list on the login screen in
> `assets/app.js` with an appropriate label added to both languages in `assets/i18n.js`.
> Then run `node test/browser-check.mjs` (with the app served on port 8099) and fix anything
> it catches.

This covers the members who are hurt worst by the current system and are least likely to be
represented in a hackathon demo.

---

### Task 3 — regional-language drafts

> The generated letters in `draftEmployerRequest` and `draftGrievance` in `assets/engine.js`
> are English-only, which is disclosed as a limitation in the Help screen. Make them respect
> the selected language by adding Hindi versions, keeping the English version available since
> HR desks often prefer it. Offer both in the draft screen with a toggle. Update the honesty
> note in `assets/i18n.js` so it no longer claims drafts are English-only.

This closes the one limitation the app currently admits to.

---

## After the pass

1. Run the checks: serve on 8099, then `node test/browser-check.mjs`. All must pass.
2. Confirm language parity did not break:
   ```bash
   node --input-type=module -e "
   import('./assets/i18n.js').then(m=>{
     const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'&&!Array.isArray(v)?flat(v,p+k+'.'):[p+k]);
     const a=flat(m.STRINGS.en), b=new Set(flat(m.STRINGS.hi));
     console.log('missing in HI:', a.filter(k=>!b.has(k)).join(',')||'none');
   });"
   ```
3. Commit with a message that says what Codex did.
4. Fill in the Codex disclosure in `SUBMISSION.md` — **write what actually happened**, naming
   the specific files and rules it produced. A concrete, modest, true answer reads far better
   to a judge than a vague grand one.
5. Record the video last, so it shows the final build.
