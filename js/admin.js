/* ═══ CONTRAQ — ADMIN ═══
   renderAdminPanel, adminHealthRow
   Lines 17744-17870 from contraq-v77
═══════════════════════════════════════════ */

function renderAdminPanel() {
  var user = STATE.user || DEMO_USER;
  if (user.role !== 'admin') {
    showToast('Access Denied — Admin privileges required.', 'error');
    dashNav('home');
    return;
  }

  var content = document.getElementById('dash-content');
  if (!content) return;

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
