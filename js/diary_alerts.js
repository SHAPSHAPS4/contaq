/* ═══ CONTRAQ — DIARY_ALERTS ═══
   generateDiaryAlerts
   Lines 12501-12600 from contraq-v77
═══════════════════════════════════════════ */

    + '<div style="display:flex;align-items:center;gap:.65rem;">'
    + '<button class="cl-reset-link" onclick="clResetDemoData()">&#8635; Reset demo</button>'
    + '<button class="cl-upload-btn" onclick="openModal(\'modal-cl-upload\')">'
    + '<span style="font-size:1rem;">📊</span> Upload Client Records AI Enabled</button>'
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

