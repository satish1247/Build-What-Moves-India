# Nikaas — check your PF claim before you file it

**An independent hackathon prototype for Build What Moves India.**
Not affiliated with, endorsed by, or connected to EPFO or the Government of India.
Every member record, balance and claim number in this build is synthetic.

---

## The problem

In FY 2024-25, EPF members filed roughly **796 lakh claims. About 174 lakh were rejected** — a
22% rejection rate, and the five-year average is around 26%. That is on the order of
**1.74 crore people refused their own savings in a single year.**

The rejections are not mysterious. They cluster on a small, well-known set of causes:

- the name on the UAN does not match Aadhaar, character for character
- date of birth does not match Aadhaar
- the bank account is unverified, or held in a slightly different name
- the previous employer never marked the Date of Exit
- the member has more than one UAN
- old service was never transferred

Every one of those is **knowable before the member clicks submit**. But EPFO validates
*after* filing. So the member files blind, waits three weeks, receives a one-line remark
like *"Name not matching as per records"*, does not know who is supposed to fix it, and
very often re-files the identical broken claim.

## The idea

**Invert the order. Validate before filing, not after.**

Nikaas reads the same fields EPFO already holds, runs them against the rejection taxonomy,
and answers the only question that matters before you file:

> *Would this claim be rejected, and what exactly do I fix first?*

Three things make it more than a form checker:

1. **It assigns ownership.** Every finding says whether *you*, *your employer* or *EPFO*
   must fix it. This is the piece members never get. Telling someone to "try again" when
   the blocker is their ex-employer's exit-date entry wastes another three weeks.
2. **It ends in a document, never in advice.** Every dead end produces a ready-to-send
   letter — an exit-date request, a non-deposit complaint, a pre-filled EPFiGMS grievance.
3. **It runs the clock.** EPFO's Citizen's Charter promises settlement in 20 days. Nikaas
   counts, and the moment it breaches, it reframes the wait as a grievance and writes it.

## The complete citizen journey

| Step | What happens |
|---|---|
| Sign in | Mock UAN + OTP |
| Readiness scan | 12 rejection rules run; score out of 100; blockers ranked worst-first |
| Fix | Exact steps per finding, who owns it, how long it takes; tick items off and watch the score climb |
| Draft | Generated letters for employer-owned and EPFO-owned blockers |
| Understand the money | Passbook in plain language, with months the employer never deposited flagged in red |
| Pick the claim | Form 19 / 10C / 31, with eligibility reasoning and per-purpose advance limits |
| Before filing | Net amount after TDS, the avoidable tax loss, and whether auto-settlement applies |
| Track | Stage-by-stage timeline, 20-day charter clock |
| Escalate | On breach, a pre-filled grievance |
| Recover | For an already-rejected claim, the raw remark decoded into causes and fixes |

## Try it

Open the live link and use any demo login. **OTP for all accounts: `123456`.**

| UAN | Who | What it shows |
|---|---|---|
| `100200300400` | Priya | Would be rejected today. 3 blockers, and ₹47,200 of avoidable tax. |
| `100200300401` | Rakesh | Clean record — but EPFO is 6 days late, so the grievance path opens. |
| `100200300402` | Fatima | Already rejected once. Duplicate UAN and a DOB mismatch to unpick. |

## Designed for who actually uses this

- **Mobile-first**, 390px up. Large touch targets, high contrast, visible focus rings.
- **English and हिंदी** across every screen, including the generated findings.
- **Larger-text mode** and **read-aloud** for members with low vision or low literacy.
- **No images and no web fonts anywhere.** The whole app is under 100KB (31KB gzipped), so it opens on 2G.
- **Works fully offline** after first load via a service worker — the state many members
  are in when they finally sit down to sort this out.
- **Nothing leaves the device.** No backend, no analytics, no network calls at all.

## What is real and what is mocked

**Modelled on published rules:** the rejection taxonomy and EPFO's own rejection remarks;
Form 19 / 10C / 31 and their eligibility conditions; the two-month cooling period; the
10-year EPS threshold; advance purposes and limits from EPF Scheme 1952 (paras 68B–68N);
TDS under section 192A; the ₹5,00,000 auto-settlement ceiling and its conditions; the
20-day Citizen's Charter and the 15-day grievance escalation point.

**Mocked:** every member, balance, passbook row, claim ID and rejection remark. There is
no backend and no connection of any kind to EPFO — signing in matches a number against a
local file. Progress is saved only in your own browser.

**Simplified, and we say so in the app:** the EPS Table D figure and the advance caps are
approximations, not a substitute for EPFO's calculation. Generated letters are English-only.

## How this would work at real scale

- The scan needs **read-only** access to fields EPFO already holds — KYC status, exit date,
  UAN count, passbook months. It collects nothing new.
- **The rule taxonomy is the product.** It is a versioned list that EPFO staff could edit
  without shipping an app, so a newly common rejection reason becomes a pre-check the same
  week rather than the next release.
- The strongest version of this **is not a separate app at all.** It is this check running
  inside the EPFO portal, refusing to accept a claim that is certain to fail — which turns
  1.74 crore rejections into 1.74 crore corrections.
- Every draft is generated on-device, so no claim data needs to reach a third party.

## Running it locally

No build step, no dependencies.

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000
```

A service worker is registered, so serve over `http://` or `https://` rather than opening
the file directly.

## Code map

```
index.html            shell
assets/data.js        rejection taxonomy + synthetic members   (the substance)
assets/engine.js      scan, eligibility, forecast, TDS, charter clock, drafts (pure functions)
assets/i18n.js        English + Hindi, 185 keys, full parity
assets/app.js         views and events
assets/styles.css     mobile-first, light + dark
sw.js                 offline shell cache
```

`engine.js` is deliberately free of DOM and network code: it is the part that would be
pointed at a real read-only API, and it is testable on its own.

## Sources

EPFO Annual Report and Citizen's Charter; Ministry of Labour & Employment replies in
Parliament on claim rejection rates (FY 2023-24: 26%; FY 2024-25: ~22%, ~174 lakh of ~796
lakh claims); EPF Scheme 1952; EPS 1995 Table D; CBDT rules for TDS under section 192A.
