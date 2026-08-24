/* End-to-end check for Nikaas.
   Serve the app first:  python3 -m http.server 8099
   Then:                 npm i playwright && node test/browser-check.mjs
   Drives all three personas through the full journey and asserts on what a
   reviewer would actually see. */

import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8099/';
const SHOT = process.env.SHOT_DIR || './shots';
const errors = [];
const log = [];
function ok(msg){ log.push('  PASS  ' + msg); }
function bad(msg){ log.push('  FAIL  ' + msg); errors.push(msg); }

const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

const click = async sel => {
  try { await page.locator(sel).first().click({ timeout: 6000 }); }
  catch (err) {
    console.log('\n!! click failed: ' + sel);
    console.log('   route text: ' + (await page.locator('#main').innerText()).slice(0, 300).replace(/\n/g,' | '));
    console.log('   available: ' + await page.evaluate(()=>[...new Set([...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act+':'+(e.dataset.route||e.dataset.uan||'')))].join(' ')));
    throw err;
  }
};
const txt = async () => (await page.locator('#main').innerText());
const has = async s => (await txt()).includes(s);

/* ---------- 1. login ---------- */
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
(await has('Check your PF claim before you file it')) ? ok('login screen renders') : bad('login screen missing');
await page.screenshot({ path: `${SHOT}/01-login.png`, fullPage: true });

/* bad UAN */
await page.fill('#uan', '999999999999'); await page.fill('#otp', '123456');
await click('[data-act="login"]');
(await has('not in the demo data')) ? ok('rejects unknown UAN') : bad('unknown UAN not rejected');
/* bad OTP */
await page.fill('#uan', '100200300400'); await page.fill('#otp', '000000');
await click('[data-act="login"]');
(await has('Incorrect OTP')) ? ok('rejects wrong OTP') : bad('wrong OTP not rejected');
/* good */
await page.fill('#otp', '123456');
await click('[data-act="login"]');
(await has('Namaste, Priya')) ? ok('real login works') : bad('login failed');
await click('[data-act="nav"][data-route="help"]');
await click('[data-act="logout"]');

/* ---------- 1b. the before/after comparison a reviewer sees first ---------- */
await click('[data-act="nav"][data-route="compare"]');
const cmp = await txt();
(await page.locator('.compare').count()) >= 10 ? ok('comparison lists the full journey') : bad('comparison too short');
/on the portal today/i.test(cmp) ? ok('shows the current portal column') : bad('no current-portal column');
cmp.includes('1.74 crore') ? ok('comparison states the outcome') : bad('no outcome stated');
cmp.includes('No screenshots, logos or code') ? ok('discloses no EPFO assets were used') : bad('missing asset disclosure');
await page.screenshot({ path: `${SHOT}/18-compare.png`, fullPage: true });
await click('[data-act="back"]');
(await has('Check your PF claim')) ? ok('back returns to sign-in') : bad('back from comparison broken');
await click('[data-act="demo"][data-uan="100200300400"]');

/* ---------- 2. home, blocked persona ---------- */
const home = await txt();
home.includes('would very likely be rejected') ? ok('home warns of rejection') : bad('no rejection warning');
home.includes('3 things will get you rejected') ? ok('3 blockers counted') : bad('blocker count wrong: ' + home.slice(0,200));
home.includes('₹4,72,000') ? ok('balance ₹4,72,000 shown') : bad('balance wrong');
const score = await page.locator('.dial b').innerText();
score === '19' ? ok('readiness score 19/100') : bad('score was ' + score);
await page.screenshot({ path: `${SHOT}/02-home-blocked.png`, fullPage: true });

/* ---------- 3. readiness + live re-scan ---------- */
await click('[data-act="nav"][data-route="readiness"]');
(await has('What stands between you and your money')) ? ok('readiness screen') : bad('readiness missing');
for (const r of ['Your name does not match your Aadhaar','Your bank account is not verified','Your employer has not marked your last working day','Your PAN is missing'])
  (await has(r)) ? ok('finding: ' + r) : bad('missing finding: ' + r);
(await has('Your UAN says "Priya S". Your Aadhaar says "Priya Sundaram".')) ? ok('name mismatch detail is specific') : bad('no mismatch detail');
await click('[data-act="toggle"][data-id="AADHAAR_NAME_MISMATCH"]');
(await has('Joint Declaration')) ? ok('fix steps expand') : bad('fix steps did not expand');
await page.screenshot({ path: `${SHOT}/03-readiness.png`, fullPage: true });

/* mark the three blockers fixed, score must climb to 100 / ready */
for (const id of ['AADHAAR_NAME_MISMATCH','BANK_UNVERIFIED','EXIT_DATE_MISSING']) {
  await click(`[data-act="fix"][data-id="${id}"]`);
}
(await has('Nothing is blocking you')) ? ok('clears to ready after fixes') : bad('did not clear to ready');
await click('[data-act="nav"][data-route="home"]');
const s2 = await page.locator('.dial b').innerText();
(+s2 > 19) ? ok(`score climbs 19 → ${s2} as fixes are ticked`) : bad('score did not move: ' + s2);
await page.screenshot({ path: `${SHOT}/04-home-fixed.png`, fullPage: true });

/* ---------- 4. persistence across reload ---------- */
await page.reload({ waitUntil: 'networkidle' });
const s3 = await page.locator('.dial b').innerText();
s3 === s2 ? ok('progress survives reload') : bad('progress lost on reload');

/* ---------- 5. draft generator ---------- */
await click('[data-act="nav"][data-route="readiness"]');
await click('[data-act="draft"][data-id="CONTRIBUTION_GAP"]');
const draft = await page.locator('#drafttext').inputValue();
(draft.includes('Feb 2026') && draft.includes('UAN 100200300400')) ? ok('employer letter names the exact months') : bad('draft wrong: ' + draft.slice(0,120));
await page.screenshot({ path: `${SHOT}/05-draft.png`, fullPage: true });

/* ---------- 6. money ---------- */
await click('[data-act="back"]');
await click('[data-act="nav"][data-route="money"]');
(await has('2 months with no deposit')) ? ok('flags employer non-deposit') : bad('no gap warning');
(await has('Nothing deposited')) ? ok('passbook marks empty months') : bad('passbook gap not marked');
await click('[data-act="nav"][data-route="money"][data-param="all"]');
const rows = await page.locator('.rows > div').count();
rows > 40 ? ok(`full passbook expands (${rows} rows)`) : bad('passbook did not expand: ' + rows);
await page.screenshot({ path: `${SHOT}/06-money.png`, fullPage: true });

/* ---------- 7. claims + eligibility reasoning ---------- */
await click('[data-act="nav"][data-route="claims"]');
const claims = await txt();
claims.includes('out of work for 2 full months') ? ok('explains the 2-month cooling period') : bad('no cooling-period reason');
claims.includes('Unlocks in') ? ok('shows exact unlock countdown') : bad('no countdown');
await page.screenshot({ path: `${SHOT}/07-claims.png`, fullPage: true });

/* ---------- 8. TDS trap on the file screen (Form 10C is filable) ---------- */
await click('[data-act="nav"][data-route="file"][data-param="FORM_10C"]').catch(()=>bad('no filable form for Priya'));
if (page.url()) {
  const f = await txt();
  f.includes('Auto-settlement conditions') ? ok('file screen shows auto-settlement conditions') : bad('no conditions list');
  await page.screenshot({ path: `${SHOT}/08-file.png`, fullPage: true });
  await click('[data-act="submitclaim"]');
  (await has('Claim submitted')) ? ok('claim files and enters tracking') : bad('claim did not file');
  (await has('Day 0 of 20')) ? ok('20-day charter clock starts') : bad('no charter clock');
  await page.screenshot({ path: `${SHOT}/09-tracking.png`, fullPage: true });
}

/* ---------- 9. Hindi ---------- */
await click('[data-act="lang"]');
(await has('दावे')) || (await has('निकास')) ? ok('Hindi renders') : bad('Hindi missing');
await click('[data-act="nav"][data-route="home"]');
await click('[data-act="nav"][data-route="readiness"]');
(await has('कैसे ठीक करें')) ? ok('Hindi on readiness screen') : bad('Hindi readiness missing');
const hd = await txt();
!/UAN says|Employer did not deposit|old PF account/.test(hd) ? ok('no English leaks into Hindi details') : bad('English detail leaked into Hindi: ' + (hd.match(/UAN says.*|Employer did not deposit.*/)||[''])[0]);
await page.screenshot({ path: `${SHOT}/10-hindi.png`, fullPage: true });
await click('[data-act="lang"]');

/* ---------- 10. rejected persona + grievance ---------- */
await click('[data-act="nav"][data-route="help"]');
await click('[data-act="logout"]');
await click('[data-act="demo"][data-uan="100200300402"]');
(await has('Namaste, Fatima')) ? ok('switches persona') : bad('persona switch failed');
const fh = await txt();
fh.includes('Rejected') ? ok('shows the rejected claim') : bad('rejected claim missing');
fh.includes('Name not matching as per records') ? ok('surfaces the raw EPFO remark') : bad('remark missing');
await page.screenshot({ path: `${SHOT}/11-rejected.png`, fullPage: true });
await click('[data-act="nav"][data-route="readiness"]');
(await has('You have more than one UAN')) ? ok('detects duplicate UAN') : bad('duplicate UAN not detected');
(await has('Only EPFO can do these')) ? ok('EPFO-owned group shown when one applies') : bad('EPFO group missing for duplicate UAN');
await page.screenshot({ path: `${SHOT}/12-rejected-fixes.png`, fullPage: true });

/* ---------- 11. clean persona ---------- */
await click('[data-act="nav"][data-route="help"]');
await click('[data-act="logout"]');
await click('[data-act="demo"][data-uan="100200300401"]');
(await has('Your record is clean')) ? ok('clean persona reads as ready') : bad('clean persona wrong');
await click('[data-act="nav"][data-route="claims"]');
(await has('Advance while working')) ? ok('offers Form 31 advance') : bad('no advance option');
const cl = await txt();
(await has('Only after you leave the job')) ? ok('ineligible purpose explains the real reason') : bad('bad purpose reason');
!cl.includes('Needs 0 more years') ? ok('never says "needs 0 more years"') : bad('still renders "needs 0 more years"');
/* a genuinely short-service member must still see the shortfall */
const shortfall = await page.evaluate(async () => {
  const E = await import('./assets/engine.js');
  const m = JSON.parse(JSON.stringify((await import('./assets/data.js')).MEMBERS['100200300400']));
  m.employment.status = 'employed';
  return E.eligibility(m).find(x=>x.form==='FORM_31').purposes.filter(p=>p.shortByMonths>0).map(p=>p.id);
});
shortfall.length ? ok('shortfall still computed for short service: ' + shortfall.join(',')) : bad('shortfall never computed');
await page.screenshot({ path: `${SHOT}/13-ready-claims.png`, fullPage: true });

/* ---- overdue claim -> charter breach -> generated grievance ---- */
await click('[data-act="nav"][data-route="home"]');
const od = await txt();
od.includes('days over the promised 20') ? ok('detects Citizen\'s Charter breach') : bad('breach not detected');
od.includes('EPFO is late') ? ok('names EPFO as late') : bad('no late callout');
await page.screenshot({ path: `${SHOT}/14-overdue.png`, fullPage: true });
await click('[data-act="grievance"]');
const g = await page.locator('#drafttext').inputValue();
(g.includes('RJ/JPR/0044907/2026') && g.includes('Citizen') && g.includes('Days elapsed: 26'))
  ? ok('grievance draft is pre-filled and cites the charter') : bad('grievance draft wrong: ' + g.slice(0,150));
await page.screenshot({ path: `${SHOT}/15-grievance.png`, fullPage: true });

/* ---------- 11b. fourth persona: informal-sector worker ---------- */
await click('[data-act="nav"][data-route="help"]');
await click('[data-act="logout"]');
await click('[data-act="demo"][data-uan="100200300403"]');
(await has('Namaste')) ? ok('fourth persona signs in') : bad('fourth persona login failed');
await click('[data-act="nav"][data-route="readiness"]');
const cw = await txt();
for (const r of ['Your name does not match your Aadhaar',
                 'An old PF account was never transferred',
                 'Your employer skipped some months'])
  cw.includes(r) ? ok('contract worker: ' + r) : bad('contract worker missing: ' + r);
/* grouping by owner is the point of the screen - all three headings must be real */
for (const g of ['Start here', 'Only your employer can do these'])
  cw.includes(g) ? ok('fix list grouped: ' + g) : bad('missing group: ' + g);
/* this persona has no EPFO-owned finding, so that group must NOT be rendered */
!cw.includes('Only EPFO can do these') ? ok('empty owner group is hidden') : bad('empty EPFO group rendered');
cw.includes('run in parallel') ? ok('plan explains parallel fixes') : bad('no parallel-fix explanation');
await page.screenshot({ path: `${SHOT}/16-contract-worker.png`, fullPage: true });

/* ---------- 11c. the six Codex-added rules render in both languages ---------- */
const newRules = ['PARENT_NAME_MISMATCH','GENDER_MISMATCH','DATE_OF_JOINING_MISSING',
                  'EXIT_REASON_INVALID','BANK_KYC_CHANGE_PENDING','KYC_CONFLICT_ACROSS_UANS'];
const ruleAudit = await page.evaluate(async ids => {
  const D = await import('./assets/data.js');
  const I = await import('./assets/i18n.js');
  const en = I.makeT('en'), hi = I.makeT('hi');
  const out = { missing: [], unlabelled: [], noSteps: [] };
  for (const id of ids) {
    const r = D.REJECTION_RULES.find(x => x.id === id);
    if (!r) { out.missing.push(id); continue; }
    if (en('rule.' + id) === 'rule.' + id || hi('rule.' + id) === 'rule.' + id) out.unlabelled.push(id);
    if (!r.fix?.steps?.length || !r.fix?.note) out.noSteps.push(id);
  }
  return out;
}, newRules);
!ruleAudit.missing.length   ? ok('all six new rules present') : bad('missing rules: ' + ruleAudit.missing);
!ruleAudit.unlabelled.length? ok('all six labelled in EN and HI') : bad('unlabelled: ' + ruleAudit.unlabelled);
!ruleAudit.noSteps.length   ? ok('all six carry fix steps and a note') : bad('no fix steps: ' + ruleAudit.noSteps);

/* ---------- 11d. bilingual drafts ---------- */
await click('[data-act="draft"][data-id="CONTRIBUTION_GAP"]');
const enDraft = await page.locator('#drafttext').inputValue();
await click('[data-act="draftlang"][data-lang="hi"]');
const hiDraft = await page.locator('#drafttext').inputValue();
/[\u0900-\u097F]/.test(hiDraft) ? ok('draft switches to Hindi') : bad('Hindi draft not produced');
(hiDraft !== enDraft && hiDraft.includes('UAN')) ? ok('Hindi draft keeps the UAN reference') : bad('Hindi draft malformed');
await click('[data-act="draftlang"][data-lang="en"]');
(await page.locator('#drafttext').inputValue()) === enDraft ? ok('draft toggles back to English') : bad('English draft not restored');
await page.screenshot({ path: `${SHOT}/17-hindi-draft.png`, fullPage: true });
await click('[data-act="back"]');

/* ---------- 12. a11y-ish + offline ---------- */
const noAlt = await page.locator('img:not([alt])').count();
noAlt === 0 ? ok('no unlabelled images') : bad('images without alt: ' + noAlt);
const swReady = await page.evaluate(() => navigator.serviceWorker.getRegistration().then(r => !!r));
swReady ? ok('service worker registered (offline capable)') : bad('service worker not registered');
await ctx.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' }).catch(()=>{});
(await has('Namaste')) ? ok('app still loads fully offline') : bad('offline load failed');
await ctx.setOffline(false);

console.log(log.join('\n'));
console.log('\n=== ' + (errors.length ? errors.length + ' PROBLEM(S)' : 'ALL CHECKS PASSED') + ' ===');
if (errors.length) console.log(errors.join('\n'));
await browser.close();
process.exit(errors.length ? 1 : 0);
