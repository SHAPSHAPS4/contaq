/* ═══ CONTRAQ — QUOTES ═══
   Create quote, renderTenders, QB file upload, AI analysis, extraction review, CSV export
   Lines 8968-11062 from contraq-v77
═══════════════════════════════════════════ */

function renderCreateQuoteForm() {
  var content = document.getElementById('dash-content');
  if (!content) return;

  // Auto-generate next quote number
  var year = new Date().getFullYear();
  var maxNum = 0;
  TENDERS.forEach(function(t) {
    if (t.ref) {
      var m = t.ref.match(/Q-\d{4}-(\d+)$/);
      if (!m) m = t.ref.match(/QTE-\d{4}-(\d+)$/);
      if (m) { var n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
    }
  });
  var nextNum = String(maxNum + 1).padStart(3, '0');
  var newRef = 'Q-' + year + '-' + nextNum;

  // Build client options
  var clientOpts = '<option value="">Select client…</option>' +
    CLIENTS.map(function(cl) {
      return '<option value="' + cl.id + '">' + cl.name + '</option>';
    }).join('');

  // Staff list
  var staff = [
    'James Mitchell — Estimator',
    'Mark Pearce — Project Manager',
    'Dave Harris — Site Supervisor',
    'Sarah Jones — Sales',
    'John Smith — Commercial Manager'
  ];
  var staffOpts = '<option value="">Select…</option>' +
    staff.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');

  // Today's date
  var today = new Date().toISOString().slice(0, 10);

  var html = '<div style="animation:fadeUp .3s ease both;max-width:720px;margin:0 auto">';

  // Back breadcrumb
  html += '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:1.5rem">'
    + '<button class="btn btn-dark btn-sm" onclick="renderTenders()" style="gap:.4rem">&#8592; Back to Quote Book</button>'
    + '<span style="color:var(--off4);font-size:.8rem">Quote Book</span>'
    + '<span style="color:var(--off4);font-size:.8rem">›</span>'
    + '<span style="font-size:.8rem;color:var(--off2)">Create New Quote</span>'
    + '</div>';

  // Card
  html += '<div class="card" style="padding:0">';

  // Card header
  html += '<div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">'
    + '<div>'
    + '<div style="font-weight:700;font-size:1.05rem;letter-spacing:-.015em">New Quote</div>'
    + '<div style="font-family:var(--mono);font-size:.72rem;color:var(--orange);margin-top:.2rem;font-weight:600">'
    + newRef
    + '</div>'
    + '</div>'
    + '<span class="badge o" style="font-size:.7rem;padding:.3rem .75rem">Pending</span>'
    + '</div>';

  // Form body
  html += '<div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem">';

  // Hidden ref field
  html += '<input type="hidden" id="cq-ref" value="' + newRef + '"/>';

  // Row 1: Quote ref (read-only) + Date
  html += '<div class="form-row">'
    + '<div class="field"><label>Quote Number</label>'
    + '<input value="' + newRef + '" readonly style="background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:.5rem .85rem;font-size:.82rem;color:var(--orange);font-family:var(--mono);width:100%;cursor:default"/>'
    + '</div>'
    + '<div class="field"><label>Date</label>'
    + '<input type="date" id="cq-date" value="' + today + '" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:.5rem .85rem;font-size:.82rem;color:var(--white);font-family:var(--sans);width:100%;outline:none"/>'
    + '</div>'
    + '</div>';

  // Row 2: Title (full width)
  html += '<div class="field"><label>Quote Title <span style="color:var(--red)">*</span></label>'
    + '<input type="text" id="cq-title" placeholder="e.g. Kitchen Refurbishment — 42 High Street" '
    + 'style="background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:.5rem .85rem;font-size:.85rem;color:var(--white);font-family:var(--sans);width:100%;outline:none" '
    + '/>'
    + '</div>';

  // Row 3: Client + Sent By
  html += '<div class="form-row">'
    + '<div class="field"><label>Client <span style="color:var(--red)">*</span></label>'
    + '<select id="cq-client" class="filter-select" style="width:100%">' + clientOpts + '</select>'
    + '</div>'
    + '<div class="field"><label>Sent By</label>'
    + '<select id="cq-sent-by" class="filter-select" style="width:100%">' + staffOpts + '</select>'
    + '</div>'
    + '</div>';

  // Row 4: Value + Margin
  html += '<div class="form-row">'
    + '<div class="field"><label>Estimated Value (£)</label>'
    + '<input type="number" id="cq-value" placeholder="e.g. 85000" min="0" step="100" '
    + 'style="background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:.5rem .85rem;font-size:.82rem;color:var(--white);font-family:var(--mono);width:100%;outline:none"/>'
    + '</div>'
    + '<div class="field"><label>Margin %</label>'
    + '<input type="number" id="cq-margin" placeholder="20" min="0" max="100" value="20" '
    + 'style="background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:.5rem .85rem;font-size:.82rem;color:var(--white);font-family:var(--mono);width:100%;outline:none"/>'
    + '</div>'
    + '</div>';

  // Row 5: Notes
  html += '<div class="field"><label>Notes / Scope Summary</label>'
    + '<textarea id="cq-notes" rows="3" placeholder="Brief scope description, key requirements, tender conditions…" '
    + 'style="background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:.55rem .85rem;font-size:.82rem;color:var(--white);font-family:var(--sans);width:100%;outline:none;resize:vertical;line-height:1.55"></textarea>'
    + '</div>';

  // Error area
  html += '<div id="cq-err" style="display:none;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);border-radius:7px;padding:.55rem .85rem;font-size:.8rem;color:var(--red)"></div>';

  html += '</div>'; // end form body

  // Card footer
  html += '<div style="padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.75rem;background:var(--bg2);border-radius:0 0 var(--radius) var(--radius)">'
    + '<button class="btn btn-ghost btn-sm" onclick="renderTenders()">Cancel</button>'
    + '<button class="btn btn-primary btn-sm" onclick="saveNewQuote()" style="gap:.4rem">&#10003; Save Quote</button>'
    + '</div>';

  html += '</div>'; // end card
  html += '</div>'; // end wrapper

  // Update topbar
  var tt = document.getElementById('dash-topbar-title');
  var ta = document.getElementById('dash-topbar-action');
  if (tt) tt.textContent = 'Create New Quote';
  if (ta) ta.style.display = 'none';

  content.innerHTML = html;
  // Focus title field
  setTimeout(function() {
    var tf = document.getElementById('cq-title');
    if (tf) tf.focus();
  }, 120);
}

function saveNewQuote() {
  var title   = (document.getElementById('cq-title')  ||{}).value || '';
  var clientId= (document.getElementById('cq-client') ||{}).value || '';
  var val     = parseFloat((document.getElementById('cq-value')  ||{}).value) || 0;
  var margin  = parseInt((document.getElementById('cq-margin') ||{}).value, 10) || 20;
  var sentBy  = (document.getElementById('cq-sent-by')||{}).value || '';
  var notes   = (document.getElementById('cq-notes')  ||{}).value || '';
  var date    = (document.getElementById('cq-date')   ||{}).value || new Date().toISOString().slice(0,10);
  var ref     = (document.getElementById('cq-ref')    ||{}).value || '';
  var errEl   = document.getElementById('cq-err');

  // Validate
  if (!title) {
    if (errEl) { errEl.textContent = 'Quote title is required.'; errEl.style.display = 'block'; }
    var ti = document.getElementById('cq-title');
    if (ti) { ti.style.borderColor = 'var(--red)'; ti.focus(); }
    return;
  }
  if (!clientId) {
    if (errEl) { errEl.textContent = 'Please select a client.'; errEl.style.display = 'block'; }
    return;
  }

  var client = CLIENTS.find(function(c) { return c.id === clientId; });
  var newId  = 'tq-' + Date.now();

  var newQuote = {
    id:          newId,
    ref:         ref,
    name:        title,
    client:      clientId,
    clientName:  client ? client.name : '',
    value:       val || 0,
    margin:      margin,
    status:      'open',
    enquiry:     date,
    submitted:   '',
    decision:    '',
    notes:       notes,
    sentBy:      sentBy,
    linkedProjectId: null,
    attachments: [],
    folders:     { drawings:[], specs:[], documents:[], purchaseOrder:[] }
  };

  // Insert at top (most recent first)
  TENDERS.unshift(newQuote);

  showToast('Quote ' + ref + ' created successfully', 'success');
  renderTenders();
}


function renderTenders(filterStatus) {
  /* ── Empty state ── */
  if (TENDERS.length === 0) {
    document.getElementById('dash-content').innerHTML = '<div class="page-hdr"><div class="page-hdr-left"><h2>Quote Book</h2><p>0 quotes</p></div>'
      + '<div style="display:flex;align-items:center;gap:.65rem;">'
      + '<button class="btn btn-primary btn-sm" onclick="renderCreateQuoteForm()" style="gap:.45rem;"><span style="font-size:1rem;line-height:1;">&#43;</span> Create New Quote</button>'
      + '<button class="qb-upload-btn" onclick="openModal(\'modal-qb-upload\')"><span style="font-size:1rem;">&#128196;</span> Upload Quote Book AI Enabled</button>'
      + '</div></div>'
      + '<div class="empty-state" style="padding:3.5rem 1rem">'
      + '<div class="empty-icon" style="opacity:.3;color:var(--off3,#888)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>'
      + '<div class="empty-title" style="font-size:1.1rem;color:var(--white);margin-bottom:.5rem">No quotes yet</div>'
      + '<div class="empty-sub" style="max-width:380px;margin:0 auto;line-height:1.6">Start building your Quote Book — add your first quote or upload an existing spreadsheet.</div>'
      + '<button class="btn btn-primary" style="margin-top:1.25rem" onclick="openTenderModal(null)">Add Your First Quote</button>'
      + '</div>';
    return;
  }
  filterStatus = filterStatus||'all';
  var won    = TENDERS.filter(function(t){return t.status==='won';});
  var lost   = TENDERS.filter(function(t){return t.status==='lost';});
  var open   = TENDERS.filter(function(t){return t.status==='open';});
  var sub    = TENDERS.filter(function(t){return t.status==='submitted';});
  var pipeline = open.concat(sub);
  var decided = won.length + lost.length;
  var winRate = decided>0 ? Math.round(won.length/decided*100) : 0;
  var totalVal = TENDERS.reduce(function(s,t){return s+t.value;},0);
  var wonVal   = won.reduce(function(s,t){return s+t.value;},0);
  var lostVal  = lost.reduce(function(s,t){return s+t.value;},0);
  var openVal  = pipeline.reduce(function(s,t){return s+t.value;},0);
  var avgWon   = won.length > 0 ? Math.round(wonVal/won.length) : 0;

  var filtered = filterStatus==='all' ? TENDERS : TENDERS.filter(function(t){return t.status===filterStatus;});

  var html = '';

  /* ── Page header with upload button ── */
  html += '<div class="page-hdr">'
    + '<div class="page-hdr-left"><h2>Quote Book</h2><div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'tenders\')" title="What is this?">?</button><div class="help-tooltip" id="help-tip-tenders">'+HELP_TIPS.tenders+'</div></div>'
    + '<p>'+TENDERS.length+' quotes &nbsp;&middot;&nbsp; '+won.length+' won &nbsp;&middot;&nbsp; '+winRate+'% win rate</p>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:.65rem;">'
    + '<button class="qb-reset-link" onclick="qbResetDemoData()" title="Restore original demo quotes">&#8635; Reset demo</button>'
    + '<button class="btn btn-primary btn-sm" onclick="renderCreateQuoteForm()" style="gap:.45rem;">'
    + '<span style="font-size:1rem;line-height:1;">&#43;</span> Create New Quote</button>'
    + '<button class="qb-upload-btn" onclick="openModal(\'modal-qb-upload\')">'
    + '<span style="font-size:1rem;">&#128196;</span> Upload Quote Book AI Enabled</button>'
    + '</div></div>';

  /* ── 4 stat boxes — uses kpi + proj-stat-kpi pattern proven in Projects tab ── */
  html += '<div class="kpi-grid" style="margin-bottom:1.1rem;">';

  html += '<div class="kpi proj-stat-kpi" style="--kc:#60a5fa;cursor:pointer;" onclick="openTenderReport(\'all\')">'
    + '<div class="kpi-label">Total Quotes</div>'
    + '<div class="kpi-val" style="color:#60a5fa;">'+TENDERS.length+'</div>'
    + '<div class="kpi-delta" style="color:var(--off3);">\u00a3'+fmtNum(totalVal)+' total quoted</div>'
    + '<div class="proj-stat-caret" style="color:#60a5fa;">View report \u203a</div>'
    + '</div>';

  html += '<div class="kpi proj-stat-kpi" style="--kc:#a3e635;cursor:pointer;" onclick="openTenderReport(\'won\')">'
    + '<div class="kpi-label">Won Quotes</div>'
    + '<div class="kpi-val" style="color:#a3e635;">'+won.length+'</div>'
    + '<div class="kpi-delta delta-up">\u2191 '+winRate+'% win rate</div>'
    + '<div class="proj-stat-caret" style="color:#a3e635;">View report \u203a</div>'
    + '</div>';

  html += '<div class="kpi proj-stat-kpi" style="--kc:#f87171;cursor:pointer;" onclick="openTenderReport(\'lost\')">'
    + '<div class="kpi-label">Lost Quotes</div>'
    + '<div class="kpi-val" style="color:#f87171;">'+lost.length+'</div>'
    + '<div class="kpi-delta delta-dn">\u2193 \u00a3'+fmtNum(lostVal)+' to competition</div>'
    + '<div class="proj-stat-caret" style="color:#f87171;">View report \u203a</div>'
    + '</div>';

  html += '<div class="kpi proj-stat-kpi" style="--kc:#f97316;cursor:pointer;" onclick="openTenderReport(\'pipeline\')">'
    + '<div class="kpi-label">Pipeline</div>'
    + '<div class="kpi-val" style="color:#f97316;">'+pipeline.length+'</div>'
    + '<div class="kpi-delta delta-up">\u2191 \u00a3'+fmtNum(openVal)+' in pipeline</div>'
    + '<div class="proj-stat-caret" style="color:#f97316;">View report \u203a</div>'
    + '</div>';

  html += '</div>';

  // KPI row (existing)
  html += '<div class="kpi-grid">'
    + kpiCard('Total quoted','£'+fmtNum(totalVal),TENDERS.length+' quotes total','up',{background:'var(--blue)'},null)
    + kpiCard('Won value','£'+fmtNum(wonVal),won.length+' won · avg £'+fmtNum(avgWon),'up',{background:'var(--lime)'},null)
    + kpiCard('Lost value','£'+fmtNum(lostVal),lost.length+' lost to competition','dn',{background:'var(--red)'},null)
    + kpiCard('Live pipeline','£'+fmtNum(openVal),(open.length+sub.length)+' active quotes','up',{background:'var(--orange)'},null)
    + '</div>';

  // ROI insight banner
  html += roiBanner('tenders', ICON.money,
    'You have £' + fmtNum(openVal) + ' in live pipeline',
    won.length + ' quotes won this year · ' + (100 - winRate) + '% of quotes are not converting — improving win rate by 10% adds £' + fmtNum(Math.round(openVal * 0.1)) + ' to your revenue'
  );

  // Win rate + summary row
  html += '<div style="display:grid;grid-template-columns:280px 1fr;gap:1rem;margin-bottom:1.2rem">';
  html += '<div class="qb-win-rate-card">'
    + '<div class="qb-win-dial"><canvas id="win-rate-dial" width="112" height="112"></canvas>'
    + '<div class="qb-win-rate-pct">'+winRate+'%</div>'
    + '</div>'
    + '<div class="qb-win-label">Win Rate</div>'
    + '<div style="font-family:var(--mono);font-size:.78rem;font-weight:700;color:var(--white);">'+won.length+' won of '+decided+' decided</div>'
    + '<div class="qb-win-sub">'+sub.length+' submitted &middot; '+open.length+' pricing</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:.3rem;justify-content:center;">'
    + '<span class="qb-pill qb-pill-won">'+won.length+' Won</span>'
    + '<span class="qb-pill qb-pill-lost">'+lost.length+' Lost</span>'
    + '<span class="qb-pill qb-pill-sub">'+sub.length+' Sub</span>'
    + '<span class="qb-pill qb-pill-open">'+open.length+' Open</span>'
    + '</div></div>';

  // Client frequency stats
  html += '<div class="card" style="margin-bottom:0"><div class="card-header"><span class="card-title">Client quote activity</span></div>';
  html += '<div class="qb-client-stats">';
  var clientQuoteMap = {};
  TENDERS.forEach(function(t){
    if (!t.client) return;
    if (!clientQuoteMap[t.client]) clientQuoteMap[t.client] = {won:0,lost:0,open:0,sub:0,totalVal:0,count:0,name:t.clientName};
    clientQuoteMap[t.client][t.status==='submitted'?'sub':t.status]++;
    clientQuoteMap[t.client].totalVal += t.value;
    clientQuoteMap[t.client].count++;
  });
  Object.keys(clientQuoteMap).slice(0,6).forEach(function(cid){
    var cs = clientQuoteMap[cid];
    var cl = CLIENTS.find(function(c){return c.id===cid;});
    var dec = cs.won + cs.lost;
    var wr = dec>0 ? Math.round(cs.won/dec*100) : null;
    html += '<div class="qb-client-stat-card" onclick="dashNav(\'clients\');setTimeout(function(){openClientDetail(\''+cid+'\')},120)">'
      + '<div class="qb-client-stat-head">'
      + '<div class="qb-client-stat-av" style="background:'+(cl?cl.color:'#8a9099')+'">'+(cl?cl.initials:cs.name.slice(0,2).toUpperCase())+'</div>'
      + '<span class="qb-client-stat-name">'+cs.name+'</span></div>'
      + '<div class="qb-client-stat-row"><span>Quotes</span><span class="qb-client-stat-val">'+cs.count+'</span></div>'
      + '<div class="qb-client-stat-row"><span>Total value</span><span class="qb-client-stat-val">£'+fmtNum(cs.totalVal)+'</span></div>'
      + '<div class="qb-client-stat-row"><span>Avg value</span><span class="qb-client-stat-val">£'+fmtNum(Math.round(cs.totalVal/cs.count))+'</span></div>'
      + (wr!==null ? '<div class="qb-client-stat-row"><span>Win rate</span><span class="qb-client-stat-val" style="color:'+(wr>=50?'var(--lime)':'var(--red)')+'">'+wr+'%</span></div>' : '')
      + '<div class="qb-status-pills">'
      + (cs.won?'<span class="qb-pill qb-pill-won">'+cs.won+' won</span>':'')
      + (cs.lost?'<span class="qb-pill qb-pill-lost">'+cs.lost+' lost</span>':'')
      + (cs.sub?'<span class="qb-pill qb-pill-sub">'+cs.sub+' sub</span>':'')
      + (cs.open?'<span class="qb-pill qb-pill-open">'+cs.open+' open</span>':'')
      + '</div></div>';
  });
  html += '</div></div>';
  html += '</div>'; // close grid

  // Filter bar + table
  html += '<div class="bar" style="margin-top:1rem">'
    + '<div class="search-box"><input placeholder="Search quotes…" oninput="filterTendersBy(this.value)" id="tender-search"/></div>'
    + '<select class="filter-select" onchange="renderTenders(this.value)">'
    + ['all','open','submitted','won','lost'].map(function(s){
        var labels={all:'All statuses',open:'Open / Pricing',submitted:'Submitted',won:'Won ✓',lost:'Lost ✗'};
        return '<option value="'+s+'"'+(s===filterStatus?' selected':'')+'>'+labels[s]+'</option>';
      }).join('')
    + '</select>'
    + '<button class="btn btn-dark btn-sm" onclick="exportCSV()">Export</button>'
    + '</div>';

  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead>'
    + '<tr><th>Ref</th><th>Quote / Scope</th><th>Client</th><th>Value</th><th>Margin</th><th>Status</th><th>Enquiry</th><th>Decision</th><th></th></tr>'
    + '</thead><tbody>';

  html += filtered.map(function(t){
    var isWon = t.status==='won';
    var linkedProj = t.linkedProjectId ? PROJECTS.find(function(p){return p.id===t.linkedProjectId;}) : null;
    return '<tr>'
      +'<td class="mono" style="font-size:.68rem">'+t.ref+'</td>'
      +'<td class="strong" style="max-width:220px">'+t.name+(t.lineItems?' <span style="display:inline-flex;align-items:center;gap:.2rem;padding:.1rem .4rem;border-radius:3px;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);font-family:var(--mono);font-size:.5rem;color:var(--orange);font-weight:600;vertical-align:middle;letter-spacing:.04em" title="AI-extracted · '+(t.aiMetadata?t.aiMetadata.avgConfidence:0)+'% confidence">\uD83E\uDDE0 AI</span>':'')+(linkedProj?'<br><span style="font-size:.65rem;color:var(--lime);font-family:var(--mono)">\u2192 '+linkedProj.code+'</span>':'')+'</td>'
      +'<td>'+t.clientName+'</td>'
      +'<td class="mono">£'+fmtNum(t.value)+'</td>'
      +'<td class="mono">'+(t.margin?t.margin+'%':'—')+'</td>'
      +'<td>'+badge(t.status)+'</td>'
      +'<td class="mono">'+fmtDate(t.enquiry)+'</td>'
      +'<td class="mono">'+(t.decision?fmtDate(t.decision):'—')+'</td>'
      +'<td style="white-space:nowrap">'
      +'<button class="btn btn-xs" style="background:rgba(96,165,250,.07);color:var(--blue);border:1px solid rgba(96,165,250,.2);" onclick="openTenderDetailView(\''+t.id+'\')">'+ICON.file+' View</button> '
      +'<button class="btn btn-dark btn-xs" onclick="openTenderModal(\''+t.id+'\')">Edit</button>'
      +(isWon && !t.linkedProjectId ? ' <button class="btn btn-xs" style="background:rgba(163,230,53,.08);color:var(--lime);border:1px solid rgba(163,230,53,.2)" onclick="quickWonToProject(\''+t.id+'\')">+ Project</button>' : '')
      +'</td></tr>';
  }).join('');

  if (!filtered.length) html += '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--off4)">No quotes found.</td></tr>';
  html += '</tbody></table></div></div>';
  document.getElementById('dash-content').innerHTML = html;

  // Draw win-rate dial
  requestAnimationFrame(function(){
    var canvas = document.getElementById('win-rate-dial');
    if (!canvas||!canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio||1;
    var sz = 112;
    canvas.width = sz * dpr; canvas.height = sz * dpr;
    canvas.style.width = sz+'px'; canvas.style.height = sz+'px';
    ctx.scale(dpr, dpr);
    var cx=sz/2, cy=sz/2, r=42, lw=8;
    ctx.clearRect(0,0,sz,sz);
    /* track circle */
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.07)'; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.stroke();
    /* fill arc — start from top (-π/2) */
    var fillColor = winRate>=60?'#a3e635':winRate>=40?'#f97316':'#f87171';
    var endAngle = -Math.PI/2 + (winRate/100)*Math.PI*2;
    ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2, endAngle);
    ctx.strokeStyle = fillColor; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.stroke();
    /* inner glow dot at end of arc */
    if (winRate > 2) {
      var ex = cx + r*Math.cos(endAngle), ey = cy + r*Math.sin(endAngle);
      ctx.beginPath(); ctx.arc(ex,ey,lw/2-1,0,Math.PI*2);
      ctx.fillStyle=fillColor; ctx.fill();
    }
  });
}

/* ── Quote report modal ─────────────────────────────────────── */
function openTenderReport(category) {
  var titles = {
    all:      'All Quotes Report',
    won:      'Won Quotes Report',
    lost:     'Lost Quotes Report',
    pipeline: 'Pipeline Quotes Report'
  };
  var colours = {
    all:      'rgba(96,165,250,',
    won:      'rgba(163,230,53,',
    lost:     'rgba(248,113,113,',
    pipeline: 'rgba(249,115,22,'
  };

  var list = category==='pipeline'
    ? TENDERS.filter(function(t){return t.status==='open'||t.status==='submitted';})
    : category==='all' ? TENDERS
    : TENDERS.filter(function(t){return t.status===category;});

  var col      = colours[category]||'rgba(96,165,250,';
  var totalVal = list.reduce(function(s,t){return s+t.value;},0);
  var avgVal   = list.length ? Math.round(totalVal/list.length) : 0;
  var avgMgn   = list.length ? Math.round(list.reduce(function(s,t){return s+(t.margin||0);},0)/list.length) : 0;

  var wonAll  = TENDERS.filter(function(t){return t.status==='won';});
  var decided = wonAll.length + TENDERS.filter(function(t){return t.status==='lost';}).length;
  var winRate = decided>0 ? Math.round(wonAll.length/decided*100) : 0;

  /* Summary stats */
  var body = '';
  body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1.5rem">';
  body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Quotes</div><div class="kpi-val">'+list.length+'</div></div>';
  body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Total Value</div><div class="kpi-val">£'+fmtNum(totalVal)+'</div></div>';
  if (category==='won') {
    body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Win Rate</div><div class="kpi-val">'+winRate+'%</div></div>';
  } else {
    body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Avg Value</div><div class="kpi-val">£'+fmtNum(avgVal)+'</div></div>';
  }
  body += '</div>';

  /* Chart row — fixed-height wrappers prevent Chart.js resize loop */
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">';

  body += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">';
  body += '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.65rem">Quote Value by Ref</div>';
  body += '<div style="position:relative;height:220px;width:100%"><canvas id="tdrpt-bar"></canvas></div>';
  body += '</div>';

  body += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">';
  body += '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.65rem">Split by Client</div>';
  body += '<div style="position:relative;height:220px;width:100%"><canvas id="tdrpt-pie"></canvas></div>';
  body += '</div>';

  body += '</div>';

  /* Table */
  body += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead><tr>'
    +'<th>Ref</th><th>Quote / Scope</th><th>Client</th><th>Value</th><th>Margin</th><th>Status</th><th>Decision</th>'
    +'</tr></thead><tbody>';

  if (list.length) {
    list.forEach(function(t){
      body += '<tr>'
        +'<td class="mono" style="font-size:.68rem">'+t.ref+'</td>'
        +'<td class="strong" style="cursor:pointer;max-width:200px" onclick="closeModal(\'modal-tender-report\');setTimeout(function(){openTenderModal(\''+t.id+'\')},80)">'+t.name+'</td>'
        +'<td>'+t.clientName+'</td>'
        +'<td class="mono">£'+fmtNum(t.value)+'</td>'
        +'<td class="mono">'+(t.margin?t.margin+'%':'—')+'</td>'
        +'<td>'+badge(t.status)+'</td>'
        +'<td class="mono">'+(t.decision?fmtDate(t.decision):'—')+'</td>'
        +'</tr>';
    });
  } else {
    body += '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--off4)">No quotes in this category.</td></tr>';
  }
  body += '</tbody></table></div></div>';

  document.getElementById('tender-report-title').textContent = titles[category]||'Quotes Report';
  document.getElementById('tender-report-body').innerHTML = body;
  document.getElementById('tender-report-export').setAttribute('data-cat', category);
  openModal('modal-tender-report');

  /* Draw charts after modal opens */
  setTimeout(function(){
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = 'rgba(255,255,255,.55)';

    /* Destroy any existing instances */
    ['tdrpt-bar','tdrpt-pie'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) { var ex = Chart.getChart(el); if (ex) ex.destroy(); }
    });

    var PALETTE = [
      col+'0.75)',col+'0.55)',col+'0.45)',col+'0.35)',col+'0.65)',col+'0.85)',col+'0.25)'
    ];

    /* Bar chart — value by quote ref */
    var barEl = document.getElementById('tdrpt-bar');
    if (barEl && list.length) {
      new Chart(barEl, {
        type: 'bar',
        data: {
          labels: list.map(function(t){ return t.ref.replace('QTE-2026-','Q'); }),
          datasets: [{
            label: 'Quote Value (£)',
            data: list.map(function(t){ return t.value; }),
            backgroundColor: list.map(function(_,i){ return PALETTE[i%PALETTE.length]; }),
            borderColor:     list.map(function(_,i){ return PALETTE[i%PALETTE.length].replace(/[\d.]+\)$/,'1)'); }),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { font: { family: 'IBM Plex Mono', size: 9 } } },
            y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: {
              font: { family: 'IBM Plex Mono', size: 9 },
              callback: function(v){ return '£'+fmtNum(v); }
            }}
          }
        }
      });
    }

    /* Doughnut — by client */
    var pieEl = document.getElementById('tdrpt-pie');
    if (pieEl && list.length) {
      var byClient = {};
      list.forEach(function(t){ byClient[t.clientName] = (byClient[t.clientName]||0) + t.value; });
      var clients = Object.keys(byClient);
      var PIE = ['rgba(249,115,22,.8)','rgba(163,230,53,.8)','rgba(96,165,250,.8)',
                 'rgba(251,191,36,.8)','rgba(167,139,250,.8)','rgba(248,113,113,.8)','rgba(52,211,153,.8)'];
      new Chart(pieEl, {
        type: 'doughnut',
        data: {
          labels: clients,
          datasets: [{
            data: clients.map(function(c){ return byClient[c]; }),
            backgroundColor: clients.map(function(_,i){ return PIE[i%PIE.length]; }),
            borderColor: 'rgba(25,28,32,1)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: { family: 'IBM Plex Mono', size: 9 }, boxWidth: 10, padding: 8 } },
            tooltip: { callbacks: { label: function(ctx){ return ' £'+fmtNum(ctx.raw); } } }
          }
        }
      });
    }
  }, 80);
}

/* ── Tender report CSV export ───────────────────────────────── */
function exportTenderReportCSV(category) {
  var list = category==='pipeline'
    ? TENDERS.filter(function(t){return t.status==='open'||t.status==='submitted';})
    : category==='all' ? TENDERS
    : TENDERS.filter(function(t){return t.status===category;});
  var rows = [['Ref','Quote / Scope','Client','Value','Margin%','Status','Enquiry','Decision']];
  list.forEach(function(t){
    rows.push([t.ref, t.name, t.clientName, t.value, t.margin||'', t.status, t.enquiry||'', t.decision||'']);
  });
  var csv = rows.map(function(r){ return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download = 'contraq-quotes-'+category+'.csv';
  a.click();
}



/* ══════════════════════════════════════════════════════════════
   QUOTE BOOK — UPLOAD & AI ANALYSIS
══════════════════════════════════════════════════════════════ */

/* ── File selection & drop ──────────────────────────────────── */
/* ── Multi-file upload state ────────────────────────────────── */
var _qbFiles = [];
var _qbDocTypes = {pdf:'Specification',xlsx:'BoQ Schedule',xls:'BoQ Schedule',dwg:'Drawing'};

function qbFilesSelected(input) {
  if (!input.files) return;
  for (var i = 0; i < input.files.length; i++) _qbAddFile(input.files[i]);
  input.value = '';
}

function qbHandleDrop(event) {
  event.preventDefault();
  document.getElementById('qb-dropzone').classList.remove('drag-active');
  if (!event.dataTransfer || !event.dataTransfer.files) return;
  for (var i = 0; i < event.dataTransfer.files.length; i++) {
    var f = event.dataTransfer.files[i];
    if (/\.(xlsx|xls|pdf|dwg)$/i.test(f.name)) _qbAddFile(f);
    else showToast('Unsupported file type: ' + f.name, 'error');
  }
}

function _qbAddFile(file) {
  var ext = (file.name.split('.').pop()||'').toLowerCase();
  _qbFiles.push({name:file.name,size:file.size,ext:ext,type:_qbDocTypes[ext]||'Document',_raw:file});
  _qbRenderFileList();
}

function _qbRemoveFile(idx) {
  _qbFiles.splice(idx,1);
  _qbRenderFileList();
}

function _qbRenderFileList() {
  var list = document.getElementById('qb-file-list');
  var sum = document.getElementById('qb-file-summary');
  var btn = document.getElementById('qb-analyse-btn');
  var icons = {pdf:'\uD83D\uDCC4',xlsx:'\uD83D\uDCCA',xls:'\uD83D\uDCCA',dwg:'\uD83D\uDCD0'};
  list.innerHTML = _qbFiles.map(function(f,i){
    return '<div class="ai-file-tag">'
      + '<span class="ai-ft-icon">'+(icons[f.ext]||'\uD83D\uDCC4')+'</span>'
      + '<span class="ai-ft-name">'+f.name+'</span>'
      + '<span class="ai-ft-type">'+f.type+'</span>'
      + '<span class="ai-ft-remove" onclick="_qbRemoveFile('+i+')">\u00D7</span>'
      + '</div>';
  }).join('');
  if (_qbFiles.length > 0) {
    sum.style.display = '';
    sum.textContent = _qbFiles.length + ' document' + (_qbFiles.length>1?'s':'') + ' ready for analysis';
    btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
  } else {
    sum.style.display = 'none';
    btn.disabled = true; btn.style.opacity = '.4'; btn.style.cursor = 'default';
  }
}

/* ── AI Extraction Data (populated by Claude API) ────────── */
var AI_EXTRACTION_DATA = [];

var _QB_DEMO_DATA = [
  {ref:'Y10/310',service:'54mm OD copper pipework, LTHW flow',unit_equip:'AHU-01',desc:'54mm copper tube Type X, LTHW flow — plant room to riser R1',qty:86,unit:'lin.m',rate:38.50,hist:37.20,histRange:'in-range',conf:92,level:'high',flags:['Drawing scale: 1:50@A1','Status: NEW','Location: B2 Plant Room','Takeoff: centreline measurement'],assumptions:[],src:'Dwg M-201 Rev P03',srcPage:3,drawingScale:'1:50',serviceStatus:'new'},
  {ref:'Y20/410',service:'600x400mm galvanised rectangular supply ductwork',unit_equip:'AHU-01',desc:'600x400mm galv rect supply duct — Level 3 ceiling void to diffusers',qty:47,unit:'lin.m',rate:68.00,hist:65.00,histRange:'in-range',conf:88,level:'high',flags:['Drawing scale: 1:50@A1','Status: NEW','Location: L3 Office Zone','Ductwork: centreline only'],assumptions:[],src:'Dwg M-301 Rev P02',srcPage:5,drawingScale:'1:50',serviceStatus:'new'},
  {ref:'Y50/110',service:'50mm Rockwool RWA45 pipe insulation',unit_equip:'General',desc:'50mm Rockwool RWA45 pipe insulation — LTHW pipework, plant room B2',qty:342,unit:'lin.m',rate:12.40,hist:12.10,histRange:'in-range',conf:85,level:'high',flags:['Exact NBS match: Y50/110','Qty from structured BoQ','Price book match: \u00A312.40/m'],assumptions:[{param:'Insulation thickness',source:'BS 5422 Table 2 — general commercial default for LTHW pipework',flag:'Spec may require enhanced thermal performance — verify Section M10'}],src:'Spec Rev D, p.14',srcPage:14,drawingScale:'',serviceStatus:'new'},
  {ref:'E20/510',service:'4-core 6mm\u00B2 SWA cable',unit_equip:'DB-L3',desc:'4c 6mm\u00B2 SWA/LSF cable — distribution board L3 to FCU circuits',qty:215,unit:'lin.m',rate:8.90,hist:8.50,histRange:'in-range',conf:82,level:'high',flags:['Drawing scale: 1:100','Status: NEW','Location: L3 Riser to ceiling void','Cable size from schedule'],assumptions:[],src:'Dwg E-101 Rev P02',srcPage:8,drawingScale:'1:100',serviceStatus:'new'},
  {ref:'Y50/115',service:'25mm Armaflex Class O insulation',unit_equip:'General',desc:'25mm Armaflex Class O closed-cell insulation — CHW pipework risers',qty:186,unit:'lin.m',rate:9.80,hist:9.60,histRange:'in-range',conf:88,level:'high',flags:['Exact NBS match: Y50/115','Qty from pipe schedule','Price book match: \u00A39.80/m'],assumptions:[],src:'Spec Rev D, p.16',srcPage:16,drawingScale:'',serviceStatus:'new'},
  {ref:'Y10/320',service:'28mm copper tube, CHW return',unit_equip:'FCU-3A',desc:'28mm copper tube Type X, CHW return — FCU-3A to riser R2',qty:34,unit:'lin.m',rate:22.80,hist:0,histRange:'none',conf:62,level:'med',flags:['Status: NEW','Location: L3 East Wing','Pipe size inferred from BSRIA flow rates'],assumptions:[{param:'Pipe diameter',source:'BSRIA BG 85/2024 — CHW flow rate table, 0.15 l/s at 1.5 m/s velocity',flag:'Pipe size estimated from cooling load — verify against mechanical schedule'},{param:'Pipe material',source:'BSRIA BG 85 commercial default — copper Type X for CHW < 54mm',flag:'Spec may specify press-fit or plastic — check Section Y10'}],src:'Dwg M-202 Rev P01',srcPage:4,drawingScale:'1:50',serviceStatus:'new'},
  {ref:'Y23/420',service:'250mm\u00d8 circular extract ductwork',unit_equip:'MHRV 1',desc:'250mm\u00d8 spiral galv circular extract duct — kitchen extract to roof terminal',qty:18,unit:'lin.m',rate:42.00,hist:40.00,histRange:'in-range',conf:58,level:'med',flags:['Status: NEW','Location: GF Kitchen','Ductwork: centreline only','Qty estimated from routing'],assumptions:[{param:'Duct length',source:'Routing estimation from floor plan — centreline trace with \u00b115% tolerance',flag:'Length estimated from routing — verify on site or from isometric drawing'},{param:'Material gauge',source:'BSRIA BG 85 default — 0.7mm galvanised for 250mm\u00d8 extract',flag:'Spec may require heavier gauge for kitchen grease extract — check Section Y23'}],src:'Dwg M-310 Rev P01',srcPage:6,drawingScale:'1:50',serviceStatus:'new'},
  {ref:'P12/610',service:'Fire stopping to penetrations',unit_equip:'General',desc:'Fire stopping to M&E penetrations — 1hr fire-rated walls, Levels 1\u20134',qty:86,unit:'nr',rate:34.00,hist:31.00,histRange:'near',conf:52,level:'med',flags:['Partial NBS match: P12 section','Qty inferred from fire strategy drawing'],assumptions:[{param:'Penetration count',source:'Fire strategy drawing — counted visible penetration markers',flag:'Count may increase after detailed builders work survey — verify with fire engineer'},{param:'Fire rating',source:'Drawing annotation — 1 hour FRL assumed for all',flag:'Some walls may be 2hr rated — cross-check fire strategy report'}],src:'Dwg A-FS-01',srcPage:0,drawingScale:'1:100',serviceStatus:'new'},
  {ref:'Y50/150',service:'Trace heating with insulation overwrap',unit_equip:'General',desc:'Trace heating cables with insulation overwrap — external condensate pipework',qty:45,unit:'lin.m',rate:28.50,hist:0,histRange:'none',conf:48,level:'med',flags:['Fuzzy spec match','Qty from text: "approx. 45m"','No price book match; AI-estimated rate'],assumptions:[{param:'Heating cable wattage',source:'BSRIA BG 85 default — 10W/m for frost protection on \u226435mm condensate',flag:'Wattage depends on ambient conditions and pipe diameter — verify with manufacturer'},{param:'Rate',source:'AI estimate from UK 2025/26 market rates — no Price Book match available',flag:'Rate is indicative only — obtain supplier quotation'}],src:'Spec Rev D, p.31',srcPage:31,drawingScale:'',serviceStatus:'new'},
  {ref:'Y25/430',service:'Ductwork — size and type unclear',unit_equip:'Unknown',desc:'Ductwork run — annotation illegible, routing uncertain',qty:0,unit:'TBC',rate:0,hist:0,histRange:'none',conf:22,level:'low',flags:['Annotation illegible on scan','Cannot determine size, material or system type','Qty marked as TBC — site measure required'],assumptions:[{param:'Duct size',source:'Could not be determined — annotation text overlaps service line on drawing',flag:'REQUIRES MANUAL VERIFICATION — open source drawing Dwg M-305 p.7'},{param:'Duct type',source:'Unknown — no legend match for this colour/line style combination',flag:'May be existing ductwork misclassified as new — verify on site'}],src:'Dwg M-305 Rev P01',srcPage:7,drawingScale:'1:50',serviceStatus:'unclear'},
  {ref:'Y10/?',service:'Pipework — spec conflict',unit_equip:'General',desc:'Pipework insulation — cold store ceiling void — spec vs drawing conflict',qty:320,unit:'m\u00B2',rate:22.00,hist:15.40,histRange:'outlier',conf:35,level:'low',flags:['Spec conflict: Drawing says 60mm, schedule says 100mm','Qty from free text (estimated)','Rate >30% above historical median'],assumptions:[{param:'Insulation thickness',source:'CONFLICT — Drawing annotation: 60mm, Equipment schedule: 100mm',flag:'SPEC CONFLICT — document precedence unclear. Issue RFI to consultant before pricing'},{param:'Rate',source:'AI estimate at higher thickness (100mm) — \u00A322.00/m\u00B2',flag:'Rate based on 100mm assumption — if 60mm applies, rate drops to ~\u00A315.40/m\u00B2'}],src:'Spec Rev D, p.42 / Dwg M-415',srcPage:42,drawingScale:'',serviceStatus:'new'},
];

var _qbReviewState = {};

/* ── Helper: read a File as base64 ────────────────────────── */
function _qbReadFileAsBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() {
      var b64 = reader.result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = function() { reject(new Error('Failed to read ' + file.name)); };
    reader.readAsDataURL(file);
  });
}

/* ── Build dynamic system prompt with Price Book context ──── */
function _qbBuildSystemPrompt() {
  var pbItems = MATERIALS_PRICE_BOOK.map(function(m) {
    return '  - ' + m.id + ': ' + m.name + ' | ' + m.category + ' | ' + m.unit + ' @ \u00a3' + m.supplierPrice.toFixed(2) + '/'+m.unit + (m.supplier ? ' (' + m.supplier + ')' : '');
  }).join('\n');
  var hasPriceBook = MATERIALS_PRICE_BOOK.length > 0;

  /* Serialise CIBSE colour reference for the AI to use */
  var cibseDuct = Object.keys(CIBSE_SYMBOLS_REF.ductwork_colours).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.ductwork_colours[k]; }).join('\n');
  var cibsePipe = Object.keys(CIBSE_SYMBOLS_REF.pipework_colours).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.pipework_colours[k]; }).join('\n');
  var cibseElec = Object.keys(CIBSE_SYMBOLS_REF.electrical_colours).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.electrical_colours[k]; }).join('\n');
  var cibseRules = CIBSE_SYMBOLS_REF.key_rules.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var cibseVent = Object.keys(CIBSE_SYMBOLS_REF.ventilation_symbols).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.ventilation_symbols[k]; }).join('\n');
  var cibsePipeAcc = Object.keys(CIBSE_SYMBOLS_REF.pipework_accessories).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.pipework_accessories[k]; }).join('\n');
  var pipeLayouts = 'Closed Loop (LTHW/ChW): ' + CIBSE_SYMBOLS_REF.pipework_layout_patterns.closed_loop
    + '\nChilled Water: ' + CIBSE_SYMBOLS_REF.pipework_layout_patterns.chilled_water
    + '\nLTHW Heating: ' + CIBSE_SYMBOLS_REF.pipework_layout_patterns.lthw_heating
    + '\nDHW Domestic: ' + CIBSE_SYMBOLS_REF.pipework_layout_patterns.dhw_domestic
    + '\nFire Sprinkler: ' + CIBSE_SYMBOLS_REF.pipework_layout_patterns.fire_sprinkler;
  var pipeCount = CIBSE_SYMBOLS_REF.pipework_layout_patterns.what_to_count.map(function(r){ return '  \u2713 ' + r; }).join('\n');
  var pipeIgnore = CIBSE_SYMBOLS_REF.pipework_layout_patterns.what_NOT_to_count.map(function(r){ return '  \u2717 ' + r; }).join('\n');
  var pipeMeasure = CIBSE_SYMBOLS_REF.pipework_layout_patterns.measurement_rules.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var isoErrors = CIBSE_SYMBOLS_REF.isometric_recognition.error_prone_elements.map(function(r){ return '  \u26A0 ' + r; }).join('\n');
  var wermacRules = CIBSE_SYMBOLS_REF.wermac_isometrics.fundamental_rules.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var wermacNoMeasure = CIBSE_SYMBOLS_REF.wermac_isometrics.what_NOT_to_measure.map(function(r){ return '  \u2717 ' + r; }).join('\n');
  var isoTranslation = CIBSE_SYMBOLS_REF.isometric_recognition.plan_to_iso_translation.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var archSymbols = Object.keys(CIBSE_SYMBOLS_REF.archtoolbox_hvac.supply_return_symbols).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.archtoolbox_hvac.supply_return_symbols[k]; }).join('\n');
  var archDampers = Object.keys(CIBSE_SYMBOLS_REF.archtoolbox_hvac.damper_symbols).map(function(k){ return '  ' + k + ': ' + CIBSE_SYMBOLS_REF.archtoolbox_hvac.damper_symbols[k]; }).join('\n');
  var archNotes = CIBSE_SYMBOLS_REF.archtoolbox_hvac.key_recognition_notes.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var wendesPrinciples = CIBSE_SYMBOLS_REF.wendes_estimating.takeoff_principles.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var wendesErrors = CIBSE_SYMBOLS_REF.wendes_estimating.common_estimating_errors.map(function(r){ return '  \u26A0 ' + r; }).join('\n');
  var wendesAiChecks = CIBSE_SYMBOLS_REF.wendes_estimating.ai_estimating_checks.map(function(r){ return '  \u2713 ' + r; }).join('\n');
  var ocrSegments = CIBSE_SYMBOLS_REF.blueprint_ocr.image_segmentation_for_mep.segments.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var ocrDistinguish = Object.keys(CIBSE_SYMBOLS_REF.blueprint_ocr.what_ai_vision_should_distinguish).map(function(k){ var v = CIBSE_SYMBOLS_REF.blueprint_ocr.what_ai_vision_should_distinguish[k]; return '  ' + k.replace(/_/g,' ').toUpperCase() + ': ' + v; }).join('\n');
  var ocrCalibration = CIBSE_SYMBOLS_REF.ai_ocr_calibration.calibration_for_mep_drawings.map(function(r){ return '  \u2022 ' + r; }).join('\n');
  var ocrContext = CIBSE_SYMBOLS_REF.ai_ocr_calibration.context_analysis_for_mep.map(function(r){ return '  \u2022 ' + r; }).join('\n');

  return 'You are an expert High-Accuracy M&E AI Quote Builder inside Contraq. Your mission: EXTREME PRECISION identifying and quantifying ONLY relevant NEW M&E services from PDF drawings. Prioritise legend-driven accuracy, reassessed conservatism, ZERO over-quantification.\n\n'

  /* ── STEP 1: SELF-CHECK & REASSESSMENT ─────────────────── */
  + '## STEP 1 \u2014 KNOWLEDGE CROSS-CHECK & TECHNIQUE REASSESSMENT\n\n'
  + 'Before analysing any drawing:\n'
  + '1. Cross-check M&E knowledge against CIBSE symbols, line types, colours, abbreviations, hatches.\n'
  + '2. REASSESS techniques. Ask: Am I only counting physical relevant runs? Am I distinguishing new/coloured from grey/existing? Am I conservative?\n'
  + '3. Ductwork reassessment:\n'
  + '   - Fresh air intake: Coloured, LIMITED length (~3m typical). Never inflate by miscounting dimension lines.\n'
  + '   - Spiral/circular duct: Thick outer lines with faded centreline. Only quantify if centreline confirms duct, not leader/annotation.\n'
  + '   - Supply/extract: Follow legend colours. Centreline only. Never double-count parallel walls.\n'
  + '4. Pipework: Distinguish flow/return via colours/line styles per legend.\n'
  + '5. Note gaps and how Step 2 research fills them.\n\n'

  /* ── STEP 2: RECOGNITION RESEARCH ──────────────────────── */
  + '## STEP 2 \u2014 VISUAL RECOGNITION CALIBRATION (from Blueprint OCR Development Guide)\n\n'
  + '### Image Segmentation for M&E Drawings\n'
  + 'Before measuring anything, mentally segment the drawing into categories:\n'
  + ocrSegments + '\n\n'
  + '### What AI Vision Should Distinguish\n'
  + ocrDistinguish + '\n\n'
  + 'KEY PRINCIPLE: The segmentation step (separating physical services from text, dimensions, symbols, and background) is the FOUNDATION of accurate extraction. If you get this wrong, everything downstream is wrong.\n\n'
  + '### MEP Drawing Calibration (from AI OCR Engineering Drawings Guide)\n'
  + ocrCalibration + '\n\n'
  + '### Context Analysis for MEP Recognition\n'
  + ocrContext + '\n\n'
  + '### Recognition Calibration (from PaddleOCR PP-OCRv5 Fine-Tuning Guide)\n'
  + 'When reading text/annotations from M&E drawings, expect these patterns:\n'
  + '  \u2022 Duct sizes: "NNNmm\u00d8" (circular) or "NNN\u00d7NNN" or "NNN\u00d7NNNmm" (rectangular). The \u00d8 symbol is critical.\n'
  + '  \u2022 Pipe sizes: "NNmm", "NNmm\u00d8", "DNNN" (DN=nominal diameter). Smaller numbers than ducts.\n'
  + '  \u2022 Equipment labels: "AHU-01", "MHRV 1", "FCU-3A", "VCD", "FD", "SG-07". Alphanumeric with hyphens.\n'
  + '  \u2022 System abbreviations: "SA", "EA", "IA", "DA", "LTHW_F", "ChW_R". Uppercase with underscores.\n'
  + '  \u2022 Drawing references: "C1799/00/DR/MX/57001", "Rev P01". Alphanumeric with slashes.\n'
  + '  \u2022 Scale notations: "1:50@A1", "NTS", "DO NOT SCALE". Always in title block.\n'
  + '  \u2022 Flow/pressure: "150 l/s", "250 Pa", "3.5 m/s". Numbers with unit suffixes.\n'
  + 'CHARACTER SET to expect: 0-9 A-Z a-z \u00d8 \u00d7 / - _ . : \u00b2 \u00b3 \u00b0 ( ) [ ] @ # \u00a3 % & + = space\n'
  + 'ACCURACY NOTE: Rotated annotations (following duct/pipe direction) and the \u00d8 symbol are the most commonly misread. When a size annotation seems wrong, check if \u00d8 was misread as O or 0, or if digits were confused.\n\n'
  + '### Dual-Pass Analysis Strategy (from Keras-OCR Engineering Drawings Guide)\n'
  + 'When analysing M&E drawings, mentally perform TWO separate passes:\n'
  + '  PASS 1 \u2014 SERVICE LINES: Trace duct/pipe runs with lines intact. Identify equipment symbols. Detect system colours. This is the GEOMETRIC pass.\n'
  + '  PASS 2 \u2014 TEXT EXTRACTION: Mentally "remove" the lines and focus on reading text annotations cleanly. Associate each annotation with its nearest service from Pass 1.\n'
  + '  MERGE: Size labels belong to the nearest service line. Equipment tags belong to the nearest equipment symbol. Room labels belong to the space they occupy.\n'
  + 'Preprocessing awareness: Small annotations near busy line junctions are the hardest to read. If a size annotation is unclear, cross-reference with equipment schedules or similar annotations on the same service type elsewhere on the drawing.\n'
  + 'Line interference: Where text sits directly ON a service line, the text is the annotation and the line is the service. Read the text; measure the line. They are two different things.\n\n'

  + '## CIBSE RECOGNITION REFERENCE (from cibse.org Standard Symbols \u2014 Systems PDF)\n\n'
  + '### Ductwork Colours (CIBSE Standard: black outline, colour FILL)\n'
  + cibseDuct + '\n\n'
  + '### Pipework Colours (CIBSE Standard: COLOURED outline + fill)\n'
  + cibsePipe + '\n\n'
  + '### Electrical Containment (black outline, colour fill)\n'
  + cibseElec + '\n\n'
  + '### Key CIBSE Rules\n'
  + cibseRules + '\n\n'
  + '### Ventilation Symbol Recognition (from CIBSE Drawing Symbols Library)\n'
  + cibseVent + '\n\n'
  + '### Pipework Accessory Symbols (from CIBSE Pipework Accessories package)\n'
  + cibsePipeAcc + '\n\n'
  + '### Pipework Layout Patterns (from Pipe Flow Expert reference systems)\n'
  + pipeLayouts + '\n\n'
  + '### Pipework: What to Count vs Ignore\n'
  + 'COUNT these:\n' + pipeCount + '\n'
  + 'DO NOT COUNT these:\n' + pipeIgnore + '\n\n'
  + '### Pipework Measurement Rules\n'
  + pipeMeasure + '\n\n'
  + '### Isometric View Recognition (from Pipe Flow Expert reference systems)\n'
  + 'Isometric views show 3D pipe/duct routing on a 30\u00b0 grid. Common for plant rooms, risers, complex routing.\n'
  + 'Plan-to-Isometric Translation:\n'
  + isoTranslation + '\n\n'
  + 'ERROR-PRONE ELEMENTS in Isometrics (avoid these mistakes):\n'
  + isoErrors + '\n\n'
  + '### Isometric Fundamentals (from Wermac Piping Isometrics Guide)\n'
  + wermacRules + '\n'
  + 'KEY: Isometric pipes are SINGLE centreline. Orthographic pipes are DOUBLE-LINE (walls). When reading isometrics, one line = one pipe. Line breaks = pipe crossing behind another (NOT a disconnection). Hatches = direction indicators (NOT fittings).\n'
  + 'DO NOT MEASURE from isometric views:\n'
  + wermacNoMeasure + '\n\n'
  + '### HVAC Plan Symbol Recognition (from Archtoolbox)\n'
  + 'Supply/Return Terminal Symbols:\n'
  + archSymbols + '\n\n'
  + 'Damper Symbols:\n'
  + archDampers + '\n\n'
  + 'Key Recognition Notes:\n'
  + archNotes + '\n\n'
  + 'NOTE: Project-specific legends OVERRIDE these CIBSE/Archtoolbox standards. Always check the drawing legend first.\n\n'
  + '### Mechanical Estimating Methodology (from Wendes Estimating Manual)\n'
  + 'Takeoff Principles:\n'
  + wendesPrinciples + '\n\n'
  + 'Ductwork Labour Methods:\n'
  + '  Hours/Piece: Most accurate. Per-piece labour for each duct type/size.\n'
  + '  Hours/Pound: Galv LP duct \u2248 44 lbs/hr fab (0.023 hrs/lb). Quick cross-check.\n'
  + '  Hours/SF: 24ga galv = 38 SF/hr fab, 22 SF/hr install. Convert via 1.156 lbs/SF.\n'
  + '  Fittings: 25% typical ratio. 15-20% for straight runs, 30-35% for complex plant rooms.\n'
  + '  Waste: Add 20% to duct surface area for hangers, cleats, hardware, waste, seams.\n\n'
  + 'Insulation Estimating:\n'
  + '  Duct external wrap: m\u00b2 surface area + 15% waste (pins, tape, laps). Add 20% for overlaps/cut pieces.\n'
  + '  Pipe insulation: lin.m by size + fittings as nr or % allowance. Add 10-15% waste.\n\n'
  + 'Piping Estimating:\n'
  + '  Measure lin.m centre-to-centre. Count fittings individually or add 15-20%. Supports every 1.5-3m.\n\n'
  + 'Common Errors to Avoid:\n'
  + wendesErrors + '\n\n'
  + 'AI Estimating Quality Checks:\n'
  + wendesAiChecks + '\n\n'
  + 'BoQ Structure: Location \u2192 Unit/Equipment \u2192 System \u2192 Item \u2192 Size \u2192 Qty \u2192 Unit \u2192 Rate \u2192 Total.\n'
  + 'Cross-checks: Total duct m\u00b2 \u2248 insulation m\u00b2. Equipment count \u2248 connection count. Floor area vs coverage ratio.\n\n'

  /* ── STEP 3: STRICT ID, FILTERING & LEGEND ─────────────── */
  + '## STEP 3 \u2014 STRICT IDENTIFICATION, FILTERING & LEGEND RULE\n\n'

  + '### THE LEGEND RULE (absolute priority)\n'
  + 'ALWAYS extract the project Legend, Symbol Key, Abbreviations, Notes, Schedules from every sheet FIRST. This overrides all general standards. If the legend defines a symbol differently, the legend wins. Cross-reference EVERY element against the legend.\n\n'

  + '### Two-Pass Verification\n'
  + 'Pass 1: Classify every element as M&E service or "ignore".\n'
  + 'Pass 2: Confirm each classified element against legend/CIBSE. If uncertain: flag "Requires clarification", conf=low. NEVER guess.\n\n'

  + '### STRICTLY IGNORE\n'
  + 'Architectural (walls, doors, furniture), structural (beams, columns), drawing artefacts (dimension lines/arrows/leaders, text annotations, grid lines, section markers, north arrows, title block graphics, revision clouds), non-M&E items, EXISTING/DEMOLITION (grey/faded/dashed-grey).\n\n'

  + '### Ductwork Safeguards\n'
  + '\u2022 NEVER count dimension lines, arrows, leaders, centre-lines, text, hatching as length.\n'
  + '\u2022 Double-line duct = ONE duct, centreline ONCE.\n'
  + '\u2022 Spiral: centreline confirmation required.\n'
  + '\u2022 Fresh air: coloured segments only, expect ~3m.\n'
  + '\u2022 Flexible connectors: count as nr, not length.\n'
  + '\u2022 Insulation outline \u2260 duct. Measure the duct inside.\n'
  + '\u2022 Cross-check against schedules. DEFAULT CONSERVATIVE.\n\n'

  + '### Scale\n'
  + 'Title block scale applies. "DO NOT SCALE"=annotations only. Sizes from annotations. Record in flags.\n\n'

  + '### New vs Existing\n'
  + 'NEW (bold/coloured per legend)=include. EXISTING (grey/faded)=exclude. UNCLEAR=serviceStatus "unclear", low conf.\n\n'

  + '### Only Count What You Can Identify\n'
  + 'Cannot positively ID from legend? Do NOT include. Under-count and flag > over-count.\n\n'

  /* ── STEP 3B: SPEC READING (Sources 21-22) ───────────── */
  + '## STEP 3B \u2014 SPECIFICATION READING & TRADE-SPECIFIC CLAUSE SELECTION\n\n'
  + 'When a specification PDF is uploaded alongside drawings:\n'
  + '1. STRUCTURE: Identify Part 1 (General/Scope), Part 2 (Products), Part 3 (Execution) per NBS/CSI convention.\n'
  + '2. SPEC TYPE per section: Descriptive (D) = performance criteria, contractor selects. Descriptive+ (D+) = named basis-of-design + "or approved equal". Prescriptive (P) = exact manufacturer/model, no alternatives.\n'
  + '3. TRADE SELECTION: Only read sections in your trade division (NBS Y10-Y74 for M&E, or CSI Div 23-28). Skip sections for systems NOT shown on drawings \u2014 flag as "spec section exists, no matching system on drawings \u2014 verify scope".\n'
  + '4. RELATED WORK (Section 1.2): Read to identify scope boundaries and coordination requirements with other trades.\n'
  + '5. RISK EXTRACTION: LDs (\u00a3/day), bonding requirements, programme constraints, testing extent, submittal volume, warranty periods.\n'
  + '6. CAWS-to-NRM2 MAPPING: Y10 (Pipework) \u2192 WS 38. Y20-Y25 (Ductwork) \u2192 WS 38. Y50-Y53 (Insulation/Fire Stopping) \u2192 WS 31. P12 (Fire Stopping) \u2192 WS 31. P31 (Builder\u2019s Work) \u2192 WS 41.\n'
  + '7. CHECKLIST: For ductwork check gauge/seams/hangers/lining/dampers/testing. For pipework check material/jointing/valves/insulation/testing. For equipment check basis-of-design/alternatives/warranty/BMS.\n\n'

  /* ── STEP 3C: SPEC RECONCILIATION (Sources 23-25) ────── */
  + '## STEP 3C \u2014 SPECIFICATION RECONCILIATION & CONFLICT RESOLUTION\n\n'
  + '### Document Precedence (A90 standard)\n'
  + 'Schedules of Work > Preliminaries > Contract Drawings > Reference Specification. Specific work sections > A90 general requirements.\n'
  + 'JCT: Spec governs quality/product. Drawing governs dimensions/positions.\n'
  + 'NEC: All Works Information read together. Ambiguity = Project Manager instruction.\n'
  + 'Within spec: Part 2 > Part 1 for products. Part 3 > Part 1 for methods. Specific > general. Latest revision > earlier.\n\n'
  + '### Conflict Resolution Methods\n'
  + 'When precedence hierarchy does not resolve: (1) MAJORITY VOTE \u2014 3/4 documents agree = prevailing interpretation. (2) BEST PRACTICE \u2014 align with CIBSE/BS/DW144/BSRIA. (3) MOST SPECIFIC \u2014 1:5 detail > 1:50 plan. (4) MOST RECENT \u2014 later document > earlier. (5) COMMERCIAL COMMON SENSE \u2014 reject absurd/impractical interpretation. (6) GIVE NOTICE \u2014 flag as RFI when genuinely ambiguous.\n\n'
  + '### BSRIA Gap-Filling (BG 85/87 defaults when spec is SILENT)\n'
  + 'Duct velocity: 3-6 m/s low-velocity, 7.5-15 m/s high-velocity, by space type.\n'
  + 'Pipe velocity: 1.5 m/s \u226450mm, 3.0 m/s >50mm.\n'
  + 'LTHW: 82/71\u00b0C traditional, 70/50\u00b0C modern condensing.\n'
  + 'Insulation: BS 5422 min \u2014 LTHW 25-50mm, ChW 25mm closed-cell+VB, DHW 19mm.\n'
  + 'Cooling loads: Offices 87 W/m\u00b2, Retail 140, Data centres 1500.\n'
  + 'FLAG every default as "BSRIA default applied \u2014 spec silent on [parameter]". Never override explicit requirements.\n\n'
  + '### BSRIA Sense-Check Thresholds\n'
  + 'Duct size: office main 600\u00d7400 to 1200\u00d7600. >1600mm any dimension = check.\n'
  + 'Pipe size: LTHW main 40-100mm/floor. >150mm single floor = check.\n'
  + 'Riser length: cannot exceed floors \u00d7 5m.\n'
  + 'AHU: 2,000-15,000 l/s per floor. Chiller: 100-2,000 kW per building. 10\u00d7 outside = misread.\n'
  + 'Insulation: 19-50mm typical. >100mm on standard pipe = reading OD not thickness.\n\n'
  + '### Cross-Referencing Drawings \u2194 Spec\n'
  + 'Drawings show WHERE and HOW MUCH. Specs show WHAT and HOW. Both apply unless they conflict.\n'
  + 'Check: equipment schedules vs Part 2 (manufacturer mismatch?), pipe material annotation vs spec (conflict?), testing requirements (drawing notes vs Part 3?), kW ratings (schedule vs spec?).\n'
  + 'Implicit inclusions (always in scope even if not drawn): hangers/supports, isolation valves at equipment, drain points at low points, air vents at high points, labelling, fire stopping at rated penetrations.\n'
  + 'FIGURED dimensions ALWAYS override scaled measurements. Services drawings are "diagrammatic \u2014 do not rely on scaled dimensions" (A90).\n\n'

  /* ── STEP 4: TAKEOFF & ENHANCED GROUPING ───────────────── */
  + '## STEP 4 \u2014 TAKEOFF METHOD & ENHANCED GROUPING\n\n'

  + '### Digital Takeoff\n'
  + 'Countfire-style symbol counting (VCDs, grilles, FDs). Bluebeam-style one-layer-at-a-time. eTakeoff-style assembly bundles (insulation + tape + fixings + cladding). 15-20% fittings allowance.\n\n'

  + '### MANDATORY GROUPING (two levels)\n'
  + 'Level 1 \u2014 LOCATION: Every item assigned to floor + zone (Plant Room / Ceiling Void / named rooms / Risers / External / Roof). Include in flags as "Location: [floor/zone]".\n'
  + 'Level 2 \u2014 UNIT/EQUIPMENT: Within each location, group related items by their associated unit or equipment (e.g. MHRV-1, MHRV-2, AHU-01, Boiler, Fume Cupboard). For each unit, list ALL connected measurements together:\n'
  + '  Example: "MHRV 1: Fresh Air Intake 250\u00d8 \u2014 3m, MHRV 1: Exhaust 250\u00d8 \u2014 2m, MHRV 1: Supply 200\u00d7150 \u2014 20m, MHRV 1: Insulation Coverage \u2014 25m\u00b2"\n'
  + 'This ensures all components tied to a single unit (intakes, exhausts, supplies, returns, fittings, insulation) are compiled adjacently for holistic verification.\n'
  + 'Include the unit/equipment reference in each JSON item as "unit" field and in flags.\n\n'

  + '### Insulation Specification\n'
  + 'Spec uploaded: cross-reference each service. No spec: flag "No spec \u2014 TBC", UK practice guidance only, flag "spec TBC".\n\n'

  + '### Price Book Matching\n'
  + (hasPriceBook ? ('Contractor Price Book:\n' + pbItems + '\n\nMatch to closest PB item. Matched: PB rate + ID. Partial: PB rate + flag. No match: estimate UK 2025/26 + flag.\n')
  : 'No Price Book loaded. Estimate UK 2025/26 supply+fix rates. Flag "estimated".\n')

  /* ── DONUT LAYOUT STRATEGY ────────────────────────────── */
  + '\n### Vertical Inference Rules (from MEP Academy Riser Reference)\n'
  + 'Plan views show HORIZONTAL layout only. To determine VERTICAL distances:\n'
  + '  RISERS: Flag riser symbols (R/U, R/D, shaft annotations) on plans. Default riser length = floor-to-floor height (UK commercial default 3.75m if not stated). Add 2\u00d790\u00b0 elbows per floor.\n'
  + '  SECTION VIEWS: If provided, read actual riser lengths, service heights, offsets. Section views are the ONLY reliable source for vertical dimensions.\n'
  + '  FLOOR-TO-FLOOR: Commercial office 3.6-4.2m, retail 4.0-5.0m, residential 2.7-3.0m, plant room 4.5-6.0m. Find from building section or FFL datum levels.\n'
  + '  VERTICAL DROPS to add: Riser-to-horizontal transition 300-600mm, main-to-branch drops 150-450mm, ceiling-to-terminal 100-300mm. These are commonly MISSING from plan-only takeoffs.\n'
  + '  MULTI-FLOOR RISERS: Count floors served \u00d7 floor-to-floor height + fittings + fire stopping at each floor penetration.\n'
  + '  OFFSETS: Only visible in section views. 2\u00d7 elbows + vertical offset distance as additional straight run.\n'
  + '  DETAIL VIEWS: May have DIFFERENT SCALE from main drawing. Always read the detail\u2019s own scale.\n'
  + '  If only plan views provided: flag as "estimated vertical \u2014 section view not provided" with medium confidence.\n'
  + '### Column-Line Riser Tracing (from MEP Academy General Layout)\n'
  + '  COLUMN GRID is the universal coordinate system across ALL sheets and ALL floors. To trace a riser: find its grid intersection (e.g. "4" & "N") on Floor 1, then find the same intersection on Floor 2, Floor 3, etc.\n'
  + '  HIDDEN LINES (dashed) on plan views = services running BELOW visible level. Solid-to-dashed transition = level change = vertical component. Count dashed-line services in the takeoff.\n'
  + '  MATCH LINES: services crossing match lines continue on the adjacent sheet. Sum runs from both sheets. Do NOT double-count risers at match boundaries.\n'
  + '  SCHEDULE CROSS-CHECK: if equipment schedule says AHU serves 4 floors from roof, the riser must run the full building height.\n'
  + '  SIMILAR FLOORS: in buildings with typical/repeated floors, measure one floor\u2019s connections then multiply by number of typical floors.\n\n'

  + '\n### Structured Region Extraction (from Donut OCR-Free Document Understanding)\n'
  + 'M&E drawings contain TWO types of content requiring different approaches:\n'
  + '  STRUCTURED REGIONS (schedules, title blocks, legends, tables): Extract as structured JSON. Read tabular data directly \u2014 do not OCR cell-by-cell.\n'
  + '  GEOMETRIC REGIONS (service lines, measurements, spatial layout): Use colour matching, line detection, and calibrated OCR per CIBSE rules.\n'
  + 'For structured regions: identify the title block first (project name, drawing number, scale, revision, contractor). Then extract the legend as a recognition template. Then extract any equipment/valve/cable schedules as structured data.\n'
  + 'For geometric regions: apply the dual-pass strategy (Pass 1 geometry, Pass 2 text, merge by proximity).\n'
  + 'Combine both into unified BoQ output.\n\n'

  /* ── NRM2 MEASUREMENT COMPLIANCE ──────────────────────── */
  + '\n## NRM2 MEASUREMENT RULES (RICS New Rules of Measurement 2nd Ed.)\n\n'
  + 'All quantities MUST comply with NRM2 units:\n'
  + '  Pipework: m (centreline), state nominal bore + material + system type. Fittings/valves: nr.\n'
  + '  Ductwork: m (centreline), state diameter or WxH + material + system. Fittings/dampers/grilles: nr.\n'
  + '  Insulation to pipes: m, state pipe dia + material + thickness + finish.\n'
  + '  Insulation to ducts: m\u00b2 (external wrap) or m (internal lining), state duct size + material + thickness.\n'
  + '  Trace heating: m, state pipe dia range + W/m + control method. Thermostats: nr.\n'
  + '  Fire stopping penetrations: nr, state fire rating + penetration type + service size.\n'
  + '  Equipment: nr with full spec (capacity kW, type, manufacturer ref).\n'
  + '  Cable: m, state mm\u00b2 + cores + type. Containment: m, state type + width.\n'
  + '  Builder\u2019s work holes: nr, state size + wall/floor type. Chases: m.\n'
  + '  Testing/commissioning: item per system.\n'
  + 'Items measured NET (no waste allowance in qty \u2014 waste is in the rate).\n'
  + 'BoQ format: Ref | Description | Unit | Qty | Rate | Amount.\n\n'

  /* ── STEP 5: OUTPUT FORMAT ─────────────────────────────── */
  + '\n## STEP 5 \u2014 OUTPUT FORMAT\n\n'
  + 'Respond with ONLY a JSON array (no markdown, no backticks, no preamble). Each object:\n'
  + '{"ref":"Service ID e.g. DUCT-S-250",'
  + '"service":"Underlying service e.g. 250mm\u00d8 circular supply ductwork",'
  + '"unit_equip":"Associated unit e.g. MHRV 1 or AHU-01 or General or null",'
  + '"desc":"Full description of scope item",'
  + '"qty":number,'
  + '"unit":"lin.m|m\u00b2|nr|set|TBC",'
  + '"rate":number,'
  + '"hist":number,'
  + '"histRange":"in-range|near|outlier|none",'
  + '"conf":number,'
  + '"level":"high|med|low",'
  + '"flags":["Drawing scale: 1:XX","Status: NEW","Location: GF Research Lab","Unit: MHRV 1","Takeoff: Countfire symbol count","Ductwork: centreline only","qty derivation","spec source","rate source"],'
  + '"assumptions":[{"param":"What was assumed e.g. Insulation thickness","source":"Reference used e.g. BS 5422 Table 2 general commercial default","flag":"Warning text e.g. Spec may require enhanced thermal performance — verify Section M"}],'
  + '"src":"Drawing ref",'
  + '"srcPage":number,'
  + '"priceBookMatch":"item ID or null",'
  + '"drawingScale":"1:50|NTS|null",'
  + '"serviceStatus":"new|existing|unclear"}\n\n'

  + 'CONFIDENCE:\n'
  + '- high (75-100): NEW, annotated size, qty from annotation/count, location+unit identified, legend-confirmed, spec+PB matched. Label: "From drawing".\n'
  + '- med (45-74): NEW but qty estimated, OR spec inferred, OR unit/location assumed, OR defaults applied from BSRIA/BS standards. Label: "Partially estimated".\n'
  + '- low (0-44): Status unclear, qty TBC, unidentified, no spec, ambiguous, OR standards applied from different project type context. Label: "AI estimate — verify".\n\n'
  + 'ASSUMPTIONS (critical for audit trail):\n'
  + '- For EVERY line item where a default, rule of thumb, or inference was applied, populate the "assumptions" array.\n'
  + '- Include: pipe sizes inferred from BSRIA flow rates, insulation thicknesses from BS 5422 defaults, duct sizes from velocity assumptions, material types assumed from BSRIA BG 85 defaults, quantities estimated from routing rather than measured from annotations, labour rates from Wendes manual, fittings allowances applied as percentages.\n'
  + '- Each assumption must state: what parameter was assumed, which source/standard/rule was applied, and what the user should verify.\n'
  + '- Items extracted directly from clear drawing annotations with no inference needed: assumptions array can be empty.\n\n'

  + 'FINAL REMINDERS:\n'
  + '- Self-check completed. Techniques reassessed for conservatism.\n'
  + '- Legend absolute priority. Two-pass verification.\n'
  + '- NEVER count dimension lines/arrows/leaders/centre-lines/text/hatching.\n'
  + '- Spiral: centreline confirm. Fresh air: short, coloured.\n'
  + '- Double-line duct = ONE, centreline ONCE.\n'
  + '- DEFAULT CONSERVATIVE. Under-count and flag.\n'
  + '- Group by LOCATION then UNIT/EQUIPMENT then system.\n'
  + '- ONLY NEW. Keep JSON compact. Sort by location, unit, confidence.\n\n'

  + '## STEP 6 \u2014 QUOTE COMPILATION & WORKFLOW INTEGRITY\n\n'
  + '### Self-Diagnosis (run internally before presenting results)\n'
  + 'Before returning your JSON, verify workflow state:\n'
  + '1. PDF extracted? \u2713 Document content read and interpreted.\n'
  + '2. Legend extracted? \u2713 Project-specific symbols/colours identified.\n'
  + '3. Services identified? \u2713 Two-pass verification complete on all elements.\n'
  + '4. New vs existing filtered? \u2713 Only bold/coloured new services included.\n'
  + '5. Grouped by location? \u2713 Every item has "Location: [floor/zone]" in flags.\n'
  + '6. Grouped by unit/equipment? \u2713 Every item has unit_equip field set.\n'
  + '7. Quantities conservative? \u2713 No dimension lines/arrows counted. Fittings allowance applied.\n'
  + '8. Cross-check passed? \u2713 Insulation m\u00b2 \u2248 duct/pipe surface area. Equipment \u2248 connections.\n'
  + 'If ANY gap: auto-flag and resolve with defaults/assumptions BEFORE returning JSON.\n'
  + 'Log: "Workflow integrity check: All steps complete \u2192 quote data ready."\n\n'

  + '### Quote Output Quality Requirements\n'
  + 'Your JSON feeds directly into Contraq\'s "Review & Confirm" table, then the "Confirm & Create Quote" button compiles into a professional BoQ. Ensure:\n'
  + '- Accurate "unit_equip" field for EVERY item (e.g. "MHRV 1", "AHU-01", "Fume Cupboard", "General")\n'
  + '- "Location: [floor/zone]" in flags for EVERY item\n'
  + '- Conservative quantities with clear derivation notes in flags\n'
  + '- Rate estimates where possible (from Price Book or UK 2025/26 market rates)\n'
  + '- If rates unknown: set rate to 0, flag "Provisional \u2014 apply current supplier pricing"\n'
  + '- Assumptions, missing info, or client queries flagged with conf=low\n'
  + '- Items sorted by location \u2192 unit_equip \u2192 confidence\n\n'

  + '### Quote Structure (produced on confirmation)\n'
  + 'Header: Project name, date, services scope, assumptions, confidence summary.\n'
  + 'Body: Location-grouped sections \u2192 Unit sub-groupings \u2192 BoQ table:\n'
  + '  Location/Floor | Unit/Equipment | System/Service | Item + Size | Qty | Unit | Rate | Subtotal | Notes | Confidence\n'
  + 'Totals: Subtotals per location/unit. Grand total (materials + labour if data present).\n'
  + 'Footer: Uncertainties, clarifications needed, next steps.\n'
  + 'Success: "Quote compiled and ready. Saved to Quote Book register."\n\n'

  + '### Confirmation Trigger Handling (CRITICAL)\n'
  + 'The "Confirm & Create Quote" button in the UI reads your JSON, applies user accept/flag/reject decisions, and compiles the quote. Your job is to ensure:\n'
  + '- JSON is valid and parseable (no markdown fences, no preamble)\n'
  + '- Every item has all required fields populated (ref, service, unit_equip, desc, qty, unit, rate, conf, level, flags, src, srcPage, drawingScale, serviceStatus)\n'
  + '- If ANY field is uncertain, provide a default value and flag it \u2014 NEVER omit the field\n'
  + '- Rate=0 is acceptable if flagged; qty=0 for TBC items is acceptable if flagged\n'
  + '- The confirmation process MUST NOT fail due to missing fields or malformed JSON';
}





/* ── 7-step analysis — real Claude API call ───────────────── */
function qbStartAnalysis() {
  // Soft gate: check AI quote limit for Starter plan
  var gate = checkPlanGate('aiQuote', STATE.aiQuotesUsedThisMonth);
  if (!gate.allowed) { closeModal('modal-qb-upload'); showUpgradePrompt(gate); return; }
  STATE.aiQuotesUsedThisMonth++;

  _qbReviewState = {};
  var phaseUpload = document.getElementById('qb-phase-upload');
  var phaseResults = document.getElementById('qb-phase-results');
  var footer = document.getElementById('qb-upload-footer');
  var title = document.getElementById('qb-upload-title');
  var prog = document.getElementById('qb-ai-progress');
  var docCount = document.getElementById('qb-ai-doc-count');

  phaseUpload.style.display = 'none';
  footer.style.display = 'none';
  title.textContent = 'Analysing ' + _qbFiles.length + ' document' + (_qbFiles.length>1?'s':'') + '\u2026';
  prog.classList.add('active');
  docCount.textContent = _qbFiles.length + ' files \u00b7 Sending to AI for extraction\u2026';

  var totalSteps = 7;
  for (var r = 1; r <= totalSteps; r++) {
    var el = document.getElementById('qb-step-' + r);
    el.className = 'ai-step-item';
    el.querySelector('.ai-step-icon').className = 'ai-step-icon pending';
    el.querySelector('.ai-step-icon').innerHTML = '';
  }
  document.getElementById('qb-ai-prog-fill').style.width = '0%';
  document.getElementById('qb-ai-spinner').style.display = '';

  /* ── Step animation helpers ─────────────────────────────── */
  var _currentStep = 0;
  function activateStep(n) {
    if (n > totalSteps || n <= _currentStep) return;
    if (_currentStep > 0) completeStep(_currentStep);
    _currentStep = n;
    var el = document.getElementById('qb-step-' + n);
    el.classList.add('active');
    el.querySelector('.ai-step-icon').className = 'ai-step-icon';
    el.querySelector('.ai-step-icon').innerHTML = '<span style="display:block;width:10px;height:10px;border-radius:50%;border:2px solid var(--orange);border-top-color:transparent;animation:spin .6s linear infinite"></span>';
    document.getElementById('qb-ai-prog-fill').style.width = Math.round(n / totalSteps * 90) + '%';
  }
  function completeStep(n) {
    var el = document.getElementById('qb-step-' + n);
    el.classList.remove('active'); el.classList.add('done');
    el.querySelector('.ai-step-icon').className = 'ai-step-icon';
    el.querySelector('.ai-step-icon').innerHTML = '<span style="color:var(--lime);font-size:.65rem;font-weight:700">\u2713</span>';
  }
  function completeAll() {
    for (var s = 1; s <= totalSteps; s++) completeStep(s);
    document.getElementById('qb-ai-prog-fill').style.width = '100%';
    document.getElementById('qb-ai-spinner').style.display = 'none';
  }

  /* ── Step 1: Read files ─────────────────────────────────── */
  activateStep(1);
  docCount.textContent = _qbFiles.length + ' files \u00b7 Reading document data\u2026';

  var pdfFiles = _qbFiles.filter(function(f) { return f.ext === 'pdf' && f._raw; });
  var imgFiles = _qbFiles.filter(function(f) { return /^(png|jpg|jpeg)$/.test(f.ext) && f._raw; });

  if (pdfFiles.length === 0 && imgFiles.length === 0) {
    docCount.textContent = 'No PDF files found \u2014 loading demo extraction\u2026';
    _qbRunDemoFallback(activateStep, completeAll);
    return;
  }

  /* Read all files as base64 */
  var readPromises = _qbFiles.filter(function(f) { return f._raw; }).map(function(f) {
    return _qbReadFileAsBase64(f._raw).then(function(b64) {
      return { name: f.name, ext: f.ext, base64: b64 };
    });
  });

  Promise.all(readPromises).then(function(fileData) {
    /* ── Step 2: Identify document types ────────────────── */
    activateStep(2);
    var hasSpec = false, hasDwg = false, hasBoq = false;
    fileData.forEach(function(fd) {
      var n = fd.name.toLowerCase();
      if (/spec|specification|nbs/i.test(n)) hasSpec = true;
      else if (/dwg|drg|drawing|layout|plan/i.test(n) || /dr[\/\-]mx|dr[\/\-]me/i.test(n)) hasDwg = true;
      else if (/boq|bill|schedule|qty|quantit/i.test(n)) hasBoq = true;
      else hasDwg = true; /* default: treat as drawing */
    });
    var docTypes = [];
    if (hasDwg) docTypes.push('drawing' + (fileData.filter(function(fd){return !/spec|boq|bill/i.test(fd.name);}).length > 1 ? 's' : ''));
    if (hasSpec) docTypes.push('specification');
    if (hasBoq) docTypes.push('BoQ');
    docCount.textContent = _qbFiles.length + ' files \u00b7 Identified: ' + docTypes.join(', ');

    /* ── Step 3: Build API message ─────────────────────── */
    activateStep(3);
    docCount.textContent = 'Building AI prompt with ' + MATERIALS_PRICE_BOOK.length + ' Price Book items\u2026';

    var contentBlocks = [];
    fileData.forEach(function(fd) {
      if (fd.ext === 'pdf') {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: fd.base64 }
        });
      } else if (/^(png|jpg|jpeg)$/.test(fd.ext)) {
        var mime = fd.ext === 'png' ? 'image/png' : 'image/jpeg';
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: mime, data: fd.base64 }
        });
      }
      contentBlocks.push({
        type: 'text',
        text: 'Filename: ' + fd.name + (hasSpec && /spec/i.test(fd.name) ? ' [THIS IS A SPECIFICATION DOCUMENT]' : '') + (hasBoq && /boq|bill|schedule/i.test(fd.name) ? ' [THIS IS A BILL OF QUANTITIES]' : '')
      });
    });

    contentBlocks.push({
      type: 'text',
      text: 'Analyse all uploaded documents following the 16-step calibrated protocol:\n'
        + 'STEP 1: SELF-CHECK \u2014 Reassess your ductwork identification techniques. Ask: Am I only counting physical runs? Am I distinguishing new coloured from grey existing? Am I being conservative? Fresh air intake is typically short (~3m). Spiral duct needs centreline confirmation.\n'
        + 'STEP 2: LEGEND FIRST \u2014 Extract the project legend, symbol key, abbreviations from every sheet. This overrides all general standards. Two-pass verification: classify then confirm against legend.\n'
        + 'STEP 3: IDENTIFY NEW ONLY \u2014 Only count bold/coloured services per legend. Ignore grey/faded existing. Process one service type at a time. Count symbols systematically. NEVER count dimension lines, arrows, leaders, centre-lines, text, hatching as duct/pipe. Double-line duct = one duct, centreline only. Default conservative.\n'
        + (hasSpec ? 'STEP 3B: SPEC READING \u2014 Parse uploaded spec: Part 1/2/3 structure, spec type (D/P/D+) per section, trade-specific clauses, risk items (LDs, bonding, testing). Map CAWS to NRM2.\n'
        + 'STEP 3C: SPEC RECONCILIATION \u2014 Cross-reference spec vs drawings. Apply A90 precedence. Flag contradictions. Apply BSRIA BG 85/87 defaults where spec is silent. Detect template leftovers. Sense-check all values against BSRIA thresholds.\n'
        : 'SPEC: No specification uploaded. Apply BSRIA BG 85/87 defaults for silent parameters. Flag insulation as TBC.\n')
        + 'GROUP: Level 1=floor+zone (e.g. "GF Research Lab"). Level 2=unit/equipment (e.g. "MHRV 1", "Fume Cupboard"). List all connected items under each unit adjacently. Include location and unit in flags and unit_equip field.\n'
        + 'PRICE: Match against Price Book. ' + (MATERIALS_PRICE_BOOK.length > 0 ? MATERIALS_PRICE_BOOK.length + ' items available.' : 'No Price Book loaded.') + '\n'
        + 'ASSEMBLY: Include ancillaries (fixings, tape, supports) with insulated runs. 15-20% fittings allowance.\n'
        + 'VALIDATION: Sense-check all quantities against BSRIA thresholds. Flag outliers for manual review.\n'
        + 'Output JSON array ONLY. Keep compact. Sort by location then confidence. ZERO over-quantification.'
    });

    /* ── Step 4: Call Claude API ────────────────────────── */
    activateStep(4);
    docCount.textContent = 'Claude AI extracting services from ' + (hasDwg ? 'drawings' : 'documents') + '\u2026';

    var systemPrompt = _qbBuildSystemPrompt();

    /* Animate steps 5-6 while waiting */
    var _apiStepTimer = setInterval(function() {
      if (_currentStep < 6) {
        activateStep(_currentStep + 1);
        if (_currentStep === 5) docCount.textContent = 'Matching spec & pricing against Price Book (' + MATERIALS_PRICE_BOOK.length + ' items)\u2026';
        if (_currentStep === 6) docCount.textContent = 'Assembly grouping \u2014 adding ancillaries & fittings allowances\u2026';
      }
    }, 4000);

    console.log('[Contraq AI] Calling API proxy (' + contentBlocks.length + ' content blocks, model: claude-sonnet-4-6)');

    fetch(CONTRAQ_API_BASE + '/api/quotes/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: 'user', content: contentBlocks }]
      })
    })
    .then(function(resp) {
      clearInterval(_apiStepTimer);
      if (!resp.ok) {
        return resp.text().then(function(body) {
          var detail = '';
          try { var j = JSON.parse(body); detail = (j.error && j.error.message) || body; } catch(e) { detail = body.substring(0, 200); }
          console.error('Anthropic API ' + resp.status + ':', detail);
          throw new Error('API ' + resp.status + ': ' + detail);
        });
      }
      return resp.json();
    })
    .then(function(apiData) {
      /* ── Step 7: Parse response ───────────────────────── */
      activateStep(7);
      docCount.textContent = 'Parsing AI extraction results\u2026';

      var rawText = '';
      if (apiData.content && Array.isArray(apiData.content)) {
        apiData.content.forEach(function(block) {
          if (block.type === 'text') rawText += block.text;
        });
      }

      /* Check if response was truncated */
      var wasTruncated = apiData.stop_reason === 'max_tokens';

      /* Strip markdown fences if present */
      rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

      var parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch(e) {
        /* Try to extract the JSON array */
        var arrayStart = rawText.indexOf('[');
        if (arrayStart === -1) throw new Error('No JSON array found in API response');
        var jsonStr = rawText.substring(arrayStart);

        /* If truncated, try to repair: find the last complete object */
        if (wasTruncated || !jsonStr.trim().endsWith(']')) {
          jsonStr = _qbRepairTruncatedJSON(jsonStr);
        }

        try {
          parsed = JSON.parse(jsonStr);
        } catch(e2) {
          /* Last resort: extract individual objects with regex */
          parsed = _qbExtractJSONObjects(rawText);
          if (!parsed || parsed.length === 0) {
            throw new Error('Could not parse JSON: ' + e2.message);
          }
        }
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('API returned empty or non-array data');
      }

      if (wasTruncated) {
        console.warn('AI Quote Builder: Response was truncated at token limit. Extracted ' + parsed.length + ' complete items.');
      }

      /* Validate, normalise, and do local Price Book cross-check */
      AI_EXTRACTION_DATA = parsed.map(function(item) {
        var normItem = {
          ref: String(item.ref || '\u2014'),
          service: String(item.service || ''),
          unit_equip: String(item.unit_equip || item.unitEquip || ''),
          desc: String(item.desc || item.description || 'Unnamed scope item'),
          qty: parseFloat(item.qty) || 0,
          unit: String(item.unit || 'nr'),
          rate: parseFloat(item.rate) || 0,
          hist: parseFloat(item.hist || 0),
          histRange: (['in-range','near','outlier','none'].indexOf(item.histRange) > -1) ? item.histRange : 'none',
          conf: Math.min(100, Math.max(0, parseInt(item.conf || item.confidence || 50))),
          level: (['high','med','low'].indexOf(item.level) > -1) ? item.level : (parseInt(item.conf||50) >= 75 ? 'high' : parseInt(item.conf||50) >= 45 ? 'med' : 'low'),
          flags: Array.isArray(item.flags) ? item.flags : ['AI-extracted'],
          assumptions: Array.isArray(item.assumptions) ? item.assumptions : [],
          src: String(item.src || item.source || 'Uploaded document'),
          srcPage: parseInt(item.srcPage || item.page || 0),
          priceBookMatch: item.priceBookMatch || null,
          drawingScale: String(item.drawingScale || ''),
          serviceStatus: (['new','existing','unclear'].indexOf(item.serviceStatus) > -1) ? item.serviceStatus : 'new',
          kbVersion: KB_VERSION,
          kbDate: KB_VERSION_DATE
        };

        /* Filter out existing services — they should not have been returned but double-check */
        if (normItem.serviceStatus === 'existing') return null;

        /* Local Price Book verification pass */
        if (MATERIALS_PRICE_BOOK.length > 0 && !normItem.priceBookMatch) {
          var bestMatch = _qbFindPriceBookMatch(normItem.desc, normItem.service);
          if (bestMatch) {
            normItem.priceBookMatch = bestMatch.id;
            normItem.hist = bestMatch.supplierPrice;
            if (normItem.rate > 0) {
              var diff = Math.abs(normItem.rate - bestMatch.supplierPrice) / bestMatch.supplierPrice;
              normItem.histRange = diff < 0.15 ? 'in-range' : diff < 0.35 ? 'near' : 'outlier';
            }
            normItem.flags.push('Price Book match: ' + bestMatch.name + ' @ \u00a3' + bestMatch.supplierPrice.toFixed(2) + '/' + bestMatch.unit);
          }
        }
        return normItem;
      }).filter(function(item) { return item !== null; });

      /* Sort: high first, then med, then low */
      var _levelOrder = {high:0, med:1, low:2};
      AI_EXTRACTION_DATA.sort(function(a,b) {
        /* Sort by unit/equipment group, then confidence */
        var ua = (a.unit_equip || 'zzz').toLowerCase(), ub = (b.unit_equip || 'zzz').toLowerCase();
        if (ua !== ub) return ua.localeCompare(ub);
        return (_levelOrder[a.level]||1) - (_levelOrder[b.level]||1) || b.conf - a.conf;
      });

      completeAll();
      var svcCount = AI_EXTRACTION_DATA.filter(function(d){return d.service;}).length;
      docCount.textContent = AI_EXTRACTION_DATA.length + ' items extracted' + (svcCount ? ' from ' + svcCount + ' services' : '') + ' \u00b7 ' + _qbFiles.length + ' document' + (_qbFiles.length>1?'s':'');
      setTimeout(function() { qbShowExtractionResults(); }, 600);
    })
    .catch(function(err) {
      clearInterval(_apiStepTimer);
      console.error('AI Quote Builder API error:', err);
      var errMsg = String(err.message || err);
      if (/401|403|auth/i.test(errMsg)) errMsg = 'Authentication failed \u2014 check your API key is valid and has credit';
      else if (/cors|network|failed to fetch/i.test(errMsg)) errMsg = 'Network/CORS error \u2014 direct browser access may not be enabled for your API key';
      else if (/429|rate/i.test(errMsg)) errMsg = 'Rate limited \u2014 wait a moment and try again';
      else if (/400|invalid/i.test(errMsg)) errMsg = 'Bad request \u2014 the model or request format may be invalid';
      docCount.textContent = '\u26a0 AI call failed: ' + errMsg;
      docCount.style.color = 'var(--red)';
      showToast('\u26a0 AI Quote Builder: ' + errMsg, 'error');
      /* Show demo data as fallback but clearly labelled */
      setTimeout(function() {
        docCount.textContent += ' \u2014 showing demo data instead';
        _qbRunDemoFallback(activateStep, completeAll);
      }, 2000);
    });

  }).catch(function(readErr) {
    console.error('File read error:', readErr);
    docCount.textContent = 'File read error \u2014 loading demo data\u2026';
    _qbRunDemoFallback(activateStep, completeAll);
  });
}

/* ── Local Price Book fuzzy matching ─────────────────────── */
function _qbFindPriceBookMatch(desc, service) {
  if (!MATERIALS_PRICE_BOOK.length) return null;
  desc = (desc + ' ' + (service || '')).toLowerCase();

  var isDuct = /duct|ductwork/i.test(desc);
  var isPipe = /pipe|pipework|tube/i.test(desc);
  var isArmaflex = /armaflex|closed.?cell|elastomeric|kaiflex/i.test(desc);
  var isRockwool = /rockwool|mineral.?wool|lagging.?section/i.test(desc);
  var isDuctWrap = /duct.?wrap|foil.?faced|duct.?board/i.test(desc);
  var isTape = /tape|adhesive/i.test(desc);
  var isCladding = /cladding|casing|pvc|grp/i.test(desc);
  var isFixing = /band|buckle|pin|fixing/i.test(desc);

  var sizeMatch = desc.match(/(\d+)\s*mm/);
  var size = sizeMatch ? parseInt(sizeMatch[1]) : 0;

  var bestScore = 0;
  var bestItem = null;

  MATERIALS_PRICE_BOOK.forEach(function(m) {
    var mName = m.name.toLowerCase();
    var mCat = (m.category || '').toLowerCase();
    var score = 0;

    if (isDuct && (mCat.indexOf('ductwork') > -1 || /duct/i.test(mName))) score += 3;
    if (isPipe && mCat.indexOf('pipe') > -1) score += 3;
    if (isTape && (mCat.indexOf('adhesive') > -1 || mCat.indexOf('tape') > -1)) score += 3;
    if (isCladding && mCat.indexOf('cladding') > -1) score += 3;
    if (isFixing && mCat.indexOf('fixing') > -1) score += 3;

    if (isArmaflex && /armaflex/i.test(mName)) score += 4;
    if (isRockwool && /rockwool/i.test(mName)) score += 4;
    if (isDuctWrap && /wrap|duct.?board/i.test(mName)) score += 4;

    if (size > 0) {
      var mSize = mName.match(/(\d+)\s*mm/);
      if (mSize) {
        var mSizeVal = parseInt(mSize[1]);
        if (mSizeVal === size) score += 3;
        else if (Math.abs(mSizeVal - size) <= 5) score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = m;
    }
  });

  return bestScore >= 4 ? bestItem : null;
}

/* ── Repair truncated JSON array from API ────────────────── */
function _qbRepairTruncatedJSON(jsonStr) {
  /* Find the last complete object by scanning for },{ or }] patterns */
  var lastCompleteObj = -1;
  var braceDepth = 0;
  var inString = false;
  var escapeNext = false;

  for (var i = 0; i < jsonStr.length; i++) {
    var ch = jsonStr[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braceDepth++;
    if (ch === '}') {
      braceDepth--;
      if (braceDepth === 0) lastCompleteObj = i;
    }
  }

  if (lastCompleteObj > 0) {
    return jsonStr.substring(0, lastCompleteObj + 1) + ']';
  }
  return jsonStr;
}

/* ── Extract individual JSON objects via regex (last resort) ─ */
function _qbExtractJSONObjects(text) {
  var results = [];
  var objRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  var match;
  while ((match = objRegex.exec(text)) !== null) {
    try {
      var obj = JSON.parse(match[0]);
      /* Must look like a line item (has desc or service field) */
      if (obj.desc || obj.service || obj.description) {
        results.push(obj);
      }
    } catch(e) { /* skip unparseable fragments */ }
  }
  return results;
}

/* ── Demo fallback: animated steps + hardcoded data ──────── */
function _qbRunDemoFallback(activateStep, completeAll) {
  AI_EXTRACTION_DATA = _QB_DEMO_DATA.slice();
  var stepDelay = 450;
  var steps = [1,2,3,4,5,6,7];
  steps.forEach(function(s, idx) {
    setTimeout(function() { activateStep(s); }, idx * stepDelay);
  });
  setTimeout(function() {
    completeAll();
    document.getElementById('qb-ai-doc-count').textContent = '\u26a0 DEMO MODE \u2014 ' + AI_EXTRACTION_DATA.length + ' sample items loaded (not from your documents)';
    document.getElementById('qb-ai-doc-count').style.color = 'var(--yellow)';
    setTimeout(function() { qbShowExtractionResults(); }, 600);
  }, steps.length * stepDelay + 200);
}


/* ── Render extraction results with Review & Confirm ──────── */
function qbShowExtractionResults() {
  var prog = document.getElementById('qb-ai-progress');
  var results = document.getElementById('qb-phase-results');
  var title = document.getElementById('qb-upload-title');
  var modal = document.getElementById('qb-modal-inner');
  var footer1 = document.getElementById('qb-upload-footer');
  var footer2 = document.getElementById('qb-results-footer');

  prog.classList.remove('active');
  results.style.display = '';
  title.textContent = 'Review & Confirm';
  modal.style.maxWidth = '920px';
  footer1.style.display = 'none';
  footer2.style.display = '';

  var data = AI_EXTRACTION_DATA;
  var highC=0, medC=0, lowC=0, total=0;
  data.forEach(function(d){ total += d.qty*d.rate; if(d.level==='high')highC++; else if(d.level==='med')medC++; else lowC++; });
  var all = data.length;

  document.getElementById('qb-conf-bar-h').style.width = Math.round(highC/all*100)+'%';
  document.getElementById('qb-conf-bar-m').style.width = Math.round(medC/all*100)+'%';
  document.getElementById('qb-conf-bar-l').style.width = Math.round(lowC/all*100)+'%';
  var avgConf = Math.round(data.reduce(function(s,d){return s+d.conf;},0)/all);
  document.getElementById('qb-conf-pct').textContent = avgConf + '%';
  document.getElementById('qb-conf-pct').style.color = avgConf>=75?'var(--lime)':avgConf>=45?'var(--yellow)':'var(--red)';
  document.getElementById('qb-cnt-h').textContent = highC;
  document.getElementById('qb-cnt-m').textContent = medC;
  document.getElementById('qb-cnt-l').textContent = lowC;
  document.getElementById('qb-ext-count').textContent = all;
  document.getElementById('qb-ext-total').textContent = Math.round(total).toLocaleString('en-GB');
  document.getElementById('qb-ext-time').textContent = (all * 0.22).toFixed(1);
  document.getElementById('qb-rev-item-count').textContent = all;
  document.getElementById('qb-rev-total').textContent = all;

  /* Confidence summary text */
  var confSummaryEl = document.getElementById('qb-conf-summary');
  if (confSummaryEl) confSummaryEl.textContent = all + ' items: ' + highC + ' high confidence, ' + medC + ' medium, ' + lowC + ' low';

  var lb = document.getElementById('qb-low-banner');
  if (lowC > 0) { lb.style.display = ''; document.getElementById('qb-low-count').textContent = lowC; }
  else lb.style.display = 'none';

  var srcHtml = '\uD83D\uDCCE Sources: ';
  _qbFiles.forEach(function(f,i){ srcHtml += f.name + (i<_qbFiles.length-1?' \u00B7 ':''); });
  document.getElementById('qb-ext-sources').innerHTML = srcHtml;

  /* AI disclaimer — always shown */
  var disclaimerEl = document.getElementById('qb-ai-disclaimer');
  if (disclaimerEl) disclaimerEl.style.display = '';
  else {
    var _disc = document.createElement('div');
    _disc.id = 'qb-ai-disclaimer';
    _disc.style.cssText = 'background:rgba(249,115,22,.05);border:1px solid rgba(249,115,22,.15);border-radius:8px;padding:.65rem .85rem;margin-top:.6rem;font-size:.65rem;color:var(--off4);line-height:1.55;font-style:italic';
    _disc.textContent = '\u26a0 All quantities and recommendations are AI-generated estimates based on the uploaded documents and the Contraq Data Bank (v' + KB_VERSION + ', ' + KB_VERSION_SOURCES + ' sources). Final tender pricing and compliance remain the responsibility of the user. Always verify against the original drawings and specification.';
    var srcEl = document.getElementById('qb-ext-sources');
    if (srcEl && srcEl.parentNode) srcEl.parentNode.insertBefore(_disc, srcEl.nextSibling);
  }

  var confTips = {
    high:"High confidence — value extracted directly from drawing annotations or matched against specification and Price Book. Standard review recommended.",
    med:"Medium confidence — partially estimated. Some values inferred from BSRIA/BS defaults or routing approximation. Check flagged parameters against project specification.",
    low:"Low confidence — AI estimate requiring verification. Values inferred from industry defaults. Open the source document and verify quantities, sizes, and specifications before including in a tender."
  };

  /* Populate KB version badge */
  var kbVer = document.getElementById('qb-kb-ver');
  var kbDate = document.getElementById('qb-kb-date');
  var kbSrc = document.getElementById('qb-kb-src');
  if (kbVer) kbVer.textContent = KB_VERSION;
  if (kbDate) kbDate.textContent = KB_VERSION_DATE;
  if (kbSrc) kbSrc.textContent = KB_VERSION_SOURCES;

  var tbody = document.getElementById('qb-ext-tbody');
  tbody.innerHTML = data.map(function(d,i){
    var t = d.qty * d.rate;
    var flagClass = d.level==='low'?'flagged-low':d.level==='med'?'flagged-med':'';
    var flagsHtml = d.flags.map(function(f){return '\u2022 '+f;}).join('<br>');

    /* Confidence label */
    var confLabelClass = d.level==='high'?'from-drawing':d.level==='med'?'partially-estimated':'ai-estimate';
    var confLabelText = d.level==='high'?'From drawing':d.level==='med'?'Partially estimated':'AI estimate — verify';

    /* Assumption audit trail */
    var assumptionsHtml = '';
    if (d.assumptions && d.assumptions.length > 0) {
      assumptionsHtml = '<a class="assumption-toggle" onclick="event.stopPropagation();toggleAssumptions('+i+')">' + ICON.clipboard + ''+d.assumptions.length+' assumption'+(d.assumptions.length>1?'s':'')+' ▾</a>'
        + '<div class="assumption-panel" id="asm-panel-'+i+'">';
      d.assumptions.forEach(function(a){
        assumptionsHtml += '<div style="margin-bottom:.35rem;padding-bottom:.3rem;border-bottom:1px solid rgba(249,115,22,.06)">'
          + '<span class="asm-source">'+((a.param||'Parameter')+': ')+'</span>'+(a.source||'Default applied')
          + (a.flag ? '<br><span class="asm-flag">⚠ '+a.flag+'</span>' : '')
          + '</div>';
      });
      assumptionsHtml += '</div>';
    }

    // Historical rate comparison
    var histHtml = '';
    if (d.histRange==='in-range') histHtml = '<div class="ext-hist-bar"><span class="ext-hist-dot in-range"></span><span style="color:var(--lime)">\u00A3'+d.hist.toFixed(2)+'</span></div>';
    else if (d.histRange==='near') histHtml = '<div class="ext-hist-bar"><span class="ext-hist-dot near"></span><span style="color:var(--yellow)">\u00A3'+d.hist.toFixed(2)+'</span></div>';
    else if (d.histRange==='outlier') histHtml = '<div class="ext-hist-bar"><span class="ext-hist-dot outlier"></span><span style="color:var(--red)">\u00A3'+d.hist.toFixed(2)+'</span></div>';
    else histHtml = '<span style="font-family:var(--mono);font-size:.58rem;color:var(--off4)">\u2014</span>';

    return '<tr class="row-'+d.level+'" id="qb-row-'+i+'">'
      + '<td style="position:relative"><div class="conf-dot '+d.level+'" onclick="toggleConfTip(this)" title="'+d.conf+'/100 \u2014 Click for details">'+d.conf
      + '<div class="conf-tip" id="conf-tip-'+i+'"><div style="font-weight:700;margin-bottom:.3rem;color:var(--white)">'+d.conf+'/100 \u2014 '+(d.level==='high'?'High':d.level==='med'?'Medium':'Low')+' confidence</div>'
      + '<div style="margin-bottom:.4rem">'+confTips[d.level]+'</div>'
      + '<div style="font-family:var(--mono);font-size:.62rem;color:var(--off4);border-top:1px solid var(--border);padding-top:.35rem;margin-top:.25rem">'+flagsHtml+'</div>'
      + (d.srcPage?'<div style="margin-top:.4rem"><a href="#" onclick="event.preventDefault();showToast(\'Opening '+d.src.replace(/'/g,'\\&apos;')+'\u2026\',\'success\')" style="font-family:var(--mono);font-size:.6rem;color:var(--orange);text-decoration:none">\uD83D\uDCC4 View in source PDF \u2192 p.'+d.srcPage+'</a></div>':'')
      + '</div></div></td>'
      + '<td style="font-family:var(--mono);font-size:.65rem;color:var(--off4)">'+d.ref+'</td>'
      + '<td style="font-size:.73rem;color:var(--off2);line-height:1.4">'+(d.unit_equip?'<div style="font-family:var(--mono);font-size:.55rem;color:var(--blue);margin-bottom:.1rem">\u2699\uFE0F '+d.unit_equip+'</div>':'')+(d.service?'<div style="font-family:var(--mono);font-size:.6rem;color:var(--orange);margin-bottom:.15rem">\uD83D\uDD27 '+d.service+(d.drawingScale?' <span style="color:var(--off4);font-size:.5rem">['+d.drawingScale+']</span>':'')+'</div>':'')+d.desc+'<span class="conf-label '+confLabelClass+'">'+confLabelText+'</span><div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.15rem">'+(d.serviceStatus==='new'?'<span style="font-family:var(--mono);font-size:.48rem;padding:.1rem .3rem;border-radius:3px;background:rgba(163,230,53,.1);color:var(--lime);border:1px solid rgba(163,230,53,.2)">NEW</span>':d.serviceStatus==='unclear'?'<span style="font-family:var(--mono);font-size:.48rem;padding:.1rem .3rem;border-radius:3px;background:rgba(250,204,21,.1);color:var(--yellow);border:1px solid rgba(250,204,21,.2)">STATUS?</span>':'')+(d.priceBookMatch?'<span style="font-family:var(--mono);font-size:.48rem;padding:.1rem .3rem;border-radius:3px;background:rgba(163,230,53,.1);color:var(--lime);border:1px solid rgba(163,230,53,.2)">\uD83C\uDFF7\uFE0F '+d.priceBookMatch+'</span>':'')+'</div>'+assumptionsHtml+'</td>'
      + '<td><input class="ext-editable '+flagClass+'" value="'+d.qty+'" style="width:46px;text-align:right" onchange="qbRecalcRow(this)"></td>'
      + '<td style="font-family:var(--mono);font-size:.62rem;color:var(--off4)">'+d.unit+'</td>'
      + '<td><input class="ext-editable '+flagClass+'" value="'+d.rate.toFixed(2)+'" style="width:52px;text-align:right" onchange="qbRecalcRow(this)"></td>'
      + '<td>'+histHtml+'</td>'
      + '<td style="font-family:var(--mono);font-size:.73rem;font-weight:600;color:var(--white)">\u00A3'+Math.round(t).toLocaleString('en-GB')+'</td>'
      + '<td style="font-family:var(--mono);font-size:.55rem;color:var(--off4);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+d.src+'">'+d.src+'</td>'
      + '<td style="white-space:nowrap"><div style="display:flex;gap:3px">'
      + '<button class="ext-action act-accept" id="qb-act-a-'+i+'" onclick="qbReviewAccept('+i+')" title="Accept this item as-is \u2014 it will be included in your quote">\u2713</button>'
      + '<button class="ext-action act-flag" id="qb-act-f-'+i+'" onclick="qbReviewFlag('+i+')" title="Flag for further review \u2014 item will be included but marked for your attention in the Quote Book">\u2691</button>'
      + '<button class="ext-action act-reject" id="qb-act-r-'+i+'" onclick="qbReviewReject('+i+')" title="Remove this item \u2014 it won\u2019t be included in the quote">\u00D7</button>'
      + '</div></td>'
      + '</tr>';
  }).join('');

  qbUpdateReviewProgress();
}

function qbReviewAccept(i) {
  _qbReviewState[i] = 'accepted';
  var row = document.getElementById('qb-row-'+i);
  row.classList.remove('ext-row-flagged'); row.classList.add('ext-row-accepted');
  document.getElementById('qb-act-a-'+i).classList.add('done');
  document.getElementById('qb-act-f-'+i).classList.remove('flagged');
  qbUpdateReviewProgress();
}

function qbReviewFlag(i) {
  _qbReviewState[i] = 'flagged';
  var row = document.getElementById('qb-row-'+i);
  row.classList.remove('ext-row-accepted'); row.classList.add('ext-row-flagged');
  document.getElementById('qb-act-f-'+i).classList.add('flagged');
  document.getElementById('qb-act-a-'+i).classList.remove('done');
  qbUpdateReviewProgress();
}

function qbReviewReject(i) {
  _qbReviewState[i] = 'rejected';
  var row = document.getElementById('qb-row-'+i);
  row.style.display = 'none';
  qbRecalcGrandTotal();
  qbUpdateReviewProgress();
  showToast('Item removed from quote.', 'success');
}

function qbAcceptAllHigh() {
  AI_EXTRACTION_DATA.forEach(function(d,i) {
    if (d.level === 'high' && _qbReviewState[i] !== 'rejected') qbReviewAccept(i);
  });
  showToast(document.getElementById('qb-cnt-h').textContent + ' high-confidence items accepted.', 'success');
}

function qbFlagAllLow() {
  AI_EXTRACTION_DATA.forEach(function(d,i) {
    if (d.level === 'low' && _qbReviewState[i] !== 'rejected') qbReviewFlag(i);
  });
  showToast(document.getElementById('qb-cnt-l').textContent + ' low-confidence items flagged for review.', 'success');
}

function qbUpdateReviewProgress() {
  var total = AI_EXTRACTION_DATA.length;
  var reviewed = 0;
  var unreviewedLow = 0;
  for (var i = 0; i < total; i++) {
    if (_qbReviewState[i]) reviewed++;
    if (!_qbReviewState[i] && AI_EXTRACTION_DATA[i].level === 'low') unreviewedLow++;
  }
  var pct = Math.round(reviewed/total*100);
  document.getElementById('qb-rev-done').textContent = reviewed;
  document.getElementById('qb-rev-pct-label').textContent = pct + '%';
  document.getElementById('qb-rev-fill').style.width = pct + '%';
  document.getElementById('qb-rev-status').textContent = reviewed + ' of ' + total + ' reviewed';

  var btn = document.getElementById('qb-confirm-btn');
  if (unreviewedLow > 0) {
    btn.textContent = 'Review ' + unreviewedLow + ' flagged item' + (unreviewedLow>1?'s':'') + ' to confirm \u2192';
    btn.disabled = true; btn.style.opacity = '.5';
  } else {
    btn.textContent = 'Confirm & Create Quote \u2192';
    btn.disabled = false; btn.style.opacity = '1';
  }
}

function toggleConfTip(el) {
  var tip = el.querySelector('.conf-tip');
  if (!tip) return;
  var wasOpen = tip.classList.contains('open');
  document.querySelectorAll('.conf-tip.open').forEach(function(t){t.classList.remove('open');});
  if (!wasOpen) tip.classList.add('open');
}

function toggleAssumptions(i) {
  var panel = document.getElementById('asm-panel-' + i);
  if (!panel) return;
  panel.classList.toggle('open');
}

function qbRecalcRow(input) {
  var tr = input.closest('tr');
  var inputs = tr.querySelectorAll('.ext-editable');
  var qty = parseFloat(inputs[0].value)||0;
  var rate = parseFloat(inputs[1].value)||0;
  var totalCell = tr.querySelectorAll('td')[7];
  totalCell.textContent = '\u00A3' + Math.round(qty*rate).toLocaleString('en-GB');
  qbRecalcGrandTotal();
}

function qbRecalcGrandTotal() {
  var rows = document.getElementById('qb-ext-tbody').querySelectorAll('tr');
  var grand = 0;
  rows.forEach(function(r){
    if (r.style.display === 'none') return;
    var cells = r.querySelectorAll('.ext-editable');
    if (cells.length >= 2) grand += (parseFloat(cells[0].value)||0) * (parseFloat(cells[1].value)||0);
  });
  document.getElementById('qb-ext-total').textContent = Math.round(grand).toLocaleString('en-GB');
}

/* ── Export line items to CSV ──────────────────────────────── */
function qbExportCSV(tenderId) {
  var t = TENDERS.find(function(x){return x.id===tenderId;});
  if (!t || !t.lineItems) return;

  /* Export gate for CSV — show confirmation before download */
  var meta = t.aiMetadata || {};
  var csvGate = document.createElement('div');
  csvGate.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99998;display:flex;align-items:center;justify-content:center;';
  csvGate.innerHTML = '<div class="export-gate-modal">'
    + '<h3>Export AI-Generated Data</h3>'
    + '<div class="egate-meta">'+t.lineItems.length+' line items · KB v'+(meta.kbVersion||KB_VERSION)+'</div>'
    + '<div class="export-gate-checkbox"><input type="checkbox" id="csv-egate-chk"><label for="csv-egate-chk"><strong>I understand</strong> this CSV contains AI-generated estimates. All quantities and rates must be verified before use in commercial tenders. CONTRAQ accepts no liability for values used without independent verification.</label></div>'
    + '<div class="egate-btn-row">'
    + '<button class="btn btn-ghost btn-sm" onclick="this.closest(\'div[style]\').remove()" style="font-size:.72rem">Cancel</button>'
    + '<button class="btn btn-primary btn-sm" id="csv-egate-go" style="font-size:.72rem;opacity:.4;cursor:default" disabled>Export CSV →</button>'
    + '</div></div>';
  document.body.appendChild(csvGate);
  document.getElementById('csv-egate-chk').onchange = function() {
    var btn = document.getElementById('csv-egate-go');
    btn.disabled = !this.checked; btn.style.opacity = this.checked?'1':'.4'; btn.style.cursor = this.checked?'pointer':'default';
  };
  document.getElementById('csv-egate-go').onclick = function() {
    csvGate.remove();
    _qbDoCSVExport(t);
  };
}

function _qbDoCSVExport(t) {
  var meta = t.aiMetadata || {};
  var csv = '# AI-GENERATED ESTIMATE — REQUIRES HUMAN VERIFICATION\n'
    + '# Generated by CONTRAQ AI Quote Builder · Knowledge Base v'+(meta.kbVersion||KB_VERSION)+' · '+(meta.kbVersionDate||KB_VERSION_DATE)+'\n'
    + '# Quantities and rates are estimates based on drawing analysis and BSRIA/BS/NRM2 reference data.\n'
    + '# All values must be independently verified before use in commercial tenders.\n'
    + '# CONTRAQ accepts no liability for AI-generated outputs used without independent verification.\n'
    + '#\n'
    + 'Ref,Unit/Equipment,Service,Description,Qty,Unit,Rate,Total,Confidence,Level,Review Status,Source,Price Book Match,Assumptions\n';
  t.lineItems.forEach(function(li) {
    var asmText = (li.assumptions||[]).map(function(a){ return (a.param||'')+': '+(a.source||'')+(a.flag?' ['+a.flag+']':''); }).join(' | ');
    csv += '"'+li.ref+'","'+(li.unit_equip||'')+'","'+(li.service||'').replace(/"/g,'""')+'","'+li.desc.replace(/"/g,'""')+'",'+li.qty+',"'+li.unit+'",'+li.rate.toFixed(2)+','+li.total.toFixed(2)+','+li.conf+',"'+li.level+'","'+li.reviewState+'","'+li.src+'","'+(li.priceBookMatch||'')+'","'+asmText.replace(/"/g,'""')+'"\n';
  });
  var blob = new Blob([csv], {type:'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = t.ref + '-Line-Items.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported: ' + t.ref + '-Line-Items.csv', 'success');
}

/* ── Copy line items to clipboard as formatted text ───────── */
function qbCopyLineItems(tenderId) {
  var t = TENDERS.find(function(x){return x.id===tenderId;});
  if (!t || !t.lineItems) return;
  var text = t.ref + ' \u2014 ' + t.name + '\n';
  text += '='.repeat(60) + '\n';
  var _lastUnit = '';
  t.lineItems.forEach(function(li, i) {
    if (li.unit_equip && li.unit_equip !== _lastUnit) {
      text += '\n\u2699\uFE0F ' + li.unit_equip + '\n';
      text += '-'.repeat(40) + '\n';
      _lastUnit = li.unit_equip;
    }
    text += (i+1) + '. ' + li.ref + ' \u2014 ' + (li.service ? '[' + li.service + '] ' : '') + li.desc + '\n';
    text += '   Qty: ' + li.qty + ' ' + li.unit + ' \u00d7 \u00a3' + li.rate.toFixed(2) + ' = \u00a3' + Math.round(li.total).toLocaleString('en-GB') + '\n';
    text += '   Confidence: ' + li.conf + '% (' + li.level + ') \u00b7 Source: ' + li.src + (li.priceBookMatch ? ' \u00b7 PB: ' + li.priceBookMatch : '') + '\n\n';
  });
  var total = t.lineItems.reduce(function(s,li){return s+li.total;},0);
  text += '='.repeat(60) + '\n';
  text += 'TOTAL: \u00a3' + Math.round(total).toLocaleString('en-GB') + '\n';
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  else {
    var ta = document.createElement('textarea'); ta.value = text;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
  }
  showToast('Line items copied to clipboard.', 'success');
}

/* ── Re-quote: open AI builder pre-loaded with this quote's data ── */
function qbReQuote(tenderId) {
  var t = TENDERS.find(function(x){return x.id===tenderId;});
  if (!t || !t.lineItems) return;
  closeModal('modal-tender-detail');
  // Load the line items back into AI_EXTRACTION_DATA for re-pricing
  AI_EXTRACTION_DATA = t.lineItems.map(function(li) {
    return {
      ref: li.ref, desc: li.desc, qty: li.qty, unit: li.unit, rate: li.rate,
      hist: li.hist, histRange: li.histRange, conf: li.conf, level: li.level,
      flags: li.flags || [], src: li.src, srcPage: li.srcPage || 0
    };
  });
  _qbReviewState = {};
  _qbFiles = (t.aiMetadata && t.aiMetadata.sourceFiles)
    ? t.aiMetadata.sourceFiles.map(function(f){ return {name:f}; })
    : [{name:'Re-quote from ' + t.ref}];
  openModal('modal-qb-upload');
  // Skip upload, go straight to results
  setTimeout(function() {
    qbShowExtractionResults();
    document.getElementById('qb-upload-title').textContent = 'Re-Quote: ' + t.ref;
  }, 200);
}

function qbBackToUpload() {
  document.getElementById('qb-phase-results').style.display = 'none';
  document.getElementById('qb-phase-upload').style.display = '';
  document.getElementById('qb-upload-footer').style.display = '';
  document.getElementById('qb-results-footer').style.display = 'none';
  document.getElementById('qb-upload-title').textContent = 'AI Quote Builder';
  document.getElementById('qb-modal-inner').style.maxWidth = '560px';
}

function qbDiscardAndReset() {
  if (!confirm('Discard all uploaded documents and AI extraction data? This cannot be undone.')) return;
  // Clear files
  _qbFiles = [];
  // Clear extraction data
  if (typeof AI_EXTRACTION_DATA !== 'undefined') AI_EXTRACTION_DATA = [];
  // Reset UI back to initial upload state
  var results = document.getElementById('qb-phase-results');
  if (results) results.style.display = 'none';
  var upload = document.getElementById('qb-phase-upload');
  if (upload) upload.style.display = '';
  var uploadFooter = document.getElementById('qb-upload-footer');
  if (uploadFooter) uploadFooter.style.display = '';
  var resultsFooter = document.getElementById('qb-results-footer');
  if (resultsFooter) resultsFooter.style.display = 'none';
  var title = document.getElementById('qb-upload-title');
  if (title) title.textContent = 'AI Quote Builder';
  var inner = document.getElementById('qb-modal-inner');
  if (inner) inner.style.maxWidth = '560px';
  // Clear the file list display
  var fileList = document.getElementById('qb-file-list');
  if (fileList) fileList.innerHTML = '';
  // Reset the analyse button
  var analyseBtn = document.getElementById('qb-analyse-btn');
  if (analyseBtn) { analyseBtn.disabled = true; analyseBtn.style.opacity = '.4'; analyseBtn.style.cursor = 'default'; }
  // Clear the summary
  var summary = document.getElementById('qb-file-summary');
  if (summary) summary.textContent = '';
  // Reset progress bar if visible
  var progWrap = document.getElementById('qb-ai-prog-wrap');
  if (progWrap) progWrap.style.display = 'none';
  showToast('Quote Builder reset. Ready for a new project.', 'success');
}

function qbConfirmAndCreateQuote() {
  try {
  /* ── WORKFLOW INTEGRITY CHECK ─────────────────────────────── */
  if (!AI_EXTRACTION_DATA || AI_EXTRACTION_DATA.length === 0) {
    showToast('No extraction data available. Please run the AI analysis first.', 'error');
    return;
  }

  /* ── Count confidence levels for the gate ── */
  var _gateLow = 0, _gateMed = 0;
  AI_EXTRACTION_DATA.forEach(function(d,i) {
    if (_qbReviewState[i] === 'rejected') return;
    if (d.level === 'low') _gateLow++;
    else if (d.level === 'med') _gateMed++;
  });

  /* ── HUMAN REVIEW GATE — mandatory before any quote export ── */
  var gateOverlay = document.createElement('div');
  gateOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99998;display:flex;align-items:center;justify-content:center;';
  gateOverlay.innerHTML = '<div class="export-gate-modal">'
    + '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.15rem"><span style="font-size:1.1rem">⚠️</span><h3>Review &amp; Confirm — Export Gate</h3></div>'
    + '<div class="egate-meta">'
    + (_gateLow > 0 ? '<span style="color:var(--red);font-weight:600">'+_gateLow+' LOW confidence item'+(_gateLow>1?'s':'')+' </span> · ' : '')
    + (_gateMed > 0 ? '<span style="color:var(--yellow)">'+_gateMed+' MEDIUM confidence item'+(_gateMed>1?'s':'')+' </span> · ' : '')
    + 'Knowledge Base v'+KB_VERSION+' · '+KB_VERSION_DATE
    + '</div>'
    + '<div class="export-gate-checkbox"><input type="checkbox" id="egate-chk-1"><label for="egate-chk-1"><strong>I have reviewed the AI-generated quantities</strong> and understand they are estimates based on drawing analysis and industry reference data (BSRIA BG 85/87, BS 5422, NRM2, CIBSE conventions).</label></div>'
    + '<div class="export-gate-checkbox"><input type="checkbox" id="egate-chk-2"><label for="egate-chk-2"><strong>I have verified low and medium confidence items</strong> against the project specification and source documents where applicable.</label></div>'
    + '<div class="export-gate-checkbox"><input type="checkbox" id="egate-chk-3"><label for="egate-chk-3"><strong>I accept responsibility</strong> for any commercial decisions based on this output. CONTRAQ AI outputs are decision-support tools and are not a substitute for professional quantity surveying.</label></div>'
    + '<div class="egate-btn-row">'
    + '<button class="btn btn-ghost btn-sm" id="egate-cancel" style="font-size:.72rem">Cancel</button>'
    + '<button class="btn btn-primary btn-sm" id="egate-proceed" style="font-size:.72rem;opacity:.4;cursor:default" disabled>Confirm &amp; Create Quote →</button>'
    + '</div></div>';
  document.body.appendChild(gateOverlay);

  /* Wire up checkbox logic — all three must be checked */
  function egateCheck() {
    var c1 = document.getElementById('egate-chk-1').checked;
    var c2 = document.getElementById('egate-chk-2').checked;
    var c3 = document.getElementById('egate-chk-3').checked;
    var btn = document.getElementById('egate-proceed');
    if (c1 && c2 && c3) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
    else { btn.disabled = true; btn.style.opacity = '.4'; btn.style.cursor = 'default'; }
  }
  document.getElementById('egate-chk-1').onchange = egateCheck;
  document.getElementById('egate-chk-2').onchange = egateCheck;
  document.getElementById('egate-chk-3').onchange = egateCheck;
  document.getElementById('egate-cancel').onclick = function() { gateOverlay.remove(); };

  /* On proceed: log the confirmation timestamp and continue with quote creation */
  document.getElementById('egate-proceed').onclick = function() {
    var gateTimestamp = new Date().toISOString();
    gateOverlay.remove();
    _qbExecuteQuoteCreation(gateTimestamp);
  };

  } catch(err) {
    console.error('[QB] Export gate error:', err);
    showToast('Export gate error: ' + err.message, 'error');
  }
}

/* ── Actual quote creation — called after export gate is passed ── */
function _qbExecuteQuoteCreation(gateTimestamp) {
  try {
  if (!AI_EXTRACTION_DATA || AI_EXTRACTION_DATA.length === 0) return;
  console.log('[QB] Export gate passed at ' + gateTimestamp + '. Proceeding to quote compilation.');

  /* ── Read the LIVE values from the editable table (user may have changed qty/rate) ── */
  var lineItems = [];
  var grandTotal = 0;
  var highCount = 0, medCount = 0, lowCount = 0, flaggedCount = 0;
  var tbody = document.getElementById('qb-ext-tbody');
  var trs = tbody ? tbody.querySelectorAll('tr') : [];

  AI_EXTRACTION_DATA.forEach(function(d, i) {
    var state = _qbReviewState[i]; // accepted | flagged | rejected | undefined
    if (state === 'rejected') return; // excluded

    // Read live qty/rate from the DOM inputs
    var row = document.getElementById('qb-row-' + i);
    var qty = d.qty, rate = d.rate;
    if (row) {
      var inputs = row.querySelectorAll('.ext-editable');
      if (inputs.length >= 2) {
        qty = parseFloat(inputs[0].value) || d.qty;
        rate = parseFloat(inputs[1].value) || d.rate;
      }
    }
    var lineTotal = qty * rate;
    grandTotal += lineTotal;

    if (d.level === 'high') highCount++;
    else if (d.level === 'med') medCount++;
    else lowCount++;
    if (state === 'flagged') flaggedCount++;

    lineItems.push({
      ref: d.ref,
      service: d.service || '',
      unit_equip: d.unit_equip || '',
      desc: d.desc,
      qty: qty,
      unit: d.unit,
      rate: rate,
      total: Math.round(lineTotal * 100) / 100,
      conf: d.conf,
      level: d.level,
      flags: d.flags,
      assumptions: d.assumptions || [],
      src: d.src,
      srcPage: d.srcPage,
      hist: d.hist,
      histRange: d.histRange,
      reviewState: state || 'unreviewed',
      priceBookMatch: d.priceBookMatch || null,
      drawingScale: d.drawingScale || '',
      serviceStatus: d.serviceStatus || 'new'
    });
  });

  /* ── Generate next sequential QTE-YYYY-NNN reference ── */
  var year = new Date().getFullYear();
  var maxNum = 0;
  TENDERS.forEach(function(t) {
    if (t.ref && t.ref.indexOf('QTE-' + year) === 0) {
      var parts = t.ref.split('-');
      var n = parseInt(parts[2]) || 0;
      if (n > maxNum) maxNum = n;
    }
  });
  var nextNum = String(maxNum + 1).padStart(3, '0');
  var quoteRef = 'QTE-' + year + '-' + nextNum;
  var quoteId = 'ai-q-' + Date.now();

  /* ── Build project name from uploaded file names ── */
  var fileNames = _qbFiles.map(function(f) { return f.name; });
  var projectHint = fileNames[0] || 'AI-extracted quote';
  // Try to extract a sensible project name from file name (strip extension, common suffixes)
  var cleanName = projectHint.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    .replace(/(spec|rev|reva|revb|revc|bq|boq|enquiry|tender|quote)/gi, '')
    .replace(/\s+/g, ' ').trim();
  if (cleanName.length < 5) cleanName = 'AI-Extracted Scope';

  /* ── Prompt user for project name & client (inline — no second modal) ── */
  var defaultName = cleanName;
  var dialogOverlay = document.createElement('div');
  dialogOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;';
  dialogOverlay.innerHTML = '<div style="background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;padding:1.5rem;width:420px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.5);">'
    + '<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.1em;color:var(--orange);margin-bottom:.3rem;">New Quote</div>'
    + '<div style="font-size:.85rem;font-weight:700;color:var(--white);margin-bottom:.15rem;">' + quoteRef + '</div>'
    + '<div style="font-family:var(--mono);font-size:.65rem;color:var(--off3);margin-bottom:1rem;">' + lineItems.length + ' line items &middot; &pound;' + Math.round(grandTotal).toLocaleString('en-GB') + '</div>'
    + '<label style="font-size:.72rem;color:var(--off2);display:block;margin-bottom:.3rem;">Project name</label>'
    + '<input id="qb-name-input" type="text" value="' + defaultName.replace(/"/g,'&quot;') + '" style="width:100%;padding:.55rem .75rem;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--white);font-size:.82rem;font-family:var(--sans);outline:none;box-sizing:border-box;" />'
    + '<div style="display:flex;gap:.5rem;margin-top:1rem;justify-content:flex-end;">'
    + '<button id="qb-name-cancel" class="btn btn-ghost btn-sm" style="font-size:.72rem;">Cancel</button>'
    + '<button id="qb-name-ok" class="btn btn-primary btn-sm" style="font-size:.72rem;">Create Quote &rarr;</button>'
    + '</div></div>';
  document.body.appendChild(dialogOverlay);

  var nameInput = document.getElementById('qb-name-input');
  nameInput.focus();
  nameInput.select();

  /* Wait for user confirmation via Promise-like pattern with event listeners */
  var _quoteCreationPending = true;
  document.getElementById('qb-name-cancel').onclick = function() {
    _quoteCreationPending = false;
    dialogOverlay.remove();
  };
  var finishQuoteCreation = function() {
    if (!_quoteCreationPending) return;
    _quoteCreationPending = false;
    var projectName = (nameInput.value || '').trim() || defaultName;
    dialogOverlay.remove();

  /* ── Calculate confidence metadata ── */
  var avgConf = lineItems.length > 0
    ? Math.round(lineItems.reduce(function(s, li) { return s + li.conf; }, 0) / lineItems.length)
    : 0;
  var timeSaved = (lineItems.length * 0.22).toFixed(1);

  /* ── Build source files list for the quote ── */
  var sourceFiles = _qbFiles.map(function(f, i) {
    return {
      id: 'qf-ai-' + quoteId + '-' + i,
      filename: f.name,
      fileType: f.name.match(/\.pdf$/i) ? 'PDF' : f.name.match(/\.xlsx?$/i) ? 'Spreadsheet' : 'Document',
      revision: '—',
      date: new Date().toISOString().split('T')[0],
      size: f.size ? (f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB') : '—',
      status: 'Source'
    };
  });

  /* ── Create the tender/quote object ── */
  var today = new Date().toISOString().split('T')[0];
  var newTender = {
    id: quoteId,
    ref: quoteRef,
    name: projectName,
    client: '',
    clientName: '',
    value: Math.round(grandTotal),
    margin: 0,
    status: 'open',
    enquiry: today,
    submitted: '',
    decision: '',
    notes: 'AI-extracted from ' + _qbFiles.length + ' document' + (_qbFiles.length > 1 ? 's' : '')
      + '. ' + lineItems.length + ' line items · '
      + highCount + ' high / ' + medCount + ' medium / ' + lowCount + ' low confidence'
      + (flaggedCount > 0 ? ' · ' + flaggedCount + ' flagged for review' : '')
      + ' · Avg confidence: ' + avgConf + '%'
      + ' · Est. time saved: ' + timeSaved + ' hrs.',
    folders: {
      drawings: [],
      specs: sourceFiles.filter(function(f) { return f.fileType === 'PDF'; }),
      documents: sourceFiles.filter(function(f) { return f.fileType !== 'PDF'; })
    },
    quoteFiles: [],
    /* ─── NEW: Line items with full extraction metadata ─── */
    lineItems: lineItems,
    aiMetadata: {
      extractedAt: new Date().toISOString(),
      sourceFiles: fileNames,
      avgConfidence: avgConf,
      highCount: highCount,
      medCount: medCount,
      lowCount: lowCount,
      flaggedCount: flaggedCount,
      timeSavedHrs: parseFloat(timeSaved),
      totalItems: AI_EXTRACTION_DATA.length,
      acceptedItems: lineItems.length,
      rejectedItems: AI_EXTRACTION_DATA.length - lineItems.length,
      kbVersion: KB_VERSION,
      kbVersionDate: KB_VERSION_DATE,
      kbSources: KB_VERSION_SOURCES,
      exportGateConfirmedAt: gateTimestamp,
      exportGateUser: 'demo@contraq.co.uk'
    }
  };

  /* ── Insert at top of TENDERS array ── */
  TENDERS.unshift(newTender);

  /* ── Close modal, reset, navigate to Quote Book ── */
  closeModal('modal-qb-upload');
  qbResetUploadModal();
  dashNav('tenders');

  /* ── Success toast ── */
  showToast(
    '✓ Quote ' + quoteRef + ' created — '
    + lineItems.length + ' line items · £' + Math.round(grandTotal).toLocaleString('en-GB')
    + ' · ' + avgConf + '% avg confidence',
    'success'
  );

  /* ── Auto-open the tender detail after a short delay so user sees their quote ── */
  setTimeout(function() {
    openTenderDetailView(quoteId);
  }, 400);

  console.log('[QB] Quote successfully compiled: ' + quoteRef + ' — ' + lineItems.length + ' items, £' + Math.round(grandTotal));
  }; /* end finishQuoteCreation */

  document.getElementById('qb-name-ok').onclick = function() {
    try { finishQuoteCreation(); } catch(err) {
      dialogOverlay.remove();
      console.error('[QB] Quote compilation error:', err);
      showToast('Quote compilation error: ' + err.message + '. Check console for details.', 'error');
    }
  };
  nameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      try { finishQuoteCreation(); } catch(err) {
        dialogOverlay.remove();
        console.error('[QB] Quote compilation error:', err);
        showToast('Quote compilation error: ' + err.message + '. Check console for details.', 'error');
      }
    }
    if (e.key === 'Escape') { _quoteCreationPending = false; dialogOverlay.remove(); }
  });

  } catch(err) {
    console.error('[QB] Quote compilation error:', err);
    showToast('Quote compilation error: ' + err.message + '. Check console for details.', 'error');
  }
}

/* ── Reset upload modal state ───────────────────────────────── */
function qbResetUploadModal() {
  _qbFiles = [];
  _qbReviewState = {};
  var phaseUpload = document.getElementById('qb-phase-upload');
  var phaseResults = document.getElementById('qb-phase-results');
  var prog = document.getElementById('qb-ai-progress');
  var footer1 = document.getElementById('qb-upload-footer');
  var footer2 = document.getElementById('qb-results-footer');
  var btn = document.getElementById('qb-analyse-btn');
  var fi = document.getElementById('qb-file-input');
  var title = document.getElementById('qb-upload-title');
  var modal = document.getElementById('qb-modal-inner');

  if (phaseUpload) phaseUpload.style.display = '';
  if (phaseResults) phaseResults.style.display = 'none';
  if (prog) prog.classList.remove('active');
  if (footer1) footer1.style.display = '';
  if (footer2) footer2.style.display = 'none';
  if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.cursor = 'default'; }
  if (fi) fi.value = '';
  if (title) title.textContent = 'AI Quote Builder';
  if (modal) modal.style.maxWidth = '560px';
  document.getElementById('qb-ai-prog-fill').style.width = '0%';
  document.getElementById('qb-file-list').innerHTML = '';
  var sum = document.getElementById('qb-file-summary');
  if (sum) sum.style.display = 'none';
  var sp = document.getElementById('qb-ai-spinner');
  if (sp) sp.style.display = '';
  for (var ri = 1; ri <= 7; ri++) {
    var sEl = document.getElementById('qb-step-' + ri);
    if (sEl) { sEl.className = 'ai-step-item'; sEl.querySelector('.ai-step-icon').className = 'ai-step-icon pending'; sEl.querySelector('.ai-step-icon').innerHTML = ''; }
  }
}

/* ── Terms of Service — AI Liability Clauses ───────────────── */
