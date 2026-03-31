/* ═══ CONTRAQ — PROCUREMENT ═══
   Procurement rendering, PO creation, PO email, mark delivered
   Lines 14901-15249 from contraq-v77
═══════════════════════════════════════════ */



/* ── PO Email / Created Modal (Procurement tab only) ── */
function openPOCreatedModal(poId) {
  var po  = PO_REGISTER.find(function(x){ return x.id === poId; });
  if (!po) return;
  STATE.currentPOId = poId;
  var pj  = PROJECTS.find(function(p){ return p.id === po.project; });
  document.getElementById('po-created-ref').textContent = poId;
  document.getElementById('po-created-summary').innerHTML =
    (pj ? '<strong style="color:var(--white);">' + pj.code + '</strong> ' + (pj.name.split('—')[0].trim()) + '<br>' : '')
    + 'Supplier: <strong style="color:var(--white);">' + po.supplier + '</strong><br>'
    + 'Value: <strong style="color:var(--lime);">&#163;' + fmtNum(po.totalValue) + '</strong> ex.VAT';
  openModal('modal-po-created');
}

function openPOEmailModal() {
  var poId = STATE.currentPOId;
  var po   = PO_REGISTER.find(function(x){ return x.id === poId; });
  if (!po) return;

  closeModal('modal-po-created');

  var pj    = PROJECTS.find(function(p){ return p.id === po.project; });
  var supObj= SUPPLIERS.find(function(s){ return s.id === po.supplierId; });
  var supEmail = supObj && supObj.email ? supObj.email : '';
  var userEmail = (STATE.user && STATE.user.email) ? STATE.user.email
                : (typeof DEMO_USER !== 'undefined' ? DEMO_USER.email : '');

  // Warn if no supplier email
  var warn = document.getElementById('po-email-warn');
  if (!supEmail) {
    warn.style.display = 'block';
    warn.textContent = '⚠ No email address found for ' + po.supplier + '. Please enter an address manually or add it in Suppliers.';
  } else {
    warn.style.display = 'none';
  }
  if (!userEmail) {
    warn.style.display = 'block';
    warn.textContent = (warn.textContent ? warn.textContent + ' ' : '') + '⚠ Add your email in Settings to enable PO emailing.';
  }

  document.getElementById('po-email-to').value      = supEmail;
  document.getElementById('po-email-cc').value       = userEmail;
  document.getElementById('po-email-subject').value  = 'Purchase Order ' + po.id + ' — ' + (pj ? pj.name.split('—')[0].trim() : 'Project');

  var _crlf = '\n';
  var _name = STATE.user ? STATE.user.fname + ' ' + STATE.user.lname : (typeof DEMO_USER !== 'undefined' ? DEMO_USER.fname + ' ' + DEMO_USER.lname : 'The Team');
  var _co   = typeof DEMO_USER !== 'undefined' ? DEMO_USER.company : '';
  var defaultBody = 'Dear ' + po.supplier + ',' + _crlf + _crlf
    + 'Please find attached Purchase Order ' + po.id + ' for your review and action.' + _crlf + _crlf
    + 'Project: ' + (pj ? pj.code + ' ' + pj.name.split('\u2014')[0].trim() : 'See attached') + _crlf
    + 'Total Value: \u00a3' + fmtNum(po.totalValue) + ' (ex. VAT)' + _crlf + _crlf
    + 'Please confirm receipt and expected delivery date at your earliest convenience.' + _crlf + _crlf
    + 'Kind regards,' + _crlf + _name + _crlf + _co;
  document.getElementById('po-email-body').value = defaultBody;

  // Build attachment preview
  var items = po.items || [];
  var subTot = items.reduce(function(s,it){ return s + it.qty * it.unitCost; }, 0);
  var vatAmt = Math.round(subTot * 0.20 * 100) / 100;
  var itemLines = items.length
    ? items.map(function(it){
        return '<div style="display:flex;gap:.5rem;padding:.18rem 0;border-bottom:1px solid var(--bg4);">'
          + '<span class="mono" style="min-width:40px;color:var(--lime);">' + it.qty + '</span>'
          + '<span style="min-width:55px;color:var(--off3);">' + it.unit + '</span>'
          + '<span style="flex:1;color:var(--white);">' + it.desc + '</span>'
          + (it.supplierNote ? '<span style="color:var(--off4);font-size:.68rem;">' + it.supplierNote + '</span>' : '')
          + '</div>';
      }).join('')
    : '<div style="color:var(--off3);">' + po.desc + ' &mdash; ' + po.qty + ' units</div>';

  document.getElementById('po-email-attachment').innerHTML =
    '<div style="margin-bottom:.5rem;">'
    + '<span style="color:var(--off4);">PO Ref:</span> <strong style="color:var(--white);">' + po.id + '</strong>'
    + ' &nbsp; <span style="color:var(--off4);">Supplier:</span> ' + po.supplier
    + '</div>'
    + '<div style="margin-bottom:.5rem;">'
    + '<span style="color:var(--off4);">Project:</span> ' + (pj ? pj.code + ' ' + pj.name.split('\u2014')[0].trim() : '\u2014')
    + ' &nbsp; <span style="color:var(--off4);">Date Sent:</span> ' + fmtDate(po.date)
    + ' &nbsp; <span style="color:var(--off4);">Expected:</span> ' + fmtDate(po.expected)
    + '</div>'
    + '<div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);margin:.4rem 0 .2rem;">Items &mdash; Qty / Unit / Description</div>'
    + itemLines;

  openModal('modal-po-email');
}

function sendPOEmail() {
  var to      = (document.getElementById('po-email-to').value || '').trim();
  var subject = (document.getElementById('po-email-subject').value || '').trim();
  if (!to) { showToast('Please enter at least one recipient email address.', 'error'); return; }

  var toList  = to.split(',').map(function(e){ return e.trim(); }).filter(Boolean);
  var poId    = STATE.currentPOId;

  closeModal('modal-po-email');

  // Simulate send success
  showToast('✔ PO ' + (poId || '') + ' emailed to: ' + toList.join(', '), 'success');

  // Log activity if array exists
  if (typeof ACTIVITY_LOG !== 'undefined') {
    ACTIVITY_LOG.unshift({
      type: 'email', icon: '✉️',
      text: 'PO ' + poId + ' emailed to ' + toList[0] + (toList.length > 1 ? ' + ' + (toList.length-1) + ' more' : ''),
      time: 'Just now'
    });
  }
}

function renderProcurement(filter) {
  /* Empty state */
  if (PO_REGISTER.length === 0) {
    document.getElementById('dash-content').innerHTML = '<div class="page-hdr"><div class="page-hdr-left"><h2>Procurement</h2><p>0 purchase orders</p></div>'
      + '<div style="display:flex;gap:.65rem"><button class="btn btn-primary btn-sm" onclick="openPOModal(null)">+ New PO</button></div></div>'
      + '<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">'
      + '<div style="opacity:.3;color:var(--off3)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>'
      + '<div style="font-size:1.1rem;color:var(--white);margin:.75rem 0 .5rem;">No purchase orders</div>'
      + '<div style="max-width:380px;margin:0 auto;line-height:1.6;font-size:.78rem;color:var(--off3);">Create purchase orders to track material spend, delivery status, and supplier performance across your projects.</div>'
      + '<button class="btn btn-primary" style="margin-top:1.25rem" onclick="openPOModal(null)">Create First PO</button>'
      + '</div>';
    return;
  }

  filter = filter||'all';
  var filtered = PO_REGISTER.filter(function(po){
    if (filter !== 'all' && po.status !== filter) return false;
    if (STATE.procClientFilter !== 'all') {
      var pj = PROJECTS.find(function(p){ return p.id === po.project; });
      if (!pj || pj.client !== STATE.procClientFilter) return false;
    }
    if (STATE.procProjectFilter !== 'all' && po.project !== STATE.procProjectFilter) return false;
    return true;
  });
  var totalVal     = PO_REGISTER.reduce(function(s,p){return s+p.totalValue;},0);
  var pendingVal   = PO_REGISTER.filter(function(p){return p.status==='pending';}).reduce(function(s,p){return s+p.totalValue;},0);
  var orderedVal   = PO_REGISTER.filter(function(p){return p.status==='ordered';}).reduce(function(s,p){return s+p.totalValue;},0);
  var deliveredCnt = PO_REGISTER.filter(function(p){return p.status==='delivered';}).length;

  // Category spend summary
  var catSpend = {};
  PO_REGISTER.forEach(function(po){
    var c = po.catCode||'OTH';
    catSpend[c] = (catSpend[c]||0) + po.totalValue;
  });

  var html = '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.8rem"><h2 style="font-size:1.15rem;font-weight:700;color:var(--white);margin:0">Procurement</h2><div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'procurement\')" title="What is this?">?</button><div class="help-tooltip" id="help-tip-procurement">'+HELP_TIPS.procurement+'</div></div></div>';
  html += '<div class="kpi-grid">'
    + kpiCard('Total PO value','£'+fmtNum(totalVal),PO_REGISTER.length+' orders across '+Object.keys(catSpend).length+' categories','up',{background:'var(--blue)'},null)
    + kpiCard('Pending / not placed','£'+fmtNum(pendingVal),PO_REGISTER.filter(function(p){return p.status==='pending';}).length+' orders pending','dn',{background:'var(--yellow)'},null)
    + kpiCard('On order','£'+fmtNum(orderedVal),PO_REGISTER.filter(function(p){return p.status==='ordered';}).length+' in transit','up',{background:'var(--orange)'},null)
    + kpiCard('Delivered',''+deliveredCnt,'Confirmed received','up',{background:'var(--lime)'},null)
    + '</div>';

  // Category spend breakdown bar
  html += '<div class="card" style="margin-bottom:1rem"><div class="card-header"><span class="card-title">Spend by category</span></div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:.65rem;padding:.2rem 0">';
  var maxCatSpend = Math.max.apply(null, Object.values(catSpend));
  Object.keys(catSpend).sort(function(a,b){return catSpend[b]-catSpend[a];}).forEach(function(c){
    var pct = Math.round(catSpend[c]/maxCatSpend*100);
    var m = PO_CAT_MAP[c]||PO_CAT_MAP.OTH;
    html += '<div style="flex:1;min-width:100px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">'
      +'<span class="po-cat-pill '+m.cls+'">'+m.label+'</span>'
      +'<span style="font-family:var(--mono);font-size:.7rem;color:var(--off3)">£'+fmtNum(catSpend[c])+'</span>'
      +'</div>'
      +'<div style="height:5px;background:var(--bg4);border-radius:3px"><div style="width:'+pct+'%;height:100%;background:var(--orange);border-radius:3px;opacity:.7"></div></div>'
      +'</div>';
  });
  html += '</div></div>';

  // Client filter options
  var clientOpts = CLIENTS.map(function(c){return c.id;});
  var clientOptsHtml = '<option value="all"'+(STATE.procClientFilter==='all'?' selected':'')+'>All Clients</option>'
    + CLIENTS.map(function(c){
        return '<option value="'+c.id+'"'+(STATE.procClientFilter===c.id?' selected':'')+'>'+c.name+'</option>';
      }).join('');

  // Project filter — scoped to selected client
  var projsForFilter = PROJECTS.filter(function(p){
    return STATE.procClientFilter==='all' || p.client===STATE.procClientFilter;
  });
  var projOptsHtml = '<option value="all"'+(STATE.procProjectFilter==='all'?' selected':'')+'>All Projects</option>'
    + projsForFilter.map(function(p){
        return '<option value="'+p.id+'"'+(STATE.procProjectFilter===p.id?' selected':'')+'>'+p.code+' — '+p.name.split('—')[0].trim()+'</option>';
      }).join('');

  // Filter + table
  html += '<div class="bar" style="flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem;">'
    + '<div class="search-box"><input placeholder="Search POs…" oninput="filterTableRows(this.value)"/></div>'
    + '<select class="filter-select" onchange="renderProcurement(this.value)">'
    + ['all','pending','ordered','delivered'].map(function(s){
        var labels={all:'All statuses',pending:'Pending',ordered:'On order',delivered:'Delivered'};
        return '<option value="'+s+'"'+(s===filter?' selected':'')+'>'+labels[s]+'</option>';
      }).join('')+'</select>'
    + '<select class="filter-select" onchange="var cat=this.value;var els=document.querySelectorAll(\'#po-table tbody tr\');els.forEach(function(tr){tr.style.display=cat===\'all\'||tr.dataset.cat===cat?\'\':\'none\';})">'
    + '<option value="all">All categories</option>'
    + Object.keys(PO_CAT_MAP).map(function(c){return '<option value="'+c+'">'+PO_CAT_MAP[c].label+'</option>';}).join('')
    + '</select>'
    + '<select class="filter-select" onchange="STATE.procClientFilter=this.value;STATE.procProjectFilter=\'all\';renderProcurement(\''+ filter +'\');">'+clientOptsHtml+'</select>'
    + '<select class="filter-select" onchange="STATE.procProjectFilter=this.value;renderProcurement(\''+ filter +'\');">'+projOptsHtml+'</select>'
    + (STATE.procClientFilter!=='all'||STATE.procProjectFilter!=='all' ? '<button class="btn btn-dark btn-sm" onclick="STATE.procClientFilter=\'all\';STATE.procProjectFilter=\'all\';renderProcurement(\''+ filter +'\');">× Clear</button>' : '')
    + '<button class="btn btn-primary btn-sm" onclick="openPOModal(null)">+ Create PO</button>'
    + '</div>';

  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl" id="po-table"><thead>'
    + '<tr><th>PO Ref</th><th>Category</th><th>Supplier</th><th>Description</th><th>Project</th><th>Qty</th><th>Total</th><th>Expected</th><th>Status</th><th></th></tr>'
    + '</thead><tbody>';

  html += filtered.map(function(po){
    var sup = SUPPLIERS.find(function(s){return s.id===po.supplierId;});
    var supHtml = sup
      ? '<span class="po-sup-chip" onclick="dashNav(\'suppliers\')" title="View supplier">'+po.supplier+' →</span>'
      : '<span style="font-size:.78rem">'+po.supplier+'</span>';
    var rowPj = PROJECTS.find(function(p){return p.id===po.project;});
    var rowClientId = rowPj ? rowPj.client : '';
    return '<tr data-cat="'+(po.catCode||'OTH')+'" data-project="'+(po.project||'')+'" data-client="'+rowClientId+'" style="cursor:pointer;" onclick="openProcPODetail(\''+po.id+'\')">'
      +'<td class="mono" style="font-size:.72rem;white-space:nowrap">'+po.id+'</td>'
      +'<td>'+poCatPill(po.catCode||'OTH')+'</td>'
      +'<td>'+supHtml+'</td>'
      +'<td style="font-size:.75rem;max-width:180px">'+po.desc+'</td>'
      +'<td style="font-size:.72rem;color:var(--off3)">'+po.projectName+'</td>'
      +'<td class="mono">'+po.qty+'</td>'
      +'<td class="mono">£'+fmtNum(po.totalValue)+'</td>'
      +'<td class="mono">'+fmtDate(po.expected)+'</td>'
      +'<td>'+badge(po.status)+'</td>'
      +'<td style="white-space:nowrap">'
      +'<button class="btn btn-xs" style="background:rgba(249,115,22,.09);color:var(--orange);border:1px solid rgba(249,115,22,.25);" onclick="event.stopPropagation();STATE.currentPOId=\''+po.id+'\';openPOEmailModal()" title="Export to Supplier">&#9993;</button> '
      +'<button class="btn btn-dark btn-xs" onclick="event.stopPropagation();openPOModal(\''+po.id+'\')">Edit</button>'
      +(po.status==='ordered'?' <button class="btn btn-xs" style="background:rgba(163,230,53,.08);color:var(--lime);border:1px solid rgba(163,230,53,.2)" onclick="event.stopPropagation();markPODelivered(\''+po.id+'\')">Delivered ✓</button>':'')
      +'</td></tr>';
  }).join('');

  if (!filtered.length) html += '<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--off4)">No purchase orders found.</td></tr>';
  html += '</tbody></table></div></div>';
  document.getElementById('dash-content').innerHTML = html;
}

function markPODelivered(poId) {
  var idx = PO_REGISTER.findIndex(function(p){return p.id===poId;});
  if (idx>=0) {
    PO_REGISTER[idx].status='delivered';
    /* ── API: update PO status ── */
    if (ContraqAPI.isRealUser()) {
      fetch(CONTRAQ_API_BASE + '/api/data/purchase-orders', {
        method: 'POST',
        headers: typeof getAuthHeader === 'function' ? getAuthHeader() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: poId, status: 'delivered' })
      }).catch(function(e) { console.error('[PO] Status update error:', e); });
    }
    showToast(poId+' marked as delivered.','success'); dashNav('procurement');
  }
}



/* ══════════════════════════════════════════════════════════════
   FINANCE / P&L (v5)
══════════════════════════════════════════════════════════════ */
