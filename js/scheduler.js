/* ═══ CONTRAQ — SCHEDULER ═══
   MONTH_NAMES, COLOR_NAMES, SCHED_STATE, diary injection, week/month/6mo views, assignments, calendar
   Lines 15479-16610 from contraq-v77
═══════════════════════════════════════════ */

var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var COLOR_NAMES = {
  'ev-orange':'#f97316','ev-blue':'#60a5fa','ev-lime':'#16a34a','ev-purple':'#a855f7','ev-red':'#f87171'
};


/* ══════════════════════════════════════════════════════════════
   ADVANCED SCHEDULER / DIARY  — v2 (fixed)
══════════════════════════════════════════════════════════════ */

/* ── Scheduler state ─────────────────────────────────────────── */
var SCHED_STATE = {
  weekOffset : 0,
  monthOffset: 0,
  sixMoOffset: 0,
  diaryView  : 'week',
  assignments: [],
  placeholders: [],
  dragData   : null,
  filterText : ''
};

/* ── Diary demo data — injected on first renderDiary() call ── */
var _diaryDemoInjected = false;
function injectDiaryDemoData() {
  if (_diaryDemoInjected) return;
  _diaryDemoInjected = true;
  var today = new Date();
  function p2(n){ return n < 10 ? '0'+n : ''+n; }
  function ds(d){ return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()); }
  /* Placeholder 1 day from now */
  var d1 = new Date(today); d1.setDate(d1.getDate()+1);
  if (SCHED_STATE && SCHED_STATE.placeholders)
    SCHED_STATE.placeholders.push({id:'ph-demo-1',date:ds(d1),projectId:'p1',note:'Site handover visit'});
  /* Placeholder 2 days from now */
  var d2 = new Date(today); d2.setDate(d2.getDate()+2);
  if (SCHED_STATE && SCHED_STATE.placeholders)
    SCHED_STATE.placeholders.push({id:'ph-demo-2',date:ds(d2),projectId:'p3',note:'Materials delivery'});
  /* Project deadline ~12 days out */
  var pd = new Date(today); pd.setDate(pd.getDate()+12);
  if (PROJECTS && PROJECTS[1]) PROJECTS[1].end = ds(pd);
  /* Cert expiring ~18 days */
  var cd = new Date(today); cd.setDate(cd.getDate()+18);
  if (ENGINEERS && ENGINEERS[0] && ENGINEERS[0].certs && ENGINEERS[0].certs[0])
    ENGINEERS[0].certs[0].expiry = ds(cd);
  /* Cert expiring ~20 days */
  var cd2 = new Date(today); cd2.setDate(cd2.getDate()+20);
  if (ENGINEERS && ENGINEERS[2] && ENGINEERS[2].certs && ENGINEERS[2].certs[0])
    ENGINEERS[2].certs[0].expiry = ds(cd2);
}

/* ── Seed demo assignments ───────────────────────────────────── */
(function(){
  var today = new Date();
  var mon   = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay()+6)%7));

  function ds(base, off) {
    var d = new Date(base);
    d.setDate(base.getDate() + off);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  var seeds = [
    {e:'e1',p:'p1',d:0,h:8},{e:'e1',p:'p1',d:1,h:8},{e:'e1',p:'p1',d:2,h:8},{e:'e1',p:'p3',d:3,h:7},
    {e:'e2',p:'p2',d:0,h:8},{e:'e2',p:'p2',d:1,h:8},{e:'e2',p:'p5',d:2,h:6},{e:'e2',p:'p5',d:3,h:8},
    {e:'e3',p:'p3',d:0,h:8},{e:'e3',p:'p3',d:1,h:8},{e:'e3',p:'p3',d:2,h:8},{e:'e3',p:'p1',d:4,h:8},
    {e:'e4',p:'p1',d:0,h:8},{e:'e4',p:'p1',d:1,h:8},{e:'e4',p:'p5',d:3,h:8},{e:'e4',p:'p5',d:4,h:8},
    {e:'e5',p:'p2',d:0,h:8},{e:'e5',p:'p2',d:1,h:6},{e:'e5',p:'p3',d:2,h:8},{e:'e5',p:'p3',d:3,h:8},{e:'e5',p:'p3',d:4,h:8},
    {e:'e6',p:'p2',d:0,h:8},{e:'e6',p:'p2',d:1,h:8},{e:'e6',p:'p1',d:2,h:8},{e:'e6',p:'p7',d:4,h:7},
    {e:'e7',p:'p3',d:0,h:8},{e:'e7',p:'p3',d:1,h:8},{e:'e7',p:'p7',d:3,h:7},{e:'e7',p:'p7',d:4,h:8},
    /* next week */
    {e:'e1',p:'p1',d:7,h:8},{e:'e1',p:'p5',d:8,h:8},{e:'e3',p:'p3',d:7,h:8},{e:'e3',p:'p3',d:8,h:8},
    {e:'e5',p:'p2',d:7,h:8},{e:'e2',p:'p2',d:7,h:8},{e:'e4',p:'p1',d:7,h:8},
    /* prev week */
    {e:'e1',p:'p1',d:-5,h:8},{e:'e2',p:'p2',d:-5,h:8},{e:'e5',p:'p3',d:-4,h:8},
  ];

  var n = 1;
  seeds.forEach(function(s){
    SCHED_STATE.assignments.push({id:'sa'+(n++), engId:s.e, projectId:s.p, date:ds(mon,s.d), hours:s.h});
  });
})();

/* ── Helpers ─────────────────────────────────────────────────── */
function projColorClass(pid) {
  var ids = PROJECTS.map(function(p){return p.id;});
  var i = ids.indexOf(pid);
  return 'asgn-' + (i<0 ? 0 : i%7);
}

function schedWeekDates() {
  var today = new Date();
  var mon   = new Date(today);
  mon.setDate(today.getDate() - ((today.getDay()+6)%7) + SCHED_STATE.weekOffset*7);
  var out = [];
  for (var i=0;i<7;i++) {
    var d = new Date(mon);
    d.setDate(mon.getDate()+i);
    out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));
  }
  return out;
}

function schedTodayStr() {
  var t = new Date();
  return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
}

function schedWeekLabel(dates) {
  var mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function f(d) {
    var p=d.split('-');
    return parseInt(p[2])+' '+mn[parseInt(p[1])-1];
  }
  return f(dates[0])+'&nbsp;–&nbsp;'+f(dates[6])+' '+dates[0].split('-')[0];
}

function calcWeekCosts(dates) {
  var byProj = {}, total = 0;
  SCHED_STATE.assignments.forEach(function(a){
    if (dates.indexOf(a.date)<0) return;
    var eng = ENGINEERS.find(function(e){return e.id===a.engId;});
    if (!eng) return;
    var c = (eng.rate||0) * (a.hours||8);
    total += c;
    byProj[a.projectId] = (byProj[a.projectId]||0) + c;
  });
  return {total:total, byProj:byProj};
}

/* ── Main render ─────────────────────────────────────────────── */
function renderDiary() {
  /* ── API fetch for real users ── */
  if (ContraqAPI.isRealUser() && !STATE._scheduleApiLoaded) {
    ContraqAPI.getSchedule().then(function(events) {
      SCHED_STATE.assignments.length = 0;
      events.forEach(function(ev) {
        SCHED_STATE.assignments.push({
          id: ev.id,
          engId: ev.engineer_id || ev.engId,
          projectId: ev.project_id || ev.projectId,
          date: ev.start_date || ev.date,
          hours: ev.hours || 8
        });
      });
      STATE._scheduleApiLoaded = true;
      renderDiary();
    }).catch(function(e) { console.error('[Schedule] API error:', e); });
    return;
  }

  /* Empty state — no engineers means no schedule */
  if (ENGINEERS.length === 0) {
    document.getElementById('dash-content').innerHTML = '<div class="page-hdr"><div class="page-hdr-left"><h2>Engineer Diary</h2><p>Schedule &amp; resource planning</p></div></div>'
      + '<div class="empty-state" style="padding:3.5rem 1rem;text-align:center;">'
      + '<div style="opacity:.3;color:var(--off3)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>'
      + '<div style="font-size:1.1rem;color:var(--white);margin:.75rem 0 .5rem;">No engineers to schedule</div>'
      + '<div style="max-width:380px;margin:0 auto;line-height:1.6;font-size:.78rem;color:var(--off3);">Add your engineers and operatives first, then assign them to projects using the drag-and-drop diary. Track utilisation across week, month, and 6-month views.</div>'
      + '<button class="btn btn-primary" style="margin-top:1.25rem" onclick="dashNav(\'engineers\')">Add Engineers First</button>'
      + '</div>';
    return;
  }

  injectDiaryDemoData();
  generateDiaryAlerts();
  var v = SCHED_STATE.diaryView || 'week';
  if (v === 'month')   { renderDiaryMonth();   return; }
  if (v === '6month')  { renderDiary6Month();  return; }
  renderDiaryWeek();
}

function diaryViewBtn(label, key) {
  var active = SCHED_STATE.diaryView === key;
  return '<button class="diary-view-btn'+(active?' active':'')+'" onclick="SCHED_STATE.diaryView=\''+key+'\';renderDiary()">'+label+'</button>';
}

/* ══════════════════════════════════════════════════════════════
   WEEK VIEW (original, + site surveys + placeholders)
══════════════════════════════════════════════════════════════ */
function renderDiaryWeek() {
  var el = document.getElementById('dash-content');
  if (!el) return;

  var dates    = schedWeekDates();
  var todayStr = schedTodayStr();
  var DN       = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var MN       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var costs    = calcWeekCosts(dates);
  var ftxt     = (SCHED_STATE.filterText||'').toLowerCase();

  var visEngs = ENGINEERS.filter(function(e){
    return !ftxt || e.name.toLowerCase().indexOf(ftxt)>=0 || e.trade.toLowerCase().indexOf(ftxt)>=0;
  });

  var groups = [
    {label:'Employed',                  badge:'emp',  engs: visEngs.filter(function(e){return e.type==='employed';}),    survey:false},
    {label:'Long-term Subcontractor',   badge:'lt',   engs: visEngs.filter(function(e){return e.type==='lt-sub';}),      survey:false},
    {label:'Short-term Subcontractor',  badge:'st',   engs: visEngs.filter(function(e){return e.type==='st-sub';}),      survey:false},
    {label:'Site Surveys',              badge:'sv',   engs: SURVEYORS,                                                   survey:true},
  ].filter(function(g){return g.engs.length>0;});

  var sidePj = PROJECTS.filter(function(p){
    return (p.status==='active'||p.status==='pending') &&
      (!ftxt || p.name.toLowerCase().indexOf(ftxt)>=0 || p.code.toLowerCase().indexOf(ftxt)>=0);
  });

  var h = '';
  h += '<div style="display:flex;gap:0;height:calc(100vh - 130px);min-height:540px;overflow:hidden;">';

  /* Left sidebar */
  h += '<div class="sched-sidebar">';
  h += '<div class="sched-sb-hdr">';
  h += '<div class="sched-sb-title">Projects — drag to assign</div>';
  h += '<input class="sched-sb-search" placeholder="Filter…" value="'+SCHED_STATE.filterText+'" oninput="SCHED_STATE.filterText=this.value;renderDiary()">';
  h += '</div><div class="sched-proj-list">';
  sidePj.forEach(function(p){
    var cc = projColorClass(p.id);
    h += '<div class="sched-proj-chip '+cc+'" draggable="true" id="chip-'+p.id+'"'
      +' ondragstart="schedDragStart(event,\'chip\',\''+p.id+'\')"'
      +' ondragend="schedDragEnd(event)"'
      +' onclick="openProjectDetail(\''+p.id+'\')"'
      +' title="'+p.name+'">';
    h += '<div class="sched-proj-code">'+p.code+'</div>';
    h += '<div class="sched-proj-name">'+p.name+'</div>';
    h += '<div class="sched-proj-client">'+p.clientName+'</div>';
    h += '</div>';
  });
  if (!sidePj.length) h += '<div style="padding:1rem;font-size:.72rem;color:var(--off4);text-align:center;">No active projects</div>';
  h += '</div></div>';

  /* Main */
  h += '<div class="sched-main">';
  h += '<div class="sched-nav">';
  h += diaryViewBtn('Week','week')+diaryViewBtn('Month','month')+diaryViewBtn('6 Mo','6month');
  h += '<div style="width:.5rem;"></div>';
  h += '<button class="sched-nav-btn" onclick="schedWeekMove(-1)">&#8249;</button>';
  h += '<button class="sched-today-btn" onclick="schedWeekToday()">This week</button>';
  h += '<button class="sched-nav-btn" onclick="schedWeekMove(1)">&#8250;</button>';
  h += '<span class="sched-week-label">'+schedWeekLabel(dates)+'</span>';
  h += '<button class="btn btn-primary btn-sm" onclick="openAssignModal(null,null,null)">+ Assign</button>';
  h += '</div>';

  h += '<div class="sched-legend">';
  PROJECTS.slice(0,7).forEach(function(p,i){
    h += '<div class="sched-legend-item"><div class="sched-legend-dot asgn-'+i+'" style="border-width:1.5px;border-style:solid"></div><span>'+p.code+'</span></div>';
  });
  h += '</div>';

  h += '<div class="sched-scroll"><table class="sched-table"><thead><tr><th class="eng-hdr">Engineer</th>';
  dates.forEach(function(date,di){
    var pts = date.split('-');
    var isT = date===todayStr, isW = di>=5;
    h += '<th class="day-hdr'+(isT?' today-hdr':'')+(isW?' wknd-hdr':'')+'">'
      +DN[di]+'<br><span style="font-size:.62rem;font-weight:400;color:'+(isT?'var(--orange)':'var(--off4)')+'">'+parseInt(pts[2])+' '+MN[parseInt(pts[1])-1]+'</span></th>';
  });
  h += '</tr></thead><tbody>';

  groups.forEach(function(grp){
    var isSurvey = grp.survey;
    h += '<tr class="sched-group-row'+(isSurvey?' survey-group-row':'')+'"><td colspan="8">'
      +'<div class="sched-group-label'+(isSurvey?' survey-group-label':'')+'">'+grp.label
      +(isSurvey?' <span style="font-family:var(--mono);font-size:.55rem;color:#2dd4bf;margin-left:.4rem;">' + ICON.search + ' Survey Teams</span>':'')
      +'<span class="sched-group-badge">'+grp.engs.length+'</span></div>'
      +'</td></tr>';

    grp.engs.forEach(function(eng){
      h += '<tr><td class="eng-cell'+(isSurvey?' survey-eng-cell':'')+(eng.active?'':' eng-cell-inactive')+'"'
        +' onclick="'+(isSurvey?'':' dashNav(\'engineers\');setTimeout(function(){openEngineerModal(\''+eng.id+'\')},120)')
        +'">';
      h += '<div class="eng-cell-name" style="'+(isSurvey?'color:#2dd4bf;':'')+'">' +eng.name+'</div>';
      h += '<div class="eng-cell-trade">'+eng.trade+'</div>';
      h += '<div class="eng-cell-rate">£'+eng.rate+'/day</div>';
      h += '</td>';

      dates.forEach(function(date,di){
        var isT = date===todayStr, isW = di>=5;
        h += '<td class="day-cell'+(isT?' today-cell':'')+(isW?' wknd-cell':'')+'"'
          +' style="position:relative;"'
          +' data-eng="'+eng.id+'" data-date="'+date+'"'
          +' ondragover="schedDragOver(event)"'
          +' ondragleave="schedDragLeave(event)"'
          +' ondrop="schedDrop(event,\''+eng.id+'\',\''+date+'\')"'
          +' ondblclick="openAssignModal(null,\''+eng.id+'\',\''+date+'\')"'
          +' title="Double-click to assign">';

        /* Placeholders for this date (unassigned) */
        SCHED_STATE.placeholders.filter(function(ph){return ph.date===date;}).forEach(function(ph){
          var pj = PROJECTS.find(function(p){return p.id===ph.projectId;});
          var label = pj ? pj.code : '?';
          var fullName = pj ? pj.name.split('—')[0].trim() : (ph.note||'Unassigned');
          var clientTxt = ph.clientName ? ' · '+ph.clientName : '';
          h += '<div class="placeholder-block" id="ph-block-'+ph.id+'"'
            +' onclick="event.stopPropagation();openPhModal(\''+ph.date+'\',\''+ph.id+'\')"'
            +' title="'+fullName+clientTxt+' — click to edit / remove">'
            +'<span>' + ICON.pin + '</span>'
            +'<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;">'
            +  '<strong style="color:var(--orange);">'+label+'</strong>'
            +  '<span style="color:var(--off3);font-size:.58rem;margin-left:.25rem;">Unassigned</span>'
            +'</span>'
            +'<button style="background:none;border:none;color:var(--off4);font-size:.75rem;cursor:pointer;padding:0 .1rem;line-height:1;" '
            +  'onclick="event.stopPropagation();deletePlaceholder(\''+ph.id+'\')" title="Remove">&#215;</button>'
            +'</div>';
        });

        SCHED_STATE.assignments.filter(function(a){return a.engId===eng.id && a.date===date;})
          .forEach(function(a){
            var pj = PROJECTS.find(function(p){return p.id===a.projectId;});
            if (!pj) return;
            var cc = isSurvey ? '' : projColorClass(a.projectId);
            var surveyStyle = isSurvey ? 'background:rgba(45,212,191,.18);border-color:#2dd4bf;' : '';
            h += '<div class="assignment '+cc+'" draggable="true" id="assign-'+a.id+'"'
              +' style="'+surveyStyle+'"'
              +' ondragstart="schedDragStart(event,\'assign\',\''+a.projectId+'\',\''+a.id+'\')"'
              +' ondragend="schedDragEnd(event)"'
              +' onclick="event.stopPropagation();openAssignModal(\''+a.id+'\',\''+eng.id+'\',\''+date+'\')">';
            h += '<div class="assign-body">';
            h += '<div class="assign-code" style="'+(isSurvey?'color:#2dd4bf;':'')+'">' +pj.code+'</div>';
            h += '<div class="assign-name">'+pj.name.split('—')[0].trim()+'</div>';
            h += '<div class="assign-hours">'+a.hours+'h</div>';
            h += '</div>';
            h += '<button class="assign-del" onclick="event.stopPropagation();deleteAssignment(\''+a.id+'\')" title="Remove">&#215;</button>';
            h += '</div>';
          });

        /* + placeholder button */
        h += '<button class="cell-add-ph" onclick="event.stopPropagation();openPhModal(\''+date+'\')" title="Add placeholder">+</button>';
        h += '</td>';
      });
      h += '</tr>';
    });
  });

  h += '</tbody></table></div></div>';

  /* Cost panel */
  h += '<div class="sched-cost-panel">';
  h += '<div class="sched-cost-hdr">';
  h += '<div class="sched-cost-title">Week Cost</div>';
  h += '<div class="cost-week-total">&pound;'+Math.round(costs.total).toLocaleString()+'</div>';
  h += '<div class="cost-week-sub">Labour cost this week</div>';
  h += '</div>';
  h += '<div class="sched-cost-rows" id="sched-cost-rows">'+buildCostRows(costs)+'</div>';
  var engCount=(function(){var s=new Set();SCHED_STATE.assignments.forEach(function(a){if(dates.indexOf(a.date)>=0)s.add(a.engId);});return s.size;})();
  var dayCount=SCHED_STATE.assignments.filter(function(a){return dates.indexOf(a.date)>=0;}).length;
  var phCount =SCHED_STATE.placeholders.filter(function(ph){return dates.indexOf(ph.date)>=0;}).length;
  h += '<div class="sched-cost-footer">';
  h += '<div class="cost-footer-row"><span>Engineers on</span><span class="cost-footer-val">'+engCount+'</span></div>';
  h += '<div class="cost-footer-row"><span>Days booked</span><span class="cost-footer-val">'+dayCount+'</span></div>';
  h += '<div class="cost-footer-row"><span>Unassigned PH</span><span class="cost-footer-val" style="color:var(--orange)">'+phCount+'</span></div>';
  h += '<div class="cost-footer-row cost-footer-hl"><span>Week total</span><span class="cost-footer-val cost-footer-total">&pound;'+Math.round(costs.total).toLocaleString()+'</span></div>';
  h += '</div>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
}

/* ══════════════════════════════════════════════════════════════
   MONTH VIEW
══════════════════════════════════════════════════════════════ */
function renderDiaryMonth() {
  var el = document.getElementById('dash-content');
  if (!el) return;
  var today   = new Date();
  var base    = new Date(today.getFullYear(), today.getMonth() + (SCHED_STATE.monthOffset||0), 1);
  var year    = base.getFullYear();
  var month   = base.getMonth(); // 0-based
  var MN      = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DN      = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var todayStr= schedTodayStr();

  /* Build day grid */
  var firstDay = new Date(year, month, 1);
  var lastDay  = new Date(year, month+1, 0);
  // start from Monday of the week containing day 1
  var startOff = (firstDay.getDay()+6)%7;
  var cells = [];
  for (var i = -startOff; i < lastDay.getDate(); i++) {
    var d = new Date(year, month, i+1);
    cells.push({date: d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()), inMonth: i>=0});
  }
  // pad to complete rows
  while (cells.length % 7 !== 0) {
    var d = new Date(year, month, lastDay.getDate() + (cells.length - lastDay.getDate() + 1 - startOff));
    cells.push({date: d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()), inMonth: false});
  }

  var h = '';
  h += '<div style="display:flex;flex-direction:column;height:calc(100vh - 130px);overflow:hidden;">';

  /* Nav */
  h += '<div class="sched-nav" style="flex-shrink:0;">';
  h += diaryViewBtn('Week','week')+diaryViewBtn('Month','month')+diaryViewBtn('6 Mo','6month');
  h += '<div style="width:.5rem"></div>';
  h += '<button class="sched-nav-btn" onclick="SCHED_STATE.monthOffset=(SCHED_STATE.monthOffset||0)-1;renderDiary()">&#8249;</button>';
  h += '<button class="sched-today-btn" onclick="SCHED_STATE.monthOffset=0;renderDiary()">This month</button>';
  h += '<button class="sched-nav-btn" onclick="SCHED_STATE.monthOffset=(SCHED_STATE.monthOffset||0)+1;renderDiary()">&#8250;</button>';
  h += '<span class="sched-week-label">'+MN[month]+' '+year+'</span>';
  h += '<button class="btn btn-primary btn-sm" onclick="openPhModal(null)">+ Book project</button>';
  h += '</div>';

  /* Day headers */
  h += '<div class="month-grid" style="flex-shrink:0;grid-template-rows:auto;">';
  DN.forEach(function(d){ h += '<div class="month-day-hdr">'+d+'</div>'; });

  /* Day cells */
  cells.forEach(function(cell){
    var isToday = cell.date === todayStr;
    var asgns   = SCHED_STATE.assignments.filter(function(a){return a.date===cell.date;});
    var phs     = SCHED_STATE.placeholders.filter(function(ph){return ph.date===cell.date;});
    var survAsgns = asgns.filter(function(a){ return SURVEYORS.some(function(s){return s.id===a.engId;}); });
    var engAsgns  = asgns.filter(function(a){ return !SURVEYORS.some(function(s){return s.id===a.engId;}); });

    h += '<div class="month-cell'+(isToday?' today':'')+(cell.inMonth?'':' other-month')+'"'
      +' onclick="openPhModal(\''+cell.date+'\')">';
    h += '<div class="month-day-num">'+parseInt(cell.date.split('-')[2])+'</div>';

    /* Engineer assignments as mini blocks */
    engAsgns.slice(0,2).forEach(function(a){
      var pj = PROJECTS.find(function(p){return p.id===a.projectId;});
      if (!pj) return;
      var bg = ['#f97316','#60a5fa','#a3e635','#f87171','#fbbf24','#a78bfa','#34d399'];
      var idx = PROJECTS.findIndex(function(p){return p.id===a.projectId;})%7;
      var shortName = pj.name.split('—')[0].trim();
      h += '<div class="month-mini-block" style="background:'+bg[idx]+'22;color:'+bg[idx]+';border:1px solid '+bg[idx]+'44;">'
        +'<span style="font-weight:700;margin-right:.25rem;">'+pj.code+'</span>'
        +'<span style="overflow:hidden;text-overflow:ellipsis;">'+shortName+'</span>'
        +'</div>';
    });
    if (engAsgns.length > 2) h += '<div style="font-size:.5rem;color:var(--off4);padding:.1rem .2rem;">+' +(engAsgns.length-2)+' more</div>';

    /* Survey assignments */
    survAsgns.slice(0,1).forEach(function(a){
      var pj = PROJECTS.find(function(p){return p.id===a.projectId;});
      if (!pj) return;
      var shortName = pj.name.split('—')[0].trim();
      h += '<div class="month-mini-block" style="background:rgba(45,212,191,.12);color:#2dd4bf;border:1px solid rgba(45,212,191,.3);">'
        +'<span style="margin-right:.2rem;">' + ICON.search + '</span>'
        +'<span style="font-weight:700;margin-right:.25rem;">'+pj.code+'</span>'
        +'<span style="overflow:hidden;text-overflow:ellipsis;">'+shortName+'</span>'
        +'</div>';
    });

    /* Placeholders */
    phs.slice(0,1).forEach(function(ph){
      var pj = PROJECTS.find(function(p){return p.id===ph.projectId;});
      h += '<div class="month-mini-block" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px dashed rgba(249,115,22,.35);cursor:pointer;"'
        +' onclick="event.stopPropagation();openPhModal(\''+ph.date+'\',\''+ph.id+'\')" title="Edit booking">' + ICON.pin + ' '+(pj?pj.code:'TBC')
        +' <span style=\"font-size:.5rem;opacity:.7\">Unassigned</span></div>';
    });
    if (phs.length > 1) {
      h += '<div style="font-size:.5rem;color:var(--orange);padding:.1rem .2rem;opacity:.7;">+' +(phs.length-1)+' more PH</div>';
    }

    h += '<button class="month-add-btn" onclick="event.stopPropagation();openPhModal(\''+cell.date+'\')" title="Book project">+</button>';
    h += '</div>';
  });
  h += '</div>'; /* /month-grid */

  /* Summary bar */
  var totalAsgns = SCHED_STATE.assignments.filter(function(a){return a.date.startsWith(year+'-'+pad2(month+1));}).length;
  var totalPhs   = SCHED_STATE.placeholders.filter(function(ph){return ph.date.startsWith(year+'-'+pad2(month+1));}).length;
  h += '<div style="flex-shrink:0;padding:.5rem 1rem;display:flex;gap:1.5rem;border-top:1px solid var(--border);font-family:var(--mono);font-size:.62rem;color:var(--off3);">';
  h += '<span>Assignments: <strong style="color:var(--white)">'+totalAsgns+'</strong></span>';
  h += '<span>Unassigned bookings: <strong style="color:var(--orange)">'+totalPhs+'</strong></span>';
  h += '<span style="margin-left:auto;color:var(--off4)">Click any day to add a project booking</span>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}

/* ══════════════════════════════════════════════════════════════
   6-MONTH VIEW
══════════════════════════════════════════════════════════════ */
function renderDiary6Month() {
  var el = document.getElementById('dash-content');
  if (!el) return;
  var today    = new Date();
  var baseOff  = SCHED_STATE.sixMoOffset || 0;
  var startMo  = new Date(today.getFullYear(), today.getMonth() + baseOff*6, 1);
  var todayStr = schedTodayStr();
  var MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DN = ['M','T','W','T','F','S','S'];

  /* Build 6 months */
  var months = [];
  for (var mi=0; mi<6; mi++) {
    var mo = new Date(startMo.getFullYear(), startMo.getMonth()+mi, 1);
    months.push({year:mo.getFullYear(), month:mo.getMonth()});
  }

  var h = '';
  h += '<div style="display:flex;flex-direction:column;height:calc(100vh - 130px);overflow-y:auto;">';
  h += '<div class="sched-nav" style="flex-shrink:0;">';
  h += diaryViewBtn('Week','week')+diaryViewBtn('Month','month')+diaryViewBtn('6 Mo','6month');
  h += '<div style="width:.5rem"></div>';
  h += '<button class="sched-nav-btn" onclick="SCHED_STATE.sixMoOffset=(SCHED_STATE.sixMoOffset||0)-1;renderDiary()">&#8249;</button>';
  h += '<button class="sched-today-btn" onclick="SCHED_STATE.sixMoOffset=0;renderDiary()">Current</button>';
  h += '<button class="sched-nav-btn" onclick="SCHED_STATE.sixMoOffset=(SCHED_STATE.sixMoOffset||0)+1;renderDiary()">&#8250;</button>';
  h += '<span class="sched-week-label">'+MN[months[0].month]+' '+months[0].year+' — '+MN[months[5].month]+' '+months[5].year+'</span>';
  h += '<button class="btn btn-primary btn-sm" onclick="openPhModal(null)">+ Book project</button>';
  h += '</div>';

  h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;padding:.75rem;">';

  months.forEach(function(mo){
    var firstDay = new Date(mo.year, mo.month, 1);
    var lastDay  = new Date(mo.year, mo.month+1, 0);
    var startOff = (firstDay.getDay()+6)%7;
    var cells = [];
    for (var i = -startOff; i < lastDay.getDate(); i++) {
      var d = new Date(mo.year, mo.month, i+1);
      var ds = d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
      var hasEng    = SCHED_STATE.assignments.some(function(a){return a.date===ds;});
      var hasSurv   = SCHED_STATE.assignments.some(function(a){return a.date===ds && SURVEYORS.some(function(s){return s.id===a.engId;});});
      var hasPh     = SCHED_STATE.placeholders.some(function(ph){return ph.date===ds;});
      cells.push({ds:ds, inMonth:i>=0, isToday:ds===todayStr, hasEng:hasEng, hasSurv:hasSurv, hasPh:hasPh});
    }
    while (cells.length % 7 !== 0) {
      var d = new Date(mo.year, mo.month+1, cells.length - lastDay.getDate() - startOff + 1);
      cells.push({ds:'',inMonth:false,isToday:false,hasEng:false,hasSurv:false,hasPh:false});
    }

    var moAsgns = SCHED_STATE.assignments.filter(function(a){return a.date.startsWith(mo.year+'-'+pad2(mo.month+1));}).length;
    var moPhs   = SCHED_STATE.placeholders.filter(function(ph){return ph.date.startsWith(mo.year+'-'+pad2(mo.month+1));}).length;

    h += '<div style="background:var(--bg2);border-radius:8px;padding:.65rem;">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;">';
    h += '<div class="sixmo-month-title">'+MN[mo.month]+' '+mo.year+'</div>';
    h += '<div style="font-family:var(--mono);font-size:.52rem;color:var(--off3);">'+(moAsgns?'<span style="color:var(--lime)">'+moAsgns+' booked</span>':'—')+(moPhs?' · <span style="color:var(--orange)">'+moPhs+' PH</span>':'')+'</div>';
    h += '</div>';
    /* Day-of-week headers */
    h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:3px;">';
    DN.forEach(function(d){ h += '<div style="font-family:var(--mono);font-size:.45rem;text-align:center;color:var(--off4);">'+d+'</div>'; });
    h += '</div>';
    /* Day dots */
    h += '<div class="sixmo-week-row" style="grid-template-columns:repeat(7,1fr);">';
    cells.forEach(function(c,ci){
      if (ci > 0 && ci % 7 === 0) h += '</div><div class="sixmo-week-row" style="grid-template-columns:repeat(7,1fr);">';
      var cls = 'sixmo-day-dot';
      if (!c.inMonth) cls += '" style="opacity:.15';
      else if (c.hasPh)  cls += ' placeholder-dot';
      else if (c.hasSurv)cls += ' has-survey';
      else if (c.hasEng) cls += ' has-asgn';
      if (c.isToday) cls += ' today-dot';
      var clickable = c.inMonth && c.ds ? ' onclick="openPhModal(\''+c.ds+'\')" title="'+c.ds+'"' : '';
      var dayNum = c.ds ? parseInt(c.ds.split('-')[2]) : '';
      var numColor = (c.hasEng || c.hasSurv || c.hasPh) ? '#fff' : 'rgba(255,255,255,.55)';
      if (!c.inMonth) numColor = 'rgba(255,255,255,.2)';
      h += '<div class="'+cls+'" style="position:relative;display:flex;align-items:center;justify-content:center;"'+clickable+'>'
        +'<span style="font-size:.58rem;font-weight:700;color:'+numColor+';line-height:1;pointer-events:none;user-select:none;">'+dayNum+'</span>'
        +'</div>';
    });
    h += '</div></div>';
  });

  h += '</div>';

  /* Legend */
  h += '<div style="padding:.5rem 1rem;border-top:1px solid var(--border);display:flex;gap:1.2rem;flex-shrink:0;font-family:var(--mono);font-size:.6rem;color:var(--off3);">';
  h += '<span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--lime);opacity:.75;margin-right:.3rem;vertical-align:middle;"></span>Engineers assigned</span>';
  h += '<span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:#2dd4bf;opacity:.75;margin-right:.3rem;vertical-align:middle;"></span>Survey team</span>';
  h += '<span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--orange);opacity:.5;margin-right:.3rem;vertical-align:middle;"></span>Placeholder booking</span>';
  h += '<span style="margin-left:auto;color:var(--off4);">Click any day to add a booking</span>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
}

function pad2(n){ return n < 10 ? '0'+n : ''+n; }

/* Placeholder modal helpers */
function openPhModal(date, editPhId) {
  var dateVal = date || '';
  document.getElementById('ph-date').value = dateVal;
  document.getElementById('ph-date-display').textContent = dateVal ? fmtDate(dateVal) : '(select from calendar)';
  document.getElementById('ph-modal-title').textContent = editPhId ? 'Edit Booking' : 'Book Project (Unassigned)';
  document.getElementById('ph-save-btn').textContent = editPhId ? 'Save changes' : 'Add to diary';
  document.getElementById('ph-delete-btn').style.display = editPhId ? 'inline-flex' : 'none';
  document.getElementById('ph-delete-btn').dataset.phid = editPhId || '';

  /* Populate project select */
  var projSel = document.getElementById('ph-project');
  projSel.innerHTML = '<option value="">— Select project —</option>'
    + PROJECTS.map(function(p){
        return '<option value="'+p.id+'">'+p.code+' — '+p.name.split('—')[0].trim()+'</option>';
      }).join('');

  /* Populate client select */
  var clSel = document.getElementById('ph-client');
  clSel.innerHTML = '<option value="">— Select client —</option>'
    + CLIENTS.map(function(c){ return '<option value="'+c.id+'">'+c.name+'</option>'; }).join('');

  /* If editing, pre-fill */
  if (editPhId) {
    var ph = SCHED_STATE.placeholders.find(function(x){ return x.id===editPhId; });
    if (ph) {
      projSel.value = ph.projectId || '';
      clSel.value   = ph.clientId  || '';
      document.getElementById('ph-note').value = ph.note || '';
      if (ph.date) {
        document.getElementById('ph-date').value = ph.date;
        document.getElementById('ph-date-display').textContent = fmtDate(ph.date);
      }
    }
  } else {
    projSel.value = '';
    clSel.value   = '';
    document.getElementById('ph-note').value = '';
  }

  document.getElementById('ph-modal-title').dataset.editid = editPhId || '';
  openModal('modal-ph-book');
}

function phProjectChanged() {
  var projId = document.getElementById('ph-project').value;
  if (!projId) return;
  var pj = PROJECTS.find(function(p){ return p.id===projId; });
  if (pj && pj.client) {
    document.getElementById('ph-client').value = pj.client;
  }
}

function phDeleteCurrent() {
  var id = document.getElementById('ph-delete-btn').dataset.phid;
  if (id) { deletePlaceholder(id); closeModal('modal-ph-book'); }
}

function savePlaceholder() {
  var date    = document.getElementById('ph-date').value;
  var projId  = document.getElementById('ph-project').value;
  var clientId= document.getElementById('ph-client').value;
  var note    = document.getElementById('ph-note').value;
  if (!date)   { showToast('Date is required.','error'); return; }
  if (!projId) { showToast('Please select a project.','error'); return; }

  var editId = document.getElementById('ph-modal-title').dataset.editid;
  var pj     = PROJECTS.find(function(p){return p.id===projId;});
  var cl     = CLIENTS.find(function(c){return c.id===clientId;});

  if (editId) {
    /* Edit existing */
    var existing = SCHED_STATE.placeholders.find(function(x){return x.id===editId;});
    if (existing) {
      existing.projectId  = projId;
      existing.clientId   = clientId;
      existing.clientName = cl ? cl.name : '';
      existing.note       = note;
    }
    closeModal('modal-ph-book');
    showToast('Booking updated — ' + (pj ? pj.name.split('—')[0].trim() : '') + ' on ' + fmtDate(date), 'success');
  } else {
    /* New booking */
    var ph = {
      id         : 'ph-'+(Date.now()),
      date       : date,
      projectId  : projId,
      clientId   : clientId,
      clientName : cl ? cl.name : '',
      note       : note,
      unassigned : true
    };
    SCHED_STATE.placeholders.push(ph);
    closeModal('modal-ph-book');
    showToast('Unassigned booking added: ' + (pj ? pj.name.split('—')[0].trim() : '') + ' on ' + fmtDate(date) + ' — you\'ll be reminded 2 days before.', 'success');
  }
  renderDiary();
}

function deletePlaceholder(phId) {
  if (!SCHED_STATE || !SCHED_STATE.placeholders) return;
  SCHED_STATE.placeholders = SCHED_STATE.placeholders.filter(function(ph){return ph.id!==phId;});
  renderDiary();
}

function buildCostRows(costs) {
  var BAR = ['var(--orange)','var(--blue)','var(--lime)','var(--yellow)','#a78bfa','var(--red)','#34d399'];
  var keys = Object.keys(costs.byProj).sort(function(a,b){return costs.byProj[b]-costs.byProj[a];});
  if (!keys.length) return '<div style="padding:1rem;text-align:center;font-size:.72rem;color:var(--off4);">No assignments this week</div>';
  var maxC = Math.max.apply(null, keys.map(function(k){return costs.byProj[k];}));
  var out = '';
  keys.forEach(function(pid){
    var pj = PROJECTS.find(function(p){return p.id===pid;});
    if (!pj) return;
    var cost = costs.byProj[pid];
    var pct  = Math.round((cost/maxC)*100);
    var ids  = PROJECTS.map(function(p){return p.id;});
    var ci   = Math.max(0,ids.indexOf(pid)) % 7;
    out += '<div class="cost-proj-row" onclick="openProjectDetail(\''+pid+'\')" style="cursor:pointer;">';
    out += '<div class="cost-proj-code">'+pj.code+'</div>';
    out += '<div class="cost-proj-name">'+pj.name+'</div>';
    out += '<div class="cost-proj-bar-track"><div class="cost-proj-bar-fill" style="width:'+pct+'%;background:'+BAR[ci]+';"></div></div>';
    out += '<div class="cost-proj-meta"><span>Labour</span><span class="cost-proj-val">&pound;'+Math.round(cost).toLocaleString()+'</span></div>';
    out += '</div>';
  });
  return out;
}

/* ── Week nav ────────────────────────────────────────────────── */
function schedWeekMove(delta) { SCHED_STATE.weekOffset += delta; renderDiary(); }
function schedWeekToday()     { SCHED_STATE.weekOffset  = 0;     renderDiary(); }

/* ── Drag & Drop ─────────────────────────────────────────────── */
function schedDragStart(event, type, projectId, assignId) {
  SCHED_STATE.dragData = {type:type, projectId:projectId, assignId:assignId||null};
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', projectId);

  /* Ghost */
  var pj = PROJECTS.find(function(p){return p.id===projectId;});
  var g  = document.createElement('div');
  g.className = 'drag-ghost';
  g.id = 'sched-ghost';
  g.textContent = pj ? pj.code : projectId;
  document.body.appendChild(g);
  try { event.dataTransfer.setDragImage(g,50,16); } catch(e){}

  var src = type==='chip'
    ? document.getElementById('chip-'+projectId)
    : document.getElementById('assign-'+assignId);
  if (src) src.classList.add(type==='chip'?'chip-dragging':'assign-dragging');
}

function schedDragEnd(event) {
  var g = document.getElementById('sched-ghost');
  if (g) g.remove();
  document.querySelectorAll('.chip-dragging,.assign-dragging').forEach(function(el){
    el.classList.remove('chip-dragging','assign-dragging');
  });
  document.querySelectorAll('.drag-over').forEach(function(el){
    el.classList.remove('drag-over');
  });
  SCHED_STATE.dragData = null;
}

function schedDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('drag-over');
}

function schedDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function schedDrop(event, engId, date) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  var drag = SCHED_STATE.dragData;
  if (!drag) return;

  if (drag.type==='chip') {
    /* Pre-fill the assign modal with project + cell */
    openAssignModal(null, engId, date, drag.projectId);
  } else {
    /* Move existing */
    var a = SCHED_STATE.assignments.find(function(x){return x.id===drag.assignId;});
    if (a) { a.engId=engId; a.date=date; showToast('Assignment moved.','success'); renderDiary(); }
  }
}

/* ── Assign modal ────────────────────────────────────────────── */
function openAssignModal(assignId, prefillEng, prefillDate, prefillProj) {
  var isEdit = !!assignId;
  var a      = isEdit ? SCHED_STATE.assignments.find(function(x){return x.id===assignId;}) : null;

  var projOpts = PROJECTS.map(function(p){
    var sel = (a && a.projectId===p.id) || (!a && p.id===prefillProj);
    return '<option value="'+p.id+'"'+(sel?' selected':'')+'>'+p.code+' \u2014 '+p.name+'</option>';
  }).join('');

  var engOpts = ENGINEERS.map(function(e){
    var sel = (a && a.engId===e.id) || (!a && e.id===prefillEng);
    return '<option value="'+e.id+'"'+(sel?' selected':'')+'>'+e.name+' (\u00a3'+e.rate+'/day)</option>';
  }).join('');

  var dateVal  = (a&&a.date)||prefillDate||schedTodayStr();
  var hoursVal = (a&&a.hours)||8;

  var bd = document.getElementById('am-title');
  if (bd) bd.textContent = isEdit ? 'Edit Assignment' : 'Add Assignment';
  var ddel = document.getElementById('am-del-btn');
  if (ddel) ddel.style.display = isEdit ? '' : 'none';
  if (ddel) ddel.setAttribute('data-id', assignId||'');

  var psel = document.getElementById('am-proj');
  var esel = document.getElementById('am-eng');
  var dsel = document.getElementById('am-date');
  var hsel = document.getElementById('am-hours');
  if (psel) psel.innerHTML = projOpts;
  if (esel) esel.innerHTML = engOpts;
  if (dsel) dsel.value = dateVal;
  if (hsel) hsel.value = hoursVal;

  var saveBtn = document.getElementById('am-save-btn');
  if (saveBtn) saveBtn.setAttribute('data-id', assignId||'');

  openModal('modal-assign');
}

function saveAssignModal() {
  var btn   = document.getElementById('am-save-btn');
  var exId  = btn ? btn.getAttribute('data-id') : '';
  var pid   = document.getElementById('am-proj').value;
  var eid   = document.getElementById('am-eng').value;
  var date  = document.getElementById('am-date').value;
  var hours = parseInt(document.getElementById('am-hours').value)||8;
  if (!pid||!eid||!date) { showToast('Please fill all fields.','error'); return; }

  if (exId) {
    var existing = SCHED_STATE.assignments.find(function(a){return a.id===exId;});
    if (existing) { existing.projectId=pid; existing.engId=eid; existing.date=date; existing.hours=hours; }
    showToast('Assignment updated.','success');
  } else {
    var nextN = 1;
    SCHED_STATE.assignments.forEach(function(a){
      var n=parseInt(a.id.replace('sa',''))||0; if(n>=nextN) nextN=n+1;
    });
    SCHED_STATE.assignments.push({id:'sa'+nextN, engId:eid, projectId:pid, date:date, hours:hours});
    showToast('Assignment added.','success');
  }

  /* ── Persist to API for real users ── */
  if (ContraqAPI.isRealUser()) {
    fetch(CONTRAQ_API_BASE + '/api/data/schedule', {
      method: 'POST',
      headers: typeof getAuthHeader === 'function' ? getAuthHeader() : { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engineer_id: eid,
        project_id: pid,
        start_date: date,
        hours: hours
      })
    }).catch(function(e) { console.error('[Schedule] Save error:', e); });
  }

  closeModal('modal-assign');
  renderDiary();
}

function deleteAssignment(assignId, fromModal) {
  var idx = SCHED_STATE.assignments.findIndex(function(a){return a.id===assignId;});
  if (idx<0) return;
  SCHED_STATE.assignments.splice(idx,1);
  showToast('Removed.','success');
  if (fromModal) closeModal('modal-assign');
  renderDiary();
}

function deleteAssignFromModal() {
  var btn = document.getElementById('am-del-btn');
  var id  = btn ? btn.getAttribute('data-id') : '';
  if (id) deleteAssignment(id, true);
}

/* ── Legacy calendar shims (for any remaining CALENDAR_EVENTS usage) ── */
function calMove(delta)        { schedWeekMove(delta); }
function calToday()            { schedWeekToday(); }
function calSelectDay(dateStr) { openAssignModal(null, null, dateStr); }

/* ── openEventModal shim (called from activity feed / toast links) ── */
function openEventModal(id, prefillDate) {
  if (id) {
    /* Show existing CALENDAR_EVENT as read-only toast */
    var ev = CALENDAR_EVENTS.find(function(e){return e.id===id;});
    if (ev) showToast(ev.title + (ev.time ? ' at '+ev.time : ''), 'success');
  } else {
    openAssignModal(null, null, prefillDate||schedTodayStr());
  }
}
function saveEvent()   { saveAssignModal(); }
function deleteEvent() {
  if (STATE.editEventId) {
    var idx = CALENDAR_EVENTS.findIndex(function(e){return e.id===STATE.editEventId;});
    if (idx>=0) CALENDAR_EVENTS.splice(idx,1);
    showToast('Event deleted.','success');
    closeModal('modal-event');
  }
}

/* ══════════════════════════════════════════════════════════════
   CERT HELPERS
══════════════════════════════════════════════════════════════ */
function certStatus(expiry) {
  var now = new Date(); var d = new Date(expiry);
  var diff = Math.round((d - now) / (1000*60*60*24));
  if (diff < 0)   return {cls:'cert-expired', label:'Expired',   dotColor:'var(--red)',    days: diff};
  if (diff < 90)  return {cls:'cert-expired', label:'< 90 days', dotColor:'var(--red)',    days: diff};
  if (diff < 180) return {cls:'cert-warn',    label:'< 6 months',dotColor:'var(--yellow)', days: diff};
  return              {cls:'cert-ok',     label:'Valid',      dotColor:'var(--lime)',   days: diff};
}

function worstCertStatus(certs) {
  if (!certs || !certs.length) return null;
  var worst = null;
  certs.forEach(function(c){
    var s = certStatus(c.expiry);
    if (!worst) { worst = s; return; }
    if (s.days < worst.days) worst = s;
  });
  return worst;
}

function addCertRow(name, body, expiry) {
  var container = document.getElementById('cert-rows-container');
  var noMsg = document.getElementById('cert-no-certs');
  if (noMsg) noMsg.style.display = 'none';
  var rowId = 'cr-' + Date.now() + '-' + Math.random().toString(36).slice(2,6);
  var expVal = expiry || '';
  var dotColor = expVal ? certStatus(expVal).dotColor : '#525860';
  var rowCls = expVal ? (certStatus(expVal).cls === 'cert-expired' ? 'cert-row-expired' : certStatus(expVal).cls === 'cert-warn' ? 'cert-row-warn' : '') : '';
  var row = document.createElement('div');
  row.className = 'cert-row ' + rowCls;
  row.id = rowId;
  row.innerHTML =
    '<input type="text" placeholder="CSCS Skilled Worker Card" value="'+(name||'')+'" oninput="updateCertRowStyle(\''+rowId+'\')" style="font-size:.75rem"/>'
   +'<input type="text" placeholder="CITB" value="'+(body||'')+'"/>'
   +'<input type="date" value="'+(expVal||'')+'" onchange="updateCertRowStyle(\''+rowId+'\')" style="font-size:.72rem"/>'
   +'<button class="cert-remove-btn" onclick="removeCertRow(\''+rowId+'\')" title="Remove">✕</button>';
  container.appendChild(row);
}

function removeCertRow(rowId) {
  var row = document.getElementById(rowId);
  if (row) row.remove();
  var container = document.getElementById('cert-rows-container');
  var noMsg = document.getElementById('cert-no-certs');
  if (noMsg && container && container.children.length === 0) noMsg.style.display = '';
}

function updateCertRowStyle(rowId) {
  var row = document.getElementById(rowId);
  if (!row) return;
  var dateInput = row.querySelector('input[type=date]');
  if (!dateInput || !dateInput.value) { row.className = 'cert-row'; return; }
  var s = certStatus(dateInput.value);
  row.className = 'cert-row ' + (s.cls === 'cert-expired' ? 'cert-row-expired' : s.cls === 'cert-warn' ? 'cert-row-warn' : '');
}

function harvestCertRows() {
  var container = document.getElementById('cert-rows-container');
  if (!container) return [];
  var rows = container.querySelectorAll('.cert-row');
  var certs = [];
  rows.forEach(function(row){
    var inputs = row.querySelectorAll('input');
    var name = inputs[0] ? inputs[0].value.trim() : '';
    var body = inputs[1] ? inputs[1].value.trim() : '';
    var expiry = inputs[2] ? inputs[2].value : '';
    if (name) certs.push({name:name, body:body, expiry:expiry});
  });
  return certs;
}

function checkRenewalAlert(engId) {
  var eng = ENGINEERS.find(function(e){return e.id===engId;});
  if (!eng || !eng.certs || !eng.certs.length) return;
  var alertCerts = eng.certs.filter(function(c){
    var diff = Math.round((new Date(c.expiry) - new Date()) / (1000*60*60*24));
    return diff < 90;
  });
  if (!alertCerts.length) return;
  STATE.renewalEngId = engId;
  document.getElementById('renewal-eng-name').textContent = eng.name + ' — Cert Alert';
  var expCount = alertCerts.filter(function(c){return new Date(c.expiry) < new Date();}).length;
  var warnCount = alertCerts.length - expCount;
  var parts = [];
  if (expCount) parts.push(expCount + ' expired');
  if (warnCount) parts.push(warnCount + ' expiring within 90 days');
  document.getElementById('renewal-sub-text').textContent = parts.join(' · ');
  var list = document.getElementById('renewal-cert-list');
  list.innerHTML = alertCerts.map(function(c){
    var s = certStatus(c.expiry);
    var diff = s.days;
    var label = diff < 0 ? 'Expired ' + Math.abs(diff) + ' days ago' : 'Expires in ' + diff + ' days';
    return '<div class="renewal-cert-item">'
      + '<div><div class="renewal-cert-name">'+c.name+'</div><div class="renewal-cert-meta">'+c.body+' · '+fmtDate(c.expiry)+'</div></div>'
      + '<span class="cert-badge '+s.cls+'">'+label+'</span>'
      + '</div>';
  }).join('');
  openModal('modal-renewal');
}

/* ══════════════════════════════════════════════════════════════
   ENGINEERS
══════════════════════════════════════════════════════════════ */
function renderEngineers() {
  /* ── API fetch for real users ── */
  if (ContraqAPI.isRealUser() && !STATE._engineersApiLoaded) {
    ContraqAPI.getEngineers().then(function(engineers) {
      ENGINEERS.length = 0;
      engineers.forEach(function(e) {
        ENGINEERS.push({
          id: e.id,
          name: e.name,
          email: e.email,
          phone: e.phone,
          trade: e.trade,
          type: e.role || e.type || 'employed',
          rate: e.day_rate || e.rate || 0,
          active: e.status !== 'inactive',
          notes: e.notes,
          cisStatus: e.cis_status || 'employed',
          utr: e.utr || '',
          hmrcVerRef: e.hmrc_ver_ref || '',
          hmrcVerDate: e.hmrc_ver_date || '',
          certs: (e.certifications || []).map(function(c) {
            return { name: c.type, body: c.card_number, expiry: c.expiry_date, status: c.status };
          })
        });
      });
      STATE._engineersApiLoaded = true;
      renderEngineers();
    }).catch(function(e) { console.error('[Engineers] API error:', e); });
    return;
  }

  /* ── Empty state ── */
  if (ENGINEERS.length === 0) {
    document.getElementById('dash-content').innerHTML = '<div class="page-hdr"><div class="page-hdr-left"><h2>Engineers</h2><p>0 engineers</p></div>'
      + '<div style="display:flex;gap:.65rem"><button class="btn btn-primary btn-sm" onclick="openEngineerModal(null)">+ Add engineer</button></div></div>'
      + '<div class="empty-state" style="padding:3.5rem 1rem">'
      + '<div class="empty-icon" style="opacity:.3;color:var(--off3,#888)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>'
      + '<div class="empty-title" style="font-size:1.1rem;color:var(--white);margin-bottom:.5rem">Add your team</div>'
      + '<div class="empty-sub" style="max-width:380px;margin:0 auto;line-height:1.6">Add engineers and operatives to track certifications, schedule work, and stay compliant.</div>'
      + '<button class="btn btn-primary" style="margin-top:1.25rem" onclick="openEngineerModal(null)">Add First Engineer</button>'
      + '</div>';
    return;
  }
  var typeLabels = {employed:'Employed','lt-sub':'Long-term Sub','st-sub':'Short-term Sub'};
  var typeColors = {employed:'var(--lime)','lt-sub':'var(--blue)','st-sub':'var(--yellow)'};
  var engColors = ['#f97316','#38bdf8','#4ade80','#a78bfa','#f87171','#34d399','#e879f9','#22d3ee'];
  var now = new Date();

  var html = '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.8rem"><h2 style="font-size:1.15rem;font-weight:700;color:var(--white);margin:0">Engineers</h2><div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'engineers\')" title="What is this?">?</button><div class="help-tooltip" id="help-tip-engineers">'+HELP_TIPS.engineers+'</div></div></div>';
  html += '<div class="bar"><div class="search-box"><input placeholder="Search engineers…" oninput="filterTableRows(this.value)"/></div></div>';

  // KPI summary
  var activeCount = ENGINEERS.filter(function(e){return e.active;}).length;
  var allCerts = [];
  ENGINEERS.forEach(function(e){(e.certs||[]).forEach(function(c){allCerts.push({...c,engId:e.id});});});
  var certExpired = allCerts.filter(function(c){return new Date(c.expiry)<now;}).length;
  var certSoon = allCerts.filter(function(c){var d=(new Date(c.expiry)-now)/(1000*60*60*24);return d>=0&&d<90;}).length;
  var certWarn = allCerts.filter(function(c){var d=(new Date(c.expiry)-now)/(1000*60*60*24);return d>=90&&d<180;}).length;

  html += '<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.2rem">';
  html += kpiCard('Engineers',ENGINEERS.length,activeCount+' active','up',{background:'var(--blue)'},null);
  html += kpiCard('Total Certs',allCerts.length,'Across '+activeCount+' active engineers','up',{background:'var(--lime)'},null);
  html += kpiCard('⚠ Expired / Critical',certExpired+certSoon,'Action required now',certExpired+certSoon>0?'dn':'up',{background:'var(--red)'},null);
  html += kpiCard('Due in 6 months',certWarn,'Schedule renewal',certWarn>0?'dn':'up',{background:'var(--yellow)'},null);
  html += '</div>';

  // ROI insight banner
  var _roi60d = new Date(now.getTime() + 60*864e5);
  var _roiExpCount = ENGINEERS.filter(function(e){
    if (e.active === false) return false;
    return (e.certs||[]).some(function(c){ var d=new Date(c.expiry); return d <= _roi60d; });
  }).length;
  html += roiBanner('engineers', ICON.shield,
    _roiExpCount + ' certification' + (_roiExpCount !== 1 ? 's' : '') + ' expire within 60 days',
    'Expired certs can invalidate site access and trigger contract penalty clauses — act now to stay compliant'
  );

  // Cert alerts banner
  var engsWithIssues = ENGINEERS.filter(function(e){
    return (e.certs||[]).some(function(c){return Math.round((new Date(c.expiry)-now)/(1000*60*60*24))<90;});
  });
  if (engsWithIssues.length) {
    html += '<div style="background:rgba(248,113,113,.08);border:1.5px solid rgba(248,113,113,.25);border-radius:var(--radius2);padding:.75rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.75rem">'
      + '<span>' + ICON.alert + '</span>'
      + '<div style="flex:1"><span style="font-size:.82rem;font-weight:700;color:var(--red)">'+ engsWithIssues.length +' engineer'+(engsWithIssues.length>1?'s':'')+' have certifications expiring or expired</span>'
      + '<div style="font-size:.72rem;color:var(--off3);margin-top:.1rem">'+engsWithIssues.map(function(e){return e.name;}).join(', ')+'</div></div>'
      + '<button class="btn btn-sm" style="background:rgba(248,113,113,.15);color:var(--red);border:1px solid rgba(248,113,113,.25);flex-shrink:0" onclick="checkRenewalAlert(\''+engsWithIssues[0].id+'\')">View alert →</button>'
      + '</div>';
  }

  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Engineer</th><th>Trade</th><th>Type</th><th>Rate</th><th>Contact</th><th>Certifications</th><th>Status</th><th></th></tr></thead><tbody>';
  html += ENGINEERS.map(function(e, idx){
    var av = e.name.split(' ').map(function(n){return n[0];}).join('').slice(0,2);
    var col = engColors[idx % engColors.length];
    var certs = e.certs||[];
    var certHtml = '';
    if (!certs.length) {
      certHtml = '<span style="color:var(--off4);font-size:.72rem">No certs added</span>';
    } else {
      var worst = worstCertStatus(certs);
      certHtml = '<div class="cert-summary">'
        + certs.slice(0,2).map(function(c){
            var s = certStatus(c.expiry);
            return '<span class="cert-badge '+s.cls+'" title="'+c.name+' · '+c.body+'">'+c.name.replace('Skilled Worker ','').replace(' Card','').replace(' at Work','')+'</span>';
          }).join('')
        + (certs.length > 2 ? '<span style="font-family:var(--mono);font-size:.6rem;color:var(--off4)">+' + (certs.length-2) + ' more</span>' : '')
        + (worst && worst.days < 90 ? ' <button class="btn btn-xs" style="background:rgba(248,113,113,.12);color:var(--red);border:1px solid rgba(248,113,113,.2);padding:.1rem .4rem" onclick="event.stopPropagation();checkRenewalAlert(\''+e.id+'\')">⚠ Alert</button>' : '')
        + '</div>';
    }
    return '<tr>'
      +'<td><div style="display:flex;align-items:center;gap:.55rem"><div class="eng-avatar-badge" style="background:'+col+';width:30px;height:30px;font-size:.6rem">'+av+'</div><strong>'+e.name+'</strong></div></td>'
      +'<td>'+e.trade+'</td>'
      +'<td><span style="color:'+typeColors[e.type]+';font-family:var(--mono);font-size:.68rem">'+typeLabels[e.type]+'</span></td>'
      +'<td class="mono">£'+e.rate+'/day</td>'
      +'<td class="mono" style="font-size:.7rem">'+(e.phone||'—')+'</td>'
      +'<td>'+certHtml+'</td>'
      +'<td>'+badge(e.active?'active':'inactive')+'</td>'
      +'<td><button class="btn btn-dark btn-xs" onclick="openEngineerModal(\''+e.id+'\')">Edit</button></td>'
      +'</tr>';
  }).join('');
  html += '</tbody></table></div></div>';
  document.getElementById('dash-content').innerHTML = html;
}

function openEngineerModal(id) {
  STATE.editEngineerId = id || null;
  var isNew = !id;
  document.getElementById('engineer-modal-title').textContent = isNew ? 'Add Engineer' : 'Edit Engineer';
  document.getElementById('engineer-del-btn').style.display = isNew ? 'none' : '';
  document.getElementById('engineer-err').style.display = 'none';

  // Clear cert rows
  var certContainer = document.getElementById('cert-rows-container');
  if (certContainer) certContainer.innerHTML = '';
  var noMsg = document.getElementById('cert-no-certs');

  if (!isNew) {
    var eng = ENGINEERS.find(function(e){return e.id===id;});
    if (eng) {
      document.getElementById('eng-name').value = eng.name||'';
      document.getElementById('eng-trade').value = eng.trade||'';
      document.getElementById('eng-type').value = eng.type||'employed';
      document.getElementById('eng-rate').value = eng.rate||'';
      document.getElementById('eng-phone').value = eng.phone||'';
      document.getElementById('eng-email').value = eng.email||'';
      document.getElementById('eng-active').value = eng.active ? '1' : '0';
      document.getElementById('eng-notes').value = eng.notes||'';
      // Populate CIS fields
      document.getElementById('eng-cis-status').value = eng.cisStatus||'employed';
      document.getElementById('eng-utr').value = eng.utr||'';
      document.getElementById('eng-hmrc-ref').value = eng.hmrcVerRef||'';
      document.getElementById('eng-hmrc-date').value = eng.hmrcVerDate||'';
      updateCISStatusPreview();
      // Populate certs
      var certs = eng.certs || [];
      if (noMsg) noMsg.style.display = certs.length ? 'none' : '';
      certs.forEach(function(c){ addCertRow(c.name, c.body, c.expiry); });
      // Check for renewal alerts after modal opens
      if (certs.some(function(c){return Math.round((new Date(c.expiry)-new Date())/(1000*60*60*24))<90;})) {
        setTimeout(function(){ checkRenewalAlert(id); }, 400);
      }
    }
  } else {
    ['eng-name','eng-trade','eng-rate','eng-phone','eng-email','eng-notes','eng-utr','eng-hmrc-ref','eng-hmrc-date'].forEach(function(fid){ document.getElementById(fid).value=''; });
    document.getElementById('eng-type').value = 'employed';
    document.getElementById('eng-active').value = '1';
    document.getElementById('eng-cis-status').value = 'employed';
    updateCISStatusPreview();
    if (noMsg) noMsg.style.display = '';
  }
  openModal('modal-engineer');
}

function saveEngineer() {
  var name = document.getElementById('eng-name').value.trim();
  var trade = document.getElementById('eng-trade').value.trim();
  if (!name) { showModalErr('engineer-err','Name is required.'); return; }
  if (!trade) { showModalErr('engineer-err','Trade / role is required.'); return; }
  var certs = harvestCertRows();
  var data = {
    name:name, trade:trade,
    type:document.getElementById('eng-type').value,
    rate:parseFloat(document.getElementById('eng-rate').value)||0,
    phone:document.getElementById('eng-phone').value.trim(),
    email:document.getElementById('eng-email').value.trim(),
    active:document.getElementById('eng-active').value==='1',
    notes:document.getElementById('eng-notes').value.trim(),
    certs:certs,
    cisStatus:document.getElementById('eng-cis-status').value,
    utr:document.getElementById('eng-utr').value.trim(),
    hmrcVerRef:document.getElementById('eng-hmrc-ref').value.trim(),
    hmrcVerDate:document.getElementById('eng-hmrc-date').value
  };
  if (STATE.editEngineerId) {
    var idx = ENGINEERS.findIndex(function(e){return e.id===STATE.editEngineerId;});
    if (idx>=0) { data.id=STATE.editEngineerId; Object.assign(ENGINEERS[idx],data); }
    showToast('Engineer updated.','success');
  } else {
    data.id = 'e'+Date.now();
    ENGINEERS.push(data);
    showToast('Engineer added.','success');
  }

  /* ── Persist to API for real users ── */
  if (ContraqAPI.isRealUser()) {
    ContraqAPI.saveEngineer({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.type,
      trade: data.trade,
      day_rate: data.rate,
      status: data.active ? 'active' : 'inactive',
      notes: data.notes
    }).catch(function(e) { console.error('[Engineers] Save error:', e); });
  }

  closeModal('modal-engineer');
  dashNav('engineers');
}

function deleteEngineer() {
  if (!STATE.editEngineerId) return;
  var eng = ENGINEERS.find(function(e){return e.id===STATE.editEngineerId;});
  if (!eng || !confirm('Remove '+eng.name+' from engineers?')) return;
  ENGINEERS.splice(ENGINEERS.findIndex(function(e){return e.id===STATE.editEngineerId;}),1);
  showToast('Engineer removed.','success');
  closeModal('modal-engineer');
  dashNav('engineers');
}


/* ══════════════════════════════════════════════════════════════
   SUPPLIERS (full v4)
══════════════════════════════════════════════════════════════ */
