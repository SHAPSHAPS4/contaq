/* ═══ CONTRAQ — FINANCE ═══
   PL_BENCHMARKS, calcPLTotals, renderFinance, PL breakdown, goals
   Lines 15250-15478 from contraq-v77
═══════════════════════════════════════════ */

var PL_BENCHMARKS = [
  {label:'Mechanical Insulation', range:'18–28%', low:18, high:28},
  {label:'Electrical', range:'18–25%', low:18, high:25},
  {label:'General Build', range:'10–16%', low:10, high:16},
  {label:'M&E Fit-out', range:'15–22%', low:15, high:22},
];

function calcPLTotals() {
  // Revenue = sum of paid invoices (collected) + sent (billed)
  var collected  = INVOICES.filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+i.amount;},0);
  var billed     = INVOICES.filter(function(i){return i.status==='sent'||i.status==='overdue';}).reduce(function(s,i){return s+i.amount;},0);
  var totalBilled = collected + billed;
  // Costs from project cost breakdowns
  var totalCosts = PROJECTS.reduce(function(s,p){
    if (!p.costs) return s + p.value*(1-(p.margin||20)/100);
    return s + p.costs.labour + p.costs.materials + p.costs.subcontract + p.costs.overhead;
  }, 0);
  // Scale costs to match billed revenue proportion of total contract value
  var totalContractValue = PROJECTS.reduce(function(s,p){return s+p.value;},0);
  var billedPct = totalContractValue > 0 ? (totalBilled / totalContractValue) : 1;
  var scaledCosts = Math.round(totalCosts * billedPct);
  var grossProfit = totalBilled - scaledCosts;
  var grossMargin = totalBilled > 0 ? Math.round(grossProfit/totalBilled*100*10)/10 : 0;
  return {collected:collected, billed:billed, totalBilled:totalBilled, scaledCosts:scaledCosts, grossProfit:grossProfit, grossMargin:grossMargin};
}

function renderFinance() {
  var pl = calcPLTotals();
  var ytdRevenue   = MONTHLY_PL.reduce(function(s,m){return s+m.revenue;},0);
  var ytdCosts     = MONTHLY_PL.reduce(function(s,m){return s+m.costs;},0);
  var ytdProfit    = MONTHLY_PL.reduce(function(s,m){return s+m.profit;},0);
  var ytdMargin    = ytdRevenue > 0 ? Math.round(ytdProfit/ytdRevenue*1000)/10 : 0;

  var goalRev   = STATE.plGoalRevenue;
  var goalMgn   = STATE.plGoalMargin;
  var goalPrf   = STATE.plGoalProfit;

  var revPct   = Math.min(100, Math.round(ytdRevenue/goalRev*100));
  var mgnPct   = Math.min(100, Math.round(ytdMargin/goalMgn*100));
  var prfPct   = Math.min(100, Math.round(ytdProfit/goalPrf*100));

  var html = '';

  // Panel header with help tip
  html += '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.8rem"><h2 style="font-size:1.15rem;font-weight:700;color:var(--white);margin:0">Profit &amp; Loss</h2><div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'finance\')" title="What is this?">?</button><div class="help-tooltip" id="help-tip-finance">'+HELP_TIPS.finance+'</div></div></div>';

  // KPI row
  html += '<div class="pl-kpi-grid">'
    + kpiCard('Revenue billed YTD','£'+fmtNum(ytdRevenue),'£'+fmtNum(pl.collected)+' collected','up',{background:'var(--orange)'},null)
    + kpiCard('Total costs YTD','£'+fmtNum(ytdCosts),'Labour · Materials · Subs · OH','dn',{background:'var(--yellow)'},null)
    + kpiCard('Gross profit YTD','£'+fmtNum(ytdProfit),ytdMargin+'% gross margin','up',{background:'var(--lime)'},null)
    + kpiCard('Outstanding','£'+fmtNum(pl.billed),INVOICES.filter(function(i){return i.status==='overdue';}).length+' overdue','dn',{background:'var(--red)'},null)
    + '</div>';

  // Industry benchmarks row
  html += '<div class="pl-benchmark-row"><span class="pl-benchmark-label">Industry benchmarks:</span>';
  PL_BENCHMARKS.forEach(function(b){
    var inRange = ytdMargin >= b.low && ytdMargin <= b.high;
    html += '<span class="pl-benchmark-item '+(inRange?'pl-benchmark-in':'pl-benchmark-out')+'">'
      + b.label + '&nbsp;<span class="pl-benchmark-range">'+b.range+'</span>'
      + (inRange ? ' ✓' : '')
      + '</span>';
  });
  html += '<span style="margin-left:auto;font-family:var(--mono);font-size:.7rem;color:var(--off3)">Your margin: <strong style="color:'+(ytdMargin>=18?'var(--lime)':'var(--yellow)')+'">'+ytdMargin+'%</strong></span></div>';

  // Goal progress bars
  html += '<div class="pl-goals">';
  var goalBarColor = function(pct){ return pct>=100?'var(--lime)':pct>=70?'var(--orange)':'var(--red)'; };
  html += '<div class="pl-goal-card">'
    + '<div class="pl-goal-head"><span class="pl-goal-label">Revenue goal</span><a class="pl-goal-edit" onclick="openPLGoalsModal()">Edit goals</a></div>'
    + '<div class="pl-goal-vals"><span class="pl-goal-actual">£'+fmtNum(ytdRevenue)+'</span><span class="pl-goal-target">of £'+fmtNum(goalRev)+'</span></div>'
    + '<div class="pl-goal-bar-track"><div class="pl-goal-bar-fill" style="width:'+revPct+'%;background:'+goalBarColor(revPct)+'"></div></div>'
    + '<div class="pl-goal-pct">'+revPct+'% of annual goal</div>'
    + '</div>';
  html += '<div class="pl-goal-card">'
    + '<div class="pl-goal-head"><span class="pl-goal-label">Margin goal</span><a class="pl-goal-edit" onclick="openPLGoalsModal()">Edit</a></div>'
    + '<div class="pl-goal-vals"><span class="pl-goal-actual">'+ytdMargin+'%</span><span class="pl-goal-target">target '+goalMgn+'%</span></div>'
    + '<div class="pl-goal-bar-track"><div class="pl-goal-bar-fill" style="width:'+mgnPct+'%;background:'+goalBarColor(mgnPct)+'"></div></div>'
    + '<div class="pl-goal-pct">'+mgnPct+'% of margin target</div>'
    + '</div>';
  html += '<div class="pl-goal-card">'
    + '<div class="pl-goal-head"><span class="pl-goal-label">Gross profit goal</span><a class="pl-goal-edit" onclick="openPLGoalsModal()">Edit</a></div>'
    + '<div class="pl-goal-vals"><span class="pl-goal-actual">£'+fmtNum(ytdProfit)+'</span><span class="pl-goal-target">of £'+fmtNum(goalPrf)+'</span></div>'
    + '<div class="pl-goal-bar-track"><div class="pl-goal-bar-fill" style="width:'+prfPct+'%;background:'+goalBarColor(prfPct)+'"></div></div>'
    + '<div class="pl-goal-pct">'+prfPct+'% of profit goal</div>'
    + '</div>';
  html += '</div>';

  // Clickable breakdown sections
  html += '<div class="pl-section-row">';
  // Monthly card
  var bestMonth = MONTHLY_PL.reduce(function(a,b){return b.profit>a.profit?b:a;});
  html += '<div class="pl-section-card" onclick="openPLBreakdown(\'monthly\')">'
    + '<div class="pl-section-card-icon">📅</div>'
    + '<div class="pl-section-card-title">Monthly P&amp;L Breakdown</div>'
    + '<div class="pl-section-card-sub">Click to view month-by-month revenue, costs and profit</div>'
    + '<div class="pl-section-stats">'
    + '<div class="pl-section-stat"><div class="pl-section-stat-val" style="color:var(--lime)">'+MONTHLY_PL.length+'</div><div class="pl-section-stat-label">months tracked</div></div>'
    + '<div class="pl-section-stat"><div class="pl-section-stat-val" style="color:var(--orange)">'+bestMonth.shortMonth+'</div><div class="pl-section-stat-label">best month</div></div>'
    + '<div class="pl-section-stat"><div class="pl-section-stat-val">'+bestMonth.margin+'%</div><div class="pl-section-stat-label">peak margin</div></div>'
    + '</div></div>';
  // Quarterly card
  var bestQ = QUARTERLY_PL.reduce(function(a,b){return b.margin>a.margin?b:a;});
  html += '<div class="pl-section-card" onclick="openPLBreakdown(\'quarterly\')">'
    + '<div class="pl-section-card-icon">📊</div>'
    + '<div class="pl-section-card-title">Quarterly P&amp;L Summary</div>'
    + '<div class="pl-section-card-sub">Click to view quarterly rolled-up P&amp;L comparison</div>'
    + '<div class="pl-section-stats">'
    + '<div class="pl-section-stat"><div class="pl-section-stat-val" style="color:var(--lime)">'+QUARTERLY_PL.length+'</div><div class="pl-section-stat-label">quarters</div></div>'
    + '<div class="pl-section-stat"><div class="pl-section-stat-val" style="color:var(--orange)">'+bestQ.quarter.replace(' ','&nbsp;')+'</div><div class="pl-section-stat-label">best quarter</div></div>'
    + '<div class="pl-section-stat"><div class="pl-section-stat-val">'+bestQ.margin+'%</div><div class="pl-section-stat-label">peak margin</div></div>'
    + '</div></div>';
  html += '</div>';

  // Project P&L table
  html += '<div class="card"><div class="card-header"><span class="card-title">Project P&amp;L</span>'
    + '<span style="font-size:.72rem;color:var(--off4);font-family:var(--mono)">Actual costs · invoice status linked</span>'
    + '<button class="btn btn-dark btn-xs" onclick="exportCSV()">Export</button></div>'
    + '<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Project</th><th>Client</th><th>Contract</th><th>Costs</th><th>Gross profit</th><th>Margin</th><th>Billed</th><th>Status</th></tr></thead><tbody>';

  PROJECTS.forEach(function(p){
    var costs = p.costs ? (p.costs.labour+p.costs.materials+p.costs.subcontract+p.costs.overhead) : Math.round(p.value*(1-(p.margin||20)/100));
    var gp = p.value - costs;
    var mgn = p.value > 0 ? Math.round(gp/p.value*100) : 0;
    var billedPct = p.value > 0 ? Math.round((p.billedToDate||0)/p.value*100) : 0;
    var billedColor = billedPct < 30 ? 'var(--red)' : billedPct < 60 ? 'var(--yellow)' : 'var(--lime)';
    html += '<tr>'
      +'<td class="strong" style="font-size:.78rem">'+p.name+'</td>'
      +'<td style="font-size:.75rem">'+p.clientName+'</td>'
      +'<td class="mono">£'+fmtNum(p.value)+'</td>'
      +'<td class="mono" style="color:var(--off3)">£'+fmtNum(costs)+'</td>'
      +'<td class="mono" style="color:var(--lime)">£'+fmtNum(gp)+'</td>'
      +'<td class="mono">'+mgn+'%</td>'
      +'<td><div style="display:flex;align-items:center;gap:.4rem"><div style="width:45px;height:5px;background:var(--bg4);border-radius:3px;overflow:hidden"><div style="width:'+billedPct+'%;height:100%;background:'+billedColor+';border-radius:3px"></div></div><span class="mono" style="font-size:.68rem;color:'+billedColor+'">'+billedPct+'%</span></div></td>'
      +'<td>'+badge(p.status)+'</td>'
      +'</tr>';
  });

  html += '</tbody></table></div></div>';

  // Cost breakdown chart
  html += '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:1rem;margin-top:1rem">';
  html += '<div class="card"><div class="card-header"><span class="card-title">Monthly revenue vs costs</span></div><div class="chart-wrap" style="height:220px"><canvas id="fin-monthly-chart"></canvas></div></div>';
  html += '<div class="card"><div class="card-header"><span class="card-title">Cost breakdown</span></div><div class="chart-wrap" style="height:220px"><canvas id="fin-cost-chart"></canvas></div></div>';
  html += '</div>';

  document.getElementById('dash-content').innerHTML = html;

  requestAnimationFrame(function(){
    var mCtx = document.getElementById('fin-monthly-chart');
    if (mCtx) {
      new Chart(mCtx, {type:'bar', data:{
        labels: MONTHLY_PL.map(function(m){return m.shortMonth;}),
        datasets:[
          {label:'Revenue',data:MONTHLY_PL.map(function(m){return Math.round(m.revenue/1000);}),backgroundColor:'rgba(249,115,22,.65)',borderRadius:3},
          {label:'Costs',data:MONTHLY_PL.map(function(m){return Math.round(m.costs/1000);}),backgroundColor:'rgba(96,165,250,.4)',borderRadius:3},
          {label:'Profit',data:MONTHLY_PL.map(function(m){return Math.round(m.profit/1000);}),backgroundColor:'rgba(163,230,53,.7)',borderRadius:3}
        ]
      }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a9099',font:{size:10},padding:8}}},scales:{x:{grid:{color:'rgba(46,51,59,.6)'},ticks:{color:'#8a9099',font:{size:10}}},y:{grid:{color:'rgba(46,51,59,.6)'},ticks:{color:'#8a9099',font:{size:10},callback:function(v){return '£'+v+'k';}}}}}});
    }
    var cCtx = document.getElementById('fin-cost-chart');
    if (cCtx) {
      var totalLabour=0,totalMats=0,totalSub=0,totalOH=0;
      PROJECTS.forEach(function(p){
        if (p.costs){totalLabour+=p.costs.labour;totalMats+=p.costs.materials;totalSub+=p.costs.subcontract;totalOH+=p.costs.overhead;}
      });
      new Chart(cCtx,{type:'doughnut',data:{labels:['Labour','Materials','Subcontract','Overhead'],datasets:[{data:[Math.round(totalLabour/1000),Math.round(totalMats/1000),Math.round(totalSub/1000),Math.round(totalOH/1000)],backgroundColor:['#22c55e','#38bdf8','#a78bfa','#f59e0b'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#8a9099',font:{size:10},padding:10}}}}});
    }
  });
}

function openPLBreakdown(type) {
  var isMonthly = type === 'monthly';
  document.getElementById('pl-breakdown-title').textContent = isMonthly ? 'Monthly P&L Breakdown' : 'Quarterly P&L Summary';
  var body = document.getElementById('pl-breakdown-body');
  var rows = isMonthly ? MONTHLY_PL : QUARTERLY_PL;

  var html = '<table class="pl-breakdown-table">';
  html += '<tr><th>'+(isMonthly?'Month':'Quarter')+'</th>'+(isMonthly?'':'<th>Period</th>')+'<th class="num">Revenue</th><th class="num">Costs</th><th class="num">Gross profit</th><th class="num">Margin %</th></tr>';
  var totRev=0,totCost=0,totProf=0;
  rows.forEach(function(r){
    totRev+=r.revenue; totCost+=r.costs; totProf+=r.profit;
    var mgnColor = r.margin>=22?'pos':r.margin>=18?'':'neg';
    html += '<tr>'
      +'<td style="font-weight:600">'+(isMonthly?r.month:r.quarter)+'</td>'
      +(isMonthly?'':'<td style="color:var(--off4);font-size:.75rem">'+r.months+'</td>')
      +'<td class="num">£'+fmtNum(r.revenue)+'</td>'
      +'<td class="num" style="color:var(--off3)">£'+fmtNum(r.costs)+'</td>'
      +'<td class="num pos">£'+fmtNum(r.profit)+'</td>'
      +'<td class="num '+mgnColor+'">'+r.margin+'%</td>'
      +'</tr>';
  });
  var totMgn = totRev>0?Math.round(totProf/totRev*1000)/10:0;
  html += '<tr style="background:var(--bg3)">'
    +'<td colspan="'+(isMonthly?1:2)+'">Total / Average</td>'
    +'<td class="num">£'+fmtNum(totRev)+'</td>'
    +'<td class="num">£'+fmtNum(totCost)+'</td>'
    +'<td class="num pos">£'+fmtNum(totProf)+'</td>'
    +'<td class="num '+(totMgn>=18?'pos':'neg')+'">'+totMgn+'%</td>'
    +'</tr>';
  html += '</table>';
  body.innerHTML = html;
  openModal('modal-pl-breakdown');
}

function openPLGoalsModal() {
  document.getElementById('goal-revenue').value = STATE.plGoalRevenue;
  document.getElementById('goal-margin').value = STATE.plGoalMargin;
  document.getElementById('goal-profit').value = STATE.plGoalProfit;
  openModal('modal-pl-goals');
}

function savePLGoals() {
  var rev = parseFloat(document.getElementById('goal-revenue').value);
  var mgn = parseFloat(document.getElementById('goal-margin').value);
  var prf = parseFloat(document.getElementById('goal-profit').value);
  if (rev) STATE.plGoalRevenue = rev;
  if (mgn) STATE.plGoalMargin = mgn;
  if (prf) STATE.plGoalProfit = prf;
  closeModal('modal-pl-goals');
  showToast('Financial goals updated.','success');
  renderFinance();
}



/* ══════════════════════════════════════════════════════════════
   DIARY / CALENDAR
══════════════════════════════════════════════════════════════ */
