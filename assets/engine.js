/* =========================================================================
   Nikaas — decision engine
   Pure functions. No DOM, no network. This is the part that would need to
   run against real EPFO data to be useful in production; everything here is
   deliberately isolated so it could be swapped onto a real read-only API.
   ========================================================================= */

import {
  REJECTION_RULES, ADVANCE_PURPOSES, RULES_META,
  daysBetween, norm
} from './data.js';

/* -------------------------------------------------------------------------
   scan(member, formId)
   Runs every rule in the taxonomy against the member record and returns the
   findings that apply, sorted worst-first. `formId` matters because some
   blockers only bite on certain forms — a missing exit date stops a final
   settlement but is irrelevant to an advance taken while still employed.
   ------------------------------------------------------------------------- */
export function scan (member, formId = null) {
  const findings = REJECTION_RULES
    .filter(rule => {
      if (rule.appliesTo && formId && !rule.appliesTo.includes(formId)) return false;
      try { return rule.test(member); } catch { return false; }
    })
    .map(rule => ({
      id: rule.id,
      severity: rule.severity,
      owner: rule.owner,
      etaDays: rule.etaDays,
      epfoRemark: rule.epfoRemark,
      detail: rule.detail ? rule.detail(member) : null,
      fix: rule.fix
    }));

  const order = { blocker: 0, warning: 1 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.etaDays - b.etaDays);

  const blockers = findings.filter(f => f.severity === 'blocker');
  const warnings = findings.filter(f => f.severity === 'warning');

  return {
    findings,
    blockers,
    warnings,
    ready: blockers.length === 0,
    score: readinessScore(blockers, warnings),
    // Fixes owned by different parties run in parallel, so the honest wait is
    // the longest single fix, not the sum of all of them.
    fixDays: blockers.length ? Math.max(...blockers.map(b => b.etaDays)) : 0
  };
}

function readinessScore (blockers, warnings) {
  const raw = 100 - (blockers.length * 22) - (warnings.length * 5);
  return Math.max(5, Math.min(100, raw));
}

/* -------------------------------------------------------------------------
   eligibility(member)
   Which claim forms this member can actually file today, and why not.
   ------------------------------------------------------------------------- */
export function eligibility (member) {
  const e = member.employment;
  const p = member.passbook;
  const total = p.employeeShare + p.employerShare;
  const today = new Date().toISOString().slice(0, 10);
  const out = [];

  /* --- Form 19: final settlement of EPF ------------------------------- */
  if (e.status !== 'exited') {
    out.push({ form: 'FORM_19', eligible: false, reasonKey: 'stillEmployed', amount: 0 });
  } else {
    const gap = daysBetween(e.exitDate, today);
    if (gap < RULES_META.form19CoolingDays) {
      out.push({
        form: 'FORM_19', eligible: false, reasonKey: 'coolingPeriod', amount: total,
        unlocksInDays: RULES_META.form19CoolingDays - gap
      });
    } else {
      out.push({ form: 'FORM_19', eligible: true, amount: total });
    }
  }

  /* --- Form 10C: EPS lump sum, only under 10 years of service ---------- */
  if (e.status !== 'exited') {
    out.push({ form: 'FORM_10C', eligible: false, reasonKey: 'stillEmployed', amount: 0 });
  } else if (e.serviceMonths >= RULES_META.eps10YearMonths) {
    out.push({
      form: 'FORM_10C', eligible: false, reasonKey: 'pensionLocked',
      amount: p.pensionShare
    });
  } else {
    out.push({ form: 'FORM_10C', eligible: true, amount: epsWithdrawalBenefit(member) });
  }

  /* --- Form 31: advance while still in service ------------------------- */
  const purposes = ADVANCE_PURPOSES.map(pu => ({
    id: pu.id,
    cap: pu.cap,
    eligible: e.serviceMonths >= pu.minServiceMonths &&
              (pu.id === 'unemployed' ? e.status === 'exited' : true),
    minServiceMonths: pu.minServiceMonths,
    shortByMonths: Math.max(0, pu.minServiceMonths - e.serviceMonths),
    amount: advanceCap(pu.id, member)
  }));

  out.push({
    form: 'FORM_31',
    eligible: e.status === 'employed' && purposes.some(x => x.eligible),
    reasonKey: e.status === 'employed' ? null : 'advanceNeedsService',
    purposes,
    amount: Math.max(...purposes.filter(x => x.eligible).map(x => x.amount), 0)
  });

  return out;
}

/* EPS withdrawal benefit is a service-length multiple of monthly wage,
   read off the scheme's Table D. Approximated here on the mock record. */
function epsWithdrawalBenefit (member) {
  const years = Math.floor(member.employment.serviceMonths / 12);
  const tableD = [0, 1.02, 1.99, 2.98, 3.99, 5.02, 6.07, 7.13, 8.22, 9.33];
  const factor = tableD[Math.min(years, 9)];
  const wage = Math.min(member.employment.monthlyWage, 15000);
  return Math.round(wage * factor);
}

function advanceCap (purposeId, member) {
  const p = member.passbook;
  const wage = member.employment.monthlyWage;
  const own = p.employeeShare;
  const total = p.employeeShare + p.employerShare;
  switch (purposeId) {
    case 'medical':    return Math.round(Math.min(wage * 6, own));
    case 'marriage':
    case 'education':  return Math.round(own * 0.5);
    case 'house':      return Math.round(Math.min(wage * 36, total * 0.9));
    case 'repayHome':  return Math.round(Math.min(wage * 36, total * 0.9));
    case 'calamity':   return Math.round(Math.min(5000, own * 0.5));
    case 'unemployed': return Math.round(total * 0.75);
    default:           return 0;
  }
}

/* -------------------------------------------------------------------------
   forecast(member, amount)
   Honest expectation-setting. Auto-settlement is fast but conditional; if
   the member misses a condition we say so rather than showing "3 days".
   ------------------------------------------------------------------------- */
export function forecast (member, amount) {
  const conditions = [
    { key: 'underCeiling',  ok: amount <= RULES_META.autoSettleCeiling },
    { key: 'aadhaarSeeded', ok: member.kyc.aadhaar.seeded },
    { key: 'bankVerified',  ok: member.kyc.bank.verified },
    { key: 'nameMatches',   ok: norm(member.profile.nameOnUan) === norm(member.kyc.aadhaar.name) },
    { key: 'dobMatches',    ok: member.profile.dobOnUan === member.kyc.aadhaar.dob }
  ];
  const auto = conditions.every(c => c.ok);
  return {
    auto,
    conditions,
    days: auto ? RULES_META.autoSettleDays : RULES_META.charterDays,
    basisKey: auto ? 'autoBasis' : 'charterBasis'
  };
}

/* -------------------------------------------------------------------------
   tds(member, amount) — the silent money-loser most members never see.
   ------------------------------------------------------------------------- */
export function tds (member, amount) {
  const years = member.employment.serviceMonths / 12;
  if (years >= 5) return { rate: 0, deducted: 0, reasonKey: 'over5Years' };
  if (amount <= 50000) return { rate: 0, deducted: 0, reasonKey: 'under50k' };
  const rate = member.kyc.pan.seeded ? 10 : 20;
  return {
    rate,
    deducted: Math.round(amount * rate / 100),
    reasonKey: member.kyc.pan.seeded ? 'panSeeded' : 'noPan',
    avoidable: member.kyc.pan.seeded ? 0 : Math.round(amount * 0.10)
  };
}

/* -------------------------------------------------------------------------
   charterClock(claim) — is this claim now overdue under the Citizen's
   Charter? A pending claim past 20 days is a grievance, not a wait.
   ------------------------------------------------------------------------- */
export function charterClock (claim) {
  const today = new Date().toISOString().slice(0, 10);
  const elapsed = daysBetween(claim.filedOn, today);
  const limit = RULES_META.charterDays;
  return {
    elapsed,
    limit,
    remaining: limit - elapsed,
    breached: elapsed > limit && claim.stage !== 'settled',
    canEscalate: elapsed > RULES_META.grievanceReminderDays
  };
}

/* -------------------------------------------------------------------------
   Draft generators. Every dead end in this product ends in a document the
   member can actually send, rather than advice to "contact your employer".
   ------------------------------------------------------------------------- */
export function draftEmployerRequest (member, findingId) {
  const e = member.employment;
  if (findingId === 'EXIT_DATE_MISSING') {
    return `Subject: Request to mark Date of Exit — UAN ${member.uan}

Dear HR Team,

I worked at ${e.lastEmployer} from ${e.doj} until my last working day on ${e.exitDate}.

My Date of Exit has not yet been marked in the EPFO employer portal against UAN ${member.uan}. Because of this I am unable to file my final settlement claim, and it will be rejected if I file it now.

Could you please mark the Date of Exit with the reason "Cessation (Short Service)" at your earliest convenience? Please confirm here once it is done so I can proceed.

Thank you for your help.

${member.profile.nameOnUan}
UAN: ${member.uan}`;
  }

  if (findingId === 'CONTRIBUTION_GAP') {
    return `Subject: PF contribution not deposited — UAN ${member.uan}

Dear HR Team,

My EPF passbook shows no contribution received for the following wage month(s): ${member.passbook.missingMonths.join(', ')}.

My salary slips for these months show the employee share was deducted from my salary. Please confirm when these contributions will be deposited against UAN ${member.uan}, along with the ECR reference.

If I do not receive a response within 15 days I will have to raise this with the EPFO regional office under the non-receipt-of-contribution category.

Thank you,

${member.profile.nameOnUan}
UAN: ${member.uan}`;
  }

  return '';
}

export function draftGrievance (member, claim, clock) {
  return `Grievance category: Non-settlement of claim
UAN: ${member.uan}
Claim ID: ${claim.id}
PF office: as per UAN records
Date of filing: ${claim.filedOn}
Days elapsed: ${clock.elapsed}

Details:
I filed claim ${claim.id} on ${claim.filedOn}. As of today ${clock.elapsed} days have passed with no settlement.

EPFO's Citizen's Charter commits to settling a complete claim within ${clock.limit} days of receipt. All my KYC details — Aadhaar, bank account and PAN — are seeded and verified, and no deficiency memo has been issued to me.

I request that the claim be settled, or that the specific deficiency be communicated to me in writing so I can correct it.

Relief sought: Settlement of the claim, or a written statement of the exact deficiency.`;
}
