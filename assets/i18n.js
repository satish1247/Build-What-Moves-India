/* =========================================================================
   Nikaas — strings. English and Hindi.
   Written for someone reading on a phone who is worried about their money,
   not for someone who enjoys reading government prose.
   ========================================================================= */

export const STRINGS = {
  en: {
    /* --- chrome --- */
    appName: 'Nikaas',
    tagline: 'Get your PF out. First time.',
    disclaimer: 'Independent hackathon prototype. Not affiliated with or endorsed by EPFO or the Government of India. All data shown is synthetic.',
    disclaimerShort: 'Prototype · synthetic data · not an official EPFO service',
    langToggle: 'हिंदी',
    bigText: 'Larger text',
    readAloud: 'Read aloud',
    stopReading: 'Stop',
    back: 'Back',
    close: 'Close',
    offline: 'You are offline. Everything below still works.',

    /* --- nav --- */
    navHome: 'Home',
    navMoney: 'My money',
    navClaims: 'Claims',
    navHelp: 'Help',

    /* --- login --- */
    loginTitle: 'Check your PF claim before you file it',
    loginSub: 'One in five EPF claims is rejected. Almost always for something you could have fixed first. Let us check yours.',
    uanLabel: 'Your UAN (12 digits)',
    uanHint: 'Printed on your salary slip and in the EPFO member portal.',
    otpLabel: 'OTP sent to your Aadhaar-linked mobile',
    otpHint: 'This is a prototype — no message is actually sent.',
    sendOtp: 'Send OTP',
    verify: 'Verify and continue',
    demoTitle: 'Demo logins — pick any one',
    demoBlocked: 'Would be rejected today · 3 blockers',
    demoReady: 'Clean record · ready to file',
    demoRejected: 'Already rejected once · needs recovery',
    demoContract: 'Contract worker · old PF accounts need transfer',
    demoOtp: 'OTP for every demo account: 123456',
    errUan: 'That UAN is not in the demo data. Use one of the demo logins below.',
    errOtp: 'Incorrect OTP. For this prototype it is 123456.',

    /* --- home --- */
    greeting: 'Namaste',
    yourMoney: 'Your PF balance',
    readinessTitle: 'Claim readiness',
    readyNow: 'Ready to file',
    notReadyNow: 'Not ready to file',
    scoreOf: 'out of 100',
    wouldBeRejected: 'If you filed today, this claim would very likely be rejected.',
    wouldBeAccepted: 'Your record is clean. Nothing here would cause a rejection.',
    blockersCount: n => `${n} thing${n === 1 ? '' : 's'} will get you rejected`,
    warningsCount: n => `${n} thing${n === 1 ? '' : 's'} will cost you money or time`,
    fixTime: d => `About ${d} days to fix everything`,
    fixTimeNote: 'Fixes owned by you, your employer and EPFO run at the same time, so this is the longest single fix — not the total.',
    seeWhat: 'See what to fix',
    startClaim: 'Start a claim',
    viewPlan: 'View my fix plan',

    /* --- readiness --- */
    readinessHead: 'What stands between you and your money',
    blockerLabel: 'Will reject your claim',
    warningLabel: 'Will cost you money or time',
    ownerMember: 'You can fix this',
    ownerEmployer: 'Your employer must fix this',
    ownerEpfo: 'EPFO must fix this',
    epfoWouldSay: 'EPFO would reject it with this remark:',
    howToFix: 'How to fix it',
    whyItMatters: 'Why this matters',
    takesAbout: d => `Takes about ${d} day${d === 1 ? '' : 's'}`,
    markFixed: 'I have done this',
    markedFixed: 'Marked as done',
    undo: 'Undo',
    draftMessage: 'Draft the message for me',
    copyDraft: 'Copy',
    copied: 'Copied',
    draftIntro: 'Send this to your employer. It names the exact problem, so it is harder to ignore.',
    draftLanguage: 'Draft language',
    draftLanguageHi: 'हिंदी',
    draftLanguageEn: 'English',
    allClear: 'Nothing is blocking you. You can file.',

    detail: {
      nameMismatch:  (uan, aadhaar) => `Your UAN says "${uan}". Your Aadhaar says "${aadhaar}".`,
      dobMismatch:   (uan, aadhaar) => `Your UAN shows ${uan}. Your Aadhaar shows ${aadhaar}.`,
      parentNameMismatch: (uan, aadhaar) => `Your UAN lists "${uan}" as parent name. Your Aadhaar lists "${aadhaar}".`,
      genderMismatch: (uan, aadhaar) => `Your UAN says ${uan}. Your Aadhaar says ${aadhaar}.`,
      duplicateUan:  (n, list) => `${n} UANs found: ${list}.`,
      untransferred: n => `${n} old PF account${n === 1 ? '' : 's'} still sitting with a previous employer.`,
      gap:           months => `No deposit received for: ${months}.`,
      pendingBankKyc: establishment => `A bank-KYC change is still waiting for approval from ${establishment}.`,
      kycUanConflict: uans => `The same bank KYC is also linked to UAN: ${uans}, with conflicting details.`
    },

    /* --- rule names --- */
    rule: {
      AADHAAR_NOT_SEEDED:    'Aadhaar is not linked to your UAN',
      AADHAAR_NAME_MISMATCH: 'Your name does not match your Aadhaar',
      DOB_MISMATCH:          'Your date of birth does not match your Aadhaar',
      BANK_UNVERIFIED:       'Your bank account is not verified',
      BANK_NAME_MISMATCH:    'Your bank account is in a different name',
      MOBILE_NOT_LINKED:     'No mobile number is linked to your Aadhaar',
      EXIT_DATE_MISSING:     'Your employer has not marked your last working day',
      DUPLICATE_UAN:         'You have more than one UAN',
      SERVICE_NOT_TRANSFERRED: 'An old PF account was never transferred',
      PAN_MISSING:           'Your PAN is missing — you will lose extra tax',
      CONTRIBUTION_GAP:      'Your employer skipped some months',
      NOMINEE_MISSING:       'You have not filed a nomination',
      PARENT_NAME_MISMATCH:  'Your parent’s name does not match Aadhaar',
      GENDER_MISMATCH:       'Your gender does not match Aadhaar',
      DATE_OF_JOINING_MISSING: 'Your date of joining is missing from EPFO records',
      EXIT_REASON_INVALID:   'Your reason for leaving is missing or wrong',
      BANK_KYC_CHANGE_PENDING: 'A bank-KYC change is still pending',
      KYC_CONFLICT_ACROSS_UANS: 'Your bank KYC conflicts across UANs'
    },

    /* --- money --- */
    moneyHead: 'Your money, in plain words',
    yourShare: 'Deducted from your salary',
    employerShare: 'Paid by your employer',
    pensionShare: 'Held for your pension (EPS)',
    interestYtd: 'Interest earned this year',
    totalWithdrawable: 'You can withdraw',
    pensionNote: 'The pension portion follows separate rules and is not part of a normal withdrawal.',
    passbookHead: 'Month by month',
    monthMissing: 'Nothing deposited',
    gapWarnHead: n => `${n} month${n === 1 ? '' : 's'} with no deposit`,
    gapWarnBody: 'If your salary slip shows PF was deducted for these months, that money is owed to you and can be recovered.',
    chaseEmployer: 'Draft a letter to my employer',
    showAll: 'Show all months',
    showLess: 'Show fewer',

    /* --- claims --- */
    claimsHead: 'What you can claim',
    formName: {
      FORM_19:  'Final settlement (Form 19)',
      FORM_10C: 'Pension withdrawal (Form 10C)',
      FORM_31:  'Advance while working (Form 31)'
    },
    formDesc: {
      FORM_19:  'Take out your whole EPF balance after you leave a job.',
      FORM_10C: 'Take out your pension contributions as a lump sum, if you worked under 10 years.',
      FORM_31:  'Take part of your balance while still employed, for a specific reason.'
    },
    eligible: 'You can file this',
    notEligible: 'You cannot file this yet',
    upTo: 'Up to',
    reason: {
      stillEmployed:  'You are still employed. This is only for after you leave.',
      coolingPeriod:  'You must be out of work for 2 full months before final settlement.',
      pensionLocked:  'You have crossed 10 years of service, so this becomes a monthly pension at 58 instead of a lump sum. That is usually worth far more.',
      advanceNeedsService: 'Advances are for people currently in service.'
    },
    unlocksIn: d => `Unlocks in ${d} day${d === 1 ? '' : 's'}`,
    unlocksNote: 'Good news: your fixes take about as long. Start them now and you will be ready the day this opens.',
    choosePurpose: 'What do you need the money for?',
    purpose: {
      medical:    'Medical treatment',
      marriage:   'Marriage',
      education:  'Education',
      house:      'Buying or building a house',
      repayHome:  'Repaying a home loan',
      calamity:   'Natural calamity',
      unemployed: 'Unemployment'
    },
    needsMoreService: n => `Needs ${Math.ceil(n / 12)} more year${Math.ceil(n / 12) === 1 ? '' : 's'} of service`,
    purposeNeedsExit: 'Only after you leave the job',
    capIs: 'Limit:',
    fileThis: 'File this claim',
    fixFirst: 'Fix your record first',

    /* --- file --- */
    fileHead: 'Before you file',
    youWillGet: 'You should receive',
    afterTax: 'after tax',
    tdsHead: 'Tax deducted at source',
    tdsNone: 'No TDS. You have completed 5 years of service.',
    tdsUnder50k: 'No TDS. The amount is under Rs 50,000.',
    tdsPanSeeded: r => `TDS at ${r}% because you have under 5 years of service.`,
    tdsNoPan: r => `TDS at ${r}% because your PAN is not seeded. With a PAN it would be 10%.`,
    tdsAvoidable: a => `Add your PAN before filing and keep ${a}.`,
    speedHead: 'How fast will it come',
    autoYes: d => `Auto-settlement: about ${d} working days`,
    autoNo: d => `Normal processing: up to ${d} days`,
    autoBasis: 'Your claim meets every auto-settlement condition, so it skips manual checking.',
    charterBasis: "EPFO's Citizen's Charter commits to 20 days for a complete claim. We will start a clock and tell you when they are late.",
    conditionsHead: 'Auto-settlement conditions',
    cond: {
      underCeiling:  'Amount is within the Rs 5,00,000 ceiling',
      aadhaarSeeded: 'Aadhaar is seeded and verified',
      bankVerified:  'Bank account is verified',
      nameMatches:   'Name matches Aadhaar exactly',
      dobMatches:    'Date of birth matches Aadhaar'
    },
    confirmFile: 'Confirm and file',
    filingMock: 'This is a prototype. Nothing is sent to EPFO.',
    filedHead: 'Claim filed',
    filedBody: 'We will track the 20-day clock for you and tell you the moment EPFO is late.',
    trackIt: 'Track this claim',

    /* --- track --- */
    trackHead: 'Your claims',
    noClaims: 'You have not filed anything yet.',
    stage: {
      submitted:    'Claim submitted',
      received:     'Received by PF office',
      underProcess: 'Under process',
      approved:     'Approved for payment',
      settled:      'Money sent to your bank',
      rejected:     'Rejected'
    },
    stageNote: {
      submitted:    'Your claim has been signed with your Aadhaar OTP.',
      received:     'The claim reached the field office handling your UAN.',
      underProcess: 'A dealing hand is checking your KYC and service history. Most rejections happen here.',
      approved:     'The payment has been authorised and sent for transfer.',
      settled:      'Check your bank account. It usually reflects within 24 hours.',
      rejected:     'The claim was closed without payment. You can fix the cause and re-file.'
    },
    dayOf: (a, b) => `Day ${a} of ${b}`,
    onTime: 'Within the promised time',
    overdue: n => `${n} days over the promised 20`,
    escalateHead: 'EPFO is late',
    escalateBody: 'A claim pending past 20 days is a grievance, not a wait. We have written it for you.',
    escalate: 'Draft my grievance',
    grievanceIntro: 'File this on the EPFiGMS grievance portal. Keep the registration number — you will need it if you have to escalate further.',

    /* --- rejection --- */
    rejectedHead: 'This claim was rejected',
    rejectedOn: 'Rejected on',
    epfoSaid: 'EPFO wrote:',
    weTranslated: 'What that actually means',
    recoverHead: 'How to get this money',
    refile: 'You do not appeal a rejection — you fix the cause and file again. Nothing is lost, and the balance stays yours.',
    decodeHead: 'Decode a rejection',
    decodeSub: 'Got a rejection remark you do not understand? Pick the closest one.',

    /* --- help --- */
    helpHead: 'Honest notes',
    whatsRealHead: 'What is real and what is mocked',
    whatsRealBody: [
      'The rejection rules, claim forms, eligibility conditions, tax rules, the Rs 5,00,000 auto-settlement ceiling and the 20-day Citizen\'s Charter are modelled on published EPFO rules.',
      'Every member record, balance, passbook entry, claim number and rejection remark is synthetic. No real person or account is represented.',
      'There is no backend and no connection of any kind to EPFO. Logging in checks a number against a local file.',
      'Nothing you type leaves your device. Your progress is saved in your own browser only.',
      'The Table D pension figure and advance limits are simplified approximations, not a substitute for EPFO\'s own calculation.',
      'Letters and grievances are available in both Hindi and English. You can switch a draft to English before copying it, since many HR desks and grievance portals prefer it.'
    ],
    scaleHead: 'How this would work for real',
    scaleBody: [
      'The scan needs read-only access to fields EPFO already holds: KYC status, exit date, UAN count and passbook months. No new data collection.',
      'The rule taxonomy is the product. It is a versioned list, editable by EPFO staff without shipping an app, so a new rejection reason becomes a new pre-check the same week.',
      'The strongest version is not this app at all — it is this check running inside the EPFO portal, refusing to accept a claim that is certain to fail.',
      'Every draft is generated on the device. No claim data needs to reach us.'
    ],
    sourcesHead: 'Where the numbers come from',
    resetDemo: 'Reset the demo',
    logout: 'Log out'
  },

  hi: {
    appName: 'निकास',
    tagline: 'अपना PF निकालें। पहली ही बार।',
    disclaimer: 'यह एक स्वतंत्र हैकाथॉन प्रोटोटाइप है। EPFO या भारत सरकार से इसका कोई संबंध या अनुमोदन नहीं है। सभी डेटा काल्पनिक है।',
    disclaimerShort: 'प्रोटोटाइप · काल्पनिक डेटा · आधिकारिक EPFO सेवा नहीं',
    langToggle: 'English',
    bigText: 'बड़ा अक्षर',
    readAloud: 'पढ़कर सुनाएँ',
    stopReading: 'रोकें',
    back: 'वापस',
    close: 'बंद करें',
    offline: 'आप ऑफ़लाइन हैं। नीचे सब कुछ फिर भी चलेगा।',

    navHome: 'होम',
    navMoney: 'मेरा पैसा',
    navClaims: 'दावे',
    navHelp: 'मदद',

    loginTitle: 'दावा भरने से पहले जाँच लें',
    loginSub: 'हर पाँच में से एक PF दावा रद्द होता है। लगभग हमेशा किसी ऐसी वजह से जिसे पहले ठीक किया जा सकता था। आइए आपका जाँचें।',
    uanLabel: 'आपका UAN (12 अंक)',
    uanHint: 'आपकी सैलरी स्लिप और EPFO सदस्य पोर्टल पर लिखा होता है।',
    otpLabel: 'आधार से जुड़े मोबाइल पर भेजा गया OTP',
    otpHint: 'यह प्रोटोटाइप है — कोई संदेश वास्तव में नहीं भेजा जाता।',
    sendOtp: 'OTP भेजें',
    verify: 'जाँचें और आगे बढ़ें',
    demoTitle: 'डेमो लॉगिन — कोई एक चुनें',
    demoBlocked: 'आज भरा तो रद्द होगा · 3 रुकावटें',
    demoReady: 'रिकॉर्ड साफ़ · भरने के लिए तैयार',
    demoRejected: 'एक बार रद्द हो चुका · सुधार चाहिए',
    demoContract: 'कॉन्ट्रैक्ट कर्मचारी · पुराने PF खाते ट्रांसफ़र करने हैं',
    demoOtp: 'हर डेमो खाते का OTP: 123456',
    errUan: 'यह UAN डेमो डेटा में नहीं है। नीचे दिए डेमो लॉगिन में से चुनें।',
    errOtp: 'OTP ग़लत है। इस प्रोटोटाइप में यह 123456 है।',

    greeting: 'नमस्ते',
    yourMoney: 'आपका PF बैलेंस',
    readinessTitle: 'दावा तैयारी',
    readyNow: 'भरने के लिए तैयार',
    notReadyNow: 'अभी तैयार नहीं',
    scoreOf: '100 में से',
    wouldBeRejected: 'अगर आपने आज दावा भरा, तो बहुत संभावना है कि वह रद्द हो जाएगा।',
    wouldBeAccepted: 'आपका रिकॉर्ड साफ़ है। यहाँ कुछ भी दावा रद्द नहीं कराएगा।',
    blockersCount: n => `${n} चीज़ें आपका दावा रद्द करा देंगी`,
    warningsCount: n => `${n} चीज़ें आपका पैसा या समय ले लेंगी`,
    fixTime: d => `सब ठीक करने में लगभग ${d} दिन`,
    fixTimeNote: 'आपके, आपके नियोक्ता और EPFO के काम साथ-साथ चलते हैं, इसलिए यह सबसे लंबा एक काम है — सबका जोड़ नहीं।',
    seeWhat: 'देखें क्या ठीक करना है',
    startClaim: 'दावा शुरू करें',
    viewPlan: 'मेरी सुधार सूची देखें',

    readinessHead: 'आपके और आपके पैसे के बीच क्या है',
    blockerLabel: 'दावा रद्द करा देगा',
    warningLabel: 'पैसा या समय ले लेगा',
    ownerMember: 'आप इसे ठीक कर सकते हैं',
    ownerEmployer: 'आपके नियोक्ता को ठीक करना होगा',
    ownerEpfo: 'EPFO को ठीक करना होगा',
    epfoWouldSay: 'EPFO इस टिप्पणी के साथ रद्द करेगा:',
    howToFix: 'कैसे ठीक करें',
    whyItMatters: 'यह क्यों ज़रूरी है',
    takesAbout: d => `लगभग ${d} दिन लगेंगे`,
    markFixed: 'यह मैंने कर लिया',
    markedFixed: 'हो गया',
    undo: 'वापस लें',
    draftMessage: 'मेरे लिए संदेश लिख दें',
    copyDraft: 'कॉपी करें',
    copied: 'कॉपी हो गया',
    draftIntro: 'यह अपने नियोक्ता को भेजें। इसमें समस्या साफ़ लिखी है, इसलिए इसे टालना मुश्किल होगा।',
    draftLanguage: 'मसौदे की भाषा',
    draftLanguageHi: 'हिंदी',
    draftLanguageEn: 'English',
    allClear: 'कोई रुकावट नहीं है। आप दावा भर सकते हैं।',

    detail: {
      nameMismatch:  (uan, aadhaar) => `आपके UAN पर "${uan}" लिखा है। आपके आधार पर "${aadhaar}" लिखा है।`,
      dobMismatch:   (uan, aadhaar) => `आपके UAN पर ${uan} है। आपके आधार पर ${aadhaar} है।`,
      parentNameMismatch: (uan, aadhaar) => `आपके UAN पर माता/पिता का नाम "${uan}" है। आपके आधार पर "${aadhaar}" है।`,
      genderMismatch: (uan, aadhaar) => `आपके UAN पर ${uan} है। आपके आधार पर ${aadhaar} है।`,
      duplicateUan:  (n, list) => `${n} UAN मिले: ${list}।`,
      untransferred: n => `${n} पुराना PF खाता अब भी पिछले नियोक्ता के पास है।`,
      gap:           months => `इन महीनों की जमा नहीं मिली: ${months}।`,
      pendingBankKyc: establishment => `बैंक KYC में बदलाव अभी भी ${establishment} की स्वीकृति का इंतज़ार कर रहा है।`,
      kycUanConflict: uans => `यही बैंक KYC अलग विवरण वाले UAN ${uans} से भी जुड़ा है।`
    },

    rule: {
      AADHAAR_NOT_SEEDED:    'आधार आपके UAN से नहीं जुड़ा है',
      AADHAAR_NAME_MISMATCH: 'आपका नाम आधार से मेल नहीं खाता',
      DOB_MISMATCH:          'आपकी जन्मतिथि आधार से मेल नहीं खाती',
      BANK_UNVERIFIED:       'आपका बैंक खाता सत्यापित नहीं है',
      BANK_NAME_MISMATCH:    'आपका बैंक खाता दूसरे नाम पर है',
      MOBILE_NOT_LINKED:     'आधार से कोई मोबाइल नंबर नहीं जुड़ा',
      EXIT_DATE_MISSING:     'नियोक्ता ने आपका अंतिम कार्यदिवस दर्ज नहीं किया',
      DUPLICATE_UAN:         'आपके पास एक से ज़्यादा UAN हैं',
      SERVICE_NOT_TRANSFERRED: 'पुराना PF खाता कभी ट्रांसफ़र नहीं हुआ',
      PAN_MISSING:           'PAN नहीं जुड़ा — ज़्यादा टैक्स कटेगा',
      CONTRIBUTION_GAP:      'नियोक्ता ने कुछ महीने जमा नहीं किए',
      NOMINEE_MISSING:       'आपने नामांकन दर्ज नहीं किया',
      PARENT_NAME_MISMATCH:  'माता/पिता का नाम आधार से मेल नहीं खाता',
      GENDER_MISMATCH:       'आपका लिंग आधार से मेल नहीं खाता',
      DATE_OF_JOINING_MISSING: 'EPFO रिकॉर्ड में आपकी जॉइनिंग तिथि नहीं है',
      EXIT_REASON_INVALID:   'नौकरी छोड़ने का कारण दर्ज नहीं है या ग़लत है',
      BANK_KYC_CHANGE_PENDING: 'बैंक KYC में बदलाव अभी भी लंबित है',
      KYC_CONFLICT_ACROSS_UANS: 'आपका बैंक KYC अलग-अलग UAN में टकरा रहा है'
    },

    moneyHead: 'आपका पैसा, सीधी भाषा में',
    yourShare: 'आपकी सैलरी से कटा',
    employerShare: 'नियोक्ता ने जमा किया',
    pensionShare: 'पेंशन के लिए रखा (EPS)',
    interestYtd: 'इस साल मिला ब्याज',
    totalWithdrawable: 'आप निकाल सकते हैं',
    pensionNote: 'पेंशन वाला हिस्सा अलग नियमों से चलता है और सामान्य निकासी में नहीं आता।',
    passbookHead: 'महीने दर महीने',
    monthMissing: 'कुछ जमा नहीं हुआ',
    gapWarnHead: n => `${n} महीने बिना जमा के`,
    gapWarnBody: 'अगर आपकी सैलरी स्लिप में इन महीनों का PF कटा दिखता है, तो वह पैसा आपका बकाया है और वसूला जा सकता है।',
    chaseEmployer: 'नियोक्ता को पत्र लिखवाएँ',
    showAll: 'सभी महीने दिखाएँ',
    showLess: 'कम दिखाएँ',

    claimsHead: 'आप क्या दावा कर सकते हैं',
    formName: {
      FORM_19:  'अंतिम निपटान (फ़ॉर्म 19)',
      FORM_10C: 'पेंशन निकासी (फ़ॉर्म 10C)',
      FORM_31:  'नौकरी के दौरान अग्रिम (फ़ॉर्म 31)'
    },
    formDesc: {
      FORM_19:  'नौकरी छोड़ने के बाद अपना पूरा EPF बैलेंस निकालें।',
      FORM_10C: '10 साल से कम नौकरी पर पेंशन अंशदान एकमुश्त निकालें।',
      FORM_31:  'नौकरी करते हुए किसी ख़ास ज़रूरत के लिए कुछ हिस्सा निकालें।'
    },
    eligible: 'आप यह भर सकते हैं',
    notEligible: 'अभी नहीं भर सकते',
    upTo: 'अधिकतम',
    reason: {
      stillEmployed:  'आप अभी नौकरी में हैं। यह नौकरी छोड़ने के बाद के लिए है।',
      coolingPeriod:  'अंतिम निपटान के लिए पूरे 2 महीने बेरोज़गार रहना ज़रूरी है।',
      pensionLocked:  'आपकी 10 साल की सेवा पूरी हो चुकी है, इसलिए यह एकमुश्त रकम नहीं बल्कि 58 की उम्र से मासिक पेंशन बनेगी। यह आमतौर पर कहीं ज़्यादा मूल्यवान है।',
      advanceNeedsService: 'अग्रिम उनके लिए है जो अभी सेवा में हैं।'
    },
    unlocksIn: d => `${d} दिन में खुलेगा`,
    unlocksNote: 'अच्छी बात: आपके सुधारों में भी लगभग इतना ही समय लगेगा। अभी शुरू करें, जिस दिन यह खुलेगा आप तैयार होंगे।',
    choosePurpose: 'पैसा किस काम के लिए चाहिए?',
    purpose: {
      medical:    'इलाज',
      marriage:   'शादी',
      education:  'पढ़ाई',
      house:      'घर ख़रीदना या बनाना',
      repayHome:  'होम लोन चुकाना',
      calamity:   'प्राकृतिक आपदा',
      unemployed: 'बेरोज़गारी'
    },
    needsMoreService: n => `${Math.ceil(n / 12)} साल की सेवा और चाहिए`,
    purposeNeedsExit: 'सिर्फ़ नौकरी छोड़ने के बाद',
    capIs: 'सीमा:',
    fileThis: 'यह दावा भरें',
    fixFirst: 'पहले अपना रिकॉर्ड ठीक करें',

    fileHead: 'भरने से पहले',
    youWillGet: 'आपको मिलना चाहिए',
    afterTax: 'टैक्स के बाद',
    tdsHead: 'स्रोत पर कर कटौती (TDS)',
    tdsNone: 'कोई TDS नहीं। आपकी 5 साल की सेवा पूरी है।',
    tdsUnder50k: 'कोई TDS नहीं। रकम 50,000 रुपये से कम है।',
    tdsPanSeeded: r => `${r}% TDS, क्योंकि आपकी सेवा 5 साल से कम है।`,
    tdsNoPan: r => `${r}% TDS, क्योंकि आपका PAN नहीं जुड़ा। PAN होता तो 10% लगता।`,
    tdsAvoidable: a => `भरने से पहले PAN जोड़ें और ${a} बचाएँ।`,
    speedHead: 'कितनी जल्दी आएगा',
    autoYes: d => `स्वतः निपटान: लगभग ${d} कार्यदिवस`,
    autoNo: d => `सामान्य प्रक्रिया: ${d} दिन तक`,
    autoBasis: 'आपका दावा स्वतः निपटान की सभी शर्तें पूरी करता है, इसलिए मैनुअल जाँच नहीं होगी।',
    charterBasis: 'EPFO का नागरिक चार्टर पूरे दावे के लिए 20 दिन का वादा करता है। हम घड़ी चलाएँगे और देर होने पर बताएँगे।',
    conditionsHead: 'स्वतः निपटान की शर्तें',
    cond: {
      underCeiling:  'रकम 5,00,000 रुपये की सीमा में है',
      aadhaarSeeded: 'आधार जुड़ा और सत्यापित है',
      bankVerified:  'बैंक खाता सत्यापित है',
      nameMatches:   'नाम आधार से बिल्कुल मेल खाता है',
      dobMatches:    'जन्मतिथि आधार से मेल खाती है'
    },
    confirmFile: 'पुष्टि करें और भरें',
    filingMock: 'यह प्रोटोटाइप है। EPFO को कुछ नहीं भेजा जाता।',
    filedHead: 'दावा भर दिया गया',
    filedBody: 'हम आपके लिए 20 दिन की घड़ी देखेंगे और EPFO के देर करते ही बता देंगे।',
    trackIt: 'इस दावे को देखें',

    trackHead: 'आपके दावे',
    noClaims: 'आपने अभी कुछ नहीं भरा है।',
    stage: {
      submitted:    'दावा जमा हुआ',
      received:     'PF कार्यालय को मिला',
      underProcess: 'प्रक्रिया में',
      approved:     'भुगतान के लिए स्वीकृत',
      settled:      'पैसा आपके बैंक भेजा गया',
      rejected:     'रद्द'
    },
    stageNote: {
      submitted:    'आपका दावा आधार OTP से हस्ताक्षरित हो गया है।',
      received:     'दावा आपके UAN वाले क्षेत्रीय कार्यालय पहुँच गया।',
      underProcess: 'क्लर्क आपका KYC और सेवा इतिहास जाँच रहा है। ज़्यादातर दावे यहीं रद्द होते हैं।',
      approved:     'भुगतान अधिकृत होकर ट्रांसफ़र के लिए भेज दिया गया।',
      settled:      'अपना बैंक खाता देखें। आमतौर पर 24 घंटे में दिख जाता है।',
      rejected:     'दावा बिना भुगतान बंद कर दिया गया। कारण ठीक करके दोबारा भर सकते हैं।'
    },
    dayOf: (a, b) => `${b} में से ${a} दिन`,
    onTime: 'वादे के समय के भीतर',
    overdue: n => `वादे के 20 दिन से ${n} दिन ऊपर`,
    escalateHead: 'EPFO को देर हो गई',
    escalateBody: '20 दिन से ज़्यादा लंबित दावा शिकायत है, इंतज़ार नहीं। हमने आपके लिए लिख दी है।',
    escalate: 'मेरी शिकायत लिखें',
    grievanceIntro: 'इसे EPFiGMS शिकायत पोर्टल पर दर्ज करें। पंजीकरण संख्या सँभालकर रखें — आगे बढ़ाने में काम आएगी।',

    rejectedHead: 'यह दावा रद्द हुआ',
    rejectedOn: 'रद्द हुआ',
    epfoSaid: 'EPFO ने लिखा:',
    weTranslated: 'इसका असल मतलब',
    recoverHead: 'यह पैसा कैसे पाएँ',
    refile: 'रद्द होने पर अपील नहीं होती — कारण ठीक करके दोबारा भरते हैं। कुछ खोता नहीं, बैलेंस आपका ही रहता है।',
    decodeHead: 'रद्द होने का कारण समझें',
    decodeSub: 'कोई टिप्पणी समझ नहीं आई? सबसे मिलती-जुलती चुनें।',

    helpHead: 'ईमानदार बातें',
    whatsRealHead: 'क्या असली है और क्या नक़ली',
    whatsRealBody: [
      'रद्द होने के नियम, दावा फ़ॉर्म, पात्रता शर्तें, कर नियम, 5,00,000 रुपये की स्वतः निपटान सीमा और 20 दिन का नागरिक चार्टर — ये सब EPFO के प्रकाशित नियमों पर आधारित हैं।',
      'हर सदस्य रिकॉर्ड, बैलेंस, पासबुक प्रविष्टि, दावा संख्या और रद्द टिप्पणी काल्पनिक है। कोई असली व्यक्ति या खाता नहीं दर्शाया गया।',
      'कोई बैकएंड नहीं है और EPFO से किसी तरह का कोई संपर्क नहीं है। लॉगिन सिर्फ़ एक स्थानीय फ़ाइल से नंबर मिलाता है।',
      'आपका टाइप किया कुछ भी आपके फ़ोन से बाहर नहीं जाता। प्रगति सिर्फ़ आपके ब्राउज़र में सहेजी जाती है।',
      'टेबल D पेंशन आँकड़ा और अग्रिम सीमाएँ सरलीकृत अनुमान हैं, EPFO की अपनी गणना का विकल्प नहीं।',
      'पत्र और शिकायतें हिंदी और अंग्रेज़ी, दोनों में उपलब्ध हैं। कॉपी करने से पहले मसौदे को अंग्रेज़ी में बदला जा सकता है, क्योंकि कई HR विभाग और शिकायत पोर्टल उसे पसंद करते हैं।'
    ],
    scaleHead: 'असल में यह कैसे चलेगा',
    scaleBody: [
      'जाँच को सिर्फ़ उन क्षेत्रों की पढ़ने-भर की पहुँच चाहिए जो EPFO के पास पहले से हैं: KYC स्थिति, निकास तिथि, UAN संख्या और पासबुक महीने। कोई नया डेटा संग्रह नहीं।',
      'नियमों की सूची ही असली उत्पाद है। यह एक संस्करण-बद्ध सूची है जिसे EPFO कर्मचारी ऐप अपडेट किए बिना बदल सकें, ताकि नया रद्द कारण उसी हफ़्ते नई पूर्व-जाँच बन जाए।',
      'सबसे मज़बूत रूप यह ऐप है ही नहीं — यह जाँच EPFO पोर्टल के भीतर चले और ऐसा दावा स्वीकार ही न करे जो निश्चित रूप से विफल होगा।',
      'हर मसौदा आपके ही फ़ोन पर बनता है। कोई दावा डेटा हम तक पहुँचने की ज़रूरत नहीं।'
    ],
    sourcesHead: 'आँकड़े कहाँ से आए',
    resetDemo: 'डेमो रीसेट करें',
    logout: 'लॉग आउट'
  }
};

export function makeT (lang) {
  const dict = STRINGS[lang] || STRINGS.en;
  const fallback = STRINGS.en;
  return function t (path, ...args) {
    const walk = obj => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    let v = walk(dict);
    if (v === undefined) v = walk(fallback);
    if (typeof v === 'function') return v(...args);
    return v === undefined ? path : v;
  };
}
