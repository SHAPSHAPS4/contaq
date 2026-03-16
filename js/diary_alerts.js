/* ═══ CONTRAQ — DIARY_ALERTS ═══
   generateDiaryAlerts
   Lines 12501-12600 from contraq-v77
═══════════════════════════════════════════ */



function openClientDetail(clientId) {
  STATE.viewClientId = clientId;
  var c = CLIENTS.find(function(x){return x.id===clientId;});
  if (!c) return;
  var cs = calcClientStats(clientId);
  var profScore = cs.profScore;
  var scoreColor = profScore>=7?'var(--lime)':profScore>=4?'var(--orange)':'var(--red)';

  document.getElementById('client-detail-title').textContent = c.name+' — Client Profile';

  var html = '';
  // Header
  html += '<div class="cl-detail-header">'
    + '<div class="cl-detail-av" style="background:'+c.color+'">'+c.initials+'</div>'
    + '<div><div class="cl-detail-name">'+c.name+'</div>'
    + '<div class="cl-detail-meta">'+c.sector+' · Client since '+c.since+' · '+c.creditTerms+' day payment terms'+(c.retentionPct?' · '+c.retentionPct+'% retention':'')+'</div></div>'
    + '</div>';

  // Summary stats
  html += '<div class="cl-detail-stats">'
    + '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--orange)">£'+fmtNum(cs.totalValue)+'</div><div class="cl-detail-stat-label">Total won</div></div>'
    + '<div class="cl-detail-stat"><div class="cl-detail-stat-val">'+cs.projs.length+'</div><div class="cl-detail-stat-label">Projects</div></div>'
    + '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--lime)">'+cs.avgMargin+'%</div><div class="cl-detail-stat-label">Avg margin</div></div>'
    + '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:'+(cs.overdueAmt>0?'var(--red)':'var(--lime)')+'">£'+fmtNum(cs.paidAmt)+'</div><div class="cl-detail-stat-label">Collected</div></div>'
    + '</div>';

  // Project history + per-project P&L
  html += '<div class="cl-detail-section-title">Project history &amp; P&amp;L</div>';
  if (cs.projs.length === 0) {
    html += '<div style="font-size:.8rem;color:var(--off4);text-align:center;padding:1rem 0">No projects yet.</div>';
  } else {
    cs.projs.forEach(function(p){
      var costs = p.costs ? (p.costs.labour+p.costs.materials+p.costs.subcontract+p.costs.overhead) : Math.round(p.value*(1-(p.margin||20)/100));
      var gp = p.value - costs;
      var mgn = p.value > 0 ? Math.round(gp/p.value*100) : 0;
      var mgnCls = mgn>=22?'high':mgn>=16?'mid':'low';
      var projInvs = INVOICES.filter(function(i){return i.project===p.id;});
      var billed = projInvs.reduce(function(s,i){return s+i.amount;},0);
      var billedPct = p.value > 0 ? Math.round(billed/p.value*100) : 0;
      html += '<div class="cl-proj-row">'
        +'<span class="cl-proj-code">'+p.code+'</span>'
        +'<div style="flex:1"><div class="cl-proj-name">'+p.name+'</div>'
        +'<div style="font-size:.65rem;color:var(--off4);margin-top:.1rem">'+badge(p.status)+' &nbsp;'+billedPct+'% billed · '+projInvs.length+' invoice'+(projInvs.length===1?'':'s')+'</div></div>'
        +'<span class="cl-proj-val">£'+fmtNum(p.value)+'</span>'
        +'<span class="cl-proj-mgn '+mgnCls+'">'+mgn+'% GP</span>'
        +'<button class="btn btn-dark btn-xs" onclick="openTradeModal(\''+p.id+'\')">Edit</button>'
        +'</div>';
    });
  }

  // Invoice history
  html += '<div class="cl-detail-section-title">Invoice history ('+cs.invs.length+')</div>';
  if (cs.invs.length === 0) {
    html += '<div style="font-size:.8rem;color:var(--off4);text-align:center;padding:1rem 0">No invoices raised yet.</div>';
  } else {
    html += '<table class="tbl" style="margin-bottom:.5rem"><thead><tr><th>Ref</th><th>Project</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>';
    html += cs.invs.map(function(inv){
      return '<tr><td class="mono" style="font-size:.7rem">'+inv.ref+'</td>'
        +'<td style="font-size:.73rem;color:var(--off3)">'+inv.projectName+'</td>'
        +'<td class="mono">£'+fmtNum(inv.amount)+'</td>'
        +'<td class="mono"'+(inv.status==='overdue'?' style="color:var(--red)"':'')+'>'+fmtDate(inv.due)+'</td>'
        +'<td>'+badge(inv.status)+'</td>'
        +'<td><button class="btn btn-dark btn-xs" onclick="openInvoiceModal(\''+inv.id+'\')">Edit</button></td></tr>';
    }).join('');
    html += '</tbody></table>';
  }

  // Quote history
  if (cs.tndrs.length) {
    html += '<div class="cl-detail-section-title">Quote history ('+cs.tndrs.length+')</div>';
    html += '<table class="tbl" style="margin-bottom:.5rem"><thead><tr><th>Ref</th><th>Scope</th><th>Value</th><th>Status</th><th></th></tr></thead><tbody>';
    html += cs.tndrs.map(function(t){
      return '<tr><td class="mono" style="font-size:.68rem">'+t.ref+'</td>'
        +'<td style="font-size:.75rem">'+t.name+'</td>'
        +'<td class="mono">£'+fmtNum(t.value)+'</td>'
        +'<td>'+badge(t.status)+'</td>'
        +'<td><button class="btn btn-dark btn-xs" onclick="openTenderModal(\''+t.id+'\')">Edit</button></td></tr>';
    }).join('');
    html += '</tbody></table>';
  }

  // Overall profitability score
  html += '<div class="cl-profitability-score">'
    +'<div><div class="cl-prof-label">Profitability score</div>'
    +'<div class="cl-prof-score-val" style="color:'+scoreColor+'">'+profScore.toFixed(1)+' / 10</div></div>'
    +'<div class="cl-prof-breakdown">Weighted from: margin ('+cs.avgMargin+'%), payment terms ('+( c?c.creditTerms:30)+' days), contract volume, overdue risk'
    +(cs.overdueAmt>0?'<br><span style="color:var(--red)">⚠ £'+fmtNum(cs.overdueAmt)+' currently overdue</span>':'<br><span style="color:var(--lime)">✓ No overdue invoices</span>')
    +'</div></div>';

  document.getElementById('client-detail-body').innerHTML = html;
  openModal('modal-client-detail');
}
