/* ═══ CONTRAQ — ADMIN_CHARTS ═══
   adminRenderCharts, adminEditPlan, adminSuspend, adminDelete
   Lines 17871-18070 from contraq-v77
═══════════════════════════════════════════ */


function adminRenderCharts() {
  // Logins chart
  var ctx1 = document.getElementById('admin-chart-logins');
  if (ctx1) {
    if (ctx1._adminChart) { try{ctx1._adminChart.destroy();}catch(e){} }
    ctx1._adminChart = new Chart(ctx1, {
      type:'bar',
      data:{
        labels: ADMIN_USERS.map(function(u){return u.fname;}),
        datasets:[{
          label:'Logins',
          data: ADMIN_USERS.map(function(u){return u.logins30;}),
          backgroundColor: ADMIN_USERS.map(function(u){
            return u.status==='suspended' ? 'rgba(248,113,113,.6)' : 'rgba(249,115,22,.72)';
          }),
          borderRadius:5,
          borderSkipped:false
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{legend:{display:false}},
        scales:{
          x:{ticks:{color:'rgba(255,255,255,.35)',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}},
          y:{ticks:{color:'rgba(255,255,255,.35)',font:{size:10}},grid:{color:'rgba(255,255,255,.06)'}}
        }
      }
    });
  }

  // Plan pie chart
  var ctx2 = document.getElementById('admin-chart-plans');
  if (ctx2) {
    if (ctx2._adminChart) { try{ctx2._adminChart.destroy();}catch(e){} }
    var planCounts = {professional:0, business:0};
    ADMIN_USERS.forEach(function(u){ planCounts[u.plan] = (planCounts[u.plan]||0)+1; });
    ctx2._adminChart = new Chart(ctx2, {
      type:'doughnut',
      data:{
        labels:['Professional','Business'],
        datasets:[{
          data:[planCounts.professional, planCounts.business],
          backgroundColor:['rgba(249,115,22,.8)','rgba(163,230,53,.8)'],
          borderColor:'rgba(255,255,255,.08)',
          borderWidth:2
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{
          legend:{labels:{color:'rgba(255,255,255,.55)',font:{size:11}}},
        }
      }
    });
  }

  // Sign-ups by month chart
  var ctx3 = document.getElementById('admin-chart-signups');
  if (ctx3) {
    if (ctx3._adminChart) { try{ctx3._adminChart.destroy();}catch(e){} }
    var monthCounts = {};
    ADMIN_USERS.forEach(function(u){
      var m = u.joined.slice(0,7);
      monthCounts[m] = (monthCounts[m]||0)+1;
    });
    var months = Object.keys(monthCounts).sort();
    ctx3._adminChart = new Chart(ctx3, {
      type:'line',
      data:{
        labels: months.map(function(m){
          var d = new Date(m+'-01');
          return d.toLocaleString('en-GB',{month:'short',year:'2-digit'});
        }),
        datasets:[{
          label:'Sign-ups',
          data: months.map(function(m){return monthCounts[m];}),
          borderColor:'rgba(163,230,53,.8)',
          backgroundColor:'rgba(163,230,53,.12)',
          borderWidth:2,
          pointRadius:4,
          pointBackgroundColor:'rgba(163,230,53,1)',
          tension:.4,
          fill:true
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:true,
        plugins:{legend:{display:false}},
        scales:{
          x:{ticks:{color:'rgba(255,255,255,.35)',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}},
          y:{ticks:{color:'rgba(255,255,255,.35)',font:{size:10},stepSize:1},grid:{color:'rgba(255,255,255,.06)'}}
        }
      }
    });
  }

  // Feature usage bar chart
  var ctx4 = document.getElementById('admin-chart-features');
  if (ctx4) {
    if (ctx4._adminChart) { try{ctx4._adminChart.destroy();}catch(e){} }
    ctx4._adminChart = new Chart(ctx4, {
      type:'bar',
      data:{
        labels:['Quote Book','Projects','Invoices','Diary','Engineers','Price Book','Documents','ECO4','CIS','Reports'],
        datasets:[{
          label:'Usage %',
          data:[89,95,78,62,71,55,83,44,67,38],
          backgroundColor:'rgba(249,115,22,.65)',
          borderRadius:5,
          borderSkipped:false
        }]
      },
      options:{
        indexAxis:'y',
        responsive:true, maintainAspectRatio:true,
        plugins:{legend:{display:false}},
        scales:{
          x:{min:0,max:100,ticks:{color:'rgba(255,255,255,.35)',font:{size:10},callback:function(v){return v+'%'}},grid:{color:'rgba(255,255,255,.06)'}},
          y:{ticks:{color:'rgba(255,255,255,.45)',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}}
        }
      }
    });
  }
}

/* ── Admin Panel: modal-based actions ─────────────────────── */
var _adminTargetId = null;
var _adminPlanLabels = {professional:'Professional',business:'Business'};

function adminOpenEditPlan(uid) {
  var u = ADMIN_USERS.find(function(x){ return x.id === uid; });
  if (!u) return;
  _adminTargetId = uid;
  document.getElementById('admin-ep-username').textContent = u.fname + ' ' + u.lname + ' — ' + u.email;
  document.getElementById('admin-ep-subtitle').textContent = u.company;
  document.getElementById('admin-ep-current').textContent = _adminPlanLabels[u.plan] || u.plan;
  document.getElementById('admin-ep-plan').value = u.plan;
  document.getElementById('admin-ep-note').value = '';
  openModal('modal-admin-edit-plan');
}

function adminConfirmEditPlan() {
  var u = ADMIN_USERS.find(function(x){ return x.id === _adminTargetId; });
  if (!u) return;
  var oldLabel = _adminPlanLabels[u.plan];
  u.plan = document.getElementById('admin-ep-plan').value;
  closeModal('modal-admin-edit-plan');
  showToast('Plan updated — ' + u.fname + ' ' + u.lname + ': ' + oldLabel + ' to ' + _adminPlanLabels[u.plan], 'success');
  renderAdminPanel();
}

function adminOpenSuspend(uid) {
  var u = ADMIN_USERS.find(function(x){ return x.id === uid; });
  if (!u) return;
  _adminTargetId = uid;
  var isSusp = u.status === 'suspended';
  document.getElementById('admin-sus-title').textContent = isSusp ? 'Unsuspend User' : 'Suspend User';
  document.getElementById('admin-sus-icon').textContent = isSusp ? 'Restore' : 'Suspend';
  document.getElementById('admin-sus-msg').textContent = isSusp
    ? 'Restore access for this user? They will be able to log back in immediately.'
    : 'Suspend this user? They will immediately lose access to the CONTRAQ platform.';
  document.getElementById('admin-sus-user').textContent = u.fname + ' ' + u.lname + ' | ' + u.email + ' | ' + u.company;
  var btn = document.getElementById('admin-sus-confirm-btn');
  btn.textContent = isSusp ? 'Restore Access' : 'Suspend User';
  btn.style.background = isSusp ? 'rgba(163,230,53,.12)' : 'rgba(239,68,68,.12)';
  btn.style.color = isSusp ? 'var(--lime)' : 'var(--red)';
  btn.style.border = isSusp ? '1.5px solid rgba(163,230,53,.3)' : '1.5px solid rgba(239,68,68,.3)';
  openModal('modal-admin-suspend');
}

function adminConfirmSuspend() {
  var u = ADMIN_USERS.find(function(x){ return x.id === _adminTargetId; });
  if (!u) return;
  var wasSusp = u.status === 'suspended';
  u.status = wasSusp ? 'active' : 'suspended';
  closeModal('modal-admin-suspend');
  showToast(wasSusp ? 'Access restored — ' + u.fname + ' ' + u.lname : 'User suspended — ' + u.fname + ' ' + u.lname, wasSusp ? 'success' : 'warn');
  renderAdminPanel();
}

function adminOpenDelete(uid) {
  var u = ADMIN_USERS.find(function(x){ return x.id === uid; });
  if (!u) return;
  _adminTargetId = uid;
  document.getElementById('admin-del-user').textContent = u.fname + ' ' + u.lname + ' | ' + u.email + ' | ' + u.company + ' (' + (_adminPlanLabels[u.plan]||u.plan) + ')';
  openModal('modal-admin-delete');
}

function adminConfirmDelete() {
  var idx = ADMIN_USERS.findIndex(function(x){ return x.id === _adminTargetId; });
  if (idx === -1) return;
  var name = ADMIN_USERS[idx].fname + ' ' + ADMIN_USERS[idx].lname;
  ADMIN_USERS.splice(idx, 1);
  closeModal('modal-admin-delete');
  showToast('User deleted — ' + name, 'error');
  renderAdminPanel();
}


