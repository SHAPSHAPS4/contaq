/* ═══ CONTRAQ — ADMIN ═══
   renderAdminPanel, adminHealthRow
   Lines 17744-17870 from contraq-v77
═══════════════════════════════════════════ */

/* ── Admin tab state ───────────────────────────────────── */
if (!STATE.adminTab) STATE.adminTab = 'overview';
function setAdminTab(tab) { STATE.adminTab = tab; renderAdminPanel(); }

function renderAdminPanel() {
  var user = STATE.user || DEMO_USER;
  if (user.role !== 'admin') {
    showToast('Access Denied — Admin privileges required.', 'error');
    dashNav('home');
    return;
  }

  var content = document.getElementById('dash-content');
  if (!content) return;

  /* Tab bar */
  var tab = STATE.adminTab || 'overview';
  var tabBar = '<div style="display:flex;gap:.4rem;margin-bottom:1.2rem;border-bottom:1px solid var(--border);padding-bottom:.6rem;">'
    + _adminTabBtn('overview', 'Overview', tab)
    + _adminTabBtn('ai-training', 'AI Training Hub', tab)
    + '</div>';

  if (tab === 'ai-training') {
    content.innerHTML = '<div style="animation:fadeUp .35s ease both">' + tabBar + '</div>';
    renderAdminAITraining(content.firstChild);
    return;
  }

  // Stats
  var totalUsers = ADMIN_USERS.length;
  var activeUsers = ADMIN_USERS.filter(function(u){return u.status==='active';}).length;
  var suspendedUsers = ADMIN_USERS.filter(function(u){return u.status==='suspended';}).length;
  var totalLogins = ADMIN_USERS.reduce(function(s,u){return s+u.logins30;},0);
  var planCounts = {professional:0, business:0};
  ADMIN_USERS.forEach(function(u){ planCounts[u.plan] = (planCounts[u.plan]||0)+1; });

  var planBadge = {'professional':'<span class="badge o">Professional</span>','business':'<span class="badge g">Business</span>'};
  var statusBadge = {'active':'<span class="badge g">Active</span>','suspended':'<span class="badge r">Suspended</span>'};

  var userRows = ADMIN_USERS.map(function(u) {
    var suspendLabel = u.status === 'suspended' ? 'Unsuspend' : 'Suspend';
    var suspendStyle = u.status === 'suspended'
      ? 'background:rgba(163,230,53,.1);color:var(--lime);border-color:rgba(163,230,53,.3)'
      : 'background:rgba(251,191,36,.08);color:var(--yellow);border-color:rgba(251,191,36,.25)';
    var uid = u.id;
    return '<tr>' +
      '<td class="mono" style="font-size:.78rem">' + u.fname + ' ' + u.lname + '</td>' +
      '<td class="mono" style="font-size:.74rem;color:var(--off3)">' + u.email + '</td>' +
      '<td style="font-size:.78rem">' + u.company + '</td>' +
      '<td>' + planBadge[u.plan] + '</td>' +
      '<td class="mono" style="font-size:.74rem;color:var(--off3)">' + u.joined + '</td>' +
      '<td class="mono" style="font-size:.74rem;color:var(--off3)">' + u.lastLogin + '</td>' +
      '<td>' + statusBadge[u.status] + '</td>' +
      '<td><div style="display:flex;gap:.3rem;align-items:center;flex-wrap:wrap">' +
        '<button class="btn btn-xs btn-outline" onclick="adminOpenEditPlan(&quot;' + uid + '&quot;)">Edit Plan</button>' +
        '<button class="btn btn-xs" style="' + suspendStyle + '" onclick="adminOpenSuspend(&quot;' + uid + '&quot;)">' + suspendLabel + '</button>' +
        '<button class="btn btn-xs btn-danger" onclick="adminOpenDelete(&quot;' + uid + '&quot;)">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');

  content.innerHTML =
    '<div style="animation:fadeUp .35s ease both">' +
    tabBar +

    // KPI row
    '<div class="kpi-row" style="margin-bottom:1.5rem">' +
      '<div class="kpi-card"><div class="kpi-label">Total Users</div><div class="kpi-value">'+totalUsers+'</div></div>' +
      '<div class="kpi-card"><div class="kpi-label">Active Users</div><div class="kpi-value" style="color:var(--lime)">'+activeUsers+'</div></div>' +
      '<div class="kpi-card"><div class="kpi-label">Suspended</div><div class="kpi-value" style="color:var(--red)">'+suspendedUsers+'</div></div>' +
      '<div class="kpi-card"><div class="kpi-label">Logins (30d)</div><div class="kpi-value" style="color:var(--orange)">'+totalLogins+'</div></div>' +
    '</div>' +

    // Usage stats charts row
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1.5rem">' +

      // Logins per user chart
      '<div class="card">' +
        '<div class="card-header"><span class="card-title">Logins — Last 30 Days</span><span class="mono" style="font-size:.7rem;color:var(--off4)">per user</span></div>' +
        '<canvas id="admin-chart-logins" height="180"></canvas>' +
      '</div>' +

      // Plan distribution chart
      '<div class="card">' +
        '<div class="card-header"><span class="card-title">Plan Distribution</span></div>' +
        '<canvas id="admin-chart-plans" height="180"></canvas>' +
      '</div>' +

      // Sign-ups over months
      '<div class="card">' +
        '<div class="card-header"><span class="card-title">Sign-ups by Month</span></div>' +
        '<canvas id="admin-chart-signups" height="180"></canvas>' +
      '</div>' +

    '</div>' +

    // Feature usage row
    '<div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1.5rem">' +
      '<div class="card">' +
        '<div class="card-header"><span class="card-title">Feature Usage</span><span class="mono" style="font-size:.7rem;color:var(--off4)">% of active users</span></div>' +
        '<canvas id="admin-chart-features" height="160"></canvas>' +
      '</div>' +
      '<div class="card" style="display:flex;flex-direction:column;gap:.75rem">' +
        '<div class="card-header"><span class="card-title">Platform Health</span></div>' +
        '<div style="display:flex;flex-direction:column;gap:.6rem;padding:.25rem 0">' +
          adminHealthRow('API Uptime','99.97%','lime') +
          adminHealthRow('Avg Response','124ms','lime') +
          adminHealthRow('Error Rate','0.04%','lime') +
          adminHealthRow('Storage Used','2.1 GB','orange') +
          adminHealthRow('Active Sessions','3','lime') +
        '</div>' +
      '</div>' +
    '</div>' +

    // Users table
    '<div class="card">' +
      '<div class="card-header">' +
        '<span class="card-title">Registered Users</span>' +
        '<span class="mono" style="font-size:.72rem;color:var(--off4)">'+totalUsers+' total</span>' +
      '</div>' +
      '<div style="overflow-x:auto">' +
        '<table class="tbl">' +
          '<thead><tr>' +
            '<th>Name</th><th>Email</th><th>Company</th><th>Plan</th><th>Joined</th><th>Last Login</th><th>Status</th><th>Actions</th>' +
          '</tr></thead>' +
          '<tbody id="admin-users-tbody">'+userRows+'</tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +

    '</div>';

  // Render charts after DOM insertion
  setTimeout(function(){
    adminRenderCharts();
  }, 80);
}

function adminHealthRow(label, val, col) {
  var color = col === 'lime' ? 'var(--lime)' : 'var(--orange)';
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem .6rem;background:var(--bg3);border-radius:7px;border:1px solid var(--border)">' +
    '<span style="font-size:.8rem;color:var(--off3)">'+label+'</span>' +
    '<span class="mono" style="font-size:.82rem;font-weight:600;color:'+color+'">'+val+'</span>' +
  '</div>';
}

function _adminTabBtn(id, label, active) {
  var isActive = active === id;
  return '<button class="btn btn-sm ' + (isActive ? 'btn-primary' : 'btn-dark') + '" style="font-size:.72rem;padding:.35rem .85rem;border-radius:20px;" onclick="setAdminTab(\'' + id + '\')">' + label + '</button>';
}

/* ══════════════════════════════════════════════════════════════
   AI TRAINING HUB — Admin-only feedback loop interface
══════════════════════════════════════════════════════════════ */

var _trainingData = null;
var _trainingQueue = [];
var _trainingReviewItem = null;

function renderAdminAITraining(container) {
  /* Load metrics + queue from API or use demo data */
  var metrics = _trainingData || _demoTrainingMetrics();
  var queue = _trainingQueue.length ? _trainingQueue : _demoTrainingQueue();

  var h = '';

  /* KPI cards */
  h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:.6rem;margin-bottom:1.2rem;">';
  h += _trainKPI(metrics.totals.total_reviews, 'Reviews', 'var(--white)');
  h += _trainKPI(metrics.rates.hallucination_pct + '%', 'Halluc. Rate', metrics.rates.hallucination_pct > 10 ? '#f87171' : metrics.rates.hallucination_pct > 5 ? '#f59e0b' : 'var(--lime)');
  h += _trainKPI(metrics.rates.accuracy_pct + '%', 'Accuracy', metrics.rates.accuracy_pct >= 80 ? 'var(--lime)' : metrics.rates.accuracy_pct >= 60 ? '#f59e0b' : '#f87171');
  h += _trainKPI(metrics.pending_reviews, 'Pending', metrics.pending_reviews > 10 ? '#f87171' : 'var(--orange)');
  h += _trainKPI(metrics.golden_records, 'Golden Records', 'var(--blue)');
  h += '</div>';

  /* Accuracy trend chart */
  if (metrics.weekly && metrics.weekly.length > 1) {
    h += '<div class="card" style="margin-bottom:1rem;padding:.75rem;">';
    h += '<div class="card-header" style="margin-bottom:.5rem;"><span class="card-title">Accuracy Trend</span><span class="mono" style="font-size:.65rem;color:var(--off4);">Last ' + metrics.weekly.length + ' data points</span></div>';
    h += '<div style="display:flex;align-items:flex-end;gap:3px;height:60px;">';
    var maxItems = Math.max.apply(null, metrics.weekly.map(function(w) { return w.items || 1; }));
    metrics.weekly.forEach(function(w) {
      var acc = w.items > 0 ? Math.round((w.correct / w.items) * 100) : 0;
      var barH = Math.max(4, Math.round((acc / 100) * 56));
      var barColor = acc >= 80 ? 'var(--lime)' : acc >= 60 ? '#f59e0b' : '#f87171';
      h += '<div title="' + w.date + ': ' + acc + '% accuracy (' + w.items + ' items)" style="flex:1;height:' + barH + 'px;background:' + barColor + ';border-radius:2px 2px 0 0;min-width:8px;"></div>';
    });
    h += '</div></div>';
  }

  /* Review Queue */
  h += '<div class="card" style="margin-bottom:1rem;">';
  h += '<div class="card-header"><span class="card-title">Review Queue</span><span class="mono" style="font-size:.65rem;color:var(--off4);">' + queue.length + ' pending</span></div>';
  if (queue.length === 0) {
    h += '<div style="text-align:center;padding:1.5rem;color:var(--lime);font-size:.8rem;">All extractions reviewed. Queue is clear.</div>';
  } else {
    h += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr>';
    h += '<th style="width:40px;">Grade</th><th>Document</th><th style="width:70px;">Type</th><th style="width:45px;">Items</th><th style="width:70px;">Date</th><th style="width:60px;"></th>';
    h += '</tr></thead><tbody>';
    queue.slice(0, 20).forEach(function(ext) {
      var gradeColor = ext.validation_grade === 'A' || ext.validation_grade === 'B' ? 'var(--lime)' : ext.validation_grade === 'C' ? '#f59e0b' : '#f87171';
      var gradeBg = ext.validation_grade === 'A' || ext.validation_grade === 'B' ? 'rgba(163,230,53,.08)' : ext.validation_grade === 'C' ? 'rgba(251,191,36,.06)' : 'rgba(248,113,113,.06)';
      h += '<tr>';
      h += '<td><span class="mono" style="font-size:.85rem;font-weight:700;color:' + gradeColor + ';background:' + gradeBg + ';border-radius:4px;padding:.1rem .35rem;">' + (ext.validation_grade || '?') + '</span></td>';
      h += '<td style="font-size:.75rem;color:var(--white);">' + (ext.document_name || 'Unknown') + '</td>';
      h += '<td><span style="font-family:var(--mono);font-size:.55rem;background:rgba(96,165,250,.08);color:var(--blue);border:1px solid rgba(96,165,250,.2);border-radius:3px;padding:.08rem .25rem;">' + (ext.extraction_type || '') + '</span></td>';
      h += '<td class="mono" style="font-size:.75rem;color:var(--white);font-weight:600;">' + (ext.item_count || 0) + '</td>';
      h += '<td style="font-size:.65rem;color:var(--off4);">' + (ext.created_at ? ext.created_at.split('T')[0] : '') + '</td>';
      h += '<td><button class="btn btn-primary btn-xs" onclick="openTrainingReview(\'' + ext.id + '\')">Review</button></td>';
      h += '</tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';

  /* Recent Golden Records */
  var goldens = _demoGoldenRecords();
  if (goldens.length > 0) {
    h += '<div class="card" style="margin-bottom:1rem;">';
    h += '<div class="card-header"><span class="card-title">Recent Golden Records</span><span class="mono" style="font-size:.65rem;color:var(--off4);">' + goldens.length + ' total</span></div>';
    h += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr>';
    h += '<th>Document</th><th style="width:55px;text-align:right;">Correct</th><th style="width:55px;text-align:right;">Wrong</th><th style="width:55px;text-align:right;">Halluc.</th><th style="width:55px;text-align:right;">Missed</th><th style="width:60px;">Accuracy</th><th style="width:65px;">Date</th>';
    h += '</tr></thead><tbody>';
    goldens.slice(0, 10).forEach(function(gr) {
      var accColor = gr.accuracy_pct >= 80 ? 'var(--lime)' : gr.accuracy_pct >= 60 ? '#f59e0b' : '#f87171';
      h += '<tr>';
      h += '<td style="font-size:.75rem;color:var(--white);">' + gr.document_name + '</td>';
      h += '<td class="mono" style="text-align:right;color:var(--lime);">' + gr.correct_count + '</td>';
      h += '<td class="mono" style="text-align:right;color:#f59e0b;">' + gr.wrong_count + '</td>';
      h += '<td class="mono" style="text-align:right;color:#f87171;">' + gr.hallucination_count + '</td>';
      h += '<td class="mono" style="text-align:right;color:var(--blue);">' + gr.missed_count + '</td>';
      h += '<td><span class="mono" style="font-weight:700;color:' + accColor + ';">' + gr.accuracy_pct + '%</span></td>';
      h += '<td style="font-size:.62rem;color:var(--off4);">' + gr.created_at.split('T')[0] + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div></div>';
  }

  /* Error Type Breakdown + Actions row */
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">';

  /* Error types */
  h += '<div class="card"><div class="card-header"><span class="card-title">Top Error Types</span></div>';
  var errorTypes = [
    { type: 'Quantity hallucination', pct: 31, color: '#f87171' },
    { type: 'Missing specification', pct: 24, color: '#f59e0b' },
    { type: 'Wrong unit', pct: 18, color: 'var(--orange)' },
    { type: 'Invented item', pct: 15, color: '#f87171' },
    { type: 'Duplicate extraction', pct: 12, color: 'var(--blue)' }
  ];
  errorTypes.forEach(function(e) {
    h += '<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;">';
    h += '<div style="flex:1;font-size:.75rem;color:var(--off2);">' + e.type + '</div>';
    h += '<div style="width:80px;height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;"><div style="width:' + e.pct + '%;height:100%;background:' + e.color + ';border-radius:3px;"></div></div>';
    h += '<span class="mono" style="font-size:.7rem;color:' + e.color + ';width:30px;text-align:right;">' + e.pct + '%</span>';
    h += '</div>';
  });
  h += '</div>';

  /* Quick actions */
  h += '<div class="card"><div class="card-header"><span class="card-title">Actions</span></div>';
  h += '<div style="display:flex;flex-direction:column;gap:.4rem;padding:.25rem 0;">';
  h += '<button class="btn btn-sm" style="justify-content:flex-start;background:rgba(96,165,250,.07);color:var(--blue);border:1px solid rgba(96,165,250,.2);" onclick="exportTrainingData()">Export training data (JSON)</button>';
  h += '<button class="btn btn-sm" style="justify-content:flex-start;background:rgba(163,230,53,.07);color:var(--lime);border:1px solid rgba(163,230,53,.2);" onclick="showToast(\'Prompt version management coming soon.\',\'ok\')">Manage prompt versions</button>';
  h += '<button class="btn btn-sm" style="justify-content:flex-start;background:rgba(251,191,36,.07);color:#f59e0b;border:1px solid rgba(251,191,36,.2);" onclick="dashNav(\'admin\');setAdminTab(\'overview\')">View KB learned rules</button>';
  h += '</div></div>';

  h += '</div>';

  container.innerHTML += h;

  /* Try loading real data from API */
  _loadTrainingData();
}

function _trainKPI(val, label, color) {
  return '<div class="card" style="padding:.6rem .75rem;">'
    + '<div class="mono" style="font-size:1.1rem;font-weight:700;color:' + color + ';">' + val + '</div>'
    + '<div style="font-size:.58rem;color:var(--off4);">' + label + '</div></div>';
}

/* ── Review Interface ─────────────────────────────────── */

function openTrainingReview(extractionId) {
  var ext = _trainingQueue.find(function(e) { return e.id === extractionId; });
  if (!ext) ext = _demoTrainingQueue().find(function(e) { return e.id === extractionId; });
  if (!ext) { showToast('Extraction not found.', 'error'); return; }

  _trainingReviewItem = ext;
  var items = [];
  if (ext.raw_result) {
    items = ext.raw_result.extraction || ext.raw_result.consolidated_takeoff || ext.raw_result.items || [];
    if (!Array.isArray(items)) items = [];
  }

  var h = '<div style="padding:1.2rem;">';

  /* Header */
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">';
  h += '<div><div style="font-size:1rem;font-weight:700;color:var(--white);">Review Extraction</div>';
  h += '<div style="font-size:.72rem;color:var(--off3);margin-top:.1rem;">' + ext.document_name + ' &middot; ' + (ext.extraction_type || '') + ' &middot; Grade ' + (ext.validation_grade || '?') + '</div></div>';
  h += '<div style="display:flex;gap:.4rem;">';
  h += '<button class="btn btn-primary btn-xs" onclick="submitTrainingReview(\'' + extractionId + '\')">Save Review</button>';
  h += '<button class="btn btn-dark btn-xs" onclick="closeModal(\'modal-training-review\')">Cancel</button>';
  h += '</div></div>';

  /* Items table with tagging */
  if (items.length === 0) {
    h += '<div style="text-align:center;padding:2rem;color:var(--off4);">No items in this extraction to review.</div>';
  } else {
    h += '<div style="font-size:.72rem;color:var(--off3);margin-bottom:.5rem;">' + items.length + ' items to review. Tag each item and correct any errors.</div>';
    items.forEach(function(item, i) {
      var desc = item.description || item.desc || '';
      var qty = item.quantity || item.qty || 0;
      var unit = item.unit || 'nr';
      var spec = item.specification || '';
      var trade = item.trade || '';
      var conf = item.confidence || '';

      h += '<div class="card" style="margin-bottom:.4rem;padding:.6rem .75rem;" id="train-item-' + i + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.75rem;">';

      /* Left: item details */
      h += '<div style="flex:1;">';
      h += '<div style="font-size:.78rem;color:var(--white);font-weight:500;margin-bottom:.25rem;">' + desc + '</div>';
      h += '<div style="display:flex;gap:.75rem;font-size:.68rem;color:var(--off3);">';
      h += '<span>Qty: <strong class="mono" style="color:var(--white);">' + qty + '</strong> ' + unit + '</span>';
      if (trade) h += '<span>Trade: ' + trade + '</span>';
      if (spec) h += '<span title="' + spec + '">Spec: ' + spec.substring(0, 40) + (spec.length > 40 ? '...' : '') + '</span>';
      if (conf) h += '<span>Conf: ' + conf + '</span>';
      h += '</div></div>';

      /* Right: tag buttons */
      h += '<div style="display:flex;gap:.25rem;flex-wrap:wrap;min-width:200px;">';
      h += _tagBtn(i, 'correct', 'Correct', 'var(--lime)', 'rgba(163,230,53,.08)');
      h += _tagBtn(i, 'wrong_value', 'Wrong', '#f59e0b', 'rgba(251,191,36,.06)');
      h += _tagBtn(i, 'hallucination', 'Halluc.', '#f87171', 'rgba(248,113,113,.06)');
      h += _tagBtn(i, 'missed_item', 'Missed', 'var(--blue)', 'rgba(96,165,250,.06)');
      h += '</div>';

      h += '</div>';

      /* Correction input (hidden until tag is wrong/hallucination) */
      h += '<div id="train-correct-' + i + '" style="display:none;margin-top:.4rem;padding-top:.4rem;border-top:1px solid var(--border);">';
      h += '<div style="display:flex;gap:.5rem;align-items:center;">';
      h += '<input id="train-val-' + i + '" type="text" placeholder="Correct value..." style="flex:1;font-size:.75rem;padding:.3rem .5rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);color:var(--white);" value="' + qty + '"/>';
      h += '<input id="train-comment-' + i + '" type="text" placeholder="Comment (optional)..." style="flex:1;font-size:.75rem;padding:.3rem .5rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);color:var(--white);"/>';
      h += '</div></div>';

      h += '</div>';
    });
  }

  h += '</div>';

  /* Show in modal */
  var modal = document.getElementById('modal-training-review');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-training-review';
    modal.className = 'modal-backdrop';
    modal.innerHTML = '<div class="modal" style="max-width:800px;max-height:90vh;overflow-y:auto;" id="modal-training-review-body"></div>';
    modal.onclick = function(e) { if (e.target === modal) closeModal('modal-training-review'); };
    document.body.appendChild(modal);
  }
  document.getElementById('modal-training-review-body').innerHTML = h;
  openModal('modal-training-review');
}

function _tagBtn(idx, tag, label, color, bg) {
  return '<button class="btn btn-xs" id="train-tag-' + idx + '-' + tag + '" style="background:' + bg + ';color:' + color + ';border:1px solid ' + color + '33;font-size:.55rem;" onclick="tagTrainingItem(' + idx + ',\'' + tag + '\')">' + label + '</button>';
}

function tagTrainingItem(idx, tag) {
  /* Highlight selected tag */
  ['correct', 'wrong_value', 'hallucination', 'missed_item'].forEach(function(t) {
    var btn = document.getElementById('train-tag-' + idx + '-' + t);
    if (btn) btn.style.fontWeight = (t === tag) ? '800' : '';
    if (btn) btn.style.boxShadow = (t === tag) ? '0 0 0 2px currentColor' : '';
  });
  /* Show correction input for wrong/hallucination */
  var corrDiv = document.getElementById('train-correct-' + idx);
  if (corrDiv) corrDiv.style.display = (tag === 'wrong_value' || tag === 'hallucination') ? '' : 'none';
  /* Store tag on card */
  var card = document.getElementById('train-item-' + idx);
  if (card) card.setAttribute('data-tag', tag);
}

function submitTrainingReview(extractionId) {
  var ext = _trainingReviewItem;
  if (!ext) return;
  var items = [];
  if (ext.raw_result) {
    items = ext.raw_result.extraction || ext.raw_result.consolidated_takeoff || ext.raw_result.items || [];
    if (!Array.isArray(items)) items = [];
  }

  var feedback = [];
  var corrected = [];
  items.forEach(function(item, i) {
    var card = document.getElementById('train-item-' + i);
    var tag = card ? card.getAttribute('data-tag') : null;
    if (!tag) tag = 'correct'; /* default untagged to correct */
    var corrVal = document.getElementById('train-val-' + i);
    var commentEl = document.getElementById('train-comment-' + i);
    feedback.push({
      item_index: i,
      field_name: 'description',
      original_value: item.description || item.desc || '',
      corrected_value: corrVal ? corrVal.value : '',
      tag: tag,
      comment: commentEl ? commentEl.value : '',
      severity: tag === 'hallucination' ? 'critical' : tag === 'wrong_value' ? 'high' : 'low'
    });
    var correctedItem = JSON.parse(JSON.stringify(item));
    if (tag === 'wrong_value' && corrVal && corrVal.value) {
      correctedItem.quantity = corrVal.value;
      correctedItem._corrected = true;
    }
    corrected.push(correctedItem);
  });

  /* Save locally */
  var gr = {
    id: 'gr-' + Date.now(),
    extraction_id: extractionId,
    document_name: ext.document_name,
    extraction_type: ext.extraction_type,
    corrected_items: corrected,
    original_items: items,
    feedback: feedback,
    correct_count: feedback.filter(function(f) { return f.tag === 'correct'; }).length,
    wrong_count: feedback.filter(function(f) { return f.tag === 'wrong_value'; }).length,
    hallucination_count: feedback.filter(function(f) { return f.tag === 'hallucination'; }).length,
    missed_count: feedback.filter(function(f) { return f.tag === 'missed_item'; }).length,
    item_count: feedback.length,
    accuracy_pct: Math.round((feedback.filter(function(f) { return f.tag === 'correct'; }).length / Math.max(1, feedback.length)) * 100),
    created_at: new Date().toISOString()
  };

  /* Store in localStorage */
  var stored = [];
  try { stored = JSON.parse(localStorage.getItem('contraq_golden_records') || '[]'); } catch(e) {}
  stored.push(gr);
  try { localStorage.setItem('contraq_golden_records', JSON.stringify(stored)); } catch(e) {}

  /* Try API call */
  var token = STATE.session ? STATE.session.access_token : null;
  if (token && CONTRAQ_API_BASE) {
    fetch(CONTRAQ_API_BASE + '/api/admin/training/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        extraction_id: extractionId,
        corrected_items: corrected,
        original_items: items,
        feedback: feedback,
        document_name: ext.document_name,
        extraction_type: ext.extraction_type
      })
    }).catch(function() {});
  }

  /* Remove from queue */
  _trainingQueue = _trainingQueue.filter(function(e) { return e.id !== extractionId; });

  closeModal('modal-training-review');
  showToast('Review saved. Golden record created (' + gr.accuracy_pct + '% accuracy).', 'success');
  setAdminTab('ai-training');
}

function exportTrainingData() {
  var stored = [];
  try { stored = JSON.parse(localStorage.getItem('contraq_golden_records') || '[]'); } catch(e) {}
  if (stored.length === 0) { showToast('No training data to export yet.', 'error'); return; }
  var blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), golden_records: stored }, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'contraq-training-data-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Training data exported (' + stored.length + ' golden records).', 'success');
}

function _loadTrainingData() {
  var token = STATE.session ? STATE.session.access_token : null;
  if (!token || !CONTRAQ_API_BASE) return;
  fetch(CONTRAQ_API_BASE + '/api/admin/training/metrics', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.success) { _trainingData = data; }
  }).catch(function() {});
  fetch(CONTRAQ_API_BASE + '/api/admin/training/queue', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.success && data.extractions) { _trainingQueue = data.extractions; }
  }).catch(function() {});
}

/* ── Demo data for training hub ──────────────────────── */
function _demoTrainingMetrics() {
  return {
    totals: { total_reviews: 23, total_items: 312, correct: 247, wrong: 34, hallucinations: 19, missed: 12 },
    rates: { accuracy_pct: 79.2, hallucination_pct: 6.1, wrong_pct: 10.9 },
    weekly: [
      { date: '2026-03-17', reviews: 3, items: 42, correct: 30, wrong: 7, hallucinations: 3, missed: 2 },
      { date: '2026-03-18', reviews: 4, items: 51, correct: 38, wrong: 6, hallucinations: 4, missed: 3 },
      { date: '2026-03-19', reviews: 2, items: 28, correct: 23, wrong: 3, hallucinations: 1, missed: 1 },
      { date: '2026-03-24', reviews: 5, items: 67, correct: 55, wrong: 7, hallucinations: 3, missed: 2 },
      { date: '2026-03-25', reviews: 3, items: 38, correct: 32, wrong: 3, hallucinations: 2, missed: 1 },
      { date: '2026-03-31', reviews: 6, items: 86, correct: 69, wrong: 8, hallucinations: 6, missed: 3 }
    ],
    pending_reviews: 4,
    golden_records: 19,
    active_rules: 12,
    prompt_versions: 3
  };
}

function _demoTrainingQueue() {
  return [
    { id: 'ext-demo-1', document_name: 'C1799-MX-55001-AC-GF.pdf', extraction_type: 'drawing', validation_grade: 'C', validation_score: 52, item_count: 12, created_at: '2026-04-01T09:30:00Z', review_status: 'pending', raw_result: { extraction: [
      { description: '250mm dia circular supply duct', quantity: 42, unit: 'm', trade: 'Mechanical', confidence: 'Medium', specification: 'Galvanised steel' },
      { description: 'Volume control damper VCD', quantity: 6, unit: 'nr', trade: 'Mechanical', confidence: 'High', specification: '250mm dia' },
      { description: 'Supply air grille', quantity: 8, unit: 'nr', trade: 'Mechanical', confidence: 'High', specification: 'Aluminium, white' },
      { description: 'Return air grille', quantity: 4, unit: 'nr', trade: 'Mechanical', confidence: 'Medium', specification: 'Aluminium' },
      { description: 'AC cassette unit', quantity: 4, unit: 'nr', trade: 'Mechanical', confidence: 'High', specification: 'Ceiling mounted' },
      { description: 'Refrigerant pipework', quantity: 85, unit: 'm', trade: 'Mechanical', confidence: 'Low', specification: 'Copper' },
      { description: 'Condensate drain pipe', quantity: 30, unit: 'm', trade: 'Mechanical', confidence: 'Low', specification: 'PVC' },
      { description: 'Duct support brackets', quantity: 28, unit: 'nr', trade: 'Mechanical', confidence: 'Medium', specification: 'Galvanised' }
    ] } },
    { id: 'ext-demo-2', document_name: 'PRJ-042-Elec-DB-Schedule.pdf', extraction_type: 'drawing', validation_grade: 'B', validation_score: 68, item_count: 18, created_at: '2026-03-31T14:15:00Z', review_status: 'pending', raw_result: { extraction: [
      { description: 'Distribution board 12-way', quantity: 2, unit: 'nr', trade: 'Electrical', confidence: 'High', specification: 'Hager VML' },
      { description: 'RCBO 32A Type B', quantity: 12, unit: 'nr', trade: 'Electrical', confidence: 'High', specification: 'Hager' },
      { description: 'SWA cable 4c 6mm', quantity: 45, unit: 'm', trade: 'Electrical', confidence: 'Medium', specification: 'BS 5467' },
      { description: 'Cable tray 300mm', quantity: 1500, unit: 'm', trade: 'Electrical', confidence: 'Low', specification: 'Galvanised' }
    ] } },
    { id: 'ext-demo-3', document_name: 'LTHW-Pipework-GF-Rev-B.pdf', extraction_type: 'drawing', validation_grade: 'D', validation_score: 35, item_count: 8, created_at: '2026-03-31T11:00:00Z', review_status: 'pending', raw_result: { extraction: [
      { description: 'LTHW copper pipe 22mm', quantity: 120, unit: 'm', trade: 'Mechanical', confidence: 'Medium', specification: 'BS EN 1057' },
      { description: 'LTHW copper pipe 28mm', quantity: 65, unit: 'm', trade: 'Mechanical', confidence: 'Medium', specification: 'BS EN 1057' },
      { description: 'Gate valve 22mm', quantity: 8, unit: 'nr', trade: 'Mechanical', confidence: 'High', specification: 'PN16' },
      { description: 'Circulator pump', quantity: 2, unit: 'nr', trade: 'Mechanical', confidence: 'High', specification: 'Grundfos UPS' }
    ] } },
    { id: 'ext-demo-4', document_name: 'Insulation-Spec-NBS-Z22.pdf', extraction_type: 'spec', validation_grade: 'A', validation_score: 82, item_count: 6, created_at: '2026-03-30T16:45:00Z', review_status: 'pending', raw_result: { extraction: [
      { description: 'Mineral wool pipe insulation 25mm', quantity: 185, unit: 'm', trade: 'Insulation', confidence: 'High', specification: 'Rockwool RockLap' },
      { description: 'Mineral wool pipe insulation 30mm', quantity: 65, unit: 'm', trade: 'Insulation', confidence: 'High', specification: 'Rockwool RockLap' }
    ] } }
  ];
}

function _demoGoldenRecords() {
  var stored = [];
  try { stored = JSON.parse(localStorage.getItem('contraq_golden_records') || '[]'); } catch(e) {}
  if (stored.length > 0) return stored;
  return [
    { document_name: 'Vent-GF-Rev-P01.pdf', correct_count: 14, wrong_count: 2, hallucination_count: 1, missed_count: 0, accuracy_pct: 82, created_at: '2026-03-28T10:00:00Z' },
    { document_name: 'Elec-Lighting-FF.pdf', correct_count: 22, wrong_count: 3, hallucination_count: 0, missed_count: 1, accuracy_pct: 85, created_at: '2026-03-27T14:30:00Z' },
    { document_name: 'LTHW-Pipework-Sch.pdf', correct_count: 8, wrong_count: 4, hallucination_count: 2, missed_count: 1, accuracy_pct: 53, created_at: '2026-03-26T09:15:00Z' }
  ];
}
