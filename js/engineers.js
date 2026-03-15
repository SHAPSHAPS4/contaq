/* ═══ CONTRAQ — ENGINEERS ═══
   CAT_PILL_MAP, cert status, engineer rendering, cert tracker
   Lines 16611-17185 from contraq-v77
═══════════════════════════════════════════ */

var CAT_PILL_MAP = {
  'Pipe Insulation':'cat-pipe',
  'Ductwork Insulation':'cat-duct',
  'Trace Heating':'cat-trace',
  'Fixings & Accessories':'cat-fix',
  'Mechanical Plant':'cat-mech'
};

function catPill(cat) {
  var cls = CAT_PILL_MAP[cat] || 'cat-other';
  return '<span class="cat-pill '+cls+'">'+cat+'</span>';
}

function renderSuppliers() {
  var active = SUPPLIERS.filter(function(s){return s.status==='active';});
  var totalSpendYTD = SUPPLIERS.reduce(function(sum,s){return sum+(s.spendYTD||0);},0);
  var totalSpendAll = SUPPLIERS.reduce(function(sum,s){return sum+(s.spendTotal||0);},0);

  // Top 3 by YTD spend
  var top3 = SUPPLIERS.slice().sort(function(a,b){return (b.spendYTD||0)-(a.spendYTD||0);}).slice(0,3);

  // Spend by category
  var byCategory = {};
  SUPPLIERS.forEach(function(s){
    if (!byCategory[s.category]) byCategory[s.category] = 0;
    byCategory[s.category] += s.spendYTD || 0;
  });

  var html = '<div class="sup-stat-grid">';

  // Card 1: Total suppliers
  html += '<div class="sup-stat-card" onclick="openSupReport(\'count\')">'
    + '<div class="sup-stat-label">Total Suppliers</div>'
    + '<div class="sup-stat-val">'+SUPPLIERS.length+'</div>'
    + '<div class="sup-stat-sub">'+active.length+' active &nbsp;·&nbsp; '+(SUPPLIERS.length-active.length)+' inactive</div>'
    + '</div>';

  // Card 2: Active
  html += '<div class="sup-stat-card" onclick="openSupReport(\'active\')">'
    + '<div class="sup-stat-label">Active Suppliers</div>'
    + '<div class="sup-stat-val" style="color:var(--lime)">'+active.length+'</div>'
    + '<div class="sup-stat-sub">Across '+Object.keys(byCategory).length+' categories</div>'
    + '</div>';

  // Card 3: Spend YTD
  html += '<div class="sup-stat-card" onclick="openSupReport(\'spend\')">'
    + '<div class="sup-stat-label">Total Spend YTD</div>'
    + '<div class="sup-stat-val" style="color:var(--orange)">£'+fmtNum(totalSpendYTD)+'</div>'
    + '<div class="sup-stat-sub">£'+fmtNum(totalSpendAll)+' all time</div>'
    + '</div>';

  // Card 4: Top 3
  html += '<div class="sup-stat-card" onclick="openSupReport(\'top3\')">'
    + '<div class="sup-stat-label">Top 3 by Spend YTD</div>'
    + '<div class="sup-top3">'
    + top3.map(function(s,i){
        return '<div class="sup-top3-item"><span class="sup-top3-name">'+(i+1)+'. '+s.name+'</span><span class="sup-top3-val">£'+fmtNum(s.spendYTD)+'</span></div>';
      }).join('')
    + '</div></div>';

  html += '</div>'; // end stat grid

  // Filter bar
  html += '<div class="bar"><div class="search-box"><input placeholder="Search suppliers…" oninput="filterTableRows(this.value)"/></div>'
    + '<div style="display:flex;gap:.4rem;flex-wrap:wrap">'
    + ['all','active','inactive'].map(function(f){
        return '<button class="btn btn-dark btn-xs" style="'+(f==='all'?'background:var(--og);color:var(--orange);border-color:rgba(249,115,22,.3)':'')+'" onclick="renderSuppliers()">'+f.charAt(0).toUpperCase()+f.slice(1)+'</button>';
      }).join('')
    + '</div></div>';

  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Supplier</th><th>Category</th><th>Contact</th><th>Account ref</th><th>Pay terms</th><th>Spend YTD</th><th>Total spend</th><th>Rating</th><th>Status</th><th></th></tr></thead><tbody>';

  html += SUPPLIERS.map(function(s){
    var stars = '';
    for (var i=0;i<5;i++) stars += '<span style="color:'+(i<s.rating?'var(--orange)':'var(--off4)')+'">★</span>';
    var spendBar = s.spendYTD > 0 ?
      '<div style="display:flex;align-items:center;gap:.4rem">'
      + '<div style="width:50px;height:5px;background:var(--bg4);border-radius:3px;overflow:hidden"><div style="width:'+Math.min(100,Math.round(s.spendYTD/totalSpendYTD*100))+'%;height:100%;background:var(--orange);border-radius:3px"></div></div>'
      + '<span class="mono" style="font-size:.72rem">£'+fmtNum(s.spendYTD)+'</span>'
      + '</div>' : '<span class="mono" style="color:var(--off4);font-size:.72rem">—</span>';
    return '<tr>'
      +'<td><strong>'+s.name+'</strong>'+(s.website?'<div style="font-family:var(--mono);font-size:.6rem;color:var(--off4)">'+s.website+'</div>':'')+'</td>'
      +'<td>'+catPill(s.category)+'</td>'
      +'<td><div style="font-size:.78rem;font-weight:500">'+s.contact+'</div><div style="font-family:var(--mono);font-size:.62rem;color:var(--off4)">'+s.email+'</div></td>'
      +'<td class="mono" style="font-size:.72rem">'+s.account+'</td>'
      +'<td class="mono" style="font-size:.72rem">'+(s.payTerms||30)+' days</td>'
      +'<td>'+spendBar+'</td>'
      +'<td class="mono" style="font-size:.72rem">£'+fmtNum(s.spendTotal)+'</td>'
      +'<td>'+stars+'</td>'
      +'<td>'+badge(s.status==='active'?'active':'inactive')+'</td>'
      +'<td><button class="btn btn-dark btn-xs" onclick="openSupplierModal(\''+s.id+'\')">Edit</button></td>'
      +'</tr>';
  }).join('');

  html += '</tbody></table></div></div>';
  document.getElementById('dash-content').innerHTML = html;
}

function openSupReport(type) {
  var title = {count:'Supplier Register',active:'Active Suppliers',spend:'Spend by Category',top3:'Top Suppliers by Spend'};
  document.getElementById('sup-report-title').textContent = title[type]||'Supplier Report';
  var body = document.getElementById('sup-report-body');

  if (type === 'spend') {
    // Spend by category bar chart
    var byCategory = {};
    SUPPLIERS.forEach(function(s){
      if (!byCategory[s.category]) byCategory[s.category] = {ytd:0,total:0};
      byCategory[s.category].ytd += s.spendYTD||0;
      byCategory[s.category].total += s.spendTotal||0;
    });
    var maxYTD = Math.max.apply(null, Object.values(byCategory).map(function(v){return v.ytd;}));
    var html = '<div style="margin-bottom:1rem"><div style="font-size:.82rem;font-weight:700;margin-bottom:1rem">Spend by category — YTD 2026</div>';
    Object.keys(byCategory).forEach(function(cat){
      var v = byCategory[cat];
      var pct = maxYTD > 0 ? Math.round(v.ytd/maxYTD*100) : 0;
      var barColor = CAT_PILL_MAP[cat] === 'cat-pipe' ? '#f97316' : CAT_PILL_MAP[cat] === 'cat-duct' ? '#60a5fa' : CAT_PILL_MAP[cat] === 'cat-trace' ? '#a3e635' : '#a855f7';
      html += '<div class="spend-bar-row">'
        + '<div class="spend-bar-label">'+cat+'</div>'
        + '<div class="spend-bar-track"><div class="spend-bar-fill" style="width:'+pct+'%;background:'+barColor+'"></div></div>'
        + '<div class="spend-bar-val">£'+fmtNum(v.ytd)+'</div>'
        + '</div>';
    });
    html += '</div><div style="padding-top:1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between"><span style="font-size:.8rem;color:var(--off3)">Total YTD spend</span><span style="font-family:var(--mono);font-weight:700">£'+fmtNum(SUPPLIERS.reduce(function(s,x){return s+(x.spendYTD||0);},0))+'</span></div>';
    body.innerHTML = html;
  } else if (type === 'top3') {
    var sorted = SUPPLIERS.slice().sort(function(a,b){return (b.spendYTD||0)-(a.spendYTD||0);});
    var totalYTD = sorted.reduce(function(s,x){return s+(x.spendYTD||0);},0);
    var html = '<div style="font-size:.82rem;font-weight:700;margin-bottom:1rem">Top suppliers by YTD spend</div>';
    sorted.forEach(function(s,i){
      var pct = totalYTD > 0 ? Math.round((s.spendYTD||0)/totalYTD*100) : 0;
      html += '<div style="margin-bottom:1rem;padding:.75rem;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">'
        + '<div><span style="font-size:.85rem;font-weight:700">'+(i+1)+'. '+s.name+'</span> '+catPill(s.category)+'</div>'
        + '<div style="text-align:right"><div class="mono" style="font-size:.85rem;font-weight:700">£'+fmtNum(s.spendYTD)+'</div><div style="font-size:.65rem;color:var(--off4)">'+pct+'% of total</div></div>'
        + '</div>'
        + '<div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:var(--orange);border-radius:3px"></div></div>'
        + '</div>';
    });
    body.innerHTML = html;
  } else if (type === 'active') {
    var active = SUPPLIERS.filter(function(s){return s.status==='active';});
    var html = '<div style="font-size:.82rem;font-weight:700;margin-bottom:1rem">Active suppliers ('+active.length+')</div>';
    html += active.map(function(s){
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.55rem .75rem;background:var(--bg3);border-radius:7px;border:1px solid var(--border);margin-bottom:.4rem">'
        + '<div><div style="font-size:.82rem;font-weight:600">'+s.name+'</div><div style="font-family:var(--mono);font-size:.62rem;color:var(--off4)">'+s.contact+' · '+s.phone+'</div></div>'
        + catPill(s.category)
        + '</div>';
    }).join('');
    body.innerHTML = html;
  } else {
    var html = '<div style="font-size:.82rem;font-weight:700;margin-bottom:1rem">All suppliers ('+SUPPLIERS.length+')</div>';
    html += SUPPLIERS.map(function(s){
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.55rem .75rem;background:var(--bg3);border-radius:7px;border:1px solid var(--border);margin-bottom:.4rem">'
        + '<div><div style="font-size:.82rem;font-weight:600">'+s.name+'</div><div style="font-family:var(--mono);font-size:.62rem;color:var(--off4)">Ref: '+s.account+' · Terms: '+(s.payTerms||30)+' days</div></div>'
        + '<div style="text-align:right">'+badge(s.status==='active'?'active':'inactive')+'</div>'
        + '</div>';
    }).join('');
    body.innerHTML = html;
  }
  openModal('modal-sup-report');
}

function openSupplierModal(id) {
  STATE.editSupplierId = id || null;
  var isNew = !id;
  document.getElementById('supplier-modal-title').textContent = isNew ? 'Add Supplier' : 'Edit Supplier';
  document.getElementById('supplier-del-btn').style.display = isNew ? 'none' : '';
  document.getElementById('supplier-err').style.display = 'none';
  if (!isNew) {
    var s = SUPPLIERS.find(function(x){return x.id===id;});
    if (s) {
      document.getElementById('sup-name').value = s.name||'';
      document.getElementById('sup-cat').value = s.category||'Pipe Insulation';
      document.getElementById('sup-contact').value = s.contact||'';
      document.getElementById('sup-phone').value = s.phone||'';
      document.getElementById('sup-email').value = s.email||'';
      document.getElementById('sup-account').value = s.account||'';
      document.getElementById('sup-terms').value = s.payTerms||30;
      document.getElementById('sup-status').value = s.status||'active';
      document.getElementById('sup-notes').value = s.notes||'';
    }
  } else {
    ['sup-name','sup-contact','sup-phone','sup-email','sup-account','sup-notes'].forEach(function(fid){document.getElementById(fid).value='';});
    document.getElementById('sup-cat').value = 'Pipe Insulation';
    document.getElementById('sup-terms').value = '30';
    document.getElementById('sup-status').value = 'active';
  }
  openModal('modal-supplier');
}

function saveSupplier() {
  var name = document.getElementById('sup-name').value.trim();
  if (!name) { showModalErr('supplier-err','Supplier name is required.'); return; }
  var data = {
    name:name,
    category:document.getElementById('sup-cat').value,
    contact:document.getElementById('sup-contact').value.trim(),
    phone:document.getElementById('sup-phone').value.trim(),
    email:document.getElementById('sup-email').value.trim(),
    account:document.getElementById('sup-account').value.trim(),
    payTerms:parseInt(document.getElementById('sup-terms').value)||30,
    status:document.getElementById('sup-status').value,
    notes:document.getElementById('sup-notes').value.trim(),
    rating:4,
    spendYTD:0,
    spendTotal:0
  };
  if (STATE.editSupplierId) {
    var idx = SUPPLIERS.findIndex(function(x){return x.id===STATE.editSupplierId;});
    if (idx>=0) {
      data.id=STATE.editSupplierId;
      data.spendYTD = SUPPLIERS[idx].spendYTD||0;
      data.spendTotal = SUPPLIERS[idx].spendTotal||0;
      data.rating = SUPPLIERS[idx].rating||4;
      Object.assign(SUPPLIERS[idx],data);
    }
    showToast('Supplier updated.','success');
  } else {
    data.id = 's'+Date.now();
    SUPPLIERS.push(data);
    showToast('Supplier added.','success');
  }
  closeModal('modal-supplier');
  dashNav('suppliers');
}

function deleteSupplier() {
  if (!STATE.editSupplierId) return;
  var s = SUPPLIERS.find(function(x){return x.id===STATE.editSupplierId;});
  if (!s || !confirm('Remove '+s.name+' from suppliers?')) return;
  SUPPLIERS.splice(SUPPLIERS.findIndex(function(x){return x.id===STATE.editSupplierId;}),1);
  showToast('Supplier removed.','success');
  closeModal('modal-supplier');
  dashNav('suppliers');
}



/* ══════════════════════════════════════════════════════════════
   REPORTS
══════════════════════════════════════════════════════════════ */
function renderReports() {
  var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.5rem">';
  var reports = [
    {icon:'📊',title:'P&L Summary',desc:'Gross profit by project and period',color:'var(--orange)'},
    {icon:'🧾',title:'Invoice Ageing',desc:'Outstanding invoices grouped by age',color:'var(--lime)'},
    {icon:'📋',title:'Tender Analysis',desc:'Win rate, margin and pipeline by sector',color:'var(--blue)'},
    {icon:'📦',title:'Materials Usage',desc:'PO spend by project and supplier',color:'var(--yellow)'},
    {icon:'👷',title:'Labour Schedule',desc:'Hours and cost by engineer and project',color:'#a855f7'},
    {icon:'📁',title:'Client Report',desc:'Revenue and margin per client',color:'#34d399'},
  ];
  html += reports.map(function(r){
    return '<div class="card" style="cursor:pointer;transition:transform .15s" onmouseenter="this.style.transform=\'translateY(-3px)\'" onmouseleave="this.style.transform=\'\'" onclick="generateReport(\''+r.title+'\')">'
      + '<div style="padding:1.5rem">'
      + '<div style="font-size:1.8rem;margin-bottom:.75rem">'+r.icon+'</div>'
      + '<div style="font-size:.85rem;font-weight:700;color:var(--white);margin-bottom:.3rem">'+r.title+'</div>'
      + '<div style="font-size:.75rem;color:var(--off3);line-height:1.5;margin-bottom:1rem">'+r.desc+'</div>'
      + '<div style="display:flex;gap:.5rem">'
      + '<button class="btn btn-dark btn-xs">Preview</button>'
      + '<button class="btn btn-xs" style="background:var(--og);color:var(--orange);border:1px solid rgba(249,115,22,.2)">Export PDF</button>'
      + '</div></div></div>';
  }).join('');
  html += '</div>';
  document.getElementById('dash-content').innerHTML = html;
}

function generateReport(name) {
  showToast((name||'Report')+' exported to PDF.','success');
}

/* ══════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════ */
function renderSettings() {
  var user = STATE.user||DEMO_USER;
  var html = '<div class="settings-grid">';
  html += '<div class="settings-nav">';
  ['profile','billing','team','goals','notifications','api','security'].forEach(function(s){
    var labels = {profile:'My profile',billing:'Billing & plan',team:'Team & users',goals:'Financial goals',notifications:'Notifications',api:'API & integrations',security:'Security'};
    html += '<div class="settings-nav-item'+(STATE.settingsSection===s?' active':'')+'" onclick="switchSettings(\''+s+'\')">'+labels[s]+'</div>';
  });
  html += '</div><div id="settings-main">';
  html += renderSettingsSection(user);
  html += '</div></div>';
  document.getElementById('dash-content').innerHTML = html;
}

function switchSettings(section) {
  STATE.settingsSection = section;
  var user = STATE.user||DEMO_USER;
  document.querySelectorAll('.settings-nav-item').forEach(function(i){i.classList.remove('active');});
  document.querySelectorAll('.settings-nav-item').forEach(function(i){
    if (i.textContent===({profile:'My profile',billing:'Billing & plan',team:'Team & users',goals:'Financial goals',notifications:'Notifications',api:'API & integrations',security:'Security'})[section]) i.classList.add('active');
  });
  var main = document.getElementById('settings-main');
  if (main) main.innerHTML = renderSettingsSection(user);
}

function renderSettingsSection(user) {
  var s = STATE.settingsSection;
  if (s==='profile') return '<h3>My Profile</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Update your personal and company details.</p>'
    + '<div class="form-row"><div class="field"><label>First name</label><input value="'+user.fname+'" oninput="updateUser(\'fname\',this.value)"/></div><div class="field"><label>Last name</label><input value="'+(user.lname||'Mitchell')+'" oninput="updateUser(\'lname\',this.value)"/></div></div>'
    + '<div class="field"><label>Email</label><input value="'+user.email+'" type="email"/></div>'
    + '<div class="field"><label>Company name</label><input value="'+(user.company||'Mitchell Insulation Ltd')+'"/></div>'
    + '<button class="btn btn-primary btn-sm" onclick="showToast(\'Profile saved.\',\'success\')">Save changes</button>';
  if (s==='billing') return '<h3>Billing &amp; Plan</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Manage your subscription and payment method.</p>'
    + '<div class="billing-card" style="border-color:var(--orange)"><div class="billing-plan-name">CONTRAQ '+planLabels[user.plan||'professional']+'</div><div class="billing-plan-meta">14-day free trial — '+( user.trialDays||5)+' days remaining &nbsp;·&nbsp; No charge until trial ends</div></div>'
    + '<div class="billing-card" style="margin-top:.75rem"><div style="font-size:.82rem;font-weight:600;margin-bottom:.3rem">Payment method</div><div class="billing-plan-meta">No payment method on file — add one before your trial ends.</div><button class="btn btn-primary btn-sm" style="margin-top:.75rem" onclick="nav(\'stripe\')">Add payment method</button></div>'
    + '<div style="margin-top:1.5rem;padding-top:1.2rem;border-top:1px solid var(--border)"><div style="font-size:.8rem;color:var(--off3)">Need a different plan? <a style="color:var(--orange);cursor:pointer" onclick="scrollToSection(\'pricing\');nav(\'home\')">View all plans →</a></div></div>';
  if (s==='team') {
    var team = [{name:'James Mitchell',role:'Admin',email:user.email,av:'JM',color:'#f97316'},{name:'Mark Pearce',role:'Project Manager',email:'m.pearce@mitchellinsvlation.co.uk',av:'MP',color:'#38bdf8'},{name:'Dave Harris',role:'Site Supervisor',email:'d.harris@mitchellinsulation.co.uk',av:'DH',color:'#4ade80'}];
    return '<h3>Team &amp; Users</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Manage who has access to your CONTRAQ workspace.</p>'
      + team.map(function(m){return '<div class="team-row"><div class="team-av" style="background:'+m.color+'">'+m.av+'</div><div style="flex:1"><div class="team-name">'+m.name+'</div><div class="team-role">'+m.email+'</div></div><span class="badge badge-active" style="margin-right:.5rem">'+m.role+'</span></div>';}).join('')
      + '<button class="btn btn-dark btn-sm" style="margin-top:1rem" onclick="showToast(\'Invite sent!\',\'success\')">+ Invite team member</button>';
  }
  if (s==='goals') {
    var ytdRev = MONTHLY_PL.reduce(function(a,m){return a+m.revenue;},0);
    var ytdPrf = MONTHLY_PL.reduce(function(a,m){return a+m.profit;},0);
    var ytdMgn = ytdRev>0?Math.round(ytdPrf/ytdRev*1000)/10:0;
    return '<h3>Financial Goals</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Set your annual revenue, margin, and profit targets. These drive the progress bars on the P&amp;L page.</p>'
      + '<div class="form-row"><div class="field"><label>Annual revenue goal (£)</label><input id="set-goal-rev" type="number" value="'+STATE.plGoalRevenue+'"/></div><div class="field"><label>Gross margin target (%)</label><input id="set-goal-mgn" type="number" value="'+STATE.plGoalMargin+'"/></div></div>'
      + '<div class="field"><label>Annual gross profit goal (£)</label><input id="set-goal-prf" type="number" value="'+STATE.plGoalProfit+'"/></div>'
      + '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);padding:.8rem 1rem;margin:1rem 0">'
      + '<div style="font-size:.72rem;color:var(--off4);font-family:var(--mono);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem">YTD progress</div>'
      + '<div style="display:flex;gap:2rem;font-size:.8rem">'
      + '<span>Revenue: <strong style="color:var(--orange)">£'+fmtNum(ytdRev)+'</strong></span>'
      + '<span>Profit: <strong style="color:var(--lime)">£'+fmtNum(ytdPrf)+'</strong></span>'
      + '<span>Margin: <strong style="color:'+(ytdMgn>=18?'var(--lime)':'var(--yellow)')+'">'+ytdMgn+'%</strong></span>'
      + '</div></div>'
      + '<button class="btn btn-primary btn-sm" onclick="STATE.plGoalRevenue=parseFloat(document.getElementById(\'set-goal-rev\').value)||STATE.plGoalRevenue;STATE.plGoalMargin=parseFloat(document.getElementById(\'set-goal-mgn\').value)||STATE.plGoalMargin;STATE.plGoalProfit=parseFloat(document.getElementById(\'set-goal-prf\').value)||STATE.plGoalProfit;showToast(\'Goals saved.\',\'success\')">Save goals</button>'
      + '&nbsp;<button class="btn btn-dark btn-sm" onclick="dashNav(\'finance\')">View P&amp;L →</button>';
  }
  if (s==='api') return '<h3>API &amp; Integrations</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Connect CONTRAQ with your other tools.</p>'
    + '<div style="margin-bottom:1rem;font-family:var(--mono);font-size:.6rem;color:var(--off4);text-transform:uppercase;letter-spacing:.08em">Your API keys</div>'
    + '<div class="api-key-box"><span>sk_live_CQ_••••••••••••••••••••••••••••••••</span><button class="btn btn-dark btn-xs" onclick="showToast(\'Key copied to clipboard.\',\'success\')">Copy</button></div>'
    + '<div class="api-key-box"><span>sk_test_CQ_••••••••••••••••••••••••••••••••</span><button class="btn btn-dark btn-xs" onclick="showToast(\'Key copied.\',\'success\')">Copy</button></div>'
    + '<div style="margin-top:1.5rem;padding-top:1.2rem;border-top:1px solid var(--border)"><div style="font-size:.82rem;font-weight:600;margin-bottom:1rem">Integrations</div>'
    + ['Xero accounting','QuickBooks','Sage 50','Salesforce','Microsoft 365'].map(function(i){return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border)"><span style="font-size:.82rem">'+i+'</span><button class="btn btn-dark btn-xs" onclick="showToast(\''+i+' connected!\',\'success\')">Connect</button></div>';}).join('')+'</div>';
  if (s==='notifications') return '<h3>Notifications</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Choose what you get notified about.</p>'
    + [['Invoice overdue','Send email when an invoice passes its due date',true],['Payment received','Email when an invoice is marked as paid',true],['Tender deadline','Remind me 48h before a tender submission',true],['PO delivery','Alert when a purchase order is delivered',false],['Weekly summary','Monday morning digest of last week',true]].map(function(n){return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.65rem 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.84rem;font-weight:600">'+n[0]+'</div><div style="font-size:.72rem;color:var(--off4)">'+n[1]+'</div></div><div style="width:38px;height:22px;border-radius:11px;background:'+(n[2]?'var(--orange)':'var(--bg4)')+';border:1.5px solid '+(n[2]?'var(--orange)':'var(--border)')+';cursor:pointer;position:relative;flex-shrink:0" onclick="showToast(\'Notification settings saved.\',\'success\')"><div style="position:absolute;top:2px;left:'+(n[2]?'16px':'2px')+';width:14px;height:14px;border-radius:50%;background:#fff;transition:left .15s"></div></div></div>';}).join('')
    + '<button class="btn btn-primary btn-sm" style="margin-top:1rem" onclick="showToast(\'Notification preferences saved.\',\'success\')">Save preferences</button>';
  if (s==='security') return '<h3>Security</h3><p class="lead" style="font-size:.8rem;margin-bottom:1.5rem">Manage your password and account security.</p>'
    + '<div class="field"><label>Current password</label><input type="password" placeholder="••••••••"/></div>'
    + '<div class="field"><label>New password</label><input type="password" placeholder="••••••••"/></div>'
    + '<div class="field"><label>Confirm new password</label><input type="password" placeholder="••••••••"/></div>'
    + '<button class="btn btn-primary btn-sm" onclick="showToast(\'Password updated.\',\'success\')">Update password</button>'
    + '<div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border)"><div style="font-size:.82rem;font-weight:600;color:var(--red);margin-bottom:.5rem">Danger zone</div><button class="btn btn-danger btn-sm" onclick="doLogout()">Sign out of all devices</button></div>';
  return '';
}

function updateUser(field, val) {
  if (!STATE.user) STATE.user = Object.assign({},DEMO_USER);
  STATE.user[field] = val;
}

/* ══════════════════════════════════════════════════════════════
   MODALS — TRADE / PROJECT
══════════════════════════════════════════════════════════════ */
function openTradeModal(id) {
  STATE.editTradeId = id;
  var isNew = !id;
  document.getElementById('trade-modal-title').textContent = isNew?'New Project':'Edit Project';
  document.getElementById('trade-del-btn').style.display = isNew?'none':'';
  document.getElementById('trade-err').style.display='none';

  // Populate client dropdown
  var sel = document.getElementById('tm-client');
  sel.innerHTML = '<option value="">Select client…</option>' + CLIENTS.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');

  // Populate supplier dropdown
  var supSel = document.getElementById('tm-supplier');
  supSel.innerHTML = '<option value="">No supplier linked</option>' + SUPPLIERS.filter(function(s){return s.status==='active';}).map(function(s){return '<option value="'+s.id+'">'+s.name+' ('+s.category+')</option>';}).join('');

  if (!isNew) {
    var proj = PROJECTS.find(function(p){return p.id===id;});
    if (proj) {
      document.getElementById('tm-name').value = proj.name||'';
      sel.value = proj.client||'';
      document.getElementById('tm-value').value = proj.value||'';
      document.getElementById('tm-status').value = proj.status||'active';
      document.getElementById('tm-start').value = proj.start||'';
      document.getElementById('tm-end').value = proj.end||'';
      supSel.value = proj.supplierId||'';
      document.getElementById('tm-notes').value = proj.notes||'';
    }
  } else {
    document.getElementById('tm-name').value='';
    document.getElementById('tm-value').value='';
    document.getElementById('tm-status').value='active';
    document.getElementById('tm-start').value='';
    document.getElementById('tm-end').value='';
    supSel.value='';
    document.getElementById('tm-notes').value='';
  }
  openModal('modal-trade');
}

function saveTrade() {
  var name = document.getElementById('tm-name').value.trim();
  var clientId = document.getElementById('tm-client').value;
  var value = parseFloat(document.getElementById('tm-value').value);
  var status = document.getElementById('tm-status').value;
  if (!name) { showModalErr('trade-err','Project name is required.'); return; }
  if (!value||isNaN(value)) { showModalErr('trade-err','Please enter a valid contract value.'); return; }

  var client = CLIENTS.find(function(c){return c.id===clientId;});
  var supplierId = document.getElementById('tm-supplier').value;
  var supplier = SUPPLIERS.find(function(s){return s.id===supplierId;});
  var data = {
    name:name, client:clientId, clientName:client?client.name:'Unknown',
    value:value, status:status,
    start:document.getElementById('tm-start').value,
    end:document.getElementById('tm-end').value,
    notes:document.getElementById('tm-notes').value,
    supplierId:supplierId||'',
    supplierName:supplier?supplier.name:'',
    margin:20,
  };

  if (STATE.editTradeId) {
    var idx = PROJECTS.findIndex(function(p){return p.id===STATE.editTradeId;});
    if (idx>=0) { data.id=STATE.editTradeId; data.code=PROJECTS[idx].code; Object.assign(PROJECTS[idx],data); }
    showToast('Project updated.','success');
  } else {
    data.id = 'p'+Date.now(); data.code='PRJ-'+(PROJECTS.length+46).toString().padStart(3,'0');
    PROJECTS.push(data);
    showToast('Project created.','success');
  }
  closeModal('modal-trade');
  dashNav('projects');
}

function deleteTrade() {
  if (!STATE.editTradeId) return;
  var proj = PROJECTS.find(function(p){return p.id===STATE.editTradeId;});
  if (!proj || !confirm('Delete "'+proj.name+'"? This cannot be undone.')) return;
  PROJECTS.splice(PROJECTS.findIndex(function(p){return p.id===STATE.editTradeId;}),1);
  showToast('Project deleted.','success');
  closeModal('modal-trade');
  dashNav('projects');
}

/* ══════════════════════════════════════════════════════════════
   MODALS — CLIENT
══════════════════════════════════════════════════════════════ */
function openClientModal(id) {
  STATE.editClientId = id;
  var isNew = !id;
  document.getElementById('client-modal-title').textContent = isNew?'Add Client':'Edit Client';
  document.getElementById('client-del-btn').style.display = isNew?'none':'';
  document.getElementById('client-err').style.display='none';
  if (!isNew) {
    var c = CLIENTS.find(function(x){return x.id===id;});
    if (c) {
      document.getElementById('cl-name').value=c.name||'';
      document.getElementById('cl-sector').value=c.sector||'Construction';
      document.getElementById('cl-contact').value=c.contact||'';
      document.getElementById('cl-email').value=c.email||'';
      document.getElementById('cl-phone').value=c.phone||'';
      document.getElementById('cl-terms').value=c.creditTerms||30;
      document.getElementById('cl-addr').value=c.address||'';
      document.getElementById('cl-notes').value=c.notes||'';
    }
  } else {
    ['cl-name','cl-contact','cl-email','cl-phone','cl-addr','cl-notes'].forEach(function(id){document.getElementById(id).value='';});
    document.getElementById('cl-terms').value='30';
    document.getElementById('cl-sector').value='Construction';
  }
  openModal('modal-client');
}

function saveClient() {
  var name = document.getElementById('cl-name').value.trim();
  if (!name) { showModalErr('client-err','Client name is required.'); return; }
  var initials = name.split(' ').filter(Boolean).map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);
  var colors = ['#4ade80','#38bdf8','#f59e0b','#a78bfa','#f87171','#34d399','#e879f9','#22d3ee'];
  var data = {
    name:name, initials:initials,
    sector:document.getElementById('cl-sector').value,
    contact:document.getElementById('cl-contact').value.trim(),
    email:document.getElementById('cl-email').value.trim(),
    phone:document.getElementById('cl-phone').value.trim(),
    creditTerms:parseInt(document.getElementById('cl-terms').value)||30,
    address:document.getElementById('cl-addr').value.trim(),
    notes:document.getElementById('cl-notes').value,
    retentionPct:0,
  };
  if (STATE.editClientId) {
    var idx = CLIENTS.findIndex(function(c){return c.id===STATE.editClientId;});
    if (idx>=0) { data.id=STATE.editClientId; data.color=CLIENTS[idx].color||colors[0]; Object.assign(CLIENTS[idx],data); }
    showToast('Client updated.','success');
  } else {
    data.id='cl-'+Date.now(); data.color=colors[CLIENTS.length%colors.length]; data.since=new Date().getFullYear().toString();
    CLIENTS.push(data);
    showToast('Client added.','success');
  }
  closeModal('modal-client');
  dashNav('clients');
}

function deleteClient() {
  if (!STATE.editClientId) return;
  var c = CLIENTS.find(function(x){return x.id===STATE.editClientId;});
  if (!c||!confirm('Delete '+c.name+'? This cannot be undone.')) return;
  CLIENTS.splice(CLIENTS.findIndex(function(x){return x.id===STATE.editClientId;}),1);
  showToast('Client deleted.','success');
  closeModal('modal-client');
  dashNav('clients');
}

/* ══════════════════════════════════════════════════════════════
   MODALS — INVOICE
══════════════════════════════════════════════════════════════ */
function openInvoiceModal(id, prefill) {
  STATE.editInvId = id;
  var isNew = !id;
  document.getElementById('inv-modal-title').textContent = isNew?'Raise Invoice':'Edit Invoice';
  document.getElementById('inv-del-btn').style.display = isNew?'none':'';
  document.getElementById('inv-err').style.display='none';

  var clSel = document.getElementById('inv-client');
  clSel.innerHTML = '<option value="">Select client…</option>'+CLIENTS.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');
  var projSel = document.getElementById('inv-project');
  projSel.innerHTML = '<option value="">Select project…</option>'+PROJECTS.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join('');

  var today = new Date().toISOString().split('T')[0];
  var due = new Date(); due.setDate(due.getDate()+30);
  var dueStr = due.toISOString().split('T')[0];

  if (!isNew) {
    var inv = INVOICES.find(function(i){return i.id===id;});
    if (inv) {
      document.getElementById('inv-num').value=inv.ref||'';
      clSel.value=inv.client||'';
      projSel.value=inv.project||'';
      document.getElementById('inv-amount').value=inv.amount||'';
      document.getElementById('inv-date').value=inv.date||'';
      document.getElementById('inv-due').value=inv.due||'';
      document.getElementById('inv-desc').value=inv.desc||'';
    }
  } else {
    var num = 'INV-2026-'+String(INVOICES.length+1).padStart(4,'0');
    document.getElementById('inv-num').value=num;
    clSel.value= prefill ? (prefill.clientId||'') : '';
    projSel.value= prefill ? (prefill.projectId||'') : '';
    document.getElementById('inv-amount').value= prefill ? (prefill.amount||'') : '';
    document.getElementById('inv-date').value=today;
    document.getElementById('inv-due').value=dueStr;
    document.getElementById('inv-desc').value= prefill ? (prefill.desc||'') : '';
  }
  openModal('modal-invoice');
}

function saveInvoice() {
  var clientId = document.getElementById('inv-client').value;
  var amt = parseFloat(document.getElementById('inv-amount').value);
  if (!clientId) { showModalErr('inv-err','Please select a client.'); return; }
  if (!amt||isNaN(amt)) { showModalErr('inv-err','Please enter a valid amount.'); return; }
  var client = CLIENTS.find(function(c){return c.id===clientId;});
  var projId = document.getElementById('inv-project').value;
  var proj = PROJECTS.find(function(p){return p.id===projId;});
  var data = {
    ref:document.getElementById('inv-num').value, client:clientId, clientName:client?client.name:'',
    project:projId, projectName:proj?proj.name:'',
    amount:amt, date:document.getElementById('inv-date').value,
    due:document.getElementById('inv-due').value,
    desc:document.getElementById('inv-desc').value, status:'sent'
  };
  if (STATE.editInvId) {
    var idx=INVOICES.findIndex(function(i){return i.id===STATE.editInvId;});
    if (idx>=0){data.id=STATE.editInvId; Object.assign(INVOICES[idx],data);}
    showToast('Invoice updated.','success');
  } else {
    data.id='inv-'+Date.now(); INVOICES.push(data);
