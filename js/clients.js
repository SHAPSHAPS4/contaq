/* ═══ CONTRAQ — CLIENTS ═══
   Client upload, client report, client detail, export
   Lines 11821-12411 from contraq-v77
═══════════════════════════════════════════ */



/* ══════════════════════════════════════════════════════════════
   DIARY — ALERT GENERATION
══════════════════════════════════════════════════════════════ */
function generateDiaryAlerts() {
  if (!SCHED_STATE || !SCHED_STATE.placeholders) return;
  var today    = new Date();
  today.setHours(0,0,0,0);
  var existing = NOTIFICATIONS.map(function(n){return n.id;});
  var added    = 0;

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    var d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return Math.round((d - today) / 86400000);
  }

  function pushIfNew(id, icon, text, panel, extraData) {
    if (existing.indexOf(id) >= 0) return;
    NOTIFICATIONS.unshift({id:id, icon:icon, text:text, time:'Now', unread:true, panel:panel, extra:extraData||null});
    added++;
  }

  /* 1. Placeholder bookings — alert 2 days in advance */
  SCHED_STATE.placeholders.forEach(function(ph) {
    var days = daysUntil(ph.date);
    if (days === null || days < 0 || days > 2) return;
    var pj   = PROJECTS.find(function(p){return p.id===ph.projectId;});
    var name = pj ? pj.name : (ph.note || 'Unassigned booking');
    var when = days === 0 ? 'TODAY' : days === 1 ? 'tomorrow' : 'in 2 days';
    var clientPart = ph.clientName ? ' (' + ph.clientName + ')' : '';
    pushIfNew(
      'ph-alert-'+ph.id,
      ICON.pin,
      'Unassigned booking ' + when + ': ' + name.split('—')[0].trim() + clientPart + ' — allocate an engineer?',
      'diary',
      {phId: ph.id}
    );
  });

  /* 2. Project deadlines — alert 14 days in advance */
  PROJECTS.forEach(function(p) {
    if (!p.end || (p.status !== 'active' && p.status !== 'pending')) return;
    var days = daysUntil(p.end);
    if (days === null || days < 0 || days > 14) return;
    var when = days === 0 ? 'TODAY' : days === 1 ? 'tomorrow' : 'in ' + days + ' days';
    pushIfNew(
      'deadline-alert-'+p.id,
      ICON.alert,
      'Deadline ' + when + ': ' + p.name.split('—')[0].trim() + ' (' + p.code + ') — prepare site team',
      'projects',
      {projectId: p.id}
    );
  });

  /* 3. Engineer certs — alert 21 days in advance */
  ENGINEERS.forEach(function(eng) {
    (eng.certs || []).forEach(function(cert) {
      if (!cert.expiry) return;
      var days = daysUntil(cert.expiry);
      if (days === null || days < 0 || days > 21) return;
      var when = days === 0 ? 'TODAY' : days === 1 ? 'tomorrow' : 'in ' + days + ' days';
      pushIfNew(
        'cert-alert-'+eng.id+'-'+cert.name.replace(/\s+/g,'-'),
        '⚠️',
        eng.name + ' cert expires ' + when + ': ' + cert.name + ' — schedule renewal',
        'engineers',
        {engId: eng.id}
      );
    });
  });

  if (added > 0) {
    buildNotifPanel();
    /* Flash the notif bell */
    var dot = document.getElementById('notif-dot');
    if (dot) { dot.style.display='block'; }
  }
}

function filterTendersBy(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#dash-content .tbl tbody tr').forEach(function(tr){
    tr.style.display = tr.textContent.toLowerCase().includes(q)?'':'none';
  });
}



/* ══════════════════════════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════════════════════════ */
function renderProjects(filter) {
  /* ── Fetch from API for real users, then re-render ── */
  if (ContraqAPI.isRealUser() && !STATE._projectsApiLoaded) {
    ContraqAPI.getProjects().then(function(projects) {
      // Map API fields into the format the renderer expects
      PROJECTS.length = 0; // Clear existing
      projects.forEach(function(p) {
        var client = CLIENTS.find(function(c){ return c.id === p.client_id; });
        PROJECTS.push({
          id: p.id,
          code: p.reference || p.code || '',
          name: p.name,
          client: p.client_id,
          clientName: p.clients ? p.clients.name : (client ? client.name : ''),
          status: p.status,
          value: Number(p.value) || 0,
          start: p.start_date,
          end: p.end_date,
          trade: p.trade || '',
          notes: p.notes || '',
          margin: Number(p.margin) || 20,
          costs: p.costs || null,
          billedToDate: Number(p.billed_to_date) || 0
        });
      });
      STATE._projectsApiLoaded = true;
      renderProjects(filter);
    }).catch(function(e) { console.error('[Projects] API load error:', e); });
    return;
  }

  /* ── Empty state ── */
  if (PROJECTS.length === 0) {
    document.getElementById('dash-content').innerHTML = '<div class="page-hdr"><div class="page-hdr-left"><h2>Projects</h2><p>0 projects</p></div>'
      + '<div style="display:flex;gap:.65rem"><button class="btn btn-primary btn-sm" onclick="openTradeModal(null)">+ New project</button></div></div>'
      + '<div class="empty-state" style="padding:3.5rem 1rem">'
      + '<div class="empty-icon" style="opacity:.3;color:var(--off3,#888)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg></div>'
      + '<div class="empty-title" style="font-size:1.1rem;color:var(--white);margin-bottom:.5rem">No active projects</div>'
      + '<div class="empty-sub" style="max-width:380px;margin:0 auto;line-height:1.6">Convert a won quote into a project, or create one manually to start tracking costs and progress.</div>'
      + '<button class="btn btn-primary" style="margin-top:1.25rem" onclick="openTradeModal(null)">Create First Project</button>'
      + '</div>';
    return;
  }
  filter = filter||'all';

  /* ── Counts for stat boxes ── */
  var nActive    = PROJECTS.filter(function(p){return p.status==='active';}).length;
  var nAwarded   = PROJECTS.filter(function(p){return p.status==='pending';}).length;
  var nPipeline  = PROJECTS.filter(function(p){return p.status==='tendered'||p.status==='submitted'||p.status==='quoted';}).length;
  var nCompleted = PROJECTS.filter(function(p){return p.status==='completed';}).length;

  /* ── Total contract values ── */
  var valActive    = PROJECTS.filter(function(p){return p.status==='active';}).reduce(function(s,p){return s+p.value;},0);
  var valCompleted = PROJECTS.filter(function(p){return p.status==='completed';}).reduce(function(s,p){return s+p.value;},0);

  /* Combined filters: status + client + 6-month */
  var sixMoAgo = new Date(); sixMoAgo.setMonth(sixMoAgo.getMonth()-6);
  var filtered = PROJECTS.filter(function(p){
    if (filter!=='all' && p.status!==filter) return false;
    if (STATE.projClientFilter!=='all' && p.client!==STATE.projClientFilter) return false;
    if (STATE.proj6mFilter) {
      var d = new Date(p.start||'');
      if (!p.start || isNaN(d.getTime()) || d < sixMoAgo) return false;
    }
    return true;
  });

  var html = '';

  /* ── Page header ── */
  html += '<div class="page-hdr"><div class="page-hdr-left"><h2>Projects</h2><div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'projects\')" title="What is this?">?</button><div class="help-tooltip" id="help-tip-projects">'+HELP_TIPS.projects+'</div></div><p>'+PROJECTS.length+' total &nbsp;·&nbsp; '+nActive+' active</p></div>'
    +'<div style="display:flex;gap:.65rem">'
    +'<button class="btn btn-dark btn-sm" onclick="exportProjectsCSV()">Export CSV</button>'
    +'<button class="btn btn-primary btn-sm" onclick="openTradeModal(null)">+ New project</button>'
    +'</div></div>';

  /* ── 4 stat KPI boxes ── */
  html += '<div class="kpi-grid proj-stat-grid">';

  html += '<div class="kpi proj-stat-kpi" style="--kc:var(--orange);cursor:pointer" onclick="openProjReport(\'active\')">'
    +'<div class="kpi-label">Total Active Projects</div>'
    +'<div class="kpi-val">'+nActive+'</div>'
    +'<div class="kpi-delta delta-up">&#8593; £'+fmtNum(valActive)+' contract value</div>'
    +'<div class="proj-stat-caret">View report &#8250;</div>'
    +'</div>';

  html += '<div class="kpi proj-stat-kpi" style="--kc:var(--lime);cursor:pointer" onclick="openProjReport(\'pending\')">'
    +'<div class="kpi-label">Awarded &amp; Mobilising</div>'
    +'<div class="kpi-val">'+nAwarded+'</div>'
    +'<div class="kpi-delta delta-up">&#8593; Projects won, starting soon</div>'
    +'<div class="proj-stat-caret">View report &#8250;</div>'
    +'</div>';

  html += '<div class="kpi proj-stat-kpi" style="--kc:var(--blue);cursor:pointer" onclick="openProjReport(\'pipeline\')">'
    +'<div class="kpi-label">Tendered &amp; Pipeline</div>'
    +'<div class="kpi-val">'+nPipeline+'</div>'
    +'<div class="kpi-delta" style="color:var(--off3)">Submitted / awaiting decision</div>'
    +'<div class="proj-stat-caret">View report &#8250;</div>'
    +'</div>';

  html += '<div class="kpi proj-stat-kpi" style="--kc:#a78bfa;cursor:pointer" onclick="openProjReport(\'completed\')">'
    +'<div class="kpi-label">Completed Projects</div>'
    +'<div class="kpi-val">'+nCompleted+'</div>'
    +'<div class="kpi-delta delta-up">&#8593; £'+fmtNum(valCompleted)+' delivered</div>'
    +'<div class="proj-stat-caret">View report &#8250;</div>'
    +'</div>';

  html += '</div>';

  /* ── Filter bar + table ── */
  var selCl = STATE.projClientFilter;
  var clientOpts = '<option value="all"'+(selCl==="all"?' selected':'')+'>All Clients</option>'
    + CLIENTS.map(function(c){
        return '<option value="'+c.id+'"'+(STATE.projClientFilter===c.id?' selected':'')+'>'+c.name+'</option>';
      }).join('');

  html += '<div class="bar" style="flex-wrap:wrap;gap:.5rem;">'
    + '<div class="search-box"><input placeholder="Search projects…" oninput="filterTableRows(this.value)"/></div>'
    + '<select class="filter-select" onchange="renderProjects(this.value)">'
    +   '<option value="all"'+(filter==='all'?' selected':'')+'>All statuses</option>'
    +   '<option value="active"'+(filter==='active'?' selected':'')+'>Active</option>'
    +   '<option value="pending"'+(filter==='pending'?' selected':'')+'>Pending</option>'
    +   '<option value="completed"'+(filter==='completed'?' selected':'')+'>Completed</option>'
    + '</select>'
    + '<select class="filter-select" style="min-width:140px;" onchange="STATE.projClientFilter=this.value;renderProjects(\''+filter+'\')">'
    +   clientOpts
    + '</select>'
    + '<label style="display:inline-flex;align-items:center;gap:.45rem;cursor:pointer;font-size:.74rem;color:var(--off2);white-space:nowrap;">'
    +   '<input type="checkbox" id="proj-6m-chk"'+(STATE.proj6mFilter?' checked':'')+' onchange="STATE.proj6mFilter=this.checked;renderProjects(\''+filter+'\')" style="accent-color:var(--lime);width:14px;height:14px;">'
    +   'Secured last 6 months'
    + '</label>'
    + (STATE.projClientFilter!=='all'||STATE.proj6mFilter ? '<button class="btn btn-dark btn-xs" onclick="clearProjFilters()">&#215; Clear filters</button>' : '')
    + '</div>';

  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl" id="projects-table"><thead><tr>'
    +'<th>Code</th><th>Project name</th><th>Client</th><th>Value</th><th>Margin</th><th>Status</th><th>Measures</th><th>Invoices</th><th></th>'
    +'</tr></thead><tbody>';

  html += filtered.map(function(p){
    var msrCount = SITE_MEASURES.filter(function(m){return m.project===p.id;}).length;
    var invCount = INVOICES.filter(function(i){return i.project===p.id;}).length;
    return '<tr>'
      +'<td class="mono">'+p.code+'</td>'
      +'<td class="strong">'+p.name+'</td>'
      +'<td>'+p.clientName+'</td>'
      +'<td class="mono">£'+fmtNum(p.value)+'</td>'
      +'<td class="mono">'+(p.margin?p.margin+'%':'—')+'</td>'
      +'<td>'+badge(p.status)+'</td>'
      +'<td class="mono" style="color:var(--off3)">'+(msrCount?'<a style="color:var(--orange);cursor:pointer" onclick="dashNav(\'measures\')" title="View measures">'+msrCount+' '+ICON.ruler+'</a>':'—')+'</td>'
      +'<td class="mono" style="color:var(--off3)">'+(invCount?'<a style="color:var(--blue);cursor:pointer" onclick="STATE.invFilterProject=\''+p.id+'\';dashNav(\'invoices\')" title="View invoices">'+invCount+' '+ICON.receipt+'</a>':'—')+'</td>'
      +'<td style="white-space:nowrap"><button class="btn btn-dark btn-xs" onclick="openProjectDetail(\''+p.id+'\')">View</button> <button class="btn btn-dark btn-xs" onclick="openTradeModal(\''+p.id+'\')">Edit</button></td>'
      +'</tr>';
  }).join('');

  if (!filtered.length) html += '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--off4)">No projects found.</td></tr>';
  html += '</tbody></table></div></div>';

  document.getElementById('dash-content').innerHTML = html;
}

/* ── Export CSV for projects ─────────────────────────────────── */
function clearProjFilters() {
  STATE.projClientFilter = 'all';
  STATE.proj6mFilter = false;
  renderProjects('all');
}

function exportProjectsCSV() {
  var rows = [['Code','Project','Client','Value','Margin%','Status','Start','End']];
  PROJECTS.forEach(function(p){
    rows.push([p.code,p.name,p.clientName,p.value,p.margin||'',p.status,p.start||'',p.end||'']);
  });
  var csv = rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download = 'contraq-projects.csv';
  a.click();
}

/* ── Project category export helper ─────────────────────────── */
function exportProjReportCSV(statusFilter) {
  var list = statusFilter==='pipeline'
    ? PROJECTS.filter(function(p){return p.status==='tendered'||p.status==='submitted'||p.status==='quoted';})
    : statusFilter==='all' ? PROJECTS
    : PROJECTS.filter(function(p){return p.status===statusFilter;});
  var rows = [['Code','Project','Client','Value','Margin%','Status']];
  list.forEach(function(p){
    rows.push([p.code,p.name,p.clientName,p.value,p.margin||'',p.status]);
  });
  var csv = rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download = 'contraq-projects-'+statusFilter+'.csv';
  a.click();
}

/* ── Open project report modal ───────────────────────────────── */
function openProjReport(category) {
  var titles = {
    active:'Active Projects Report',
    pending:'Awarded & Mobilising Report',
    pipeline:'Tendered & Pipeline Report',
    completed:'Completed Projects Report'
  };
  var colours = {
    active:'rgba(249,115,22,',
    pending:'rgba(163,230,53,',
    pipeline:'rgba(96,165,250,',
    completed:'rgba(167,139,250,'
  };

  var list = category==='pipeline'
    ? PROJECTS.filter(function(p){return p.status==='tendered'||p.status==='submitted'||p.status==='quoted';})
    : PROJECTS.filter(function(p){return p.status===category;});

  var totalVal  = list.reduce(function(s,p){return s+p.value;},0);
  var avgMargin = list.length ? Math.round(list.reduce(function(s,p){return s+(p.margin||0);},0)/list.length) : 0;
  var col       = colours[category]||'rgba(249,115,22,';

  /* ── Summary stats ── */
  var body = '';
  body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1.5rem">';
  body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Projects</div><div class="kpi-val">'+list.length+'</div></div>';
  body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Total Value</div><div class="kpi-val">£'+fmtNum(totalVal)+'</div></div>';
  body += '<div class="kpi" style="--kc:'+col+'1)"><div class="kpi-label">Avg Margin</div><div class="kpi-val">'+avgMargin+'%</div></div>';
  body += '</div>';

  /* ── Chart row — fixed-height wrappers prevent Chart.js resize loop ── */
  body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">';

  /* Bar chart: value by project */
  body += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">';
  body += '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.65rem">Contract Value by Project</div>';
  body += '<div style="position:relative;height:220px;width:100%"><canvas id="projrpt-bar"></canvas></div>';
  body += '</div>';

  /* Pie chart: value by client */
  body += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">';
  body += '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.65rem">Split by Client</div>';
  body += '<div style="position:relative;height:220px;width:100%"><canvas id="projrpt-pie"></canvas></div>';
  body += '</div>';

  body += '</div>';

  /* ── Project table ── */
  body += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead><tr>'
    +'<th>Code</th><th>Project</th><th>Client</th><th>Value</th><th>Margin</th><th>Status</th>'
    +'</tr></thead><tbody>';

  if (list.length) {
    list.forEach(function(p){
      var billedPct = p.value > 0 ? Math.round((p.billedToDate||0)/p.value*100) : 0;
      body += '<tr>'
        +'<td class="mono">'+p.code+'</td>'
        +'<td class="strong" style="cursor:pointer" onclick="closeModal(\'modal-proj-report\');setTimeout(function(){openProjectDetail(\''+p.id+'\')},80)">'+p.name+'</td>'
        +'<td>'+p.clientName+'</td>'
        +'<td class="mono">£'+fmtNum(p.value)+'</td>'
        +'<td class="mono">'+(p.margin?p.margin+'%':'—')+'</td>'
        +'<td>'+badge(p.status)+'</td>'
        +'</tr>';
    });
  } else {
    body += '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--off4)">No projects in this category.</td></tr>';
  }
  body += '</tbody></table></div></div>';

  /* ── Set modal content ── */
  document.getElementById('proj-report-title').textContent = titles[category]||'Projects Report';
  document.getElementById('proj-report-body').innerHTML = body;
  document.getElementById('proj-report-export').setAttribute('data-cat', category);
  openModal('modal-proj-report');

  /* ── Draw charts after modal opens ── */
  setTimeout(function(){
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = 'rgba(255,255,255,.55)';

    /* Destroy any existing Chart instances on these canvases to prevent duplication */
    ['projrpt-bar','projrpt-pie'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) {
        var existing = Chart.getChart(el);
        if (existing) existing.destroy();
      }
    });

    var PALETTE = [
      col+'0.75)',col+'0.55)',col+'0.45)',col+'0.35)',col+'0.25)',col+'0.65)',col+'0.85)'
    ];

    /* Bar chart */
    var barCtx = document.getElementById('projrpt-bar');
    if (barCtx && list.length) {
      new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: list.map(function(p){ return p.code; }),
          datasets: [{
            label: 'Contract Value (£)',
            data: list.map(function(p){ return p.value; }),
            backgroundColor: list.map(function(_,i){ return PALETTE[i%PALETTE.length]; }),
            borderColor: list.map(function(_,i){ return PALETTE[i%PALETTE.length].replace(/[\d.]+\)$/,'1)'); }),
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

    /* Pie chart — group by client */
    var pieCtx = document.getElementById('projrpt-pie');
    if (pieCtx && list.length) {
      var byClient = {};
      list.forEach(function(p){ byClient[p.clientName] = (byClient[p.clientName]||0) + p.value; });
      var clients = Object.keys(byClient);
      var PIE_COLOURS = [
        'rgba(249,115,22,.8)','rgba(163,230,53,.8)','rgba(96,165,250,.8)',
        'rgba(251,191,36,.8)','rgba(167,139,250,.8)','rgba(248,113,113,.8)','rgba(52,211,153,.8)'
      ];
      new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: clients,
          datasets: [{
            data: clients.map(function(c){ return byClient[c]; }),
            backgroundColor: clients.map(function(_,i){ return PIE_COLOURS[i%PIE_COLOURS.length]; }),
            borderColor: 'var(--bg3)',
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

/* ──── PROJECT DETAIL MODAL ─────────────────────────────────────
   Full interconnect view: invoices, engineers, measures, POs, P&L
══════════════════════════════════════════════════════════════ */
function openProjectDetail(projectId) {
  STATE.viewProjectId = projectId;
  var p = PROJECTS.find(function(x){return x.id===projectId;});
  if (!p) return;
  document.getElementById('proj-detail-title').textContent = p.code+' — '+p.name;
  renderProjectDetailTab(projectId, 'overview');
  openModal('modal-project-detail');
}

function renderProjectDetailTab(projectId, tab) {
  var p = PROJECTS.find(function(x){return x.id===projectId;});
  if (!p) return;
  var invs   = INVOICES.filter(function(i){return i.project===projectId;});
  var msrs   = SITE_MEASURES.filter(function(m){return m.project===projectId;});
  var pos    = PO_REGISTER.filter(function(po){return po.project===projectId;});
  var events = CALENDAR_EVENTS.filter(function(ev){return ev.project===projectId;});
  var tender = TENDERS.find(function(t){return t.linkedProjectId===projectId;});
  var client = CLIENTS.find(function(c){return c.id===p.client;});
  var totalCosts = p.costs ? (p.costs.labour+p.costs.materials+p.costs.subcontract+p.costs.overhead) : Math.round(p.value*(1-(p.margin||20)/100));
  var gp = p.value - totalCosts;
  var billed = invs.reduce(function(s,i){return s+i.amount;},0);
  var collected = invs.filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+i.amount;},0);

  // Collect all engineers assigned to this project's events
  var engIds = [];
  events.forEach(function(ev){(ev.engineers||[]).forEach(function(eid){if(engIds.indexOf(eid)<0)engIds.push(eid);});});
  var assignedEngs = ENGINEERS.filter(function(e){return engIds.indexOf(e.id)>=0;});

  var tabs = ['overview','invoices','measures','engineers','procurement','p&l','attachments','journal'];
  var flds = p.folders||{};
  var totalFolderDocs = ((flds.drawings||[]).length+(flds.specs||[]).length+(flds.documents||[]).length+(flds.purchaseOrder||[]).length+(flds.voQuote||[]).length);
  var tabLabels = {overview:'Overview',invoices:'Invoices ('+invs.length+')',measures:'Measures ('+msrs.length+')',engineers:'Team ('+assignedEngs.length+')',procurement:'POs ('+pos.length+')','p&l':'P&L',attachments:'Docs ('+(totalFolderDocs+(p.quoteFiles||[]).length)+')','journal':'Journal ('+(p.journal||[]).length+')'};

  var html = '<div class="proj-detail-tabs">';
  tabs.forEach(function(t){
    html += '<div class="proj-detail-tab'+(t===tab?' active':'')+'" onclick="renderProjectDetailTab(\''+projectId+'\',\''+t+'\')">'+tabLabels[t]+'</div>';
  });
  html += '</div>';

  if (tab==='overview') {
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.65rem;margin-bottom:1rem">';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--orange)">£'+fmtNum(p.value)+'</div><div class="cl-detail-stat-label">Contract value</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--lime)">'+(p.margin||'—')+'%</div><div class="cl-detail-stat-label">Target margin</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--blue)">£'+fmtNum(billed)+'</div><div class="cl-detail-stat-label">Billed to date</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:'+(invs.some(function(i){return i.status==='overdue';})? 'var(--red)':'var(--lime)')+'">£'+fmtNum(collected)+'</div><div class="cl-detail-stat-label">Collected</div></div>';
    html += '</div>';
    html += '<div class="cl-detail-section-title">Project details</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.8rem">';
    var fields = [
      ['Client', client?('<span style="color:var(--orange);cursor:pointer" onclick="closeModal(\'modal-project-detail\');openClientDetail(\''+p.client+'\')">'+p.clientName+'</span>'):p.clientName],
      ['Status', badge(p.status)],
      ['Start', fmtDate(p.start)],
      ['End', fmtDate(p.end)],
      ['Quote ref', tender?('<span style="color:var(--lime);cursor:pointer;font-family:var(--mono);font-size:.72rem" onclick="closeModal(\'modal-project-detail\');openTenderModal(\''+tender.id+'\')">'+tender.ref+'</span>'):'—'],
      ['PO count', pos.length+' order'+(pos.length!==1?'s':'')],
    ];
    fields.forEach(function(f){
      html += '<div style="background:var(--bg3);border-radius:6px;padding:.5rem .75rem"><div style="font-size:.6rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--off4);margin-bottom:.15rem">'+f[0]+'</div><div style="font-size:.8rem;color:var(--white)">'+f[1]+'</div></div>';
    });
    html += '</div>';
    if (p.notes) html += '<div style="font-size:.78rem;color:var(--off3);padding:.65rem .8rem;background:var(--bg3);border-radius:7px;margin-bottom:.8rem;line-height:1.5">'+p.notes+'</div>';
    // Recent events
    if (events.length) {
      html += '<div class="cl-detail-section-title">Diary events ('+events.length+')</div>';
      events.slice(0,3).forEach(function(ev){
        html += '<div class="proj-conn-row"><span class="proj-conn-icon">'+ICON.calendar+'</span><span class="proj-conn-label">'+ev.title+'</span><span class="proj-conn-meta">'+fmtDate(ev.date)+' '+ev.time+'</span><a class="proj-conn-action" onclick="closeModal(\'modal-project-detail\');dashNav(\'diary\')">Diary →</a></div>';
      });
    }
  }

  if (tab==='invoices') {
    html += '<div style="display:flex;justify-content:flex-end;margin-bottom:.75rem"><button class="btn btn-primary btn-sm" onclick="prefillInvoice(\''+projectId+'\');closeModal(\'modal-project-detail\')">+ Raise invoice</button></div>';
    if (!invs.length) { html += '<div style="text-align:center;padding:2rem;color:var(--off4)">No invoices raised yet for this project.</div>'; }
    else {
      html += '<table class="tbl"><thead><tr><th>Ref</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>';
      html += invs.map(function(inv){ return '<tr><td class="mono">'+inv.ref+'</td><td class="mono">£'+fmtNum(inv.amount)+'</td><td class="mono"'+(inv.status==='overdue'?' style="color:var(--red)"':'')+'>'+fmtDate(inv.due)+'</td><td>'+badge(inv.status)+'</td><td><button class="btn btn-dark btn-xs" onclick="openInvoiceModal(\''+inv.id+'\')">Edit</button></td></tr>'; }).join('');
      html += '</tbody></table>';
    }
  }

  if (tab==='measures') {
    html += '<div style="display:flex;justify-content:flex-end;margin-bottom:.75rem"><button class="btn btn-primary btn-sm" onclick="openMeasureModal(null,\''+projectId+'\');closeModal(\'modal-project-detail\')">+ Upload measure</button></div>';
    if (!msrs.length) { html += '<div style="text-align:center;padding:2rem;color:var(--off4)">No site measures attached to this project.</div>'; }
    else { msrs.forEach(function(m){ html += '<div class="measures-list-row"><span class="measure-file-icon">'+m.icon+'</span><div><div class="measure-file-name">'+m.name+'</div><div style="font-size:.65rem;color:var(--off4)">'+m.rev+' · Uploaded by '+m.engineerName+'</div></div><span class="measure-file-size">'+fmtFileSize(m.sizekb)+'</span><span class="measure-file-date">'+fmtDate(m.date)+'</span><button class="btn btn-dark btn-xs" onclick="openMeasureModal(\''+m.id+'\')">Edit</button></div>'; }); }
  }

  if (tab==='engineers') {
    if (!assignedEngs.length) { html += '<div style="text-align:center;padding:2rem;color:var(--off4)">No engineers assigned via diary events yet.<br><a style="color:var(--orange);cursor:pointer" onclick="closeModal(\'modal-project-detail\');dashNav(\'diary\')">Add a diary event →</a></div>'; }
    else {
      html += '<div style="margin-bottom:.6rem;font-size:.75rem;color:var(--off3)">Engineers assigned via '+events.length+' diary event'+(events.length!==1?'s':'')+' linked to this project:</div>';
      assignedEngs.forEach(function(e){
        var worstCert = worstCertStatus(e.certs||[]);
        html += '<div class="proj-conn-row"><span class="proj-conn-icon">'+ICON.worker+'</span><div class="proj-conn-label"><div style="font-weight:600">'+e.name+'</div><div style="font-size:.65rem;color:var(--off4)">'+e.trade+' · '+e.type+'</div></div>'+(worstCert&&worstCert.days<90?'<span style="font-size:.68rem;color:var(--red)">⚠ Cert alert</span>':'')+'<a class="proj-conn-action" onclick="closeModal(\'modal-project-detail\');dashNav(\'engineers\');setTimeout(function(){openEngineerModal(\''+e.id+'\')},120)">Profile →</a></div>';
      });
    }
  }

  if (tab==='procurement') {
    var poNet   = pos.reduce(function(s,po){ return s+(po.items?po.items.reduce(function(ss,it){return ss+it.qty*it.unitCost;},0):0); },0);
    var poGross = Math.round(poNet*1.20);
    var poOut   = pos.filter(function(po){return po.status==='outstanding'||po.status==='partial';}).length;
    html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;">'
      +'<div style="font-family:var(--mono);font-size:.62rem;color:var(--off3);">'
      +pos.length+' orders &nbsp;&middot;&nbsp; <span style="color:var(--white);">&#163;'+fmtNum(poGross)+'</span> total inc. VAT'
      +'&nbsp;&middot;&nbsp; <span style="color:'+(poOut?'var(--orange)':'var(--lime)')+'">'+poOut+' outstanding</span>'
      +'</div>'
      +'<div style="display:flex;gap:.45rem;">'
      +'<button class="btn btn-sm" style="background:rgba(163,230,53,.1);color:var(--lime);border:1px solid rgba(163,230,53,.3);" onclick="openMaterialsSummary(\''+p.id+'\');">&#9660; Total Materials Summary</button>'
      +'<button class="btn btn-primary btn-sm" onclick="closeModal(\'modal-project-detail\');dashNav(\'procurement\');setTimeout(function(){openPOModal(null)},120)">+ Create PO</button>'
      +'</div>'
      +'</div>';
    if (!pos.length) {
      html += '<div style="text-align:center;padding:2rem;color:var(--off4)">No purchase orders for this project yet.</div>';
    } else {
      html += '<div class="card" style="padding:0;margin-bottom:0"><div style="overflow-x:auto"><table class="tbl"><thead><tr>'
        +'<th style="width:28px;padding:.5rem .4rem;"></th>'
        +'<th>PO Ref</th><th>Supplier</th><th>Date Sent</th>'
        +'<th>Total (inc. VAT)</th><th>Status</th>'
        +'<th>Outstanding Items</th><th>Later Delivery</th><th></th>'
        +'</tr></thead><tbody>';
      html += pos.map(function(po){
        var net  = po.items?po.items.reduce(function(s,it){return s+it.qty*it.unitCost;},0):0;
        var gross= Math.round(net*1.20);
        var outItems = po.items?po.items.filter(function(it){return it.outstanding;}):[]; 
        var outQty   = outItems.reduce(function(s,it){return s+(it.outstandingQty||it.qty);},0);
        var dot,lbl;
        if (po.status==='delivered') {
          dot='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#a3e635;flex-shrink:0;"></span>';
          lbl='<span style="color:#a3e635;font-size:.7rem;font-weight:600;">Delivered</span>';
        } else if (po.status==='partial') {
          dot='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f97316;flex-shrink:0;"></span>';
          lbl='<span style="color:#f97316;font-size:.7rem;font-weight:600;">Partial</span>';
        } else {
          dot='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f87171;flex-shrink:0;"></span>';
          lbl='<span style="color:#f87171;font-size:.7rem;font-weight:600;">Outstanding</span>';
        }
        return '<tr style="cursor:pointer" onclick="renderPODetail(\''+po.id+'\',\''+projectId+'\')" onmouseenter="this.style.background=\'rgba(255,255,255,.04)\'" onmouseleave="this.style.background=\'\'">'
          +'<td style="padding:.5rem .4rem;text-align:center;">'+dot+'</td>'
          +'<td class="mono" style="font-size:.68rem;">'+po.id+'</td>'
          +'<td style="font-weight:600;">'+po.supplier+'</td>'
          +'<td class="mono">'+fmtDate(po.date)+'</td>'
          +'<td class="mono">&#163;'+fmtNum(gross)+'</td>'
          +'<td><div style="display:flex;align-items:center;gap:.35rem;">'+dot+lbl+'</div></td>'
          +'<td class="mono" style="font-size:.72rem;">'+(outItems.length
            ?'<span style="color:var(--orange);">&#9888; '+outQty+' items</span>'
            :'<span style="color:var(--lime);">&#10003; None</span>')
          +'</td>'
          +'<td class="mono" style="font-size:.7rem;color:var(--off3);">'+(po.deliveredLaterDate?fmtDate(po.deliveredLaterDate):'&#8212;')+'</td>'
          +'<td><button class="btn btn-dark btn-xs" onclick="event.stopPropagation();renderPODetail(\''+po.id+'\',\''+projectId+'\')">View</button></td>'
          +'</tr>';
      }).join('');
      html += '</tbody></table></div></div>';
    }
  }

  if (tab==='p&l') {
    var costs = p.costs || {labour:0,materials:0,subcontract:0,overhead:0};
    var tc = costs.labour+costs.materials+costs.subcontract+costs.overhead;
    var gpVal = p.value - tc;
    var gpPct = p.value ? Math.round(gpVal/p.value*100) : 0;
    var billedPct = p.value ? Math.round(billed/p.value*100) : 0;
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem;margin-bottom:1rem">';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val">£'+fmtNum(p.value)+'</div><div class="cl-detail-stat-label">Contract value</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--red)">£'+fmtNum(tc)+'</div><div class="cl-detail-stat-label">Est. cost</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--lime)">£'+fmtNum(gpVal)+' ('+gpPct+'%)</div><div class="cl-detail-stat-label">Gross profit</div></div>';
    html += '</div>';
    html += '<div class="cl-detail-section-title">Cost breakdown</div>';
    var costItems = [['Labour',costs.labour,'var(--orange)'],['Materials',costs.materials,'var(--blue)'],['Subcontract',costs.subcontract,'var(--yellow)'],['Overhead',costs.overhead,'var(--off3)']];
    costItems.forEach(function(ci){
      var pct = p.value ? Math.round(ci[1]/p.value*100) : 0;
      html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.55rem"><span style="font-size:.75rem;color:var(--off2);width:90px">'+ci[0]+'</span><div style="flex:1;height:7px;background:var(--bg4);border-radius:4px"><div style="width:'+pct+'%;height:100%;background:'+ci[2]+';border-radius:4px;opacity:.8"></div></div><span style="font-family:var(--mono);font-size:.72rem;color:var(--white);white-space:nowrap">£'+fmtNum(ci[1])+'</span></div>';
    });
    html += '<div class="cl-detail-section-title">Billing status</div>';
    html += '<div style="font-size:.78rem;color:var(--off3);margin-bottom:.5rem">'+billedPct+'% billed · £'+fmtNum(billed)+' of £'+fmtNum(p.value)+' contract value</div>';
    html += '<div style="height:8px;background:var(--bg4);border-radius:4px;margin-bottom:.75rem"><div style="width:'+billedPct+'%;height:100%;background:var(--lime);border-radius:4px;transition:width .4s"></div></div>';
  }

  if (tab === 'attachments') {
    html += renderFoldersUI('project', p.id, p.folders||{}, p.quoteFiles||[]);
  }

  if (tab === 'journal') {
    html += renderJournalTab(p.id, p.journal || []);
  }

  document.getElementById('proj-detail-body').innerHTML = html;
}
