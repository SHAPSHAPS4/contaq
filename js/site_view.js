/* ═══ CONTRAQ — SITE_VIEW ═══
   SV state, site view init, journal/measure/time clock, offline sync
   Lines 19086-19682 from contraq-v77
═══════════════════════════════════════════ */

var SV = {
  activeScreen: 'home',
  selectedType:  'General Note',
  selectedMtype: 'pdf',
  journalPhoto:  null,
  measurePhoto:  null,
  measureFile:   null,
  voiceRecog:    null,
  voiceTarget:   null,
  isRecording:   false,
  clockData:     {},   /* engineerId → {status, clockedAt, totalMins} */
  todayLogs:     0,
  todayMeasures: 0,
  clockTimer:    null
};

/* ── LocalStorage keys ─────────────────────────────────────── */
var LS_CLOCK   = 'sv_clock_' + new Date().toISOString().split('T')[0];
var LS_OFFLINE = 'sv_offline_queue';

/* ── Activation ─────────────────────────────────────────────── */
function svActivate() {
  nav('site');
  svInit();
}

function svExitToDesktop() {
  nav('dashboard');
  initDashboard();
}

/* Auto-activate on mobile */
function svCheckAutoActivate() {
  if (window.innerWidth < 768 && typeof STATE !== 'undefined' && STATE.loggedIn) {
    // Show a "Switch to Site View" nudge — don't auto-force in case desk user on small window
    var fab = document.getElementById('sv-mobile-fab');
    if (fab) fab.style.display = 'flex';
  }
}

function svInit() {
  svLoadClock();
  svRenderHome();
  svStartClockTicker();
  svCheckOffline();
  // populate project dropdowns
  svPopulateProjectDropdowns();
}

function svPopulateProjectDropdowns() {
  var active = (typeof PROJECTS !== 'undefined' ? PROJECTS : [])
    .filter(function(p){ return p.status === 'active' || p.status === 'pending'; })
    .sort(function(a,b){ return a.name > b.name ? 1 : -1; });

  ['sv-j-project','sv-m-project'].forEach(function(id) {
    var sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select project…</option>'
      + active.map(function(p){
          return '<option value="' + p.id + '">' + p.code + ' — ' + p.name.split('—')[0].trim() + '</option>';
        }).join('');
  });
}

/* ── Home render ────────────────────────────────────────────── */
function svRenderHome() {
  // Date
  var now = new Date();
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var dateStr = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  var el = document.getElementById('sv-date-label');
  if (el) el.textContent = dateStr;

  // Greeting
  var h = now.getHours();
  var greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  var user = (typeof DEMO_USER !== 'undefined') ? DEMO_USER : {fname:'there'};
  var gEl = document.getElementById('sv-greeting-name');
  if (gEl) gEl.textContent = greet + ', ' + (user.fname || 'there') + '.';

  // Active projects label
  var active = (typeof PROJECTS !== 'undefined' ? PROJECTS : []).filter(function(p){ return p.status==='active'; });
  var projEl = document.getElementById('sv-active-proj-label');
  if (projEl) projEl.textContent = active.length + ' active project' + (active.length !== 1 ? 's' : '') + ' · Mitchell Insulation Ltd';

  // Summary counts
  var onSite = Object.keys(SV.clockData).filter(function(k){ return SV.clockData[k].status === 'on'; }).length;
  var todayLogsEl = document.getElementById('sv-sum-journal');
  var todayMsrEl  = document.getElementById('sv-sum-measures');
  var onSiteEl    = document.getElementById('sv-sum-onsite');
  if (onSiteEl)    onSiteEl.textContent = onSite;
  if (todayLogsEl) todayLogsEl.textContent = SV.todayLogs;
  if (todayMsrEl)  todayMsrEl.textContent = SV.todayMeasures;

  var countEl = document.getElementById('sv-onsite-count-label');
  if (countEl) countEl.textContent = onSite > 0 ? onSite + ' engineer' + (onSite !== 1 ? 's' : '') + ' on site today' : 'Tap to clock in / out';

  // Topbar subtitle
  var sub = document.getElementById('sv-topbar-sub');
  if (sub) sub.textContent = active.length + ' active projects';

  svSetNavActive('home');
}

/* ── Screen navigation ──────────────────────────────────────── */
function svShowScreen(id) {
  document.querySelectorAll('.sv-screen').forEach(function(s){ s.classList.remove('active'); });
  var sc = document.getElementById(id);
  if (sc) { sc.classList.add('active'); sc.scrollTop = 0; }
}

function svShowHome() {
  svRenderHome();
  svShowScreen('sv-home-screen');
  svSetNavActive('home');
}

function svOpenJournal() {
  svShowScreen('sv-journal-screen');
  svSetNavActive('journal');
  // Reset form
  var titleEl = document.getElementById('sv-j-title');
  var descEl  = document.getElementById('sv-j-desc');
  if (titleEl) titleEl.value = '';
  if (descEl)  descEl.value  = '';
  SV.journalPhoto = null;
  var prev = document.getElementById('sv-j-photo-preview');
  if (prev) prev.style.display = 'none';
  // Reset type selection
  document.querySelectorAll('#sv-journal-screen .sv-type-chip').forEach(function(c){ c.classList.remove('selected'); });
  var defChip = document.querySelector('#sv-journal-screen .sv-type-chip[data-type="General Note"]');
  if (defChip) defChip.classList.add('selected');
  SV.selectedType = 'General Note';
  svStopVoice();
  var vBtn = document.getElementById('sv-j-voice-btn');
  if (vBtn) { vBtn.classList.remove('recording'); }
  var vLbl = document.getElementById('sv-j-voice-label');
  if (vLbl) vLbl.textContent = 'Voice Note';
  var vStat = document.getElementById('sv-j-voice-status');
  if (vStat) vStat.textContent = '';
}

function svOpenMeasure() {
  svShowScreen('sv-measure-screen');
  svSetNavActive('measure');
  SV.measureFile = null;
  SV.measurePhoto = null;
  var zone = document.getElementById('sv-m-attach-zone');
  var nameEl = document.getElementById('sv-m-attach-name');
  var iconEl = document.getElementById('sv-m-attach-icon');
  if (zone)   zone.classList.remove('has-file');
  if (nameEl) nameEl.textContent = '';
  if (iconEl) iconEl.innerHTML = ICON.folder;
  var prev = document.getElementById('sv-m-photo-preview');
  if (prev) prev.style.display = 'none';
  var descEl = document.getElementById('sv-m-desc');
  var nameInput = document.getElementById('sv-m-name');
  if (descEl) descEl.value = '';
  if (nameInput) nameInput.value = '';
  svStopVoice();
}

function svOpenTimeClock() {
  svShowScreen('sv-timeclock-screen');
  svSetNavActive('timeclock');
  svRenderTimeClock();
}

function svSetNavActive(which) {
  SV.activeScreen = which;
  document.querySelectorAll('.sv-bnav-btn').forEach(function(b){ b.classList.remove('active'); });
  var map = {home:'svnav-home', journal:'svnav-journal', measure:'svnav-measure', timeclock:'svnav-timeclock'};
  var el = document.getElementById(map[which]);
  if (el) el.classList.add('active');
}

/* ── Event type selection ────────────────────────────────────── */
function svSelectType(chip) {
  document.querySelectorAll('#sv-journal-screen .sv-type-chip').forEach(function(c){ c.classList.remove('selected'); });
  chip.classList.add('selected');
  SV.selectedType = chip.getAttribute('data-type');
}

function svSelectMtype(chip) {
  document.querySelectorAll('#sv-measure-screen .sv-mtype-chip').forEach(function(c){ c.classList.remove('selected'); });
  chip.classList.add('selected');
  SV.selectedMtype = chip.getAttribute('data-mtype');
  // Update attach zone accept
  var fin = document.getElementById('sv-m-file-input');
  if (!fin) return;
  if (SV.selectedMtype === 'img') { fin.setAttribute('capture','environment'); fin.accept = 'image/*'; }
  else { fin.removeAttribute('capture'); fin.accept = '.pdf,.dwg,.xlsx,.xls,.doc,.docx,image/*'; }
}

/* ── Voice-to-text ───────────────────────────────────────────── */
function svToggleVoice(target) {
  if (SV.isRecording && SV.voiceTarget === target) { svStopVoice(); return; }
  if (SV.isRecording) svStopVoice();
  SV.voiceTarget = target;
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Voice recognition is not supported on this browser. Try Chrome on Android or Safari on iOS.');
    return;
  }
  SV.voiceRecog = new SpeechRecognition();
  SV.voiceRecog.continuous = true;
  SV.voiceRecog.interimResults = true;
  SV.voiceRecog.lang = 'en-GB';

  var btnId    = target === 'journal' ? 'sv-j-voice-btn' : 'sv-m-voice-btn';
  var lblId    = target === 'journal' ? 'sv-j-voice-label' : 'sv-m-voice-label';
  var statusId = target === 'journal' ? 'sv-j-voice-status' : 'sv-m-voice-status';
  var descId   = target === 'journal' ? 'sv-j-desc' : 'sv-m-desc';

  var btn    = document.getElementById(btnId);
  var lbl    = document.getElementById(lblId);
  var status = document.getElementById(statusId);
  var desc   = document.getElementById(descId);

  if (btn)    btn.classList.add('recording');
  if (lbl)    lbl.textContent = 'Listening…';
  if (status) status.innerHTML = '<span class="sv-pulse"></span> Listening — speak now';
  SV.isRecording = true;

  var finalTranscript = desc ? desc.value : '';

  SV.voiceRecog.onresult = function(e) {
    var interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    if (desc) desc.value = finalTranscript + interim;
  };

  SV.voiceRecog.onerror = function(e) {
    if (status) status.textContent = 'Error: ' + (e.error || 'mic unavailable');
    svStopVoice();
  };

  SV.voiceRecog.onend = function() {
    if (desc) desc.value = finalTranscript;
    svStopVoice();
  };

  SV.voiceRecog.start();
}

function svStopVoice() {
  if (SV.voiceRecog) { try { SV.voiceRecog.stop(); } catch(e){} SV.voiceRecog = null; }
  SV.isRecording = false;
  ['sv-j-voice-btn','sv-m-voice-btn'].forEach(function(id){
    var b = document.getElementById(id); if (b) b.classList.remove('recording');
  });
  ['sv-j-voice-label','sv-m-voice-label'].forEach(function(id){
    var l = document.getElementById(id); if (l) l.textContent = 'Voice Note';
  });
  ['sv-j-voice-status','sv-m-voice-status'].forEach(function(id){
    var s = document.getElementById(id); if (s) s.textContent = '';
  });
}

/* ── Photo / camera ─────────────────────────────────────────── */
function svTakePhoto(target) {
  var inputId = target === 'journal' ? 'sv-j-photo-input' : 'sv-m-photo-input';
  var inp = document.getElementById(inputId);
  if (inp) inp.click();
}

function svPhotoSelected(input, target) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    if (target === 'journal') {
      SV.journalPhoto = {dataUrl: e.target.result, name: file.name, size: file.size};
      var prev = document.getElementById('sv-j-photo-preview');
      var btn  = document.getElementById('sv-j-photo-btn');
      if (prev) { prev.src = e.target.result; prev.style.display = 'block'; }
      if (btn)  btn.classList.add('has-content');
    } else {
      SV.measurePhoto = {dataUrl: e.target.result, name: file.name, size: file.size};
      var prev = document.getElementById('sv-m-photo-preview');
      if (prev) { prev.src = e.target.result; prev.style.display = 'block'; }
      // Also set as file
      SV.measureFile = {name: file.name, size: file.size, type: 'img'};
      var zone = document.getElementById('sv-m-attach-zone');
      var nameEl = document.getElementById('sv-m-attach-name');
      var iconEl = document.getElementById('sv-m-attach-icon');
      if (zone)   zone.classList.add('has-file');
      if (nameEl) nameEl.textContent = '✓ ' + file.name;
      if (iconEl) iconEl.innerHTML = ICON.camera;
    }
  };
  reader.readAsDataURL(file);
}

function svTriggerMeasureFile() {
  var fin = document.getElementById('sv-m-file-input');
  if (fin) fin.click();
}

function svMeasureFileSelected(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  SV.measureFile = {name: file.name, size: file.size, type: SV.selectedMtype};
  var zone   = document.getElementById('sv-m-attach-zone');
  var nameEl = document.getElementById('sv-m-attach-name');
  var iconEl = document.getElementById('sv-m-attach-icon');
  if (zone)   zone.classList.add('has-file');
  if (nameEl) nameEl.textContent = '✓ ' + file.name;
  if (iconEl) iconEl.innerHTML = SV.selectedMtype === 'img' ? ICON.camera : SV.selectedMtype === 'pdf' ? ICON.file : ICON.chart;
  // Auto-fill name field
  var nameInput = document.getElementById('sv-m-name');
  if (nameInput && !nameInput.value) nameInput.value = file.name.replace(/\.[^.]+$/, '');
}

/* ── Save journal ────────────────────────────────────────────── */
function svSaveJournal() {
  var projId  = document.getElementById('sv-j-project').value;
  var title   = (document.getElementById('sv-j-title').value || '').trim();
  var desc    = (document.getElementById('sv-j-desc').value  || '').trim();
  var type    = SV.selectedType;

  if (!projId) { svFlashField('sv-j-project', 'Project required'); return; }
  if (!title)  { svFlashField('sv-j-title',   'Title required');   return; }

  var proj = (typeof PROJECTS !== 'undefined') ? PROJECTS.find(function(p){ return p.id === projId; }) : null;
  var today = new Date().toISOString().split('T')[0];
  var user  = (typeof DEMO_USER !== 'undefined') ? DEMO_USER.fname + ' ' + DEMO_USER.lname : 'Site User';

  var entry = {
    id:          'j-sv-' + Date.now(),
    date:        today,
    type:        type,
    title:       title,
    description: desc + (SV.journalPhoto ? ' [Photo attached: ' + SV.journalPhoto.name + ']' : ''),
    author:      user,
    edited:      false,
    source:      'mobile'
  };

  if (proj) {
    if (!proj.journal) proj.journal = [];
    proj.journal.unshift(entry);
    SV.todayLogs++;
  } else {
    svQueueOffline({type:'journal', entry:entry, projectId:projId});
  }

  svStopVoice();
  svShowConfirm('✅', 'Journal Entry Saved', 'Entry logged to ' + (proj ? proj.code : projId) + '.\nType: ' + type);
}

/* ── Save measure ────────────────────────────────────────────── */
function svSaveMeasure() {
  var projId = document.getElementById('sv-m-project').value;
  var name   = (document.getElementById('sv-m-name').value || '').trim();
  var desc   = (document.getElementById('sv-m-desc').value || '').trim();
  var mtype  = SV.selectedMtype;

  if (!projId)         { svFlashField('sv-m-project',   'Project required'); return; }
  if (!SV.measureFile) { svFlashField('sv-m-attach-zone','Attach a file first'); return; }

  var proj = (typeof PROJECTS !== 'undefined') ? PROJECTS.find(function(p){ return p.id === projId; }) : null;
  var today = new Date().toISOString().split('T')[0];
  var user  = (typeof DEMO_USER !== 'undefined') ? DEMO_USER.fname + ' ' + DEMO_USER.lname : 'Site User';
  var userId = (typeof DEMO_USER !== 'undefined') ? DEMO_USER.id : 'u1';

  var sizekb = SV.measureFile.size ? Math.round(SV.measureFile.size / 1024) : 0;
  var sizeStr = sizekb > 1024 ? (sizekb/1024).toFixed(1) + ' MB' : sizekb + ' KB';

  var measure = {
    id:          'ms-sv-' + Date.now(),
    name:        name || SV.measureFile.name,
    type:        mtype,
    project:     projId,
    projectName: proj ? proj.name : projId,
    engineer:    userId,
    engineerName: user,
    date:        today,
    rev:         'Rev 1',
    sizekb:      sizekb,
    notes:       desc,
    icon:        mtype === 'img' ? ICON.image : mtype === 'pdf' ? ICON.file : mtype === 'xls' ? ICON.chart : ICON.edit,
    source:      'mobile'
  };

  if (typeof SITE_MEASURES !== 'undefined') {
    SITE_MEASURES.unshift(measure);
    SV.todayMeasures++;
  } else {
    svQueueOffline({type:'measure', measure:measure});
  }

  svStopVoice();
  svShowConfirm(ICON.ruler, 'Measure Uploaded', (name || SV.measureFile.name) + '\nSaved to ' + (proj ? proj.code : projId));
}

/* ── Time clock ──────────────────────────────────────────────── */
function svLoadClock() {
  try {
    var stored = localStorage.getItem(LS_CLOCK);
    SV.clockData = stored ? JSON.parse(stored) : {};
  } catch(e) { SV.clockData = {}; }
  // Initialise any engineers not yet in clock data
  if (typeof ENGINEERS !== 'undefined') {
    ENGINEERS.filter(function(e){ return e.active !== false; }).forEach(function(e) {
      if (!SV.clockData[e.id]) SV.clockData[e.id] = {status:'off', clockedAt:null, totalMins:0};
    });
  }
}

function svSaveClock() {
  try { localStorage.setItem(LS_CLOCK, JSON.stringify(SV.clockData)); } catch(e){}
}

function svClockToggle(engId) {
  var data = SV.clockData[engId];
  if (!data) data = SV.clockData[engId] = {status:'off', clockedAt:null, totalMins:0};
  var now = Date.now();
  if (data.status === 'off') {
    data.status = 'on';
    data.clockedAt = now;
  } else {
    if (data.clockedAt) {
      data.totalMins += Math.round((now - data.clockedAt) / 60000);
    }
    data.status = 'off';
    data.clockedAt = null;
  }
  svSaveClock();
  svRenderTimeClock();
  svRenderHome();
}

function svRenderTimeClock() {
  var now = new Date();
  var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dayEl  = document.getElementById('sv-tc-day');
  var dateEl = document.getElementById('sv-tc-date');
  var timeEl = document.getElementById('sv-tc-time');
  if (dayEl)  dayEl.textContent  = days[now.getDay()];
  if (dateEl) dateEl.textContent = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'});

  var engList = document.getElementById('sv-eng-list');
  if (!engList || typeof ENGINEERS === 'undefined') return;

  var engs = ENGINEERS.filter(function(e){ return e.active !== false; });
  var engColors = ['#f97316','#a3e635','#60a5fa','#c084fc','#f87171','#fbbf24','#2dd4bf','#fb923c'];

  var html = '';
  engs.forEach(function(e, i) {
    var cd = SV.clockData[e.id] || {status:'off', clockedAt:null, totalMins:0};
    var isOn = cd.status === 'on';
    var mins = cd.totalMins;
    if (isOn && cd.clockedAt) mins += Math.round((Date.now() - cd.clockedAt) / 60000);
    var hrs  = Math.floor(mins / 60);
    var rem  = mins % 60;
    var timeStr = mins > 0 ? hrs + 'h ' + rem + 'm' : '—';
    var clockedStr = isOn && cd.clockedAt ? 'Clocked in ' + new Date(cd.clockedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '';
    var initials = e.name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase();
    var color = engColors[i % engColors.length];
    var typeTag = e.type === 'employed' ? '' : '<span style="font-family:var(--mono);font-size:.55rem;color:var(--off4);margin-left:.3rem;">sub</span>';

    html += '<div class="sv-eng-card ' + (isOn ? 'onsite' : '') + '">';
    html += '<div class="sv-eng-av" style="background:' + color + '">' + initials + '</div>';
    html += '<div class="sv-eng-info">';
    html += '<div class="sv-eng-name">' + e.name + typeTag + '</div>';
    html += '<div class="sv-eng-role">' + e.trade + '</div>';
    html += '<div class="sv-eng-time ' + (isOn ? 'running' : '') + '">';
    if (isOn) html += ICON.circle_green + ' On site · ' + clockedStr + (mins > 0 ? ' · ' + timeStr : '');
    else if (mins > 0) html += '⚫ Off site · Today: ' + timeStr;
    else html += '⚫ Off site';
    html += '</div></div>';
    html += '<button class="sv-clock-btn ' + (isOn ? 'clock-out' : 'clock-in') + '" onclick="svClockToggle(\'' + e.id + '\')">';
    html += isOn ? 'Clock<br>Out' : 'Clock<br>In';
    html += '</button></div>';
  });
  engList.innerHTML = html;

  // Totals
  var onCount  = engs.filter(function(e){ return (SV.clockData[e.id]||{}).status === 'on'; }).length;
  var offCount = engs.length - onCount;
  var totalMins = engs.reduce(function(sum, e) {
    var cd = SV.clockData[e.id] || {};
    var m = cd.totalMins || 0;
    if (cd.status === 'on' && cd.clockedAt) m += Math.round((Date.now() - cd.clockedAt) / 60000);
    return sum + m;
  }, 0);
  var tHrs = Math.floor(totalMins/60); var tRem = totalMins % 60;

  var onEl  = document.getElementById('sv-tc-onsite-count');
  var hrEl  = document.getElementById('sv-tc-total-hrs');
  var offEl = document.getElementById('sv-tc-off-count');
  if (onEl)  onEl.textContent  = onCount;
  if (hrEl)  hrEl.textContent  = totalMins > 0 ? tHrs + 'h ' + tRem + 'm' : '—';
  if (offEl) offEl.textContent = offCount;
}

function svStartClockTicker() {
  if (SV.clockTimer) clearInterval(SV.clockTimer);
  SV.clockTimer = setInterval(function() {
    if (SV.activeScreen === 'timeclock') svRenderTimeClock();
    // Update time in topbar too
    var timeEl = document.getElementById('sv-tc-time');
    if (timeEl) {
      var now = new Date();
      timeEl.textContent = now.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    }
  }, 10000);
}

/* ── Confirmation screen ─────────────────────────────────────── */
function svShowConfirm(icon, title, sub) {
  document.getElementById('sv-confirm-icon').textContent = icon;
  document.getElementById('sv-confirm-title').textContent = title;
  document.getElementById('sv-confirm-sub').textContent = sub;
  svShowScreen('sv-confirm-screen');
  // Auto-return after 3s
  setTimeout(function() {
    if (SV.activeScreen === 'confirm') svShowHome();
  }, 3000);
}

/* ── Field validation flash ─────────────────────────────────── */
function svFlashField(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  var origBorder = el.style.borderColor;
  el.style.borderColor = 'var(--red)';
  el.style.boxShadow = '0 0 0 3px rgba(248,113,113,.25)';
  el.scrollIntoView({behavior:'smooth', block:'center'});
  if (typeof showToast === 'function') showToast('⚠ ' + msg, 'error');
  setTimeout(function(){
    el.style.borderColor = origBorder || '';
    el.style.boxShadow = '';
  }, 2200);
}

/* ── Offline queue ───────────────────────────────────────────── */
function svQueueOffline(item) {
  try {
    var q = JSON.parse(localStorage.getItem(LS_OFFLINE) || '[]');
    q.push(Object.assign({ts: Date.now()}, item));
    localStorage.setItem(LS_OFFLINE, JSON.stringify(q));
  } catch(e){}
}

function svCheckOffline() {
  var banner = document.getElementById('sv-offline-banner');
  if (!banner) return;
  var isOffline = !navigator.onLine;
  banner.classList.toggle('visible', isOffline);
  window.addEventListener('offline', function(){ banner.classList.add('visible'); });
  window.addEventListener('online', function(){ banner.classList.remove('visible'); svSyncOfflineQueue(); });
}

function svSyncOfflineQueue() {
  try {
    var q = JSON.parse(localStorage.getItem(LS_OFFLINE) || '[]');
    if (!q.length) return;
    // Process queued items into live data
    q.forEach(function(item) {
      if (item.type === 'journal' && typeof PROJECTS !== 'undefined') {
        var proj = PROJECTS.find(function(p){ return p.id === item.projectId; });
        if (proj) { if (!proj.journal) proj.journal = []; proj.journal.unshift(item.entry); }
      }
      if (item.type === 'measure' && typeof SITE_MEASURES !== 'undefined') {
        SITE_MEASURES.unshift(item.measure);
      }
    });
    localStorage.removeItem(LS_OFFLINE);
    if (typeof showToast === 'function') showToast('✔ ' + q.length + ' offline item' + (q.length!==1?'s':'') + ' synced.', 'success');
  } catch(e){}
}

/* Mobile nav/init hooks moved into original nav() above */

/* ── On window resize, respect mobile breakpoint ─────────────── */
window.addEventListener('resize', function() {
  var trigger = document.querySelector('.sv-desktop-trigger');
  if (trigger && typeof STATE !== 'undefined' && STATE.loggedIn) {
    trigger.style.display = window.innerWidth < 900 ? 'flex' : 'none';
  }
});



/* ══════════════════════════════════════════════════════════
   ENTERPRISE SALES PATHWAY — JS
══════════════════════════════════════════════════════════ */

/* ── Book a demo modal ─────────────────────────────────────── */
