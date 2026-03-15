/* ═══ CONTRAQ — ECO4 ═══
   eco4Badge, ECO4 rendering, ECO4 modal, PAS 2030 certificates
   Lines 19824-20351 from contraq-v77
═══════════════════════════════════════════ */

function eco4Badge(status) {
  var map = {
    'Draft':     'background:rgba(251,191,36,.12);color:var(--yellow);border:1px solid rgba(251,191,36,.22)',
    'Complete':  'background:rgba(96,165,250,.12);color:#60a5fa;border:1px solid rgba(96,165,250,.22)',
    'Submitted': 'background:rgba(249,115,22,.12);color:var(--orange);border:1px solid rgba(249,115,22,.22)',
    'Lodged':    'background:rgba(163,230,53,.12);color:var(--lime);border:1px solid rgba(163,230,53,.22)'
  };
  var sty = map[status] || 'background:var(--bg4);color:var(--off3)';
  return '<span style="' + sty + ';font-family:var(--mono);font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:.15rem .55rem;border-radius:20px;">' + status + '</span>';
}

/* ── ECO4 status widget for dashboard home ───────────────── */
function buildECO4StatusWidget() {
  var total = ECO_JOBS.length;
  if (!total) return '';
  var counts = {Draft:0, Complete:0, Submitted:0, Lodged:0};
  ECO_JOBS.forEach(function(j){ counts[j.status] = (counts[j.status]||0)+1; });
  var today = new Date();
  var alertJobs = ECO_JOBS.filter(function(j){
    if (j.lodgementRef) return false;
    var diff = Math.round((today - new Date(j.installDate)) / 864e5);
    return diff >= 7;
  });
  var html = '<div style="background:var(--bg2);border:1.5px solid rgba(96,165,250,.2);border-radius:var(--radius);padding:1rem 1.2rem;margin-bottom:1.2rem;cursor:pointer" onclick="dashNav(\x27eco4\x27)">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">';
  html += '<div style="display:flex;align-items:center;gap:.55rem">';
  html += '<div style="width:30px;height:30px;background:rgba(96,165,250,.12);border:1.5px solid rgba(96,165,250,.25);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.9rem">\u{1F6E1}\uFE0F</div>';
  html += '<div><div style="font-size:.88rem;font-weight:700;color:var(--white)">ECO4 Compliance Status</div>';
  html += '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off4);margin-top:.08rem">' + total + ' job' + (total > 1 ? 's' : '') + ' registered \u2014 Mitchell Insulation Ltd</div></div></div>';
  if (alertJobs.length) {
    html += '<div style="background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.22);border-radius:6px;padding:.3rem .65rem;font-family:var(--mono);font-size:.6rem;color:var(--red);font-weight:600">\u26A0 ' + alertJobs.length + ' unlodged 7+ days</div>';
  }
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem">';
  var statCfg = [
    {k:'Draft',     color:'var(--yellow)',  bg:'rgba(251,191,36,.08)'},
    {k:'Complete',  color:'#60a5fa',        bg:'rgba(96,165,250,.08)'},
    {k:'Submitted', color:'var(--orange)',  bg:'rgba(249,115,22,.08)'},
    {k:'Lodged',    color:'var(--lime)',    bg:'rgba(163,230,53,.08)'}
  ];
  statCfg.forEach(function(c){
    html += '<div style="background:' + c.bg + ';border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:.6rem .75rem;text-align:center">';
    html += '<div style="font-family:var(--mono);font-size:1.3rem;font-weight:700;color:' + c.color + ';line-height:1">' + (counts[c.k]||0) + '</div>';
    html += '<div style="font-size:.6rem;color:var(--off3);margin-top:.25rem">' + c.k + '</div>';
    html += '</div>';
  });
  html += '</div>';
  if (alertJobs.length) {
    html += '<div style="margin-top:.65rem;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.15);border-radius:7px;padding:.55rem .8rem">';
    html += '<div style="font-family:var(--mono);font-size:.55rem;color:var(--red);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.35rem">\u26A0 Action required \u2014 no lodgement reference</div>';
    alertJobs.forEach(function(j){
      var diff = Math.round((new Date() - new Date(j.installDate)) / 864e5);
      html += '<div style="font-size:.74rem;color:var(--off2);display:flex;justify-content:space-between;align-items:center;padding:.25rem 0;border-bottom:1px solid rgba(255,255,255,.04)">';
      html += '<span>' + j.address + '</span>';
      html += '<span style="font-family:var(--mono);font-size:.65rem;color:var(--red)">' + diff + ' days unlodged</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ── Render ECO4 panel ───────────────────────────────────── */
function renderECO4() {
  var today = new Date();
  var total = ECO_JOBS.length;
  var counts = {Draft:0, Complete:0, Submitted:0, Lodged:0};
  ECO_JOBS.forEach(function(j){ counts[j.status] = (counts[j.status]||0)+1; });
  var alertJobs = ECO_JOBS.filter(function(j){
    if (j.lodgementRef) return false;
    var diff = Math.round((today - new Date(j.installDate)) / 864e5);
    return diff >= 7;
  });

  var html = '';
  html += '<div class="page-hdr"><div class="page-hdr-left"><h2>ECO4 / PAS 2030 Compliance Register</h2>';
  html += '<p>' + total + ' compliance record' + (total > 1 ? 's' : '') + ' &nbsp;&middot;&nbsp; Mitchell Insulation Ltd &nbsp;&middot;&nbsp; TrustMark registered contractor</p></div>';
  html += '<div style="display:flex;gap:.65rem;align-items:center">';
  html += '<button class="btn btn-dark btn-sm" onclick="exportECO4CSV()">\u2B07 Export CSV</button>';
  html += '<button class="btn btn-primary btn-sm" onclick="openECO4Modal(null)">+ New Compliance Record</button>';
  html += '</div></div>';

  html += '<div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:1.25rem">';
  html += kpiCard('Total Jobs', total, 'ECO4 / GBIS registered', 'up', {background:'#60a5fa'}, null);
  html += kpiCard('Draft', counts.Draft||0, 'Awaiting completion', 'dn', {background:'var(--yellow)'}, null);
  html += kpiCard('Complete', counts.Complete||0, 'Ready to submit', 'up', {background:'#60a5fa'}, null);
  html += kpiCard('Submitted', counts.Submitted||0, 'Awaiting lodgement', 'up', {background:'var(--orange)'}, null);
  html += kpiCard('Lodged', counts.Lodged||0, 'DCLG reference issued', 'up', {background:'var(--lime)'}, null);
  html += '</div>';

  if (alertJobs.length) {
    html += '<div style="background:rgba(248,113,113,.07);border:1.5px solid rgba(248,113,113,.25);border-radius:var(--radius);padding:.75rem 1rem;margin-bottom:1rem;display:flex;gap:1rem;align-items:center;flex-wrap:wrap">';
    html += '<div style="font-size:1.1rem">\u26A0</div>';
    html += '<div><div style="font-weight:700;font-size:.8rem;color:var(--red)">Lodgement overdue \u2014 ' + alertJobs.length + ' job' + (alertJobs.length > 1 ? 's have' : ' has') + ' passed 7 days without a DCLG lodgement reference</div>';
    html += '<div style="font-size:.74rem;color:var(--off3);margin-top:.2rem">' + alertJobs.map(function(j){ return j.ref + ' (' + j.address + ')'; }).join(' \u00B7 ') + '</div></div>';
    html += '<button class="btn btn-sm btn-danger" style="margin-left:auto" onclick="showToast(\'Contact Ofgem portal to obtain lodgement reference.\',\'default\')">Action \u2192</button>';
    html += '</div>';
  }

  html += '<div class="card"><div class="card-header"><span class="card-title">Compliance Job Register</span>';
  html += '<div style="display:flex;gap:.5rem">';
  html += '<select style="background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--white);font-size:.72rem;padding:.28rem .6rem;outline:none;" onchange="filterECO4Table(this.value)" id="eco4-filter-status">';
  html += '<option value="all">All statuses</option><option value="Draft">Draft</option><option value="Complete">Complete</option><option value="Submitted">Submitted</option><option value="Lodged">Lodged</option>';
  html += '</select></div></div>';
  html += '<div style="overflow-x:auto"><table class="tbl"><thead><tr>';
  html += '<th>Ref</th><th>Property address</th><th>Measure type</th><th>Install date</th>';
  html += '<th>Installer</th><th>PAS 2030 Status</th><th>Lodgement Ref</th><th></th>';
  html += '</tr></thead><tbody id="eco4-tbody"></tbody></table></div></div>';

  var content = document.getElementById('dash-content');
  content.innerHTML = html;
  renderECO4Table('all');
}

function renderECO4Table(filterStatus) {
  var tbody = document.getElementById('eco4-tbody');
  if (!tbody) return;
  var jobs = filterStatus === 'all' ? ECO_JOBS : ECO_JOBS.filter(function(j){ return j.status === filterStatus; });
  if (!jobs.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--off4)">No compliance records found.</td></tr>';
    return;
  }
  var today = new Date();
  tbody.innerHTML = jobs.map(function(j){
    var isAlert = !j.lodgementRef && Math.round((today - new Date(j.installDate)) / 864e5) >= 7;
    var rowStyle = isAlert ? 'background:rgba(248,113,113,.04)' : '';
    var alertDot = isAlert ? ' <span style="display:inline-block;width:6px;height:6px;background:var(--red);border-radius:50%;vertical-align:middle;margin-left:3px" title="Lodgement overdue"></span>' : '';
    var addrParts = j.address.split(',');
    return '<tr style="' + rowStyle + '">'
      + '<td class="mono" style="font-size:.68rem">' + j.ref + '</td>'
      + '<td><div class="strong" style="font-size:.78rem">' + addrParts[0] + '</div><div style="font-size:.65rem;color:var(--off4)">' + addrParts.slice(1).join(',').trim() + '</div></td>'
      + '<td style="font-size:.75rem">' + j.measureType + '</td>'
      + '<td class="mono" style="font-size:.68rem">' + fmtDate(j.installDate) + '</td>'
      + '<td style="font-size:.75rem">' + j.installerName + '</td>'
      + '<td>' + eco4Badge(j.status) + '</td>'
      + '<td class="mono" style="font-size:.65rem">' + (j.lodgementRef ? '<span style="color:var(--lime)">' + j.lodgementRef + '</span>' : '<span style="color:var(--off4)">\u2014</span>') + alertDot + '</td>'
      + '<td style="display:flex;gap:.35rem">'
      + '<button class="btn btn-dark btn-xs" onclick="openECO4Modal(\'' + j.id + '\')">Edit</button>'
      + '<button class="btn btn-xs" style="background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.2)" onclick="openECO4ModalAndPrint(\'' + j.id + '\')">\u{1F5A8}\uFE0F</button>'
      + '</td>'
      + '</tr>';
  }).join('');
}

function filterECO4Table(val) {
  renderECO4Table(val);
}

/* ── Modal open/close ────────────────────────────────────── */
function openECO4Modal(id) {
  var job = id ? ECO_JOBS.find(function(j){ return j.id === id; }) : null;
  var titleEl = document.getElementById('eco4-modal-title');
  var delBtn  = document.getElementById('eco4-del-btn');
  if (titleEl) titleEl.textContent = job ? 'Edit \u2014 ' + job.ref : 'New PAS 2030 Compliance Record';
  if (delBtn)  delBtn.style.display = job ? '' : 'none';

  var instSel = document.getElementById('eco-installer');
  if (instSel) {
    instSel.innerHTML = ENGINEERS.map(function(e){
      return '<option value="' + e.id + '"' + (job && job.installer === e.id ? ' selected' : '') + '>' + e.name + '</option>';
    }).join('');
  }

  if (job) {
    document.getElementById('eco-address').value       = job.address || '';
    document.getElementById('eco-proptype').value      = job.propertyType || 'Semi-detached';
    document.getElementById('eco-buildyear').value     = job.buildYear || '';
    document.getElementById('eco-measuretype').value   = job.measureType || 'Cavity Wall Insulation';
    document.getElementById('eco-installdate').value   = job.installDate || '';
    document.getElementById('eco-manufacturer').value  = job.productManufacturer || '';
    document.getElementById('eco-productname').value   = job.productName || '';
    document.getElementById('eco-thickness').value     = job.thicknessMm || '';
    document.getElementById('eco-uval-before').value   = job.uValueBefore || '';
    document.getElementById('eco-uval-after').value    = job.uValueAfter || '';
    document.getElementById('eco-nvq').value           = job.nvqLevel || 'NVQ Level 2';
    document.getElementById('eco-cscs').value          = job.cscsCard || 'Gold \u2014 Advanced Craft';
    document.getElementById('eco-trustmark').value     = job.trustMarkReg || '';
    document.getElementById('eco-status').value        = job.status || 'Draft';
    document.getElementById('eco-lodgement').value     = job.lodgementRef || '';
    document.getElementById('eco-assessor-name').value = job.assessorName || '';
    document.getElementById('eco-assessor-qual').value = job.assessorQual || '';
    document.getElementById('eco-assessor-date').value = job.assessorDate || '';
    document.getElementById('eco-notes').value         = job.notes || '';
    STATE._eco4EditId    = job.id;
    STATE._eco4Declaration = job.declaration || false;
    STATE._eco4Photos    = job.photos ? JSON.parse(JSON.stringify(job.photos)) : [];
  } else {
    document.getElementById('eco-address').value       = '';
    document.getElementById('eco-proptype').value      = 'Semi-detached';
    document.getElementById('eco-buildyear').value     = '';
    document.getElementById('eco-measuretype').value   = 'Cavity Wall Insulation';
    document.getElementById('eco-installdate').value   = new Date().toISOString().slice(0,10);
    document.getElementById('eco-manufacturer').value  = '';
    document.getElementById('eco-productname').value   = '';
    document.getElementById('eco-thickness').value     = '';
    document.getElementById('eco-uval-before').value   = '';
    document.getElementById('eco-uval-after').value    = '';
    document.getElementById('eco-nvq').value           = 'NVQ Level 2';
    document.getElementById('eco-cscs').value          = 'Gold \u2014 Advanced Craft';
    document.getElementById('eco-trustmark').value     = '';
    document.getElementById('eco-status').value        = 'Draft';
    document.getElementById('eco-lodgement').value     = '';
    document.getElementById('eco-assessor-name').value = '';
    document.getElementById('eco-assessor-qual').value = '';
    document.getElementById('eco-assessor-date').value = '';
    document.getElementById('eco-notes').value         = '';
    STATE._eco4EditId    = null;
    STATE._eco4Declaration = false;
    STATE._eco4Photos    = [
      {label:'Pre-installation',  type:'pre',    simulated:false},
      {label:'During works',      type:'during', simulated:false},
      {label:'Post-installation', type:'post',   simulated:false}
    ];
  }

  renderECO4DeclCheck();
  renderECO4Photos();
  openModal('modal-eco4-record');
}

function openECO4ModalAndPrint(id) {
  openECO4Modal(id);
  setTimeout(function(){ generatePAS2030Certificate(); }, 400);
}

function toggleECO4Declaration() {
  STATE._eco4Declaration = !STATE._eco4Declaration;
  renderECO4DeclCheck();
}

function renderECO4DeclCheck() {
  var chk = document.getElementById('eco-decl-check');
  var row = document.getElementById('eco-declaration-row');
  if (!chk) return;
  if (STATE._eco4Declaration) {
    chk.style.background   = 'var(--lime)';
    chk.style.borderColor  = 'var(--lime)';
    chk.innerHTML          = '<span style="color:#000;font-size:.8rem;font-weight:700">\u2713</span>';
    if (row) row.style.borderColor = 'rgba(163,230,53,.4)';
  } else {
    chk.style.background   = 'transparent';
    chk.style.borderColor  = 'var(--border2)';
    chk.innerHTML          = '';
    if (row) row.style.borderColor = 'var(--border)';
  }
}

var ECO4_PHOTO_TYPES = [
  {type:'pre',    label:'Pre-installation',  color:'rgba(96,165,250,.15)',  border:'rgba(96,165,250,.3)'},
  {type:'during', label:'During works',      color:'rgba(249,115,22,.12)',  border:'rgba(249,115,22,.28)'},
  {type:'post',   label:'Post-installation', color:'rgba(163,230,53,.12)',  border:'rgba(163,230,53,.28)'}
];

function renderECO4Photos() {
  var wrap = document.getElementById('eco-photos-wrap');
  var warn = document.getElementById('eco-photo-warning');
  if (!wrap) return;
  var photos = STATE._eco4Photos || [];
  var typesCovered = {};
  photos.forEach(function(p){ typesCovered[p.type] = true; });
  var missingTypes = ['pre','during','post'].filter(function(t){ return !typesCovered[t]; });
  if (warn) warn.style.display = (photos.length < 3 || missingTypes.length > 0) ? '' : 'none';

  wrap.innerHTML = photos.map(function(p, idx){
    var cfg = ECO4_PHOTO_TYPES.find(function(c){ return c.type === p.type; }) || ECO4_PHOTO_TYPES[0];
    var uploadedBadge = p.simulated
      ? '<div style="font-family:var(--mono);font-size:.52rem;color:var(--off3);text-align:center;line-height:1.4">' + p.label + '<br><span style="color:var(--lime);font-size:.48rem">\u2713 Uploaded</span></div>'
      : '<div style="font-family:var(--mono);font-size:.52rem;color:var(--off4);text-align:center;line-height:1.4">' + p.label + '<br><span style="font-size:.48rem">Click to upload</span></div>';
    return '<div style="border:1.5px solid ' + cfg.border + ';border-radius:9px;overflow:hidden;background:' + cfg.color + ';position:relative;">'
      + '<div style="aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem;cursor:pointer;padding:.75rem;" onclick="simulateECO4PhotoUpload(' + idx + ')">'
      + '<div style="font-size:1.4rem">\uD83D\uDCF7</div>'
      + uploadedBadge
      + '</div>'
      + '<button onclick="removeECO4Photo(' + idx + ')" style="position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:50%;background:rgba(248,113,113,.15);border:1px solid rgba(248,113,113,.3);color:var(--red);font-size:.6rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">\u00D7</button>'
      + '</div>';
  }).join('');
}

function simulateECO4PhotoUpload(idx) {
  if (!STATE._eco4Photos) return;
  STATE._eco4Photos[idx].simulated = true;
  renderECO4Photos();
  showToast('Photo uploaded successfully.', 'success');
}

function addECO4Photo() {
  if (!STATE._eco4Photos) STATE._eco4Photos = [];
  STATE._eco4Photos.push({label:'Additional photo', type:'post', simulated:false});
  renderECO4Photos();
}

function removeECO4Photo(idx) {
  STATE._eco4Photos.splice(idx, 1);
  renderECO4Photos();
}

/* ── Save ECO4 job ───────────────────────────────────────── */
function saveECO4Job() {
  var errEl = document.getElementById('eco4-err');
  errEl.style.display = 'none';
  var address = document.getElementById('eco-address').value.trim();
  var date    = document.getElementById('eco-installdate').value;
  if (!address) { errEl.textContent = 'Property address is required.'; errEl.style.display = 'block'; return; }
  if (!date)    { errEl.textContent = 'Installation date is required.'; errEl.style.display = 'block'; return; }

  var instEl   = document.getElementById('eco-installer');
  var instId   = instEl ? instEl.value : '';
  var instName = (instEl && instEl.selectedOptions[0]) ? instEl.selectedOptions[0].text : '';

  var photos = STATE._eco4Photos || [];
  var existingJob = STATE._eco4EditId ? ECO_JOBS.find(function(j){ return j.id === STATE._eco4EditId; }) : null;

  var job = {
    id:                  STATE._eco4EditId || ('eco' + (Date.now() % 100000)),
    ref:                 existingJob ? existingJob.ref : ('ECO4-' + new Date().getFullYear() + '-' + String(ECO_JOBS.length + 1).padStart(3,'0')),
    address:             address,
    propertyType:        document.getElementById('eco-proptype').value,
    buildYear:           document.getElementById('eco-buildyear').value,
    measureType:         document.getElementById('eco-measuretype').value,
    installDate:         date,
    installer:           instId,
    installerName:       instName,
    status:              document.getElementById('eco-status').value,
    lodgementRef:        document.getElementById('eco-lodgement').value.trim(),
    productManufacturer: document.getElementById('eco-manufacturer').value.trim(),
    productName:         document.getElementById('eco-productname').value.trim(),
    thicknessMm:         parseFloat(document.getElementById('eco-thickness').value) || 0,
    uValueBefore:        parseFloat(document.getElementById('eco-uval-before').value) || 0,
    uValueAfter:         parseFloat(document.getElementById('eco-uval-after').value) || 0,
    nvqLevel:            document.getElementById('eco-nvq').value,
    cscsCard:            document.getElementById('eco-cscs').value,
    trustMarkReg:        document.getElementById('eco-trustmark').value.trim(),
    assessorName:        document.getElementById('eco-assessor-name').value.trim(),
    assessorQual:        document.getElementById('eco-assessor-qual').value.trim(),
    assessorDate:        document.getElementById('eco-assessor-date').value,
    declaration:         STATE._eco4Declaration || false,
    photos:              photos,
    notes:               document.getElementById('eco-notes').value.trim()
  };

  if (STATE._eco4EditId) {
    var idx = ECO_JOBS.findIndex(function(j){ return j.id === STATE._eco4EditId; });
    if (idx > -1) ECO_JOBS[idx] = job;
  } else {
    ECO_JOBS.push(job);
  }

  closeModal('modal-eco4-record');
  if (STATE.currentPanel === 'eco4') renderECO4();

  var badge = document.getElementById('sb-badge-eco4');
  if (badge) {
    var unlodged = ECO_JOBS.filter(function(j){ return !j.lodgementRef; }).length;
    badge.textContent   = unlodged;
    badge.style.display = unlodged ? '' : 'none';
  }

  showToast('PAS 2030 compliance record saved.', 'success');
}

function deleteECO4Job() {
  if (!STATE._eco4EditId) return;
  var idx = ECO_JOBS.findIndex(function(j){ return j.id === STATE._eco4EditId; });
  if (idx > -1) ECO_JOBS.splice(idx, 1);
  closeModal('modal-eco4-record');
  if (STATE.currentPanel === 'eco4') renderECO4();
  showToast('Compliance record deleted.', 'default');
}

/* ── Export CSV ──────────────────────────────────────────── */
function exportECO4CSV() {
  var rows = [['Ref','Address','Measure Type','Install Date','Installer','Status','Lodgement Ref','Product','Thickness (mm)','U-Value Before','U-Value After','TrustMark Reg','Assessor','Declaration']];
  ECO_JOBS.forEach(function(j){
    rows.push([j.ref, j.address, j.measureType, j.installDate, j.installerName, j.status, j.lodgementRef||'', j.productManufacturer+' '+j.productName, j.thicknessMm, j.uValueBefore, j.uValueAfter, j.trustMarkReg, j.assessorName, j.declaration?'Yes':'No']);
  });
  var csv = rows.map(function(r){ return r.map(function(c){ return '"' + String(c).replace(/"/g,'""') + '"'; }).join(','); }).join('\n');
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'ECO4-PAS2030-Register-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('ECO4 register exported as CSV.', 'success');
}

/* ── Generate PAS 2030 Certificate ──────────────────────── */
function generatePAS2030Certificate() {
  var id = STATE._eco4EditId;
  var job = id ? ECO_JOBS.find(function(j){ return j.id === id; }) : null;

  var instEl = document.getElementById('eco-installer');
  var instName = (instEl && instEl.selectedOptions[0]) ? instEl.selectedOptions[0].text : '';

  var data = job || {
    ref:                 'DRAFT',
    address:             document.getElementById('eco-address').value || '\u2014',
    propertyType:        document.getElementById('eco-proptype').value,
    buildYear:           document.getElementById('eco-buildyear').value || '\u2014',
    measureType:         document.getElementById('eco-measuretype').value,
    installDate:         document.getElementById('eco-installdate').value,
    installerName:       instName,
    status:              document.getElementById('eco-status').value,
    lodgementRef:        document.getElementById('eco-lodgement').value || '',
    productManufacturer: document.getElementById('eco-manufacturer').value || '\u2014',
    productName:         document.getElementById('eco-productname').value || '\u2014',
    thicknessMm:         document.getElementById('eco-thickness').value || '\u2014',
    uValueBefore:        document.getElementById('eco-uval-before').value || '\u2014',
    uValueAfter:         document.getElementById('eco-uval-after').value || '\u2014',
    nvqLevel:            document.getElementById('eco-nvq').value,
    cscsCard:            document.getElementById('eco-cscs').value,
    trustMarkReg:        document.getElementById('eco-trustmark').value || '\u2014',
    assessorName:        document.getElementById('eco-assessor-name').value || '\u2014',
    assessorQual:        document.getElementById('eco-assessor-qual').value || '\u2014',
    assessorDate:        document.getElementById('eco-assessor-date').value || '',
    declaration:         STATE._eco4Declaration || false,
    photos:              STATE._eco4Photos || [],
    notes:               document.getElementById('eco-notes').value || ''
  };

  var certNum    = data.ref + '-CERT';
  var issuedDate = data.assessorDate
    ? new Date(data.assessorDate).toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'})
    : new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'});
  var installDateFmt = data.installDate
    ? new Date(data.installDate).toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'})
    : '\u2014';

  function certField(label, value) {
    return '<div class="pas-cert-field"><div class="pas-cert-label">' + label + '</div><div class="pas-cert-value">' + value + '</div></div>';
  }

  var certHtml = '<div class="pas-cert">';

  certHtml += '<div class="pas-cert-header">';
  certHtml += '<div><div class="pas-cert-title">PAS 2030:2019 \u2014 Certificate of Compliance</div>';
  certHtml += '<div class="pas-cert-subtitle">Energy Efficiency Installation \u2014 ECO4 / Great British Insulation Scheme</div>';
  certHtml += '<div style="margin-top:8px;font-size:10px;color:#555">Certificate No: <strong>' + certNum + '</strong> &nbsp;&nbsp; Issued: <strong>' + issuedDate + '</strong></div></div>';
  certHtml += '<div>';
  certHtml += '<div class="pas-cert-logo">CONTRAQ</div>';
  certHtml += '<div style="font-size:9px;color:#777;margin-top:4px;text-align:right">Mitchell Insulation Ltd<br>contraq.co.uk</div>';
  if (data.status === 'Lodged') {
    certHtml += '<div style="margin-top:8px"><span class="pas-cert-badge">\u2713 LODGED</span></div>';
  }
  certHtml += '</div></div>';

  certHtml += '<div class="pas-cert-section">';
  certHtml += '<div class="pas-cert-section-title">1. Property Details</div>';
  certHtml += '<div class="pas-cert-grid">';
  certHtml += certField('Full address', data.address);
  certHtml += certField('Property type', data.propertyType || '\u2014');
  certHtml += certField('Approximate build year', data.buildYear || '\u2014');
  certHtml += certField('DCLG Lodgement reference', data.lodgementRef || 'Pending');
  certHtml += '</div></div>';

  certHtml += '<div class="pas-cert-section">';
  certHtml += '<div class="pas-cert-section-title">2. Measure &amp; Product Details</div>';
  certHtml += '<div class="pas-cert-grid">';
  certHtml += certField('Measure type', data.measureType);
  certHtml += certField('Installation date', installDateFmt);
  certHtml += certField('Product manufacturer', data.productManufacturer);
  certHtml += certField('Product name / grade', data.productName);
  certHtml += certField('Installed thickness', (data.thicknessMm || '\u2014') + ' mm');
  certHtml += certField('U-value improvement', (data.uValueBefore || '\u2014') + ' \u2192 ' + (data.uValueAfter || '\u2014') + ' W/m\u00B2K');
  certHtml += '</div></div>';

  certHtml += '<div class="pas-cert-section">';
  certHtml += '<div class="pas-cert-section-title">3. Installer Certification</div>';
  certHtml += '<div class="pas-cert-grid">';
  certHtml += certField('Installer name', data.installerName || '\u2014');
  certHtml += certField('NVQ qualification', data.nvqLevel);
  certHtml += certField('CSCS card type', data.cscsCard);
  certHtml += certField('TrustMark registration', data.trustMarkReg || '\u2014');
  certHtml += '</div></div>';

  var simPhotos = data.photos.filter(function(p){ return p.simulated; });
  certHtml += '<div class="pas-cert-section">';
  certHtml += '<div class="pas-cert-section-title">4. Photographic Evidence</div>';
  certHtml += '<div style="padding:10px 12px">';
  certHtml += '<div style="font-size:11px;margin-bottom:6px"><strong>' + simPhotos.length + ' photo' + (simPhotos.length !== 1 ? 's' : '') + ' on record:</strong></div>';
  certHtml += '<ul style="margin:0;padding-left:16px">';
  simPhotos.forEach(function(p){
    certHtml += '<li style="font-size:11px;margin-bottom:3px">' + p.label + ' (' + p.type + ')</li>';
  });
  certHtml += '</ul>';
  if (simPhotos.length < 3) {
    certHtml += '<div style="color:#dc2626;font-size:10px;margin-top:6px;font-weight:700">\u26A0 Minimum 3 photos required for PAS 2030 compliance.</div>';
  }
  certHtml += '</div></div>';

  certHtml += '<div class="pas-cert-declaration">';
  certHtml += '<div class="pas-cert-declaration-title">' + (data.declaration ? '\u2713 Declaration of Conformity \u2014 CONFIRMED' : '\u26A0 Declaration of Conformity \u2014 PENDING') + '</div>';
  certHtml += '<div class="pas-cert-declaration-text">This installation has been carried out in accordance with PAS 2030:2019 and the relevant British Standards. All materials installed meet the specified performance requirements as stated in this certificate. This certificate is issued by a TrustMark registered contractor and is valid for submission to the relevant government scheme administrator.</div>';
  certHtml += '</div>';

  certHtml += '<div class="pas-cert-signoff">';
  certHtml += '<div class="pas-cert-sig-block"><div class="pas-cert-sig-label">Qualified assessor sign-off</div><div class="pas-cert-sig-name">' + (data.assessorName || 'Signature required') + '</div><div class="pas-cert-sig-qual">' + (data.assessorQual || '\u2014') + '</div><div style="margin-top:6px;font-size:9px;color:#777">Date: ' + issuedDate + '</div></div>';
  certHtml += '<div class="pas-cert-sig-block"><div class="pas-cert-sig-label">On behalf of Mitchell Insulation Ltd</div><div class="pas-cert-sig-name" style="margin-top:32px;border-top:1px solid #999;padding-top:4px">Authorised signatory</div><div class="pas-cert-sig-qual">Director / Contracts Manager</div></div>';
  certHtml += '</div>';

  if (data.notes) {
    certHtml += '<div style="margin-top:12px;padding:8px 10px;border:1px solid #e5e7eb;border-radius:4px;font-size:10px;color:#555"><strong>Notes:</strong> ' + data.notes + '</div>';
  }

  certHtml += '<div class="pas-cert-footer">';
  certHtml += '<span>Generated by CONTRAQ \u2014 contraq.co.uk &nbsp;|&nbsp; PAS 2030:2019 compliant documentation</span>';
  certHtml += '<span>Certificate: ' + certNum + ' &nbsp;|&nbsp; ' + issuedDate + '</span>';
  certHtml += '</div>';
  certHtml += '</div>';

  var printDiv = document.getElementById('pas-certificate-print');
  if (printDiv) {
    printDiv.style.display = 'block';
    printDiv.innerHTML = certHtml;
    setTimeout(function(){
      window.print();
      setTimeout(function(){ printDiv.style.display = 'none'; }, 500);
    }, 150);
  }
}





/* ══════════════════════════════════════════════════════════════
   TRUST & CREDIBILITY COMPONENTS JS
══════════════════════════════════════════════════════════════ */

/* ── Security page nav ───────────────────────────────────── */
