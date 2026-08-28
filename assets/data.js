/* =========================================================================
   Nikaas — synthetic data layer
   ALL DATA IN THIS FILE IS FICTIONAL. No real UANs, Aadhaar numbers, PANs,
   bank accounts or persons are represented. Numbers are illustrative.
   ========================================================================= */

/* ---------- Reference constants (modelled on published EPFO rules) ------- */
export const RULES_META = {
  charterDays: 20,            // EPFO Citizen's Charter: settle complete claim in 20 days
  autoSettleCeiling: 500000,  // Auto-settlement ceiling raised to Rs 5,00,000
  autoSettleDays: 3,          // Auto-settled claims credited in ~3 working days
  grievanceReminderDays: 15,  // EPFiGMS: escalate if unresolved past 15 days
  form19CoolingDays: 60,      // Final settlement: 2 months of continuous unemployment
  eps10YearMonths: 120        // EPS lump sum only if total service < 10 years
};

/* ---------- The rejection taxonomy ---------------------------------------
   Each rule encodes: how EPFO actually fails the claim, who can fix it,
   how long the fix takes, and the exact steps. `owner` matters because a
   member cannot fix an employer's exit-date entry, and telling them to
   "try again" is the single most common wasted action after a rejection.
   ------------------------------------------------------------------------ */
export const REJECTION_RULES = [
  {
    id: 'AADHAAR_NOT_SEEDED',
    severity: 'blocker',
    owner: 'member',
    etaDays: 3,
    epfoRemark: 'Aadhaar not seeded / not verified against UAN',
    test: m => !m.kyc.aadhaar.seeded,
    fix: {
      steps: [
        'Open the Member portal and go to Manage → KYC.',
        'Enter your Aadhaar number exactly as printed and save.',
        'Aadhaar is auto-verified against UIDAI, usually within minutes.',
        'Your employer must then approve the KYC entry (digital, no paperwork).'
      ],
      note: 'Without a seeded Aadhaar you cannot use online claims at all, and auto-settlement is unavailable.'
    }
  },
  {
    id: 'AADHAAR_NAME_MISMATCH',
    severity: 'blocker',
    owner: 'member',
    etaDays: 12,
    epfoRemark: 'Name not matching as per records',
    test: m => m.kyc.aadhaar.seeded &&
               norm(m.profile.nameOnUan) !== norm(m.kyc.aadhaar.name),
    detail: m => ['detail.nameMismatch', m.profile.nameOnUan, m.kyc.aadhaar.name],
    fix: {
      steps: [
        'Decide which spelling is correct — usually the one on Aadhaar.',
        'File a Joint Declaration with your employer to correct the UAN name.',
        'Employer forwards it digitally; the EPFO field office approves it.',
        'Re-check Manage → KYC after approval and confirm both names match character for character.'
      ],
      note: 'A single extra initial or a swapped surname is enough to fail the match. This is the most common rejection reason of all.'
    }
  },
  {
    id: 'DOB_MISMATCH',
    severity: 'blocker',
    owner: 'member',
    etaDays: 12,
    epfoRemark: 'Date of Birth not matching with Aadhaar',
    test: m => m.profile.dobOnUan !== m.kyc.aadhaar.dob,
    detail: m => ['detail.dobMismatch', fmtDate(m.profile.dobOnUan), fmtDate(m.kyc.aadhaar.dob)],
    fix: {
      steps: [
        'Collect proof of date of birth (Aadhaar plus one of: school certificate, passport, PAN).',
        'File a Joint Declaration for date-of-birth correction through your employer.',
        'Corrections beyond 3 years from the recorded date need extra documentary proof.'
      ],
      note: 'EPFO matches DOB digit for digit against UIDAI. Even the common 01-01-YYYY placeholder will fail.'
    }
  },
  {
    id: 'BANK_UNVERIFIED',
    severity: 'blocker',
    owner: 'member',
    etaDays: 4,
    epfoRemark: 'Bank account not verified / KYC pending employer approval',
    test: m => !m.kyc.bank.verified,
    fix: {
      steps: [
        'Go to Manage → KYC and enter your account number and IFSC.',
        'The bank name and branch should auto-populate — if they do not, the IFSC is wrong.',
        'Submit and wait for your employer to digitally approve the bank KYC.',
        'Status must read "Approved by Establishment" before you file.'
      ],
      note: 'Money is credited only to a verified account. An unapproved entry looks filled-in but behaves as missing.'
    }
  },
  {
    id: 'BANK_NAME_MISMATCH',
    severity: 'blocker',
    owner: 'member',
    etaDays: 7,
    epfoRemark: 'Name in bank account differs from name in EPFO records',
    test: m => m.kyc.bank.verified &&
               norm(m.kyc.bank.holderName) !== norm(m.profile.nameOnUan),
    detail: m => `Bank account is held as "${m.kyc.bank.holderName}", EPFO record says "${m.profile.nameOnUan}".`,
    fix: {
      steps: [
        'Ask your bank to update the account holder name to match your Aadhaar exactly.',
        'Alternatively, add a different account already held in the matching name.',
        'Re-submit bank KYC and get employer approval again.'
      ],
      note: 'The transfer is rejected by the banking system, not by EPFO, so the claim shows as settled-but-returned.'
    }
  },
  {
    id: 'MOBILE_NOT_LINKED',
    severity: 'blocker',
    owner: 'member',
    etaDays: 2,
    epfoRemark: 'Aadhaar-linked mobile not available for OTP authentication',
    test: m => !m.kyc.aadhaar.mobileLinked,
    fix: {
      steps: [
        'Visit any Aadhaar enrolment centre with your Aadhaar.',
        'Request a mobile number update (a small fee applies).',
        'Wait for the update to reflect, then retry the claim OTP.'
      ],
      note: 'Every online claim is signed with an Aadhaar OTP. Without a linked mobile the claim cannot be submitted at all.'
    }
  },
  {
    id: 'EXIT_DATE_MISSING',
    severity: 'blocker',
    owner: 'employer',
    etaDays: 15,
    epfoRemark: 'Date of Exit not marked by employer',
    appliesTo: ['FORM_19', 'FORM_10C'],
    test: m => m.employment.status === 'exited' && !m.employment.exitDateMarked,
    fix: {
      steps: [
        'Ask your ex-employer to mark your Date of Exit in the employer portal.',
        'If they do not respond in 7 days, you can mark it yourself: Member portal → Manage → Mark Exit (available two months after your last contribution).',
        'Choose the correct reason for leaving — "Cessation (short service)" is the usual option for resignation.'
      ],
      note: 'This is the top employer-owned blocker. Self-marking exists but is hidden two menus deep and most members never find it.'
    }
  },
  {
    id: 'DUPLICATE_UAN',
    severity: 'blocker',
    owner: 'epfo',
    etaDays: 30,
    epfoRemark: 'More than one UAN allotted against the same member',
    test: m => m.uanList.length > 1,
    detail: m => ['detail.duplicateUan', m.uanList.length, m.uanList.join(', ')],
    fix: {
      steps: [
        'Identify which UAN is active (the one your current employer contributes to).',
        'Email uanepf@epfindia.gov.in with both UANs, your Aadhaar and your PF member IDs.',
        'EPFO blocks the older UAN and transfers its balance to the active one.',
        'Verify in the passbook that both balances now appear under one UAN before you file.'
      ],
      note: 'Filing against the wrong UAN gets the claim rejected and can also strand part of your balance.'
    }
  },
  {
    id: 'SERVICE_NOT_TRANSFERRED',
    severity: 'blocker',
    owner: 'member',
    etaDays: 20,
    epfoRemark: 'Previous service not transferred to present account',
    test: m => m.employment.untransferredAccounts > 0,
    detail: m => ['detail.untransferred', m.employment.untransferredAccounts],
    fix: {
      steps: [
        'File Form 13 (online transfer request) from the Member portal.',
        'Choose whether your present or previous employer will attest it — pick whichever is more responsive.',
        'Track it under Online Services → Track Claim Status.'
      ],
      note: 'Withdrawing without transferring leaves money behind and can also break the continuous-service count used for pension.'
    }
  },
  {
    id: 'PAN_MISSING',
    severity: 'warning',
    owner: 'member',
    etaDays: 3,
    epfoRemark: 'PAN not seeded — higher TDS deducted',
    test: m => !m.kyc.pan.seeded && m.employment.serviceMonths < 60,
    fix: {
      steps: [
        'Add your PAN under Manage → KYC and let it verify against the income tax database.',
        'Get employer approval on the PAN KYC entry.'
      ],
      note: 'With under 5 years of service and a withdrawal above Rs 50,000, TDS is 10% with a valid PAN and 20% without one. This does not reject the claim; it silently costs you money.'
    }
  },
  {
    id: 'CONTRIBUTION_GAP',
    severity: 'warning',
    owner: 'employer',
    etaDays: 25,
    epfoRemark: 'Contribution not received for one or more wage months',
    test: m => m.passbook.missingMonths.length > 0,
    detail: m => ['detail.gap', m.passbook.missingMonths.join(', ')],
    fix: {
      steps: [
        'Download your passbook and note the exact missing wage months.',
        'Write to your employer citing those months and your salary slips as proof of deduction.',
        'If unresolved in 15 days, file an EPFiGMS grievance under "Non-receipt of contribution".',
        'You can request an inspection under Section 7A — EPFO can recover the amount with damages.'
      ],
      note: 'Money deducted from your salary but never deposited is a recoverable default, not a lost cause. Most members never notice the gap.'
    }
  },
  {
    id: 'NOMINEE_MISSING',
    severity: 'warning',
    owner: 'member',
    etaDays: 1,
    epfoRemark: 'e-Nomination not filed',
    test: m => !m.profile.eNomination,
    fix: {
      steps: [
        'Member portal → Manage → e-Nomination.',
        'Add family details and upload a photo of each nominee.',
        'e-Sign with your Aadhaar OTP. It takes about ten minutes.'
      ],
      note: 'Does not block a withdrawal, but without it your family cannot claim EPF, EPS or the EDLI insurance benefit if something happens to you.'
    }
  },
  {
    id: 'PARENT_NAME_MISMATCH',
    severity: 'blocker',
    owner: 'member',
    etaDays: 12,
    epfoRemark: 'The member details do not match with establishment records.',
    test: m => norm(m.profile.parentNameOnUan) !== norm(m.kyc.aadhaar.parentName),
    detail: m => ['detail.parentNameMismatch', m.profile.parentNameOnUan, m.kyc.aadhaar.parentName],
    fix: {
      steps: [
        'Open the Member portal and choose Joint Declaration (JD).',
        'Select Parent Name / Relationship and enter the value that matches your Aadhaar.',
        'Upload the prescribed supporting document and submit the request.',
        'Wait for the correction to show in your Member Profile before filing again.'
      ],
      note: 'EPFO specifically warns that a wrong father’s or husband’s name can lead to rejection even when your name and date of birth are correct.'
    }
  },
  {
    id: 'GENDER_MISMATCH',
    severity: 'blocker',
    owner: 'member',
    etaDays: 12,
    epfoRemark: 'The member details do not match with establishment records.',
    test: m => m.profile.genderOnUan !== m.kyc.aadhaar.gender,
    detail: m => ['detail.genderMismatch', m.profile.genderOnUan, m.kyc.aadhaar.gender],
    fix: {
      steps: [
        'Open the Member portal and choose Joint Declaration (JD).',
        'Select Gender as the field to correct and enter the value on Aadhaar.',
        'Upload the prescribed identity proof and submit the request.',
        'Confirm the corrected value in your Member Profile before re-filing the claim.'
      ],
      note: 'Gender is one of the demographic fields EPFO validates against Aadhaar when a UAN is created or corrected.'
    }
  },
  {
    id: 'DATE_OF_JOINING_MISSING',
    severity: 'blocker',
    owner: 'employer',
    etaDays: 15,
    epfoRemark: 'Mandatory information like Date of joining is not available.',
    appliesTo: ['FORM_19', 'FORM_10C'],
    test: m => m.employment.status === 'exited' && !m.employment.dojMarked,
    fix: {
      steps: [
        'Ask your former employer to verify the Date of Joining against its payroll and appointment records.',
        'The employer must request the correction through the concerned PF Office.',
        'Check that the date appears in your UAN service history before filing the final claim.'
      ],
      note: 'EPFO’s claim-settlement procedure treats a missing Date of Joining as mandatory information missing from the claim record.'
    }
  },
  {
    id: 'EXIT_REASON_INVALID',
    severity: 'blocker',
    owner: 'employer',
    etaDays: 15,
    epfoRemark: 'Reason of Leaving is not available. Please get the same updated through your employer.',
    appliesTo: ['FORM_19', 'FORM_10C'],
    test: m => m.employment.status === 'exited' && !m.employment.exitReasonValid,
    fix: {
      steps: [
        'Ask your former employer to check the reason recorded with your Date of Exit.',
        'Have the employer request a correction through the concerned PF Office if it is blank or wrong.',
        'Verify both the exit date and reason in the service history before filing again.'
      ],
      note: 'EPFO’s member FAQ confirms that a wrong exit reason can cause an error while filing an online claim.'
    }
  },
  {
    id: 'BANK_KYC_CHANGE_PENDING',
    severity: 'blocker',
    owner: 'epfo',
    etaDays: 10,
    epfoRemark: 'KYC change in Bank Account Number submitted by employer is pending with establishment for approval. You will be able to submit the claim once this KYC is approved/rejected.',
    test: m => m.kyc.bank.pendingChange,
    detail: m => ['detail.pendingBankKyc', m.kyc.bank.pendingWith || 'an establishment'],
    fix: {
      steps: [
        'Do not submit a fresh bank change while this request is pending.',
        'Take a screenshot of the message and contact the concerned EPFO field office with your UAN and bank proof.',
        'Ask the office to identify the establishment holding the pending approval and have it approved or rejected.',
        'File the claim only after the pending KYC item no longer appears.'
      ],
      note: 'This can be an orphaned request from an establishment you never worked for; EPFO says to approach the concerned field office.'
    }
  },
  {
    id: 'KYC_CONFLICT_ACROSS_UANS',
    severity: 'blocker',
    owner: 'member',
    etaDays: 20,
    epfoRemark: 'Same KYC, especially the bank account, is seeded against two or more UAN having different demographic details.',
    test: m => m.kyc.bank.conflictingUanKyc,
    detail: m => ['detail.kycUanConflict', m.kyc.bank.conflictingUans.join(', ')],
    fix: {
      steps: [
        'Identify every UAN linked to the bank account from the Member portal or your passbooks.',
        'Correct name, date of birth and gender on the older UAN so they match Aadhaar.',
        'Link Aadhaar to each corrected UAN, then file Form 13 to transfer the old account to the active UAN.',
        'Retry only after the portal accepts the same Aadhaar/KYC on the linked UANs.'
      ],
      note: 'This is more specific than merely having two UANs: the portal blocks an online claim when the shared KYC carries conflicting demographic records. Do this before, or alongside, asking EPFO to merge the UANs — the merge itself fails while the two records still disagree.'
    }
  }
];

/* ---------- Advance (Form 31) purposes with their real constraints ------- */
export const ADVANCE_PURPOSES = [
  { id: 'medical',    minServiceMonths: 0,   cap: 'lower of 6 months basic+DA, or your own share with interest' },
  { id: 'marriage',   minServiceMonths: 84,  cap: '50% of your own share with interest' },
  { id: 'education',  minServiceMonths: 84,  cap: '50% of your own share with interest' },
  { id: 'house',      minServiceMonths: 60,  cap: 'up to 36 months of wages, within 90% of total balance' },
  { id: 'repayHome',  minServiceMonths: 120, cap: 'up to 36 months of wages' },
  { id: 'calamity',   minServiceMonths: 0,   cap: 'lower of Rs 5,000 or 50% of your own share' },
  { id: 'unemployed', minServiceMonths: 0,   cap: '75% of total balance after 1 month of unemployment' }
];

/* ---------- Claim lifecycle stages, in the order EPFO moves through ------ */
export const CLAIM_STAGES = [
  { id: 'submitted', dayOffset: 0 },
  { id: 'received',  dayOffset: 1 },
  { id: 'underProcess', dayOffset: 3 },
  { id: 'approved',  dayOffset: 9 },
  { id: 'settled',   dayOffset: 12 }
];

/* ---------- Four synthetic members, each in a different real state ------- */
export const MEMBERS = {
  '100200300400': {
    uan: '100200300400',
    uanList: ['100200300400'],
    otp: '123456',
    persona: 'blocked',
    profile: {
      nameOnUan: 'Priya S',
      parentNameOnUan: 'Ramesh Sundaram',
      genderOnUan: 'Female',
      dobOnUan: '1994-07-19',
      eNomination: false,
      mobile: '9x xxxx 4417',
      city: 'Chennai, Tamil Nadu'
    },
    kyc: {
      aadhaar: { seeded: true, name: 'Priya Sundaram', parentName: 'Ramesh Sundaram', gender: 'Female', dob: '1994-07-19', mobileLinked: true, masked: 'XXXX XXXX 7712' },
      pan:     { seeded: false, masked: null },
      bank:    { verified: false, pendingChange: false, conflictingUanKyc: false, conflictingUans: [], holderName: 'Priya Sundaram', masked: 'XXXXXX8890', ifsc: 'HDFC0001234', bankName: 'HDFC Bank, Adyar' }
    },
    employment: {
      status: 'exited',
      currentEmployer: null,
      lastEmployer: 'Meridian Software Services Pvt Ltd',
      doj: '2022-09-01',
      exitDate: daysAgo(54),
      exitDateMarked: false,
      exitReasonValid: true,
      dojMarked: true,
      serviceMonths: 46,
      monthlyWage: 48000,
      untransferredAccounts: 0
    },
    passbook: {
      employeeShare: 265000,
      employerShare: 207000,
      pensionShare: 57500,
      interestYtd: 28400,
      missingMonths: ['Feb 2026', 'Mar 2026'],
      entries: seedPassbook('2022-09-01', 46, 48000, ['Feb 2026', 'Mar 2026'])
    },
    claims: []
  },

  '100200300401': {
    uan: '100200300401',
    uanList: ['100200300401'],
    otp: '123456',
    persona: 'ready',
    profile: {
      nameOnUan: 'Rakesh Kumar Meena',
      parentNameOnUan: 'Mahendra Meena',
      genderOnUan: 'Male',
      dobOnUan: '1989-11-02',
      eNomination: true,
      mobile: '8x xxxx 9023',
      city: 'Jaipur, Rajasthan'
    },
    kyc: {
      aadhaar: { seeded: true, name: 'Rakesh Kumar Meena', parentName: 'Mahendra Meena', gender: 'Male', dob: '1989-11-02', mobileLinked: true, masked: 'XXXX XXXX 3391' },
      pan:     { seeded: true, masked: 'XXXXX4471X' },
      bank:    { verified: true, pendingChange: false, conflictingUanKyc: false, conflictingUans: [], holderName: 'Rakesh Kumar Meena', masked: 'XXXXXX2210', ifsc: 'SBIN0031102', bankName: 'State Bank of India, Malviya Nagar' }
    },
    employment: {
      status: 'employed',
      currentEmployer: 'Aravalli Auto Components Ltd',
      lastEmployer: 'Aravalli Auto Components Ltd',
      doj: '2016-08-16',
      exitDate: null,
      exitDateMarked: false,
      exitReasonValid: true,
      dojMarked: true,
      serviceMonths: 120,
      monthlyWage: 31000,
      untransferredAccounts: 0
    },
    passbook: {
      employeeShare: 421900,
      employerShare: 296300,
      pensionShare: 148200,
      interestYtd: 52140,
      missingMonths: [],
      entries: seedPassbook('2016-08-16', 120, 31000, [])
    },
    claims: [{
      id: 'RJ/JPR/0044907/2026',
      form: 'FORM_31',
      filedOn: daysAgo(26),
      amount: 210950,
      stage: 'underProcess'
    }]
  },

  '100200300402': {
    uan: '100200300402',
    uanList: ['100200300402', '101988745510'],
    otp: '123456',
    persona: 'rejected',
    profile: {
      nameOnUan: 'Fatima Sheikh',
      parentNameOnUan: 'Mohammed Shaikh',
      genderOnUan: 'Male',
      dobOnUan: '1997-01-01',
      eNomination: false,
      mobile: '7x xxxx 1180',
      city: 'Bhiwandi, Maharashtra'
    },
    kyc: {
      aadhaar: { seeded: true, name: 'Fatima Sheikh', parentName: 'Mohammad Sheikh', gender: 'Female', dob: '1997-04-23', mobileLinked: false, masked: 'XXXX XXXX 5028' },
      pan:     { seeded: false, masked: null },
      bank:    { verified: true, pendingChange: false, conflictingUanKyc: true, conflictingUans: ['101988745510'], holderName: 'Fatima Sheikh', masked: 'XXXXXX4419', ifsc: 'BARB0BHIWAN', bankName: 'Bank of Baroda, Bhiwandi' }
    },
    employment: {
      status: 'exited',
      currentEmployer: null,
      lastEmployer: 'Sahyadri Textiles Mill',
      doj: '2019-02-11',
      exitDate: daysAgo(130),
      exitDateMarked: true,
      exitReasonValid: true,
      dojMarked: true,
      serviceMonths: 86,
      monthlyWage: 19500,
      untransferredAccounts: 1
    },
    passbook: {
      employeeShare: 148700,
      employerShare: 101300,
      pensionShare: 58900,
      interestYtd: 14260,
      missingMonths: ['Nov 2025'],
      entries: seedPassbook('2019-02-11', 86, 19500, ['Nov 2025'])
    },
    claims: [{
      id: 'TN/CHN/0092181/2026',
      form: 'FORM_19',
      filedOn: daysAgo(34),
      amount: 250000,
      stage: 'rejected',
      rejectedOn: daysAgo(22),
      remark: 'Name not matching as per records; Date of Birth not matching with Aadhaar'
    }]
  },

  '100200300403': {
    uan: '100200300403',
    uanList: ['100200300403'],
    otp: '123456',
    persona: 'contract',
    profile: {
      nameOnUan: 'Sanjay K Yadav',
      parentNameOnUan: 'Ramesh Yadav',
      genderOnUan: 'Male',
      dobOnUan: '1995-08-14',
      eNomination: true,
      mobile: '8x xxxx 6374',
      city: 'Noida, Uttar Pradesh'
    },
    kyc: {
      aadhaar: { seeded: true, name: 'Sanjay Kumar Yadav', parentName: 'Ramesh Yadav', gender: 'Male', dob: '1995-08-14', mobileLinked: true, masked: 'XXXX XXXX 8836' },
      pan:     { seeded: true, masked: 'XXXXX7183Q' },
      bank:    { verified: true, pendingChange: false, conflictingUanKyc: false, conflictingUans: [], holderName: 'Sanjay Kumar Yadav', masked: 'XXXXXX3062', ifsc: 'ICIC0000456', bankName: 'ICICI Bank, Sector 18' }
    },
    employment: {
      status: 'employed',
      currentEmployer: 'CivicWorks Staffing Solutions Pvt Ltd',
      lastEmployer: 'CivicWorks Staffing Solutions Pvt Ltd',
      doj: '2025-04-01',
      exitDate: null,
      exitDateMarked: false,
      exitReasonValid: true,
      dojMarked: true,
      serviceMonths: 48,
      monthlyWage: 22000,
      untransferredAccounts: 2,
      employerHistory: [
        { employer: 'Nandini Facilities Services', period: 'Aug 2022 – Jun 2023', nameOnRecord: 'Sanjay Kumar', transferred: false },
        { employer: 'Metroline Logistics India Ltd', period: 'Jul 2023 – Mar 2025', nameOnRecord: 'Sanjay Yadav', transferred: false },
        { employer: 'CivicWorks Staffing Solutions Pvt Ltd', period: 'Apr 2025 – present', nameOnRecord: 'Sanjay K Yadav', transferred: true }
      ]
    },
    passbook: {
      employeeShare: 118600,
      employerShare: 84200,
      pensionShare: 43800,
      interestYtd: 10940,
      missingMonths: ['Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025'],
      entries: seedPassbook('2022-08-01', 48, 22000, ['Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025'])
    },
    claims: []
  }
};

/* ---------- helpers ------------------------------------------------------ */
export function norm (s) {
  return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

export function fmtDate (iso) {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysAgo (n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween (a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

/* Build a plausible passbook: monthly employee/employer/pension splits,
   with deliberate holes for the months an employer failed to deposit. */
function seedPassbook (startIso, months, wage, missing) {
  const out = [];
  const start = new Date(startIso + 'T00:00:00');
  const cap = Math.min(wage, 15000); // EPS is computed on the statutory wage ceiling
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const isMissing = missing.includes(label);
    const employee = isMissing ? 0 : Math.round(wage * 0.12);
    const pension  = isMissing ? 0 : Math.round(cap * 0.0833);
    const employer = isMissing ? 0 : Math.round(wage * 0.12) - pension;
    out.push({ month: label, employee, employer, pension, missing: isMissing });
  }
  return out.reverse(); // newest first
}
