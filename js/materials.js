/* ═══ CONTRAQ — MATERIALS ═══
   openMaterialsSummary, renderMatSummaryRows, filterMatSummary
   Lines 11698-11820 from contraq-v77
═══════════════════════════════════════════ */

var _matSummaryData = []; // [{desc, unit, totalQty, totalNet, orders:[poId,...]}]

function openMaterialsSummary(projectId) {
  var pos = PO_REGISTER.filter(function(po){ return po.project === projectId; });
  var map = {}; // key = desc+'|'+unit

  pos.forEach(function(po) {
    (po.items || []).forEach(function(it) {
      var key = it.desc + '|' + (it.unit || '');
      if (!map[key]) map[key] = {desc: it.desc, unit: it.unit || '', totalQty: 0, totalNet: 0, orders: []};
      map[key].totalQty += it.qty;
      map[key].totalNet += it.qty * it.unitCost;
      if (map[key].orders.indexOf(po.id) < 0) map[key].orders.push(po.id);
    });
  });

  _matSummaryData = Object.values ? Object.values(map) : Object.keys(map).map(function(k){ return map[k]; });
  _matSummaryData.sort(function(a,b){ return b.totalQty - a.totalQty; });

  var pj = PROJECTS.find(function(p){ return p.id === projectId; });
  document.querySelector('#modal-mat-summary .modal-title').textContent =
    '↓ Total Materials Summary — ' + (pj ? pj.code : projectId);

  document.getElementById('mat-summary-search').value = '';
  renderMatSummaryRows(_matSummaryData);

  var grandNet = _matSummaryData.reduce(function(s,r){ return s + r.totalNet; }, 0);
  document.getElementById('mat-summary-totals').textContent =
    _matSummaryData.length + ' material types · Total ex.VAT £' + fmtNum(Math.round(grandNet*100)/100)
    + ' · inc.VAT £' + fmtNum(Math.round(grandNet*1.2*100)/100);
  document.getElementById('mat-summary-meta').textContent =
    pos.length + ' order' + (pos.length !== 1 ? 's' : '') + ' scanned';

  openModal('modal-mat-summary');
}

function renderMatSummaryRows(rows) {
  var tbody = document.getElementById('mat-summary-body');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--off4);padding:1.5rem;">No materials found.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(function(r) {
    var net   = Math.round(r.totalNet * 100) / 100;
    var gross = Math.round(net * 1.2 * 100) / 100;
    var orderBadges = r.orders.map(function(pid) {
      return '<span style="font-family:var(--mono);font-size:.55rem;background:rgba(96,165,250,.12);color:var(--blue);'
        + 'border:1px solid rgba(96,165,250,.25);border-radius:3px;padding:.05rem .3rem;margin-right:.2rem;white-space:nowrap;">' + pid + '</span>';
    }).join('');
    return '<tr>'
      + '<td style="font-size:.77rem;color:var(--white);">' + r.desc + '</td>'
      + '<td class="mono" style="font-weight:700;color:var(--lime);">' + r.totalQty + '</td>'
      + '<td class="mono" style="color:var(--off3);">' + r.unit + '</td>'
      + '<td class="mono" style="color:var(--white);">£' + fmtNum(gross) + '<span style="font-size:.6rem;color:var(--off4);margin-left:.25rem;">inc.VAT</span></td>'
      + '<td style="font-size:.7rem;">' + orderBadges + '</td>'
      + '</tr>';
  }).join('');
}

function filterMatSummary() {
  var q = (document.getElementById('mat-summary-search').value || '').toLowerCase();
  var filtered = !q ? _matSummaryData : _matSummaryData.filter(function(r) {
    return r.desc.toLowerCase().indexOf(q) >= 0 || r.unit.toLowerCase().indexOf(q) >= 0
      || r.orders.some(function(o){ return o.toLowerCase().indexOf(q) >= 0; });
  });
  renderMatSummaryRows(filtered);
  document.getElementById('mat-summary-meta').textContent =
    filtered.length + ' of ' + _matSummaryData.length + ' shown';
}

function renderPODetail(poId, projectId) {
  var po = PO_REGISTER.find(function(x){ return x.id===poId; });
  if (!po) return;
  var items   = po.items || [];
  var subTot  = items.reduce(function(s,it){ return s+it.qty*it.unitCost; }, 0);
  var vatAmt  = Math.round(subTot*0.20*100)/100;
  var total   = Math.round((subTot+vatAmt)*100)/100;
  var sc = po.status==='delivered'?'#a3e635':po.status==='partial'?'#f97316':'#f87171';
  var sl = po.status==='delivered'?'Delivered':po.status==='partial'?'Partially Delivered':'Outstanding';
  var html = '';

  html += '<button class="btn btn-dark btn-sm" style="margin-bottom:1rem;" onclick="renderProjectDetailTab(\''+projectId+'\',\'procurement\')">'
    +'&#8592; Back to PO Register</button>';

  html += '<div style="background:var(--bg3);border:1.5px solid var(--border);border-radius:10px;padding:1.1rem 1.3rem;margin-bottom:.85rem;">'
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">'
    +'<div>'
    +'<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.1em;color:var(--orange);margin-bottom:.3rem;">Purchase Order</div>'
    +'<div style="font-size:1.05rem;font-weight:700;color:var(--white);">'+po.id+'</div>'
    +'<div style="font-size:.78rem;color:var(--off2);margin-top:.15rem;">'+po.supplier+'</div>'
    +'</div>'
    +'<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .65rem;border-radius:5px;'
    +'font-family:var(--mono);font-size:.6rem;font-weight:700;background:'+sc+'1a;color:'+sc+';border:1px solid '+sc+'55;">'
    +'<span style="width:6px;height:6px;border-radius:50%;background:'+sc+';display:inline-block;"></span>'+sl+'</span>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem;margin-top:.8rem;">'
    +'<div><div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);margin-bottom:.12rem;">Date Sent</div>'
    +'<div style="font-size:.76rem;color:var(--white);">'+fmtDate(po.date)+'</div></div>'
    +'<div><div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);margin-bottom:.12rem;">Expected</div>'
    +'<div style="font-size:.76rem;color:var(--white);">'+fmtDate(po.expected)+'</div></div>'
    +'<div><div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);margin-bottom:.12rem;">Delivered</div>'
    +'<div style="font-size:.76rem;color:var(--white);">'+(po.deliveredDate?fmtDate(po.deliveredDate):'&#8212;')
    +(po.deliveredLaterDate?' <span style="color:#f97316;font-size:.65rem;">(+'+fmtDate(po.deliveredLaterDate)+')</span>':'')
    +'</div></div>'
    +'</div></div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:.85rem;">'
    +'<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.85rem 1rem;">'
    +'<div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);margin-bottom:.4rem;">Delivery Address</div>'
    +'<div style="font-size:.77rem;color:var(--white);line-height:1.55;">'+(po.siteAddress||'&#8212;')+'</div>'
    +'</div>'
    +'<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.85rem 1rem;">'
    +'<div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);margin-bottom:.4rem;">Site Contact</div>'
    +'<div style="font-size:.8rem;font-weight:600;color:var(--white);">'+(po.siteContact||'&#8212;')+'</div>'
    +'<div style="font-size:.74rem;color:var(--blue);margin-top:.18rem;">'+(po.sitePhone||'')+'</div>'
    +'</div></div>';

  html += '<div class="card" style="margin-bottom:.85rem;">'
    +'<div class="card-header"><span class="card-title">Line Items</span></div>'
    +'<div style="overflow-x:auto"><table class="tbl"><thead><tr>'
    +'<th>Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>VAT</th><th>Line Total (inc.VAT)</th>'
    +'</tr></thead><tbody>';
