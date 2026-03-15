/* ═══ CONTRAQ — PROCUREMENT ═══
   Procurement rendering, PO creation, PO email, mark delivered
   Lines 14901-15249 from contraq-v77
═══════════════════════════════════════════ */

  var po = PO_REGISTER.find(function(x){ return x.id === poId; });
  if (!po) return;
  var items   = po.items || [];
  var pj      = PROJECTS.find(function(p){ return p.id === po.project; });
  var cl      = pj ? CLIENTS.find(function(c){ return c.id === pj.client; }) : null;
  var subTot  = items.reduce(function(s,it){ return s + it.qty * it.unitCost; }, 0);
  var vatAmt  = Math.round(subTot * 0.20 * 100) / 100;
  var total   = Math.round((subTot + vatAmt) * 100) / 100;
  var sc = po.status==='delivered' ? '#a3e635' : po.status==='partial' ? '#f97316' : '#f87171';
  var sl = po.status==='delivered' ? 'Delivered'  : po.status==='partial' ? 'Partially Delivered' : 'Outstanding';

  document.getElementById('proc-po-detail-title').textContent = po.id + ' — Order Breakdown';

  var h = '';

  // Metadata card
  h += '<div style="background:var(--bg3);border:1.5px solid var(--border);border-radius:10px;padding:1rem 1.2rem;margin-bottom:.85rem;">';
  h += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">';
  h += '<div>';
  h += '<div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;letter-spacing:.1em;color:var(--orange);margin-bottom:.25rem;">Purchase Order</div>';
  h += '<div style="font-size:1.05rem;font-weight:700;color:var(--white);">' + po.id + '</div>';
  h += '<div style="font-size:.78rem;color:var(--off2);margin-top:.1rem;">' + po.supplier + '</div>';
  h += '</div>';
  h += '<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .65rem;border-radius:5px;font-family:var(--mono);font-size:.6rem;font-weight:700;background:' + sc + '1a;color:' + sc + ';border:1px solid ' + sc + '55;">';
  h += '<span style="width:6px;height:6px;border-radius:50%;background:' + sc + ';display:inline-block;"></span>' + sl + '</span>';
  h += '</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:.75rem;">';
  var meta = [
    ['Date Sent',   po.date   ? fmtDate(po.date)     : '—'],
    ['Expected',    po.expected ? fmtDate(po.expected): '—'],
    ['Project',     pj ? pj.code + ' ' + pj.name.split('—')[0].trim() : '—'],
    ['Client',      cl ? cl.name : (pj ? pj.clientName || '—' : '—')]
  ];
  meta.forEach(function(m){
    h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">' + m[0] + '</div>';
    h += '<div style="font-size:.72rem;color:var(--white);line-height:1.4;">' + m[1] + '</div></div>';
  });
  h += '</div>';
  if (po.siteAddress || po.siteContact) {
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.65rem;">';
    if (po.siteAddress) h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">Delivery Address</div><div style="font-size:.72rem;color:var(--off2);">' + po.siteAddress + '</div></div>';
    if (po.siteContact) h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">Site Contact</div><div style="font-size:.75rem;font-weight:600;color:var(--white);">' + po.siteContact + '</div><div style="font-size:.7rem;color:var(--blue);">' + (po.sitePhone||'') + '</div></div>';
    h += '</div>';
  }
  h += '</div>';

  // Line items table
  h += '<div class="card" style="margin-bottom:.75rem;"><div class="card-header"><span class="card-title">Materials Ordered</span></div>';
  if (!items.length) {
    h += '<div style="padding:1.25rem;text-align:center;color:var(--off4);font-size:.8rem;">No line items recorded for this order.</div>';
  } else {
    h += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr>';
    h += '<th>Material / Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>VAT</th><th>Line Total (inc.VAT)</th>';
    if (po.notes) h += '<th>Notes</th>';
    h += '</tr></thead><tbody>';
    items.forEach(function(it){
      var net  = it.qty * it.unitCost;
      var vat  = net * ((it.vat||20)/100);
      var line = Math.round((net+vat)*100)/100;
      h += '<tr' + (it.outstanding ? ' style="background:rgba(249,115,22,.05)"' : '') + '>';
      h += '<td style="font-weight:' + (it.outstanding?'600':'400') + ';color:' + (it.outstanding?'var(--orange)':'var(--white)') + ';">';
      h += it.desc;
      if (it.outstanding) h += '<span style="font-family:var(--mono);font-size:.56rem;color:var(--orange);margin-left:.35rem;">&#9888; OUTSTANDING' + (it.outstandingQty?' ('+it.outstandingQty+')':'') + '</span>';
      h += '</td>';
      h += '<td class="mono">' + it.qty + '</td>';
      h += '<td class="mono" style="color:var(--off3);">' + it.unit + '</td>';
      h += '<td class="mono">&#163;' + it.unitCost.toFixed(2) + '</td>';
      h += '<td class="mono" style="color:var(--off3);">' + (it.vat||20) + '%</td>';
      h += '<td class="mono" style="color:var(--lime);font-weight:600;">&#163;' + fmtNum(line) + '</td>';
      if (po.notes) h += '<td style="font-size:.7rem;color:var(--off3);">' + (it.supplierNote||'') + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';

  // Cost summary
  h += '<div style="display:flex;justify-content:flex-end;margin-bottom:.75rem;">';
  h += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.85rem 1.1rem;min-width:230px;">';
  h += '<div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--off2);margin-bottom:.3rem;"><span>Subtotal (ex. VAT)</span><span class="mono">&#163;' + fmtNum(Math.round(subTot*100)/100) + '</span></div>';
  h += '<div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--off2);margin-bottom:.4rem;padding-bottom:.4rem;border-bottom:1px solid var(--border);"><span>VAT (20%)</span><span class="mono">&#163;' + fmtNum(vatAmt) + '</span></div>';
  h += '<div style="display:flex;justify-content:space-between;font-size:.9rem;font-weight:700;color:var(--white);"><span>Total</span><span class="mono" style="color:var(--lime);">&#163;' + fmtNum(total) + '</span></div>';
  h += '</div></div>';

  // Notes + outstanding
  if (po.notes) {
    h += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.8rem 1rem;' + (po.outstandingItems?'margin-bottom:.6rem;':'') + '">';
    h += '<div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.28rem;">Supplier Notes</div>';
    h += '<div style="font-size:.77rem;color:var(--off2);line-height:1.6;">' + po.notes + '</div>';
    h += '</div>';
  }
  if (po.outstandingItems) {
    h += '<div style="background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.28);border-radius:8px;padding:.8rem 1rem;">';
    h += '<div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--orange);margin-bottom:.28rem;">&#9888; Outstanding Items</div>';
    h += '<div style="font-size:.77rem;color:var(--orange);line-height:1.6;">' + po.outstandingItems + '</div>';
    h += '</div>';
  }

  // Journal section — linked project journal
  if (pj) {
    var jEntries = pj.journal || [];
    h += '<div style="margin-top:1.25rem;">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">';
    h += '<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.08em;color:var(--off4);">Project Journal &mdash; '+pj.code+'</div>';
    h += '<button class="btn btn-xs" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.3);" onclick="openJournalModal(\''+pj.id+'\',null)">+ Add Entry</button>';
    h += '</div>';
    h += renderJournalTimeline(pj.id, jEntries, 3);
    if (jEntries.length > 3) h += '<div style="text-align:center;margin-top:.5rem;"><button class="btn btn-dark btn-xs" onclick="renderProjectDetailTab(\''+pj.id+'\',\'journal\')">View all '+jEntries.length+' entries in Projects &rarr;</button></div>';
    h += '</div>';
  }

  document.getElementById('proc-po-detail-body').innerHTML = h;
  openModal('modal-proc-po-detail');
}

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
  if (idx>=0) { PO_REGISTER[idx].status='delivered'; showToast(poId+' marked as delivered.','success'); dashNav('procurement'); }
}



/* ══════════════════════════════════════════════════════════════
   FINANCE / P&L (v5)
══════════════════════════════════════════════════════════════ */
