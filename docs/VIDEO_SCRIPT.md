# Two-minute video script

Hard limit 2:00. Minute one demos the build as a citizen; minute two explains how it
was built and why. Both teammates may present — the natural split is one per minute.

Every number below was checked against the live build. Nothing here is described that
does not appear on screen.

---

## Before you hit record

1. Open the live link in a **private window**: https://satish1247.github.io/Build-What-Moves-India/
2. **Reset first.** Ticked fixes and filed claims are saved in your browser. If you
   have been clicking around, open **Help → Reset the demo**, or record in a fresh
   private window. Otherwise Priya starts at the wrong score.
3. Narrow the window to phone width (~400px). It is built mobile-first and looks
   best that way — and it shows judges you designed for phones.
4. Practise the click path twice. The talking is easier than the timing.

---

## Minute one — using it as a citizen

**0:00** *(comparison screen open)*
> "One in five EPF claims gets rejected. Last year that was one-point-seven-four
> crore people refused their own savings."

**0:08** *Scroll the comparison down two rows.*
> "This is the EPFO withdrawal journey today, on the left. Rebuilt, on the right."

**0:14** *Tap the Priya demo login (UAN 100200300400).*
> "Priya has four lakh seventy-two thousand rupees in her PF. Her readiness score is
> nineteen out of a hundred. If she filed today she'd be rejected — and she'd only
> find out in three weeks."

**0:28** *Tap **See what to fix**.*
> "Three things will reject her. And look who owns each one: the name mismatch is
> hers to fix. The missing exit date belongs to her ex-employer. No amount of
> re-filing will ever fix that — which is exactly what most people do."

**0:42** *Expand **Your name does not match your Aadhaar**.*
> "It shows the exact difference. Her UAN says Priya S. Her Aadhaar says Priya
> Sundaram. That one missing surname is the most common rejection reason in India."

**0:51** *Tap **Draft the message for me** on the employer blocker.*
> "So it writes the letter for her. Every dead end here ends in a document, not in
> advice to go contact someone."

**0:58** *Tap the three blocker checkboxes; the score turns green.*
> "Fixed — now she can file."

## Minute two — how it was built and why

**1:03** *Show `assets/data.js`, scroll the rules.*
> "The core is a rejection taxonomy. Eighteen rules, each with an owner, a realistic
> fix time, and EPFO's own rejection wording. I researched and extended it with
> Codex, from twelve rules to eighteen, grounded in EPFO's member FAQ and its
> claim-settlement SOP."

**1:18** *Show `assets/engine.js`.*
> "The engine is pure functions. No DOM, no network. That was deliberate — this is
> the part you'd point at a real read-only EPFO API, and it can be tested on its own."

**1:29** *Show the terminal with the test run.*
> "I drove the whole app in a headless browser. Sixty-five checks. They caught three
> real bugs, including one screen that told users they needed zero more years of
> service."

**1:40** *Switch to Rakesh (UAN 100200300401); the overdue claim is on the home screen.*
> "Rakesh did everything right. Clean record — and EPFO is still six days past its
> own twenty-day Citizen's Charter. So the app stops waiting and writes the
> grievance." *(tap **Draft my grievance**)*

**1:50** *Tap हिंदी, then A+.*
> "Bilingual throughout, read-aloud, thirty-one kilobytes gzipped, no images, works
> fully offline."

**1:56**
> "Every limitation is disclosed inside the app. And the strongest version of this
> isn't an app at all — it's this check running inside the EPFO portal, refusing a
> claim that is certain to fail."

---

## Numbers you can safely say

| Claim | Verified |
|---|---|
| ~1.74 crore of ~7.96 crore claims rejected, FY 2024-25 (22%) | Ministry of Labour figures |
| Priya's balance ₹4,72,000 | on screen |
| Readiness 19/100, 3 blockers, 3 warnings | on screen |
| "About 15 days to fix everything" | on screen |
| Priya S vs Priya Sundaram | on screen |
| Rakesh 26 days elapsed, 6 over the 20-day charter | on screen |
| 18 rules, 65 checks, 31KB gzipped | in the repo |

## Do not say

- **Do not** promise a tax saving in Priya's flow. The only claim she can file today
  is Form 10C at ₹44,700, which is under ₹50,000, so no TDS is shown. The tax
  feature is real but only visible on the contract worker's advance (₹11,860 at 10%).
  Skip it rather than describe something the reviewer will not see.
- **Do not** call this an EPFO product, or imply endorsement.
- **Do not** claim any government body has agreed to adopt it.
