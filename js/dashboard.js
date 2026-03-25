/* ═══ CONTRAQ — DASHBOARD ═══
   initDashboard, dashNav, dashTopAction, renderDashHome, charts, KPIs
   Lines 8394-8967 from contraq-v77
═══════════════════════════════════════════ */

function initDashboard() {
  var user = STATE.user||DEMO_USER;
  var av = document.getElementById('sb-user-av');
  var nm = document.getElementById('sb-user-name');
  var rl = document.getElementById('sb-user-role');
  if (av) av.textContent = (user.fname[0]+(user.lname?user.lname[0]:'')).toUpperCase();
  if (nm) nm.textContent = user.fname+' '+(user.lname||'');
  if (rl) rl.textContent = (user.role==='admin'?'Admin':'User')+' · '+planLabels[user.plan||'professional'];
  var trial = document.getElementById('sb-trial-text');
  if (trial) {
    if (STATE.demoMode) {
      trial.textContent = '5 days remaining';
    } else if (user.trialDaysLeft !== undefined && user.trialDaysLeft !== null) {
      trial.textContent = user.trialDaysLeft + ' day' + (user.trialDaysLeft !== 1 ? 's' : '') + ' remaining';
    } else {
      trial.textContent = (user.trialDays || 7) + ' days remaining';
    }
  }
  // Trade label
  var tradeKey = STATE.tradePrimary || (user.trade) || 'insulation';
  var tradeDisplayMap = {
    insulation:'Insulation Contractor', ductwork:'Ductwork Contractor',
    pipework:'Pipework Contractor', electrical:'Electrical Contractor',
    plumbing:'Plumbing & Heating Contractor', fire:'Fire Protection Contractor',
    cladding:'Cladding Contractor', other:'Trade Contractor'
  };
  var tradeLabel = tradeDisplayMap[tradeKey] || 'Trade Contractor';
  // Multi-trade M&E shorthand
  var trades = STATE.selectedTrades.length ? STATE.selectedTrades : (user.trades || [tradeKey]);
  var meeTrades = ['ductwork','pipework','electrical','plumbing','fire','insulation','cladding'];
  var meeCount = trades.filter(function(t){return meeTrades.indexOf(t)>=0;}).length;
  if (meeCount >= 3) tradeLabel = 'M&E Contractor';
  document.body.style.setProperty('--trade-label', '"'+tradeLabel+'"');
  var tdEl = document.getElementById('sb-trade-desc');
  if (tdEl) tdEl.textContent = tradeLabel;
  // Show admin tab only for admin role
  var adminTab = document.getElementById('sbn-admin');
  if (adminTab) adminTab.style.display = (user.role === 'admin') ? '' : 'none';
  // Show lock icons for Starter-gated sidebar items
  var isStarter = getUserPlan() === 'starter';
  ['invoices','finance','cis'].forEach(function(id){
    var lock = document.getElementById('sb-lock-'+id);
    if (lock) lock.style.display = isStarter ? '' : 'none';
  });
  // Launch mode: grey out locked sidebar items + add "Soon" badge
  if (typeof LAUNCH_MODE !== 'undefined' && LAUNCH_MODE) {
    // Hide mode switcher — not needed when features are limited
    var modeSwitcher = document.querySelector('.mode-switcher');
    if (modeSwitcher) modeSwitcher.style.display = 'none';
    // Show ALL sidebar items (override mode visibility) so users see the full roadmap
    document.querySelectorAll('.sb-item[data-mode]').forEach(function(el) {
      el.style.display = '';
    });
    // Grey out and badge locked panels
    LAUNCH_LOCKED_PANELS.forEach(function(panelId) {
      var el = document.getElementById('sbn-' + panelId);
      if (el) {
        el.style.opacity = '0.35';
        el.style.cursor = 'default';
        el.onclick = function() { showToast('Coming soon! This feature is on our roadmap.', 'default'); };
        // Add "Soon" badge
        if (!el.querySelector('.launch-soon-badge')) {
          var badge = document.createElement('span');
          badge.className = 'launch-soon-badge';
          badge.textContent = 'SOON';
          badge.style.cssText = 'margin-left:auto;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:2px 6px;border-radius:10px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.35);flex-shrink:0;';
          el.appendChild(badge);
        }
      }
    });
  }

  if (typeof loadOrgLearnedRules === 'function') loadOrgLearnedRules();

  dashNav(STATE.currentPanel||'home');
}

function adminNavClick() {
  var user = STATE.user || DEMO_USER;
  if (user.role !== 'admin') {
    showToast('Access Denied — Admin privileges required.', 'error');
    return;
  }
  dashNav('admin');
  closeSidebar();
}

function dashNav(panel) {
  // Launch mode gate — only wedge features accessible
  if (typeof LAUNCH_MODE !== 'undefined' && LAUNCH_MODE && LAUNCH_LOCKED_PANELS.indexOf(panel) >= 0) {
    showToast('Coming soon! This feature is on our roadmap.', 'default');
    return;
  }

  // Plan gates disabled during beta — all features included in beta plan
  // To re-enable: remove the LAUNCH_MODE check below
  if (typeof LAUNCH_MODE === 'undefined' || !LAUNCH_MODE) {
    var gatedPanels = { cis: 'cis', finance: 'finance', invoices: 'finance', procurement: 'finance', procore: 'procore' };
    if (gatedPanels[panel]) {
      var gate = checkPlanGate(gatedPanels[panel]);
      if (!gate.allowed) { showUpgradePrompt(gate); return; }
    }
  }

  STATE.currentPanel = panel;
  document.querySelectorAll('.sb-item').forEach(function(i){i.classList.remove('active');});
  var sbn = document.getElementById('sbn-'+panel);
  if (sbn) sbn.classList.add('active');

  var titles = {
    home:'Dashboard',tenders:'Quote / Estimate Book',projects:'Projects',clients:'Client Register',
    measures:'Site Measures',invoices:'Invoice Register',procurement:'Procurement / POs',
    finance:'Finance & P&L',diary:'Diary & Schedule',engineers:'Engineers & Certs',
    suppliers:'Supplier Register',pricebook:'Materials & Price Book',reports:'Reports',settings:'Settings',
    cis:'CIS Returns — HMRC CIS300',
    eco4:'ECO4 / PAS 2030 Compliance Register',
    procore:'Procore CSV Import',
    admin:'Admin Panel'
  };
  var topActions = {
    home:'\uD83E\uDDE0 AI Quote Builder',tenders:'+ Add Quote',projects:'+ New Project',clients:'+ Add Client',
    measures:'+ Upload Measure',invoices:'+ Raise Invoice',procurement:'+ Create PO',finance:'Export',
    diary:'+ Assign',engineers:'+ Add Engineer',suppliers:'+ Add Supplier',
    pricebook:'+ Add Item',reports:'Export Report',settings:'',
    cis:'Export CIS Return',
    eco4:'+ New Compliance Record',
    procore:'',
    admin:''
  };
  var tt = document.getElementById('dash-topbar-title');
  var ta = document.getElementById('dash-topbar-action');
  if (tt) tt.textContent = titles[panel]||panel;
  if (ta) {
    ta.textContent = topActions[panel]||'';
    ta.style.display = topActions[panel] ? '' : 'none';
    ta.onclick = (panel==='home') ? function(){ openModal('modal-qb-upload'); }
      : (panel==='diary') ? function(){ openAssignModal(null,null,null); }
      : (panel==='engineers') ? function(){ openEngineerModal(null); }
      : (panel==='tenders')   ? function(){ openTenderModal(null); }
      : (panel==='projects')  ? function(){ openProjectModal(null); }
      : (panel==='clients')   ? function(){ openClientModal(null); }
      : (panel==='invoices')  ? function(){ prefillInvoice(null); }
      : (panel==='procurement')? function(){ openPOModal(null); }
      : (panel==='suppliers') ? function(){ openSupplierModal(null); }
      : (panel==='measures')  ? function(){ openMeasureModal(null); }
      : (panel==='cis')       ? function(){ exportCISReturnCSV(); }
      : (panel==='eco4')      ? function(){ openECO4Modal(null); }
      : null;
  }

  var content = document.getElementById('dash-content');
  if (!content) return;
  content.scrollTop = 0;

  if (panel==='home') renderDashHome();
  else if (panel==='tenders') renderTenders();
  else if (panel==='projects') renderProjects();
  else if (panel==='clients') renderClients();
  else if (panel==='measures') renderMeasures();
  else if (panel==='invoices') renderInvoices();
  else if (panel==='procurement') renderProcurement();
  else if (panel==='finance') renderFinance();
  else if (panel==='diary') renderDiary();
  else if (panel==='engineers') renderEngineers();
  else if (panel==='suppliers') renderSuppliers();
  else if (panel==='pricebook') renderPriceBook();
  else if (panel==='reports') renderReports();
  else if (panel==='settings') renderSettings();
  else if (panel==='cis') renderCISReturns();
  else if (panel==='eco4') renderECO4();
  else if (panel==='procore') renderProcoreImport();
  else if (panel==='admin') renderAdminPanel();
}

function dashTopAction() {
  var p = STATE.currentPanel;
  if (p==='home'||p==='projects') openTradeModal(null);
  else if (p==='tenders') openTenderModal(null);
  else if (p==='clients') openClientModal(null);
  else if (p==='measures') openMeasureModal(null);
  else if (p==='invoices') openInvoiceModal(null);
  else if (p==='procurement') openPOModal(null);
  else if (p==='finance') exportCSV();
  else if (p==='diary') openEventModal(null);
  else if (p==='engineers') openEngineerModal(null);
  else if (p==='suppliers') openSupplierModal(null);
  else if (p==='reports') generateReport();
}

function openSidebar() {
  var sb = document.getElementById('dash-sidebar');
  var ov = document.getElementById('sb-overlay');
  if (sb) sb.classList.add('open');
  if (ov) ov.classList.add('open');
}

function closeSidebar() {
  var sb = document.getElementById('dash-sidebar');
  var ov = document.getElementById('sb-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('open');
}


/* ══════════════════════════════════════════════════════════════
   DASHBOARD HOME
══════════════════════════════════════════════════════════════ */
var HELP_TIPS = {
  tenders: "Your Quote Book tracks every job you've priced. It shows your win rate, pipeline value, and which clients you quote most — so you focus effort where it converts.",
  projects: "Projects link your quotes, costs, invoices and documents in one place. If a job goes over budget, you'll see it here before it's too late.",
  invoices: "Every invoice you raise lives here. CONTRAQ tracks what's been paid, what's overdue, and sends reminders so you don't have to chase manually.",
  engineers: "Add your team here to track CSCS cards, asbestos certs, and IPAF licences. You'll get warned before anything expires.",
  finance: "Your Profit & Loss report — see exactly where your money comes from and where it goes each month, without needing an accountant.",
  procurement: "Every purchase order in one place. Stops materials being bought twice and makes sure costs hit the right project."
};

function showHelpTip(id) {
  var el = document.getElementById('help-tip-' + id);
  if (!el) return;
  var wasOpen = el.classList.contains('open');
  var all = document.querySelectorAll('.help-tooltip.open');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('open');
  if (!wasOpen) el.classList.add('open');
}

function checkSetupProgress() {
  var s = STATE.setupSteps;
  STATE.setupComplete = s.addClient && s.addQuote && s.addProject && s.addEngineer && s.raiseInvoice;
}

function markSetupStep(step) {
  STATE.setupSteps[step] = true;
  checkSetupProgress();
  renderDashHome();
}

function renderDashHome() {
  /* ── Load real data for authenticated users (progressive enhancement) ── */
  if (ContraqAPI.isRealUser()) {
    ContraqAPI.getDashboard().then(function(data) {
      var s = data.stats;
      var kpis = document.querySelectorAll('.kpi-val');
      if (kpis.length >= 4 && s) {
        if (s.pipelineValue !== undefined) kpis[0].textContent = '\u00a3' + fmtNum(s.pipelineValue);
        if (s.activeProjects !== undefined) kpis[1].textContent = s.activeProjects;
        if (s.totalInvoices !== undefined) kpis[2].textContent = '\u00a3' + fmtNum(s.totalInvoiced || 0);
        if (s.overdueInvoices !== undefined) kpis[3].textContent = '\u00a3' + fmtNum(s.outstanding || 0);
      }
    }).catch(function() { /* auth expired — using demo data */ });
  }

  var user = STATE.user||DEMO_USER;
  var greeting = getGreeting();
  var totalRev = PROJECTS.filter(function(p){return p.status!=='cancelled';}).reduce(function(s,p){return s+p.value;},0);
  var activeProj = PROJECTS.filter(function(p){return p.status==='active';}).length;
  var totalInvd = INVOICES.reduce(function(s,i){return s+i.amount;},0);
  var outstanding = INVOICES.filter(function(i){return i.status==='sent'||i.status==='overdue';}).reduce(function(s,i){return s+i.amount;},0);
  var overdueCount = INVOICES.filter(function(i){return i.status==='overdue';}).length;
  var draftCount = INVOICES.filter(function(i){return i.status==='draft';}).length;
  var openQuotes = TENDERS.filter(function(t){return t.status==='open'||t.status==='submitted';}).length;
  var certAlerts = 0;
  ENGINEERS.forEach(function(e){if(e.active!==false)(e.certs||[]).forEach(function(c){var s=certStatus(c.expiry);if(s.days<90)certAlerts++;});});

  var content = document.getElementById('dash-content');
  content.innerHTML = '';
  content.innerHTML += '<div style="margin-bottom:1.5rem"><div style="font-size:1.2rem;font-weight:700;letter-spacing:-.02em">'+greeting+', '+user.fname+'.</div><div style="font-size:.82rem;color:var(--off3);margin-top:.15rem">Here\'s your business snapshot — '+(new Date()).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+'.</div></div>';

  /* ── AI Quote Builder CTA Card ──────────────────────────── */
  content.innerHTML += '<div class="dash-ai-cta" onclick="openModal(\'modal-qb-upload\')">'
    + '<div class="dash-ai-cta-top">'
    + '<div class="dash-ai-cta-icon">\uD83E\uDDE0</div>'
    + '<div><h3>AI Quote Builder <span>→</span></h3>'
    + '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off4);margin-top:.15rem">Drop a PDF spec. Get a priced quote. 3 minutes.</div></div>'
    + '</div>'
    + '<p>Upload a specification, BoQ, or enquiry pack — the AI extracts NBS references, quantities, and rates into a structured quote you can review, edit, and send.</p>'
    + '<div class="dash-ai-cta-steps">'
    + '<div class="dash-ai-cta-step"><span class="step-num">1</span> Upload PDF</div>'
    + '<div class="dash-ai-cta-step"><span class="step-num">2</span> AI extracts scope</div>'
    + '<div class="dash-ai-cta-step"><span class="step-num">3</span> Review &amp; confirm</div>'
    + '<div class="dash-ai-cta-step"><span class="step-num">4</span> Quote saved to Quote Book</div>'
    + '</div>'
    + '<button class="dash-ai-cta-btn" onclick="event.stopPropagation();openModal(\'modal-qb-upload\')">Upload a spec &amp; build a quote \u2192</button>'
    + '</div>';

  /* ── Focus / Full toggle bar ─────────────────────────────── */
  var _fm = STATE.dashMode === 'focus';
  content.innerHTML += '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem">'
    + '<button class="btn btn-sm '+(_fm?'btn-primary':'btn-dark')+'" onclick="STATE.dashMode=\'focus\';renderDashHome()" style="font-size:.72rem;padding:.3rem .75rem;border-radius:20px">Focus View</button>'
    + '<button class="btn btn-sm '+(!_fm?'btn-primary':'btn-dark')+'" onclick="STATE.dashMode=\'full\';renderDashHome()" style="font-size:.72rem;padding:.3rem .75rem;border-radius:20px">Full Dashboard</button>'
    + '</div>';
  content.innerHTML += '<div style="font-size:.72rem;color:var(--off4);margin-bottom:1.4rem">Focus View shows your 3 highest-priority actions today</div>';

  /* ── Focus Mode: 3-card "Today\'s Priorities" ──────────── */
  if (STATE.dashMode === 'focus') {
    var _today = new Date(); _today.setHours(0,0,0,0);
    var _dayMs = 864e5;

    /* Card 1 — Quotes to Follow Up */
    var _fQuotes = TENDERS.filter(function(t){ return t.status==='open'||t.status==='submitted'; })
      .sort(function(a,b){ return (a.enquiry||'').localeCompare(b.enquiry||''); })
      .slice(0,5);
    var _fqHtml = '<div class="card" style="border-left:3px solid var(--orange)">'
      + '<div class="card-header"><span class="card-title" style="color:var(--orange)">' + ICON.fire + ' Quotes to Follow Up</span>'
      + '<span style="font-family:var(--mono);font-size:.7rem;color:var(--off4)">'+_fQuotes.length+' active</span></div>';
    if (_fQuotes.length) {
      _fqHtml += '<div style="display:flex;flex-direction:column;gap:.45rem">';
      _fQuotes.forEach(function(t){
        var _sent = t.submitted ? new Date(t.submitted) : (t.enquiry ? new Date(t.enquiry) : null);
        var _days = _sent ? Math.max(0, Math.floor((_today - _sent) / _dayMs)) : '—';
        var _cName = (CLIENTS.find(function(c){return c.id===t.client;})||{}).name || t.clientName || '';
        _fqHtml += '<div style="display:flex;align-items:center;gap:.7rem;padding:.55rem .7rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px">'
          + '<div style="flex:1;min-width:0"><div style="font-size:.8rem;font-weight:600;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+t.name+'</div>'
          + '<div style="font-size:.7rem;color:var(--off3);margin-top:.1rem;font-family:var(--mono)">'+_cName+' · £'+fmtNum(t.value)+' · '+_days+'d since sent</div></div>'
          + '<button class="btn btn-sm" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.2);white-space:nowrap;font-size:.7rem" '
          + 'onclick="showToast(\'Follow-up logged for '+t.name.replace(/'/g,"\\'")+'\',\'success\')">Chase →</button></div>';
      });
      _fqHtml += '</div>';
    } else { _fqHtml += '<div style="padding:1rem;font-size:.8rem;color:var(--off4)">No open or submitted quotes right now.</div>'; }
    _fqHtml += '<div style="padding:.6rem .7rem 0;border-top:1px solid var(--border);margin-top:.6rem"><a style="font-size:.72rem;color:var(--orange);cursor:pointer" onclick="dashNav(\'tenders\')">View all quotes →</a></div></div>';

    /* Card 2 — Overdue Invoices */
    var _fInvs = INVOICES.filter(function(i){
      if (i.status==='overdue') return true;
      if (i.status==='sent' && i.due) { var d=new Date(i.due); d.setHours(0,0,0,0); return d < _today; }
      return false;
    });
    var _fiHtml = '<div class="card" style="border-left:3px solid var(--red)">'
      + '<div class="card-header"><span class="card-title" style="color:var(--red)">' + ICON.alert + ' Overdue Invoices</span>'
      + '<span style="font-family:var(--mono);font-size:.7rem;color:var(--off4)">'+_fInvs.length+' overdue</span></div>';
    if (_fInvs.length) {
      _fiHtml += '<div style="display:flex;flex-direction:column;gap:.45rem">';
      _fInvs.forEach(function(inv){
        var _dueD = new Date(inv.due); _dueD.setHours(0,0,0,0);
        var _overDays = Math.max(0, Math.floor((_today - _dueD) / _dayMs));
        _fiHtml += '<div style="display:flex;align-items:center;gap:.7rem;padding:.55rem .7rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px">'
          + '<div style="flex:1;min-width:0"><div style="font-size:.8rem;font-weight:600;color:var(--white)">'+inv.ref+'</div>'
          + '<div style="font-size:.7rem;color:var(--off3);margin-top:.1rem;font-family:var(--mono)">'+inv.clientName+' · £'+fmtNum(inv.amount)+' · <span style="color:var(--red)">'+_overDays+'d overdue</span></div></div>'
          + '<button class="btn btn-sm" style="background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.2);white-space:nowrap;font-size:.7rem" '
          + 'onclick="showToast(\'Payment reminder sent for '+inv.ref+'\',\'success\')">Send Reminder →</button></div>';
      });
      _fiHtml += '</div>';
    } else { _fiHtml += '<div style="padding:1rem;font-size:.8rem;color:var(--off4)">No overdue invoices — nice work.</div>'; }
    _fiHtml += '<div style="padding:.6rem .7rem 0;border-top:1px solid var(--border);margin-top:.6rem"><a style="font-size:.72rem;color:var(--red);cursor:pointer" onclick="dashNav(\'invoices\')">View all invoices →</a></div></div>';

    /* Card 3 — Cert Expiries This Month */
    var _30d = new Date(_today.getTime() + 30 * _dayMs);
    var _certRows = [];
    ENGINEERS.forEach(function(e){
      if (e.active === false) return;
      (e.certs||[]).forEach(function(c){
        var _exp = new Date(c.expiry); _exp.setHours(0,0,0,0);
        if (_exp <= _30d) _certRows.push({eng:e, cert:c, expDate:_exp});
      });
    });
    _certRows.sort(function(a,b){ return a.expDate - b.expDate; });
    var _fcHtml = '<div class="card" style="border-left:3px solid var(--yellow)">'
      + '<div class="card-header"><span class="card-title" style="color:var(--yellow)">⚠️ Cert Expiries This Month</span>'
      + '<span style="font-family:var(--mono);font-size:.7rem;color:var(--off4)">'+_certRows.length+' alert'+ (_certRows.length!==1?'s':'')+'</span></div>';
    if (_certRows.length) {
      _fcHtml += '<div style="display:flex;flex-direction:column;gap:.45rem">';
      _certRows.forEach(function(r){
        var _isExpired = r.expDate < _today;
        _fcHtml += '<div style="display:flex;align-items:center;gap:.7rem;padding:.55rem .7rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px">'
          + '<div style="flex:1;min-width:0"><div style="font-size:.8rem;font-weight:600;color:var(--white)">'+r.eng.name+'</div>'
          + '<div style="font-size:.7rem;color:var(--off3);margin-top:.1rem;font-family:var(--mono)">'+r.cert.name+' · <span style="color:'+(_isExpired?'var(--red)':'var(--yellow)')+'">'+(_isExpired?'Expired ':'Expires ')+fmtDate(r.cert.expiry)+'</span></div></div>'
          + '<button class="btn btn-sm" style="background:rgba(250,204,21,.1);color:var(--yellow);border:1px solid rgba(250,204,21,.2);white-space:nowrap;font-size:.7rem" '
          + 'onclick="openEngineerModal(\''+r.eng.id+'\')">Renew →</button></div>';
      });
      _fcHtml += '</div>';
    } else { _fcHtml += '<div style="padding:1rem;font-size:.8rem;color:var(--off4)">All certs up to date for the next 30 days.</div>'; }
    _fcHtml += '<div style="padding:.6rem .7rem 0;border-top:1px solid var(--border);margin-top:.6rem"><a style="font-size:.72rem;color:var(--yellow);cursor:pointer" onclick="dashNav(\'engineers\')">View all engineers →</a></div></div>';

    /* ── Getting Started checklist ─────────────────────────── */
    if (typeof CLIENTS !== 'undefined' && CLIENTS.length > 0) STATE.setupSteps.addClient = true;
    checkSetupProgress();

    if (!STATE.setupComplete) {
      var _ss = STATE.setupSteps;
      var _doneCount = [_ss.addClient, _ss.addQuote, _ss.addProject, _ss.addEngineer, _ss.raiseInvoice].filter(Boolean).length;
      var _pct = Math.round((_doneCount / 5) * 100);

      var _steps = [
        {key:'addClient',    title:'Add your first client',    desc:'Your clients power quotes, projects and invoices', cta:'Add Client →',    action:'openClientModal(null)'},
        {key:'addQuote',     title:'Create your first quote',  desc:'Use the AI builder or create manually',            cta:'Create Quote →',  action:'renderCreateQuoteForm()'},
        {key:'addProject',   title:'Set up a project',         desc:'Track costs, programme, and documents in one place',cta:'Add Project →',   action:'dashNav(\"projects\");setTimeout(function(){openTradeModal(null)},200)'},
        {key:'addEngineer',  title:'Add an engineer',          desc:'Track certs, schedule work, stay compliant',       cta:'Add Engineer →',  action:'openEngineerModal(null)'},
        {key:'raiseInvoice', title:'Raise your first invoice', desc:'Get paid — raise an invoice from any project',     cta:'Raise Invoice →', action:'prefillInvoice(null)'}
      ];

      var _gsHtml = '<div class="card" style="border:1.5px solid var(--border);margin-bottom:1.2rem">'
        + '<div class="card-header" style="flex-direction:column;align-items:flex-start;gap:.6rem">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;width:100%">'
        + '<span class="card-title">' + ICON.rocket + ' Set up your account</span>'
        + '<span style="font-family:var(--mono);font-size:.72rem;color:var(--off3)">'+_doneCount+'/5 complete</span></div>'
        + '<div style="width:100%;height:6px;background:var(--bg4);border-radius:3px;overflow:hidden">'
        + '<div style="height:100%;width:'+_pct+'%;background:var(--orange);border-radius:3px;transition:width .4s ease"></div></div>'
        + '</div>'
        + '<div style="font-size:.78rem;color:var(--off3);padding:0 .9rem;margin-bottom:.6rem;line-height:1.55">'
        + 'Complete these 5 steps to unlock the full power of CONTRAQ — takes about 8 minutes total</div>'
        + '<div style="display:flex;flex-direction:column;gap:.35rem;padding:0 .9rem .9rem">';

      _steps.forEach(function(st) {
        var _done = _ss[st.key];
        _gsHtml += '<div style="display:flex;align-items:center;gap:.7rem;padding:.55rem .65rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px'
          + (_done ? ';opacity:.65' : '') + '">'
          + '<div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'
          + (_done ? 'background:rgba(163,230,53,.15);border:2px solid var(--lime)' : 'border:2px solid var(--border)') + '">'
          + (_done ? '<span style="color:var(--lime);font-size:.65rem;font-weight:700">✓</span>' : '') + '</div>'
          + '<div style="flex:1;min-width:0"><div style="font-size:.8rem;font-weight:600;color:var(--white)'
          + (_done ? ';text-decoration:line-through;opacity:.7' : '') + '">' + st.title + '</div>'
          + '<div style="font-size:.7rem;color:var(--off4);margin-top:.1rem">' + st.desc + '</div></div>'
          + '<button class="btn btn-xs ' + (_done ? 'btn-dark' : 'btn-primary') + '" onclick="' + st.action + '"'
          + (_done ? ' disabled style="opacity:.5"' : '') + '>' + st.cta + '</button></div>';
      });
      _gsHtml += '</div></div>';
      content.innerHTML += _gsHtml;

    } else {
      /* All done — success card */
      content.innerHTML += '<div class="card" style="border-left:3px solid var(--lime);margin-bottom:1.2rem;padding:1.2rem">'
        + '<div style="font-size:.95rem;font-weight:700;color:var(--white);margin-bottom:.35rem">✅ You\'re all set up</div>'
        + '<div style="font-size:.8rem;color:var(--off3);margin-bottom:.8rem;line-height:1.55">Your account is fully configured. Switch to Full Dashboard to see everything.</div>'
        + '<button class="btn btn-primary btn-sm" onclick="STATE.dashMode=\'full\';renderDashHome()">View Full Dashboard →</button></div>';
    }

    /* Render Focus grid */
    content.innerHTML += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem">'+_fqHtml+_fiHtml+_fcHtml+'</div>';

    updateSidebarBadges(overdueCount, draftCount);
    buildNotifPanel();
    return;
  }

  /* ── Full Dashboard (unchanged below) ─────────────────── */

  // KPIs
  content.innerHTML += '<div class="kpi-grid">'
    + kpiCard('Contract Pipeline','£'+fmtNum(totalRev),'↑ 12% vs last month','up',{background:'var(--lime)'},null)
    + kpiCard('Active Projects',activeProj,''+PROJECTS.filter(function(p){return p.status==='pending';}).length+' pending · '+openQuotes+' open quotes','up',{background:'var(--orange)'},null)
    + kpiCard('Total Invoiced','£'+fmtNum(totalInvd),overdueCount+' overdue · '+draftCount+' draft',overdueCount>0?'dn':'up',{background:'var(--blue)'},null)
    + kpiCard('Outstanding','£'+fmtNum(outstanding),'Across '+INVOICES.filter(function(i){return i.status==='sent'||i.status==='overdue';}).length+' invoices','dn',{background:'var(--yellow)'},null)
    + '</div>';

  // KB Score card (populated async for real users)
  content.innerHTML += '<div id="kb-score-card" style="margin-bottom:1rem"></div>';
  if (typeof ContraqAPI !== 'undefined' && ContraqAPI.isRealUser()) {
    ContraqAPI.getLearnedRules().then(function(rules) {
      var kbScoreEl = document.getElementById('kb-score-card');
      if (!kbScoreEl) return;
      var count = rules ? rules.length : 0;
      var accuracy = count > 10 ? '89' : count > 5 ? '82' : count > 0 ? '75' : '\u2014';
      kbScoreEl.innerHTML = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.2rem;">'
        + '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#717171;margin-bottom:4px;">AI Knowledge Score</div>'
        + '<div style="font-size:28px;font-weight:800;color:#0B1E3E;">' + count + ' <span style="font-size:13px;font-weight:500;color:#717171;">rules learned</span></div>'
        + '<div style="font-size:12px;color:#2E7D32;margin-top:4px;">Est. accuracy: ' + accuracy + '%</div>'
        + '<div style="font-size:11px;color:#9CA3AF;margin-top:2px;">The more you correct, the smarter AI gets</div>'
        + '</div>';
    }).catch(function() {});
  }

  // Alert strip
  var alerts = [];
  if (overdueCount) alerts.push('<span style="color:var(--red)">⚠ '+overdueCount+' overdue invoice'+(overdueCount>1?'s':'')+'</span>');
  if (certAlerts) alerts.push('<span style="color:var(--yellow)">⚠ '+certAlerts+' cert'+(certAlerts>1?'s':'')+' expiring soon</span>');
  var pendingPOs = PO_REGISTER.filter(function(p){return p.status==='pending';}).length;
  if (pendingPOs) alerts.push('<span style="color:var(--off3)">' + ICON.package + ' '+pendingPOs+' PO'+(pendingPOs>1?'s':'')+' pending</span>');
  if (alerts.length) {
    content.innerHTML += '<div style="background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.15);border-radius:8px;padding:.65rem 1rem;font-size:.78rem;display:flex;gap:1.4rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem">'
      +'<span style="font-weight:600;color:var(--white);font-size:.72rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.08em">Alerts</span>'
      +alerts.join('')
      +'<a style="margin-left:auto;color:var(--orange);cursor:pointer;font-size:.72rem" onclick="toggleNotifPanel()">View all →</a>'
      +'</div>';
  }

  // CIS Countdown widget
  var cisAlertHtml = buildCISCountdownWidget();
  if (cisAlertHtml) content.innerHTML += cisAlertHtml;

  // ECO4 Compliance Status widget
  var eco4WidgetHtml = buildECO4StatusWidget();
  if (eco4WidgetHtml) content.innerHTML += eco4WidgetHtml;

  // Invoice Prompt widget
  var unbilledProjects = PROJECTS.filter(function(p){
    if (p.status==='cancelled') return false;
    var unbillable = p.billedToDate !== undefined ? (p.value * 0.6 - p.billedToDate) : 0;
    return unbillable > 5000;
  });
  if (unbilledProjects.length) {
    var promptHtml = '<div class="inv-prompt-widget">';
    promptHtml += '<div class="inv-prompt-header"><span class="inv-prompt-icon">' + ICON.bulb + '</span><span class="inv-prompt-title">Invoice Prompts</span><span class="inv-prompt-sub">'+unbilledProjects.length+' project'+(unbilledProjects.length>1?'s':'')+' with unbilled amounts</span></div>';
    unbilledProjects.slice(0,3).forEach(function(p){
      var unbilled = Math.round(p.value * 0.6 - (p.billedToDate||0));
      var lastInv = p.lastInvoiceDate ? fmtDate(p.lastInvoiceDate) : 'Never invoiced';
      promptHtml += '<div class="inv-prompt-row">'
        + '<div class="inv-prompt-proj"><div class="inv-prompt-proj-name">'+p.name+'</div><div class="inv-prompt-proj-meta">Last: '+lastInv+' · '+p.clientName+'</div></div>'
        + '<span class="inv-prompt-amt">£'+fmtNum(unbilled)+' unbilled</span>'
        + '<button class="btn btn-sm" style="background:rgba(163,230,53,.1);color:var(--lime);border:1px solid rgba(163,230,53,.2);white-space:nowrap" onclick="prefillInvoice(\''+p.id+'\')">Raise →</button>'
        + '</div>';
    });
    promptHtml += '</div>';
    content.innerHTML += promptHtml;
  }

  // Charts row
  content.innerHTML += '<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:1rem;margin-bottom:1.2rem"><div class="card"><div class="card-header"><span class="card-title">Revenue — last 6 months</span></div><div class="chart-wrap"><canvas id="rev-chart"></canvas></div></div><div class="card"><div class="card-header"><span class="card-title">Project status</span></div><div class="chart-wrap"><canvas id="status-chart"></canvas></div></div></div>';

  // Bottom two-col: activity + quick links — build as ONE string to avoid innerHTML += grid bug
  var actHtml = '<div class="card"><div class="card-header"><span class="card-title">Recent activity</span></div><div class="activity-feed">';
  actHtml += ACTIVITY_LOG.slice(0,6).map(function(a){
    return '<div class="activity-item" style="cursor:pointer" onclick="dashNav(\''+a.panel+'\')">'
      +'<div class="activity-icon" style="background:'+a.iconBg+'">'+a.icon+'</div>'
      +'<div class="activity-body"><div class="activity-text">'+a.text+'</div><div class="activity-time">'+a.time+'</div></div>'
      +'</div>';
  }).join('');
  actHtml += '</div></div>';

  var isEstimating = (typeof contraqMode !== 'undefined' && contraqMode === 'estimating') || true;
  if (typeof contraqMode !== 'undefined') { isEstimating = contraqMode === 'estimating'; }

  var qa = isEstimating ? [
    {icon:'\uD83E\uDDE0',label:'AI Quote Builder',action:"openModal('modal-qb-upload')",highlight:true},
    {icon:'\uD83D\uDCD0',label:'Drawing Analyser',action:"openDrawingAnalyser()",highlight2:true},
    {icon:'\uD83D\uDCDC',label:'Spec Reader',action:"openSpecReader()",highlight2:true},
    {icon:'\u2696\uFE0F',label:'Takeoff Consolidator',action:"openTakeoffConsolidator()",highlight2:true},
    {icon:'\uD83D\uDD04',label:'Feedback Loop',action:"openFeedbackLoop()",highlight2:true},
    {icon:'\uD83D\uDCCB',label:'New quote (manual)',action:"openTenderModal(null)"},
    {icon:'\uD83D\uDC65',label:'Add client',action:"openClientModal(null)"},
    {icon:'\uD83C\uDFD7\uFE0F',label:'New project',action:"openTradeModal(null)"},
  ] : [
    {icon:'\uD83C\uDFD7\uFE0F',label:'New project',action:"openTradeModal(null)"},
    {icon:'\uD83E\uDDFE',label:'Raise invoice',action:"prefillInvoice(PROJECTS[0]?PROJECTS[0].id:'')"},
    {icon:'\uD83D\uDCE6',label:'Create PO',action:"openPOModal(null)"},
    {icon:'\uD83D\uDC65',label:'Add client',action:"openClientModal(null)"},
    {icon:'\uD83D\uDCC8',label:'P&L',action:"dashNav('finance')"},
    {icon:'\uD83D\uDCCB',label:'New quote (manual)',action:"openTenderModal(null)"},
    {icon:'\uD83D\uDC77',label:'Add engineer',action:"openEngineerModal(null)"},
    {icon:'\uD83D\uDCE6',label:'Procurement',action:"dashNav('procurement')"},
  ];

  /* ── AI Platform Tools Card ───────────────────────────── */
  var API_BASE = CONTRAQ_API_BASE;
  var aiTools = [
    {icon:'\uD83D\uDCC0',label:'Full Quote Pipeline',desc:'Upload drawings + specs, extract, consolidate, price — end-to-end',url:API_BASE+'/quote-builder',accent:'#f97316'},
    {icon:'\uD83D\uDCB0',label:'Pricing Panel',desc:'Price a takeoff with rate libraries, overheads, and CSV export',url:API_BASE+'/pricing',accent:'#3B6D11'},
    {icon:'\u2699\uFE0F',label:'KB Admin Dashboard',desc:'Manage learned rules, pattern errors, and KB sections',url:API_BASE+'/admin/kb',accent:'#185FA5'},
  ];
  var aiToolsHtml = '<div class="card" style="margin-bottom:1.2rem;border:1.5px solid rgba(96,165,250,.2)">'
    + '<div class="card-header" style="flex-direction:column;align-items:flex-start;gap:.4rem">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;width:100%">'
    + '<span class="card-title">\uD83D\uDE80 AI Estimation Platform</span>'
    + '<span style="font-family:var(--mono);font-size:.55rem;background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.25);border-radius:3px;padding:.12rem .4rem;">KB v7.2</span></div>'
    + '<div style="font-size:.72rem;color:var(--off3);">Full-page tools powered by the M&E Knowledge Base — open in new tab</div></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6rem;padding:.2rem 0">'
    + aiTools.map(function(t){
        return '<a href="'+t.url+'" target="_blank" rel="noopener" style="text-decoration:none;display:flex;flex-direction:column;gap:.35rem;padding:.75rem .85rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;cursor:pointer;transition:all .15s" onmouseenter="this.style.borderColor=\''+t.accent+'\';this.style.boxShadow=\'0 2px 12px '+t.accent+'22\'" onmouseleave="this.style.borderColor=\'var(--border)\';this.style.boxShadow=\'none\'">'
          + '<div style="display:flex;align-items:center;gap:.45rem;"><span style="font-size:1.1rem">'+t.icon+'</span><span style="font-size:.82rem;font-weight:600;color:'+t.accent+'">'+t.label+'</span></div>'
          + '<div style="font-size:.66rem;color:var(--off3);line-height:1.4;">'+t.desc+'</div>'
          + '<div style="font-family:var(--mono);font-size:.5rem;color:var(--off4);margin-top:auto;">Opens in new tab \u2192</div>'
          + '</a>';
      }).join('')
    + '</div></div>';
  var quickHtml = '<div class="card"><div class="card-header"><span class="card-title">Quick actions</span></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;padding:.2rem 0">'
    + qa.map(function(q){
        if (q.highlight) {
          return '<div onclick="'+q.action+'" style="display:flex;align-items:center;gap:.55rem;padding:.6rem .75rem;background:linear-gradient(135deg,rgba(249,115,22,.1),rgba(234,88,12,.05));border:1.5px solid rgba(249,115,22,.3);border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:600;color:var(--orange);transition:all .15s" onmouseenter="this.style.borderColor=\'var(--orange)\';this.style.boxShadow=\'0 2px 12px rgba(249,115,22,.15)\'" onmouseleave="this.style.borderColor=\'rgba(249,115,22,.3)\';this.style.boxShadow=\'none\'">'
            +'<span style="font-size:1rem">'+q.icon+'</span>'+q.label+' <span style="font-family:var(--mono);font-size:.5rem;padding:.12rem .35rem;border-radius:3px;background:rgba(249,115,22,.15);margin-left:auto">PDF \u2192 QUOTE</span></div>';
        }
        if (q.highlight2) {
          return '<div onclick="'+q.action+'" style="display:flex;align-items:center;gap:.55rem;padding:.6rem .75rem;background:linear-gradient(135deg,rgba(96,165,250,.1),rgba(59,130,246,.05));border:1.5px solid rgba(96,165,250,.3);border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:600;color:#60a5fa;transition:all .15s" onmouseenter="this.style.borderColor=\'#60a5fa\';this.style.boxShadow=\'0 2px 12px rgba(96,165,250,.15)\'" onmouseleave="this.style.borderColor=\'rgba(96,165,250,.3)\';this.style.boxShadow=\'none\'">'
            +'<span style="font-size:1rem">'+q.icon+'</span>'+q.label+' <span style="font-family:var(--mono);font-size:.5rem;padding:.12rem .35rem;border-radius:3px;background:rgba(96,165,250,.15);margin-left:auto">KB v5.1</span></div>';
        }
        return '<div onclick="'+q.action+'" style="display:flex;align-items:center;gap:.55rem;padding:.6rem .75rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:500;transition:border-color .12s" onmouseenter="this.style.borderColor=\'var(--orange)\'" onmouseleave="this.style.borderColor=\'var(--border)\'">'
          +'<span style="font-size:1rem">'+q.icon+'</span>'+q.label+'</div>';
      }).join('')
    + '</div></div>';

  // Render as one complete grid string
  content.innerHTML += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.2rem">'+actHtml+quickHtml+'</div>';

  // AI Platform tools (full-page tools in new tabs) — estimating mode only
  if (isEstimating) { content.innerHTML += aiToolsHtml; }

  // Recent invoices + projects
  content.innerHTML += '<div class="card"><div class="card-header"><span class="card-title">Recent invoices</span><button class="btn btn-dark btn-xs" onclick="dashNav(\'invoices\')">View all →</button></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Ref</th><th>Client</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody id="dash-inv-tbody"></tbody></table></div></div>';
  content.innerHTML += '<div class="card"><div class="card-header"><span class="card-title">Active projects</span><button class="btn btn-dark btn-xs" onclick="dashNav(\'projects\')">View all →</button></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Code</th><th>Project</th><th>Client</th><th>Value</th><th>Status</th><th></th></tr></thead><tbody id="dash-proj-tbody"></tbody></table></div></div>';

  // Empty state for real orgs (no demo data)
  if (!STATE.demoMode && PROJECTS.length === 0 && INVOICES.length === 0) {
    content.innerHTML += '<div class="card" style="text-align:center;padding:2rem 1.5rem">'
      + '<div style="font-size:2rem;margin-bottom:.5rem">&#x1F680;</div>'
      + '<div style="font-size:1.05rem;font-weight:700;color:var(--white);margin-bottom:.4rem">Welcome to Contraq</div>'
      + '<div style="font-size:.82rem;color:var(--off3);line-height:1.5;max-width:400px;margin:0 auto .8rem">'
      + 'Your workspace is ready. Start by creating your first quote using the <strong style="color:var(--orange)">AI Quote Builder</strong> in the sidebar, or add a project manually.'
      + '</div>'
      + '<div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">'
      + '<button class="btn btn-primary btn-sm" onclick="openModal(\'modal-qb-upload\')">AI Quote Builder</button>'
      + '<button class="btn btn-dark btn-sm" onclick="dashNav(\'projects\')">Add Project</button>'
      + '<button class="btn btn-dark btn-sm" onclick="dashNav(\'clients\')">Add Client</button>'
      + '</div></div>';
  }

  var invTbody = document.getElementById('dash-inv-tbody');
  if (invTbody) invTbody.innerHTML = INVOICES.slice(0,5).map(function(inv){
    return '<tr><td class="mono">'+inv.ref+'</td><td class="strong">'+inv.clientName+'</td><td class="mono">£'+fmtNum(inv.amount)+'</td><td class="mono"'+(inv.status==='overdue'?' style="color:var(--red)"':'')+'>'+fmtDate(inv.due)+'</td><td>'+badge(inv.status)+'</td><td><button class="btn btn-dark btn-xs" onclick="openInvoiceModal(\''+inv.id+'\')">Edit</button></td></tr>';
  }).join('');

  var projTbody = document.getElementById('dash-proj-tbody');
  if (projTbody) projTbody.innerHTML = PROJECTS.filter(function(p){return p.status!=='cancelled';}).slice(0,5).map(function(proj){
    return '<tr><td class="mono">'+proj.code+'</td><td class="strong">'+proj.name+'</td><td>'+proj.clientName+'</td><td class="mono">£'+fmtNum(proj.value)+'</td><td>'+badge(proj.status)+'</td><td><button class="btn btn-dark btn-xs" onclick="openProjectDetail(\''+proj.id+'\')">View</button></td></tr>';
  }).join('');

  requestAnimationFrame(function(){ renderRevenueChart(); renderStatusChart(); });

  // Update sidebar badges
  updateSidebarBadges(overdueCount, draftCount);
  buildNotifPanel();

  // Show trial countdown banner for real orgs in last 5 days
  if (typeof showTrialBanner === 'function') showTrialBanner();
}

function updateSidebarBadges(overdueCount, draftCount) {
  var invBadge = document.getElementById('sb-badge-invoices');
  if (invBadge) { var n=(overdueCount||0)+(draftCount||0); invBadge.textContent=n; invBadge.style.display=n?'':'none'; }
  var tBadge = document.getElementById('sb-badge-tenders');
  if (tBadge) { var tn=TENDERS.filter(function(t){return t.status==='open'||t.status==='submitted';}).length; tBadge.textContent=tn; tBadge.style.display=tn?'':'none'; }
  var engBadge = document.getElementById('sb-badge-engineers');
  if (engBadge) { var en=0; ENGINEERS.forEach(function(e){if(e.active!==false)(e.certs||[]).forEach(function(c){var s=certStatus(c.expiry);if(s.days<90)en++;});}); engBadge.textContent=en; engBadge.style.display=en?'':'none'; }
  var mBadge = document.getElementById('sb-badge-measures');
  if (mBadge) { mBadge.style.display='none'; } // optional: show count
}


function roiBanner(panelName, icon, headline, sub) {
  if (STATE.roiDismissed[panelName]) return '';
  return '<div style="background:rgba(249,115,22,.05);border:1.5px solid var(--border);border-left:3px solid var(--orange);border-radius:var(--radius2);padding:.85rem 1rem;margin-bottom:1.2rem;display:flex;align-items:flex-start;gap:.75rem;position:relative">'
    + '<span style="font-size:1.5rem;line-height:1;flex-shrink:0">'+icon+'</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:.85rem;font-weight:700;color:var(--white);line-height:1.35">'+headline+'</div>'
    + '<div style="font-size:.76rem;color:var(--off3);line-height:1.55;margin-top:.2rem">'+sub+'</div></div>'
    + '<button onclick="STATE.roiDismissed[\''+panelName+'\']=true;dashNav(\''+panelName+'\')" style="position:absolute;top:.55rem;right:.65rem;background:none;border:none;color:var(--off4);cursor:pointer;font-size:.85rem;padding:0;line-height:1" title="Dismiss">✕</button>'
    + '</div>';
}

function kpiCard(label, val, delta, dir, colorStyle, icon) {
  var cssColor = colorStyle && colorStyle.background ? colorStyle.background : 'var(--orange)';
  return '<div class="kpi" style="--kc:'+cssColor+'">'
    + '<div class="kpi-label">'+label+'</div>'
    + '<div class="kpi-val">'+val+'</div>'
    + (delta?'<div class="kpi-delta delta-'+(dir==='up'?'up':'dn')+'">'+(dir==='up'?'↑':'↓')+' '+delta+'</div>':'')
    + '</div>';
}

function renderRevenueChart() {
  if (typeof Chart === 'undefined') return;
  var ctx = document.getElementById('rev-chart');
  if (!ctx) return;
  if (STATE.revenueChart) { try{STATE.revenueChart.destroy();}catch(e){} STATE.revenueChart=null; }
  STATE.revenueChart = new Chart(ctx, {
    type:'line',
    data:{
      labels:['Oct','Nov','Dec','Jan','Feb','Mar'],
      datasets:[{
        label:'Revenue (£k)',
        data:[142,168,195,220,258,284],
        borderColor:'#f97316',
        backgroundColor:'rgba(249,115,22,.08)',
        borderWidth:2,
        tension:0.4,
        fill:true,
        pointBackgroundColor:'#f97316',
        pointRadius:4,
        pointHoverRadius:6
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{color:'rgba(46,51,59,.6)'},ticks:{color:'#8a9099',font:{size:10}}},
        y:{grid:{color:'rgba(46,51,59,.6)'},ticks:{color:'#8a9099',font:{size:10},callback:function(v){return '£'+v+'k';}}}
      }
    }
  });
}

function renderStatusChart() {
  if (typeof Chart === 'undefined') return;
  var ctx = document.getElementById('status-chart');
  if (!ctx) return;
  var active=PROJECTS.filter(function(p){return p.status==='active';}).length;
  var pending=PROJECTS.filter(function(p){return p.status==='pending';}).length;
  var completed=PROJECTS.filter(function(p){return p.status==='completed';}).length;
  new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Active','Pending','Completed'],
      datasets:[{data:[active,pending,completed],backgroundColor:['#f97316','#fbbf24','#a3e635'],borderWidth:0,hoverOffset:4}]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{color:'#8a9099',font:{size:10},padding:12}}}
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   TENDERS
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   QUOTE / ESTIMATE BOOK (v6)
══════════════════════════════════════════════════════════════ */
