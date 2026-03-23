/* ═══ CONTRAQ — SEARCH ═══
   globalSearch, closeGlobalSearch, buildNotifPanel, toggleNotifPanel, notifClick, exportCSV
   Lines 17567-17743 from contraq-v77
═══════════════════════════════════════════ */

function globalSearch(q) {
  var el = document.getElementById('global-search-results');
  if (!el) return;
  q = (q||'').trim().toLowerCase();
  if (!q || q.length < 2) { el.classList.remove('open'); return; }

  var results = [];

  PROJECTS.forEach(function(p){
    if ((p.name+p.code+p.clientName).toLowerCase().includes(q))
      results.push({icon:ICON.building,text:p.name,meta:p.code+' · '+p.clientName,panel:'projects',action:"openProjectDetail('"+p.id+"')"});
  });
  INVOICES.forEach(function(i){
    if ((i.ref+i.clientName+i.projectName).toLowerCase().includes(q))
      results.push({icon:ICON.receipt,text:i.ref+' — £'+fmtNum(i.amount),meta:i.clientName+' · '+i.status,panel:'invoices',action:"openInvoiceModal('"+i.id+"')"});
  });
  TENDERS.forEach(function(t){
    if ((t.name+t.ref+t.clientName).toLowerCase().includes(q))
      results.push({icon:ICON.clipboard,text:t.name,meta:t.ref+' · '+t.clientName,panel:'tenders',action:"openTenderModal('"+t.id+"')"});
  });
  CLIENTS.forEach(function(c){
    if ((c.name+c.sector+c.contact).toLowerCase().includes(q))
      results.push({icon:ICON.users,text:c.name,meta:c.sector+' · '+c.contact,panel:'clients',action:"openClientDetail('"+c.id+"')"});
  });
  SITE_MEASURES.forEach(function(m){
    if ((m.name+m.projectName).toLowerCase().includes(q))
      results.push({icon:ICON.ruler,text:m.name,meta:m.projectName+' · '+m.rev,panel:'measures',action:"openMeasureModal('"+m.id+"')"});
  });
  ENGINEERS.forEach(function(e){
    if ((e.name+e.trade).toLowerCase().includes(q))
      results.push({icon:ICON.worker,text:e.name,meta:e.trade+' · '+e.type,panel:'engineers',action:"openEngineerModal('"+e.id+"')"});
  });
  SUPPLIERS.forEach(function(s){
    if ((s.name+s.category).toLowerCase().includes(q))
      results.push({icon:ICON.factory,text:s.name,meta:s.category,panel:'suppliers',action:"openSupplierModal('"+s.id+"')"});
  });
  PO_REGISTER.forEach(function(po){
    if ((po.id+po.supplier+po.desc).toLowerCase().includes(q))
      results.push({icon:ICON.package,text:po.id+' — '+po.supplier,meta:po.desc,panel:'procurement',action:"openPOModal('"+po.id+"')"});
  });

  if (!results.length) {
    el.innerHTML = '<div class="gs-empty">No results for "'+q+'"</div>';
  } else {
    var grouped = {};
    var panelLabels={projects:'Projects',invoices:'Invoices',tenders:'Quotes',clients:'Clients',measures:'Measures',engineers:'Engineers',suppliers:'Suppliers',procurement:'Procurement'};
    results.slice(0,12).forEach(function(r){
      if (!grouped[r.panel]) grouped[r.panel]=[];
      grouped[r.panel].push(r);
    });
    el.innerHTML = Object.keys(grouped).map(function(p){
      return '<div class="gs-section">'+panelLabels[p]+'</div>'
        + grouped[p].map(function(r){
            return '<div class="gs-item" onclick="closeGlobalSearch();dashNav(\''+r.panel+'\');setTimeout(function(){'+r.action+'},100)">'
              +'<span class="gs-item-icon">'+r.icon+'</span>'
              +'<span class="gs-item-text">'+r.text+'</span>'
              +'<span class="gs-item-meta">'+r.meta+'</span>'
              +'</div>';
          }).join('');
    }).join('');
  }
  el.classList.add('open');
}

function closeGlobalSearch() {
  var el = document.getElementById('global-search-results');
  if (el) el.classList.remove('open');
  var inp = document.getElementById('global-search');
  if (inp) inp.value='';
}

/* ══════════════════════════════════════════════════════════════
   NOTIFICATIONS (v7)
══════════════════════════════════════════════════════════════ */
function buildNotifPanel() {
  var panel = document.getElementById('notif-panel');
  var dot   = document.getElementById('notif-dot');
  if (!panel) return;
  if (typeof NOTIFICATIONS === 'undefined' || !NOTIFICATIONS) return;
  /* ── API: load activity from database for real users ── */
  if (ContraqAPI.isRealUser() && !STATE._activityApiLoaded) {
    ContraqAPI.getActivity(30).then(function(activity) {
      if (activity && activity.length) {
        activity.forEach(function(a) {
          var exists = ACTIVITY_LOG.some(function(al) { return al.id === a.id; });
          if (!exists) {
            ACTIVITY_LOG.push({ id: a.id, icon: a.icon || '', iconBg: a.icon_bg || a.iconBg || '', text: a.text, time: a.time || a.created_at || '', panel: a.panel || '' });
          }
        });
      }
      STATE._activityApiLoaded = true;
    }).catch(function(e) { console.error('[Activity] API error:', e); STATE._activityApiLoaded = true; });
  }
  var unread = NOTIFICATIONS.filter(function(n){return n.unread;}).length;
  if (dot) dot.style.display = unread ? 'block' : 'none';

  var html = '<div class="notif-header"><span class="notif-header-title">Notifications'+(unread?' <span style="font-family:var(--mono);font-size:.65rem;color:var(--orange)">'+unread+' new</span>':'')+'</span><span class="notif-header-clear" onclick="markAllNotifsRead()">Mark all read</span></div>';
  if (!NOTIFICATIONS.length) { html += '<div class="notif-empty">No notifications.</div>'; }
  else {
    html += NOTIFICATIONS.map(function(n){
      return '<div class="notif-item'+(n.unread?' unread':'')+'" onclick="notifClick(\''+n.id+'\')" style="position:relative;">'
        +'<span class="notif-item-icon">'+n.icon+'</span>'
        +'<div class="notif-item-body"><div class="notif-item-text">'+n.text+'</div><div class="notif-item-time">'+n.time+'</div></div>'
        +'<button onclick="event.stopPropagation();dismissNotif(\''+n.id+'\')" style="position:absolute;top:.4rem;right:.5rem;background:none;border:none;color:var(--off4);font-size:.8rem;cursor:pointer;line-height:1;padding:.1rem .2rem;" title="Dismiss">&#215;</button>'
        +'</div>';
    }).join('');
  }
  panel.innerHTML = html;
}

function toggleNotifPanel() {
  var panel = document.getElementById('notif-panel');
  if (!panel) return;
  var open = panel.classList.toggle('open');
  STATE.notifPanelOpen = open;
  if (open) buildNotifPanel();
}

function markAllNotifsRead() {
  NOTIFICATIONS.forEach(function(n){n.unread=false;});
  var dot = document.getElementById('notif-dot');
  if (dot) dot.style.display='none';
  buildNotifPanel();
}

function dismissNotif(id) {
  NOTIFICATIONS = NOTIFICATIONS.filter(function(n){return n.id!==id;});
  buildNotifPanel();
}

function notifClick(id) {
  var n = NOTIFICATIONS.find(function(x){return x.id===id;});
  if (!n) return;
  n.unread = false;
  var panel = document.getElementById('notif-panel');
  if (panel) panel.classList.remove('open');
  dashNav(n.panel);
  /* Extra navigation based on type */
  if (n.extra) {
    if (n.extra.projectId) {
      setTimeout(function(){ openProjectDetail(n.extra.projectId); }, 200);
    } else if (n.extra.engId) {
      setTimeout(function(){ openEngineerModal(n.extra.engId); }, 200);
    } else if (n.extra.phId) {
      /* Navigate diary to the week containing this placeholder */
      var ph = SCHED_STATE.placeholders.find(function(x){ return x.id===n.extra.phId; });
      if (ph && ph.date) {
        var today  = new Date(); today.setHours(0,0,0,0);
        var phDate = new Date(ph.date); phDate.setHours(0,0,0,0);
        var dayDiff = Math.round((phDate - today) / 86400000);
        var todayDow = (today.getDay()+6)%7; // Mon=0
        var phDow    = (phDate.getDay()+6)%7;
        var startOfTodayWeek = new Date(today); startOfTodayWeek.setDate(today.getDate()-todayDow);
        var startOfPhWeek    = new Date(phDate); startOfPhWeek.setDate(phDate.getDate()-phDow);
        var weekDiff = Math.round((startOfPhWeek - startOfTodayWeek) / (7*86400000));
        SCHED_STATE.weekOffset = weekDiff;
        SCHED_STATE.diaryView  = 'week';
        setTimeout(function(){
          renderDiary();
          /* Highlight the placeholder block after render */
          setTimeout(function(){
            var el = document.getElementById('ph-block-'+ph.id);
            if (el) {
              el.style.outline = '2px solid var(--orange)';
              el.style.outlineOffset = '2px';
              el.scrollIntoView({behavior:'smooth',block:'center'});
              setTimeout(function(){ if(el){el.style.outline='';el.style.outlineOffset='';} }, 2500);
            }
          }, 200);
        }, 150);
      }
    }
  }
  buildNotifPanel();
}

function exportCSV() {
  var data = [['Code','Project','Client','Value','Status','Start','End']].concat(
    PROJECTS.map(function(p){return [p.code,p.name,p.clientName,p.value,p.status,p.start,p.end];})
  ).map(function(r){return r.join(',');}).join('\n');
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(data);
  a.download='contraq-export.csv'; a.click();
  showToast('CSV exported.','success');
}

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════════════════════════ */
