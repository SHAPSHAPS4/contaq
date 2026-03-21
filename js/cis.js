/* ═══ CONTRAQ — CIS ═══
   CIS_PAYMENTS, CIS calculations, CIS returns, CIS countdown, CIS sub mode
   Lines 18633-19085 from contraq-v77
═══════════════════════════════════════════ */

var CIS_PAYMENTS = [
  /* Tax month: 6 Feb – 5 Mar 2026 */
  {id:'cp1',subId:'e6',subName:'Ryan Walsh',utr:'5621 84332 01',cisStatus:'standard',
   project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',
   invoiceRef:'SINV-2026-RW-003',date:'2026-02-18',
   grossLabour:6200,cisRate:0.20,taxMonth:'2026-02'},
  {id:'cp2',subId:'e7',subName:'Paul Garrett',utr:'4498 22101 87',cisStatus:'standard',
   project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',
   invoiceRef:'SINV-2026-PG-002',date:'2026-02-24',
   grossLabour:5800,cisRate:0.20,taxMonth:'2026-02'},
  /* Tax month: 6 Jan – 5 Feb 2026 */
  {id:'cp3',subId:'e6',subName:'Ryan Walsh',utr:'5621 84332 01',cisStatus:'standard',
   project:'p1',projectName:'Canary Wharf — Pipe Insulation Ph.2',
   invoiceRef:'SINV-2026-RW-002',date:'2026-01-22',
   grossLabour:5400,cisRate:0.20,taxMonth:'2026-01'},
  {id:'cp4',subId:'e7',subName:'Paul Garrett',utr:'4498 22101 87',cisStatus:'standard',
   project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',
   invoiceRef:'SINV-2026-PG-001',date:'2026-01-29',
   grossLabour:4950,cisRate:0.20,taxMonth:'2026-01'},
  /* Tax month: 6 Dec – 5 Jan 2026 */
  {id:'cp5',subId:'e6',subName:'Ryan Walsh',utr:'5621 84332 01',cisStatus:'standard',
   project:'p5',projectName:"Tottenham Hale — Ductwork & Lagging",
   invoiceRef:'SINV-2025-RW-011',date:'2025-12-15',
   grossLabour:7100,cisRate:0.20,taxMonth:'2025-12'},
  {id:'cp6',subId:'e7',subName:'Paul Garrett',utr:'4498 22101 87',cisStatus:'standard',
   project:'p2',projectName:'Wembley Stadium — Ductwork Lagging',
   invoiceRef:'SINV-2025-PG-010',date:'2025-12-20',
   grossLabour:6600,cisRate:0.20,taxMonth:'2025-12'},
  /* Tax month: 6 Nov – 5 Dec 2025 */
  {id:'cp7',subId:'e6',subName:'Ryan Walsh',utr:'5621 84332 01',cisStatus:'standard',
   project:'p3',projectName:'Euston Station — HVAC Insulation',
   invoiceRef:'SINV-2025-RW-010',date:'2025-11-18',
   grossLabour:4800,cisRate:0.20,taxMonth:'2025-11'},
  {id:'cp8',subId:'e7',subName:'Paul Garrett',utr:'4498 22101 87',cisStatus:'standard',
   project:'p3',projectName:'Euston Station — HVAC Insulation',
   invoiceRef:'SINV-2025-PG-009',date:'2025-11-25',
   grossLabour:5200,cisRate:0.20,taxMonth:'2025-11'},
];

/* ── CIS helper: days to next 19th ──────────────────────────── */
function cisDaysToDeadline() {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth(); // 0-indexed
  // deadline is 19th of current month; if past, next month
  var deadline = new Date(y, m, 19);
  if (now > deadline) deadline = new Date(y, m + 1, 19);
  return Math.ceil((deadline - now) / (1000*60*60*24));
}

function cisTaxMonthLabel(ym) {
  // ym = 'YYYY-MM' → tax month label e.g. '6 Feb 2026 – 5 Mar 2026'
  var parts = ym.split('-');
  var y = parseInt(parts[0]); var m = parseInt(parts[1]) - 1;
  var start = new Date(y, m, 6);
  var end = new Date(y, m + 1, 5);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return '6 ' + months[start.getMonth()] + ' ' + start.getFullYear()
    + ' – 5 ' + months[end.getMonth()] + ' ' + end.getFullYear();
}

function cisFilingDeadline(ym) {
  // Due date: 19th of month FOLLOWING tax month end
  var parts = ym.split('-');
  var y = parseInt(parts[0]); var m = parseInt(parts[1]); // 1-indexed
  // tax month ends 5th of (m+1); filing due 19th of (m+1)
  var dueM = m; // same as next month after start
  var dueY = y;
  if (dueM > 12) { dueM -= 12; dueY++; }
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return '19 ' + months[dueM - 1] + ' ' + dueY;
}

function cisMonthStatus(ym) {
  // Compare filing deadline to today
  var parts = ym.split('-');
  var y = parseInt(parts[0]); var m = parseInt(parts[1]);
  var deadline = new Date(y, m, 19); // 19th of month following
  var now = new Date();
  // Hard-code months older than Nov 2025 as filed for demo
  var ymInt = y * 100 + m;
  if (ymInt <= 202511) return 'filed';
  if (now > deadline) return 'overdue';
  return 'due';
}

/* ── CIS countdown dashboard widget ────────────────────────── */
function buildCISCountdownWidget() {
  var days = cisDaysToDeadline();
  var urgent = days <= 5;
  var color = days <= 3 ? 'var(--red)' : days <= 7 ? 'var(--yellow)' : 'var(--orange)';
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var returnMonth = months[now.getMonth()] + ' ' + now.getFullYear();
  // Total CIS owed this month (current tax month)
  var currentTM = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  var thisMonthPmts = CIS_PAYMENTS.filter(function(p){ return p.taxMonth === currentTM; });
  // Use Feb 2026 data for demo since that's most recent
  var demoTM = '2026-02';
  var demoPmts = CIS_PAYMENTS.filter(function(p){ return p.taxMonth === demoTM; });
  var totalDed = demoPmts.reduce(function(s,p){ return s + p.grossLabour * p.cisRate; }, 0);
  var html = '<div class="cis-alert-widget" style="cursor:pointer" onclick="dashNav(\'cis\')">';
  html += '<div class="cis-alert-icon">' + ICON.courthouse + '</div>';
  html += '<div class="cis-alert-body">';
  html += '<div class="cis-alert-title">CIS Monthly Return</div>';
  html += '<div class="cis-alert-main">CIS return due in <strong style="color:'+color+'">'+days+' day'+(days!==1?'s':'')+'</strong></div>';
  html += '<div class="cis-alert-sub">HMRC CIS300 deadline: 19th of month · Feb 2026 deductions: <strong style="color:var(--orange);">£'+fmtNum(Math.round(totalDed))+'</strong> · 2 subcontractors</div>';
  html += '</div>';
  html += '<div>';
  html += '<div class="cis-countdown" style="color:'+color+'">'+days+'</div>';
  html += '<div class="cis-countdown-label">days left</div>';
  html += '</div>';
  html += '</div>';
  return html;
}

/* ── CIS Returns Panel ──────────────────────────────────────── */
function renderCISReturns() {
  // Group payments by tax month
  var byMonth = {};
  CIS_PAYMENTS.forEach(function(p) {
    if (!byMonth[p.taxMonth]) byMonth[p.taxMonth] = [];
    byMonth[p.taxMonth].push(p);
  });
  var sortedMonths = Object.keys(byMonth).sort(function(a,b){ return b > a ? 1 : -1; });

  var totalGross = CIS_PAYMENTS.reduce(function(s,p){ return s+p.grossLabour; }, 0);
  var totalDed   = CIS_PAYMENTS.reduce(function(s,p){ return s+p.grossLabour*p.cisRate; }, 0);
  var totalNet   = totalGross - totalDed;
  var subCount   = [...new Set(CIS_PAYMENTS.map(function(p){return p.subId;}))].length;

  var html = '';

  // HMRC compliance banner
  html += '<div class="cis-hmrc-banner"><span>✅</span> All subcontractors verified with HMRC · Contractor UTR: <strong style="font-family:var(--mono);">6732 00441 22</strong> · Accounts Office Ref: <strong style="font-family:var(--mono);">123PA00456789</strong></div>';

  // KPI row
  html += '<div class="kpi-grid" style="margin-bottom:1.2rem;">';
  html += '<div class="cis-return-kpi"><div class="cis-return-kpi-label">Total Gross Paid</div><div class="cis-return-kpi-val" style="color:var(--white);">£'+fmtNum(Math.round(totalGross))+'</div><div class="cis-return-kpi-sub">YTD to subcontractors</div></div>';
  html += '<div class="cis-return-kpi"><div class="cis-return-kpi-label">Total CIS Deducted</div><div class="cis-return-kpi-val" style="color:var(--red);">£'+fmtNum(Math.round(totalDed))+'</div><div class="cis-return-kpi-sub">Held for HMRC</div></div>';
  html += '<div class="cis-return-kpi"><div class="cis-return-kpi-label">Total Net Paid</div><div class="cis-return-kpi-val" style="color:var(--lime);">£'+fmtNum(Math.round(totalNet))+'</div><div class="cis-return-kpi-sub">After deductions</div></div>';
  html += '<div class="cis-return-kpi"><div class="cis-return-kpi-label">Subcontractors</div><div class="cis-return-kpi-val" style="color:var(--orange);">'+subCount+'</div><div class="cis-return-kpi-sub">HMRC verified · CIS registered</div></div>';
  html += '</div>';

  // Month cards
  sortedMonths.forEach(function(ym) {
    var pmts = byMonth[ym];
    var mGross = pmts.reduce(function(s,p){ return s+p.grossLabour; }, 0);
    var mDed   = pmts.reduce(function(s,p){ return s+p.grossLabour*p.cisRate; }, 0);
    var mNet   = mGross - mDed;
    var status = cisMonthStatus(ym);
    var statusLabel = status === 'filed' ? 'Filed' : status === 'due' ? 'Due' : 'Overdue';
    var deadline = cisFilingDeadline(ym);
    var label = cisTaxMonthLabel(ym);

    html += '<div class="cis-month-card">';
    html += '<div class="cis-month-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\'">';
    html += '<div>';
    html += '<div class="cis-month-title">'+label+'</div>';
    html += '<div class="cis-month-summary">';
    html += '<span>Gross: <strong style="color:var(--white);font-family:var(--mono);">£'+fmtNum(Math.round(mGross))+'</strong></span>';
    html += '<span>CIS: <strong style="color:var(--red);font-family:var(--mono);">£'+fmtNum(Math.round(mDed))+'</strong></span>';
    html += '<span>Net: <strong style="color:var(--lime);font-family:var(--mono);">£'+fmtNum(Math.round(mNet))+'</strong></span>';
    html += '<span style="color:var(--off4);">Due: '+deadline+'</span>';
    html += '</div></div>';
    html += '<div style="display:flex;align-items:center;gap:.6rem;">';
    html += '<span class="cis-month-badge '+status+'">'+statusLabel+'</span>';
    html += '<button class="btn btn-dark btn-xs" onclick="event.stopPropagation();exportCISReturnCSV(\'' + ym + '\')">Export CSV</button>';
    html += '</div>';
    html += '</div>';

    // Subcontractor breakdown table (collapsed by default for older months)
    var defaultOpen = (ym >= '2026-01');
    html += '<div style="display:'+(defaultOpen?'block':'none')+'">';
    html += '<div style="overflow-x:auto;padding:.2rem 0 .5rem;">';
    html += '<table class="cis-sub-table">';
    html += '<thead><tr>';
    html += '<th>Subcontractor</th><th>UTR</th><th>Invoice Ref</th><th>Date</th><th>CIS Rate</th><th>Gross (£)</th><th>CIS Deducted (£)</th><th>Net Paid (£)</th>';
    html += '</tr></thead><tbody>';

    pmts.forEach(function(p) {
      var ded = p.grossLabour * p.cisRate;
      var net = p.grossLabour - ded;
      html += '<tr>';
      html += '<td><div class="cis-sub-name">'+p.subName+'</div><div class="cis-sub-utr" style="color:var(--off4);">'+p.projectName+'</div></td>';
      html += '<td><span class="cis-sub-utr">'+p.utr+'</span></td>';
      html += '<td><span style="font-family:var(--mono);font-size:.72rem;">'+p.invoiceRef+'</span></td>';
      html += '<td style="white-space:nowrap;">'+fmtDate(p.date)+'</td>';
      html += '<td><span class="cis-status-badge cis-standard" style="font-size:.54rem;">'+(p.cisRate*100)+'%</span></td>';
      html += '<td style="font-weight:600;">'+fmtNum(p.grossLabour)+'</td>';
      html += '<td class="cis-deduction-amt">'+fmtNum(Math.round(ded))+'</td>';
      html += '<td class="cis-net-amt">'+fmtNum(Math.round(net))+'</td>';
      html += '</tr>';
    });

    // Totals row
    html += '<tr style="background:var(--bg4);font-weight:700;">';
    html += '<td colspan="5" style="font-family:var(--mono);font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--off3);">Month totals</td>';
    html += '<td style="color:var(--white);font-family:var(--mono);">'+fmtNum(Math.round(mGross))+'</td>';
    html += '<td style="color:var(--red);font-family:var(--mono);">'+fmtNum(Math.round(mDed))+'</td>';
    html += '<td style="color:var(--lime);font-family:var(--mono);">'+fmtNum(Math.round(mNet))+'</td>';
    html += '</tr>';

    html += '</tbody></table></div>';

    // CIS300-style summary block
    html += '<div style="padding:.75rem 1rem 1rem;">';
    html += '<div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;letter-spacing:.1em;color:var(--off4);margin-bottom:.55rem;">HMRC CIS300 Monthly Return Summary</div>';
    html += '<div style="overflow-x:auto;">';
    html += '<table class="cis300-table">';
    html += '<thead><tr>';
    html += '<th>Subcontractor name</th><th>UTR</th><th>Verification No.</th><th>Gross paid (£)</th><th>Materials deducted (£)</th><th>CIS deducted (£)</th>';
    html += '</tr></thead><tbody>';

    // Group by subcontractor for CIS300
    var bySubCIS = {};
    pmts.forEach(function(p) {
      if (!bySubCIS[p.subId]) bySubCIS[p.subId] = {name:p.subName, utr:p.utr, gross:0, ded:0};
      bySubCIS[p.subId].gross += p.grossLabour;
      bySubCIS[p.subId].ded  += p.grossLabour * p.cisRate;
    });
    var subs = ENGINEERS || [];
    Object.keys(bySubCIS).forEach(function(sid) {
      var s = bySubCIS[sid];
      var eng = subs.find(function(e){ return e.id === sid; });
      var verRef = eng ? (eng.hmrcVerRef||'—') : '—';
      html += '<tr>';
      html += '<td style="font-weight:600;color:var(--white);">'+s.name+'</td>';
      html += '<td><span style="font-family:var(--mono);font-size:.72rem;">'+s.utr+'</span></td>';
      html += '<td><span style="font-family:var(--mono);font-size:.68rem;color:var(--off3);">'+verRef+'</span></td>';
      html += '<td>'+fmtNum(Math.round(s.gross))+'</td>';
      html += '<td style="color:var(--off4);">0.00</td>';
      html += '<td style="color:var(--red);font-weight:700;">'+fmtNum(Math.round(s.ded))+'</td>';
      html += '</tr>';
    });
    // CIS300 Grand total row
    html += '<tr>';
    html += '<td colspan="3">Grand total</td>';
    html += '<td>'+fmtNum(Math.round(mGross))+'</td>';
    html += '<td style="color:var(--off4);">0.00</td>';
    html += '<td style="color:var(--red);font-weight:700;">'+fmtNum(Math.round(mDed))+'</td>';
    html += '</tr>';
    html += '</tbody></table></div>';
    html += '</div>';

    html += '</div>'; // end collapse panel
    html += '</div>'; // end month card
  });

  var content = document.getElementById('dash-content');
  if (content) content.innerHTML = html;
}

/* ── Export CIS Return CSV ──────────────────────────────────── */
function exportCISReturnCSV(taxMonth) {
  var pmts = taxMonth
    ? CIS_PAYMENTS.filter(function(p){ return p.taxMonth === taxMonth; })
    : CIS_PAYMENTS;

  var rows = [
    ['Mitchell Insulation Ltd — CIS Monthly Return'],
    ['Contractor UTR: 6732 00441 22  |  Accounts Office Ref: 123PA00456789'],
    [''],
    ['Tax Month','Subcontractor','UTR','HMRC Verification Ref','Invoice Ref','Payment Date','Gross Amount (£)','Materials Deducted (£)','CIS Deducted (£)','Net Paid (£)']
  ];

  pmts.forEach(function(p) {
    var ded = Math.round(p.grossLabour * p.cisRate * 100) / 100;
    var net = Math.round((p.grossLabour - ded) * 100) / 100;
    var eng = ENGINEERS.find(function(e){ return e.id === p.subId; });
    var verRef = eng ? (eng.hmrcVerRef||'') : '';
    rows.push([
      cisTaxMonthLabel(p.taxMonth),
      p.subName,
      p.utr,
      verRef,
      p.invoiceRef,
      p.date,
      p.grossLabour.toFixed(2),
      '0.00',
      ded.toFixed(2),
      net.toFixed(2)
    ]);
  });

  // Totals
  var tGross = pmts.reduce(function(s,p){ return s+p.grossLabour; }, 0);
  var tDed   = pmts.reduce(function(s,p){ return s+Math.round(p.grossLabour*p.cisRate*100)/100; }, 0);
  var tNet   = tGross - tDed;
  rows.push(['','','','','','TOTALS',tGross.toFixed(2),'0.00',tDed.toFixed(2),(tNet).toFixed(2)]);

  var csv = rows.map(function(row){
    return row.map(function(cell){
      var s = String(cell||'');
      if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',');
  }).join('\n');

  var filename = taxMonth
    ? 'CIS-Return-' + taxMonth + '-Mitchell-Insulation.csv'
    : 'CIS-Return-YTD-Mitchell-Insulation.csv';

  var blob = new Blob([csv], {type:'text/csv'});
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✔ CIS return exported — ' + filename, 'success');
}

/* ── CIS Engineer modal helpers ─────────────────────────────── */
function updateCISStatusPreview() {
  var sel = document.getElementById('eng-cis-status');
  var preview = document.getElementById('cis-status-preview');
  if (!sel || !preview) return;
  var map = {
    'employed': {label:'Employed (No CIS)', cls:'cis-employed'},
    'gross':    {label:'Gross Payment (0%)', cls:'cis-gross'},
    'standard': {label:'Standard Rate (20%)', cls:'cis-standard'},
    'higher':   {label:'Higher Rate (30%)', cls:'cis-higher'}
  };
  var m = map[sel.value] || map['employed'];
  preview.textContent = m.label;
  preview.className = 'cis-status-badge ' + m.cls;
}

/* ── Invoice CIS Sub mode ────────────────────────────────────── */
var _cisSubModeOn = false;
function toggleCISSubMode() {
  _cisSubModeOn = !_cisSubModeOn;
  var check = document.getElementById('cis-sub-check');
  var panel = document.getElementById('cis-sub-deduction-panel');
  if (check) check.classList.toggle('on', _cisSubModeOn);
  if (panel) panel.style.display = _cisSubModeOn ? '' : 'none';
  if (!_cisSubModeOn) {
    var calcDiv = document.getElementById('cis-sub-calc');
    if (calcDiv) calcDiv.style.display = 'none';
  }
}

function calcCISSub() {
  var amtEl  = document.getElementById('inv-amount');
  var labEl  = document.getElementById('cis-labour-element');
  var rateEl = document.getElementById('cis-sub-rate');
  var calcDiv = document.getElementById('cis-sub-calc');
  if (!labEl || !rateEl || !calcDiv) return;
  var gross  = parseFloat((amtEl?amtEl.value:0)||0);
  var labour = parseFloat(labEl.value||0);
  var rate   = parseFloat(rateEl.value||0.20);
  if (!labour) { calcDiv.style.display = 'none'; return; }
  var ded  = Math.round(labour * rate * 100) / 100;
  var net  = Math.round((gross - ded) * 100) / 100;
  var pct  = Math.round(rate * 100) + '%';
  document.getElementById('cs-gross').textContent = '£' + fmtNum(gross);
  document.getElementById('cs-labour').textContent = '£' + fmtNum(labour);
  document.getElementById('cs-deduction').textContent = '-£' + fmtNum(ded);
  document.getElementById('cs-rate-pct').textContent = pct;
  document.getElementById('cs-net').textContent = '£' + fmtNum(net);
  calcDiv.style.display = '';
}

/* Auto-show CIS deduction panel for subcontractor invoices on invoice modal open */
var _origPrefillInvoice = typeof prefillInvoice === 'function' ? prefillInvoice : null;

function openInvoiceModal(id) {
  /* Reset CIS sub mode on open */
  _cisSubModeOn = false;
  var check = document.getElementById('cis-sub-check');
  var panel = document.getElementById('cis-sub-deduction-panel');
  var calcDiv = document.getElementById('cis-sub-calc');
  if (check) check.classList.remove('on');
  if (panel) panel.style.display = 'none';
  if (calcDiv) calcDiv.style.display = 'none';
  /* Also check if project has subcontractors to pre-load MC panel */
  var mcPanel = document.getElementById('cis-mc-deductions-panel');
  if (mcPanel) mcPanel.style.display = 'none';
}

/* ── Render CIS deduction rows for MC invoice panel ─────────── */
function renderCISMCDeductions(projectId) {
  var mcPanel = document.getElementById('cis-mc-deductions-panel');
  var rowsDiv = document.getElementById('cis-mc-deduction-rows');
  if (!mcPanel || !rowsDiv) return;

  var subEngs = ENGINEERS.filter(function(e){
    return (e.type==='lt-sub'||e.type==='st-sub') && e.active && e.cisStatus && e.cisStatus !== 'employed';
  });

  if (!subEngs.length) return;
  mcPanel.style.display = '';

  var html = '';
  subEngs.forEach(function(e) {
    var rate = e.cisStatus==='gross' ? 0 : e.cisStatus==='higher' ? 0.30 : 0.20;
    var ratePct = Math.round(rate*100);
    html += '<div style="display:grid;grid-template-columns:1.5fr 1fr 1fr auto;gap:.5rem;align-items:end;margin-bottom:.5rem;">';
    html += '<div class="field" style="margin-bottom:0;">';
    html += '<label style="font-size:.68rem;">'+e.name+' <span class="cis-status-badge cis-'+e.cisStatus+'" style="font-size:.5rem;">'+ratePct+'%</span></label>';
    html += '<input type="number" placeholder="Labour element (£)" id="cis-mc-lab-'+e.id+'" oninput="calcCISMCTotals()"/>';
    html += '</div>';
    html += '<div class="field" style="margin-bottom:0;"><label style="font-size:.68rem;">UTR</label>';
    html += '<input style="font-family:var(--mono);font-size:.72rem;" value="'+(e.utr||'')+'" readonly/>';
    html += '</div>';
    html += '<div class="field" style="margin-bottom:0;"><label style="font-size:.68rem;">CIS ('+(ratePct||0)+'%) £</label>';
    html += '<input type="text" id="cis-mc-ded-'+e.id+'" readonly style="font-family:var(--mono);color:var(--red);background:rgba(248,113,113,.06);" placeholder="0.00"/>';
    html += '</div>';
    html += '<input type="hidden" id="cis-mc-rate-'+e.id+'" value="'+rate+'"/>';
    html += '</div>';
  });

  rowsDiv.innerHTML = html;
  calcCISMCTotals();
}

function calcCISMCTotals() {
  var subEngs = ENGINEERS.filter(function(e){
    return (e.type==='lt-sub'||e.type==='st-sub') && e.active && e.cisStatus && e.cisStatus !== 'employed';
  });
  var totalGross = 0, totalDed = 0;
  subEngs.forEach(function(e) {
    var labEl = document.getElementById('cis-mc-lab-'+e.id);
    var dedEl = document.getElementById('cis-mc-ded-'+e.id);
    var rateEl = document.getElementById('cis-mc-rate-'+e.id);
    if (!labEl || !rateEl) return;
    var lab  = parseFloat(labEl.value||0);
    var rate = parseFloat(rateEl.value||0);
    var ded  = Math.round(lab * rate * 100) / 100;
    totalGross += lab;
    totalDed   += ded;
    if (dedEl) dedEl.value = ded.toFixed(2);
  });
  var net = totalGross - totalDed;
  var grossEl = document.getElementById('cis-mc-gross');
  var dedEl2  = document.getElementById('cis-mc-total-ded');
  var netEl   = document.getElementById('cis-mc-net');
  if (grossEl) grossEl.textContent = '£' + fmtNum(Math.round(totalGross));
  if (dedEl2)  dedEl2.textContent  = '-£' + fmtNum(Math.round(totalDed));
  if (netEl)   netEl.textContent   = '£' + fmtNum(Math.round(net));
}



/* ══════════════════════════════════════════════════════════════
   MOBILE SITE VIEW — JavaScript
   One-handed, gloved, outdoor construction site UX
══════════════════════════════════════════════════════════════ */

/* ── State ─────────────────────────────────────────────────── */
