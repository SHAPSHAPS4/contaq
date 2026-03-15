/* ═══ CONTRAQ — RESET ═══
   resetDemo — full state reset
   Lines 18091-18197 from contraq-v77
═══════════════════════════════════════════ */

function resetDemo() {
  if (!confirm('Reset the demo? This will restore all example data and return to the homepage.')) return;
  // Restore projects with costs
  PROJECTS.length=0;
  [{id:'p1',code:'PRJ-041',name:'Canary Wharf — Pipe Insulation Ph.2',client:'cl-2',clientName:'Aecom Ltd',value:284000,margin:22,status:'active',start:'2025-01-06',end:'2025-06-30',notes:'Phase 2 of CW development.',costs:{labour:99400,materials:80800,subcontract:32400,overhead:8920},billedToDate:123600,lastInvoiceDate:'2026-03-01'},
   {id:'p2',code:'PRJ-038',name:'Wembley Stadium — Ductwork Lagging',client:'cl-1',clientName:'Balfour Beatty',value:194000,margin:18,status:'active',start:'2024-11-01',end:'2025-04-30',notes:'Ductwork slab lagging.',costs:{labour:67900,materials:55400,subcontract:27300,overhead:7280},billedToDate:48500,lastInvoiceDate:'2026-01-15'},
   {id:'p3',code:'PRJ-044',name:'Euston Station — HVAC Insulation',client:'cl-3',clientName:'Morgan Sindall',value:320000,margin:24,status:'active',start:'2025-02-01',end:'2025-09-30',notes:'Full HVAC insulation.',costs:{labour:112000,materials:91200,subcontract:40000,overhead:12800},billedToDate:64800,lastInvoiceDate:'2026-02-20'},
   {id:'p4',code:'PRJ-040',name:'Canary Wharf — Fire Stopping Works',client:'cl-4',clientName:'Mace Group',value:94000,margin:20,status:'pending',start:'2025-03-15',end:'2025-08-31',notes:'High-spec residential.',costs:{labour:54600,materials:44700,subcontract:15600,overhead:6240},billedToDate:0,lastInvoiceDate:''},
   {id:'p5',code:'PRJ-036',name:"Tottenham Hale — Ductwork & Lagging",client:'cl-5',clientName:'Skanska',value:178000,margin:21,status:'active',start:'2024-12-01',end:'2025-07-31',notes:'Ductwork lagging and insulation.',costs:{labour:73500,materials:60900,subcontract:25200,overhead:8400},billedToDate:38900,lastInvoiceDate:'2026-03-05'},
   {id:'p6',code:'PRJ-033',name:"Guy's Hospital — Services Refurb",client:'cl-6',clientName:'Vinci Construction',value:145000,margin:17,status:'completed',start:'2024-08-01',end:'2025-01-31',notes:'Hospital services refurb.',costs:{labour:50750,materials:41325,subcontract:20300,overhead:7975},billedToDate:29200,lastInvoiceDate:'2026-01-31'},
   {id:'p7',code:'PRJ-045',name:'Battersea Regen — Trace Heating',client:'cl-7',clientName:'ISG Ltd',value:92000,margin:26,status:'pending',start:'2025-04-01',end:'2025-08-15',notes:'Trace heating.',costs:{labour:32200,materials:23000,subcontract:9200,overhead:3680},billedToDate:0,lastInvoiceDate:''},
  ].forEach(function(p){PROJECTS.push(p);});
  // Restore invoices
  INVOICES.length=0;
  [{id:'inv-1',ref:'INV-2026-0001',client:'cl-1',clientName:'Balfour Beatty',project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',amount:48500,date:'2026-01-15',due:'2026-02-14',status:'paid',desc:'Payment application 1'},
   {id:'inv-2',ref:'INV-2026-0002',client:'cl-2',clientName:'Aecom Ltd',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',amount:71200,date:'2026-02-01',due:'2026-03-03',status:'paid',desc:'Payment application 2'},
   {id:'inv-3',ref:'INV-2026-0003',client:'cl-3',clientName:'Morgan Sindall',project:'p3',projectName:'Euston Station — HVAC Insulation',amount:64800,date:'2026-02-20',due:'2026-03-22',status:'overdue',desc:'Payment application 1'},
   {id:'inv-4',ref:'INV-2026-0004',client:'cl-2',clientName:'Aecom Ltd',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',amount:52400,date:'2026-03-01',due:'2026-04-01',status:'sent',desc:'Payment application 3'},
   {id:'inv-5',ref:'INV-2026-0005',client:'cl-5',clientName:'Skanska UK',project:'p5',projectName:"Tottenham Hale — Ductwork & Lagging",amount:38900,date:'2026-03-05',due:'2026-04-19',status:'sent',desc:'Payment application 2'},
   {id:'inv-6',ref:'INV-2026-0006',client:'cl-6',clientName:'Vinci Construction',project:'p6',projectName:"Guy's Hospital — Services Refurb",amount:29200,date:'2026-01-31',due:'2026-03-01',status:'overdue',desc:'Final account'},
   {id:'inv-7',ref:'INV-2026-0007',client:'cl-1',clientName:'Balfour Beatty',project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',amount:44200,date:'2026-02-10',due:'2026-03-12',status:'overdue',desc:'Payment application 2'},
   {id:'inv-8',ref:'INV-2026-0008',client:'cl-4',clientName:'Mace Group',project:'p4',projectName:'Canary Wharf — Fire Stopping Works',amount:31500,date:'2026-03-04',due:'2026-04-03',status:'draft',desc:'Mobilisation payment'},
   {id:'inv-9',ref:'INV-2026-0009',client:'cl-3',clientName:'Morgan Sindall',project:'p3',projectName:'Euston Station — HVAC Insulation',amount:58200,date:'2026-03-06',due:'2026-04-05',status:'draft',desc:'Payment application 2'},
  ].forEach(function(i){INVOICES.push(i);});
  // Restore state
  STATE.loggedIn=false; STATE.user=null; STATE.currentPanel='home';
  STATE.calYear=new Date().getFullYear(); STATE.calMonth=new Date().getMonth(); STATE.calSelectedDate=null;
  STATE.plGoalRevenue=1400000; STATE.plGoalMargin=22; STATE.plGoalProfit=308000;
  STATE.invFilterMonth='all'; STATE.invFilterClient='all'; STATE.invFilterProject='all'; STATE.invFilterStatus='all';
  STATE.poCounters={INS:3,DUC:1,TRC:1,ELC:0,PLB:0,MEC:1,FIX:1,OTH:0};
  STATE.viewClientId=null; STATE.viewProjectId=null; STATE.editMeasureId=null; STATE.measuresView='grid';
  // Restore site measures
  SITE_MEASURES.length=0;
  [{id:'ms1',name:'CW-B2 Pipe Survey — Rev 3',type:'pdf',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',engineer:'e2',engineerName:'Mark Pearce',date:'2026-02-28',rev:'Rev 3',sizekb:2840,notes:'Full B2 plant room pipe survey.',icon:'📄'},
   {id:'ms2',name:'CW-B2 Isometric Drawing',type:'dwg',project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',engineer:'e1',engineerName:'Dave Harris',date:'2026-02-20',rev:'Rev 1',sizekb:1240,notes:'Issued by Aecom.',icon:'📐'},
   {id:'ms3',name:'Wembley Ductwork Takeoff v2',type:'xls',project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',engineer:'e2',engineerName:'Mark Pearce',date:'2026-01-18',rev:'Rev 2',sizekb:488,notes:'Quantities approved for procurement.',icon:'📊'},
   {id:'ms4',name:'Euston HVAC Lagging Spec',type:'doc',project:'p3',projectName:'Euston Station — HVAC Insulation',engineer:'e2',engineerName:'Mark Pearce',date:'2026-02-10',rev:'Rev 1',sizekb:1120,notes:'Morgan Sindall spec.',icon:'📝'},
   {id:'ms5',name:'Euston Platform — Site Photos',type:'img',project:'p3',projectName:'Euston Station — HVAC Insulation',engineer:'e3',engineerName:'Tom Bailey',date:'2026-03-04',rev:'N/A',sizekb:8400,notes:'Pre-start condition survey. 42 photos.',icon:'🖼️'},
   {id:'ms6',name:"Tottenham Hale Ductwork Survey",type:'pdf',project:'p5',projectName:"Tottenham Hale — Ductwork & Lagging",engineer:'e1',engineerName:'Dave Harris',date:'2026-03-01',rev:'Rev 1',sizekb:1960,notes:'Zones A–D surveyed.',icon:'📄'},
   {id:'ms7',name:"Guy's Hospital — Final Measure",type:'xls',project:'p6',projectName:"Guy's Hospital — Services Refurb",engineer:'e2',engineerName:'Mark Pearce',date:'2026-01-20',rev:'Rev 4',sizekb:632,notes:'Final agreed quantities.',icon:'📊'},
   {id:'ms8',name:'Canary Wharf — Drawings Pkg',type:'dwg',project:'p4',projectName:'Canary Wharf — Fire Stopping Works',engineer:'e4',engineerName:'Chris Webb',date:'2026-03-05',rev:'Rev 1',sizekb:3200,notes:'Mace Group drawings. 14 sheets.',icon:'📐'},
   {id:'ms9',name:'Battersea Trace Heating Layout',type:'pdf',project:'p7',projectName:'Battersea Regen — Trace Heating',engineer:'e2',engineerName:'Mark Pearce',date:'2026-03-06',rev:'Rev 1',sizekb:780,notes:'ISG trace heating route drawing.',icon:'📄'},
  ].forEach(function(m){SITE_MEASURES.push(m);});
  // Restore activity log
  ACTIVITY_LOG.length=0;
  [{id:'al1',icon:'💰',iconBg:'rgba(163,230,53,.15)',text:'Invoice INV-2026-0005 sent to Skanska UK — £38,900',time:'Today, 09:14',panel:'invoices'},
   {id:'al2',icon:'🏗️',iconBg:'rgba(249,115,22,.15)',text:'Project PRJ-045 created from quote QTE-2026-010',time:'Today, 08:32',panel:'projects'},
   {id:'al3',icon:'📋',iconBg:'rgba(96,165,250,.15)',text:'Quote QTE-2026-012 submitted to Balfour Beatty — £265,000',time:'Yesterday, 16:55',panel:'tenders'},
   {id:'al4',icon:'📦',iconBg:'rgba(251,191,36,.15)',text:'PO-INS-002 (Armacell UK) marked as ordered',time:'Yesterday, 14:20',panel:'procurement'},
   {id:'al5',icon:'⚠️',iconBg:'rgba(248,113,113,.15)',text:'Cert alert: Dave Harris — CSCS Card expires in 2 days',time:'Yesterday, 08:00',panel:'engineers'},
   {id:'al6',icon:'📐',iconBg:'rgba(249,115,22,.15)',text:"Site measure uploaded: Tottenham Hale Ductwork Survey",time:'5 Mar, 11:30',panel:'measures'},
   {id:'al7',icon:'🧾',iconBg:'rgba(248,113,113,.15)',text:'Invoice INV-2026-0006 overdue — Vinci Construction £29,200',time:'4 Mar, 09:00',panel:'invoices'},
   {id:'al8',icon:'👷',iconBg:'rgba(163,230,53,.15)',text:'Dave Harris & Ryan Walsh assigned to Canary Wharf site visit',time:'3 Mar, 14:15',panel:'diary'},
  ].forEach(function(a){ACTIVITY_LOG.push(a);});
  // Restore notifications
  NOTIFICATIONS.length=0;
  [{id:'n1',icon:'⚠️',text:'CSCS Card for Dave Harris expires in 2 days',time:'Today',unread:true,panel:'engineers'},
   {id:'n2',icon:'🧾',text:'INV-2026-0006 overdue — Vinci Construction £29,200',time:'Today',unread:true,panel:'invoices'},
   {id:'n3',icon:'🧾',text:'INV-2026-0007 overdue — Balfour Beatty £44,200',time:'Today',unread:true,panel:'invoices'},
   {id:'n4',icon:'📅',text:'Site visit at Canary Wharf starts tomorrow 07:30',time:'Today',unread:true,panel:'diary'},
   {id:'n5',icon:'📋',text:'QTE-2026-005 — submission due 28 Mar',time:'Yesterday',unread:false,panel:'tenders'},
   {id:'n6',icon:'📦',text:'PO-INS-002 expected delivery today (Armacell UK)',time:'5 Mar',unread:false,panel:'procurement'},
   {id:'n7',icon:'💰',text:'Invoice INV-2026-0003 overdue — Morgan Sindall £64,800',time:'22 Feb',unread:false,panel:'invoices'},
  ].forEach(function(n){NOTIFICATIONS.push(n);});
  // Restore calendar events
  CALENDAR_EVENTS.length=0;
  [{id:'ce1',title:'Site visit — Canary Wharf',date:'2026-03-04',time:'07:30',endTime:'12:00',color:'ev-orange',project:'p1',engineers:['e1','e4'],notes:'Plant room B2.'},
   {id:'ce2',title:'Materials delivery — Euston',date:'2026-03-05',time:'08:00',endTime:'09:30',color:'ev-lime',project:'p3',engineers:['e3'],notes:'Rockwool delivery.'},
   {id:'ce3',title:'Progress meeting — Wembley',date:'2026-03-07',time:'10:00',endTime:'12:00',color:'ev-blue',project:'p2',engineers:['e2'],notes:'Monthly review.'},
   {id:'ce4',title:'HVAC inspection — Euston',date:'2026-03-10',time:'07:00',endTime:'16:00',color:'ev-orange',project:'p3',engineers:['e1','e5','e3'],notes:'Full day.'},
   {id:'ce5',title:'Tender walk — Battersea PS',date:'2026-03-12',time:'14:00',endTime:'16:00',color:'ev-purple',project:'',engineers:['e2'],notes:'Pre-bid visit.'},
   {id:'ce6',title:"Tottenham Hale — ductwork Ph.2",date:'2026-03-18',time:'07:30',endTime:'17:00',color:'ev-orange',project:'p5',engineers:['e1','e6'],notes:'Zones E and F.'},
   {id:'ce7',title:'PO sign-off — SIG Distribution',date:'2026-03-21',time:'09:00',endTime:'09:30',color:'ev-purple',project:'',engineers:[],notes:'Sign off fixings.'},
   {id:'ce8',title:'Canary Wharf — kick-off',date:'2026-03-25',time:'08:00',endTime:'10:00',color:'ev-blue',project:'p4',engineers:['e2','e4','e5'],notes:'Kick-off meeting.'},
  ].forEach(function(e){CALENDAR_EVENTS.push(e);});
  // Restore engineers
  ENGINEERS.length=0;
  [{id:'e1',name:'Dave Harris',trade:'Insulation Fitter',type:'employed',rate:280,phone:'07700 900001',email:'d.harris@mitchellinsulation.co.uk',active:true,notes:'Has own van.',certs:[{name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-03-01'},{name:'IPAF Powered Access',body:'PASMA',expiry:'2025-09-15'},{name:'Manual Handling',body:'HSE',expiry:'2027-01-20'}]},
   {id:'e2',name:'Mark Pearce',trade:'Project Manager',type:'employed',rate:320,phone:'07700 900002',email:'m.pearce@mitchellinsulation.co.uk',active:true,notes:'SMSTS certified.',certs:[{name:'CSCS Manager Card',body:'CITB',expiry:'2025-11-15'},{name:'SMSTS',body:'CITB',expiry:'2026-08-01'},{name:'First Aid at Work',body:"St John's",expiry:'2025-07-30'}]},
   {id:'e3',name:'Tom Bailey',trade:'Insulation Fitter',type:'employed',rate:260,phone:'07700 900003',email:'t.bailey@mitchellinsulation.co.uk',active:true,notes:'',certs:[{name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-06-20'},{name:'Asbestos Awareness',body:'HSE',expiry:'2027-03-10'}]},
   {id:'e4',name:'Chris Webb',trade:'Pipe Insulator',type:'employed',rate:270,phone:'07700 900004',email:'c.webb@mitchellinsulation.co.uk',active:true,notes:'',certs:[{name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-01-10'},{name:'PASMA Working at Height',body:'PASMA',expiry:'2026-09-20'}]},
   {id:'e5',name:'Lee Foster',trade:'Foreman',type:'employed',rate:300,phone:'07700 900005',email:'l.foster@mitchellinsulation.co.uk',active:true,notes:'Banksman qualified.',certs:[{name:'CSCS Supervisor Card',body:'CITB',expiry:'2025-08-30'},{name:'SMSTS',body:'CITB',expiry:'2026-12-15'},{name:'First Aid at Work',body:"St John's",expiry:'2025-04-22'},{name:'Banksman / Slinger',body:'CITB',expiry:'2026-07-01'}]},
   {id:'e6',name:'Ryan Walsh',trade:'Insulation Fitter',type:'lt-sub',rate:310,phone:'07711 000001',email:'ryan.walsh@contractor.co.uk',active:true,notes:'',certs:[{name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2025-12-01'},{name:'IPAF Powered Access',body:'IPAF',expiry:'2026-11-08'}]},
   {id:'e7',name:'Paul Garrett',trade:'Ductwork Insulator',type:'lt-sub',rate:295,phone:'07711 000002',email:'paul.garrett@contractor.co.uk',active:true,notes:'',certs:[{name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2026-04-15'},{name:'Ductwork Ops (TICA)',body:'TICA',expiry:'2027-02-28'}]},
   {id:'e8',name:'Steve Nolan',trade:'Pipe Insulator',type:'st-sub',rate:330,phone:'07711 000003',email:'steve.nolan@freelance.co.uk',active:false,notes:'',certs:[{name:'CSCS Skilled Worker Card',body:'CITB',expiry:'2025-06-01'}]},
  ].forEach(function(e){ENGINEERS.push(e);});
  // Restore suppliers
  SUPPLIERS.length=0;
  [{id:'s1',name:'Knauf Insulation',category:'Pipe Insulation',contact:'Ben Richards',email:'ben.r@knauf.com',phone:'01744 693000',account:'KNF-0441',rating:5,status:'active',payTerms:30,spendYTD:48200,spendTotal:187400,website:'knaufinsulation.co.uk',notes:'Preferred supplier.'},
   {id:'s2',name:'Rockwool Ltd',category:'Ductwork Insulation',contact:'Helen Marsh',email:'h.marsh@rockwool.com',phone:'01656 862621',account:'RCK-0092',rating:5,status:'active',payTerms:30,spendYTD:36800,spendTotal:142600,website:'rockwool.com',notes:'Primary ductwork slab supplier.'},
   {id:'s3',name:'Armacell UK',category:'Pipe Insulation',contact:'David Lee',email:'d.lee@armacell.com',phone:'01248 363220',account:'ARM-0218',rating:4,status:'active',payTerms:45,spendYTD:18400,spendTotal:74200,website:'armacell.com',notes:'Armaflex for cold pipework.'},
   {id:'s4',name:'nVent Raychem',category:'Trace Heating',contact:'Jo Smedley',email:'j.smedley@nvent.com',phone:'01209 714000',account:'NVR-0567',rating:5,status:'active',payTerms:30,spendYTD:24800,spendTotal:89300,website:'nvent.com',notes:'Sole supplier for heat trace.'},
   {id:'s5',name:'Thermaflex',category:'Pipe Insulation',contact:'Jan Bos',email:'j.bos@thermaflex.com',phone:'+31 180 63 55 00',account:'TFX-0034',rating:4,status:'active',payTerms:45,spendYTD:12200,spendTotal:41800,website:'thermaflex.com',notes:'Flexible pre-insulated pipe.'},
   {id:'s6',name:'SIG Distribution',category:'Fixings & Accessories',contact:'Pete Morris',email:'p.morris@sigplc.com',phone:'0114 285 6300',account:'SIG-1204',rating:3,status:'inactive',payTerms:30,spendYTD:0,spendTotal:28900,website:'sigplc.com',notes:'Account on hold.'},
  ].forEach(function(s){SUPPLIERS.push(s);});
  nav('home');
  showToast('Demo reset. Welcome back!','success');
}

/* ══════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   HERO DEMO BG — animated platform cycling (v13)
══════════════════════════════════════════════════════════════ */
