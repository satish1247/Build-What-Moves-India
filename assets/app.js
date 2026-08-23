/* =========================================================================
   Nikaas — application shell and views.
   Vanilla ES modules. No framework, no build step, no network calls.
   ========================================================================= */

import { MEMBERS, CLAIM_STAGES, RULES_META, fmtDate, daysAgo, daysBetween } from './data.js';
import { scan, eligibility, forecast, tds, charterClock,
         draftEmployerRequest, draftGrievance } from './engine.js';
import { makeT } from './i18n.js';

/* ---------------- state ---------------- */
const SAVE_KEY = 'nikaas.v1';
const state = {
  lang: 'en',
  bigText: false,
  uan: null,
  route: 'login',
  param: null,
  fixed: {},          // uan -> [ruleId]
  claims: {},         // uan -> [claim]
  open: {},           // findingId -> bool
  toast: null
};

function load () {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch { /* private mode, first run — defaults are fine */ }
}
function save () {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      lang: state.lang, bigText: state.bigText, uan: state.uan,
      fixed: state.fixed, claims: state.claims
    }));
  } catch { /* storage blocked — the app still works for this session */ }
}

let t = makeT(state.lang);

/* ---------------- small helpers ---------------- */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const money = n => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(Math.round(n || 0));

function member () { return state.uan ? MEMBERS[state.uan] : null; }
function fixedSet () { return new Set(state.fixed[state.uan] || []); }
function myClaims () {
  const seeded = member() ? member().claims : [];
  return [...(state.claims[state.uan] || []), ...seeded];
}

/* Re-run the scan, treating anything the member has ticked off as resolved.
   This is what makes the readiness score move while you work through the list. */
function liveScan (formId = null) {
  const m = member();
  const raw = scan(m, formId);
  const done = fixedSet();
  const findings = raw.findings.filter(f => !done.has(f.id));
  const blockers = findings.filter(f => f.severity === 'blocker');
  const warnings = findings.filter(f => f.severity === 'warning');
  return {
    findings, blockers, warnings,
    all: raw.findings,
    ready: blockers.length === 0,
    score: Math.max(5, Math.min(100, 100 - blockers.length * 22 - warnings.length * 5)),
    fixDays: blockers.length ? Math.max(...blockers.map(b => b.etaDays)) : 0
  };
}

function go (route, param = null) {
  state.route = route; state.param = param;
  window.scrollTo(0, 0);
  render();
}

function toast (msg) {
  state.toast = msg;
  render();
  setTimeout(() => { state.toast = null; render(); }, 1800);
}

/* ---------------- speech ---------------- */
let speaking = false;
function readAloud () {
  if (!('speechSynthesis' in window)) { toast('Not supported on this browser'); return; }
  if (speaking) { speechSynthesis.cancel(); speaking = false; render(); return; }
  const main = document.getElementById('main');
  const text = main ? main.innerText.slice(0, 4000) : '';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = state.lang === 'hi' ? 'hi-IN' : 'en-IN';
  u.rate = 0.95;
  u.onend = () => { speaking = false; render(); };
  speaking = true;
  speechSynthesis.speak(u);
  render();
}

/* ---------------- views ---------------- */

function viewLogin () {
  const demos = [
    ['100200300400', t('demoBlocked')],
    ['100200300401', t('demoReady')],
    ['100200300402', t('demoRejected')],
    ['100200300403', t('demoContract')]
  ];
  return `
    <h1>${esc(t('loginTitle'))}</h1>
    <p class="lede">${esc(t('loginSub'))}</p>

    <div class="card">
      <label for="uan">${esc(t('uanLabel'))}</label>
      <input id="uan" type="tel" inputmode="numeric" maxlength="12"
             autocomplete="off" value="${esc(state.param?.uan || '')}"
             aria-describedby="uanhint">
      <p id="uanhint" class="tiny">${esc(t('uanHint'))}</p>

      <label for="otp">${esc(t('otpLabel'))}</label>
      <input id="otp" type="tel" inputmode="numeric" maxlength="6" autocomplete="one-time-code">
      <p class="tiny">${esc(t('otpHint'))}</p>

      <div id="loginerr"></div>
      <div style="margin-top:14px">
        <button class="btn" data-act="login">${esc(t('verify'))}</button>
      </div>
    </div>

    <h2>${esc(t('demoTitle'))}</h2>
    ${demos.map(([u, label]) => `
      <button class="demo-btn" data-act="demo" data-uan="${u}">
        <b>${esc(MEMBERS[u].profile.nameOnUan)} · ${u}</b>
        <span>${esc(label)}</span>
      </button>`).join('')}
    <p class="tiny">${esc(t('demoOtp'))}</p>
  `;
}

function viewHome () {
  const m = member();
  const s = liveScan();
  const p = m.passbook;
  const total = p.employeeShare + p.employerShare;
  const cls = s.score >= 85 ? 'good' : s.score >= 50 ? 'mid' : 'bad';
  const openClaims = myClaims();

  return `
    <h1>${esc(t('greeting'))}, ${esc(m.profile.nameOnUan.split(' ')[0])}</h1>
    <p class="muted">UAN ${esc(m.uan)} · ${esc(m.profile.city)}</p>

    <div class="card">
      <div class="split"><h3>${esc(t('yourMoney'))}</h3></div>
      <div class="amount">${money(total)}</div>
      <p class="tiny">${esc(t('yourShare'))} ${money(p.employeeShare)} · ${esc(t('employerShare'))} ${money(p.employerShare)}</p>
    </div>

    <div class="card">
      <div class="gauge">
        <div class="dial ${cls}" style="--v:${s.score}" role="img"
             aria-label="${esc(t('readinessTitle'))} ${s.score} ${esc(t('scoreOf'))}">
          <div><b>${s.score}</b><span>${esc(t('scoreOf'))}</span></div>
        </div>
        <div>
          <h3>${esc(t('readinessTitle'))}</h3>
          <span class="chip ${s.ready ? 'good' : 'blocker'}">${esc(s.ready ? t('readyNow') : t('notReadyNow'))}</span>
          <p style="margin-top:8px">${esc(s.ready ? t('wouldBeAccepted') : t('wouldBeRejected'))}</p>
        </div>
      </div>

      ${s.blockers.length ? `<div class="callout danger"><b>${esc(t('blockersCount', s.blockers.length))}</b></div>` : ''}
      ${s.warnings.length ? `<div class="callout warn">${esc(t('warningsCount', s.warnings.length))}</div>` : ''}
      ${s.fixDays ? `<p class="tiny"><span class="strong">${esc(t('fixTime', s.fixDays))}.</span> ${esc(t('fixTimeNote'))}</p>` : ''}

      <div style="margin-top:12px">
        ${s.ready
          ? `<button class="btn" data-act="nav" data-route="claims">${esc(t('startClaim'))}</button>
             <button class="btn ghost" data-act="nav" data-route="readiness">${esc(t('viewPlan'))}</button>`
          : `<button class="btn" data-act="nav" data-route="readiness">${esc(t('seeWhat'))}</button>`}
      </div>
    </div>

    ${openClaims.length ? `
      <h2>${esc(t('trackHead'))}</h2>
      ${openClaims.map(claimCard).join('')}` : ''}
  `;
}

function viewReadiness () {
  const s = liveScan();
  const done = fixedSet();

  /* Group by who can actually act. A flat list of a dozen findings tells a
     worried person nothing about what to do first, and the three owners work
     in parallel — so the honest shape of the screen is three short lists,
     led by the one they can start on today. */
  const groups = [
    ['member',   'groupMember',   'groupMemberNote'],
    ['employer', 'groupEmployer', 'groupEmployerNote'],
    ['epfo',     'groupEpfo',     'groupEpfoNote']
  ].map(([owner, head, note]) => {
    const items = s.all.filter(f => f.owner === owner);
    const live = items.filter(f => !done.has(f.id));
    return {
      owner, head, note, items,
      blockers: live.filter(f => f.severity === 'blocker').length,
      warnings: live.filter(f => f.severity === 'warning').length
    };
  }).filter(g => g.items.length);

  return `
    <h1>${esc(t('readinessHead'))}</h1>

    ${s.ready
      ? `<div class="callout good"><b>${esc(t('allClear'))}</b></div>
         <button class="btn" data-act="nav" data-route="claims">${esc(t('startClaim'))}</button>`
      : `<div class="callout info">
           <b>${esc(t('planHead'))}</b>
           <p style="margin:6px 0 0">${esc(t('planBody', s.findings.length, s.fixDays))}</p>
         </div>`}

    ${groups.map(g => `
      <section>
        <div class="split" style="margin:22px 0 2px">
          <h2 style="margin:0">${esc(t(g.head))}</h2>
          ${g.blockers || g.warnings
            ? `<span class="chip ${g.blockers ? 'blocker' : 'warning'}">${esc(t('groupCount', g.blockers, g.warnings))}</span>`
            : `<span class="chip good">${esc(t('markedFixed'))}</span>`}
        </div>
        <p class="tiny">${esc(t(g.note))}</p>
        ${g.items.map(f => findingCard(f, done.has(f.id))).join('')}
      </section>`).join('')}
  `;
}

function findingCard (f, isDone) {
  const m = member();
  const ownerKey = { member: 'ownerMember', employer: 'ownerEmployer', epfo: 'ownerEpfo' }[f.owner];
  const open = !!state.open[f.id];
  const draft = draftEmployerRequest(m, f.id);

  return `
    <div class="card finding ${isDone ? 'done' : f.severity}">
      <div class="finding-head">
        <h3>${esc(t('rule.' + f.id))}</h3>
        <button class="tick ${isDone ? 'on' : ''}" data-act="fix" data-id="${esc(f.id)}"
                aria-pressed="${isDone}" title="${esc(isDone ? t('markedFixed') : t('markFixed'))}">
          <span aria-hidden="true">${isDone ? '☑' : '☐'}</span>
          <span class="sr-only">${esc(isDone ? t('markedFixed') : t('markFixed'))}</span>
        </button>
      </div>
      <p class="tiny">
        <span class="chip ${isDone ? 'good' : f.severity}">
          ${esc(isDone ? t('markedFixed') : f.severity === 'blocker' ? t('blockerLabel') : t('warningLabel'))}
        </span>
        ${esc(t('takesAbout', f.etaDays))}
      </p>
      ${f.detail ? `<p class="muted" style="font-size:.86rem">${esc(t(f.detail[0], ...f.detail.slice(1)))}</p>` : ''}

      <button class="disclose" data-act="toggle" data-id="${esc(f.id)}"
              aria-expanded="${open}">${open ? '▾' : '▸'} ${esc(t('howToFix'))}</button>

      <div class="body ${open ? 'open' : ''}">
        <p class="tiny">${esc(t('epfoWouldSay'))}</p>
        <div class="quote">“${esc(f.epfoRemark)}”</div>
        <ol class="steps">${f.fix.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        <p class="tiny"><span class="strong">${esc(t('whyItMatters'))}:</span> ${esc(f.fix.note)}</p>
      </div>

      ${draft ? `<div class="btnrow" style="margin-top:10px">
        <button class="btn secondary sm" data-act="draft" data-id="${esc(f.id)}">${esc(t('draftMessage'))}</button>
      </div>` : ''}
    </div>`;
}

function viewMoney () {
  const m = member();
  const p = m.passbook;
  const total = p.employeeShare + p.employerShare;
  const showAll = state.param === 'all';
  const rows = showAll ? p.entries : p.entries.slice(0, 8);

  return `
    <h1>${esc(t('moneyHead'))}</h1>

    <div class="card">
      <div class="amount">${money(total)}</div>
      <p class="tiny">${esc(t('totalWithdrawable'))}</p>
      <div class="rows" style="margin-top:12px">
        <div><span>${esc(t('yourShare'))}</span><b>${money(p.employeeShare)}</b></div>
        <div><span>${esc(t('employerShare'))}</span><b>${money(p.employerShare)}</b></div>
        <div><span>${esc(t('interestYtd'))}</span><b>${money(p.interestYtd)}</b></div>
        <div><span>${esc(t('pensionShare'))}</span><b>${money(p.pensionShare)}</b></div>
      </div>
      <p class="tiny">${esc(t('pensionNote'))}</p>
    </div>

    ${p.missingMonths.length ? `
      <div class="card">
        <div class="callout danger">
          <b>${esc(t('gapWarnHead', p.missingMonths.length))}</b>
          <p style="margin:6px 0 0">${esc(t('gapWarnBody'))}</p>
        </div>
        <button class="btn secondary" data-act="draft" data-id="CONTRIBUTION_GAP">${esc(t('chaseEmployer'))}</button>
      </div>` : ''}

    <h2>${esc(t('passbookHead'))}</h2>
    <div class="rows">
      ${rows.map(r => `
        <div class="${r.missing ? 'miss' : ''}">
          <span>${esc(r.month)}</span>
          ${r.missing
            ? `<span>${esc(t('monthMissing'))}</span>`
            : `<b>${money(r.employee + r.employer + r.pension)}</b>`}
        </div>`).join('')}
    </div>
    <button class="btn ghost" data-act="nav" data-route="money" data-param="${showAll ? '' : 'all'}">
      ${esc(showAll ? t('showLess') : t('showAll'))}
    </button>
  `;
}

function viewClaims () {
  const m = member();
  const s = liveScan();
  const el = eligibility(m);
  const existing = myClaims();

  return `
    <h1>${esc(t('claimsHead'))}</h1>
    ${existing.length ? existing.map(claimCard).join('') : ''}
    ${el.map(e => claimOption(e, s)).join('')}
  `;
}

function claimOption (e, s) {
  const canFile = e.eligible && s.ready;
  const isAdvance = e.form === 'FORM_31';

  return `
    <div class="card">
      <div class="split">
        <h3>${esc(t('formName.' + e.form))}</h3>
        <span class="chip ${e.eligible ? 'good' : 'neutral'}">${esc(e.eligible ? t('eligible') : t('notEligible'))}</span>
      </div>
      <p class="muted" style="font-size:.88rem">${esc(t('formDesc.' + e.form))}</p>

      ${e.amount ? `<div class="amount sm">${money(e.amount)}</div>
                    <p class="tiny">${esc(t('upTo'))}</p>` : ''}

      ${e.reasonKey ? `<div class="callout info">${esc(t('reason.' + e.reasonKey))}</div>` : ''}
      ${e.unlocksInDays ? `
        <div class="callout warn">
          <b>${esc(t('unlocksIn', e.unlocksInDays))}</b>
          ${s.fixDays ? `<p style="margin:6px 0 0">${esc(t('unlocksNote'))}</p>` : ''}
        </div>` : ''}

      ${isAdvance && e.purposes ? `
        <p class="tiny strong" style="margin-top:10px">${esc(t('choosePurpose'))}</p>
        <div class="rows">
          ${e.purposes.map(pu => `
            <div>
              <span>${esc(t('purpose.' + pu.id))}
                <br><span class="tiny">${esc(t('capIs'))} ${esc(pu.cap)}</span>
              </span>
              ${pu.eligible
                ? `<b>${money(pu.amount)}</b>`
                : `<span class="tiny">${esc(pu.shortByMonths > 0
                    ? t('needsMoreService', pu.shortByMonths)
                    : t('purposeNeedsExit'))}</span>`}
            </div>`).join('')}
        </div>` : ''}

      ${e.eligible ? `
        <div style="margin-top:12px">
          ${canFile
            ? `<button class="btn" data-act="nav" data-route="file" data-param="${esc(e.form)}">${esc(t('fileThis'))}</button>`
            : `<button class="btn secondary" data-act="nav" data-route="readiness">${esc(t('fixFirst'))}</button>`}
        </div>` : ''}
    </div>`;
}

function viewFile () {
  const m = member();
  const form = state.param || 'FORM_19';
  const e = eligibility(m).find(x => x.form === form);
  const amount = e ? e.amount : 0;
  const fc = forecast(m, amount);
  const tx = tds(m, amount);
  const net = amount - tx.deducted;

  const tdsLine = tx.rate === 0
    ? (tx.reasonKey === 'over5Years' ? t('tdsNone') : t('tdsUnder50k'))
    : (tx.reasonKey === 'noPan' ? t('tdsNoPan', tx.rate) : t('tdsPanSeeded', tx.rate));

  return `
    <button class="btn ghost" data-act="nav" data-route="claims">← ${esc(t('back'))}</button>
    <h1>${esc(t('fileHead'))}</h1>
    <p class="muted">${esc(t('formName.' + form))}</p>

    <div class="card">
      <div class="amount">${money(net)}</div>
      <p class="tiny">${esc(t('youWillGet'))}${tx.deducted ? ' · ' + esc(t('afterTax')) : ''}</p>
    </div>

    <div class="card">
      <h3>${esc(t('tdsHead'))}</h3>
      <p>${esc(tdsLine)}</p>
      ${tx.deducted ? `<div class="rows"><div><span>TDS</span><b>− ${money(tx.deducted)}</b></div></div>` : ''}
      ${tx.avoidable ? `<div class="callout warn"><b>${esc(t('tdsAvoidable', money(tx.avoidable)))}</b></div>` : ''}
    </div>

    <div class="card">
      <h3>${esc(t('speedHead'))}</h3>
      <p class="strong">${esc(fc.auto ? t('autoYes', fc.days) : t('autoNo', fc.days))}</p>
      <p class="tiny">${esc(t(fc.basisKey))}</p>
      <p class="tiny strong" style="margin-top:10px">${esc(t('conditionsHead'))}</p>
      <div class="rows">
        ${fc.conditions.map(c => `
          <div><span>${esc(t('cond.' + c.key))}</span>
            <span class="chip ${c.ok ? 'good' : 'blocker'}">${c.ok ? '✓' : '✕'}</span></div>`).join('')}
      </div>
    </div>

    <div class="callout info">${esc(t('filingMock'))}</div>
    <button class="btn" data-act="submitclaim" data-form="${esc(form)}">${esc(t('confirmFile'))}</button>
  `;
}

function claimCard (c) {
  const clock = charterClock(c);
  const rejected = c.stage === 'rejected';
  const stageIdx = CLAIM_STAGES.findIndex(s => s.id === c.stage);
  const pct = Math.min(100, Math.round(clock.elapsed / clock.limit * 100));

  return `
    <div class="card">
      <div class="split">
        <h3>${esc(t('formName.' + c.form))}</h3>
        <span class="chip ${rejected ? 'blocker' : c.stage === 'settled' ? 'good' : 'neutral'}">
          ${esc(t('stage.' + c.stage))}
        </span>
      </div>
      <p class="tiny">${esc(c.id)} · ${money(c.amount)} · ${esc(fmtDate(c.filedOn))}</p>

      ${rejected ? `
        <p class="tiny" style="margin-top:10px">${esc(t('epfoSaid'))}</p>
        <div class="quote">“${esc(c.remark)}”</div>
        <div class="callout danger">${esc(t('refile'))}</div>
        <button class="btn secondary" data-act="nav" data-route="readiness">${esc(t('recoverHead'))}</button>
      ` : `
        <div class="progress"><i class="${clock.breached ? 'over' : ''}" style="width:${pct}%"></i></div>
        <p class="tiny">${esc(t('dayOf', clock.elapsed, clock.limit))} ·
          ${esc(clock.breached ? t('overdue', clock.elapsed - clock.limit) : t('onTime'))}</p>

        <ul class="timeline">
          ${CLAIM_STAGES.map((s, i) => `
            <li class="${i < stageIdx ? 'done' : i === stageIdx ? 'now' : ''}">
              <b>${esc(t('stage.' + s.id))}</b>
              ${i <= stageIdx ? `<p class="tiny">${esc(t('stageNote.' + s.id))}</p>` : ''}
            </li>`).join('')}
        </ul>

        ${clock.breached ? `
          <div class="callout danger">
            <b>${esc(t('escalateHead'))}</b>
            <p style="margin:6px 0 0">${esc(t('escalateBody'))}</p>
          </div>
          <button class="btn danger" data-act="grievance" data-claim="${esc(c.id)}">${esc(t('escalate'))}</button>` : ''}
      `}
    </div>`;
}

function viewHelp () {
  return `
    <h1>${esc(t('helpHead'))}</h1>

    <div class="card">
      <h3>${esc(t('whatsRealHead'))}</h3>
      <ul>${t('whatsRealBody').map(x => `<li class="muted" style="margin:8px 0;font-size:.9rem">${esc(x)}</li>`).join('')}</ul>
    </div>

    <div class="card">
      <h3>${esc(t('scaleHead'))}</h3>
      <ul>${t('scaleBody').map(x => `<li class="muted" style="margin:8px 0;font-size:.9rem">${esc(x)}</li>`).join('')}</ul>
    </div>

    <div class="card">
      <h3>${esc(t('sourcesHead'))}</h3>
      <p class="tiny">EPFO Annual Report and Citizen's Charter; Ministry of Labour &amp; Employment replies in Parliament on claim rejection rates (FY 2023-24: 26%, FY 2024-25: ~22%); EPF Scheme 1952 paragraphs 68B-68N for advance limits; EPS 1995 Table D for the withdrawal benefit; CBDT rules for TDS under section 192A.</p>
    </div>

    <div class="card">
      <p class="tiny">${esc(t('disclaimer'))}</p>
      <div class="btnrow" style="margin-top:12px">
        <button class="btn secondary sm" data-act="reset">${esc(t('resetDemo'))}</button>
        <button class="btn secondary sm" data-act="logout">${esc(t('logout'))}</button>
      </div>
    </div>
  `;
}

function viewDraft () {
  const { titleKey, introKey, draftLang = state.lang } = state.param;
  const m = member();
  const text = state.param.kind === 'employer'
    ? draftEmployerRequest(m, state.param.findingId, draftLang)
    : draftGrievance(m, myClaims().find(x => x.id === state.param.claimId), charterClock(myClaims().find(x => x.id === state.param.claimId)), draftLang);
  return `
    <button class="btn ghost" data-act="back">← ${esc(t('back'))}</button>
    <h1>${esc(t(titleKey))}</h1>
    <p class="lede">${esc(t(introKey))}</p>
    <div class="btnrow" role="group" aria-label="${esc(t('draftLanguage'))}" style="margin:12px 0">
      <span class="tiny" style="align-self:center">${esc(t('draftLanguage'))}</span>
      <button class="btn secondary sm ${draftLang === 'hi' ? 'on' : ''}" data-act="draftlang" data-lang="hi" aria-pressed="${draftLang === 'hi'}">${esc(t('draftLanguageHi'))}</button>
      <button class="btn secondary sm ${draftLang === 'en' ? 'on' : ''}" data-act="draftlang" data-lang="en" aria-pressed="${draftLang === 'en'}">${esc(t('draftLanguageEn'))}</button>
    </div>
    <textarea id="drafttext" readonly>${esc(text)}</textarea>
    <button class="btn" data-act="copy">${esc(t('copyDraft'))}</button>
  `;
}

/* ---------------- shell ---------------- */
function render () {
  document.documentElement.lang = state.lang;
  document.documentElement.dataset.text = state.bigText ? 'big' : 'normal';
  t = makeT(state.lang);

  const signedIn = !!member();
  let body;
  switch (state.route) {
    case 'home':      body = viewHome(); break;
    case 'readiness': body = viewReadiness(); break;
    case 'money':     body = viewMoney(); break;
    case 'claims':    body = viewClaims(); break;
    case 'file':      body = viewFile(); break;
    case 'help':      body = viewHelp(); break;
    case 'draft':     body = viewDraft(); break;
    default:          body = viewLogin();
  }

  const tabs = [
    ['home', '⌂', t('navHome')],
    ['money', '₹', t('navMoney')],
    ['claims', '✓', t('navClaims')],
    ['help', '?', t('navHelp')]
  ];

  document.getElementById('app').innerHTML = `
    <a class="skip sr-only" href="#main">Skip to content</a>
    <div class="ribbon">${esc(t('disclaimerShort'))}</div>
    <header class="topbar">
      <div class="topbar-in">
        <div class="brand">${esc(t('appName'))}<small>${esc(t('tagline'))}</small></div>
        <button class="iconbtn" data-act="lang">${esc(t('langToggle'))}</button>
        <button class="iconbtn" data-act="bigtext" aria-pressed="${state.bigText}" title="${esc(t('bigText'))}">A+</button>
        ${signedIn ? `<button class="iconbtn" data-act="speak" aria-pressed="${speaking}">${speaking ? '■' : '▶'}</button>` : ''}
      </div>
    </header>
    <main id="main" class="wrap" tabindex="-1">${body}</main>
    ${signedIn ? `
      <nav class="tabs"><div class="tabs-in">
        ${tabs.map(([r, icon, label]) => `
          <button class="tab" data-act="nav" data-route="${r}"
                  ${state.route === r ? 'aria-current="page"' : ''}>
            <b aria-hidden="true">${icon}</b>${esc(label)}
          </button>`).join('')}
      </div></nav>` : `<footer class="wrap"><p class="tiny">${esc(t('disclaimer'))}</p></footer>`}
    ${state.toast ? `<div class="callout good" role="status"
        style="position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:60;box-shadow:var(--shadow)">
        ${esc(state.toast)}</div>` : ''}
  `;
}

/* ---------------- events ---------------- */
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;

  if (act === 'lang') { state.lang = state.lang === 'en' ? 'hi' : 'en'; save(); return render(); }
  if (act === 'bigtext') { state.bigText = !state.bigText; save(); return render(); }
  if (act === 'speak') return readAloud();
  if (act === 'nav') return go(el.dataset.route, el.dataset.param || null);
  if (act === 'back') return go(state.param?.from || 'home');

  if (act === 'demo') {
    state.uan = el.dataset.uan;
    save();
    return go('home');
  }

  if (act === 'login') {
    const uan = (document.getElementById('uan').value || '').trim();
    const otp = (document.getElementById('otp').value || '').trim();
    const errBox = document.getElementById('loginerr');
    if (!MEMBERS[uan]) { errBox.innerHTML = `<div class="callout danger">${esc(t('errUan'))}</div>`; return; }
    if (otp !== MEMBERS[uan].otp) { errBox.innerHTML = `<div class="callout danger">${esc(t('errOtp'))}</div>`; return; }
    state.uan = uan; save();
    return go('home');
  }

  if (act === 'toggle') {
    const id = el.dataset.id;
    state.open[id] = !state.open[id];
    return render();
  }

  if (act === 'fix') {
    const id = el.dataset.id;
    const list = state.fixed[state.uan] || [];
    state.fixed[state.uan] = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
    save();
    return render();
  }

  if (act === 'draft') {
    return go('draft', {
      kind: 'employer', findingId: el.dataset.id, draftLang: state.lang,
      titleKey: 'rule.' + el.dataset.id, introKey: 'draftIntro', from: state.route
    });
  }

  if (act === 'grievance') {
    return go('draft', {
      kind: 'grievance', claimId: el.dataset.claim, draftLang: state.lang,
      titleKey: 'escalateHead', introKey: 'grievanceIntro', from: state.route
    });
  }

  if (act === 'draftlang') {
    state.param = { ...state.param, draftLang: el.dataset.lang };
    return render();
  }

  if (act === 'copy') {
    const ta = document.getElementById('drafttext');
    ta.select();
    navigator.clipboard?.writeText(ta.value).catch(() => document.execCommand('copy'));
    return toast(t('copied'));
  }

  if (act === 'submitclaim') {
    const form = el.dataset.form;
    const m = member();
    const e = eligibility(m).find(x => x.form === form);
    const claim = {
      id: 'DEMO/' + Math.floor(100000 + Math.random() * 899999) + '/2026',
      form,
      filedOn: new Date().toISOString().slice(0, 10),
      amount: e.amount,
      stage: 'submitted'
    };
    state.claims[state.uan] = [claim, ...(state.claims[state.uan] || [])];
    save();
    toast(t('filedHead'));
    return go('claims');
  }

  if (act === 'reset') {
    state.fixed = {}; state.claims = {}; state.open = {};
    save();
    return go('home');
  }

  if (act === 'logout') {
    state.uan = null; save();
    return go('login');
  }
});

window.addEventListener('online',  () => render());
window.addEventListener('offline', () => render());

/* ---------------- boot ---------------- */
load();
if (state.uan && MEMBERS[state.uan] && state.route === 'login') state.route = 'home';
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* file:// or unsupported */ });
}
