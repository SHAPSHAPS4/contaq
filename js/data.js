/* ═══ CONTRAQ — DATA ═══
   Mock data arrays, demo users, projects, engineers, etc.
   Lines 5553-7874 from contraq-v77
═══════════════════════════════════════════ */

/* ── SVG Icon Map — must be defined before data arrays that reference it ── */
if (typeof ICON === 'undefined') {
  var ICON = {
    money:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    building:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
    clipboard:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    package:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    calendar:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    ruler:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3zM3 9h18M3 15h18M9 3v18"/></svg>',
    receipt:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>',
    worker:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    alert:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    file:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    chart:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    edit:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    image:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
  };
}

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

var DEMO_USER = {
  fname:'James', lname:'Mitchell', email:'demo@contraq.co.uk',
  company:'Mitchell Insulation Ltd', plan:'professional', trialDays:5, role:'demo',
  trade:'insulation', trades:['insulation']
};

/* ─────────────────────────────────────────────────────────────────
   FOUNDING MEMBER PROGRAMME — update this number to reflect reality
   ───────────────────────────────────────────────────────────────── */
var ADMIN_USER = {
  fname:'Admin', lname:'User', email:'admin@contraq.co.uk',
  company:'CONTRAQ HQ', plan:'business', trialDays:0, role:'admin'
};

var FOUNDING_SPOTS_TAKEN = 7;  /* ← change me: 0–20 */
var FOUNDING_SPOTS_TOTAL = 20;

/* ──── ADMIN USERS LIST (mock data) ──────────────────────────── */
var ADMIN_USERS = [
  {id:'u1', fname:'James',   lname:'Mitchell', email:'demo@contraq.co.uk',   company:'Mitchell Insulation Ltd', plan:'professional',       joined:'2025-09-12', lastLogin:'2026-03-10', status:'active',    logins30:28},
  {id:'u2', fname:'Sarah',   lname:'Barnes',   email:'s.barnes@insupro.co.uk', company:'InsuPro Ltd',            plan:'professional',       joined:'2025-10-04', lastLogin:'2026-03-08', status:'active',    logins30:14},
  {id:'u3', fname:'Tom',     lname:'Okafor',   email:'tokafor@mkinsul.com',   company:'MK Insulation',           plan:'business', joined:'2025-08-19', lastLogin:'2026-03-09', status:'active',    logins30:31},
  {id:'u4', fname:'Deborah', lname:'Walsh',    email:'d.walsh@caverncorp.co.uk','company':'Cavern Corp',          plan:'starter',       joined:'2025-11-01', lastLogin:'2026-02-14', status:'active',    logins30:9},
  {id:'u5', fname:'Lee',     lname:'Hargreaves',email:'lee@harginsul.com',    company:'Harg Insulation',         plan:'starter',       joined:'2025-12-15', lastLogin:'2026-01-22', status:'suspended', logins30:2},
  {id:'u6', fname:'Priya',   lname:'Nair',     email:'p.nair@thermoseal.uk',  company:'ThermoSeal UK',           plan:'professional',       joined:'2026-01-08', lastLogin:'2026-03-07', status:'active',    logins30:19},
  {id:'u7', fname:'Craig',   lname:'Foster',   email:'craig@fostrinsul.co.uk','company':'Fostr Insulation',      plan:'professional',       joined:'2026-01-22', lastLogin:'2026-02-28', status:'active',    logins30:11},
  {id:'u8', fname:'Anita',   lname:'Shah',     email:'a.shah@prothermal.co.uk','company':'Pro Thermal Ltd',      plan:'business', joined:'2026-02-03', lastLogin:'2026-03-09', status:'active',    logins30:24},
  {id:'u9', fname:'Marcus',  lname:'Ellis',    email:'m.ellis@insurefit.co.uk','company':'InsureFit',            plan:'professional',       joined:'2026-02-17', lastLogin:'2026-03-01', status:'active',    logins30:7},
  {id:'u10',fname:'Helen',   lname:'Cross',    email:'helen@crossinsulation.com','company':'Cross Insulation',   plan:'professional',       joined:'2026-03-01', lastLogin:'2026-03-05', status:'active',    logins30:4},
];

var PROJECTS = [
  {id:'p1',code:'PRJ-041',name:'Canary Wharf — Pipe Insulation Ph.2',client:'cl-2',clientName:'Aecom Ltd',value:284000,margin:22,status:'active',start:'2025-01-06',end:'2025-06-30',notes:'Phase 2 of CW development. Main plant room B2.',
   attachments:[
     {id:'att-p1-1',filename:'CW-Ph2-Insulation-Spec-RevC.pdf',type:'Specification',revision:'C',date:'2026-02-15',size:'2.4 MB'},
     {id:'att-p1-2',filename:'CW-Plant-Room-B2-Drawing-RevB.pdf',type:'Drawing',revision:'B',date:'2026-01-20',size:'5.1 MB'},
     {id:'att-p1-3',filename:'CW-Ph2-Programme-RevA.xlsx',type:'Programme',revision:'A',date:'2025-12-10',size:'320 KB'},
     {id:'att-p1-4',filename:'CW-Plant-Room-B2-Drawing-RevA.pdf',type:'Drawing',revision:'A',date:'2025-11-05',size:'4.8 MB'}
   ],
   folders:{
     drawings:[{id:'fd-p1-dr1',filename:'CW-Plant-Room-B2-Drawing-RevB.pdf',revision:'B',date:'2026-01-20',size:'5.1 MB',notes:'Latest GA — Rev B issued by Aecom 20 Jan'},{id:'fd-p1-dr2',filename:'CW-Plant-Room-B2-Drawing-RevA.pdf',revision:'A',date:'2025-11-05',size:'4.8 MB',notes:'Superseded'}],
     specs:[{id:'fd-p1-s1',filename:'CW-Ph2-Insulation-Spec-RevC.pdf',revision:'C',date:'2026-02-15',size:'2.4 MB',notes:'Current specification — Rev C'},{id:'fd-p1-s2',filename:'CW-Ph2-Insulation-Spec-RevB.pdf',revision:'B',date:'2025-12-01',size:'2.2 MB',notes:'Superseded'}],
     documents:[{id:'fd-p1-d1',filename:'CW-Ph2-Programme-RevA.xlsx',revision:'A',date:'2025-12-10',size:'320 KB',notes:'Site programme — Rev A'},{id:'fd-p1-d2',filename:'CW-B2-Coordination-Meeting-Notes.pdf',revision:'1',date:'2026-01-08',size:'95 KB',notes:'Coordination meeting minutes'}],
     purchaseOrder:[{id:'fd-p1-po1',filename:'Aecom-PO-2026-001.pdf',date:'2026-01-10',size:'180 KB',notes:'Client purchase order — £284,000'}],
     voQuote:[]
   },
   journal:[
     {id:'j-p1-1',date:'2026-02-10',title:'Missing Pipe Lagging',type:'Missing Materials',description:'Approx 40m of DN200 pipe section lagging missing from delivery PO-INS-002. Site hold pending replacement.  Notified Knauf rep.',author:'James Mitchell',edited:false},
     {id:'j-p1-2',date:'2026-01-28',title:'Access Delay — B2 Plant Room',type:'Hold Up',description:'Main contractor Morgan Sindall restricted access to B2 plant room until 03 Feb due to concrete curing works. Programme adjusted by 5 days.',author:'James Mitchell',edited:false},
     {id:'j-p1-3',date:'2026-01-14',title:'Site Induction Advisory',type:'Advisory',description:'All site personnel must complete updated RAMS before Monday. Hot works permit required for B2 zone. Fire marshal briefing 07:30 daily.',author:'Dave Harris',edited:false}
   ],
   quoteFiles:[
     {id:'qf-tq1-3',filename:'QTE-2026-001-Quote-RevC.xlsx',fileType:'Spreadsheet',revision:'C',date:'2025-12-10',size:'1.1 MB',status:'Latest',transferredFrom:'QTE-2026-001'},
     {id:'qf-tq1-2',filename:'QTE-2026-001-Quote-RevB.xlsx',fileType:'Spreadsheet',revision:'B',date:'2025-12-02',size:'1.0 MB',status:'Superseded',transferredFrom:'QTE-2026-001'},
     {id:'qf-tq1-1',filename:'QTE-2026-001-Quote-RevA.xlsx',fileType:'Spreadsheet',revision:'A',date:'2025-11-28',size:'940 KB',status:'Superseded',transferredFrom:'QTE-2026-001'}
   ],
   costs:{labour:99400,materials:80800,subcontract:32400,overhead:8920},billedToDate:123600,lastInvoiceDate:'2026-03-01'},
  {id:'p2',code:'PRJ-038',name:'Wembley Stadium — Ductwork Lagging',client:'cl-1',clientName:'Balfour Beatty',value:194000,margin:18,status:'active',start:'2024-11-01',end:'2025-04-30',notes:'Ductwork slab lagging throughout stadium plant rooms.',
   costs:{labour:67900,materials:55400,subcontract:27300,overhead:7280},billedToDate:48500,lastInvoiceDate:'2026-01-15',folders:{drawings:[{id:'fd-p2-dr1',filename:'Wembley-Ductwork-Layout-RevA.pdf',revision:'A',date:'2025-10-15',size:'4.2 MB',notes:'GA ductwork layout'}],specs:[{id:'fd-p2-s1',filename:'Wembley-Insulation-Spec-RevA.pdf',revision:'A',date:'2025-10-10',size:'560 KB',notes:'NBS Spec RevA'}],documents:[{id:'fd-p2-d1',filename:'Wembley-Programme-RevA.pdf',revision:'A',date:'2025-11-05',size:'210 KB',notes:'Site programme'}],purchaseOrder:[{id:'fd-p2-po1',filename:'Balfour-PO-DWK-2025-004.pdf',date:'2025-11-08',size:'145 KB',notes:'Framework PO — £194,000'}],voQuote:[{id:'fd-p2-vo1',filename:'VO-001-Additional-Hangers.xlsx',date:'2025-12-10',size:'88 KB',notes:'VO-001: Additional bracket hangers — £4,200'}]},quoteFiles:[{id:'qf-tq2-2',filename:'QTE-2026-002-Wembley-Quote-RevB.pdf',fileType:'PDF',revision:'B',date:'2025-10-28',size:'820 KB',status:'Latest',transferredFrom:'QTE-2026-002'},{id:'qf-tq2-1',filename:'QTE-2026-002-Wembley-Quote-RevA.pdf',fileType:'PDF',revision:'A',date:'2025-10-20',size:'790 KB',status:'Superseded',transferredFrom:'QTE-2026-002'}],journal:[
     {id:'j-p2-1',date:'2026-02-18',title:'Rockwool Delivery Short',type:'Missing Materials',description:'Rockwool RW60 slabs short by 12 packs on PO-DWK-001. Replacement delivery expected w/c 25 Feb. Ductwork lagging on hold in Zone C.',author:'James Mitchell',edited:false},
     {id:'j-p2-2',date:'2026-01-30',title:'Programme Update',type:'Advisory',description:'Client issued revised programme Rev C. Our insulation works now start 3 days later on 10 Feb. Updated site programme sent to team.',author:'Sarah Chen',edited:false}
   ]},
  {id:'p3',code:'PRJ-044',name:'Euston Station — HVAC Insulation',client:'cl-3',clientName:'Morgan Sindall',value:320000,margin:24,status:'active',start:'2025-02-01',end:'2025-09-30',notes:'Full HVAC insulation as part of HS2 enabling works.',
   costs:{labour:112000,materials:91200,subcontract:40000,overhead:12800},billedToDate:64800,lastInvoiceDate:'2026-02-20',folders:{drawings:[{id:'fd-p3-dr1',filename:'Euston-HVAC-Drawings-RevB.pdf',revision:'B',date:'2026-01-10',size:'3.2 MB',notes:'Latest GA — transferred from quote'},{id:'fd-p3-dr2',filename:'Euston-HVAC-Drawings-RevA.pdf',revision:'A',date:'2025-12-01',size:'3.0 MB',notes:'Superseded'}],specs:[{id:'fd-p3-s1',filename:'Euston-Insulation-Spec-RevA.docx',revision:'A',date:'2025-12-20',size:'210 KB',notes:'NBS Spec — transferred from quote'}],documents:[],purchaseOrder:[{id:'fd-p3-po1',filename:'Morgan-Sindall-PO-Euston.pdf',date:'2026-01-15',size:'175 KB',notes:'Client PO — £320,000'}],voQuote:[]},quoteFiles:[{id:'qf-tq3-2',filename:'QTE-2026-003-Euston-HVAC-Quote-RevB.xlsx',fileType:'Spreadsheet',revision:'B',date:'2025-12-15',size:'1.3 MB',status:'Latest',transferredFrom:'QTE-2026-003'}],journal:[
     {id:'j-p3-1',date:'2026-03-01',title:'HVAC Unit Access Issue',type:'Hold Up',description:'Access to roof plant level blocked until structural sign-off by engineer. Estimated 4-day delay. Informed client project manager.',author:'James Mitchell',edited:false}
   ]},
  {id:'p4',code:'PRJ-040',name:'Canary Wharf — Fire Stopping Works',client:'cl-4',clientName:'Mace Group',value:94000,margin:20,status:'pending',start:'2025-03-15',end:'2025-08-31',notes:'High-spec residential. Premium finishes required.',
   folders:{drawings:[],specs:[],documents:[],purchaseOrder:[],voQuote:[]},costs:{labour:54600,materials:44700,subcontract:15600,overhead:6240},billedToDate:0,lastInvoiceDate:''},
  {id:'p5',code:'PRJ-036',name:"Tottenham Hale — Ductwork & Lagging",client:'cl-5',clientName:'Skanska',value:178000,margin:21,status:'active',start:'2024-12-01',end:'2025-07-31',notes:'Ductwork lagging and insulation throughout plant areas.',
   costs:{labour:73500,materials:60900,subcontract:25200,overhead:8400},billedToDate:38900,lastInvoiceDate:'2026-03-05'},
  {id:'p6',code:'PRJ-033',name:"Guy's Hospital — Services Refurb",client:'cl-6',clientName:'Vinci Construction',value:145000,margin:17,status:'completed',start:'2024-08-01',end:'2025-01-31',notes:'Infection-control-rated insulation throughout.',
   costs:{labour:50750,materials:41325,subcontract:20300,overhead:7975},billedToDate:29200,lastInvoiceDate:'2026-01-31'},
  {id:'p7',code:'PRJ-045',name:'Battersea Regen — Trace Heating',client:'cl-7',clientName:'ISG Ltd',value:92000,margin:26,status:'pending',start:'2025-04-01',end:'2025-08-15',notes:'Trace heating to external pipework and roof drains.',
   costs:{labour:32200,materials:23000,subcontract:9200,overhead:3680},billedToDate:0,lastInvoiceDate:''},
];

var INVOICES = [
  {id:'inv-1',ref:'INV-2026-0001',client:'cl-1',clientName:'Balfour Beatty',project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',amount:48500,date:'2026-01-15',due:'2026-02-14',status:'paid',desc:'Payment application 1 — Ductwork lagging works Phase 1'},
  {id:'inv-2',ref:'INV-2026-0002',client:'cl-2',clientName:'Aecom Ltd',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',amount:71200,date:'2026-02-01',due:'2026-03-03',status:'paid',desc:'Payment application 2 — Pipe insulation B2 plant room'},
  {id:'inv-3',ref:'INV-2026-0003',client:'cl-3',clientName:'Morgan Sindall',project:'p3',projectName:'Euston Station — HVAC Insulation',amount:64800,date:'2026-02-20',due:'2026-03-22',status:'overdue',desc:'Payment application 1 — HVAC insulation Phase 1'},
  {id:'inv-4',ref:'INV-2026-0004',client:'cl-2',clientName:'Aecom Ltd',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',amount:52400,date:'2026-03-01',due:'2026-04-01',status:'sent',desc:'Payment application 3 — Pipe insulation Level 3–5'},
  {id:'inv-5',ref:'INV-2026-0005',client:'cl-5',clientName:'Skanska UK',project:'p5',projectName:"Tottenham Hale — Ductwork & Lagging",amount:38900,date:'2026-03-05',due:'2026-04-19',status:'sent',desc:'Payment application 2 — Ductwork & lagging zones A–D'},
  {id:'inv-6',ref:'INV-2026-0006',client:'cl-6',clientName:'Vinci Construction',project:'p6',projectName:"Guy's Hospital — Services Refurb",amount:29200,date:'2026-01-31',due:'2026-03-01',status:'overdue',desc:'Final account — Services refurb'},
  {id:'inv-7',ref:'INV-2026-0007',client:'cl-1',clientName:'Balfour Beatty',project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',amount:44200,date:'2026-02-10',due:'2026-03-12',status:'overdue',desc:'Payment application 2 — Ductwork lagging Phase 2'},
  {id:'inv-8',ref:'INV-2026-0008',client:'cl-4',clientName:'Mace Group',project:'p4',projectName:'Canary Wharf — Fire Stopping Works',amount:31500,date:'2026-03-04',due:'2026-04-03',status:'draft',desc:'Mobilisation payment — Canary Wharf Fire Stopping site setup'},
  {id:'inv-9',ref:'INV-2026-0009',client:'cl-3',clientName:'Morgan Sindall',project:'p3',projectName:'Euston Station — HVAC Insulation',amount:58200,date:'2026-03-06',due:'2026-04-05',status:'draft',desc:'Payment application 2 — HVAC insulation Phase 2'},
];

/* ── Monthly P&L data (Oct 2025 – Mar 2026) ── */
var MONTHLY_PL = [
  {month:'Oct 2025', shortMonth:'Oct', revenue:89200,  costs:72100,  profit:17100, margin:19.2},
  {month:'Nov 2025', shortMonth:'Nov', revenue:124600, costs:98800,  profit:25800, margin:20.7},
  {month:'Dec 2025', shortMonth:'Dec', revenue:107400, costs:86000,  profit:21400, margin:19.9},
  {month:'Jan 2026', shortMonth:'Jan', revenue:142800, costs:112600, profit:30200, margin:21.2},
  {month:'Feb 2026', shortMonth:'Feb', revenue:168900, costs:130600, profit:38300, margin:22.7},
  {month:'Mar 2026', shortMonth:'Mar', revenue:91200,  costs:71800,  profit:19400, margin:21.3},
];

var QUARTERLY_PL = [
  {quarter:'Q4 2025', months:'Oct–Dec', revenue:321200, costs:256900, profit:64300,  margin:20.0},
  {quarter:'Q1 2026', months:'Jan–Mar', revenue:402900, costs:315000, profit:87900,  margin:21.8},
];

var CLIENTS = [
  {id:'cl-1',name:'Balfour Beatty',initials:'BB',color:'#4ade80',sector:'Construction',since:'2021',contact:'Sarah Webb',phone:'020 7216 6800',email:'s.webb@balfourbeatty.com',address:'130 Wilton Road, London SW1V 1LQ',creditTerms:30,retentionPct:5,notes:'Major tier-1 contractor. Framework agreement in place.'},
  {id:'cl-2',name:'Aecom Ltd',initials:'AC',color:'#38bdf8',sector:'Engineering',since:'2022',contact:'Andy Clarke',phone:'020 7061 7000',email:'andy.clarke@aecom.com',address:'22 Hanover Square, London W1S 1JA',creditTerms:45,retentionPct:0,notes:'Global engineering consultancy. Key account for CW works.'},
  {id:'cl-3',name:'Morgan Sindall',initials:'MS',color:'#f59e0b',sector:'Construction',since:'2020',contact:'Paul Griffiths',phone:'020 7307 9200',email:'p.griffiths@morgansindall.com',address:'Kent House, 14–17 Market Place, London W1W 8AJ',creditTerms:30,retentionPct:5,notes:'Strong relationship — preferred supplier list.'},
  {id:'cl-4',name:'Mace Group',initials:'MG',color:'#a78bfa',sector:'Construction',since:'2023',contact:'Liz Connor',phone:'020 3522 3000',email:'l.connor@macegroup.com',address:'155 Moorgate, London EC2M 6XB',creditTerms:30,retentionPct:3,notes:'High-end residential focus. Strict QA requirements.'},
  {id:'cl-5',name:'Skanska UK',initials:'SK',color:'#f87171',sector:'Infrastructure',since:'2021',contact:'Tom Hewitt',phone:'020 7593 4300',email:'t.hewitt@skanska.co.uk',address:'Maple Cross House, Denham Way, Rickmansworth WD3 9SW',creditTerms:45,retentionPct:5,notes:'Infrastructure framework. Good payer — typically 5 days early.'},
  {id:'cl-6',name:'Vinci Construction',initials:'VC',color:'#34d399',sector:'Construction',since:'2022',contact:'Mark Fowler',phone:'020 8571 5252',email:'m.fowler@vinciconstruction.co.uk',address:'Astral House, Imperial Way, Watford WD24 4WW',creditTerms:60,retentionPct:5,notes:'French parent. Longer payment terms. Always worth chasing.'},
  {id:'cl-7',name:'ISG Ltd',initials:'IS',color:'#e879f9',sector:'Construction',since:'2024',contact:'Claire Webb',phone:'020 7392 7600',email:'c.webb@isgplc.com',address:'One London Wall, London EC2Y 5AB',creditTerms:30,retentionPct:5,notes:'New account 2024. Battersea Regen project.'},
];

var CLIENTS_DEMO = JSON.parse(JSON.stringify(CLIENTS));

var PO_REGISTER = [
  {id:'PO-INS-001',project:'p1',supplier:'Knauf Insulation',
   date:'2026-02-20',expected:'2026-02-25',deliveredDate:'2026-02-25',deliveredLaterDate:'',
   status:'delivered',outstandingItems:'',
   siteAddress:'Canary Wharf, Isle of Dogs, London E14 5AB',siteContact:'Mark Reynolds',sitePhone:'07712 445 881',
   notes:'Deliver to site compound, Gate 3. Ask for site manager.',
   items:[
     {desc:'50mm Armaflex Pipe Section 22mm bore',qty:50,unit:'m',    unitCost:96.40,vat:20,outstanding:false},
     {desc:'Armaflex Adhesive 520 (1L tins)',      qty:6, unit:'tin', unitCost:14.20,vat:20,outstanding:false},
     {desc:'Foil tape 50mm rolls',                 qty:12,unit:'roll',unitCost:4.65, vat:20,outstanding:false}
   ]},
  {id:'PO-FIX-001',project:'p1',supplier:'SIG Distribution',
   date:'2026-02-28',expected:'2026-03-03',deliveredDate:'2026-03-03',deliveredLaterDate:'',
   status:'delivered',outstandingItems:'',
   siteAddress:'Canary Wharf, Isle of Dogs, London E14 5AB',siteContact:'Mark Reynolds',sitePhone:'07712 445 881',
   notes:'PVC jacketing and banding fixings for cladding phase.',
   items:[
     {desc:'PVC jacketing sheet 0.5mm (1x2m)',  qty:20,unit:'sheet',unitCost:18.75,vat:20,outstanding:false},
     {desc:'Stainless banding 19mm (roll)',       qty:5, unit:'roll', unitCost:22.00,vat:20,outstanding:false},
     {desc:'Banding buckles 19mm (100pk)',        qty:3, unit:'bag',  unitCost:6.80, vat:20,outstanding:false}
   ]},
  {id:'PO-DUC-001',project:'p2',supplier:'Rockwool Ltd',
   date:'2026-02-18',expected:'2026-02-26',deliveredDate:'2026-02-26',deliveredLaterDate:'',
   status:'delivered',outstandingItems:'',
   siteAddress:'Wembley Stadium, Engineers Way, Wembley HA9 0WS',siteContact:'Darren Cole',sitePhone:'07803 221 994',
   notes:'Full delivery received. Minor damage to 4 boards replaced same day.',
   items:[
     {desc:'Rockwool Ductwork Slab 50mm x 600 (packs)',qty:600,unit:'pack',unitCost:20.67,vat:20,outstanding:false},
     {desc:'Foil scrim kraft facing tape 75mm',          qty:24, unit:'roll',unitCost:8.90, vat:20,outstanding:false}
   ]},
  {id:'PO-INS-002',project:'p3',supplier:'Armacell UK',
   date:'2026-03-01',expected:'2026-03-08',deliveredDate:'',deliveredLaterDate:'',
   status:'outstanding',outstandingItems:'35mm bore sections not confirmed — 80 linear metres required.',
   siteAddress:'Euston Station, Eversholt St, London NW1 2RT',siteContact:'Paula Singh',sitePhone:'07956 331 027',
   notes:'Awaiting confirmation from Armacell on 35mm bore availability. Chased 2026-03-06.',
   items:[
     {desc:'Armaflex AF pipe insulation 25mm x 2m',qty:120,unit:'length',unitCost:18.50,vat:20,outstanding:false},
     {desc:'Armaflex AF pipe insulation 35mm x 2m',qty:80, unit:'length',unitCost:22.40,vat:20,outstanding:true,outstandingQty:80},
     {desc:'Armaflex Adhesive 520 (1L)',            qty:8,  unit:'tin',   unitCost:14.20,vat:20,outstanding:false}
   ]},
  {id:'PO-MEC-001',project:'p3',supplier:'Armacell UK',
   date:'2026-03-05',expected:'2026-03-14',deliveredDate:'',deliveredLaterDate:'2026-03-18',
   status:'partial',outstandingItems:'40 boards outstanding — second delivery confirmed 18 March.',
   siteAddress:'Euston Station, Eversholt St, London NW1 2RT',siteContact:'Paula Singh',sitePhone:'07956 331 027',
   notes:'Phenolic foam boards partially delivered (40 of 80). Balance expected 2026-03-18.',
   items:[
     {desc:'Phenolic foam board 50mm (1.2x2.4m)',qty:80,unit:'board',  unitCost:38.00,vat:20,outstanding:true,outstandingQty:40},
     {desc:'GRP pipe casing 76mm sections',       qty:20,unit:'section',unitCost:12.40,vat:20,outstanding:false}
   ]},
  {id:'PO-INS-003',project:'p5',supplier:'Thermaflex',
   date:'2026-03-04',expected:'2026-03-11',deliveredDate:'2026-03-11',deliveredLaterDate:'',
   status:'delivered',outstandingItems:'',
   siteAddress:'Elephant and Castle, Walworth Rd, London SE17 1JG',siteContact:'Gary Okafor',sitePhone:'07744 882 113',
   notes:'Full delivery confirmed. Site accepted all goods.',
   items:[
     {desc:'Thermaflex flexible insulation 13mm ID',qty:150,unit:'m',   unitCost:24.80,vat:20,outstanding:false},
     {desc:'Vapour barrier tape 75mm',              qty:10, unit:'roll', unitCost:8.90, vat:20,outstanding:false}
   ]},
  {id:'PO-TRC-001',project:'p7',supplier:'nVent Raychem',
   date:'2026-03-06',expected:'2026-03-20',deliveredDate:'',deliveredLaterDate:'2026-03-25',
   status:'outstanding',outstandingItems:'Full order outstanding. Raychem confirmed 25 March dispatch.',
   siteAddress:'Battersea Power Station, Battersea Park Rd, London SW8 4BG',siteContact:'Tom Whitfield',sitePhone:'07622 991 447',
   notes:'Long lead item — manufacturer backorder. Updated ETA 25 March.',
   items:[
     {desc:'Self-regulating heat trace 20W/m',qty:200,unit:'m',   unitCost:45.00,vat:20,outstanding:true,outstandingQty:200},
     {desc:'Junction boxes for trace heating', qty:12, unit:'unit',unitCost:28.50,vat:20,outstanding:true,outstandingQty:12},
     {desc:'End seals and connection kits',    qty:24, unit:'kit', unitCost:9.80, vat:20,outstanding:true,outstandingQty:24}
   ]}
];

var TENDERS = [
  {id:'tq-1',ref:'QTE-2026-001',name:'Canary Wharf — Pipe Insulation Ph.2',client:'cl-2',clientName:'Aecom Ltd',value:284000,margin:22,status:'won',enquiry:'2025-11-15',submitted:'2025-12-10',decision:'2026-01-06',notes:'Competitive tender — 4 bidders. Awarded on quality of programme.',linkedProjectId:'p1',
   attachments:[
     {id:'att-tq1-1',filename:'QTE-2026-001-Enquiry-Email.pdf',type:'Correspondence',revision:'1',date:'2025-11-15',size:'148 KB'},
     {id:'att-tq1-2',filename:'QTE-2026-001-Scope-of-Works-RevA.pdf',type:'Specification',revision:'A',date:'2025-11-20',size:'890 KB'}
   ],
   folders:{
     drawings:[],
     specs:[{id:'fd-tq1-s1',filename:'QTE-2026-001-Scope-of-Works-RevA.pdf',revision:'A',date:'2025-11-20',size:'890 KB',notes:'Initial scope of works'}],
     documents:[{id:'fd-tq1-d1',filename:'QTE-2026-001-Enquiry-Email.pdf',revision:'1',date:'2025-11-15',size:'148 KB',notes:'Client enquiry email'}]
   },
   quoteFiles:[
     {id:'qf-tq1-3',filename:'QTE-2026-001-Quote-RevC.xlsx',fileType:'Spreadsheet',revision:'C',date:'2025-12-10',size:'1.1 MB',status:'Latest'},
     {id:'qf-tq1-2',filename:'QTE-2026-001-Quote-RevB.xlsx',fileType:'Spreadsheet',revision:'B',date:'2025-12-02',size:'1.0 MB',status:'Superseded'},
     {id:'qf-tq1-1',filename:'QTE-2026-001-Quote-RevA.xlsx',fileType:'Spreadsheet',revision:'A',date:'2025-11-28',size:'940 KB',status:'Superseded'}
   ]},
  {id:'tq-2',ref:'QTE-2026-002',name:'Wembley Stadium — Ductwork Lagging',client:'cl-1',clientName:'Balfour Beatty',value:194000,margin:18,status:'won',enquiry:'2025-10-01',submitted:'2025-10-28',decision:'2025-11-01',notes:'Framework pricing applied. Fast turnaround secured the win.',linkedProjectId:'p2',folders:{drawings:[{id:'fd-tq2-dr1',filename:'Wembley-Ductwork-Layout-RevA.pdf',revision:'A',date:'2025-10-15',size:'4.2 MB',notes:'Ductwork layout drawings'}],specs:[{id:'fd-tq2-s1',filename:'Wembley-Insulation-Spec-RevA.pdf',revision:'A',date:'2025-10-10',size:'560 KB',notes:'Performance specification'}],documents:[{id:'fd-tq2-d1',filename:'Wembley-Enquiry-Email.pdf',revision:'1',date:'2025-10-01',size:'88 KB',notes:'Initial enquiry'}]},quoteFiles:[
     {id:'qf-tq2-2',filename:'QTE-2026-002-Wembley-Quote-RevB.pdf',fileType:'PDF',revision:'B',date:'2025-10-28',size:'820 KB',status:'Latest'},
     {id:'qf-tq2-1',filename:'QTE-2026-002-Wembley-Quote-RevA.pdf',fileType:'PDF',revision:'A',date:'2025-10-20',size:'790 KB',status:'Superseded'}
   ]},
  {id:'tq-3',ref:'QTE-2026-003',name:'Euston Station — HVAC Insulation',client:'cl-3',clientName:'Morgan Sindall',value:320000,margin:24,status:'won',enquiry:'2025-11-20',submitted:'2025-12-15',decision:'2026-01-10',notes:'Sole invite via framework. Won outright.',linkedProjectId:'p3',
   attachments:[
     {id:'att-tq3-1',filename:'Euston-HVAC-Drawings-RevB.pdf',type:'Drawing',revision:'B',date:'2026-01-10',size:'3.2 MB'},
     {id:'att-tq3-2',filename:'Euston-Insulation-Spec-RevA.docx',type:'Specification',revision:'A',date:'2025-12-20',size:'210 KB'}
   ],
   folders:{
     drawings:[{id:'fd-tq3-dr1',filename:'Euston-HVAC-Drawings-RevB.pdf',revision:'B',date:'2026-01-10',size:'3.2 MB',notes:'Latest GA drawings'},{id:'fd-tq3-dr2',filename:'Euston-HVAC-Drawings-RevA.pdf',revision:'A',date:'2025-12-01',size:'3.0 MB',notes:''}],
     specs:[{id:'fd-tq3-s1',filename:'Euston-Insulation-Spec-RevA.docx',revision:'A',date:'2025-12-20',size:'210 KB',notes:'NBS Spec — full insulation spec'}],
     documents:[]
   },
   quoteFiles:[
     {id:'qf-tq3-2',filename:'QTE-2026-003-Euston-HVAC-Quote-RevB.xlsx',fileType:'Spreadsheet',revision:'B',date:'2025-12-15',size:'1.3 MB',status:'Latest'},
     {id:'qf-tq3-1',filename:'QTE-2026-003-Euston-HVAC-Quote-RevA.xlsx',fileType:'Spreadsheet',revision:'A',date:'2025-12-05',size:'1.2 MB',status:'Superseded'}
   ]},
  {id:'tq-4',ref:'QTE-2026-004',name:'Stratford Crossrail — Fireproofing',client:'cl-5',clientName:'Skanska UK',value:218000,margin:20,status:'submitted',enquiry:'2026-01-20',submitted:'2026-02-14',decision:'',notes:'5 bidders. Strong competition from Lakesmere.',folders:{drawings:[],specs:[{id:'fd-tq4-s1',filename:'QTE-2026-004-Spec-RevA.pdf',revision:'A',date:'2026-01-25',size:'450 KB',notes:'NBS specification'}],documents:[{id:'fd-tq4-d1',filename:'QTE-2026-004-Enquiry.pdf',revision:'1',date:'2026-01-20',size:'95 KB',notes:'Enquiry documentation'}]},quoteFiles:[{id:'qf-tq4-1',filename:'QTE-2026-004-Stratford-Quote-RevA.xlsx',fileType:'Spreadsheet',revision:'A',date:'2026-02-14',size:'1.0 MB',status:'Latest'}]},
  {id:'tq-5',ref:'QTE-2026-005',name:'Battersea Power Station — Insulation',client:'cl-7',clientName:'ISG Ltd',value:340000,margin:23,status:'open',enquiry:'2026-02-28',submitted:'',decision:'',notes:'Pricing stage — submission due 28 March 2026.',folders:{drawings:[{id:'fd-tq5-dr1',filename:'Battersea-Level-3-GA-RevA.pdf',revision:'A',date:'2026-02-28',size:'6.8 MB',notes:'GA drawings received from ISG'}],specs:[],documents:[{id:'fd-tq5-d1',filename:'Battersea-Enquiry-Letter.pdf',revision:'1',date:'2026-02-28',size:'120 KB',notes:'Initial enquiry letter'}]},quoteFiles:[{id:'qf-tq5-1',filename:'QTE-2026-005-Battersea-Quote-Draft.xlsx',fileType:'Spreadsheet',revision:'Draft',date:'2026-03-01',size:'980 KB',status:'Draft'}]},
  {id:'tq-6',ref:'QTE-2026-006',name:"Nine Elms — District Heating",client:'cl-4',clientName:'Mace Group',value:185000,margin:21,status:'lost',enquiry:'2025-12-01',submitted:'2025-12-20',decision:'2026-01-15',notes:'Lost to Wentworth Insulation on price. £8k difference.'},
  {id:'tq-7',ref:'QTE-2026-007',name:"Canary Wharf — Fire Stopping Works",client:'cl-4',clientName:'Mace Group',value:94000,margin:20,status:'won',enquiry:'2025-12-10',submitted:'2026-01-08',decision:'2026-02-01',notes:'Premium residential spec. Won on method statement quality.',linkedProjectId:'p4'},
  {id:'tq-8',ref:'QTE-2026-008',name:"Tottenham Hale — Ductwork & Lagging",client:'cl-5',clientName:'Skanska UK',value:178000,margin:21,status:'won',enquiry:'2025-11-01',submitted:'2025-11-22',decision:'2025-12-01',notes:'Framework call-off. Strong prior relationship.',linkedProjectId:'p5'},
  {id:'tq-9',ref:'QTE-2026-009',name:"Guy's Hospital Phase 2 — Services",client:'cl-6',clientName:'Vinci Construction',value:198000,margin:19,status:'lost',enquiry:'2026-01-15',submitted:'2026-02-10',decision:'2026-03-01',notes:'Lost on programme — their timeline was too tight. Re-bid expected Q3.'},
  {id:'tq-10',ref:'QTE-2026-010',name:'Battersea Regen — Trace Heating',client:'cl-7',clientName:'ISG Ltd',value:92000,margin:26,status:'won',enquiry:'2026-01-20',submitted:'2026-02-05',decision:'2026-02-20',notes:'Small package, high margin. Fast track approval.',linkedProjectId:'p7'},
  {id:'tq-11',ref:'QTE-2026-011',name:'Old Street Exchange — Insulation',client:'cl-3',clientName:'Morgan Sindall',value:142000,margin:22,status:'open',enquiry:'2026-02-25',submitted:'',decision:'',notes:'Awaiting revised drawings before submission.'},
  {id:'tq-12',ref:'QTE-2026-012',name:'Elephant & Castle — HVAC Lagging',client:'cl-1',clientName:'Balfour Beatty',value:265000,margin:20,status:'submitted',enquiry:'2026-02-01',submitted:'2026-03-01',decision:'',notes:'Framework re-price. Decision expected mid-April.'},
  {id:'tq-13',ref:'QTE-2026-013',name:'Wembley Park — Ductwork Lagging Ph.3',client:'cl-1',clientName:'Balfour Beatty',value:142000,margin:19,status:'open',enquiry:'2026-03-05',submitted:'',decision:'',notes:'Phase 3 continuation — ductwork lagging to new plant rooms.'},
  {id:'tq-14',ref:'QTE-2026-014',name:'Nine Elms — Pipe & Valve Insulation',client:'cl-3',clientName:'Morgan Sindall',value:88500,margin:21,status:'submitted',enquiry:'2026-02-20',submitted:'2026-03-08',decision:'',notes:'Pipe and valve insulation to district heating risers.'},
];

/* ── Quote Book demo data store (for reset) ── */
var TENDERS_DEMO = JSON.parse(JSON.stringify(TENDERS));
var PROJECTS_DEMO_KEYS = {}; /* tracks AI-imported project IDs for reset */

/* ══ CIBSE Standard Symbols Reference (from cibse.org/media/qsypi22v) ═══ */
/* Library catalogue: cibse.org/knowledge-research/.../symbols/             */
/* ── Knowledge Base Version — stored with every AI quote for auditability ── */
var KB_VERSION = '4.1';
var KB_VERSION_DATE = '2026-03-14';
var KB_VERSION_SOURCES = 25;
var KB_CHANGELOG = [
  {v:'4.1',date:'2026-03-14',note:'Added AI liability disclaimers, assumption audit trails, confidence labelling, and export review gates.'},
  {v:'4.0',date:'2026-03-14',note:'25-source knowledge base: BSRIA BG 85/87 mechanical defaults, NRM2 measurement rules, CIBSE symbol library, Wendes estimating, multi-source OCR calibration.'},
  {v:'3.0',date:'2026-03-12',note:'Added spec intelligence: NBS parsing, RICS NRM2, reference specification reconciliation.'},
  {v:'2.0',date:'2026-03-11',note:'Visual recognition: CIBSE colours, isometric rules, Archtoolbox HVAC, PaddleOCR calibration.'},
  {v:'1.0',date:'2026-03-10',note:'Initial knowledge base: core CIBSE symbols, basic ductwork/pipework recognition.'},
];

var CIBSE_SYMBOLS_REF = {
  library_packages: [
    'Systems & Abbreviations (PDF) — colour theory, system codes, line rendering',
    'Heating & Cooling — radiators, boilers, heat exchangers, chillers, cooling towers, heat pumps',
    'Ventilation — AHUs, fans, dampers (VCD/FD/NRV), grilles, diffusers, louvres, attenuators, flexible duct',
    'Pipework Accessories — valves (gate/globe/butterfly/ball/check), strainers, pumps, gauges, flow meters, expansion vessels',
    'Small Power — socket outlets, fused spurs, isolators, data points, USB outlets',
    'Fire Systems Engineering — smoke/heat detectors, break glass, sounders, beacons, control panels, sprinkler heads',
    'Fire Alarms — detection zones, alarm circuits, cause-and-effect',
    'Lighting — luminaire types (recessed/surface/pendant/track/emergency), bollards, floodlights',
    'Lighting Switches — 1-gang/2-gang, dimmer, PIR, key, time delay, scene-set panels'
  ],
  ductwork_colours: {
    'Supply Air (SA)':    '#8095ff (blue-violet fill, black outline, HSL 230/100/75)',
    'Extract Air (EA)':   '#ff8095 (pink-red fill, black outline, HSL 350/100/75)',
    'Intake Air (IA)':    '#00d5ff (cyan fill, black outline, HSL 190/100/50)',
    'Discharge Air (DA)': '#ffbf80 (peach/orange fill, black outline, HSL 30/100/75)',
    'Toilet Extract':     '#f2bf8c (muted peach, S=80%)',
    'Kitchen Extract':    '#e6bf99 (muted tan, S=60%)',
    'Fume Cupboard':      '#d9bfa6 (muted beige, S=40%)',
    'Flue':               '#ccbfb3 (very muted, S=20%)'
  },
  ductwork_accessories: {
    'Supply Air acc':   '#001999 (dark blue, 30% lightness)',
    'Extract Air acc':  '#99001a (dark red, 30% lightness)',
    'Intake Air acc':   '#008099 (dark cyan, 30% lightness)',
    'Discharge Air acc':'#994d00 (dark orange, 30% lightness)',
    'note': 'Accessories use same hue as parent duct but at 30% lightness (darker)'
  },
  pipework_colours: {
    'LTHW Flow':          'outline #993300, fill #ffaa80 (HSL 20/100, L=30/75)',
    'LTHW Return':        'outline #e64d00, fill #ffaa80 (HSL 20/100, L=45/75)',
    'LTHW FanCoils Flow': 'outline #8a380f, fill #f2ae8c (HSL 20/80, L=30/75)',
    'LTHW Radiators Flow':'outline #7a3d1f, fill #e6b399 (HSL 20/60, L=30/75)',
    'ChW Flow':           'outline #006699, fill #80d4ff (HSL 200/100, L=30/75)',
    'ChW Return':         'outline #0099e6, fill #80d4ff (HSL 200/100, L=45/75)',
    'CdW Flow':           'outline #660099, fill #d580ff (HSL 280/100, L=30/75)',
    'CdW Return':         'outline #9900e6, fill #d580ff (HSL 280/100, L=45/75)',
    'DHW Flow':           'outline #990033, fill #ff80aa (HSL 340/100, L=30/75)',
    'DHW Return':         'outline #e6004c, fill #ff80aa (HSL 340/100, L=45/75)',
    'Mains Cold Water':   'outline #009999, fill #80ffff (HSL 180/100, L=30/75)',
    'Boosted Cold Water':  'outline #000099, fill #8080ff (HSL 240/100, L=30/75)',
    'Condensate':         'outline #990066, fill #ff80d5 (HSL 320/100, L=30/75)',
    'Refrigerant Gas':    'outline #00e699, fill #80ffd4 (HSL 160/100, L=45/75)',
    'Refrigerant Liquid': 'outline #009966, fill #80ffd4 (HSL 160/100, L=30/75)',
    'Natural Gas':        'outline #999900, fill #ffff80 (HSL 60/100, L=30/75)',
    'Fuel Oil':           'outline #009933, fill #80ffaa (HSL 140/100, L=30/75)',
    'Compressed Air':     'outline #003399, fill #80aaff (HSL 220/100, L=30/75)',
    'Fire Sprinkler':     'outline #ff0000, fill #ff8080 (HSL 0/100, L=50/75)',
    'Rain Water Pipe':    'outline #009900, fill #80ff80 (HSL 120/100, L=30/75)',
    'Soil Vent Pipe':     'outline #996600, fill #ffd480 (HSL 40/100, L=30/75)',
    'Grey Water':         'outline #669900, fill #d5ff80 (HSL 80/100, L=30/75)',
    'Recycled Cold Water':'outline #990099, fill #ff80ff (HSL 300/100, L=30/75)'
  },
  electrical_colours: {
    'Power LV': '#80bfff (HSL 210)', 'Power HV': '#9580ff (HSL 250)',
    'Power ELV': '#80ffea (HSL 170)', 'Lighting': '#eaff80 (HSL 70)',
    'Data': '#ea80ff (HSL 290)', 'Comms': '#ff80ea (HSL 310)',
    'Fire Alarm': '#ff9580 (HSL 10)', 'BMS': '#80ffbf (HSL 150)',
    'Security': '#ffea80 (HSL 50)', 'Audio Visual': '#ff80bf (HSL 330)'
  },
  equipment_colours: {
    'Cooling': '#87aae1 (HSL 217/60/71)', 'Heating': '#e63232 (HSL 0/78/55)',
    'Ventilation': '#96c882 (HSL 103/39/65)', 'Domestic': '#aa82c8 (HSL 274/39/65)',
    'Electrical': '#ffeb00 (HSL 55/100/50)'
  },
  ventilation_symbols: {
    'AHU': 'Rectangle with fan symbol. Colour: ventilation green #96c882.',
    'MHRV/MVHR': 'Compact rectangle with dual fan arrows (supply+extract). Often labelled.',
    'FCU': 'Smaller rectangle with single fan symbol.',
    'VCD': 'Butterfly/throttle symbol within duct run. Count as nr.',
    'Fire Damper (FD)': 'Specific symbol in duct at fire compartment boundary. Count as nr.',
    'NRV/Backdraught': 'Flap symbol in duct. Prevents reverse airflow.',
    'Attenuator': 'Hatched/lined rectangular section in duct run.',
    'Grille/Diffuser': 'Crossed square (grille) or circle (diffuser) at duct terminals. Count as nr.',
    'Louvre': 'Parallel lines at external wall openings.',
    'Flexible Duct': 'Wavy/corrugated section connecting solid duct to terminal. Count as nr item, NOT duct length.',
    'Spiral/Circular Duct': 'Thick outer lines with faded centreline. Only count if centreline confirms duct profile.'
  },
  pipework_accessories: {
    'Gate Valve': 'Angled bow-tie/butterfly on pipe line.',
    'Globe Valve': 'Circle on pipe line.',
    'Ball Valve': 'Circle with line through.',
    'Butterfly Valve': 'Small disc symbol on large pipes.',
    'Check Valve/NRV': 'Arrow pointing in flow direction.',
    'Strainer': 'Y-shape or basket symbol.',
    'Pump': 'Circle with arrow (centrifugal) or triangle (inline).',
    'Pressure Gauge': 'Circle with "P".',
    'Temperature Gauge': 'Circle with "T".',
    'Expansion Vessel': 'Semi-circle or dome shape.',
    'Flow Meter': 'Diamond with "F".'
  },
  key_rules: [
    'Ductwork: BLACK outlines, colour is FILL only',
    'Pipework: COLOURED outlines (not black), fill shows primary type',
    'Flow vs Return: same fill, different outline lightness (flow=30%, return=45%)',
    'Sub-systems vary SATURATION: LTHW radiator S=60% vs main S=100%',
    'Duct accessories darker than parent: same hue at L=30%',
    'Electrical containment: black outline, colour fill denotes cable purpose',
    'Equipment colour = primary function, not individual systems',
    'Insulation: transparent overlay inheriting system shade — duct visible underneath',
    'Fire resistant duct: cross-hatched or patterned cladding overlay',
    'Flexible duct may lack colour but inherits from connected solid duct',
    'Clearance zones: orange outline #ffb98a with 50% transparency',
    'Underscore _ used as field delimiter in abbreviations (not dash)'
  ],
  pipework_layout_patterns: {
    closed_loop: 'Heating (LTHW) and cooling (ChW) systems are CLOSED LOOPS with flow+return. Require pressure reference (expansion vessel/header tank). Flow in = flow out at every junction.',
    chilled_water: 'Typically: chiller plant \u2192 pumps \u2192 ring main/distribution \u2192 AHU cooling coils / FCUs \u2192 return to chiller. Multiple chillers with duty/standby. FCVs control flow to each terminal.',
    lthw_heating: 'Boiler \u2192 pumps \u2192 distribution (flow) \u2192 radiators/fan coils/AHU heater batteries \u2192 return. Sub-circuits for different loads (radiator circuit vs fan coil circuit) at different saturation colours.',
    dhw_domestic: 'Mains cold water \u2192 storage/calorifier \u2192 distribution with secondary return loop. Hot and cold branches to outlets. PRVs at lower floors.',
    fire_sprinkler: 'Grid/loop layout for redundancy. Sized for simultaneous operation of all heads in worst zone. 8" street pipes, 12" feeders, 16" mains typical. Ring main with multiple feed points.',
    compressed_air: 'Ring main loop from compressor. PRVs create lower-pressure sub-zones. Mass flow consistent; volumetric flow increases as pressure drops.',
    what_to_count: [
      'Physical pipe runs matching legend (flow AND return separately)',
      'Pipe sizes from annotations (mm bore or \u00d8)',
      'Valves, strainers, pumps as nr items at their locations',
      'Heat exchangers, boilers, fan coils, chillers as nr items',
      'Expansion vessels, header tanks as nr',
      'Tee fittings at branches (count separately, or use % allowance)',
      'Pipe enlargements/contractions as nr where sizes change',
      'Sprinkler heads / spray nozzles as nr'
    ],
    what_NOT_to_count: [
      'Schematic flow arrows (show direction, not physical pipe)',
      'Node labels (N1, N2 etc.) \u2014 these are calculation reference points',
      'Pressure/flow annotations (psi, l/min values printed on drawings)',
      'Performance curve data or pump schedules',
      'Dimension/elevation text and arrows',
      'Pipe reference numbers (P1, P2 etc.)',
      'Component modelling symbols (fixed loss, Cv/Kv indicators)',
      'Rubber-banding or construction lines'
    ],
    measurement_rules: [
      'Measure each pipe run once only \u2014 flow pipe and return pipe are SEPARATE runs',
      'At tee junctions: main run continues, branch is a separate measurement',
      'Risers/droppers: vertical runs between floors count as separate measured lengths',
      'Closed loops: total length = sum of all individual pipe segments, not the loop perimeter twice',
      'Parallel duty/standby equipment: only count pipes to ACTIVE equipment unless spec says otherwise',
      'FCVs, PRVs, BPVs: count as nr accessories on the pipe they serve'
    ]
  },
  isometric_recognition: {
    description: 'Isometric views show 3D pipe/duct routing on a 30-degree grid. Common on M&E drawings for plant rooms, risers, and complex routing.',
    example_systems: [
      'ISO-01: Chilled water cooling — 2 duty + 1 standby ACLC chillers, 2 duty + 1 standby pumps, distribution to 3 buildings via 3 AHUs + 1 FCU. Shows parallel duty/standby branches with isolation valves.',
      'ISO-02: HVAC 3-floor system — Ceiling-mounted FCUs on 3 floors, separate pump per floor, chiller + header tank. Shows vertical risers between floors and horizontal distribution in ceiling voids.',
      'ISO-03: Water circulation — Recirculation loop with take-off points (pharmaceutical type). Shows ring main with branch tees.',
      'ISO-04: AHU cooling — 12 AHUs on 3 floors, cooling tower on roof, duty+standby pumps. Shows vertical risers and floor-level distribution headers.',
      'ISO-05: Production area cooling — Ground level machines + mezzanine services. Shows elevation changes and branch take-offs.',
      'ISO-06: Compressed air — Ring main with PRVs creating 3 pressure zones. Shows zoned distribution.'
    ],
    plan_to_iso_translation: [
      'Horizontal runs on plans appear as angled lines (30\u00b0/150\u00b0) in isometric',
      'Vertical risers appear as true vertical lines in both plan and isometric',
      'Plan view shows ROUTING but not elevation changes — check isometric/section for actual vertical runs',
      'Branch take-offs at tees: main run continues straight, branch departs at angle',
      'Expansion loops appear as U-shaped diversions in the pipe run — count the TOTAL pipe length including loop, not the straight-line distance',
      'Pump sets shown inline on pipe runs — count pump as nr but include the pipe through/around it',
      'Header/manifold arrangements: count individual branch pipes from the header, not the header as one long pipe'
    ],
    error_prone_elements: [
      'CENTRELINES vs PIPES: Centrelines are thin chain-dot reference lines. Pipes are thicker solid/dashed lines. Never measure a centreline as pipe length.',
      'FLOW ARROWS vs PIPE: Arrows showing flow direction are annotations, not physical pipe. Do not add arrow length to pipe measurement.',
      'ELEVATION ANNOTATIONS: Numbers showing heights (e.g. "+3.500") are text labels, not pipe.',
      'NODE LABELS: Reference points (N1, N2) are calculation aids, not physical components.',
      'DUTY/STANDBY: Two parallel branches may serve duty and standby equipment. Unless the spec says to insulate both, only count the active path. Flag the assumption.',
      'PIPE SIZE CHANGES: Where pipes enlarge or contract, the annotation shows the new size. Measure each diameter segment separately.',
      'HEADER TANKS: A tank symbol at the top of a closed loop is a pressure reference (expansion vessel). It is an nr item, not pipe length.',
      'COMPONENT SYMBOLS: Heat exchangers, chillers, filters shown as schematic boxes with flow characteristics. Count as nr equipment items, not pipe.',
      'INSULATION OUTLINE: In isometric views, insulation may appear as a thicker concentric outline around the pipe. The PIPE is what you measure; the insulation is quantified as m\u00b2 surface area separately.'
    ],
    insulation_in_isometrics: [
      'Insulation is sometimes shown as a wider concentric profile around the pipe in isometric/section views',
      'Calculate insulation m\u00b2 from pipe outer diameter \u00d7 \u03c0 \u00d7 length (circular pipes)',
      'Where insulation is shown on some pipe runs but not others, this indicates which runs require insulation vs which do not',
      'Valves and fittings often have insulation gaps or removable insulation sections — allow for valve insulation boxes as nr items'
    ]
  },
  archtoolbox_hvac: {
    source: 'archtoolbox.com/hvac-plan-symbols/ and /hvac-abbreviations/',
    supply_return_symbols: {
      '4-Way Ceiling Diffuser': 'Square with 4 directional arrows radiating outward. Count as nr. Most common supply terminal.',
      '3-Way Ceiling Diffuser': 'Square with 3 directional arrows. Count as nr.',
      '2-Way Ceiling Diffuser': 'Square with 2 directional arrows (opposite sides). Count as nr.',
      '1-Way Ceiling Diffuser': 'Square with 1 directional arrow. Count as nr. Linear slot diffuser.',
      'Return Grille': 'Square with X pattern (crossed diagonals). Count as nr. Extract/exhaust terminal.',
      'Direction of Supply Air': 'Arrow on duct showing airflow direction. This is an ANNOTATION \u2014 do NOT count as duct length.',
      'Direction of Return Air': 'Dashed arrow on duct. ANNOTATION only \u2014 do NOT count.',
      'Door Undercut': 'Notation at door for air transfer gap. Not ductwork.',
      'Door Louver': 'Parallel lines in door leaf for air transfer. Count as nr if specified for installation.'
    },
    damper_symbols: {
      'Volume Damper (VD)': 'Thin line across duct with adjustment indicator. Count as nr on the duct run.',
      'Fire Damper (FD)': 'Thicker line across duct at fire compartment boundary, often with "FD" label. Count as nr. CRITICAL for fire stopping scope.',
      'Smoke Damper (SD)': 'Similar to fire damper with "SD" label. Count as nr.',
      'Combination Smoke/Fire Damper (SFD)': 'Combined symbol with both labels. Count as nr.',
      'Back-Draft Damper (BDD)': 'Angled flap symbol in duct. Prevents reverse airflow. Count as nr.'
    },
    piping_line_types: {
      'Chilled Water Supply (CHWS)': 'Solid line with periodic "CHWS" text or dash pattern. Typically BLUE.',
      'Chilled Water Return (CHWR)': 'Dashed/different pattern line with "CHWR". Typically lighter BLUE.',
      'Hot Water Supply (HWS)': 'Solid line with "HWS" text. Typically RED or orange.',
      'Hot Water Return (HWR)': 'Dashed/different pattern with "HWR". Typically lighter RED.',
      'Vent Pipe': 'Specific dash pattern, often labelled "V" or "VP".',
      'Drain Pipe': 'Specific dash pattern, labelled "D".',
      'Make-Up Water (MU)': 'Line with "MU" labels. Feeds expansion/top-up.'
    },
    sensor_symbols: {
      'Thermostat': 'Circle with "T". BMS/controls item. Count as nr if in scope.',
      'Humidity Sensor': 'Circle with "H". BMS/controls item.'
    },
    key_recognition_notes: [
      'Each M&E office uses their own symbol set \u2014 ALWAYS check the project legend first',
      'Diffusers are terminal devices: count as nr items at the end of duct branches, connected via flex duct',
      'Supply diffusers have outward arrows; return grilles have X/diagonal pattern',
      'Dampers are inline duct accessories: count as nr at their position in the duct run',
      'Fire dampers appear at fire-rated wall/floor penetrations \u2014 cross-reference with fire strategy',
      'Piping systems use text labels (CHWS, HWR etc.) along the line rather than just colour',
      'Flow direction arrows are annotations, not physical pipe/duct \u2014 never count them',
      'Sensors/thermostats are BMS items, not insulation scope unless trace heating is involved'
    ]
  },
  archtoolbox_abbreviations: {
    equipment: 'AHU=Air Handling Unit, FCU=Fan Coil Unit, CUH=Cabinet Unit Heater, EUH=Electrical Unit Heater, FTR=Fin Tube Radiation, HRU=Heat Recovery Unit, RTU=Roof-Top Unit, CT=Cooling Tower, EF=Exhaust Fan, VFD=Variable Frequency Drive',
    ductwork: 'SA=Supply Air, RA=Return Air, OA=Outside Air, OAI=Outside Air Intake, EA=Exhaust Air, MUA=Make-Up Air, BOD=Bottom of Duct, CFM=Cubic Feet per Minute, VAV=Variable Air Volume, LD=Linear Diffuser',
    dampers: 'VD=Volume Damper, FD=Fire Damper, SD=Smoke Damper, SFD=Smoke/Fire Damper, BDD=Back-Draft Damper, MD=Motorized Damper, ACD=Automatic Control Damper',
    piping: 'CHW=Chilled Water, CHWS=Chilled Water Supply, CHWR=Chilled Water Return, HWS=Hot Water Supply, HWR=Hot Water Return, CWS=Condenser Water Supply, CWR=Condenser Water Return, MU=Make-Up Water, LPS=Low Pressure Steam, PRV=Pressure Reducing Valve',
    controls: 'ATC=Automatic Temperature Control, DDC=Direct Digital Control, EMS=Energy Management System, NC=Normally Closed, NO=Normally Open, FS=Flow Switch, SP=Static Pressure',
    access: 'AD=Access Door, AP=Access Panel, FC=Flexible Connection, FLEX=Flexible',
    measurements: 'CFM=Cubic Feet/Min, FPM=Feet/Min, GPM=Gallons/Min, BTU=British Thermal Unit, MBH=1000 BTUH, TON=12000 BTUH, PSI=Pounds/Sq Inch, WC/WG=Water Column/Gauge, DB=Dry Bulb, WB=Wet Bulb, RH=Relative Humidity, DP=Differential Pressure, SP=Static Pressure, ESP=External Static Pressure, NC=Noise Criteria'
  },
  wendes_estimating: {
    source: 'Wendes Mechanical Estimating Manual (wendes.com) — 30,000+ copies in circulation, based on 20+ years of labour studies',
    takeoff_principles: [
      'Know your trade: understand systems, equipment, how work is done, all parts needed, components, accessories, operations, materials, tools and machinery',
      'Mark and colour drawings BEFORE takeoff: identify different items, highlight duct runs by system type, mark insulation, lining, riser sections',
      'Draw pictures and diagrams to clarify: sketch on plans, on separate sheets, on takeoff sheets',
      'Indicate lengths, quantities, operations required, component parts not obvious on plans',
      'Riser sections may need separate takeoff from plan views — check sections/elevations',
      'Add 20% allowance to ductwork surface area to cover hangers, cleats, hardware, waste and seams'
    ],
    ductwork_labour_methods: {
      hours_per_piece: 'Most accurate method. Based on actual labour per specific piece and type. Considers size and type variations. Derived from production labour studies and productivity rates.',
      hours_per_pound: 'Low pressure galvanised: 44 lbs/hr fabrication (0.023 hrs/lb). Install rate varies. Quick cross-check method. Formula: total weight \u00f7 lbs/hr = hours.',
      hours_per_sqft: 'Convert lbs/hr to sq ft using 1.156 lbs/SF factor for 24ga. Example: 44 lbs/hr \u00f7 1.156 = 38 SF/hr fab, 25 lbs/hr \u00f7 1.156 = 22 SF/hr install.',
      weight_conversion: 'Duct weight per foot: calculate surface area in SF, multiply by lbs/SF for gauge (e.g. 1.156 lbs/SF for 24ga, 1.4 lbs/SF combined with 1.2 fittings allowance).',
      fittings_allowance: '25% fittings ratio is typical for average ductwork (i.e. fittings = 25% of total duct pieces). 15-20% for straight runs with few branches, 30-35% for complex plant rooms.'
    },
    ductwork_material_factors: {
      galvanised_24ga: '1.156 lbs/SF assembled weight. Low pressure standard.',
      galvanised_22ga: '~1.406 lbs/SF. Medium pressure.',
      galvanised_20ga: '~1.656 lbs/SF. Higher pressure.',
      stainless_steel: 'Significantly heavier. Budget at 1.5-2x galvanised labour.',
      aluminium: 'Lighter but requires specialist handling. Similar hours to galvanised.',
      frp_fiberglass: '~4.2 lbs/SF assembled for 2" air foil. Width \u00d7 1.4 trip factor for true length.',
      pvc_duct: 'Specialist — use SF/hr method. Lighter than metal but chemical welding adds time.',
      flexible_duct: 'Count as linear metres. Faster install than rigid. Typically 6m max lengths.'
    },
    insulation_estimating: {
      external_wrap: 'Measured in m\u00b2 (surface area of duct/pipe). Include 15% waste for pins, staples, tape, laps.',
      pipe_insulation: 'Measured in lin.m by pipe size and insulation thickness. Include fittings (valves, flanges) as nr items or % allowance.',
      duct_lining: 'Internal acoustic lining measured in m\u00b2. Reduces effective duct cross-section — note for sizing.',
      budget_rates: 'External duct wrap: typically \u00a38-15/m\u00b2 supply+fix. Pipe insulation: \u00a35-20/lin.m depending on size/material.',
      allowances: '20% allowance on duct insulation for overlaps, waste, cut pieces. 10-15% for pipe insulation.'
    },
    piping_estimating: {
      measurement: 'Measured in lin.m by pipe size and material. Centre-to-centre for fittings.',
      fittings_count: 'Count all fittings individually where visible: elbows, tees, reducers, valves, flanges, unions. Where not individually visible, add 15-20% to straight pipe length.',
      valve_count: 'Count each valve type separately: gate, globe, ball, butterfly, check, PRV, safety, control. Size matters for pricing.',
      support_allowance: 'Pipe supports typically every 1.5-3m depending on size. Count as nr or use m rate inclusive.',
      testing: 'Allow for pressure testing per system: hydrostatic for water, pneumatic for gas. Typically a provisional sum per system.'
    },
    common_estimating_errors: [
      'Missing items — not all items included that should be',
      'Wrong quantities — miscounting or misreading drawings',
      'Missed ductwork or piping runs — especially risers and voids',
      'Mistakes in labour calculations — wrong productivity rate for material type',
      'Too much budgeting/rough pricing for expediency — leads to under-estimation',
      'Poor overhead or profit markups',
      'Not checking estimate thoroughly — always cross-check totals',
      'Self-delusions on prices, labour and markups',
      'Incompetence or inexperience of the estimator'
    ],
    ai_estimating_checks: [
      'Verify all symbols on drawing are clear and legible — unclear symbols will be missed',
      'Check that AI has read all documents and specifications in the bid package',
      'Confirm AI has sufficient data for the particular trade niche',
      'Review AI output against manual count for critical items (equipment, major duct runs)',
      'Labour and material accuracy is foremost — verify before submitting'
    ],
    boq_structure: {
      grouping: 'Group by: Location/Floor \u2192 Unit/Equipment \u2192 System \u2192 Item Description \u2192 Size \u2192 Qty \u2192 Unit \u2192 Rate \u2192 Total',
      report_categories: 'Ductwork (by gauge/type), Pipework (by material/service), Insulation (by type/application), Equipment (by type), Accessories (dampers/valves/controls), Testing & Commissioning, Prelims/General',
      extensions: 'Material cost + Labour hours \u00d7 rate = Direct cost. Add overhead % + profit % = Sell price.',
      cross_checks: 'Compare total duct m\u00b2 with insulation m\u00b2 (should be similar). Compare equipment count with connection count. Compare floor areas with coverage ratios.'
    }
  },
  wermac_isometrics: {
    source: 'wermac.org/documents/isometric.html',
    fundamental_rules: [
      'Isometrics are NOT drawn to scale \u2014 dimensions are ALWAYS required for exact lengths. Never measure from the image.',
      'Pipes in isometric are drawn as SINGLE LINES representing the CENTRELINE. All dimensions are measured from centreline to centreline, NOT from outside of pipe/fitting.',
      'Isometrics are drawn on a 60\u00b0 equilateral triangle grid (30\u00b0 from horizontal). North orientation from plan drawings is preserved.',
      'Pipe lengths come from coordinates and elevations: vertical from elevation differences, horizontal from N-S and E-W coordinates.'
    ],
    dimension_rules: [
      'A-dimension: Front of pipe/flange to centreline of elbow (face-to-centre)',
      'B-dimension: Centreline to centreline of elbows (centre-to-centre)',
      'C-dimension: Same as A, front to centreline at other end',
      'All dims are to CENTRELINE \u2014 never to pipe outer wall or insulation surface'
    ],
    orthographic_vs_isometric: {
      orthographic: 'Double-line presentation showing pipe walls. Shows true shape in one plane but needs multiple views (plan + elevation + sections) for 3D routing.',
      isometric: 'Single-line (centreline) presentation. Shows 3D routing in one view. Faster to draw and read. Essential for complex multi-plane routing.',
      key_difference: 'In orthographic you see two parallel lines (pipe walls). In isometric you see ONE line (centreline). When reading isometrics, the single line IS the pipe \u2014 do not look for a second wall line.'
    },
    multi_plane_routing: [
      'Pipes commonly route through 3 planes (N-S, E-W, up-down). Each direction change shown by an elbow/bend symbol at the turn.',
      'When a pipe passes BEHIND another pipe in isometric, a LINE BREAK is drawn (gap in the line). This is a drawing convention, NOT a disconnection.',
      'Hatches (short diagonal marks) on isometric lines indicate directional changes. Different hatch directions = different routing directions. Misreading hatches changes the entire pipe route.',
      'Vertical runs shown as true vertical lines. Horizontal runs shown as 30\u00b0 angled lines.',
      'Bypass loops and branches that are hidden in plan view become visible in isometric \u2014 always check isometrics for features not visible on plans.'
    ],
    fitting_representation: [
      'Flanges: two parallel short lines perpendicular to pipe. Count as nr pairs.',
      'Butt welds: single dot/circle on the pipe line at the joint.',
      'Elbows: pipe changes direction with no symbol (or small radius curve). Count bends for fittings allowance.',
      'Tees: pipe branches off at right angle. Main run continues, branch departs.',
      'Reducers: pipe line narrows (or widens). Size change annotated.',
      'Valves: specific symbol on the pipe line (gate, globe, ball, check etc.).',
      'Supports: shown as callout symbols below/beside pipe with reference tags.'
    ],
    what_NOT_to_measure: [
      'Dimension text and arrows (A, B, C measurements are reference info, not pipe)',
      'North arrow and orientation markers',
      'Auxiliary cube/grid lines (visualisation aids, not pipe)',
      'Line breaks where pipes cross behind each other (not a gap in the pipe)',
      'Hatch marks indicating direction changes (drawing convention, not fittings)',
      'Weld dots (joint indicators, not pipe length)',
      'Support callout symbols and reference tags'
    ],
    adaptation_for_ductwork: [
      'Ductwork isometrics follow same principles but may use double-line representation for rectangular ducts even in isometric view',
      'Circular/spiral ducts may still use single-line with centreline in isometric',
      'Duct fittings (bends, tees, reducers) shown similarly to pipe fittings at direction changes',
      'Size annotations critical \u2014 duct sizes (\u00d8 or W\u00d7H) always from annotations, never measured',
      'VCDs, fire dampers, attenuators shown as symbols inline on the duct run',
      'Flexible connections at terminals shown as wavy/corrugated section'
    ]
  },
  blueprint_ocr: {
    source: 'MobiDev OCR Systems Development Guide (mobidev.biz) — blueprint and engineering drawing recognition',
    ocr_pipeline_for_mep: [
      'Step 1 SCAN: High-resolution image capture. Vector PDFs preferred over rasterised. If rasterised, apply extra scrutiny.',
      'Step 2 PREPROCESS: Noise reduction, rotation correction, cropping, contrast adjustment. Critical for M&E drawings with thin lines and small annotations.',
      'Step 3 SEGMENT: Divide image into categories — title block/tables, geometric elements (lines/shapes), text annotations, GD&T symbols. This separation is KEY for M&E drawings.',
      'Step 4 CLASSIFY: For each segment, determine: Is it a physical service (duct/pipe/cable)? Is it text (annotation/label)? Is it a dimension (arrows/leaders)? Is it a symbol (equipment/valve/damper)? Is it architectural background?',
      'Step 5 EXTRACT: Apply specialised recognition to each category — text OCR for annotations, symbol matching for equipment, line tracing for service runs.',
      'Step 6 VALIDATE: Cross-reference extracted data against legend, schedules, and internal consistency checks.',
      'Step 7 OUTPUT: Structured data with confidence scores for each extracted element.'
    ],
    image_segmentation_for_mep: {
      description: 'Engineering drawings require segmentation into distinct layers BEFORE any measurement or counting',
      segments: [
        'Title Block: Project info, drawing number, revision, scale, originator — extract as metadata',
        'Legend/Key: Symbol definitions, line types, colours — extract FIRST, use as master reference',
        'Geometric elements: Physical service lines (ducts, pipes, cables) — these are what we MEASURE',
        'Text annotations: Labels, sizes, room names, flow rates — these INFORM measurements but are NOT physical services',
        'Dimension lines: Arrows, leaders, dimension text — NEVER count these as service length',
        'Equipment symbols: AHUs, VCDs, grilles, valves — COUNT these as nr items',
        'Architectural background: Walls, doors, grid lines, furniture — IGNORE entirely',
        'Hatching/shading: Material fills, insulation indicators — INFORM spec but are NOT physical runs'
      ]
    },
    challenges_specific_to_mep: [
      'Complex overlapping views: Supply and extract duct may overlap on plan — must separate by colour/line type per legend',
      'Technical symbols vs text: VCD butterfly symbol can look like text character. Valve symbols can look like dimension markers. Always match against legend.',
      'Thin lines vs thick lines: New services typically drawn heavier than existing. But dimension lines are also thin. Distinguish by context (dimension lines have arrows + numbers).',
      'Colour degradation: Printed/scanned drawings may lose colour fidelity. Cyan intake air may appear as light grey. Compare against legend colours, not absolute colour values.',
      'Rasterised vs vector PDFs: Vector PDFs allow precise line identification. Rasterised (scanned) PDFs require image processing and are much harder to analyse accurately.',
      'Missing annotations: Some duct/pipe runs may lack size annotations. Flag as "size TBC" rather than guessing.',
      'Nested/overlapping views: Section callouts may overlap with plan views. Identify view boundaries before measuring.',
      'Scale variations: Different viewports on the same sheet may have different scales. Check scale per viewport.'
    ],
    what_ai_vision_should_distinguish: {
      physical_services: 'Solid/heavy lines matching legend colours. These are the ductwork, pipework, cable runs. MEASURE these.',
      text_annotations: 'Alphanumeric characters near services showing sizes, labels, flow rates. READ these for information. Do NOT measure them as pipe/duct.',
      dimension_elements: 'Thin lines with arrowheads at both ends + numbers between. Pure drawing conventions. NEVER measure as service.',
      equipment_symbols: 'Standardised shapes (rectangles=AHU, butterflies=VCD, crossed squares=grilles). COUNT as nr items at their position.',
      drawing_furniture: 'Grid lines, north arrows, section markers, revision clouds, room labels. IGNORE completely.',
      insulation_indicators: 'Wider concentric outline or cross-hatching around services. INFORMS insulation scope but is NOT duct/pipe. Quantify insulation separately as m\u00b2.'
    },
    custom_training_insights: [
      'Generic OCR (Tesseract) struggles with M&E symbols — custom training on labelled M&E drawings dramatically improves accuracy',
      'OpenCV preprocessing (noise reduction, contrast, line detection) is essential before any recognition step',
      'Image segmentation models (trained to separate text from lines from symbols) are the foundation of accurate M&E extraction',
      'Iterative training: train on subset, evaluate, retrain with corrections. Each project improves the model.',
      'Labelled datasets from real M&E drawings are the most valuable training resource — project-specific symbols vary significantly',
      'Post-processing validation (cross-referencing extracted quantities against schedules/legends) catches >80% of recognition errors'
    ],
    application_to_contraq: [
      'When Claude analyses a PDF drawing, it is effectively performing Steps 3-7 of this pipeline using its vision capabilities',
      'The CIBSE_SYMBOLS_REF acts as the "trained model" — providing the symbol/colour recognition library',
      'The two-pass verification (classify then confirm) mimics the segmentation → classification → validation pipeline',
      'The legend-first rule ensures project-specific symbols override generic training data',
      'Conservative defaults handle the "degraded image quality" challenge — when uncertain, under-count and flag',
      'The self-check step mirrors the post-processing validation — verifying internal consistency before outputting'
    ]
  },
  ai_ocr_calibration: {
    source: 'iTech AI-based OCR for Engineering Drawings Guide (itechindia.co)',
    model_based_vs_traditional: {
      traditional_limitations: [
        'Struggles with complex layouts — cannot handle multi-directional text or unconventional placement',
        'Misinterprets engineering symbols and notations specific to M&E services',
        'Lacks contextual understanding — cannot determine if a character is a dimension, label, or service identifier',
        'Not adaptable to specific document types — same algorithm for invoices and MEP drawings',
        'Cannot handle rotated or angled text common on duct/pipe annotations'
      ],
      model_based_advantages: [
        'Uses customised templates for specific document types (MEP plans, sections, isometrics)',
        'Predefined models define expected structure: title block location, legend position, drawing area boundaries',
        'AI integration enables contextual understanding — distinguishes critical text from surrounding diagrams',
        'Dynamic parameter adjustment — adapts recognition criteria per drawing (text orientation, symbol density)',
        'Machine learning from corrections — accuracy improves with each analysis iteration'
      ]
    },
    preprocessing_pipeline: {
      step1_acquisition: 'High-resolution image capture. Vector PDFs preferred (direct text/line data). Scanned/rasterised PDFs need extra processing.',
      step2_noise_reduction: 'Remove scanning artefacts, stray pixels, coffee stains, fold marks. Critical for thin M&E lines that can be lost in noise.',
      step3_binary_conversion: 'Convert to black and white (thresholding). Separates foreground (lines/text) from background. For colour M&E drawings, preserve colour channels for system identification BEFORE binary conversion.',
      step4_contrast_enhancement: 'Increase contrast between service lines and background. Helps distinguish faded existing services from bold new services.',
      step5_edge_detection: 'Identify boundaries of elements. For M&E: edges of duct outlines, pipe runs, equipment boxes. Contour analysis locates text regions vs graphical regions.',
      step6_deskew_rotation: 'Correct tilted scans. Also handle intentionally rotated text (common on M&E drawings where pipe/duct labels follow the run direction).'
    },
    text_detection_challenges: {
      rotated_text: 'M&E drawings frequently place text along duct/pipe runs at angles. Text detection must handle 0\u00b0, 90\u00b0, and arbitrary angles. Size annotations like "250mm\u00d8" often follow the duct direction.',
      mixed_with_graphics: 'Text labels sit directly on or adjacent to service lines. Must distinguish "250" (a size label) from a 250mm-long line segment nearby.',
      symbol_vs_character: 'Engineering symbols (\u00d8, VCD butterfly, valve bow-tie) can be misread as characters. Context determines whether a circle is the diameter symbol or a globe valve.',
      multi_font_sizes: 'Title block text (large), room labels (medium), duct sizes (small), notes (tiny). Each needs different recognition sensitivity.',
      handwritten_annotations: 'Site mark-ups, RFI notes, red-line comments. Lower accuracy expected — flag as "handwritten, verify".'
    },
    context_analysis_for_mep: [
      'Dictionary checking: M&E-specific terms (LTHW, ChW, VCD, AHU) should be in the recognition dictionary, not just English words',
      'Context determines meaning: "FD" next to a duct at a wall = Fire Damper. "FD" in title block = "For Discussion" or "Final Design"',
      'Pattern matching: Duct sizes follow patterns like "NNNmm\u00d8" or "NNN\u00d7NNN". Pipe sizes like "NNmm" or "NNmm\u00d8". Recognise these patterns.',
      'Spatial relationships: A size label near a service line belongs to THAT service. A room label in the middle of a space is NOT a service.',
      'Formatting correction: Line breaks in tight spaces may split "250mm" across lines. Reassemble split annotations.',
      'Noise reduction in output: After recognition, validate extracted quantities against expected ranges (e.g. duct run >500m on a single floor is likely an error)'
    ],
    calibration_for_mep_drawings: [
      'BEFORE analysis: Identify drawing type (plan/section/isometric/detail/schematic) — each type has different recognition rules',
      'COLOUR PRESERVATION: For M&E colour-coded drawings, preserve colour information before any binary conversion. System identification depends on colour.',
      'SCALE CALIBRATION: Read scale from title block. Apply consistently. Different viewports may have different scales on the same sheet.',
      'LEGEND TEMPLATE: Extract legend first. Build a project-specific recognition template from it. Use this template for all subsequent element matching.',
      'LINE WEIGHT SENSITIVITY: New services = heavier lines. Existing = lighter/dashed. Dimensions = thinnest with arrowheads. Set detection thresholds accordingly.',
      'SYMBOL LIBRARY MATCHING: Compare detected shapes against CIBSE symbol library + project legend symbols. Require minimum confidence threshold for positive identification.',
      'POST-RECOGNITION VALIDATION: Cross-check every extracted quantity against: (a) drawing scale, (b) room/floor dimensions, (c) equipment schedules, (d) internal consistency'
    ]
  },
  paddleocr_finetuning: {
    source: 'PaddleOCR PP-OCRv5 Fine-Tuning Guide (timc.me) — step-by-step model calibration for custom recognition',
    why_finetuning_matters_for_mep: [
      'Pre-trained OCR models are trained on general text (documents, signs, books). M&E drawings contain specialised symbols, fonts, and layouts that generic models misread.',
      'Fine-tuning on labelled M&E drawing data teaches the model: engineering symbols (\u00d8, \u00d7, VCD butterflies), technical fonts (CAD text styles), rotated annotations, size patterns (NNNmm\u00d8).',
      'Custom dictionary (dict.txt) limits recognition to expected characters — prevents hallucinating characters that don\u2019t exist in M&E drawings.',
      'Even small training datasets (100-500 labelled images) can dramatically improve accuracy for specific symbol sets.'
    ],
    finetuning_pipeline: {
      step1_environment: 'Python 3.11+, PaddlePaddle with CUDA GPU support, PaddleOCR repository cloned with dependencies installed.',
      step2_data_preparation: {
        description: 'Training data must be labelled images with ground-truth text. For M&E: cropped images of individual annotations paired with correct text.',
        labels_csv: 'Format: filename,label (no header). E.g. "duct_size_001.jpg,250mm\u00d8" or "valve_label_042.jpg,FD-01".',
        gen_label: 'Convert CSV to PaddleOCR format using ppocr/utils/gen_label.py --mode="rec".',
        train_val_split: 'Split into train.txt and val.txt. Typically 80/20 or 90/10 ratio.',
        dict_txt: 'Character dictionary — one character per line. For M&E include: 0-9, A-Z, a-z, \u00d8, \u00d7, /, -, _, ., mm, m\u00b2, nr, \u00a3, %, and all M&E-specific characters.'
      },
      step3_config: {
        description: 'Copy PP-OCRv5_server_rec.yml as base config. Key modifications:',
        key_parameters: {
          epoch_num: 'Number of training passes. Start with 200-500 for small M&E datasets. More epochs = more learning but risk overfitting.',
          batch_size: 'Images per training step. 64-128 typical. Reduce if GPU memory limited.',
          save_epoch_step: 'Save checkpoint every N epochs (e.g. 50). Allows rollback to best-performing checkpoint.',
          eval_batch_step: 'Evaluate accuracy every N iterations (e.g. [0, 500]). Monitors progress during training.',
          max_text_length: 'Longest label in dataset. For M&E: typically 15-25 characters (e.g. "250mm\u00d8 Supply Air" = 18 chars).',
          pretrained_model: 'Path to PP-OCRv5 pretrained weights. Fine-tuning from pretrained is MUCH faster than training from scratch.',
          character_dict_path: 'Path to custom dict.txt with M&E character set.',
          RecAug: 'Random augmentation. Remove for small M&E datasets to avoid noise. Keep for larger datasets to improve generalisation.'
        }
      },
      step4_training: 'Run: python tools/train.py -c data/config.yml. Monitor loss curve and accuracy metrics. Training time depends on dataset size and GPU.',
      step5_export: 'Export best model: python tools/export_model.py with best_accuracy.pdparams. Creates inference.pdiparams + inference.json for deployment.',
      step6_evaluation: 'Test on held-out validation images. Check per-character accuracy and full-label accuracy. For M&E: test on real drawing crops.'
    },
    hyperparameter_calibration: {
      epoch_tuning: 'Start low (200). If validation accuracy still improving at final epoch, increase. If it plateaus or drops (overfitting), reduce or use earlier checkpoint.',
      batch_size_tuning: 'Larger batches = smoother gradients but more GPU memory. For M&E fine-tuning with small datasets: 32-64 is often better than 128.',
      learning_rate: 'Fine-tuning uses lower LR than training from scratch (typically 1e-4 to 1e-5). Too high = catastrophic forgetting of pretrained knowledge.',
      augmentation_strategy: 'For M&E drawings: rotation augmentation is useful (labels appear at angles). Colour jitter less useful (drawings are mostly B&W or standard colours). Noise injection useful for scanned drawings.',
      early_stopping: 'Monitor validation accuracy. Stop training when accuracy stops improving for 50+ epochs.'
    },
    application_to_contraq_mep: {
      what_to_label: [
        'Duct size annotations: "250mm\u00d8", "600\u00d7300", "200\u00d8"',
        'Pipe size annotations: "50mm", "100mm\u00d8", "DN80"',
        'Equipment labels: "AHU-01", "MHRV 1", "FCU-3A", "VCD", "FD"',
        'System abbreviations: "SA", "EA", "IA", "DA", "LTHW_F", "ChW_R"',
        'Room labels: "Plant Room", "Ceiling Void", "Office 101"',
        'Drawing references: "C1799/00/DR/MX/57001", "Rev P01"',
        'Scale notations: "1:50@A1", "NTS", "DO NOT SCALE"',
        'Flow rates/pressures: "150 l/s", "250 Pa"'
      ],
      custom_dictionary_chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\u00d8\u00d7/\\-_.,:\u00b2\u00b3\u00b0()[]@#\u00a3%&+= ',
      training_data_sources: [
        'Crop annotations from real M&E project drawings (best quality training data)',
        'Generate synthetic annotations using CAD fonts (AutoCAD SHX, Revit text styles)',
        'Include rotated versions of each annotation (0\u00b0, 90\u00b0, 180\u00b0, 270\u00b0, and arbitrary angles)',
        'Include various image qualities: vector-clean, scanned, low-res, faded',
        'Include both new-service annotations (clear/bold) and existing-service annotations (faded/grey)'
      ],
      expected_accuracy_gains: 'Generic PP-OCRv5 on M&E drawings: ~60-75% character accuracy. Fine-tuned on 200+ labelled M&E annotations: ~90-98% character accuracy. The \u00d8 symbol and multi-character sizes (250mm\u00d8) show the biggest improvement.'
    }
  },
  keras_ocr_preprocessing: {
    source: 'Keras-OCR for Complex Engineering Drawings (Sainath/Medium) — progressive preprocessing pipeline',
    accuracy_factors: [
      'Font size too small \u2014 common on M&E drawings for duct/pipe size annotations in tight spaces',
      'Handwritten text not clear \u2014 site mark-ups, RFI responses, red-line comments',
      'Drawing quality poor \u2014 scanned from print, faded, creased, low-resolution',
      'Font cannot be separated from background \u2014 text overlaps service lines or hatching',
      'Font or document skewed/distorted \u2014 scanned at angle, or text follows duct run direction'
    ],
    progressive_preprocessing: {
      method1_raw: {
        description: 'Direct OCR without preprocessing. Keras-OCR pipeline produces bounding boxes around detected text with coordinates.',
        accuracy: 'Decent baseline. Captures most large/clear text but misses small annotations and text in busy areas.',
        mep_application: 'Good for title block text, room labels, large equipment tags. Insufficient for small duct/pipe sizes.'
      },
      method2_sharpening: {
        description: 'Apply sharpening kernel filter before OCR. 3\u00d73 kernel: [[-1,-1,-1],[-1,9,-1],[-1,-1,-1]]. Enhances edges of text characters.',
        accuracy: 'Captures additional fields missed by raw OCR (e.g. small equipment tags like H20-6, V-03).',
        mep_application: 'Critical for M&E drawings where size annotations are small text near service lines. Sharpening separates text edges from line edges.'
      },
      method3_super_resolution: {
        description: 'EDSR (Enhanced Deep Super-Resolution) 4\u00d7 upscaling before OCR. ResNet-style architecture without batch normalisation. Uses residual scaling factor 0.1.',
        accuracy: 'Significantly better \u2014 captures text in title blocks, schedules, and fine annotations that were previously missed.',
        mep_application: 'Essential for scanned/rasterised M&E drawings. 4\u00d7 upscaling makes small duct sizes (e.g. "100mm\u00d8") readable. Also helps with faded existing-service annotations.',
        models_tested: 'EDSR performed best for engineering drawings. ESPCN, FSRCNN, LapSRN also available but less effective on technical drawings.'
      },
      method4_line_removal: {
        description: 'After super-resolution, remove horizontal/vertical lines via contour detection. Process: greyscale \u2192 binary threshold (Otsu) \u2192 morphological dilation \u2192 find contours \u2192 filter by area (<5000px = text, keep; >5000px = line, remove to white mask).',
        accuracy: 'Captures nearly all text fields by eliminating line interference.',
        mep_application: 'CRITICAL for M&E plan views where duct/pipe lines run directly through or adjacent to text annotations. Removing lines isolates the text for clean OCR. However: PRESERVE line data separately for service identification \u2014 only remove lines for the TEXT extraction pass, not for the SERVICE tracing pass.'
      }
    },
    bounding_box_output: {
      description: 'Keras-OCR returns text + bounding box coordinates for each detected word. Bounding boxes give the exact pixel location of each annotation on the drawing.',
      mep_application: [
        'Bounding box position determines which SERVICE a label belongs to \u2014 a "250mm\u00d8" label near a duct line belongs to that duct',
        'Spatial clustering: group annotations by proximity to services for automatic service-to-label association',
        'Bounding box angle reveals text rotation \u2014 rotated labels follow the service direction',
        'Multiple OCR passes at different preprocessings can be merged using bounding box overlap detection'
      ]
    },
    dual_pass_strategy_for_mep: [
      'PASS 1 \u2014 SERVICE LINES: Process the full drawing (with lines intact) to trace duct/pipe runs, identify equipment symbols, detect system colours. This is the GEOMETRIC pass.',
      'PASS 2 \u2014 TEXT EXTRACTION: Apply line removal + super-resolution + sharpening, then OCR to extract all text annotations cleanly. This is the TEXT pass.',
      'MERGE: Use bounding box positions from Pass 2 to associate extracted text with services identified in Pass 1.',
      'VALIDATE: Cross-reference extracted sizes against expected ranges per service type (e.g. duct sizes 100-1200mm\u00d8, pipe sizes 15-300mm).',
      'This dual-pass approach prevents the core M&E problem: lines interfering with text recognition AND text interfering with line tracing.'
    ]
  },
  official_paddleocr_training: {
    source: 'Official PaddleOCR documentation (paddlepaddle.github.io, github.com/PaddlePaddle/PaddleOCR) — recognition and detection training',
    dataset_formats: {
      recognition: {
        format: 'SimpleDataSet: image_path\\tlabel (tab-separated, no header). Each line = one cropped text image + its ground truth text.',
        example: 'data/images/duct_250.jpg\\t250mm\u00d8',
        structure: 'data/ \u2192 images/ (cropped annotation images) + train.txt + val.txt + dict.txt',
        gen_label: 'ppocr/utils/gen_label.py --mode="rec" converts CSV to PaddleOCR format',
        split: 'Recommended 80/20 or 90/10 train/val split'
      },
      detection: {
        format: 'image_path\\t[{"transcription":"text","points":[[x1,y1],[x2,y2],[x3,y3],[x4,y4]]}, ...]',
        description: 'Points = 4 corners of text bounding box, clockwise from upper-left. Transcription = the text content.',
        labelling_tool: 'PPOCRLabel provides GUI annotation. Auto-annotates using PP-OCR then allows manual correction.'
      }
    },
    config_yml_reference: {
      global_section: {
        use_gpu: 'true for GPU training, false for CPU',
        epoch_num: 'Total training epochs. Fine-tuning: 200-500. From scratch: 1000+.',
        save_model_dir: 'Output directory for checkpoints',
        save_epoch_step: 'Save checkpoint every N epochs (e.g. 50)',
        eval_batch_step: '[start_iter, interval]. E.g. [0, 500] = evaluate every 500 iterations from start.',
        pretrained_model: 'Path or URL to pre-trained weights (.pdparams). CRITICAL for fine-tuning — always start from pretrained.',
        character_dict_path: 'Path to custom dictionary file. One character per line.',
        use_space_char: 'true to recognise spaces. Set true for M&E annotations with spaces (e.g. "Supply Air").',
        max_text_length: 'Maximum label length. For M&E: 25-30 chars to cover labels like "250mm\u00d8 Supply Air Ductwork".',
        character_type: 'Set to "ch" for custom dictionary support.'
      },
      optimizer_section: {
        lr_name: 'Cosine (recommended for fine-tuning). Learning rate decays smoothly.',
        learning_rate: '0.001 for training from scratch. 0.0001-0.00001 for fine-tuning (lower to preserve pretrained knowledge).'
      },
      train_section: {
        dataset_name: 'SimpleDataSet for file-based images. LMDBDataSet for LMDB-format databases.',
        data_dir: 'Root directory containing images',
        label_file_list: 'Array of label file paths: ["./data/train.txt"]',
        batch_size: 'first_bs or batch_size_per_card. 64-128 typical. Must be < number of training images.',
        transforms: 'RecAug for random augmentation. Includes: cvtColor, blur, jitter, Gaussian noise, random crop, perspective, colour reverse, TIA. Each applied with 40% probability.'
      },
      eval_section: {
        data_dir: 'Validation data directory',
        label_file_list: '["./data/val.txt"]',
        batch_size_per_card: 'Can differ from training batch size'
      }
    },
    training_commands: {
      train: 'python tools/train.py -c data/config.yml',
      train_distributed: 'python -m paddle.distributed.launch --gpus "0,1" tools/train.py -c config.yml',
      evaluate: 'python tools/eval.py -c config.yml -o Global.checkpoints={path}/best_accuracy',
      export: 'python tools/export_model.py -c config.yml -o Global.pretrained_model={path}/best_accuracy.pdparams Global.save_inference_dir="./output/inference/"',
      predict: 'python tools/infer_rec.py -c config.yml -o Global.pretrained_model={path}/best_accuracy Global.infer_img=./test_image.jpg'
    },
    model_types: {
      pp_ocrv5_server: 'Highest accuracy. PP-OCRv5 server model. Best for M&E drawings where accuracy > speed.',
      pp_ocrv5_mobile: 'Faster, lighter. For real-time or mobile deployment. Acceptable for large clear annotations.',
      pp_ocrv3_en: 'English-optimised. Good baseline for fine-tuning on M&E English text.',
      custom_backbone: 'MobileNetV3 (lightweight), ResNet18_vd (medium), ResNet50_vd (heavy/accurate). Choose based on deployment constraints.'
    },
    augmentation_for_mep: {
      useful: [
        'Perspective transform: simulates viewing angle on scanned drawings',
        'Random crop: exposes model to partial annotations',
        'Gaussian noise: simulates scanning artefacts',
        'Rotation: critical for M&E where text follows duct/pipe direction'
      ],
      less_useful: [
        'Colour jitter: M&E drawings have standardised colours per CIBSE, jittering may confuse system identification',
        'Colour reverse: black-on-white vs white-on-black inversion rarely occurs in M&E drawings'
      ],
      recommendation: 'For M&E fine-tuning with <500 images: disable RecAug initially. Train to convergence. Then enable augmentation and retrain for generalisation.'
    },
    detection_vs_recognition: {
      detection: 'Finds WHERE text is on the drawing. Outputs bounding boxes. Uses DB (Differentiable Binarization) model.',
      recognition: 'Reads WHAT the text says within each bounding box. Uses CRNN/SVTR architecture.',
      for_mep: 'Both are needed. Detection finds annotation locations. Recognition reads the text. Fine-tune BOTH for best M&E results. Detection model helps distinguish text regions from service lines.'
    },
    pp_ocrv5_features: [
      'Supports 37+ languages including English with specialised accuracy',
      '30%+ accuracy improvement over v4 on multilingual text',
      'Dictionary stored in inference.yaml after export — no separate dict path needed at inference time',
      'Server model recommended for M&E accuracy requirements',
      'Pre-trained weights available for fine-tuning: PP-OCRv5_server_rec_pretrained.pdparams'
    ]
  },
  yolo_tesseract_symbol_detection: {
    source: 'Helle R. (2023) Intelligent Symbol Attributes Extraction from Engineering Drawings, University of Turku MSc Thesis — YOLOv7 + Tesseract',
    key_findings: {
      dataset: '443 engineering drawings. Surface roughness symbol: 5000+ occurrences, 96% detection accuracy. Other symbols (flatness, parallelism, position, symmetry): good accuracy with sufficient training data.',
      yolo_vs_faster_rcnn: 'YOLOv7 selected over Faster R-CNN. YOLO: faster, single-pass CNN, ideal for standardised symbols. Faster R-CNN: slightly more accurate on small/complex shapes but much slower. For M&E standard symbols (VCD, FD, grille, valve), YOLO-style detection is preferred.',
      training_data_size: '180+ labelled images minimum for acceptable accuracy (~80%). 443+ images for good accuracy (~90%+). More data always improves results. Synthetic data (symbols on white background) helps but real drawing data is much better.',
      resolution_challenge: 'Text recognition accuracy dropped significantly on low-resolution images. High-resolution input (300+ DPI for scanned, vector PDFs preferred) is critical for both symbol detection and OCR.'
    },
    combined_pipeline: {
      step1: 'YOLO detects symbol LOCATIONS with bounding boxes and class labels (e.g. "VCD", "fire_damper", "grille", "valve")',
      step2: 'Crop each detected region from the original image',
      step3: 'Apply Tesseract OCR to each cropped region to read associated text (size, label, reference)',
      step4: 'Combine symbol class + OCR text + bounding box position = fully identified element with attributes',
      step5: 'Position on drawing determines which service/location the symbol belongs to'
    },
    tesseract_config_for_drawings: {
      oem: 'Default (oem=3). Uses LSTM neural network engine. Best general accuracy.',
      psm: 'psm=6 (assume single uniform block of text). Best for isolated annotation crops after symbol detection. Alternatives: psm=7 (single text line), psm=8 (single word), psm=13 (raw line).',
      preprocessing: 'Add 10px white border around cropped text region — Tesseract needs padding around characters for accurate recognition. Without padding, edge characters are missed.',
      newline_handling: 'Replace newlines with empty — engineering annotations are single-line. Newlines indicate OCR errors.',
      custom_whitelist: 'For M&E annotations: --tessedit_char_whitelist 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\u00d8\u00d7.-/_ restricts recognition to expected characters and prevents hallucination.'
    },
    labelling_strategy: {
      symbol_only: 'Label only the symbol itself (e.g. just the VCD butterfly). Easier for model to learn distinct shapes. Requires post-processing to expand region and find associated text.',
      symbol_plus_text: 'Label the entire element including symbol + text + reference. Harder for model initially (similar boxes confuse it) but better for pipeline once sufficient data (300+ images). This is the preferred approach for M&E.',
      label_format_yolo: 'One .txt file per image. Each line: class_index x_center y_center width height (all as fractions 0-1 of image size).',
      tools: 'Label Studio, LabelImg, Roboflow, CVAT. Export in YOLO format.'
    },
    preprocessing_for_drawings: {
      pdf_to_png: 'Convert PDF pages to PNG at 300+ DPI using pdf2image library. Maintains quality.',
      greyscale: 'Convert to greyscale (single channel 0-255) to simplify processing.',
      thresholding: 'Apply binary threshold (e.g. pixel < 200 = black, > 200 = white). Removes noise, keeps well-defined lines. Value 200 catches light symbols without including noise.',
      contour_detection: 'OpenCV findContours locates all shapes. Filter by area, aspect ratio, vertex count to find specific elements (rectangles with 4 perpendicular sides).'
    },
    accuracy_metrics: {
      iou: 'Intersection over Union — measures bounding box fit. Threshold typically 0.5 (50% overlap = correct detection).',
      confidence: 'Probability(Object) \u00d7 IoU. Filter results by minimum confidence (e.g. 0.25-0.5 for M&E symbols).',
      precision: 'TP / (TP + FP). High precision = few false detections. Critical for M&E to avoid counting non-existent equipment.',
      recall: 'TP / (TP + FN). High recall = few missed detections. Important to not miss fire dampers or VCDs.',
      mAP: 'Mean Average Precision across all classes. Best single metric. 0.9+ achievable for standard M&E symbols with good training data.'
    },
    application_to_mep: {
      symbol_classes: [
        'VCD (volume control damper) — butterfly/throttle symbol in duct runs',
        'FD (fire damper) — symbol at fire-rated wall/floor penetrations',
        'Grille/diffuser — crossed square or circle at duct terminals',
        'Louvre — parallel lines at external wall openings',
        'Valve symbols — gate (bow-tie), globe (circle), ball, butterfly, check',
        'Pump — circle with arrow/triangle',
        'AHU/MHRV/FCU — labelled rectangles with fan symbols',
        'Thermostat/sensor — circle with T/H',
        'Access door — rectangle marked AD',
        'Flexible duct — wavy section at terminals'
      ],
      training_recommendation: 'Collect 50+ labelled examples per symbol class from real M&E drawings. Include variations (different drawing styles, scales, qualities). Use YOLO format labels. Fine-tune from COCO-pretrained YOLOv7/v8 weights. Train 100-300 epochs with batch size 16. Validate on held-out test set.',
      integration_with_contraq: 'YOLO symbol detection + Tesseract text OCR mirrors what Claude does when analysing M&E PDFs: identify equipment symbols (YOLO equivalent) then read associated annotations (Tesseract equivalent). The thesis validates that this combined approach achieves 80-96% accuracy on engineering drawings.'
    }
  },
  nrm2_measurement_rules: {
    source: 'RICS NRM 2: Detailed Measurement for Building Works, 2nd Edition (October 2021, effective 1 December 2021). Replaces SMM7. RICS Guidance Note. ISBN 978-1-78321-425-9.',
    purpose: 'Standard measurement rules for BoQ preparation. Provides uniform basis for measuring and describing building works. Mandatory for RICS-compliant quantity surveying.',
    units_of_measurement: {
      m: 'linear metre (pipework, ductwork, cable, insulation to pipes/ducts)',
      m2: 'square metre (insulation to flat surfaces, sheet cladding, fire stopping boards)',
      m3: 'cubic metre (not commonly used in M&E)',
      nr: 'number (equipment items, fittings, accessories, valves, dampers)',
      kg: 'kilogramme (steelwork supports)',
      kW: 'kilowatt (plant capacity rating)',
      item: 'item (testing, commissioning, provisional sums)'
    },
    work_section_38_mechanical: {
      title: 'Work Section 38: Mechanical Services',
      scope: 'All mechanical engineering installations including heating, ventilation, air conditioning, hot and cold water, gas, compressed air, medical gases, fire suppression, and associated controls.',
      general_rules: [
        'Pipework measured in linear metres (m) along centreline, stating nominal bore/diameter, material, jointing method, and fixing method.',
        'Pipework fittings (bends, tees, reducers, flanges) enumerated as nr, stating type, size, and material.',
        'Valves enumerated as nr, stating type (gate, globe, ball, butterfly, check, pressure reducing), size, material, and actuator type if motorised.',
        'Ductwork measured in linear metres (m) along centreline, stating cross-section dimensions (circular diameter or rectangular WxH), material, gauge/thickness, and fixing method.',
        'Ductwork fittings (bends, tees, reducers, offsets, transformation pieces) enumerated as nr, stating type and size.',
        'Equipment items (boilers, chillers, AHUs, pumps, fan coil units, heat exchangers, calorifiers, pressurisation units) enumerated as nr with full specification and capacity.',
        'Supports and hangers deemed included in pipework/ductwork rates UNLESS specifically described as separate items.',
        'Testing and commissioning measured as item per system or installation.',
        'All work measured net — no allowance for waste in quantities (waste is in the rate).'
      ],
      pipework_measurement: {
        unit: 'm (linear metre along centreline)',
        classification: 'By nominal bore: \u226415mm, 20mm, 25mm, 32mm, 40mm, 50mm, 65mm, 80mm, 100mm, 125mm, 150mm, 200mm, 250mm, 300mm, >300mm in 50mm stages.',
        description_must_state: ['Material (copper, steel, stainless steel, plastic, MLCP)', 'Nominal bore/diameter', 'Jointing method (soldered, pressed, welded, threaded, flanged, push-fit)', 'Type of system (LTHW, MTHW, HTHW, ChW, DHW, CWS, condensate)', 'Fixing method (clipped to structure, bracketed, in trench, in duct)'],
        extras_enumerated: 'Pipe fittings, connections to equipment, connections through fire barriers, testing, labelling'
      },
      ductwork_measurement: {
        unit: 'm (linear metre along centreline)',
        classification_circular: 'By diameter: \u2264200mm\u00d8, 250mm\u00d8, 300mm\u00d8, then in 50mm stages to 630mm\u00d8, then 100mm stages.',
        classification_rectangular: 'By girth (perimeter of cross-section): \u22641000mm, 1000-2000mm, 2000-3000mm, >3000mm.',
        description_must_state: ['Material (galvanised steel, aluminium, phenolic, fabric)', 'Cross-section dimensions', 'Gauge/thickness', 'Type of system (supply air, extract air, fresh air, kitchen extract, smoke extract)', 'Fixing method (suspended, floor-mounted, wall-mounted)'],
        extras_enumerated: 'Duct fittings, access doors, fire dampers, volume control dampers, attenuators, grilles, diffusers, flexible connections, connections to equipment'
      },
      equipment_measurement: {
        unit: 'nr (number)',
        items_enumerated: ['Boilers (stating fuel type, output kW)', 'Chillers (stating capacity kW, refrigerant)', 'Air handling units (stating airflow l/s, components)', 'Fan coil units (stating capacity, type)', 'Pumps (stating duty, type)', 'Heat exchangers (stating capacity, type)', 'Pressurisation units', 'Controls and BMS (Building Management System)', 'Expansion vessels', 'Water treatment equipment'],
        description_must_state: 'Full specification including manufacturer reference where known, capacity/duty, power rating, physical dimensions where relevant, and all associated connections.'
      },
      insulation_to_services: {
        pipework_insulation: 'm (linear metre), stating pipe diameter, insulation material, thickness, finish (e.g. aluminium cladding, PVC jacket, self-adhesive tape). Classified by pipe diameter AND insulation thickness.',
        ductwork_insulation: 'm2 (square metre) for external wrap/board insulation to ducts, OR m (linear metre) for internal lining. State duct size range, insulation material, thickness, and facing.',
        equipment_insulation: 'nr or m2, depending on whether it is a bespoke jacket (nr) or sheet applied (m2). State equipment type, insulation material, thickness, finish.',
        trace_heating: 'm (linear metre) for trace heating cable/tape to pipes. State pipe diameter range, wattage per metre, control method. Junction boxes and thermostats enumerated as nr.',
        fire_stopping: 'See Work Section 31 below.'
      }
    },
    work_section_39_electrical: {
      title: 'Work Section 39: Electrical Services',
      scope: 'All electrical engineering installations including power distribution, lighting, fire alarm, data/comms, security, lightning protection, and associated controls.',
      general_rules: [
        'Cable measured in linear metres (m), stating size (mm\u00b2 cross-section), number of cores, type (XLPE, LSOH, SWA, FP), and voltage rating.',
        'Containment (cable tray, basket, trunking, conduit, ladder rack) measured in linear metres (m), stating type, material, and size.',
        'Fittings to containment (bends, tees, risers, couplers) enumerated as nr.',
        'Accessories (switches, sockets, isolators, connection units) enumerated as nr, stating type, rating, and finish.',
        'Distribution boards and panels enumerated as nr with full specification including number of ways, rating, type.',
        'Luminaires enumerated as nr, stating type, wattage, dimensions, lamp type, control gear.',
        'Fire alarm devices (detectors, call points, sounders, interfaces) enumerated as nr, stating type and specification.',
        'Small power, data, and comms outlets enumerated as nr.'
      ],
      cable_measurement: {
        unit: 'm (linear metre)',
        description_must_state: ['Cable type (XLPE/SWA, LSOH, FP200, mineral insulated)', 'Cross-sectional area (mm\u00b2)', 'Number of cores', 'Voltage rating', 'Installation method (in containment, direct in plaster, clipped, buried)']
      },
      containment_measurement: {
        unit: 'm (linear metre)',
        types: ['Cable tray (perforated, basket, ladder) — by width: \u2264150mm, 225mm, 300mm, 450mm, 600mm, 750mm, 900mm', 'Trunking (PVC, steel, dado, skirting, floor) — by size', 'Conduit (steel, PVC, flexible) — by diameter: 20mm, 25mm, 32mm', 'Cable ladder — by width']
      }
    },
    work_section_31_insulation_firestopping: {
      title: 'Work Section 31: Insulation, Fire Stopping and Fire Protection',
      scope: 'Thermal insulation, acoustic insulation, fire stopping, and passive fire protection to building fabric and services. NOTE: Insulation to M&E services is often measured under WS 38/39, but fire stopping penetrations are under WS 31.',
      fire_stopping_rules: [
        'Fire stopping to service penetrations through fire-rated walls/floors measured as nr (number), stating: wall/floor type, fire rating (30 min, 60 min, 120 min, 240 min), penetration type (single pipe, multiple pipes, single duct, cable bundle), service size, and fire stopping system/product.',
        'Fire collars to plastic pipes enumerated as nr, stating pipe diameter and fire rating.',
        'Fire dampers measured under WS 38 (mechanical) as nr, BUT the builder\u2019s work forming the opening and making good is under WS 41.',
        'Intumescent wraps/coatings to steelwork measured as m2 or nr.',
        'Fire barriers within ceiling voids measured as m2, stating material and fire rating.',
        'Fire stopping to linear gaps (e.g. head-of-wall, curtain wall perimeter) measured in m (linear metre), stating gap width range and fire rating.'
      ],
      insulation_to_building_fabric: {
        flat_surfaces: 'm2 (square metre), stating material, thickness, finish, and application (wall, floor, ceiling, roof).',
        pipes_ducts: 'Measured under WS 38 insulation_to_services rules above.',
        acoustic: 'm2 for sheet/board. State material, thickness, and acoustic performance (dB reduction).'
      }
    },
    work_section_41_builders_work: {
      title: 'Work Section 41: Builder\u2019s Work in Connection with Mechanical, Electrical and Transportation Installations',
      scope: 'All builder\u2019s work required to facilitate M&E installations. This is the interface between the building fabric trades and the M&E subcontractor.',
      measurement_rules: [
        'Holes through walls, floors, and ceilings for service penetrations: enumerated as nr, stating size of hole (width \u00d7 height or diameter), wall/floor/ceiling type and thickness, and whether making good is included.',
        'Holes classified by size: not exceeding 0.50m\u00b2, 0.50-1.00m\u00b2, 1.00-2.00m\u00b2, 2.00-4.00m\u00b2, exceeding 4.00m\u00b2.',
        'Chases in walls/floors for concealed services: measured in m (linear metre), stating chase width and depth, and wall/floor material.',
        'Pipe sleeves through walls/floors: enumerated as nr, stating pipe size, sleeve material and length.',
        'Supports, bearers, and plinths for equipment: enumerated as nr or measured in m/m2, stating material and loadbearing capacity.',
        'Painting and decoration to exposed services: measured in m (linear metres for pipework) or m2 (for ductwork/equipment), stating system colour coding per CIBSE/BS requirements.',
        'Trenches and ducts for underground services within the building: measured under WS 5 (Excavating) but referenced here.',
        'Making good after M&E installation: deemed included in the hole/chase rates UNLESS specifically separated.',
        'Attendance on M&E subcontractors (general and special): measured as item. General attendance = welfare, storage, power. Special attendance = specific scaffolding, cranage, hoisting.'
      ],
      key_principle: 'Builder\u2019s work is measured by the QS as part of the main contract BoQ. The M&E subcontractor quotes NET of builder\u2019s work — i.e., the M&E sub assumes holes, chases, and fire stopping are done by others UNLESS their scope explicitly includes it. This is a common source of commercial disputes in M&E fit-out.'
    },
    flexible_ducts_measurement: {
      rule: 'Flexible ductwork measured in m (linear metre), stating diameter, insulation (if insulated type), and maximum length per run.',
      classification: 'By diameter: 100mm, 125mm, 150mm, 200mm, 250mm, 300mm.',
      note: 'Flexible duct is typically limited to 1.5m maximum length per NBS/CIBSE best practice. Longer runs should be flagged as non-compliant.'
    },
    application_to_contraq_quote_builder: {
      how_it_applies: [
        'Every line item in a Contraq AI-generated BoQ must have a unit of measurement compliant with NRM2: m, m2, nr, kg, kW, or item.',
        'Pipework items must state nominal bore, material, and system type — matching NRM2 WS 38 pipework classification.',
        'Ductwork items must state cross-section (diameter or WxH), material, and system type — matching NRM2 WS 38 ductwork classification.',
        'Insulation items must state pipe/duct size, insulation material, thickness, and finish — matching NRM2 WS 38 insulation rules.',
        'Fire stopping items must state penetration type, fire rating, and service size — matching NRM2 WS 31 rules.',
        'Equipment items must be enumerated as nr with full specification — matching NRM2 WS 38 equipment rules.',
        'Builder\u2019s work (holes, chases, sleeves) should be flagged as \u201cby others\u201d or included depending on subcontractor scope — matching NRM2 WS 41.',
        'Trace heating measured in m with wattage and pipe diameter — matching NRM2 WS 38.',
        'The AI confidence scoring system should flag items where the unit of measurement could not be determined from the drawing.'
      ],
      boq_format: 'NRM2 BoQ format: Item ref | Description | Unit | Quantity | Rate | Amount. Descriptions must follow NRM2 classification hierarchy. Items grouped by element (NRM1 mapping) or work section (NRM2 WS 38/39/41).'
    }
  },
  donut_layout_understanding: {
    source: 'Donut: OCR-free Document Understanding Transformer (NAVER CLOVA, ECCV 2022). GitHub: clovaai/donut. Paper: arxiv.2111.15664. 6.8k stars, MIT license.',
    core_concept: {
      what: 'Donut is an end-to-end Transformer that understands document images WITHOUT any OCR engine. It reads the raw image pixels and directly outputs structured data (JSON). No text detection, no character recognition, no post-processing pipeline.',
      why_revolutionary: 'Traditional document AI: Image \u2192 OCR (text detection + recognition) \u2192 NLP (parsing). Donut: Image \u2192 Structured JSON directly. Eliminates the entire OCR pipeline and its cascading errors.',
      architecture: 'Swin Transformer encoder (visual feature extraction from image) + GPT-style autoregressive decoder (generates structured output tokens). Input: document image (2560\u00d71920 pixels). Output: structured JSON/XML tokens.'
    },
    capabilities: {
      document_parsing: 'Extracts structured data from documents. E.g. receipt \u2192 {"menu":[{"nm":"Lemon Tea","cnt":"1","price":"25.000"}],"total":{"total_price":"25.000"}}. Achieves 91.3% accuracy on CORD receipt dataset.',
      document_classification: 'Classifies document type from image alone. 95.3% accuracy on RVL-CDIP (16-class dataset). Output: {"class":"scientific_report"}.',
      visual_qa: 'Answers questions about document content. Input: image + "what is the model name?" \u2192 Output: "donut". 67.5% on DocVQA.',
      table_extraction: 'Can extract tabular data directly from images of tables/schedules without needing cell detection or grid analysis. The decoder generates the table structure as nested JSON.'
    },
    training_pipeline: {
      data_format: 'metadata.jsonl with {file_name, ground_truth: {gt_parse: ...}}. All tasks unified as JSON prediction.',
      pretraining: 'Text reading task on synthetic data (SynthDoG) + real document images (IIT-CDIP 11M docs). Teaches the model to read text from images.',
      finetuning: 'Task-specific finetuning on labelled dataset. Config YAML specifies model, dataset, training params.',
      synthetic_data: 'SynthDoG (Synthetic Document Generator) creates training images with known ground truth. Available for English, Chinese, Japanese, Korean (0.5M images each).',
      training_command: 'python train.py --config config/train_cord.yaml --pretrained_model_name_or_path "naver-clova-ix/donut-base" --dataset_name_or_paths \'["dataset_name"]\'',
      hardware: 'Pre-trained on 64 A100 GPUs (~2.5 days). Fine-tuning on single A100 GPU is sufficient.'
    },
    application_to_mep_drawings: {
      schedule_extraction: [
        'M&E drawings contain equipment schedules (tables listing AHU specs, valve schedules, cable schedules). Donut can extract these as structured JSON directly from the image WITHOUT OCR.',
        'Example: Image of valve schedule \u2192 {"valves":[{"tag":"V-01","type":"gate","size":"50mm","rating":"PN16"},{"tag":"V-02","type":"butterfly","size":"150mm","rating":"PN10"}]}',
        'This bypasses the traditional problem of OCR misreading table cell boundaries and merging/splitting cells incorrectly.'
      ],
      title_block_extraction: [
        'Title blocks have fixed structure. Donut can be fine-tuned to extract: {"project":"Canary Wharf Tower 2","drawing_no":"C1799/00/DR/MX/57001","scale":"1:50@A1","revision":"P03","contractor":"Balfour Beatty","date":"2026-01-15"}',
        'This is high-value because title block data feeds into project metadata, revision tracking, and drawing register.'
      ],
      legend_extraction: [
        'Legends are semi-structured: symbol + description + system type. Donut can extract the legend as structured JSON, building the recognition template automatically.',
        'Example: {"legend":[{"symbol":"solid_blue_line","description":"Supply Air Ductwork","system":"SA","status":"new"},{"symbol":"dashed_red_line","description":"Existing LTHW","system":"LTHW","status":"existing"}]}'
      ],
      material_schedule_extraction: [
        'Material/specification schedules on drawings list items with quantities. Donut extracts these as structured lists without OCR errors on number/unit columns.',
        'Particularly useful for NBS specification references and equipment data sheets embedded in drawings.'
      ],
      limitations_for_mep: [
        'Donut works best on document-like regions (schedules, tables, title blocks, legends) rather than the main drawing area with geometric elements.',
        'For service line tracing and spatial measurement, traditional computer vision (line detection, colour segmentation) is still needed.',
        'Resolution matters: Donut base model uses 2560\u00d71920 input. M&E drawings at A1 size need high-res rendering or region-of-interest cropping.',
        'Fine-tuning requires labelled M&E schedule data (50-200 labelled examples per document type for good results).'
      ]
    },
    dual_approach_for_contraq: {
      strategy: 'Use Donut for STRUCTURED regions (schedules, title blocks, legends, tables) and traditional CV+OCR for GEOMETRIC regions (service lines, measurements, spatial layout).',
      pass1_donut: 'Identify and crop structured regions (title block, legend, equipment schedules). Feed to Donut for JSON extraction. Get project metadata, legend template, and schedule data.',
      pass2_cv_ocr: 'Process main drawing area with CIBSE colour matching, line detection, and calibrated OCR (PaddleOCR/Tesseract) for service identification and quantification.',
      merge: 'Combine structured data from Donut (equipment specs, legend definitions) with geometric data from CV+OCR (service runs, quantities, locations) into unified BoQ.'
    },
    synthdog_for_mep: {
      concept: 'SynthDoG generates synthetic training documents. For M&E: generate synthetic equipment schedules, valve schedules, cable schedules, title blocks with known ground truth.',
      benefit: 'Eliminates manual labelling bottleneck. Generate 1000s of training examples with perfect labels. Fine-tune Donut on synthetic M&E schedules, then validate on real drawings.',
      implementation: 'Adapt SynthDoG templates to M&E schedule formats. Include: column headers (Tag, Type, Size, Duty, Location), typical values, NRM2-compliant units, UK contractor naming conventions.'
    }
  },
  revision_hatching_detection: {
    source: 'Compiled from: Businessware Tech AI floor plan analysis (hatching detection), OpenCV contour detection documentation, Grabber Firestopping Application Guide (penetration measurement), SMACNA Through-Penetration Firestopping Guide, and Cortex DM revision management.',
    revision_clouds: {
      what_they_are: 'Revision clouds are irregular, scalloped outlines drawn around areas of a drawing that have been changed in the current revision. They alert the reader to look at that area for modifications.',
      detection_method: {
        visual_signature: 'Revision clouds have a distinctive scalloped/bumpy contour — a series of connected arcs rather than straight lines. This distinguishes them from rectangles, circles, and straight-line borders.',
        contour_analysis: 'Detect via OpenCV findContours() → filter by: (a) high perimeter-to-area ratio (scalloped edges have long perimeters relative to enclosed area), (b) non-convex shape (convexity defect detection), (c) arc-frequency analysis (regular repeating arcs along the contour).',
        colour_detection: 'Revision clouds are often drawn in a specific colour (commonly red, magenta, or a colour distinct from the service lines). Colour filtering can isolate them before contour analysis.',
        size_filtering: 'Revision clouds are typically large (enclosing a changed area). Filter out small contours. Minimum bounding area threshold removes small symbols and text.'
      },
      what_to_do_with_them: [
        'IDENTIFY the revision cloud region — extract its bounding box coordinates.',
        'READ the revision number/letter near the cloud (usually a triangle with number, e.g. \u25b3P03 or Rev C).',
        'COMPARE: Items inside revision clouds are the CHANGED items in this revision. Items outside are unchanged from previous revision.',
        'PRIORITISE: When generating a BoQ from a revised drawing, focus on revision-clouded areas first — these are the new/changed scope.',
        'FLAG: Items in revision clouds should be flagged in the BoQ as "Rev [X] change" with confidence note.'
      ],
      mep_significance: 'In M&E drawings, revision clouds indicate changed services — added/removed/rerouted duct runs, changed equipment specs, new valve positions, modified pipe routes. These are the items most likely to need re-pricing.'
    },
    hatched_areas: {
      what_they_represent: 'Hatched areas on M&E drawings represent: (a) fire-rated walls/floors/ceilings (cross-hatching or diagonal lines), (b) insulation zones, (c) acoustic zones, (d) material types in section views, (e) concrete/masonry in structural backgrounds, (f) existing construction to be retained.',
      detection_method: {
        line_frequency_analysis: 'Hatched areas consist of parallel lines at regular spacing and angle. Detect by: greyscale → edge detection → Hough line transform → cluster lines by angle and spacing → identify regions with consistent parallel-line density.',
        texture_classification: 'ML approach: train classifier on hatched vs non-hatched regions. Features: line density, line angle variance, spacing regularity. Deep learning (CNN) achieves better results for complex/overlapping hatching.',
        contour_based: 'Find outer boundary of hatched region using flood-fill or connected-component analysis after line removal. The boundary defines the hatched area for measurement.',
        challenges: 'Hatched areas often overlap with labels, dimensions, and service lines. Multiple hatching patterns may overlap. Scale-dependent — hatching at different scales looks different.'
      },
      measurement_rules: {
        fire_rated_walls: 'm2 (square metre) of fire-rated construction shown by hatching. Cross-reference with fire compartmentation drawing. Count service penetrations through hatched (fire-rated) walls for fire stopping scope.',
        insulation_zones: 'm2 of hatched insulation area. Compare with insulation specification for material type and thickness.',
        section_views: 'Hatching in section views indicates material type. Concrete = diagonal lines. Insulation = zigzag. Earth = dots. Steel = dense diagonal. These are for IDENTIFICATION not measurement — do not measure hatched area in sections as a service quantity.'
      }
    },
    firestopping_penetrations: {
      source_detail: 'Grabber Firestopping Application Guide v4.0 + SMACNA Through-Penetration Firestopping Guide 2nd Ed.',
      key_concepts: {
        f_rating: 'Fire endurance rating based on flame occurrence on unexposed side. 1-4 hours.',
        t_rating: 'Temperature rating — unexposed side temperature must not exceed 325\u00b0F (181\u00b0C) above ambient.',
        ft_rating: 'Combined flame and temperature rating. Required where combustible materials are near the unexposed side.',
        annular_space: 'Gap between penetrating service and wall/floor opening. Max 25mm for services \u226450mm\u00d8, max 37mm for services >50mm\u00d8. Critical for specifying correct firestop system.'
      },
      measurement_for_boq: {
        penetration_count: 'nr (number) per NRM2 WS 31. Count every point where a service crosses a fire-rated wall or floor. Each penetration = 1 nr.',
        classification: 'Classify by: (a) wall or floor, (b) fire rating (30/60/120/240 min), (c) penetration type (single pipe, multiple pipes, single duct, cable bundle, mixed services), (d) service material (metallic, non-metallic, insulated), (e) service size.',
        what_to_count_from_drawing: [
          'Every pipe crossing a hatched (fire-rated) wall = 1 nr firestop',
          'Every duct crossing a hatched wall = 1 nr firestop (or fire damper if ductwork)',
          'Every cable tray/basket crossing = 1 nr firestop',
          'Every conduit crossing = 1 nr firestop',
          'Grouped cables through a single opening = 1 nr firestop (transit)',
          'Mixed services through a single opening = 1 nr composite firestop'
        ],
        common_products: 'UK market: Hilti CFS-S firestop sealant, Hilti CP 653 firestop collar, Promat PROMASEAL, Quelfire QuelStop, Rockwool ROCKFIRE. Each product covers specific tested configurations.'
      },
      detection_on_drawings: {
        fire_rated_walls: 'Identified by: hatching pattern, "FR" or fire rating notation (e.g. "60/60/60"), thick line weight, or colour coding.',
        penetration_points: 'Where a service line crosses a fire-rated wall/floor line. The intersection point = a firestop location.',
        fire_dampers: 'Rectangular symbol at duct-wall intersection. Usually marked "FD" or with specific symbol per CIBSE. Enumerated as nr in WS 38.',
        fire_collars: 'Shown as circle around pipe at wall penetration. For plastic pipes (PVC, CPVC, PE) through fire-rated construction.'
      }
    },
    application_to_contraq_analysis: [
      'When analysing M&E drawings: FIRST identify fire-rated walls/floors by their hatching pattern or notation.',
      'THEN count every service-to-wall intersection as a potential firestop penetration.',
      'Classify each penetration by service type, size, and wall rating.',
      'Output firestop items as separate BoQ section per NRM2 WS 31, with nr unit and full description.',
      'Revision clouds: identify changed areas, flag items within as revision scope, note revision number.',
      'Hatched insulation zones: measure m\u00b2 for fabric insulation, or note zone for service insulation specification.',
      'NEVER confuse hatching in section views (material indication) with hatching in plan views (fire rating or zone indication).'
    ]
  },
  mep_academy_riser_inference: {
    source: 'MEP Academy — Plan, Elevation, Section Views and Details (mepacademy.com). Chapter 3 of How to Read HVAC Blueprints course. Also references Chapters 4-7 (HVAC Mechanical Drawings, Symbols, Scales, Shop Drawings).',
    core_principle: 'Plan views show HORIZONTAL layout only. To determine VERTICAL distances (riser lengths, drop heights, ceiling-void routing), you MUST cross-reference section views, elevation views, detail views, and floor-to-floor heights. Never assume vertical dimensions from plan views alone.',
    view_types: {
      plan_view: {
        what_it_shows: 'Looking straight down at a floor. Shows rooms, doors, windows, columns, grid lines, and all horizontal M&E service runs. Each floor has its own plan drawing (or multiple drawings if the floor is too large for one sheet).',
        what_it_does_NOT_show: 'Vertical dimensions. A plan view cannot tell you how high a duct is mounted, how long a riser pipe is, or the drop from main to branch. It shows WHERE services are located horizontally, not their height.',
        key_elements: ['Column grid lines (A-Z / 1-99) — used to locate the same position across different floors and in section views', 'Room designations and areas (m\u00b2 or SF)', 'Match lines — indicate continuation on another drawing sheet', 'Key plan — mini representation showing which part of the building this sheet covers', 'North arrow — building orientation', 'Drawing scale (bar format or stated ratio)'],
        mep_on_plans: 'Duct runs shown as rectangles (rectangular duct) or circles/lines (circular). Pipe runs shown as lines with size annotations. Equipment shown as symbols. ALL measured horizontally along centreline.'
      },
      section_view: {
        what_it_shows: 'A vertical CUT through the building along a defined cut line. Shows floor-to-floor heights, ceiling heights, structural depth, service routing in the vertical plane, and the relationship between floors.',
        how_to_find: 'Section cut markers on plan view — typically a circle with section number over drawing number, with arrows showing viewing direction. E.g. section marker "C" on plan = Section View C on referenced drawing sheet.',
        critical_for_mep: [
          'RISER LENGTHS: Section views show vertical duct/pipe runs between floors. Measure the centreline length of the riser from connection point to connection point.',
          'FLOOR-TO-FLOOR HEIGHT: The total vertical distance between one floor slab and the next. Typically 3.0m-4.5m for commercial buildings, 2.4m-2.7m for residential. This is the DEFAULT riser length if no section detail exists.',
          'CEILING VOID DEPTH: Space between finished ceiling and floor slab above. Typically 300-600mm. M&E services route through this void. Horizontal duct/pipe runs in the void are NOT visible from the plan below.',
          'SERVICE HEIGHTS: Section views show the Bottom of Duct (BOD), Top of Pipe (TOP), or centreline level of horizontal services. These determine how much vertical drop exists from main to branch.',
          'OFFSETS: Where ductwork or pipework changes level (rises or drops) to navigate beams, other services, or floor level changes. Section views reveal these; plan views do not.'
        ]
      },
      building_section: {
        what_it_shows: 'Full section through the ENTIRE building from roof to foundation. Shows all floors stacked, roof plant, basement, and the complete vertical relationship.',
        critical_for_mep: 'This is the PRIMARY source for determining total riser lengths. A riser running from basement to roof plant can be measured directly from the building section. It also shows floor slab thicknesses (typically 150-300mm) which add to riser lengths through floor penetrations.'
      },
      elevation_view: {
        what_it_shows: 'The OUTSIDE of the building from each orientation (North, South, East, West). Shows building height, floor levels, roof height, exterior equipment locations.',
        mep_relevance: 'Shows: external louvres (fresh air intake, exhaust), roof-mounted equipment, external pipework, flue positions, external cable routes. Useful for measuring external riser lengths and louvre positions.'
      },
      detail_view: {
        what_it_shows: 'Enlarged view of a specific construction area at larger scale (e.g. 1:5 or 1:10 vs 1:50 for plans). Shows assembly details, materials, connections.',
        mep_examples: 'Fire damper installation details, equipment connections (coil trim), hanger/support details, duct seam/joint details, riser bracket details, pipe penetration through slab details. These reveal EXACT dimensions for items that are schematic on plans.',
        critical_rule: 'Detail views often have a DIFFERENT SCALE from the main drawing. Always read the detail\u2019s own scale statement. Do not measure details using the plan scale.'
      }
    },
    vertical_inference_rules: {
      rule1_floor_to_floor: {
        description: 'When no section view exists for a riser, use floor-to-floor height as the default vertical run per floor.',
        typical_heights: {
          commercial_office: '3.6m-4.2m floor-to-floor (UK typical 3.75m)',
          retail: '4.0m-5.0m floor-to-floor (high ceilings for services)',
          residential: '2.7m-3.0m floor-to-floor',
          plant_room: '4.5m-6.0m floor-to-floor (double height)',
          basement: '3.0m-3.6m floor-to-floor',
          hospital: '4.0m-4.5m floor-to-floor (heavy service zones)'
        },
        how_to_find: 'Building section view shows all floor levels with heights annotated. Architectural drawings list finished floor levels (FFL) as levels above datum (e.g. +3.750, +7.500, +11.250). Difference between consecutive FFLs = floor-to-floor height.'
      },
      rule2_slab_thickness: {
        description: 'Add slab thickness to riser lengths for each floor penetration. The riser passes THROUGH the slab, not just floor-to-floor.',
        typical: '150mm for residential, 200-300mm for commercial (post-tensioned or RC flat slab), 350-500mm for transfer slabs.',
        formula: 'Riser length per floor = floor-to-floor height + slab thickness (if measuring from underside of slab to underside of slab above). Usually floor-to-floor already INCLUDES slab, so check the datum convention.'
      },
      rule3_ceiling_void_routing: {
        description: 'Horizontal services in ceiling voids have a vertical component getting from the main riser into the void, then another getting from the void down to the terminal.',
        typical_drops: {
          main_to_branch_duct: '150-450mm drop from main duct to branch takeoff (depending on main and branch sizes)',
          riser_to_horizontal: 'Duct/pipe exits riser, turns 90\u00b0, routes horizontally in ceiling void. The vertical distance from riser centreline to horizontal centreline = typically 300-600mm per elbow.',
          ceiling_to_grille: '100-300mm from bottom of horizontal duct to grille/diffuser face. Includes flexible duct connection.'
        }
      },
      rule4_plan_symbols_for_risers: {
        description: 'On plan views, risers are shown as specific symbols since they are vertical (going through the floor).',
        symbols: [
          'Duct riser UP: rectangle with diagonal line or arrow pointing up, or annotation "R/U" or "\u2191"',
          'Duct riser DOWN: rectangle with diagonal line or arrow pointing down, or annotation "R/D" or "\u2193"',
          'Pipe riser: circle or dot on the pipe line, or annotation showing level change',
          'Riser shaft: enclosed rectangular room on plan, often labelled "Riser" or "Services Riser". All vertical services pass through this shaft.',
          'Cable riser: similar to pipe riser, often in dedicated electrical riser cupboard'
        ],
        what_to_measure: 'The PLAN shows the riser LOCATION (where it is on the floor). The SECTION shows the riser LENGTH (how tall it is). You need BOTH to quantify a riser correctly.'
      },
      rule5_multi_floor_stacking: {
        description: 'To visualise the complete building, mentally stack all floor plans on top of each other. Column grid lines align between floors — use these as reference points.',
        technique: 'Find the riser location on each floor plan (same grid reference). Check if the riser continues through all floors or terminates at a specific level. The section view confirms this.',
        counting: 'A riser from basement to roof = sum of all floor-to-floor heights it passes through. If 4 floors at 3.75m each = 15.0m riser length. Add fittings: 1 elbow at bottom (horizontal connection), 1 elbow at top (horizontal connection), floor penetration sleeves at each level.'
      },
      rule6_offsets_and_transitions: {
        description: 'Ducts/pipes sometimes change level mid-floor (offsets) to navigate beams, other services, or floor level changes. These are only visible in section views.',
        rule: 'If a section view shows an offset, add the vertical offset distance to the horizontal run. For estimating purposes: 2 \u00d7 elbows + vertical offset distance as additional straight duct/pipe.',
        common_locations: 'At structural beams (services drop below then rise back), at floor level changes (split levels), at equipment connections (drop from ceiling level to equipment inlet/outlet height).'
      }
    },
    application_to_contraq_ai: [
      'When analysing a PLAN VIEW PDF: measure all HORIZONTAL runs. Flag riser symbols (R/U, R/D, circles, shaft annotations) as locations requiring VERTICAL measurement from section views.',
      'DEFAULT riser length = floor-to-floor height (3.75m commercial UK default if not stated). Add 2 \u00d7 90\u00b0 elbows per floor for horizontal-to-vertical transitions.',
      'If a SECTION VIEW is also uploaded: read actual riser lengths, service heights, offset distances, and ceiling void depths directly.',
      'If only PLAN VIEWS are available: estimate vertical using floor-to-floor defaults. Flag as "estimated vertical \u2014 section view not provided" with medium confidence.',
      'ALWAYS add vertical drops for: riser-to-horizontal transitions (300-600mm), main-to-branch drops (150-450mm), and ceiling-to-terminal drops (100-300mm). These are often the missing quantities that make takeoffs inaccurate.',
      'For multi-floor buildings: count the number of floors a riser serves, multiply by floor-to-floor height, and add fittings (elbows, tees, fire stopping at each floor penetration).',
      'Detail views at larger scale should be used for EXACT dimensions of connections, hangers, and fire damper installations \u2014 but always check the detail\u2019s own scale, not the plan scale.'
    ]
  },
  mep_academy_riser_tracing: {
    source: 'MEP Academy \u2014 General Layout of Construction Drawings (mepacademy.com). Chapter 1 of How to Read HVAC Blueprints course. Covers drawing set organisation, column line navigation, hidden lines, and riser tracing methodology.',
    drawing_set_organisation: {
      trade_prefixes: {
        G: 'General (cover sheet, index, abbreviations, symbols legend)',
        C: 'Civil (site roads, parking, utilities, grading)',
        L: 'Landscape',
        A: 'Architectural (floor plans, sections, elevations, details, door/window schedules)',
        S: 'Structural (foundations, framing, steel details, equipment pads)',
        M: 'Mechanical (HVAC sheet metal, HVAC piping, controls)',
        E: 'Electrical (power, lighting, fire alarm, data)',
        P: 'Plumbing (domestic water, drainage, sanitary)',
        FP: 'Fire Protection (sprinkler, suppression)'
      },
      significance_for_riser_tracing: 'To trace a riser completely, you may need to cross-reference MULTIPLE trade drawing sets: A-drawings for floor levels and section cuts, S-drawings for slab thicknesses and structural openings, M-drawings for the riser duct/pipe itself, E-drawings for electrical risers, and P-drawings for plumbing risers. All use the SAME column grid.'
    },
    column_line_riser_tracing: {
      core_technique: 'Column lines are the universal coordinate system across ALL drawing sheets and ALL floors. To trace a riser between floors: (1) Find the riser location on Floor 1 plan \u2014 note the column grid intersection (e.g. grid "4" & "N"). (2) Go to Floor 2 plan \u2014 find the same grid intersection "4" & "N". The riser continues at this exact location. (3) Repeat for every floor the riser serves.',
      why_it_works: 'Column lines are structural \u2014 they align with the building columns which run vertically through every floor. The structural grid is the ONE reference that is consistent across architectural, structural, mechanical, electrical, and plumbing drawings. Column lines are shown on every plan view sheet.',
      column_line_format: 'Typically: letters (A, B, C\u2026) in one direction, numbers (1, 2, 3\u2026) in the other. Shown as circles with the identifier at the edge of the drawing. Grid spacing = column centre-to-centre distance (typically 6m-9m in commercial buildings).',
      riser_shaft_identification: 'Riser shafts appear at the SAME column grid location on every floor. They are typically labelled "Services Riser", "M&E Riser", "Duct Riser", or "Pipe Riser" and enclosed by fire-rated construction. The shaft is visible on every floor plan at the same grid reference.'
    },
    hidden_lines_for_routing: {
      what_they_mean: 'Dashed lines on plan views represent services running BELOW or BEHIND the visible elements. On M&E drawings: dashed ductwork = duct routing below the main duct shown. Dashed pipes = pipes below the visible routing level.',
      riser_indication: 'A duct or pipe line that transitions from solid to dashed may indicate a level change \u2014 the service is dropping below the current viewing plane (going to a lower level or into a floor void). This is a visual clue for a vertical component.',
      estimating_implication: 'Dashed lines represent REAL services that must be measured. They are not informational-only. Count them in the takeoff. The dashed-to-solid transition point indicates where a vertical drop or rise occurs.'
    },
    elevation_views_for_riser_length: {
      key_statement: 'Elevation views are used to determine sheet metal riser lengths. \u2014 MEP Academy',
      technique: 'Find the riser on the plan view (location). Find the corresponding elevation or section view (height). The elevation/section shows the vertical extent of the riser from its starting level to its termination level. Measure along the centreline.',
      what_elevation_shows: ['Building height at each face (N/S/E/W)', 'Floor level lines with heights annotated', 'Roof level and parapet height', 'External equipment positions (louvres, intakes, exhausts)', 'External pipework/ductwork risers on building face', 'Ground level and basement depth']
    },
    revision_block_interpretation: {
      location: 'In or near the title block. Shows revision number, date, and description of changes.',
      cloud_correspondence: 'Each revision number corresponds to revision clouds drawn on the plan at the locations where changes were made. Revision A on the block = look for clouds marked "A" on the drawing.',
      for_estimating: 'When pricing from a revised drawing set: read the revision block first to understand WHAT changed. Then locate the corresponding revision clouds on the drawing to see WHERE changes occurred. Only re-measure the clouded areas for the variation.'
    },
    key_plan_and_match_lines: {
      key_plan: 'Mini representation of the building shape showing which portion of the floor is on this particular drawing sheet. The shaded/filled area matches the plan view shown. Essential for multi-sheet floor plans.',
      match_lines: 'Dashed or chain lines on the drawing indicating where one sheet ends and the next begins. Services that cross match lines CONTINUE on the adjacent sheet \u2014 you must measure across both sheets.',
      riser_implication: 'If a riser shaft falls near a match line, it may appear on both adjacent sheets. Verify you are not double-counting risers that appear on two overlapping sheets. Use the column grid to confirm it is the same riser.'
    },
    estimator_riser_anticipation: {
      description: 'When only plan views with rise/drop symbols are available (no section or elevation views), experienced estimators anticipate vertical lengths using these methods:',
      methods: [
        'COLUMN GRID TRACE: Find the riser on each floor plan at the same grid reference. Count the number of floors it appears on. Multiply by floor-to-floor height.',
        'SYMBOL READING: R/U (rise up) = service goes to the floor above. R/D (rise down) = service goes to the floor below. An arrow up on one floor should have a corresponding connection on the floor above.',
        'LEVEL ANNOTATIONS: Some plans annotate service levels as "+3.750 FFL" or "BOD +3.200". The difference between two level annotations = the vertical distance between those points.',
        'SHAFT SIZE: The plan-view size of a riser shaft gives clues about how many and what size services it contains. A large shaft = multiple large risers. A small cupboard = one or two small pipe risers.',
        'SCHEDULE CROSS-CHECK: Equipment schedules list which floor each piece of equipment serves. If an AHU is on the roof and serves all 4 floors, the supply/return duct risers must run the full building height.',
        'SPECIFICATION NOTES: M&E specifications sometimes state "riser from basement to roof level" or "pipework risers through all floors". These confirm riser extent even without section views.',
        'SIMILAR FLOORS: In buildings with typical/repeated floors, the riser connections on one floor apply to all typical floors. Measure one floor\u2019s horizontal connections, then multiply by the number of typical floors.'
      ]
    },
    application_to_contraq_ai: [
      'When multiple floor plan PDFs are uploaded: extract column grid from each. Use grid references to identify risers that appear on multiple floors at the same location.',
      'Count the number of floors each riser appears on. Multiply by floor-to-floor height for total vertical length.',
      'Where services transition from solid to dashed lines: flag as a level change. Add vertical component.',
      'Match lines: trace services across adjacent sheets. Sum horizontal runs from both sheets. Do not double-count risers at match line boundaries.',
      'Key plan: use to understand which part of the building each sheet covers. Combine quantities from all sheets covering the same floor.',
      'If equipment schedules mention floor levels served, use this to confirm riser extent even without section views.',
      'DEFAULT RULE: If a riser symbol appears on a plan and no section view is provided, output the item as "Riser [size] [system] — estimated [N] floors \u00d7 [height]m = [total]m" with medium confidence and a note "verify against section drawing".'
    ]
  },
  rise_drop_symbol_legend: {
    source: 'MDM Construction VA Mechanical-Plumbing Drawing Set (Bldg 52 Addition, Fargo ND, Project 437-316). Sheets P-001, PQ601, PP111-PP113. Valhalla Engineering. Complete plumbing symbol legend, abbreviations, fixture/equipment schedules, and multi-floor domestic water plans with rise/drop annotations.',
    rise_drop_symbols: {
      pipe_up: {
        symbol: 'Filled circle/dot on pipe with "PIPE UP" text or upward arrow. Indicates pipe continues VERTICALLY UPWARD to higher level.',
        takeoff: 'Add vertical pipe = floor-to-floor height (or to annotated level). Add 1\u00d7 90\u00b0 elbow at transition. Add vertical supports.'
      },
      pipe_down: {
        symbol: 'Filled circle/dot on pipe with "PIPE DOWN" text or downward arrow. Indicates pipe continues VERTICALLY DOWNWARD.',
        takeoff: 'Add vertical pipe = floor-to-floor height downward. Add 1\u00d7 90\u00b0 elbow. For gravity drainage: maintain minimum fall.'
      },
      rise_or_drop_in_pipe: {
        symbol: 'Diagonal slash crossing the pipe run. Level change WITHIN same floor (not full riser). Typically 300-900mm offset.',
        takeoff: 'Add vertical offset distance + 2\u00d7 45\u00b0 or 90\u00b0 elbows. This is an OFFSET, not a full floor-to-floor riser.'
      },
      pipe_pitch_direction: {
        symbol: 'Arrow along pipe labelled "DIRECTION OF PIPE PITCH (DOWN)". Shows gravity drainage slope direction.',
        takeoff: 'No extra length (pitch over horizontal distance is negligible). Confirms gravity system: UK 1:40 to 1:80 for soil/waste, 1:200 for storm.'
      },
      flow_direction: {
        symbol: 'Arrowhead on pipe line. Shows flow direction for pressurised and gravity systems.',
        takeoff: 'No quantity impact. Confirms supply vs return identification.'
      }
    },
    real_riser_annotations: {
      description: 'From VA drawing set PP111-PP113, actual keynote riser descriptions across 3 floors:',
      level1: '"Domestic Cold Water UP. Domestic Hot Water UP. Domestic Hot Water Return DOWN." \u2014 3 separate risers at same location, 2 up + 1 down.',
      level2: '"DCW Riser UP/DOWN. DHW UP/DOWN. DHWR UP/DOWN." \u2014 Risers pass THROUGH this floor. "UP/DOWN" = continuous through floor.',
      level2_destination: '"DHW UP TO & DOWN FROM Penthouse." \u2014 Specifies exact destination. Vertical = Level 2 FFL to Penthouse FFL.',
      penthouse: '"DCW Riser UP. DHW UP. DHWR DOWN. Inside Mech Penthouse." \u2014 Confirms termination. "UP" arrives from below; "DOWN" return goes back.',
      penthouse_specific: '"DHW UP FROM & DOWN TO Level 2." \u2014 Confirms riser serves between Level 2 and Penthouse specifically.',
      measured_sizes: '2" DCW, 2" DHW, 2" DHWR (3/4" DHWR branches). Sizes annotated as "2\u00f8 DCW", "2\u00f8 DHW", "2\u00f8 DHWR" on plan views.',
      takeoff_summary: '3 riser systems \u00d7 (Level 1 to Penthouse height) = total riser pipe. Each needs: vertical pipe + 90\u00b0 elbows per floor + fire stopping per floor + supports. Sizes read directly from plan annotations.'
    },
    piping_systems_complete: {
      domestic: { DCW:'Domestic Cold Water', DHW:'Domestic Hot Water', DHWR:'DHW Return', SCW:'Softened Cold Water', FCW:'Filtered Cold Water', DWS:'Drinking Water Supply', DWR:'Drinking Water Return', TWS:'Tempered Water Supply', TWR:'Tempered Water Return' },
      drainage: { SS:'Sanitary Sewer', SD:'Storm Drain', V:'Vent (Sanitary)', GW:'Grease Waste', AV:'Acid Vent', D:'Drain' },
      medical: { MA:'Medical Air', MV:'Medical Vacuum', LA:'Laboratory Air', LV:'Laboratory Vacuum', OA:'Oral Evacuation', IA:'Industrial Air' },
      gases: { NG:'Natural Gas', N2O:'Nitrous Oxide', O2:'Oxygen', N2:'Nitrogen' },
      fuel: { FOS:'Fuel Oil Supply', FOR:'Fuel Oil Return', FOV:'Fuel Oil Vent', FOD:'Fuel Oil Discharge' },
      specialty: { RW:'Reagent Water', RWR:'Reagent Water Return', NO:'Normally Open', NC:'Normally Closed' },
      status: { new_pipe:'Solid line weight per system', existing:'Lighter/different pattern marked (E)', demolished:'Demolition line type marked (X)' }
    },
    valve_symbols_complete: {
      generic:'Diamond/bow-tie (ref spec)', check:'Diamond+arrow', ball:'Circle+line', butterfly:'Circle+V', globe_angle:'Circle+angled line', control:'CV annotation', three_way:'T-branch', pressure_reducing:'PRV', relief:'Arrow-out symbol', auto_air_vent:'AV at high points', manual_air_vent:'MAV', thermostatic_mixing:'TMV at fixtures', pressure_regulating:'PRG'
    },
    fitting_symbols_complete: {
      reducer:'Tapered (concentric or eccentric)', union:'Two opposed cones', top_connection:'T from above (45/90\u00b0)', bottom_connection:'T from below (45/90\u00b0)', side_connection:'T from side', capped_outlet:'T with cap', anchor:'Fixed point', guide:'Sliding support', strainer:'Mesh symbol', clean_out:'CO circle', hose_bib:'HB symbol'
    },
    routing_conventions: {
      OH:'Overhead \u2014 above ceiling. Default for domestic water, storm drainage, vents. Vertical DROPS go down to fixtures.',
      UF:'Under Floor \u2014 below slab. Default for sanitary sewer. Vertical RISERS go up to fixtures.',
      UG:'Underground \u2014 below grade. Marked with UG suffix (e.g. "4\u00f8 DCW UG"). Different installation rate.',
      concealed:'All piping in finished rooms concealed in furred chase or above ceiling.'
    },
    application_to_contraq_ai: [
      'PIPE UP/DOWN symbol: add vertical pipe = floor-to-floor height + 1\u00d7 elbow. Default height if not annotated.',
      'UP/DOWN together on same riser: riser passes THROUGH this floor. Count vertical for floor above AND below.',
      '"UP TO [destination]": use specific destination for exact vertical distance, not default.',
      'Rise/drop slash symbol within floor: add 300-900mm offset + 2 elbows. NOT a full riser.',
      'Multi-system risers (DCW+DHW+DHWR): each is SEPARATE with its own size, length, insulation, fittings.',
      'OH routing = drops down to fixtures. UF routing = rises up to fixtures. Affects vertical direction and qty.',
      'Count isolation valves at each floor takeoff. Count fire stopping at each floor penetration.',
      'Pipe sizes annotated on plan as "N\u00f8 [system]" (e.g. "2\u00f8 DCW"). Read directly for BoQ description.',
      'Equipment schedules (PQ sheets) provide pump duties, water heater specs, fixture connections \u2014 cross-reference for riser sizing verification.'
    ]
  },
  cibse_b2_routing_probabilistic: {
    source: 'CIBSE Guide B2: Ventilation and Ductwork (2016, ISBN 978-1-906846-75-6). Sections 2.4 (Design), 2.6 (Equipment/Connections), Appendix 2.A1 (Recommended Duct Sizes), Appendix 2.A2 (Space Allowances). Cross-referenced with UK MEP coordination practice and cable tray clearance standards.',
    ceiling_void_stacking_order: {
      description: 'In a typical commercial ceiling void (300-600mm depth), multiple M&E services must be stacked vertically. The standard stacking hierarchy from slab soffit downward is:',
      hierarchy: [
        'LAYER 1 (highest, at slab soffit): Drainage pipes — gravity systems MUST be highest to maintain fall. Typically 50-150mm pipe with minimum 1:40 gradient. Fixed to slab with brackets.',
        'LAYER 2: Main ductwork — largest cross-section service, needs most space. SA/EA mains 300-600mm deep. Suspended from slab on threaded rod hangers with 25-50mm clearance above duct.',
        'LAYER 3: Branch ductwork — smaller than mains, routes below or alongside mains. 150-300mm deep typically.',
        'LAYER 4: Pipework (LTHW, ChW, DHW, CWS) — smaller cross-section than ducts. Routed below ductwork on trapeze hangers or clipped to structure. Typically 15-100mm diameter.',
        'LAYER 5: Fire sprinkler pipework — must be below ductwork per fire code. Heads project below ceiling.',
        'LAYER 6: Cable tray/basket/trunking — lowest M&E layer before ceiling. Lightweight, needs access for future cable additions. 50-150mm deep.',
        'LAYER 7 (lowest): Lighting — recessed luminaires sit in the ceiling plane. Allow 100-200mm above ceiling tile for luminaire depth and cabling.',
        'LAYER 8: Ceiling grid/tiles — the finished ceiling level. Typically 15-25mm grid depth.'
      ],
      clearances: {
        duct_to_slab: '25-50mm minimum above duct top to slab soffit (for hanger rod and bracket)',
        between_services: '25-50mm minimum clearance between different services for access and insulation',
        duct_to_pipe: '50mm minimum clearance between duct bottom and pipe top',
        cable_tray_vertical: '150mm between cable tray tiers. 300mm if cables >50mm diameter.',
        cable_tray_to_ceiling: '150mm minimum from top of cable tray to ceiling (access for cable dressing)',
        pipe_insulation_allowance: 'Add insulation thickness to all pipe dimensions: 19-25mm for small bore, 30-50mm for large bore. This INCREASES the effective pipe diameter for stacking calculations.',
        duct_insulation_allowance: 'Add 25-50mm to all duct dimensions for external insulation wrap. Duct with 25mm insulation: actual space = duct height + 50mm (top and bottom).'
      },
      total_void_depth: {
        minimum: '300mm — very tight, single layer of services only (branch ducts + cable tray + lighting). Minimal pipework.',
        typical_office: '450-600mm — standard commercial office. Accommodates main duct + branch ducts + pipework + cable tray + lighting.',
        heavy_services: '600-900mm — laboratories, hospitals, data centres. Multiple duct systems, extensive pipework, heavy cable tray.',
        plant_areas: '900mm+ — areas above/below plant rooms. Multiple large services, access walkways.'
      }
    },
    routing_principles: {
      main_runs_first: 'Route main ductwork and pipework first — these are the largest services and dictate the available space for everything else. Mains typically run along corridors and structural grid lines.',
      branches_perpendicular: 'Branch ducts/pipes typically run perpendicular to mains, from corridor into rooms. Branch takeoffs include a tee or takeoff fitting + a vertical drop/rise + horizontal run to terminal.',
      avoid_crossing: 'Services should avoid crossing each other vertically wherever possible. When crossing is unavoidable, the smaller service typically drops below the larger one (offset).',
      beam_navigation: 'Structural beams create the most common clash point. Services either pass through beam web openings (if pre-coordinated), drop below the beam, or route alongside it. Each option adds vertical distance.',
      access_requirements: 'Maintain access to valves, dampers, fire dampers, clean-outs, and cable tray lids. Minimum 450mm clear access space for maintenance. Access panels in ceiling at each access point.'
    },
    probabilistic_assumptions_for_overlapping: {
      description: 'When plan views show multiple services overlapping (running in the same corridor), the AI cannot see their vertical stacking from the plan. Use these probabilistic assumptions:',
      overlapping_ducts: {
        scenario: 'SA and EA ducts running parallel in same corridor',
        assumption: 'One above the other. Total vertical = SA height + 50mm clearance + EA height. Add offset fittings where one crosses over the other. Probability of crossing: ~1 per 10m of parallel run (at column lines or room entries).'
      },
      duct_over_pipe: {
        scenario: 'Ductwork and pipework shown on same plan route',
        assumption: 'Duct above, pipe below (standard hierarchy). Total vertical occupied = duct height + insulation + 50mm + pipe OD + insulation. Where they cross: pipe drops under duct with 2\u00d7 offset bends.'
      },
      multiple_pipe_systems: {
        scenario: 'LTHW flow, LTHW return, ChW flow, ChW return, DHW, CWS all in same corridor',
        assumption: 'Pipes routed on trapeze hanger at same level (side by side, not stacked). Total width = sum of all pipe ODs + insulation + 50mm gaps. Occasionally stacked in two tiers if corridor is narrow. Add 50-75mm per tier of stacking.'
      },
      cable_tray_under_everything: {
        scenario: 'Cable tray and all mechanical services in same void',
        assumption: 'Cable tray ALWAYS below ducts and pipes. If plan shows cable tray crossing under ductwork, no additional offset needed — it is already at a lower level. Only add offsets if two cable trays cross each other.'
      },
      fire_sprinkler_heads: {
        scenario: 'Sprinkler shown on plan at same location as ductwork',
        assumption: 'Sprinkler mains route below ducts. Heads drop below ceiling. Do NOT add offsets for sprinkler — it is designed to be the lowest pressurised pipe system. But verify clearance from sprinkler head to top of stored contents per fire code.'
      }
    },
    ductwork_space_allowances: {
      source: 'CIBSE Guide B2 Appendix 2.A2',
      rectangular_duct_sizes: {
        description: 'Standard rectangular duct sizes per CIBSE/DW144. Width and height in 50mm increments from 100mm.',
        common_sizes: ['200\u00d7200', '300\u00d7200', '400\u00d7200', '400\u00d7300', '500\u00d7300', '600\u00d7300', '600\u00d7400', '800\u00d7400', '800\u00d7500', '1000\u00d7500', '1000\u00d7600', '1200\u00d7600', '1200\u00d7800', '1400\u00d7800', '1600\u00d7800'],
        aspect_ratio: 'Maximum 4:1 aspect ratio recommended. Greater ratios cause noise and inefficiency.'
      },
      circular_duct_sizes: {
        description: 'Standard spiral duct diameters per DW144.',
        common_sizes: ['100', '125', '150', '160', '200', '250', '300', '315', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1120', '1250'],
        note: 'Spiral duct is self-supporting over shorter spans. Uses less void depth than equivalent rectangular duct (circular cross-section vs flat rectangle).'
      },
      insulation_additions: {
        thermal_duct: '25mm external mineral wool or phenolic foam. Add 50mm total to height and width.',
        acoustic_duct: '50mm acoustic lining internal or 50mm external wrap. Add 100mm total if external.',
        fire_rated_duct: 'Fire-rated wrap (e.g. Promat) adds 25-60mm depending on rating. Can be 100mm+ for 120-min rating.',
        pipe_insulation: 'Per BS 5422 / CIBSE Guide B1. LTHW: 25-40mm. ChW: 25-50mm (with vapour barrier). DHW: 19-25mm. CWS: 19mm (condensation prevention).'
      }
    },
    application_to_contraq_ai: [
      'When services overlap on plan view: apply stacking hierarchy to estimate vertical space. Add clearances between layers.',
      'Crossing services: assume 1 crossing per 10m of parallel run. Each crossing = 2\u00d7 offsets on the smaller service. Offset distance = height of larger service + 50mm clearance.',
      'Insulation: ALWAYS add insulation thickness to pipe and duct dimensions when calculating stacking depth. A "25mm pipe" with 25mm insulation occupies 75mm vertically.',
      'Where plan shows duct and pipe in same corridor: duct is above, pipe is below. Cable tray is below both. This is NOT shown on plan but IS the installed reality.',
      'Ceiling void depth can be estimated from: floor-to-floor height (from building section) minus finished ceiling height (from architectural RCP drawing) minus slab thickness = available void depth.',
      'If calculated void depth is less than total stacking depth of all services shown: flag as a coordination clash risk. Services may need to be offset, relocated, or the ceiling lowered.',
      'For BoQ purposes: probabilistic offsets add approximately 5-10% to horizontal run lengths for offset fittings. Add this as an allowance rather than counting individual offsets from plan views.',
      'Standard duct sizes follow 50mm increments per CIBSE/DW144. If an annotation reads an unusual size (e.g. 375mm), it may be a misread \u2014 check against standard sizes.',
      'Pipe insulation is a SEPARATE BoQ item from the pipe itself per NRM2. Calculate insulation quantities based on pipe length + add 10% for fittings/valves.'
    ]
  },
  mep_academy_spec_reading: {
    source: 'MEP Academy \u2014 How to Read the Specifications (mepacademy.com). Chapter 2 of Introduction to Sheet Metal Estimating course. Covers CSI format, Part 1/2/3 structure, cross-referencing, trade selection, risk identification, and specification review methodology.',
    core_principle: 'Specifications are a CONTRACT DOCUMENT. Everything specified must be priced. The spec defines materials, equipment, and construction methods that may DIFFER from the contractor\u2019s standard approach. An estimator reads specs to identify cost deviations from their normal way of working.',
    specification_structure: {
      part1_general: {
        title: 'Part 1: General',
        contains: [
          'Scope of work description \u2014 what is included in this specification section',
          'Related work (Section 1.2) \u2014 cross-references to other spec sections within your scope AND other trades requiring coordination',
          'Submittals/shop drawing requirements \u2014 what documentation must be provided before installation',
          'Quality assurance \u2014 standards to meet, certifications required, testing protocols',
          'Delivery, storage, handling requirements',
          'Warranty requirements'
        ],
        estimating_impact: 'Part 1 tells you WHAT you are responsible for and what interfaces with other trades. The Related Work section is critical \u2014 it reveals scope boundaries and coordination obligations.'
      },
      part2_products: {
        title: 'Part 2: Products',
        contains: [
          'Equipment/material technical specifications \u2014 performance, ratings, criteria',
          'Manufacturer and model number (basis of design) OR generic description',
          'Acceptable alternatives ("or equal" / "approved equal")',
          'Material grades, gauges, types, pressure classes',
          'Accessories and ancillaries required with main equipment'
        ],
        estimating_impact: 'Part 2 defines WHAT you are buying. If the specified manufacturer/model differs from your standard supplier, the cost may be higher or lower. "Or equal" clauses allow substitution but require approval. Equipment schedules on drawings should match Part 2 specs \u2014 contradictions must be flagged.'
      },
      part3_execution: {
        title: 'Part 3: Execution',
        contains: [
          'Installation methods and quality of construction required',
          'Construction standards to follow (e.g. SMACNA, DW144, BS 5422, CIBSE)',
          'Testing and commissioning requirements (pressure testing, air leakage, balancing)',
          'Start-up and demonstration requirements',
          'Cleaning and protection requirements',
          'Adjusting/calibrating requirements',
          'Manufacturer\u2019s installation instructions compliance'
        ],
        estimating_impact: 'Part 3 defines HOW you build it. If the specified construction standard (e.g. duct pressure class, seam type, hanger spacing) differs from your company standard, adjust labour and material rates accordingly. Testing requirements add time and cost.'
      }
    },
    csi_masterformat: {
      description: 'Construction Specifications Institute (CSI) MasterFormat organises specifications into numbered divisions. The UK equivalent is NBS (National Building Specification) using Uniclass classification. Both serve the same purpose: organising spec sections by trade.',
      key_divisions_for_mep: {
        div_21: 'Fire Suppression (sprinklers, fire extinguishing systems)',
        div_22: 'Plumbing (domestic water, drainage, sanitary, gas)',
        div_23: 'Heating, Ventilating and Air Conditioning (ductwork, pipework, equipment, controls, insulation)',
        div_25: 'Integrated Automation (BMS, controls, DDC)',
        div_26: 'Electrical (power distribution, lighting, fire alarm)',
        div_27: 'Communications (data, voice, AV, security)',
        div_28: 'Electronic Safety and Security (CCTV, access control, intruder detection)'
      },
      uk_nbs_equivalent: {
        description: 'UK projects use NBS specification sections. Common M&E sections:',
        sections: {
          'Y10': 'Pipework \u2014 General',
          'Y11': 'Pipeline ancillaries',
          'Y20-Y25': 'Ductwork \u2014 General, rectangular, circular',
          'Y30': 'Air handling units',
          'Y40-Y41': 'Air conditioning, VRF systems',
          'Y50-Y53': 'Thermal insulation, fire stopping',
          'Y60-Y65': 'Cable containment, power, lighting',
          'Y70-Y74': 'Controls, BMS, BEMS',
          'Y80-Y81': 'Fire detection, security'
        }
      }
    },
    cross_referencing_drawings_vs_spec: {
      rule: 'Drawings show WHERE and HOW MUCH. Specifications show WHAT and HOW. Both are contract documents. When they conflict, the specification generally takes precedence over the drawing (unless the contract states otherwise).',
      common_contradictions: [
        'Drawing shows equipment model X but spec lists model Y as basis of design \u2014 spec governs.',
        'Drawing shows duct size 300mm\u00d8 but spec requires minimum gauge for that size differs from your standard \u2014 spec governs the construction standard.',
        'Drawing shows pipe material as copper but spec section calls for press-fit stainless steel \u2014 spec governs material.',
        'Equipment schedule on drawing has different kW rating than spec \u2014 flag as contradiction, issue RFI (Request for Information).',
        'Spec requires pressure testing at 1.5\u00d7 working pressure but drawing notes say "test to working pressure" \u2014 flag and clarify.'
      ],
      what_to_do: 'When a contradiction is found: (1) Note it on the spec review checklist with both references. (2) Price to the MORE EXPENSIVE interpretation (conservative). (3) Issue an RFI during tender period or include a qualification/exclusion in the bid.'
    },
    trade_specific_selection: {
      description: 'Not every specification section applies to your trade. An M&E subcontractor must identify which sections are within scope. Engineers use templates \u2014 specs may contain sections for systems that DON\u2019T EXIST on this project.',
      method: [
        'Start with the Table of Contents \u2014 identify all sections in your trade division (e.g. Division 23 for HVAC, Division 26 for electrical).',
        'Check Section 1.1 (Scope) of each section \u2014 does this system exist on the drawings?',
        'Check Section 1.2 (Related Work) \u2014 does any related work cross into your scope?',
        'Skip sections for systems not shown on drawings \u2014 but note that you skipped them in your review.',
        'Read Division 1 (General Conditions) thoroughly \u2014 this applies to ALL trades regardless of your specific technical sections.'
      ]
    },
    risk_identification: {
      liquidated_damages: 'Penalty per day for late completion. Typically \u00a3500-\u00a35,000/day for commercial projects. Read carefully \u2014 this is a direct cost risk.',
      project_schedule: 'Duration affects labour cost. Too short = overtime needed. Too long = extended general conditions (site offices, plant hire). Both add cost.',
      bonding: 'Performance and payment bonds. Cost typically <1% for large contractors, >1% for smaller firms. Must be priced into the bid.',
      personnel_requirements: 'Some projects mandate full-time supervisor, safety manager, or QC expert. Each is a direct labour cost addition.',
      testing_commissioning: 'Extent of testing (pressure tests, air leakage per DW143, LTHW flow balancing, BMS proving) directly affects programme duration and cost.',
      submittals: 'Volume of submittals/shop drawings required. Each requires estimator/design time. Complex projects may need 50-200 submittal packages.'
    },
    specification_review_checklist_for_mep: {
      ductwork: [
        'Duct seams and joints allowed (round and rectangular)',
        'Adjustable elbows vs fixed radius on round duct',
        'Material and gauge per duct pressure class or system',
        'Hanger requirements (upper and lower attachments, spacing)',
        'Thermal and acoustical lining requirements',
        'Volume damper types',
        'Remote damper operators above inaccessible ceilings',
        'Duct pressure testing requirements (DW143 Class A/B/C)',
        'Duct-mounted smoke detectors (who provides and installs)',
        'Duct cleanliness requirements (SMACNA cleanliness class)',
        'Temporary HVAC for renovation projects'
      ],
      pipework: [
        'Pipe material and jointing method per system (copper press-fit, steel welded, MLCP, etc.)',
        'Valve types and manufacturers per system',
        'Insulation material, thickness, and finish per pipe system and location',
        'Pressure testing requirements and method',
        'Flushing and chemical cleaning requirements',
        'Labelling and identification (pipe markers, valve tags)',
        'Support/hanger type, material, and maximum spacing'
      ],
      equipment: [
        'Basis of design manufacturer and model number',
        'Approved alternatives ("or equal")',
        'Warranty duration and terms',
        'Commissioning and performance testing requirements',
        'BMS interface requirements (points list, protocol)',
        'Vibration isolation requirements',
        'Access and maintenance clearance requirements'
      ],
      general: [
        'Cost breakouts or unit pricing required in bid submission',
        'Liquidated damages amount and trigger',
        'Bonding requirements',
        'Insurance requirements (PI, PL, EL levels)',
        'CDM (Construction Design & Management) responsibilities',
        'O&M manual requirements',
        'As-built drawing requirements',
        'BREEAM/sustainability requirements'
      ]
    },
    application_to_contraq_ai: [
      'When a specification PDF is uploaded alongside drawings: extract the spec section structure (Part 1/2/3) and identify which sections are relevant to the M&E scope shown on the drawings.',
      'Cross-reference equipment schedules on drawings against Part 2 product specifications. Flag any contradictions in manufacturer, model, rating, or capacity.',
      'Extract construction standards from Part 3 (e.g. "ductwork to DW144 Class B", "pipework to BS EN 10255"). These determine the QUALITY and therefore the COST of installation.',
      'Identify testing requirements (pressure testing, air leakage testing, commissioning) and flag as separate BoQ items per NRM2.',
      'Read General Conditions for liquidated damages, bonding, programme duration \u2014 these are risk/cost items that affect the overall tender price.',
      'Where the spec states "or equal": note the basis of design manufacturer in the BoQ but flag that alternatives may be priced.',
      'If spec contradicts drawing: price to the more expensive interpretation and note the contradiction as a qualification.',
      'Specification sections for systems NOT shown on drawings should be flagged as "spec section exists but no corresponding drawings found \u2014 verify scope with engineer".',
      'NBS section references (Y10, Y20, Y50 etc.) should be mapped to NRM2 work sections (WS 38, 39, 31) for BoQ organisation.'
    ]
  },
  nbs_spec_writing_best_practice: {
    source: 'NBS Best Practice Guide to Specification Writing (v1.0, March 2025). Published by NBS/Hubexo. Author: Dr Stephen Hamil. 50+ years combined NBS + NBS Schumann expertise. Free download. Also: NBS "7 Cs of Specification" and "Five Essential Tips" articles.',
    seven_cs_of_specification: {
      CLEAR: 'Use clear, plain language and short phrases. Avoid ambiguity. Improve understanding for all users, not just lawyers.',
      CONCISE: 'Don\u2019t include information that isn\u2019t required or relevant. Make the specification project-specific. If in doubt, leave it out.',
      CORRECT: 'Clarify requirements, refer to outcomes, reference current BS, EN, or ISO standards wherever possible.',
      COMPLETE: 'Check the depth of information is appropriate. Only address the contractor. Don\u2019t specify differently for sub-contractors or manufacturers.',
      COMPREHENSIVE: 'Ensure all aspects of the project are covered. "Say it once, in the right place." Use cross-references to avoid repetition or conflicts.',
      COORDINATED: 'Specification must be coordinated with drawings, schedules, models and other documentation. Discrepancies lead to errors and disputes.',
      CHANGE_MANAGED: 'It\u2019s not just about incrementing the revision number. Highlight precisely what clauses have changed and what those changes are. Track changes at clause level.'
    },
    specification_types: {
      outline: {
        description: 'High-level description of intent. Used at early project stages (RIBA Stage 2). Captures brief requirements and design ideas.',
        example: '"Ductwork system to provide mechanical ventilation to all occupied spaces."',
        estimating_use: 'Gives scope but not enough detail for accurate pricing. Used for budget estimates only.'
      },
      descriptive_performance: {
        code: 'D',
        description: 'Specifies WHAT the product/system must achieve in terms of performance outcomes — acoustic, thermal, structural, airflow rates — WITHOUT naming specific products or manufacturers.',
        example: '"Supply air ductwork: rectangular galvanised steel, DW144 Class B pressure, maximum air leakage rate 0.027 m\u00b3/s per m\u00b2 at 400 Pa."',
        estimating_use: 'Allows contractor to choose any product meeting the performance criteria. Good for competitive pricing. Requires estimator to select a product and price accordingly.',
        mep_significance: 'UK M&E projects frequently use descriptive specs for ductwork, pipework, and insulation — stating the STANDARD to meet (DW144, BS 5422, BS EN 10255) rather than the specific product.'
      },
      descriptive_plus_performance: {
        code: 'D+',
        description: 'Performance specification with additional guidance — may name a basis-of-design product or reference standard but still allows alternatives meeting the stated performance.',
        example: '"Pipe insulation: closed-cell elastomeric, minimum 19mm wall thickness, thermal conductivity \u22640.036 W/mK at 0\u00b0C. Basis of design: Armacell Armaflex AF or approved equal."',
        estimating_use: 'Price to the named product but note alternatives are acceptable. The "or approved equal" clause is critical for the estimator.'
      },
      prescriptive: {
        code: 'P',
        description: 'Specifies EXACTLY what product/material must be used — names the manufacturer, product range, and model number. No alternatives without formal approval.',
        example: '"Fan coil unit: Carrier 42N, 2-pipe, 3.5kW cooling, 2.1kW heating, 230V/1ph, with integral BMS controls."',
        estimating_use: 'Price exactly as specified. No choice for the estimator. Obtain a specific quote from the named manufacturer/supplier.',
        mep_significance: 'Equipment (AHUs, chillers, boilers, FCUs, pumps) is typically prescriptive. Ductwork and pipework is typically descriptive/performance. Insulation can be either.'
      },
      proprietary: {
        description: 'Includes specific product information — range names, reference codes, key properties selected from manufacturer choices. The most detailed specification level.',
        example: '"Hilti CFS-S ACR firestop sealant, 310ml cartridge, applied minimum 20mm depth to both sides of penetration."',
        estimating_use: 'Exact product and application method specified. Price includes specific product cost + specified application labour.'
      }
    },
    classification_systems: {
      uniclass_2015: {
        description: 'The UK\u2019s unified classification system for the construction industry. Used by NBS Chorus. Indicated in UK annex of BS EN ISO 19650-2.',
        structure: 'Hierarchical codes: e.g. Ss_45_30 = Systems > Ventilation and air conditioning > Low-pressure air ductwork systems.',
        mep_relevance: 'Uniclass codes can appear on drawings, in specifications, and in BIM models. They provide a universal reference for identifying what system/product is being specified.'
      },
      caws: {
        description: 'Common Arrangement of Work Sections. Older UK classification, still widely used. Sections like Y10 (Pipework), Y20 (Ductwork), Y50 (Thermal Insulation).',
        note: 'Many UK M&E specifications still reference CAWS section numbers. NBS Chorus supports both Uniclass and CAWS.'
      },
      nrm_mapping: 'Both Uniclass and CAWS can be mapped to NRM2 work sections for BoQ production. CAWS Y10 \u2192 NRM2 WS 38 (Mechanical pipework). CAWS Y20-Y25 \u2192 NRM2 WS 38 (Mechanical ductwork). CAWS Y60-Y65 \u2192 NRM2 WS 39 (Electrical).'
    },
    design_responsibility: {
      descriptive_tag: 'Use "D" (Descriptive) tag to indicate the specifier has defined performance requirements and the contractor selects products to meet them.',
      prescriptive_tag: 'Use "P" (Prescriptive) tag to indicate the specifier has selected the exact product and the contractor supplies it as specified.',
      contractor_design: 'Where the contractor is responsible for design (e.g. CDP — Contractor Designed Portion), the spec will state performance requirements only and the contractor designs the system to meet them.',
      common_mistake: 'Assuming and specifying in a way that does not reflect the actual level of design responsibility. If a spec says "P" but the contractor hasn\u2019t been given design responsibility, it\u2019s a scope mismatch.',
      mep_typical: 'In UK M&E: Main contractor engages M&E subcontractor. Spec may be "D" for systems (subcontractor selects products) or "P" for specific equipment (engineer has selected). The M&E sub must identify which is which.'
    },
    conflict_resolution: {
      drawing_vs_spec: 'When drawings and specification conflict, the CONTRACT determines precedence. JCT: specification takes precedence unless contract states otherwise. NEC: Works Information (spec+drawings) is read together; ambiguity resolved by Project Manager.',
      within_spec: 'Conflicts between spec sections: the more specific/detailed section takes precedence over the general section. Part 2 (Products) takes precedence over Part 1 (General) for product details.',
      spec_vs_standard: 'If a spec references a British Standard but then states a requirement that differs from the BS, the spec requirement governs (it is more project-specific).',
      estimator_action: 'When a conflict is identified: (1) Note both references. (2) Price to the MORE EXPENSIVE interpretation (conservative). (3) Include a qualification in the tender noting the conflict. (4) Issue an RFI during the tender period if possible.',
      building_safety_act: 'Post-Building Safety Act (2022), tracking spec changes is critical. Every clause change must be documented. The golden thread of information requires full traceability of specification decisions.'
    },
    revision_management: {
      principle: 'Not just incrementing the revision number. Must highlight PRECISELY what clauses have changed and what those changes are.',
      clause_level_tracking: 'Track changes at individual clause level, not just document level. Each changed clause should be marked with revision number and date.',
      for_estimating: 'When a revised specification is issued during tender period: identify EXACTLY which clauses changed. Only re-price the affected items. Do not re-read the entire spec \u2014 focus on the delta.',
      addenda: 'Addenda issued during tender period modify the spec. Each addendum should list the specific clause changes. Price all addenda into the bid.'
    },
    application_to_contraq_ai: [
      'When a specification PDF is uploaded: identify the spec type for each section (D = descriptive/performance, P = prescriptive, D+ = descriptive with basis of design). This determines how much product selection flexibility exists.',
      'Apply the 7 Cs as a quality check: is the spec clear, concise, correct, complete, comprehensive, coordinated, and change-managed? Flag any Cs that appear violated (ambiguous language, conflicting requirements, missing information).',
      'Extract Uniclass or CAWS classification codes from spec sections. Map to NRM2 work sections for BoQ organisation.',
      'For prescriptive specs (P): extract exact manufacturer, model, and specification. Price to that product.',
      'For descriptive specs (D): extract performance requirements. Match against Price Book for products meeting those requirements.',
      'For descriptive+ specs (D+): note the basis of design product. Price to it but flag alternatives.',
      'Check spec revision status against drawing revision status. If spec is at Rev 3 but drawings are Rev 5, flag as potential misalignment.',
      'Cross-reference spec Section 1.2 (Related Work) to identify scope boundaries. Items in Related Work that are NOT in your scope should be excluded. Items that ARE in your scope but referenced elsewhere should be included.',
      'Extract testing/commissioning requirements from Part 3 as separate BoQ line items (NRM2: item per system).',
      'Flag any contradictions between drawings and spec with both references, priced to the more expensive interpretation.'
    ]
  },
  rics_spec_interpretation: {
    source: 'RICS Design and Specification, 1st Edition (GN 110/2013). Guidance note. ISBN 978-1-78321-001-5. Author: Michael Scott MRICS (Tuffin Ferraby Taylor). Building Surveying Professional Group. Covers design process management, specification hierarchy, prescription vs performance, and professional interpretation standards for small-to-medium UK construction projects.',
    document_hierarchy: {
      principle: 'Project documentation forms a hierarchy of authority. The lead consultant must ensure all documents are consistently defined by PURPOSE (intended use), STATUS (level of detail/stage), and CONTENT (standardised terms). Misinterpretation arises when these three characteristics are unclear.',
      purpose_levels: [
        'For discussion \u2014 preliminary design intent, subject to change. NOT for pricing.',
        'For approval \u2014 design concept for client sign-off. May be priced for budget purposes.',
        'For ordering \u2014 sufficient detail for procurement. Equipment can be ordered.',
        'For construction \u2014 definitive. This is the document set the contractor builds from and prices against.',
        'As-built / Record \u2014 post-construction documentation reflecting what was actually installed.'
      ],
      status_labels: [
        'Preliminary \u2014 early-stage, subject to significant change. Low confidence for pricing.',
        'Working \u2014 design in progress, some elements fixed, others evolving.',
        'Detailed \u2014 final design, fully resolved. Highest confidence for pricing.'
      ],
      priority_rules: {
        general_rule: 'More specific/detailed documents take precedence over general/outline documents. A detail drawing at 1:5 scale takes precedence over a plan at 1:50 for the same element.',
        spec_vs_drawing: 'The specification defines QUALITY (materials, standards, methods). The drawing defines QUANTITY (dimensions, locations, amounts). When they address different aspects, both apply. When they conflict on the SAME aspect, the contract determines precedence.',
        jct_precedence: 'Under JCT contracts: the specification generally takes precedence over the drawing for product/quality matters. The drawing takes precedence for dimensional/positional matters.',
        nec_precedence: 'Under NEC contracts: all Works Information (spec + drawings) is read together as a whole. Ambiguity is resolved by the Project Manager\u2019s instruction.',
        within_spec: 'Part 2 (Products) takes precedence over Part 1 (General) for product details. Part 3 (Execution) takes precedence over Part 1 for installation method. More specific clauses override general clauses.',
        addenda: 'Addenda issued during tender period modify the original documents. Later addenda take precedence over earlier addenda. All addenda take precedence over the original documents they modify.',
        revision_precedence: 'Later revisions supersede earlier revisions. The LATEST revision of any document is the one that governs. Revision status must be checked across ALL documents before pricing.'
      }
    },
    prescription_vs_performance: {
      source_section: 'RICS GN 110/2013 Section 7.1',
      prescription: {
        definition: 'Prescriptive specification defines EXACTLY what product/material/method to use. Specifies the means to achieve the outcome.',
        advantages: 'Certainty for contractor. Clear pricing basis. No ambiguity about what to supply.',
        disadvantages: 'Removes contractor innovation. May not achieve best value. Specifier carries full design liability for the prescribed solution.',
        typical_mep: 'Equipment (named AHU, chiller, boiler), specific pipe material (copper Type X to BS EN 1057), named insulation product.'
      },
      performance: {
        definition: 'Performance specification defines WHAT the system/product must achieve without prescribing HOW. Specifies the outcome, not the means.',
        advantages: 'Allows contractor to propose best-value solution. Encourages innovation. Transfers some design liability to contractor.',
        disadvantages: 'Less certainty for pricing. Requires estimator to select a solution. Performance criteria must be unambiguous and measurable.',
        typical_mep: 'Ductwork to DW144 Class B pressure rating (any manufacturer meeting the standard). Insulation to achieve U-value \u22640.035 W/mK (any product meeting this). Pipework to withstand 6 bar test pressure.'
      },
      mixed: 'Most UK M&E projects use MIXED specification: prescriptive for major equipment (named products), performance for distribution systems (ductwork, pipework to standards), and descriptive+ for insulation and fire stopping (basis of design with "or equal").',
      estimator_approach: 'For prescriptive items: price the named product. For performance items: select the most competitive product meeting the criteria and price that. For mixed: follow the spec type indicator (D/P/D+) per NBS best practice.'
    },
    quality_verification: {
      source_section: 'RICS GN 110/2013 Section 7.2',
      nominated_quality: {
        description: 'Where the specification nominates a specific material or product quality, the contractor must supply EXACTLY what is specified. "Or equal" provisions must be formally approved.',
        approval_process: 'Substitutions require: (1) submission of alternative product data, (2) demonstration of equivalence to specified performance, (3) formal written approval from the specifier/engineer. Unapproved substitutions are a contract breach.'
      },
      third_party_certification: {
        description: 'Specifications may require products to hold third-party certification (BSI Kitemark, BBA Certificate, LPCB listing, FM approval). This is a MANDATORY requirement, not aspirational.',
        mep_examples: 'Fire stopping products: must have tested system certification (e.g. Warrington Fire, BRE). Ductwork: DW144 compliance. Pipework: CE marking per CPR. Insulation: BBA certificate or equivalent.',
        estimating_impact: 'Products with third-party certification are typically more expensive than generic equivalents. If the spec requires certification, the estimator MUST price certified products \u2014 do not substitute uncertified alternatives even if they appear to meet the performance spec.'
      },
      warranties_guarantees: {
        description: 'Specification may require manufacturer warranties beyond standard. Extended warranties (e.g. 10-year for insulation, 5-year for equipment) add cost to the supply price.',
        note: 'Warranty requirements should be extracted from the spec and priced as a cost premium on the supply items.'
      }
    },
    change_control_and_revision: {
      principle: 'The lead consultant must establish a change control process. All changes to design and specification must be formally documented, communicated, and their cost impact assessed BEFORE implementation.',
      revision_tracking: 'Every document revision must be tracked with: revision number/letter, date, description of change, author, and approval status. Revision clouds on drawings correspond to revision entries in the revision block.',
      cost_impact: 'Every specification change has a potential cost impact. The estimator must identify changed clauses and re-price only the affected items. Unchanged items retain their original pricing.',
      tender_period_changes: 'Addenda issued during the tender period are the MOST CRITICAL documents to read. They modify the pricing basis AFTER the estimator has already started work. All addenda must be acknowledged and priced into the bid.',
      for_contraq: 'When multiple spec revisions are uploaded: extract the revision history from each. Identify which clauses changed between revisions. Only re-analyse changed clauses. Flag the revision status of each uploaded document.'
    },
    design_liability: {
      prescriptive_liability: 'When the specifier prescribes a specific product/method, the specifier carries the design liability for that choice. If it fails, the specifier (not the contractor) is responsible.',
      performance_liability: 'When the spec states performance requirements only, the contractor who selects the product/method carries liability for meeting the performance criteria.',
      cdp_liability: 'Contractor Designed Portions (CDP): the contractor takes full design liability for the CDP scope. The spec will state "design by contractor" or "contractor to design and install".',
      mep_typical: 'In UK M&E fit-out: the M&E subcontractor typically has LIMITED design liability (install to engineer\u2019s design) UNLESS the contract explicitly states CDP. Check the scope document carefully.',
      estimating_impact: 'Where the M&E sub carries design liability: add design cost (engineering time) and professional indemnity insurance cost to the tender. Where design is by others: price installation only.'
    },
    standardisation_pitfalls: {
      source_section: 'RICS GN 110/2013 Section 4.2',
      common_problems: [
        'Indiscriminate use of irrelevant clauses and whole specification sections (templates not customised)',
        'Subtle revision of clause content, increasing the risk of reader oversight',
        'Inconsistent application of standard terms in supporting documentation',
        'Removal of detailed clauses with over-reliance on general provisions',
        'Obsolete cross-referencing where a document has been subject to excessive revision',
        'Misinterpretation of design principles behind the standard clause'
      ],
      for_estimating: 'These pitfalls mean the estimator cannot trust the spec at face value. Cross-reference spec against drawings. Flag clauses that appear irrelevant to the project (template leftovers). Query ambiguous or contradictory requirements via RFI.'
    },
    application_to_contraq_ai: [
      'Apply the document hierarchy: check PURPOSE (is this "for construction" or just "for discussion"?), STATUS (preliminary vs detailed), and REVISION (is this the latest?). Only price from "for construction" detailed documents.',
      'When spec and drawing conflict: apply contract-type precedence. JCT = spec governs quality, drawing governs quantity. NEC = read together, flag ambiguity. If contract type unknown, price to the more expensive interpretation.',
      'For prescriptive items (P): price the named product exactly. For performance items (D): match against Price Book for compliant products. For CDP items: add design cost.',
      'Extract third-party certification requirements. Products must hold the specified certification \u2014 do not substitute uncertified alternatives.',
      'Extract warranty requirements. Extended warranties add cost premium to supply prices.',
      'When multiple document revisions uploaded: identify the LATEST revision of each document. Flag if different documents are at different revision stages (coordination risk).',
      'Flag clauses that appear to be template leftovers (referencing systems not shown on drawings). Note as "spec clause exists but no corresponding drawing scope \u2014 verify".',
      'For CDP scope: flag as "contractor design liability \u2014 add design cost and PI insurance" in the BoQ.',
      'Addenda take precedence over original documents. Later addenda over earlier addenda. Price all addenda into the bid.'
    ]
  },
  nbs_reference_spec_and_conflict_resolution: {
    source: 'NBS Reference Specification (282 pages, CAWS-structured). Section A90 General Technical Requirements — the definitive precedence clause. Cross-referenced with: Construction Management article "Resolving Variations in Construction Contracts" by Michael Sergeant (Holman Fenwick Willan), covering legal interpretation of conflicting clauses.',
    a90_precedence_clause: {
      exact_hierarchy: [
        '1. Schedules of work (highest priority)',
        '2. Preliminaries',
        '3. Contract drawings',
        '4. Reference specification (lowest priority of technical docs)'
      ],
      additional_rule: 'Specific work sections of the Reference Specification override A90 (General Technical Requirements). More specific always overrides more general.',
      conflict_action: '"Conflict in the documents: Give notice." — When a conflict is found, the contractor must formally notify the Employer\u2019s Representative. Do NOT proceed with the conflicting work until resolution is received.',
      dimensions_rule: '"Do not rely on scaled dimensions." — Figured (written) dimensions always take precedence over scaled measurements from drawings. Services drawings are described as "diagrammatic, except to the extent that figured dimensions are given or calculable."',
      incomplete_docs: '"Where and to the extent that products or work are not fully documented, they are to be: Of a kind and standard appropriate to the nature and character of that part of the Works where they will be used. Suitable for the purposes stated or reasonably to be inferred." — This is the gap-filling principle.'
    },
    nbs_clause_structure: {
      description: 'The NBS Reference Specification demonstrates the standard UK M&E clause structure across 282 pages. Each work section follows the same pattern:',
      sections_relevant_to_mep: {
        P12: 'Fire Stopping Systems — products and execution for firestopping',
        P31: 'Holes, Chases, Covers and Supports for Services — builder\u2019s work interface',
        R10: 'Rainwater Drainage Systems',
        R11: 'Above Ground Foul Drainage Systems',
        R12: 'Below Ground Drainage Systems',
        S90: 'Hot and Cold Water Supply Systems',
        T90: 'Heating Systems',
        U10: 'General Ventilation (ductwork systems)',
        U90: 'General Ventilation (additional)',
        V90: 'Electrical Installation',
        W40: 'Access Control Systems',
        W41: 'Intrusion and Hold-Up Alarm Systems',
        W44: 'CCTV Systems',
        W50: 'Fire Detection and Alarm Systems',
        X90: 'Lift Systems'
      },
      cross_reference_pattern: 'Every section begins with "Cross-reference: General: Read with A90 General technical requirements." This means A90 precedence rules and general quality requirements apply to EVERY M&E section.',
      substitution_rules: {
        products: 'If an alternative product to that specified is proposed, obtain approval BEFORE ordering.',
        work: 'If alternative work to that specified is proposed, obtain approval BEFORE execution.',
        documentation_required: 'Submit: manufacturer and product reference, cost, availability, relevant standards, performance, function, compatibility, proposed revisions to drawings and spec, compatibility with adjacent work, appearance, and warranty/guarantee.',
        key_principle: 'Substitution is NOT automatic even with "or equal" clause. Formal approval process required with full documentation.'
      }
    },
    legal_conflict_resolution: {
      source_detail: 'Michael Sergeant, Holman Fenwick Willan — Construction Contract Variations (published by Informa). Legal analysis of how courts and adjudicators resolve conflicting contract documents.',
      key_principles: {
        priority_clauses_are_not_absolute: 'A priority of documents clause (e.g. "spec over drawings") does NOT mean a higher-priority document trumps EVERYTHING in lower-priority documents. Courts look at the whole contract to see if documents can be construed together.',
        common_intention: 'Courts try to determine what the COMMON INTENTION of the parties was. The contract is read as a whole, not clause by clause in isolation.',
        specificity_principle: 'A document specifically produced for this contract is given MORE weight than pre-printed standard conditions. Handwritten amendments override typed text. Bespoke clauses override template clauses.',
        implicit_requirements: 'Work not explicitly described but IMPLICITLY NECESSARY to achieve the specified scope is deemed included. E.g. a door shown on a drawing implies hinges, even if not separately specified. In M&E: a duct system implies hangers, even if not scheduled.',
        the_grey_zone: '"The dividing line between what is implicitly required and what is an intentional gap in the contractor\u2019s scope can often be unclear." — This is the core commercial dispute area in M&E subcontracting.',
        design_and_build: 'Where a D&B contractor has an obligation to deliver a working system, they may have to correct deficiencies in the scope WITHOUT claiming it as a variation. The extent depends on whether there are performance guarantees or just a "reasonable skill and care" obligation.'
      },
      practical_resolution_methods: [
        'MAJORITY VOTE: Where multiple documents address the same item but disagree, the interpretation supported by the majority of documents usually prevails. If 3 out of 4 documents say "copper pipe" and 1 says "steel", copper is the likely intent.',
        'BEST PRACTICE: Where documents are silent or ambiguous, the interpretation that aligns with recognised industry best practice (CIBSE, BS, SMACNA, DW144) prevails.',
        'MOST SPECIFIC: The most specific, detailed document prevails over general descriptions.',
        'MOST RECENT: Later documents prevail over earlier documents (assuming the later is a deliberate update, not an error).',
        'COMMERCIAL COMMON SENSE: Courts apply commercial common sense. An interpretation that produces an absurd or commercially impractical result is rejected in favour of a sensible one.',
        'GIVE NOTICE: When in doubt, formally notify the client/engineer of the conflict and request clarification. Do NOT assume one interpretation over another without written confirmation.'
      ]
    },
    variation_identification: {
      what_is_a_variation: 'Work that is OUTSIDE the contracted scope. Not what was implicitly required to complete the specified works.',
      what_is_NOT_a_variation: 'Work that is implicitly necessary to achieve the scope, even if not explicitly described. Hangers for ducts, isolation valves for equipment connections, fire stopping at penetrations through fire-rated walls — these are typically deemed included.',
      common_mep_disputes: [
        'Builder\u2019s work holes: Spec says "by M&E sub" but drawing P31 schedule lists holes as "by main contractor" \u2014 conflict on scope boundary.',
        'Insulation to valves/fittings: Spec says "insulate all pipework" but schedule only lists straight pipe sizes. Are valves and fittings included? Usually yes (implicitly required for system performance).',
        'Testing and commissioning: Spec Part 3 requires pressure testing but no separate BoQ item. Is it included in the pipe rates or a separate cost? NRM2 says "item per system" \u2014 it should be separate.',
        'BMS interface: Spec says "provide BMS interface" but controls are a separate contract. Who provides the interface hardware? Usually the controls contractor provides hardware, M&E provides connections.',
        'Access panels: Spec says "provide access to all valves above ceilings" but no access panels in the M&E BoQ. Are they in the M&E scope or the ceiling contractor\u2019s scope? Check P31 and the ceiling spec.'
      ]
    },
    application_to_contraq_ai: [
      'Apply the A90 precedence hierarchy: Schedules > Preliminaries > Contract Drawings > Specification. When conflicts found, flag with both references and note which document takes precedence.',
      'FIGURED DIMENSIONS always override scaled measurements. If an annotation says "5000mm" but the scale suggests 4800mm, use 5000mm.',
      '"Services drawings are diagrammatic" \u2014 do not rely on precise scaled measurement of service routes from M&E plans. Use figured dimensions where available. Where no figures, measure from scale but flag as "scaled measurement \u2014 verify".',
      'Where documents can be construed TOGETHER (not contradictory, just complementary): combine information from all documents. Spec defines quality, drawing defines quantity \u2014 both apply.',
      'Where a genuine conflict exists and cannot be resolved: price to the MORE EXPENSIVE interpretation, flag the conflict, and note "RFI required to resolve conflict between [doc A] and [doc B]".',
      'Implicit requirements: hangers, supports, isolation valves, drain points, air vents, labelling, painting, fire stopping at rated penetrations \u2014 these are typically INCLUDED even if not separately specified. Do not omit them from the BoQ.',
      'For substitutions: note the specified product in the BoQ. If pricing an alternative, include full substitution documentation requirements as a note.',
      'Template leftover detection: if a spec section references a system (e.g. "steam heating") that does not exist on the drawings, flag as "spec section appears to be template content \u2014 not applicable to this project. Verify."',
      'Variation identification: items clearly shown on drawings and described in spec = contracted scope. Items NOT shown on drawings but described in spec = query (is it a scope gap or not applicable?). Items shown on drawings but NOT in spec = measure from drawing, apply A90 gap-filling principle for quality standard.'
    ]
  },
  bsria_mechanical_best_practice: {
    source: 'BSRIA Rules of Thumb: BG 85/2024 Mechanical Criteria + BG 87/2024 Useful Information Guide (superseding BG 9/2011 5th Ed). BSRIA, Bracknell. Industry-standard defaults for UK building services design. Used as "sense-check" benchmarks when specs are silent, contradictory, or incomplete.',
    when_to_use: 'These defaults are applied when: (1) the specification is SILENT on a parameter, (2) the specification CONTRADICTS the drawing, (3) a drawing annotation is ILLEGIBLE or MISSING, (4) a "sense-check" is needed to verify AI-extracted values are plausible. They are NOT used to override clear, explicit specification requirements.',
    ductwork_defaults: {
      low_velocity_system: {
        main_duct_velocity: '3.0-6.0 m/s',
        branch_duct_velocity: '2.5-5.5 m/s',
        max_pressure_drop: '1 Pa/m (rule of thumb for sizing)',
        system_resistance: '400 Pa total (typical low-velocity supply system)',
        pressure_class: 'DW144 Class A (low pressure, \u2264500 Pa)',
        air_leakage: '0.027 \u00d7 p l/s per m\u00b2 of duct surface area (Class A)'
      },
      high_velocity_system: {
        main_duct_velocity: '7.5-15.0 m/s',
        branch_duct_velocity: '6.0-10.0 m/s',
        max_pressure_drop: '8 Pa/m',
        system_resistance: '1.5-2.0 kPa total',
        pressure_class: 'DW144 Class B or C',
        air_leakage: '0.009 \u00d7 p l/s per m\u00b2 (Class B), 0.003 \u00d7 p l/s per m\u00b2 (Class C)'
      },
      recommended_velocities_by_space: {
        domestic_bedrooms: { main: '3.0 m/s', branch: '2.5 m/s' },
        theatres_concert_halls: { main: '4.0 m/s', branch: '2.5 m/s' },
        lecture_halls_cinemas: { main: '4.0 m/s', branch: '3.5 m/s' },
        hotel_bedrooms: { main: '5.0 m/s', branch: '4.5 m/s' },
        private_offices_libraries: { main: '6.0 m/s', branch: '5.5 m/s' },
        general_offices: { main: '7.5 m/s', branch: '6.0 m/s' },
        shops_supermarkets: { main: '9.0 m/s', branch: '7.0 m/s' },
        industrial: { main: '10.0 m/s', branch: '8.0 m/s' }
      },
      fan_power: 'Electrical input \u2248 total fan pressure (kPa) \u00d7 volume flow rate (m\u00b3/s) \u00d7 16',
      air_temperature_rise: '\u22481\u00b0C per kPa of fan pressure (heat gain from fan motor)',
      face_velocities: {
        inlet_louvres: '3-5 m/s through free area',
        ahu_filters: '1.5-2.5 m/s (depending on filter type)',
        heating_cooling_coils: '2.0-3.0 m/s'
      }
    },
    pipework_defaults: {
      hydronic_heating: {
        lthw_flow: '82\u00b0C (modern low-carbon: 70-80\u00b0C)',
        lthw_return: '71\u00b0C (modern: 50-60\u00b0C for condensing boilers)',
        delta_t: '11\u00b0C traditional, 20\u00b0C modern condensing',
        max_velocity: '1.5 m/s (small bore \u226450mm), 3.0 m/s (large bore >50mm)',
        max_pressure_drop: '300-400 Pa/m for small systems, 200 Pa/m preferred',
        expansion: 'Allow 4% volume expansion for LTHW systems'
      },
      chilled_water: {
        chw_flow: '6\u00b0C',
        chw_return: '12\u00b0C',
        delta_t: '6\u00b0C',
        max_velocity: 'Same as heating pipework',
        insulation: 'Vapour-sealed closed-cell insulation mandatory to prevent condensation. Minimum 25mm wall thickness.'
      },
      domestic_water: {
        dhw_storage: '60\u00b0C minimum (Legionella control)',
        dhw_distribution: '55\u00b0C minimum at point of use within 1 minute',
        dhw_return: '50\u00b0C minimum',
        cws_temperature: '20\u00b0C maximum (Legionella prevention)',
        max_velocity: '1.5-2.0 m/s'
      },
      general_pipe_sizing: {
        principle: 'Size for velocity AND pressure drop. The lower limit governs.',
        noise_limit: 'Velocity must not cause noise above NR rating for the space. Lower velocity = quieter.',
        water_hammer: 'Velocity >2.0 m/s in domestic systems increases water hammer risk. Provide arrestors.'
      }
    },
    cooling_heating_loads: {
      cooling_loads_per_m2_gia: {
        offices: '87 W/m\u00b2',
        retail: '140 W/m\u00b2',
        restaurants: '200 W/m\u00b2',
        hotels: '150 W/m\u00b2',
        banks: '160 W/m\u00b2',
        data_centres: '1500 W/m\u00b2 (per net data hall area)',
        residential: '70 W/m\u00b2'
      },
      heating_loads_per_m2_gia: {
        offices: '40-60 W/m\u00b2 (well-insulated modern building)',
        retail: '30-50 W/m\u00b2',
        residential: '50-80 W/m\u00b2',
        warehouse: '20-40 W/m\u00b2',
        hospitals: '60-90 W/m\u00b2'
      },
      ventilation_rates: {
        offices: '10 l/s per person (minimum per Part F)',
        retail: '10 l/s per person',
        restaurants: '10 l/s per person + kitchen extract',
        toilets: '6 l/s per WC/urinal (extract)',
        car_parks: '6 air changes per hour',
        kitchens: '30 air changes per hour (commercial)',
        server_rooms: 'Calculated from heat load, not occupancy'
      }
    },
    space_allowances: {
      plant_room: '4-8% of gross floor area for mechanical plant. Higher for hospitals/labs.',
      riser_shaft: '0.5-1.5% of gross floor area for services risers.',
      ceiling_void: '450-600mm standard commercial. 600-900mm heavy services.',
      floor_void: '100-200mm for underfloor services (raised access floor).',
      service_weight: 'M&E services typically 15-35 kg/m\u00b2 of floor area. Heavier in plant rooms and risers.'
    },
    insulation_defaults: {
      when_spec_is_silent: 'If the specification does not state insulation thickness, apply BS 5422 minimum requirements:',
      lthw_pipes: '25mm for \u226422mm bore, 30mm for 28-54mm, 40mm for 67-108mm, 50mm for \u2265133mm (mineral wool or equivalent k-value)',
      chw_pipes: '25mm closed-cell minimum with vapour barrier. Increase to 32-50mm in humid environments.',
      dhw_pipes: '19mm minimum for energy conservation. BS 5422 Table 2.',
      ductwork: '25mm external mineral wool wrap for thermal. 50mm for acoustic. Fire-rated per fire strategy.',
      condensate_drains: 'No insulation required unless in cold/freezing environments.',
      outdoor_pipework: 'Weather-protected cladding (aluminium or stainless steel) over insulation. Add 25% to insulation thickness for weather protection.'
    },
    sense_check_thresholds: {
      description: 'Use these to validate AI-extracted quantities. If a value falls outside these ranges, flag for manual review:',
      duct_size: 'Supply air duct serving an office floor: typically 600\u00d7400 to 1200\u00d7600 main, 300\u00d7200 to 600\u00d7300 branch. If AI reads >1600mm in any dimension for a standard office, check.',
      pipe_size: 'LTHW main for a commercial floor: typically 40-100mm. If AI reads >150mm for a single floor, check. Branches typically 15-32mm.',
      riser_length: 'Cannot exceed building height. If riser length > (number of floors \u00d7 5m), flag.',
      equipment_capacity: 'AHU for an office floor: typically 2,000-15,000 l/s. Chiller for a commercial building: typically 100-2,000 kW. If values are 10\u00d7 outside these ranges, likely a misread.',
      ventilation_rate: 'Office: 10 l/s per person \u00d7 occupancy density (typically 1 person per 8-12 m\u00b2). If calculated airflow seems >3\u00d7 this, check.',
      insulation_thickness: 'Typical range 19-50mm for pipes, 25-50mm for ducts. If AI reads >100mm on a standard pipe, check (may be reading OD not insulation thickness).'
    },
    application_to_contraq_ai: [
      'When a spec is SILENT on duct velocity or pressure class: apply BSRIA defaults for the building type. Flag as "BSRIA default applied \u2014 spec silent on this parameter".',
      'When an extracted value seems implausible: compare against BSRIA sense-check thresholds. If outside range, flag for manual review.',
      'When pipe/duct sizes are not annotated on drawing: estimate from BSRIA cooling/heating loads \u2192 airflow/water flow rate \u2192 duct/pipe size at recommended velocity. Flag as "estimated from BSRIA rules of thumb".',
      'When insulation thickness is not specified: apply BS 5422 minimum via BSRIA defaults. Note as "BS 5422 minimum applied \u2014 spec does not state thickness".',
      'LTHW temperatures: if spec says "LTHW" but doesn\u2019t state temperatures, default to 82/71\u00b0C traditional or 70/50\u00b0C modern condensing. This affects pipe sizing and insulation requirements.',
      'Ventilation rates: if drawing shows supply/extract but no airflow annotations, estimate from BSRIA rates \u00d7 room area \u00d7 occupancy density. Flag as estimated.',
      'Space allowances: if ceiling void depth is not stated, default to 450-600mm commercial. If plant room area is not shown, allow 4-8% of GFA.',
      'These defaults are for SENSE-CHECKING and GAP-FILLING only. They NEVER override explicit specification or drawing requirements.'
    ]
  }
};

/* ══ Materials & Price Book data ══════════════════════════════ */
var MATERIALS_PRICE_BOOK = [
  {id:'m01',name:'Armaflex AF Insulation Tube 15mm×9mm',unit:'m',qtyPerPack:2,supplierPrice:1.42,category:'Pipe Insulation',supplier:'Armacell UK',updated:'2026-01-15'},
  {id:'m02',name:'Armaflex AF Insulation Tube 22mm×13mm',unit:'m',qtyPerPack:2,supplierPrice:1.98,category:'Pipe Insulation',supplier:'Armacell UK',updated:'2026-01-15'},
  {id:'m03',name:'Armaflex AF Insulation Tube 35mm×13mm',unit:'m',qtyPerPack:2,supplierPrice:2.65,category:'Pipe Insulation',supplier:'Armacell UK',updated:'2026-01-15'},
  {id:'m04',name:'Rockwool Lagging Section 42mm×30mm',unit:'m',qtyPerPack:1,supplierPrice:3.10,category:'Pipe Insulation',supplier:'Rockwool Ltd',updated:'2026-02-01'},
  {id:'m05',name:'Rockwool Lagging Section 89mm×40mm',unit:'m',qtyPerPack:1,supplierPrice:5.40,category:'Pipe Insulation',supplier:'Rockwool Ltd',updated:'2026-02-01'},
  {id:'m06',name:'Foil-Faced Ductwork Wrap 25mm×1.2m',unit:'roll',qtyPerPack:null,supplierPrice:48.50,category:'Ductwork',supplier:'Isover Saint-Gobain',updated:'2026-01-20'},
  {id:'m07',name:'Mineral Wool Duct Board 25mm (1.2×2.4m)',unit:'board',qtyPerPack:null,supplierPrice:22.80,category:'Ductwork',supplier:'Knauf Insulation',updated:'2026-02-10'},
  {id:'m08',name:'Vapour Barrier Tape 75mm',unit:'roll',qtyPerPack:null,supplierPrice:8.90,category:'Adhesives & Tape',supplier:'Scapa UK',updated:'2026-01-05'},
  {id:'m09',name:'Armaflex Adhesive 520 (1L)',unit:'tin',qtyPerPack:null,supplierPrice:14.20,category:'Adhesives & Tape',supplier:'Armacell UK',updated:'2025-12-10'},
  {id:'m10',name:'Foil Tape 50mm Self-Adhesive',unit:'roll',qtyPerPack:null,supplierPrice:4.65,category:'Adhesives & Tape',supplier:'Scapa UK',updated:'2026-01-05'},
  {id:'m11',name:'GRP Pipe Casing 76mm (1m length)',unit:'section',qtyPerPack:null,supplierPrice:12.40,category:'Cladding',supplier:'Knauf Insulation',updated:'2026-02-15'},
  {id:'m12',name:'PVC Cladding Sheet 0.5mm (1×2m)',unit:'sheet',qtyPerPack:null,supplierPrice:18.75,category:'Cladding',supplier:'Rytons Building Products',updated:'2025-11-20'},
  {id:'m13',name:'Stainless Steel Banding 19mm',unit:'roll',qtyPerPack:null,supplierPrice:22.00,category:'Fixings',supplier:'Bandfix UK',updated:'2025-12-15'},
  {id:'m14',name:'Banding Buckles 19mm (Bag×100)',unit:'bag',qtyPerPack:100,supplierPrice:6.80,category:'Fixings',supplier:'Bandfix UK',updated:'2025-12-15'},
  {id:'m15',name:'Insulation Pins (Box×500)',unit:'box',qtyPerPack:500,supplierPrice:9.90,category:'Fixings',supplier:'Fixfast UK',updated:'2026-01-08'},
];
var MATERIALS_DEMO = JSON.parse(JSON.stringify(MATERIALS_PRICE_BOOK));
var PB_UPLOADED_BOOKS = []; /* tracks filenames imported via AI upload */


var ENGINEERS = [
  {id:'e1',name:'Dave Harris',trade:'Insulation Fitter',type:'employed',rate:280,phone:'07700 900001',email:'d.harris@mitchellinsulation.co.uk',active:true,notes:'Has own van. CSCS card held.',
   certs:[
     {name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-03-01'},
     {name:'IPAF Powered Access',body:'PASMA',expiry:'2025-09-15'},
     {name:'Manual Handling',body:'HSE',expiry:'2027-01-20'}
   ]},
  {id:'e2',name:'Mark Pearce',trade:'Project Manager',type:'employed',rate:320,phone:'07700 900002',email:'m.pearce@mitchellinsulation.co.uk',active:true,notes:'SMSTS certified. Can supervise up to 20.',
   certs:[
     {name:'CSCS Manager Card',body:'CITB',expiry:'2025-11-15'},
     {name:'SMSTS',body:'CITB',expiry:'2026-08-01'},
     {name:'First Aid at Work',body:"St John's Ambulance",expiry:'2025-07-30'}
   ]},
  {id:'e3',name:'Tom Bailey',trade:'Insulation Fitter',type:'employed',rate:260,phone:'07700 900003',email:'t.bailey@mitchellinsulation.co.uk',active:true,notes:'',
   certs:[
     {name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-06-20'},
     {name:'Asbestos Awareness',body:'HSE',expiry:'2027-03-10'}
   ]},
  {id:'e4',name:'Chris Webb',trade:'Pipe Insulator',type:'employed',rate:270,phone:'07700 900004',email:'c.webb@mitchellinsulation.co.uk',active:true,notes:'',
   certs:[
     {name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-01-10'},
     {name:'PASMA Working at Height',body:'PASMA',expiry:'2026-09-20'}
   ]},
  {id:'e5',name:'Lee Foster',trade:'Foreman',type:'employed',rate:300,phone:'07700 900005',email:'l.foster@mitchellinsulation.co.uk',active:true,notes:'Banksman qualified.',
   certs:[
     {name:'CSCS Supervisor Card',body:'CITB',expiry:'2025-08-30'},
     {name:'SMSTS',body:'CITB',expiry:'2026-12-15'},
     {name:'First Aid at Work',body:"St John's Ambulance",expiry:'2025-04-22'},
     {name:'Banksman / Slinger',body:'CITB',expiry:'2026-07-01'}
   ]},
  {id:'e6',name:'Ryan Walsh',trade:'Insulation Fitter',type:'lt-sub',rate:310,phone:'07711 000001',email:'ryan.walsh@contractor.co.uk',active:true,notes:'',
   cisStatus:'standard',utr:'5621 84332 01',hmrcVerRef:'V-2025-RW-0441',hmrcVerDate:'2025-04-06',
   certs:[
     {name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2025-12-01'},
     {name:'IPAF Powered Access',body:'IPAF',expiry:'2026-11-08'}
   ]},
  {id:'e7',name:'Paul Garrett',trade:'Ductwork Insulator',type:'lt-sub',rate:295,phone:'07711 000002',email:'paul.garrett@contractor.co.uk',active:true,notes:'',
   cisStatus:'standard',utr:'4498 22101 87',hmrcVerRef:'V-2025-PG-0209',hmrcVerDate:'2025-04-06',
   certs:[
     {name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-04-15'},
     {name:'Ductwork Operations (TICA)',body:'TICA',expiry:'2027-02-28'}
   ]},
  {id:'e8',name:'Steve Nolan',trade:'Pipe Insulator',type:'st-sub',rate:330,phone:'07711 000003',email:'steve.nolan@freelance.co.uk',active:false,notes:'',
   certs:[
     {name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2025-06-01'}
   ]},
];
var SURVEYORS = [
  {id:'sv1',name:'Survey Team Alpha',trade:'Site Survey & Measure',type:'survey',rate:320,active:true,color:'#2dd4bf'},
  {id:'sv2',name:'Survey Team Beta', trade:'Site Survey & Measure',type:'survey',rate:300,active:true,color:'#06b6d4'},
  {id:'sv3',name:'Survey Team Gamma',trade:'Pre-construction Survey',type:'survey',rate:310,active:true,color:'#0891b2'},
];

var SUPPLIERS = [
  {id:'s1',name:'Knauf Insulation',category:'Pipe Insulation',contact:'Ben Richards',email:'ben.r@knauf.com',phone:'01744 693000',account:'KNF-0441',rating:5,status:'active',payTerms:30,spendYTD:48200,spendTotal:187400,website:'knaufinsulation.co.uk',notes:'Preferred supplier for pipe section lagging. Framework pricing agreed 2024.'},
  {id:'s2',name:'Rockwool Ltd',category:'Ductwork Insulation',contact:'Helen Marsh',email:'h.marsh@rockwool.com',phone:'01656 862621',account:'RCK-0092',rating:5,status:'active',payTerms:30,spendYTD:36800,spendTotal:142600,website:'rockwool.com',notes:'Primary ductwork slab supplier. Excellent technical support.'},
  {id:'s3',name:'Armacell UK',category:'Pipe Insulation',contact:'David Lee',email:'d.lee@armacell.com',phone:'01248 363220',account:'ARM-0218',rating:4,status:'active',payTerms:45,spendYTD:18400,spendTotal:74200,website:'armacell.com',notes:'Armaflex supply for cold pipework and refrigerant lines.'},
  {id:'s4',name:'nVent Raychem',category:'Trace Heating',contact:'Jo Smedley',email:'j.smedley@nvent.com',phone:'01209 714000',account:'NVR-0567',rating:5,status:'active',payTerms:30,spendYTD:24800,spendTotal:89300,website:'nvent.com',notes:'Sole supplier for self-regulating heat trace. Technical rep available for design.'},
  {id:'s5',name:'Thermaflex',category:'Pipe Insulation',contact:'Jan Bos',email:'j.bos@thermaflex.com',phone:'+31 180 63 55 00',account:'TFX-0034',rating:4,status:'active',payTerms:45,spendYTD:12200,spendTotal:41800,website:'thermaflex.com',notes:'Flexible pre-insulated pipe supply. Lead time 2–3 weeks ex-NL.'},
  {id:'s6',name:'SIG Distribution',category:'Fixings & Accessories',contact:'Pete Morris',email:'p.morris@sigplc.com',phone:'0114 285 6300',account:'SIG-1204',rating:3,status:'inactive',payTerms:30,spendYTD:0,spendTotal:28900,website:'sigplc.com',notes:'Account on hold pending new credit application.'},
];

var CALENDAR_EVENTS = [
  {id:'ce1',title:'Site visit — Canary Wharf',date:'2026-03-04',time:'07:30',endTime:'12:00',color:'ev-orange',project:'p1',engineers:['e1','e4'],notes:'Plant room B2. Report to J. Clarke site office. Hard hat and boots required.'},
  {id:'ce2',title:'Materials delivery — Euston',date:'2026-03-05',time:'08:00',endTime:'09:30',color:'ev-lime',project:'p3',engineers:['e3'],notes:'Rockwool delivery. Engineer to be on site to sign off and check quantities.'},
  {id:'ce3',title:'Progress meeting — Wembley',date:'2026-03-07',time:'10:00',endTime:'12:00',color:'ev-blue',project:'p2',engineers:['e2'],notes:'Monthly progress review with Balfour Beatty PM Sarah Webb.'},
  {id:'ce4',title:'HVAC inspection — Euston',date:'2026-03-10',time:'07:00',endTime:'16:00',color:'ev-orange',project:'p3',engineers:['e1','e5','e3'],notes:'Full HS2 enabling works inspection. All three engineers on full day.'},
  {id:'ce5',title:'Tender walk — Battersea PS',date:'2026-03-12',time:'14:00',endTime:'16:00',color:'ev-purple',project:'',engineers:['e2'],notes:'Pre-bid site visit for QTE-2025-004. Meet ISG rep at main gate.'},
  {id:'ce6',title:"Tottenham Hale — ductwork Ph.2",date:'2026-03-18',time:'07:30',endTime:'17:00',color:'ev-orange',project:'p5',engineers:['e1','e6'],notes:'Zones E and F. Access via main site entrance on Hale Village.'},
  {id:'ce7',title:'PO sign-off — SIG Distribution',date:'2026-03-21',time:'09:00',endTime:'09:30',color:'ev-purple',project:'',engineers:[],notes:'Sign off on fixings and accessories order. Call Jan Bos if items not ready.'},
  {id:'ce8',title:'Canary Wharf — kick-off',date:'2026-03-25',time:'08:00',endTime:'10:00',color:'ev-blue',project:'p4',engineers:['e2','e4','e5'],notes:'Project start meeting with Mace Group. Client requires formal presentation of method statement.'},
];

/* ──── SITE MEASURES ──────────────────────────────────────── */
var SITE_MEASURES = [
  {id:'ms1',name:'CW-B2 Pipe Survey — Rev 3',type:'pdf',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',engineer:'e2',engineerName:'Mark Pearce',date:'2026-02-28',rev:'Rev 3',sizekb:2840,notes:'Full B2 plant room pipe survey. Includes all riser shafts.',icon:ICON.file},
  {id:'ms2',name:'CW-B2 Isometric Drawing',type:'dwg',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',engineer:'e1',engineerName:'Dave Harris',date:'2026-02-20',rev:'Rev 1',sizekb:1240,notes:'Issued by Aecom. Reference only — not for construction.',icon:ICON.ruler},
  {id:'ms3',name:'Wembley Ductwork Takeoff v2',type:'xls',project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',engineer:'e2',engineerName:'Mark Pearce',date:'2026-01-18',rev:'Rev 2',sizekb:488,notes:'Quantities checked by PM. Approved for procurement.',icon:ICON.chart},
  {id:'ms4',name:'Euston HVAC Lagging Spec',type:'doc',project:'p3',projectName:'Euston Station — HVAC Insulation',engineer:'e2',engineerName:'Mark Pearce',date:'2026-02-10',rev:'Rev 1',sizekb:1120,notes:'Morgan Sindall spec. Read before mobilisation.',icon:ICON.edit},
  {id:'ms5',name:'Euston Platform — Site Photos',type:'img',project:'p3',projectName:'Euston Station — HVAC Insulation',engineer:'e3',engineerName:'Tom Bailey',date:'2026-03-04',rev:'N/A',sizekb:8400,notes:'Pre-start condition survey. 42 photos.',icon:ICON.image},
  {id:'ms6',name:"Tottenham Hale Ductwork Survey",type:'pdf',project:'p5',projectName:"Tottenham Hale — Ductwork & Lagging",engineer:'e1',engineerName:'Dave Harris',date:'2026-03-01',rev:'Rev 1',sizekb:1960,notes:'Zones A–D surveyed. E and F to follow.',icon:ICON.file},
  {id:'ms7',name:"Guy's Hospital — Final Measure",type:'xls',project:'p6',projectName:"Guy's Hospital — Services Refurb",engineer:'e2',engineerName:'Mark Pearce',date:'2026-01-20',rev:'Rev 4',sizekb:632,notes:'Final agreed quantities for account settlement.',icon:ICON.chart},
  {id:'ms8',name:'Canary Wharf — Drawings Pkg',type:'dwg',project:'p4',projectName:'Canary Wharf — Fire Stopping Works',engineer:'e4',engineerName:'Chris Webb',date:'2026-03-05',rev:'Rev 1',sizekb:3200,notes:'Mace Group issued drawings package. 14 sheets.',icon:ICON.ruler},
  {id:'ms9',name:'Battersea Trace Heating Layout',type:'pdf',project:'p7',projectName:'Battersea Regen — Trace Heating',engineer:'e2',engineerName:'Mark Pearce',date:'2026-03-06',rev:'Rev 1',sizekb:780,notes:'ISG trace heating route drawing. Self-regulating circuit layout.',icon:ICON.file},
];

/* ──── ACTIVITY LOG ───────────────────────────────────────── */
var ACTIVITY_LOG = [
  {id:'al1',icon:ICON.money,iconBg:'rgba(163,230,53,.15)',text:'Invoice INV-2026-0005 sent to Skanska UK — £38,900',time:'Today, 09:14',panel:'invoices'},
  {id:'al2',icon:ICON.building,iconBg:'rgba(249,115,22,.15)',text:'Project PRJ-045 created from quote QTE-2026-010 (Battersea Trace Heating)',time:'Today, 08:32',panel:'projects'},
  {id:'al3',icon:ICON.clipboard,iconBg:'rgba(96,165,250,.15)',text:'Quote QTE-2026-012 submitted to Balfour Beatty — £265,000',time:'Yesterday, 16:55',panel:'tenders'},
  {id:'al4',icon:ICON.package,iconBg:'rgba(251,191,36,.15)',text:'PO-INS-002 (Armacell UK) marked as ordered — expected 8 Mar',time:'Yesterday, 14:20',panel:'procurement'},
  {id:'al5',icon:ICON.alert,iconBg:'rgba(248,113,113,.15)',text:'Cert alert: Dave Harris — CSCS Card expires in 2 days',time:'Yesterday, 08:00',panel:'engineers'},
  {id:'al6',icon:ICON.ruler,iconBg:'rgba(249,115,22,.15)',text:"Site measure uploaded: Tottenham Hale Ductwork Survey (Rev 1)",time:'5 Mar, 11:30',panel:'measures'},
  {id:'al7',icon:ICON.receipt,iconBg:'rgba(248,113,113,.15)',text:'Invoice INV-2026-0006 overdue — Vinci Construction £29,200',time:'4 Mar, 09:00',panel:'invoices'},
  {id:'al8',icon:ICON.worker,iconBg:'rgba(163,230,53,.15)',text:'Dave Harris & Ryan Walsh assigned to Canary Wharf site visit (4 Mar)',time:'3 Mar, 14:15',panel:'diary'},
];

/* ──── NOTIFICATIONS ──────────────────────────────────────── */
var NOTIFICATIONS = [
  {id:'n1',icon:ICON.alert,text:'CSCS Card for Dave Harris expires in 2 days',time:'Today',unread:true,panel:'engineers'},
  {id:'n2',icon:ICON.receipt,text:'INV-2026-0006 overdue — Vinci Construction £29,200',time:'Today',unread:true,panel:'invoices'},
  {id:'n3',icon:ICON.receipt,text:'INV-2026-0007 overdue — Balfour Beatty £44,200',time:'Today',unread:true,panel:'invoices'},
  {id:'n4',icon:ICON.calendar,text:'Site visit at Canary Wharf starts tomorrow 07:30',time:'Today',unread:true,panel:'diary'},
  {id:'n5',icon:ICON.clipboard,text:'QTE-2026-005 — Battersea Power Station submission due 28 Mar',time:'Yesterday',unread:false,panel:'tenders'},
  {id:'n6',icon:ICON.package,text:'PO-INS-002 expected delivery today (Armacell UK)',time:'5 Mar',unread:false,panel:'procurement'},
  {id:'n7',icon:ICON.money,text:'Invoice INV-2026-0003 overdue — Morgan Sindall £64,800',time:'22 Feb',unread:false,panel:'invoices'},
];

/* ──── ECO4 / PAS 2030 JOBS ─────────────────────────────── */
var ECO_JOBS = [
  {
    id:'eco1',
    ref:'ECO4-2026-001',
    address:'14 Hawthorn Close, Bedford, MK42 8RR',
    propertyType:'Semi-detached',
    buildYear:'1968',
    measureType:'Cavity Wall Insulation',
    installDate:'2026-02-10',
    installer:'e1',
    installerName:'Dave Harris',
    status:'Lodged',
    lodgementRef:'DCLG-2026-CWI-00441',
    productManufacturer:'Knauf Insulation',
    productName:'Supafil CarbonPlus',
    thicknessMm:100,
    uValueBefore:1.60,
    uValueAfter:0.45,
    nvqLevel:'NVQ Level 2',
    cscsCard:'Gold — Advanced Craft',
    trustMarkReg:'TM-2024-0881',
    assessorName:'Sarah Fielding MRICS',
    assessorQual:'MRICS / Level 3 Domestic Energy Assessor',
    assessorDate:'2026-02-11',
    declaration:true,
    photos:[
      {label:'Pre-installation (external cavity)', type:'pre', simulated:true},
      {label:'During — drill positions marked', type:'during', simulated:true},
      {label:'Post-installation (filled & pointed)', type:'post', simulated:true},
      {label:'Completion report signed', type:'post', simulated:true}
    ],
    notes:'Full cavity fill. Property unoccupied during works. Neighbouring party wall treated with agreement.'
  },
  {
    id:'eco2',
    ref:'ECO4-2026-002',
    address:'7 Birchwood Avenue, Luton, LU3 1QP',
    propertyType:'End-of-terrace',
    buildYear:'1975',
    measureType:'Loft Insulation',
    installDate:'2026-02-24',
    installer:'e4',
    installerName:'Chris Webb',
    status:'Complete',
    lodgementRef:'',
    productManufacturer:'Rockwool Ltd',
    productName:'Rollbatt 35',
    thicknessMm:270,
    uValueBefore:0.40,
    uValueAfter:0.12,
    nvqLevel:'NVQ Level 2',
    cscsCard:'Blue — Skilled Worker',
    trustMarkReg:'TM-2024-1102',
    assessorName:'James Holt',
    assessorQual:'Level 3 Retrofit Assessor (PAS 2035)',
    assessorDate:'2026-02-25',
    declaration:true,
    photos:[
      {label:'Pre-installation (loft void)', type:'pre', simulated:true},
      {label:'During — first layer 100mm', type:'during', simulated:true},
      {label:'Post-installation (270mm total)', type:'post', simulated:true}
    ],
    notes:'Topping up existing 100mm to 270mm. Hatch insulated and draught-proofed. Pipe lagging checked.'
  },
  {
    id:'eco3',
    ref:'ECO4-2026-003',
    address:'22 Maple Street, Bedford, MK40 2TL',
    propertyType:'Detached',
    buildYear:'1952',
    measureType:'Underfloor Insulation',
    installDate:'2026-03-03',
    installer:'e3',
    installerName:'Tom Bailey',
    status:'Draft',
    lodgementRef:'',
    productManufacturer:'Kingspan',
    productName:'Kooltherm K103',
    thicknessMm:100,
    uValueBefore:0.70,
    uValueAfter:0.18,
    nvqLevel:'NVQ Level 3',
    cscsCard:'Gold — Advanced Craft',
    trustMarkReg:'TM-2023-0554',
    assessorName:'',
    assessorQual:'',
    assessorDate:'',
    declaration:false,
    photos:[
      {label:'Pre-installation (suspended floor void)', type:'pre', simulated:true},
      {label:'During — insulation fitted between joists', type:'during', simulated:true}
    ],
    notes:'Suspended timber floor. Insulation fixed between joists with breathable membrane. Access hatch fitted.'
  }
];
var ECO_JOBS_DEMO = JSON.parse(JSON.stringify(ECO_JOBS));

/* ──── STATE ──────────────────────────────────────────────── */
