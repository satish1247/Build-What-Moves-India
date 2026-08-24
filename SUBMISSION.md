# Build What Moves India — submission pack

Fill in the two bracketed fields before submitting.

- **Live link:** https://satish1247.github.io/Build-What-Moves-India/  ← confirm this opens in a private window before submitting
- **Video link:** `[paste your Loom / YouTube unlisted link]`
- **Demo credentials:** UAN `100200300400`, `100200300401` or `100200300402` — OTP `123456` for all three
- **Partner's registered email:** `[partner's email, or leave blank if solo]`

---

## Project summary (232 words)

We rebuilt the EPFO member portal's withdrawal journey — the one about 30 crore
subscribers use to get their own provident fund out.

In FY 2024-25 members filed roughly 796 lakh claims and about 174 lakh were
rejected: a 22% rejection rate, five-year average near 26%. On the order of 1.74
crore people refused access to their own savings in one year.

The portal's real defect is not that it looks dated. It is that it accepts a claim
it already knows will fail. Names differing from Aadhaar by one character,
unverified bank accounts, an exit date the previous employer never marked — all
knowable before submit. But EPFO validates after filing, so members wait three
weeks, get a one-line remark like "Name not matching as per records", and often
re-file the same broken claim.

So we moved the check to before the claim instead of after it. An 18-rule scan
runs first and answers one question: would this be rejected, and what do I fix?

Three things make it more than a form checker. It says whether you, your employer,
or EPFO must fix each blocker — the piece members never get. It ends in a
document, not advice: the exit-date request, the non-deposit complaint, the
pre-filled grievance. And it runs EPFO's own 20-day Citizen's Charter clock,
reframing a late claim as a grievance and writing it.

Bilingual, readable aloud, under 100KB, works offline.

---

## How Codex contributed

Codex extended the core of this build — the rejection taxonomy that decides whether a claim
would be rejected.

- **Six new pre-check rules** in `assets/data.js`, taking the taxonomy from 12 to 18:
  `PARENT_NAME_MISMATCH`, `GENDER_MISMATCH`, `DATE_OF_JOINING_MISSING`, `EXIT_REASON_INVALID`,
  `BANK_KYC_CHANGE_PENDING` and `KYC_CONFLICT_ACROSS_UANS`. Each carries an owner, a realistic
  fix time, EPFO's own rejection wording, a test, and repair steps. Codex grounded the wording
  in EPFO's published member FAQ and its claim-settlement SOP.
- **Bilingual strings** for all of it in `assets/i18n.js`, keeping English/Hindi key parity.
- **A fourth persona** (`100200300403`): a contract worker across three employers, each
  recording a different name, with two untransferred accounts and six consecutive months of
  missing employer deposits.
- **Hindi versions of the generated letters and grievance** in `assets/engine.js`, with a
  language toggle on the draft screen — closing a limitation the app had previously disclosed.

Every change was verified against the project's existing browser suite before it was accepted.

## Two-minute video script

The full shot-by-shot script, with timings and the verified on-screen numbers, is in
[`docs/VIDEO_SCRIPT.md`](docs/VIDEO_SCRIPT.md).

## Judging criteria, mapped

| Criterion | Where it shows |
|---|---|
| **Problem** | ~174 lakh rejections in FY 2024-25, sourced; causes named specifically |
| **Working build** | Full journey start to finish; 46 automated browser checks; three personas in different real states |
| **Usability** | Mobile-first, bilingual, read-aloud, larger text, under 100KB, offline |
| **Product thinking** | Ownership assignment; drafts instead of advice; the charter clock; TDS trap surfaced before filing |
| **End-to-end thinking** | Read-only data need; editable rule taxonomy as the real artefact; the argument that this belongs inside the portal |
| **Honesty** | In-app "what is real and what is mocked" screen listing every simplification, including English-only drafts |

## Pre-submission checklist

- [ ] Deploy and confirm the link opens in a browser with no sign-in wall
- [ ] Test all three demo logins on the deployed URL
- [ ] Record the video (2:00 maximum)
- [ ] Confirm the summary is under 250 words
- [ ] Both teammates registered, each entering the other's registered email
- [ ] Submit before **28 August 2026, 8:00 PM IST** — no grace period
