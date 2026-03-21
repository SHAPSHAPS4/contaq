/* ═══ CONTRAQ — PO_DETAIL ═══
   renderPODetail
   Lines 12412-12500 from contraq-v77
═══════════════════════════════════════════ */




/* ══════════════════════════════════════════════════════════════
   CLIENT REGISTER (v6)
══════════════════════════════════════════════════════════════ */
function calcClientStats(clientId) {
  var projs = PROJECTS.filter(function(p){return p.client===clientId;});
  var invs  = INVOICES.filter(function(i){return i.client===clientId;});
  var tndrs = TENDERS.filter(function(t){return t.client===clientId;});
  var totalValue  = projs.reduce(function(s,p){return s+p.value;},0);
  var totalBilled = invs.reduce(function(s,i){return s+i.amount;},0);
  var paidAmt     = invs.filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+i.amount;},0);
  var overdueAmt  = invs.filter(function(i){return i.status==='overdue';}).reduce(function(s,i){return s+i.amount;},0);
  var avgMargin   = projs.length ? Math.round(projs.reduce(function(s,p){return s+(p.margin||0);},0)/projs.length*10)/10 : 0;
  var avgJobVal   = projs.length ? Math.round(totalValue/projs.length) : 0;
  var wonTenders  = tndrs.filter(function(t){return t.status==='won';});
  var decidedTend = tndrs.filter(function(t){return t.status==='won'||t.status==='lost';});
  var winRate     = decidedTend.length ? Math.round(wonTenders.length/decidedTend.length*100) : null;
  // Profitability score (1–10): weighted by margin, payment reliability, volume
  var marginScore = Math.min(10, Math.max(1, Math.round(avgMargin/3)));
  var cl = CLIENTS.find(function(c){return c.id===clientId;});
  var termsScore  = cl ? Math.max(1, 10 - Math.round(cl.creditTerms/10)) : 5;
  var volScore    = Math.min(10, Math.round(totalValue/100000));
  var overdueScore= overdueAmt > 0 ? Math.max(1, 7 - Math.round(overdueAmt/10000)) : 10;
  var profScore   = Math.round((marginScore*0.4 + termsScore*0.2 + volScore*0.2 + overdueScore*0.2)*10)/10;
  return {projs:projs, invs:invs, tndrs:tndrs, totalValue:totalValue, totalBilled:totalBilled, paidAmt:paidAmt, overdueAmt:overdueAmt, avgMargin:avgMargin, avgJobVal:avgJobVal, winRate:winRate, profScore:Math.min(10,Math.max(1,profScore))};
}

function renderClients() {
  var html = '<div class="page-hdr"><div class="page-hdr-left"><h2>Client Register</h2><p>'+CLIENTS.length+' clients</p></div>'
    + '<div style="display:flex;align-items:center;gap:.65rem;">'
    + '<button class="cl-reset-link" onclick="clResetDemoData()">&#8635; Reset demo</button>'
    + '<button class="cl-upload-btn" onclick="openModal(\'modal-cl-upload\')">'
    + '<span>' + ICON.chart + '</span> Upload Client Records AI Enabled</button>'
    + '<button class="btn btn-primary btn-sm" onclick="openClientModal(null)">+ Add client</button>'
    + '</div></div>';

  /* ── Client stat boxes ── */
  var allProjs     = PROJECTS;
  var wonProjs     = allProjs.filter(function(p){return p.status==='active'||p.status==='completed'||p.status==='pending';});
  var quotedTend   = TENDERS.filter(function(t){return t.status==='open'||t.status==='submitted';});
  var margins      = allProjs.filter(function(p){return p.margin;}).map(function(p){return p.margin;});
  var avgProfPct   = margins.length ? Math.round(margins.reduce(function(s,m){return s+m;},0)/margins.length*10)/10 : 0;
  var lostVal      = TENDERS.filter(function(t){return t.status==='lost';}).reduce(function(s,t){return s+t.value;},0);

  html += '<div class="kpi-grid" style="margin-bottom:1.1rem;">';
  html += '<div class="kpi proj-stat-kpi" style="--kc:#a3e635;cursor:pointer;" onclick="openClReport(\'won\')">'
    + '<div class="kpi-label">Projects Won</div>'
    + '<div class="kpi-val" style="color:#a3e635;">'+wonProjs.length+'</div>'
    + '<div class="kpi-delta delta-up">&#8593; across all clients</div>'
    + '<div class="proj-stat-caret" style="color:#a3e635;">View report &#8250;</div>'
    + '</div>';
  html += '<div class="kpi proj-stat-kpi" style="--kc:#60a5fa;cursor:pointer;" onclick="openClReport(\'quoted\')">'
    + '<div class="kpi-label">Projects Quoted</div>'
    + '<div class="kpi-val" style="color:#60a5fa;">'+quotedTend.length+'</div>'
    + '<div class="kpi-delta">open &amp; submitted</div>'
    + '<div class="proj-stat-caret" style="color:#60a5fa;">View report &#8250;</div>'
    + '</div>';
  html += '<div class="kpi proj-stat-kpi" style="--kc:#f97316;cursor:pointer;" onclick="openClReport(\'profitability\')">'
    + '<div class="kpi-label">Avg. Client Margin</div>'
    + '<div class="kpi-val" style="color:#f97316;">'+avgProfPct+'%</div>'
    + '<div class="kpi-delta">across active projects</div>'
    + '<div class="proj-stat-caret" style="color:#f97316;">View report &#8250;</div>'
    + '</div>';
  html += '<div class="kpi proj-stat-kpi" style="--kc:#f87171;cursor:pointer;" onclick="openClReport(\'lost\')">'
    + '<div class="kpi-label">Total Lost Value</div>'
    + '<div class="kpi-val" style="color:#f87171;">&#163;'+fmtNum(lostVal)+'</div>'
    + '<div class="kpi-delta delta-dn">&#8595; quotes lost to competition</div>'
    + '<div class="proj-stat-caret" style="color:#f87171;">View report &#8250;</div>'
    + '</div>';
  html += '</div>';

  html += '<div class="bar"><div class="search-box"><input placeholder="Search clients…" oninput="filterTableRows(this.value)"/></div></div>';
  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead>'
    + '<tr><th>Client</th><th>Sector</th><th>Projects</th><th>Total value</th><th>Avg job</th><th>Margin</th><th>Profitability</th><th>Terms</th><th></th></tr>'
    + '</thead><tbody>';

  html += CLIENTS.map(function(c){
    var cs = calcClientStats(c.id);
    var profScore = cs.profScore;
    var scoreCls  = profScore>=7?'filled-high':profScore>=4?'filled-mid':'filled-low';
    var pips = '';
    for (var i=1;i<=10;i++) pips += '<div class="cl-score-pip'+(i<=Math.round(profScore)?' '+scoreCls:'')+'"></div>';
    return '<tr>'
      +'<td><div style="display:flex;align-items:center;gap:.55rem">'
      +'<div class="inline-av" style="background:'+c.color+'">'+c.initials+'</div>'
      +'<div><div class="strong">'+c.name+'</div><div style="font-size:.65rem;color:var(--off4)">Since '+c.since+'</div></div></div></td>'
      +'<td>'+c.sector+'</td>'
      +'<td class="mono">'+cs.projs.length+'</td>'
      +'<td class="mono">£'+fmtNum(cs.totalValue)+'</td>'
      +'<td class="mono">'+( cs.avgJobVal?'£'+fmtNum(cs.avgJobVal):'—')+'</td>'
      +'<td class="mono">'+(cs.avgMargin?cs.avgMargin+'%':'—')+'</td>'
      +'<td><div class="cl-score-bar"><div class="cl-score-pips">'+pips+'</div>'
      +'<span class="cl-score-label" style="color:'+(profScore>=7?'var(--lime)':profScore>=4?'var(--orange)':'var(--red)')+'">'+profScore.toFixed(1)+'</span></div></td>'
      +'<td class="mono">'+c.creditTerms+' days</td>'
      +'<td style="white-space:nowrap">'
      +'<button class="btn btn-dark btn-xs" onclick="openClientDetail(\''+c.id+'\')">Profile</button>'
      +' <button class="btn btn-dark btn-xs" onclick="openClientModal(\''+c.id+'\')">Edit</button>'
      +'</td></tr>';
  }).join('');
  html += '</tbody></table></div></div>';
  document.getElementById('dash-content').innerHTML = html;
}
