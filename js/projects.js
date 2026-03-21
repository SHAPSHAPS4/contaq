/* ═══ CONTRAQ — PROJECTS ═══
   filterTendersBy, project filters, export, project report
   Lines 12601-12824 from contraq-v77
═══════════════════════════════════════════ */





/* ══════════════════════════════════════════════════════════════
   INVOICES
══════════════════════════════════════════════════════════════ */
function renderInvoices() {
  /* ── Empty state ── */
  if (INVOICES.length === 0) {
    document.getElementById('dash-content').innerHTML = '<div class="page-hdr"><div class="page-hdr-left"><h2>Invoices</h2><p>0 invoices</p></div></div>'
      + '<div class="empty-state" style="padding:3.5rem 1rem">'
      + '<div class="empty-icon" style="opacity:.3;color:var(--off3,#888)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>'
      + '<div class="empty-title" style="font-size:1.1rem;color:var(--white);margin-bottom:.5rem">No invoices raised</div>'
      + '<div class="empty-sub" style="max-width:380px;margin:0 auto;line-height:1.6">Raise your first invoice directly from a project. Get paid faster with automated payment reminders.</div>'
      + '<button class="btn btn-primary" style="margin-top:1.25rem" onclick="prefillInvoice(null)">Raise an Invoice</button>'
      + '</div>';
    return;
  }
  var filterMonth   = STATE.invFilterMonth   || 'all';
  var filterClient  = STATE.invFilterClient  || 'all';
  var filterProject = STATE.invFilterProject || 'all';
  var filterStatus  = STATE.invFilterStatus  || 'all';

  // KPIs — always from full INVOICES
  var totalPaid    = INVOICES.filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+i.amount;},0);
  var totalOut     = INVOICES.filter(function(i){return i.status==='sent'||i.status==='overdue';}).reduce(function(s,i){return s+i.amount;},0);
  var overdueAmt   = INVOICES.filter(function(i){return i.status==='overdue';}).reduce(function(s,i){return s+i.amount;},0);
  var overdueList  = INVOICES.filter(function(i){return i.status==='overdue'||i.status==='sent';});
  var draftList    = INVOICES.filter(function(i){return i.status==='draft';});

  var html = '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.8rem"><h2 style="font-size:1.15rem;font-weight:700;color:var(--white);margin:0">Invoices</h2><div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'invoices\')" title="What is this?">?</button><div class="help-tooltip" id="help-tip-invoices">'+HELP_TIPS.invoices+'</div></div></div>';
  html += '<div class="kpi-grid">'
    + kpiCard('Collected YTD','£'+fmtNum(totalPaid),INVOICES.filter(function(i){return i.status==='paid';}).length+' paid invoices','up',{background:'var(--lime)'},null)
    + kpiCard('Outstanding','£'+fmtNum(totalOut),INVOICES.filter(function(i){return i.status==='sent';}).length+' awaiting payment','dn',{background:'var(--blue)'},null)
    + kpiCard('Overdue','£'+fmtNum(overdueAmt),INVOICES.filter(function(i){return i.status==='overdue';}).length+' invoices overdue','dn',{background:'var(--red)'},null)
    + kpiCard('Total raised','£'+fmtNum(INVOICES.reduce(function(s,i){return s+i.amount;},0)),'All time','up',{background:'var(--orange)'},null)
    + '</div>';

  // ── Outstanding tracker ──────────────────────────────────────
  if (overdueList.length || draftList.length) {
    html += '<div class="inv-outstanding-section">';
    if (overdueList.length) {
      html += '<div class="inv-outstanding-title">⚠ Overdue &amp; Awaiting Payment ('+overdueList.length+')</div>';
      html += overdueList.map(function(inv){
        var now = new Date(); var due = new Date(inv.due);
        var daysLate = Math.round((now-due)/(1000*60*60*24));
        var isOv = inv.status==='overdue';
        var dayLabel = isOv ? (daysLate+' days overdue') : ('Due '+fmtDate(inv.due));
        return '<div class="inv-outstanding-row '+(isOv?'overdue':'')+'">'
          + '<div class="inv-out-info"><div class="inv-out-ref">'+inv.ref+'</div><div class="inv-out-client">'+inv.clientName+' · '+inv.projectName+'</div></div>'
          + '<span class="inv-out-days '+(isOv?'overdue':'pending')+'">'+dayLabel+'</span>'
          + '<span class="inv-out-amt" style="color:'+(isOv?'var(--red)':'var(--white)')+'">£'+fmtNum(inv.amount)+'</span>'
          + (isOv
            ? '<button class="btn btn-xs" style="background:rgba(248,113,113,.12);color:var(--red);border:1px solid rgba(248,113,113,.2);white-space:nowrap" onclick="sendReminder(\''+inv.id+'\')">Send reminder</button>'
            : '<button class="btn btn-dark btn-xs" onclick="openInvoiceModal(\''+inv.id+'\')">Edit</button>')
          + '</div>';
      }).join('');
    }
    if (draftList.length) {
      html += '<div class="inv-outstanding-title" style="margin-top:.8rem">' + ICON.edit + ' Draft Invoices ('+draftList.length+') — not yet sent</div>';
      html += draftList.map(function(inv){
        return '<div class="inv-outstanding-row draft">'
          + '<div class="inv-out-info"><div class="inv-out-ref">'+inv.ref+'</div><div class="inv-out-client">'+inv.clientName+' · '+inv.projectName+'</div></div>'
          + '<span class="inv-out-days draft">Draft</span>'
          + '<span class="inv-out-amt" style="color:var(--yellow)">£'+fmtNum(inv.amount)+'</span>'
          + '<button class="btn btn-xs" style="background:rgba(163,230,53,.1);color:var(--lime);border:1px solid rgba(163,230,53,.2);white-space:nowrap" onclick="sendDraft(\''+inv.id+'\')">Mark sent →</button>'
          + '</div>';
      }).join('');
    }
    html += '</div>';
  }

  // ── Filters ──────────────────────────────────────────────────
  var months = ['all'];
  INVOICES.forEach(function(i){ var m=i.date.slice(0,7); if(months.indexOf(m)<0) months.push(m); });
  months.sort(); if(months[0]==='all') months.unshift(months.splice(months.indexOf('all'),1)[0]);

  html += '<div class="inv-filter-bar">'
    + '<select class="inv-filter-select" onchange="STATE.invFilterMonth=this.value;renderInvoices()">'
    + months.map(function(m){return '<option value="'+m+'"'+(m===filterMonth?' selected':'')+'>'+( m==='all'?'All months':m)+'</option>';}).join('')+'</select>'
    + '<select class="inv-filter-select" onchange="STATE.invFilterClient=this.value;renderInvoices()">'
    + '<option value="all">All clients</option>'
    + CLIENTS.map(function(c){return '<option value="'+c.id+'"'+(c.id===filterClient?' selected':'')+'>'+c.name+'</option>';}).join('')+'</select>'
    + '<select class="inv-filter-select" onchange="STATE.invFilterProject=this.value;renderInvoices()">'
    + '<option value="all">All projects</option>'
    + PROJECTS.map(function(p){return '<option value="'+p.id+'"'+(p.id===filterProject?' selected':'')+'>'+p.code+'</option>';}).join('')+'</select>'
    + '<select class="inv-filter-select" onchange="STATE.invFilterStatus=this.value;renderInvoices()">'
    + ['all','paid','sent','overdue','draft'].map(function(s){return '<option value="'+s+'"'+(s===filterStatus?' selected':'')+'>'+s.charAt(0).toUpperCase()+s.slice(1)+'</option>';}).join('')+'</select>'
    + '<span class="inv-filter-clear" onclick="STATE.invFilterMonth=\'all\';STATE.invFilterClient=\'all\';STATE.invFilterProject=\'all\';STATE.invFilterStatus=\'all\';renderInvoices()">Clear filters</span>'
    + '<button class="btn btn-dark btn-sm" onclick="exportCSV()" style="margin-left:auto">Export</button>'
    + '</div>';

  // ROI insight banner
  var _roiOvCount = INVOICES.filter(function(i){return i.status==='overdue';}).length;
  html += roiBanner('invoices', '⏱',
    'Payment delays create cash flow gaps \u2014 tracking overdue invoices helps you chase faster',
    _roiOvCount + ' invoices overdue · Total outstanding: £' + fmtNum(overdueAmt)
  );

  // Apply filters
  var filtered = INVOICES.filter(function(i){
    if (filterStatus!=='all' && i.status!==filterStatus) return false;
    if (filterClient!=='all' && i.client!==filterClient) return false;
    if (filterProject!=='all' && i.project!==filterProject) return false;
    if (filterMonth!=='all' && !i.date.startsWith(filterMonth)) return false;
    return true;
  });

  html += '<div class="card"><div class="card-header"><span class="card-title">Invoice Log</span><span style="font-size:.72rem;color:var(--off4);font-family:var(--mono)">'+filtered.length+' of '+INVOICES.length+' invoices</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Invoice</th><th>Client</th><th>Project</th><th>Amount</th><th>Issued</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>';
  html += filtered.map(function(inv){
    var isOv = inv.status==='overdue';
    return '<tr>'
      +'<td class="mono">'+inv.ref+'</td>'
      +'<td class="strong">'+inv.clientName+'</td>'
      +'<td style="font-size:.75rem;color:var(--off3)">'+inv.projectName+'</td>'
      +'<td class="mono">£'+fmtNum(inv.amount)+'</td>'
      +'<td class="mono">'+fmtDate(inv.date)+'</td>'
      +'<td class="mono"'+(isOv?' style="color:var(--red)"':'')+'>'+fmtDate(inv.due)+'</td>'
      +'<td>'+badge(inv.status)+'</td>'
      +'<td><button class="btn btn-dark btn-xs" onclick="openInvoiceModal(\''+inv.id+'\')">Edit</button></td>'
      +'</tr>';
  }).join('');
  if (!filtered.length) html+='<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--off4)">No invoices match the current filters.</td></tr>';
  html += '</tbody></table></div></div>';
  document.getElementById('dash-content').innerHTML = html;
}

function sendReminder(invId) {
  var inv = INVOICES.find(function(i){return i.id===invId;});
  if (!inv) return;
  showToast('Reminder sent to '+inv.clientName+' for '+inv.ref+'.','success');
}

function sendDraft(invId) {
  var inv = INVOICES.find(function(i){return i.id===invId;});
  if (!inv) return;
  var idx = INVOICES.findIndex(function(i){return i.id===invId;});
  if (idx>=0) INVOICES[idx].status = 'sent';
  showToast(inv.ref+' marked as sent.','success');
  renderInvoices();
}

function prefillInvoice(projectId) {
  var proj = PROJECTS.find(function(p){return p.id===projectId;});
  if (!proj) return;
  var unbilled = Math.round(proj.value * 0.6 - (proj.billedToDate||0));
  // Navigate to Invoices tab first so the modal context is correct
  dashNav('invoices');
  setTimeout(function(){
    openInvoiceModal(null, {projectId:projectId, clientId:proj.client, amount:unbilled, desc:'Payment application — '+proj.name});
  }, 80);
}



/* ══════════════════════════════════════════════════════════════
   PROCUREMENT (v6 — category-coded refs, supplier links)
══════════════════════════════════════════════════════════════ */
