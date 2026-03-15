/* ═══ CONTRAQ — LANDING ═══
   ROI animations, trade verticals, FAQ, pricing, DOMContentLoaded ROI
   Lines 8029-8258 from contraq-v77
═══════════════════════════════════════════ */

var _roiAnim = {};
function roiAnimTo(elId, target, prefix, suffix, decimals) {
  prefix = prefix || ''; suffix = suffix || ''; decimals = decimals || 0;
  var el = document.getElementById(elId);
  if (!el) return;
  if (_roiAnim[elId]) cancelAnimationFrame(_roiAnim[elId]);
  var from = parseFloat(el.dataset.val || '0');
  el.dataset.val = target;
  var start = null, dur = 500;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    var cur = from + (target - from) * eased;
    if (decimals > 0) {
      el.textContent = prefix + cur.toFixed(decimals) + suffix;
    } else {
      el.textContent = prefix + Math.round(cur).toLocaleString('en-GB') + suffix;
    }
    if (p < 1) _roiAnim[elId] = requestAnimationFrame(step);
  }
  _roiAnim[elId] = requestAnimationFrame(step);
}

/* ── ROI range-based methodology ─────────────────────────────────
   All rates use conservative/optimistic bands instead of false-precision
   single-point estimates.

   VO leakage:
     Conservative 3% — RICS Contracts in Use Survey 2022, lower-quartile
       variation rate on subcontracts < £500k
     Optimistic 8% — Construction News / Arcadis UK Market View 2023,
       average unresolved VO value on M&E packages

   Retention unclaimed:
     Conservative 1% — Pye Tait / BEIS "Retentions in the Construction
       Industry" 2017, partial non-recovery rate
     Optimistic 3% — same report, full non-recovery on insolvency-affected
       contracts; Build UK survey 2022

   Admin time reduction:
     Conservative 25% — McKinsey "Reinventing Construction" 2020,
       digitisation productivity gain lower bound
     Optimistic 45% — same study, upper bound for document-heavy
       subcontractor admin workflows

   Effective admin cost:
     £30/hr — ONS ASHE 2023, median hourly rate for construction
       admin/commercial roles (SOC 4163), grossed up 18% for employer NI
       and pension
─────────────────────────────────────────────────────────────────── */

function roiUpdate() {
  var eng = parseInt(document.getElementById('roi-eng').value);
  var proj = parseInt(document.getElementById('roi-proj').value);
  var pval = parseInt(document.getElementById('roi-pval').value);
  var hrs = parseInt(document.getElementById('roi-hrs').value);

  // Update slider labels
  document.getElementById('roi-eng-val').textContent = eng;
  document.getElementById('roi-proj-val').textContent = proj;
  document.getElementById('roi-pval-val').textContent = '\u00a3' + Math.round(pval/1000) + 'k';
  document.getElementById('roi-hrs-val').textContent = hrs + ' hrs';

  // Range-based calculations — conservative and optimistic bounds
  var monthlyTurnover = proj * pval;
  var annualTurnover = monthlyTurnover * 12;
  var monthlyAdmin = hrs * 4.33;

  // VO recovery: 3% conservative, 8% optimistic
  var voLo = Math.round(monthlyTurnover * 0.03);
  var voHi = Math.round(monthlyTurnover * 0.08);

  // Admin hours saved: 25% conservative, 45% optimistic
  var hrsLo = Math.round(monthlyAdmin * 0.25);
  var hrsHi = Math.round(monthlyAdmin * 0.45);

  // Retention recovered: 1% conservative, 3% optimistic (annual)
  var retLo = Math.round(annualTurnover * 0.01);
  var retHi = Math.round(annualTurnover * 0.03);

  // Plan selection
  var subCost, planName;
  if (eng <= 2 && proj <= 5) { subCost = 49; planName = 'Starter'; }
  else if (eng <= 5) { subCost = 149; planName = 'Professional'; }
  else { subCost = 349; planName = 'Business'; }

  // Total annual: VO monthly × 12 + time savings monthly × 12 + retention annual
  var adminRate = 30;  // £30/hr — ONS ASHE 2023
  var annualLo = Math.round((voLo * 12) + (hrsLo * adminRate * 12) + retLo);
  var annualHi = Math.round((voHi * 12) + (hrsHi * adminRate * 12) + retHi);
  var annualCost = subCost * 12;
  var roiLoX = annualLo / annualCost;
  var roiHiX = annualHi / annualCost;

  // Animate range outputs (low end)
  roiAnimTo('roi-o-vo-lo', voLo, '\u00a3', '');
  roiAnimTo('roi-o-vo-hi', voHi, '\u00a3', '');
  roiAnimTo('roi-o-hrs-lo', hrsLo, '', '');
  roiAnimTo('roi-o-hrs-hi', hrsHi, '', '');
  roiAnimTo('roi-o-ret-lo', retLo, '\u00a3', '');
  roiAnimTo('roi-o-ret-hi', retHi, '\u00a3', '');
  roiAnimTo('roi-o-mult-lo', roiLoX, '', '\u00d7', 1);
  roiAnimTo('roi-o-mult-hi', roiHiX, '', '\u00d7', 1);
  roiAnimTo('roi-o-annual-lo', annualLo, '\u00a3', '');
  roiAnimTo('roi-o-annual-hi', annualHi, '\u00a3', '');

  // Plan recommendation (instant text)
  document.getElementById('roi-o-plan').textContent = planName;
  document.getElementById('roi-o-price').textContent = '\u00a3' + subCost + '/mo';
}

// Init on page load
document.addEventListener('DOMContentLoaded', function() { if (document.getElementById('roi-eng')) roiUpdate(); });

/* ── Trade Vertical Landing Pages ──────────────────────────── */
var TRADE_VERTICALS = {
  drylining: {
    eyebrow: 'For drylining & ceiling subcontractors',
    heroH1: 'Built for <em>drylining subcontractors</em> working commercial sites.',
    heroSub: 'CONTRAQ reads your NBS Section K specs, builds structured m\u00B2 quotes from PDF enquiry packs, tracks every partition type across every floor \u2014 and chases payment applications so you don\u2019t have to.',
    proofStrip: ['\u2713 Partition spec extraction','\u2713 m\u00B2 rate pricing','\u2713 Works with any PDF tender pack'],
    painH2: 'The margin killers every dryliner knows.',
    pains: [
      {icon:'\uD83D\uDCCB',title:'Rev D specs arrived \u2014 you\u2019re still pricing Rev B',desc:'The architect issued a new partition schedule three weeks ago. It\u2019s buried in an email thread with 40 attachments. Your quote is based on single-layer Gyproc WallBoard and they\u2019ve changed it to twin-layer Fireline. You only find out when your fixer opens the first pack on site.'},
      {icon:'\uD83D\uDCB0',title:'Variations done, nothing in writing',desc:'You\u2019ve added 14 extra linear metres of bulkhead on Level 3 because the services route changed. The site manager agreed verbally. You\u2019ve got no VO number, no written instruction, and the main contractor\u2019s QS is pretending the conversation never happened.'},
      {icon:'\uD83D\uDCC5',title:'Three jobs, one taper, no scheduler',desc:'Your best taper is booked on Wembley but the Battersea snagging list just landed. You\u2019re juggling WhatsApp messages and a paper diary. Someone\u2019s going to the wrong site tomorrow morning and you won\u2019t know until the foreman calls you at 7am.'}
    ],
    featH2: 'Every problem above has a specific fix in CONTRAQ.',
    features: [
      {icon:'\uD83D\uDCC4',label:'AI Quote Builder with NBS Section K parsing',desc:'Upload a PDF enquiry pack and CONTRAQ extracts partition specifications \u2014 types, fire ratings, acoustic performance, layer build-ups, and linear metres. Price against your rate book in minutes, not hours. When the spec changes, re-price from the new document with your existing rates intact.'},
      {icon:'\u270D\uFE0F',label:'Site Journal with variation tracking',desc:'Log every verbal instruction on site with a timestamp, photo, and the name of who gave it. CONTRAQ\u2019s AI flags when a diary entry may constitute grounds for a compensation event or variation order \u2014 so you document it properly before the QS forgets they asked.'},
      {icon:'\uD83D\uDCC6',label:'Drag-and-drop Engineer Scheduler',desc:'See every fixer, taper, and labourer across every site on one Gantt view. Drag operatives between jobs, set zone-level assignments, and get automatic clash alerts when you\u2019ve double-booked someone.'},
      {icon:'\uD83D\uDCE8',label:'Payment application chasing',desc:'CONTRAQ tracks every interim application, logs when it was submitted, flags when a pay-less notice is overdue, and sends automated follow-ups. You\u2019ll know exactly which applications are stuck and for how long.'}
    ],
    testiQuote:'"We were pricing partitions from PDF schedules in Excel \u2014 it took a full day per tender. CONTRAQ cut that to two hours and we stopped missing spec revisions. The first VO it caught paid for six months of subscription."',
    testiAttr:'\u2014 Placeholder \u2014 Your drylining customer here',
    ctaH2:'Stop pricing partition specs on the back of a drawing register.',
    ctaSub:'Every day without a system is another variation you can\u2019t prove, another taper on the wrong site, and another payment application that sits in someone\u2019s inbox until next month\u2019s valuation.'
  },

  groundworks: {
    eyebrow: 'For groundworks & civils subcontractors',
    heroH1: 'Built for <em>groundworks subcontractors</em> running plant on commercial sites.',
    heroSub: 'CONTRAQ tracks every machine, every load, every daywork sheet, and every interim valuation \u2014 so your payment application matches what the RE measures on site.',
    proofStrip: ['\u2713 Plant & daywork tracking','\u2713 Cut-and-fill quantity logging','\u2713 Works with NEC & JCT contracts'],
    painH2: 'The margin killers every groundworker knows.',
    pains: [
      {icon:'\u26A0\uFE0F',title:'Unforeseen ground conditions \u2014 no early warning on file',desc:'Your 13-tonner hit contaminated fill at 1.2m that wasn\u2019t in the SI report. You told the site agent on Tuesday. It\u2019s now Friday and you still haven\u2019t issued an NEC early warning notice. The 8-week clock for your compensation event is already ticking and nobody in your office knows.'},
      {icon:'\uD83D\uDE9C',title:'Three machines on hire, two sitting idle',desc:'The 6-tonner has been parked at the Croydon job for nine days because the piling contractor hasn\u2019t finished. You\u2019re paying \u00A3450/day hire and the main contractor won\u2019t cover standing time without a written record of the delay and its cause.'},
      {icon:'\uD83D\uDCCB',title:'Daywork sheets signed but never valued',desc:'Your foreman gets daywork sheets signed every day. They go into a folder on the passenger seat of his Transit. By the time they reach the office, three are missing and the QS says the rest were submitted outside the contractual notice period.'}
    ],
    featH2: 'Every problem above has a specific fix in CONTRAQ.',
    features: [
      {icon:'\uD83D\uDEA8',label:'Automated NEC & JCT notice tracking',desc:'CONTRAQ monitors your site diary entries and flags potential compensation events, early warning triggers, and EOT-qualifying delays. It calculates your contractual notice deadline and alerts you before time runs out \u2014 so you never lose a claim to a time bar again.'},
      {icon:'\uD83D\uDE9C',label:'Plant register with standing time logging',desc:'Log every machine across every site with daily status: working, idle, off-hired. CONTRAQ calculates standing time costs automatically and links them to the delay event in your diary \u2014 building the evidence you need to recover hire costs from the main contractor.'},
      {icon:'\uD83D\uDCDD',label:'Digital daywork capture',desc:'Your foreman logs daywork on his phone: operatives, plant, materials, hours, and the authorising signature. It syncs to the office in real time. No more lost sheets, no more missed notice periods, no more unsigned paperwork discovered three weeks later.'},
      {icon:'\uD83D\uDCB0',label:'Interim valuation & payment tracking',desc:'Track every interim application against the RE\u2019s measured quantities. CONTRAQ flags under-certifications, logs retention deductions, and chases overdue payments under the Construction Act \u2014 with the exact dates and statutory deadlines.'}
    ],
    testiQuote:'"We lost a \u00A332,000 compensation event on the A12 job because nobody filed the early warning in time. That was the week we started looking for a system. CONTRAQ would have flagged it on day one."',
    testiAttr:'\u2014 Placeholder \u2014 Your groundworks customer here',
    ctaH2:'Your diggers don\u2019t run on spreadsheets. Your business shouldn\u2019t either.',
    ctaSub:'Every unmeasured load, every unsigned daywork sheet, and every missed early warning is money you earned and didn\u2019t collect. CONTRAQ closes the gap between the work you do on site and the money that reaches your bank account.'
  },

  firestopping: {
    eyebrow: 'For fire stopping & passive fire protection subcontractors',
    heroH1: 'Built for <em>fire stopping subcontractors</em> where every seal needs a paper trail.',
    heroSub: 'CONTRAQ tracks every installer, every product batch, every compartment sign-off, and every FIRAS-accredited operative \u2014 so when the building safety regulator asks, you\u2019re ready.',
    proofStrip: ['\u2713 FIRAS & IFC cert tracking','\u2713 Compartment sign-off workflow','\u2713 Post-Grenfell compliance ready'],
    painH2: 'The margin killers every fire stopper knows.',
    pains: [
      {icon:'\uD83D\uDD25',title:'70 penetrations sealed, zero recorded',desc:'Your installers sealed 70 service penetrations on Level 4 last week. The photos are on three different phones. The product batch numbers weren\u2019t logged. The building safety manager wants compartment-level traceability and you\u2019re going back to photograph seals that are already covered by ceiling tiles.'},
      {icon:'\uD83D\uDCCB',title:'FIRAS audit next month \u2014 records are in a shoebox',desc:'Your FIRAS third-party certification audit is in four weeks. The assessor wants to see installer competency records, product data sheets, site inspection reports, and photographic evidence for a sample of penetrations. Half of it is in a lever arch file. The other half is in someone\u2019s email.'},
      {icon:'\uD83D\uDCB0',title:'Main contractor won\u2019t value the variations',desc:'The architect changed the fire strategy after your tender. Half the penetrations are now larger than the tested detail covers. You need Hilti CFS-BL firebatt instead of acrylic sealant. The cost difference is \u00A318 per penetration across 400 penetrations. The QS says it\u2019s within your lump sum.'}
    ],
    featH2: 'Every problem above has a specific fix in CONTRAQ.',
    features: [
      {icon:'\uD83D\uDCF1',label:'Digital fire seal log with photo capture',desc:'Every penetration logged on-site: location, seal type, product used, batch number, installer name, and timestamped photo. Data syncs to a compartment-level register that matches the fire strategy drawing \u2014 ready for the building safety regulator or a FIRAS assessor at any time.'},
      {icon:'\uD83D\uDEE1\uFE0F',label:'Certification & accreditation tracker',desc:'Track every FIRAS installer card, IFC qualification, asbestos awareness cert, and CSCS card in one place. CONTRAQ sends 30-day and 7-day expiry alerts so you never send an unaccredited installer to site \u2014 and never fail an audit because a card lapsed two weeks ago.'},
      {icon:'\u270D\uFE0F',label:'Variation & fire strategy change tracking',desc:'When the fire strategy changes, log it. CONTRAQ links the new detail to the original tender specification, calculates the cost delta per penetration, and generates a variation submission with the evidence attached. No more verbal agreements that evaporate at valuation.'},
      {icon:'\uD83D\uDCC4',label:'AI-assisted quoting from fire specs',desc:'Upload a fire strategy document or NBS Section P spec and CONTRAQ extracts penetration types, sizes, fire ratings, and quantities. Price them against your rate book with product-specific costs \u2014 and when the spec changes mid-project, re-price the delta in minutes.'}
    ],
    testiQuote:'"Post-Grenfell, every compartment needs full traceability. We were doing it on spreadsheets with 40 columns. CONTRAQ gave us a proper seal register with photos, batch numbers, and installer records \u2014 our FIRAS assessor said it was the best documentation they\u2019d seen from a sub our size."',
    testiAttr:'\u2014 Placeholder \u2014 Your fire stopping customer here',
    ctaH2:'Every seal you can\u2019t evidence is a seal you might have to redo for free.',
    ctaSub:'The building safety regulator doesn\u2019t accept WhatsApp photos and lever arch files. CONTRAQ builds the audit trail as your installers work \u2014 not three weeks later when someone asks for it.'
  }
};

function renderTradePage(tradeKey) {
  var t = TRADE_VERTICALS[tradeKey];
  if (!t) return;

  document.getElementById('trade-eyebrow').textContent = t.eyebrow;
  document.getElementById('trade-hero-h1').innerHTML = t.heroH1;
  document.getElementById('trade-hero-sub').textContent = t.heroSub;
  document.getElementById('trade-pain-h2').textContent = t.painH2;
  document.getElementById('trade-feat-h2').textContent = t.featH2;
  document.getElementById('trade-testi-quote').textContent = t.testiQuote;
  document.getElementById('trade-testi-attr').textContent = t.testiAttr;
  document.getElementById('trade-cta-h2').textContent = t.ctaH2;
  document.getElementById('trade-cta-sub').textContent = t.ctaSub;

  // Proof strip
  var ps = document.getElementById('trade-proof-strip');
  ps.innerHTML = t.proofStrip.map(function(s) {
    return '<span style="font-family:var(--mono);font-size:.72rem;color:var(--off3)"><span style="color:var(--lime);font-weight:700">' + s.charAt(0) + '</span>' + s.slice(1) + '</span>';
  }).join('');

  // Pain cards
  var pg = document.getElementById('trade-pain-grid');
  pg.innerHTML = t.pains.map(function(p) {
    return '<div style="background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--radius2);padding:1.5rem;position:relative">'
      + '<div style="font-size:1.5rem;margin-bottom:.5rem">' + p.icon + '</div>'
      + '<div style="font-weight:700;color:var(--white);font-size:.92rem;margin-bottom:.5rem">' + p.title + '</div>'
      + '<div style="font-size:.82rem;color:var(--off3);line-height:1.6">' + p.desc + '</div>'
      + '</div>';
  }).join('');

  // Feature cards
  var fl = document.getElementById('trade-feat-list');
  fl.innerHTML = t.features.map(function(f, i) {
    var isEven = i % 2 === 0;
    return '<div style="display:flex;align-items:flex-start;gap:1.3rem;background:var(--bg2);border:1.5px solid var(--border);border-left:3px solid ' + (isEven ? 'var(--lime)' : 'var(--orange)') + ';border-radius:var(--radius2);padding:1.5rem">'
      + '<div style="font-size:1.5rem;flex-shrink:0;margin-top:.1rem">' + f.icon + '</div>'
      + '<div>'
      + '<div style="font-weight:700;color:var(--white);font-size:.92rem;margin-bottom:.4rem">' + f.label + '</div>'
      + '<div style="font-size:.82rem;color:var(--off3);line-height:1.6">' + f.desc + '</div>'
      + '</div></div>';
  }).join('');
}

function navTrade(tradeKey) {
  renderTradePage(tradeKey);
  nav('trade');
}

function toggleFaq(el) {
  var a = el.nextElementSibling;
  var wasOpen = el.classList.contains('open');
  // Close all
  document.querySelectorAll('.pfaq-q.open').forEach(function(q) {
    q.classList.remove('open');
    q.nextElementSibling.classList.remove('open');
  });
  // Toggle clicked
  if (!wasOpen) {
    el.classList.add('open');
    a.classList.add('open');
  }
}

function setPricingPeriod(period) {
  var annual = period === 'annually';
  document.getElementById('ptbtn-m').classList.toggle('on', !annual);
  document.getElementById('ptbtn-y').classList.toggle('on', annual);
  document.getElementById('p1').textContent = annual ? '£39' : '£49';
  document.getElementById('ps1').textContent = annual ? 'billed annually · £468/yr · up to 2 users' : 'billed monthly · up to 2 users';
  document.getElementById('p2').textContent = annual ? '£119' : '£149';
  document.getElementById('ps2').textContent = annual ? 'billed annually · £1,428/yr · up to 5 users' : 'billed monthly · up to 5 users';
  document.getElementById('p3').textContent = annual ? '£279' : '£349';
  document.getElementById('ps3').textContent = annual ? 'billed annually · £3,348/yr · unlimited users' : 'billed monthly · unlimited users';
}

function selectPlanAndRegister(plan) {
  STATE.regPlan = plan;
  nav('register');
  setTimeout(function(){
    ['starter','professional','business'].forEach(function(p){
      document.getElementById('po-'+p)&&document.getElementById('po-'+p).classList.remove('sel');
    });
    if (document.getElementById('po-'+plan)) document.getElementById('po-'+plan).classList.add('sel');
  }, 100);
}

/* ══════════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════════ */
