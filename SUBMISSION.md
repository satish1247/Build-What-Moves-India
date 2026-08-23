# Build What Moves India — submission pack

Fill in the two bracketed fields before submitting.

- **Live link:** `[paste your deployed URL]`
- **Video link:** `[paste your Loom / YouTube unlisted link]`
- **Demo credentials:** UAN `100200300400`, `100200300401` or `100200300402` — OTP `123456` for all three
- **Partner's registered email:** `[partner's email, or leave blank if solo]`

---

## Project summary (238 words)

In FY 2024-25, EPF members filed about 796 lakh claims and roughly 174 lakh were rejected —
a 22% rejection rate, with a five-year average near 26%. That is on the order of 1.74 crore
people refused access to their own savings in one year.

The causes are not mysterious. Names that differ from Aadhaar by one character, unverified
bank accounts, an exit date the previous employer never marked, duplicate UANs. All of it is
knowable before the member clicks submit. But EPFO validates after filing, so members file
blind, wait three weeks, receive a one-line remark like "Name not matching as per records",
and often re-file the same broken claim.

Nikaas inverts that order. It scans the member's record against the rejection taxonomy
before filing and answers one question: would this be rejected, and what do I fix first?

Three things make it more than a form checker. It assigns ownership, telling you whether
you, your employer, or EPFO must fix each blocker — the piece members never get. It ends in
a document rather than advice, generating the exit-date request, the non-deposit complaint,
the pre-filled grievance. And it runs EPFO's own 20-day Citizen's Charter clock, reframing a
late claim as a grievance and writing it for you.

It is bilingual, readable aloud, under 100KB, and works fully offline. Nothing leaves the
device.

---

## Two-minute video script

### Minute one — using it as a citizen (0:00–1:00)

**0:00** — "In one year, EPFO rejected about 1.74 crore claims. Not fraud. Spelling
mistakes." *(open the live link on a phone-width window)*

**0:08** — Sign in as Priya, UAN `100200300400`, OTP `123456`.

**0:14** — "Priya has ₹4,72,000 sitting in her PF. Her readiness score is 19 out of 100. If
she filed today, she would be rejected — and she would only find that out in three weeks."

**0:24** — Tap **See what to fix**. "Three things will reject her. And notice who owns each
one: her name mismatch is hers to fix, but the missing exit date is her ex-employer's. No
amount of re-filing will fix that."

**0:38** — Expand the name mismatch. "It shows the exact difference: her UAN says Priya S,
her Aadhaar says Priya Sundaram. That single missing surname is the most common rejection
reason in the country."

**0:48** — Tap **Draft the message for me** on the employer blocker. "It writes the letter.
She sends it. This is the whole product philosophy — every dead end ends in a document, not
in advice."

**0:56** — Tick the three blockers. Score climbs to 85, then green. "Now she can file."

### Minute two — how it was built and why (1:00–2:00)

**1:00** — "The core is a rejection taxonomy — twelve rules, each with severity, an owner,
a realistic fix time, and EPFO's own rejection wording."

**1:10** — Show `engine.js`. "The engine is pure functions. No DOM, no network. That was
deliberate: this is the part you would point at a real read-only EPFO API, and it is
testable on its own. I drove the whole app in a headless browser — 46 checks — and it caught
three real bugs, including one that told users 'needs 0 more years of service'."

**1:26** — Show the money screen. "Two months where her employer deducted PF and never
deposited it. Members almost never notice. That money is recoverable."

**1:34** — Switch to Rakesh. "Clean record, and EPFO is still six days past its own 20-day
Citizen's Charter. So the product stops waiting and writes the grievance." *(tap Draft my
grievance)*

**1:44** — Toggle हिंदी, then A+. "Bilingual throughout, read-aloud, 31KB gzipped with no images
or web fonts, and it works fully offline — because that is the connection people actually have."

**1:52** — "Every limitation is disclosed in the app itself. And the strongest version of
this isn't an app at all — it's this check running inside the EPFO portal, refusing to
accept a claim that is certain to fail."

---

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
