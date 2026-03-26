/* ═══ CONTRAQ — DEMO_BG ═══
   DEMO_SCREENS vars, renderDemoPane, startDemoBgCycle, initScrollReveals, animateCount, hero live updates
   Lines 18198-18551 from contraq-v77
═══════════════════════════════════════════ */

var DEMO_SCREENS_TOP = [
  {
    title:'CONTRAQ — Dashboard', active:0,
    html:function(){
      return '<div class="ds-panel ds-kpi-row">'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">£1.4M</div><div class="ds-kl">Pipeline</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--orange)">7</div><div class="ds-kl">Active Jobs</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv">£304k</div><div class="ds-kl">Invoiced MTD</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--yellow)">£93k</div><div class="ds-kl">Outstanding</div></div>'
        +'</div>'
        +'<div class="ds-table"><div class="ds-thead"><span>Project</span><span>Client</span><span>Value</span><span>Status</span></div>'
        +'<div class="ds-tr hl"><span>Canary Wharf — Insulation</span><span>Aecom</span><span>£284k</span><span><span class="ds-badge g">Active</span></span></div>'
        +'<div class="ds-tr"><span>Wembley — Ductwork</span><span>Balfour</span><span>£194k</span><span><span class="ds-badge o">On site</span></span></div>'
        +'<div class="ds-tr"><span>Euston HVAC Upgrade</span><span>Morgan</span><span>£320k</span><span><span class="ds-badge b">Tendered</span></span></div>'
        +'<div class="ds-tr"><span>Canary Wharf Fire Stopping</span><span>Mace</span><span>£94k</span><span><span class="ds-badge y">Draft</span></span></div>'
        +'</div>'
        +'<div class="ds-chart-row">'
        +'<div class="ds-chart"><div class="ds-chart-title">Revenue by month</div><div class="ds-bars" id="dbars-t1"></div></div>'
        +'<div class="ds-activity"><div class="ds-act-title">Recent activity</div>'
        +'<div class="ds-act-item"><div class="ds-act-dot" style="background:var(--lime)"></div><span class="ds-act-text">INV-0047 paid — £24,400</span><span class="ds-act-time">2m</span></div>'
        +'<div class="ds-act-item"><div class="ds-act-dot" style="background:var(--orange)"></div><span class="ds-act-text">Tender T-019 won</span><span class="ds-act-time">1h</span></div>'
        +'<div class="ds-act-item"><div class="ds-act-dot" style="background:var(--blue)"></div><span class="ds-act-text">PO-INS-004 delivered</span><span class="ds-act-time">3h</span></div>'
        +'</div></div>';
    }
  },
  {
    title:'CONTRAQ — Tenders', active:1,
    html:function(){
      return '<div class="ds-panel ds-kpi-row">'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">62%</div><div class="ds-kl">Win rate</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--orange)">5</div><div class="ds-kl">Open</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv">£1.9M</div><div class="ds-kl">Pipeline</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--yellow)">3</div><div class="ds-kl">Chase now</div></div>'
        +'</div>'
        +'<div class="ds-table"><div class="ds-thead"><span>Tender</span><span>Client</span><span>Value</span><span>Status</span></div>'
        +'<div class="ds-tr hl"><span>Battersea PS — Insulation</span><span>ISG Ltd</span><span>£340k</span><span><span class="ds-badge g">Won</span></span></div>'
        +'<div class="ds-tr"><span>Stratford Crossrail</span><span>Skanska</span><span>£218k</span><span><span class="ds-badge b">Submitted</span></span></div>'
        +'<div class="ds-tr"><span>Heathrow T5 — Heat</span><span>BAA Ltd</span><span>£185k</span><span><span class="ds-badge y">Chase</span></span></div>'
        +'<div class="ds-tr"><span>HS2 — Fireproofing</span><span>Balfour</span><span>£620k</span><span><span class="ds-badge r">Expired</span></span></div>'
        +'</div>';
    }
  },
  {
    title:'CONTRAQ — Projects', active:2,
    html:function(){
      return '<div class="ds-panel ds-kpi-row">'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--orange)">7</div><div class="ds-kl">Active</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">£2.1M</div><div class="ds-kl">Contract value</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv">22%</div><div class="ds-kl">Avg margin</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--yellow)">2</div><div class="ds-kl">At risk</div></div>'
        +'</div>'
        +'<div class="ds-table"><div class="ds-thead"><span>Project</span><span>Value</span><span>Margin</span><span>Status</span></div>'
        +'<div class="ds-tr hl"><span>Canary Wharf — Insulation</span><span>£284k</span><span style="color:var(--lime)">24%</span><span><span class="ds-badge g">On track</span></span></div>'
        +'<div class="ds-tr"><span>Wembley — Ductwork</span><span>£194k</span><span style="color:var(--yellow)">18%</span><span><span class="ds-badge y">At risk</span></span></div>'
        +'<div class="ds-tr"><span>Euston HVAC</span><span>£320k</span><span style="color:var(--lime)">26%</span><span><span class="ds-badge g">On track</span></span></div>'
        +'<div class="ds-tr"><span>Canary Wharf FS</span><span>£94k</span><span style="color:var(--lime)">21%</span><span><span class="ds-badge b">Starting</span></span></div>'
        +'</div>';
    }
  }
];

var DEMO_SCREENS_BOT = [
  {
    title:'CONTRAQ — Invoices', active:3,
    html:function(){
      return '<div class="ds-panel ds-kpi-row">'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">£189k</div><div class="ds-kl">Paid MTD</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--red)">£43k</div><div class="ds-kl">Overdue</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv">£62k</div><div class="ds-kl">Pending</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--orange)">£28k</div><div class="ds-kl">Retention</div></div>'
        +'</div>'
        +'<div class="ds-table"><div class="ds-thead"><span>Invoice</span><span>Client</span><span>Amount</span><span>Status</span></div>'
        +'<div class="ds-tr hl"><span>INV-0047 — Canary Wharf</span><span>Aecom</span><span>£24,400</span><span><span class="ds-badge g">Paid ✓</span></span></div>'
        +'<div class="ds-tr"><span>INV-0046 — Wembley</span><span>Balfour</span><span>£18,200</span><span><span class="ds-badge r">32d late</span></span></div>'
        +'<div class="ds-tr"><span>INV-0045 — Euston HVAC</span><span>Morgan</span><span>£46,200</span><span><span class="ds-badge b">Sent</span></span></div>'
        +'<div class="ds-tr"><span>INV-0044 — Heathrow</span><span>BAA Ltd</span><span>£32,800</span><span><span class="ds-badge y">Due soon</span></span></div>'
        +'</div>';
    }
  },
  {
    title:'CONTRAQ — Engineers', active:5,
    html:function(){
      return '<div class="ds-panel ds-kpi-row">'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">8</div><div class="ds-kl">Active</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--orange)">3</div><div class="ds-kl">On site</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--yellow)">2</div><div class="ds-kl">Cert expiring</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv">100%</div><div class="ds-kl">Compliant</div></div>'
        +'</div>'
        +'<div class="ds-table"><div class="ds-thead"><span>Engineer</span><span>Trade</span><span>Site</span><span>Certs</span></div>'
        +'<div class="ds-tr hl"><span>James Mitchell</span><span>Insulation</span><span>Canary Wharf</span><span><span class="ds-badge g">✓ Valid</span></span></div>'
        +'<div class="ds-tr"><span>Sarah Webb</span><span>Ductwork</span><span>Wembley</span><span><span class="ds-badge g">✓ Valid</span></span></div>'
        +'<div class="ds-tr"><span>Tom Barnes</span><span>Fireproofing</span><span>Off site</span><span><span class="ds-badge y">⚠ 45d</span></span></div>'
        +'<div class="ds-tr"><span>Raj Patel</span><span>M&amp;E</span><span>Euston</span><span><span class="ds-badge g">✓ Valid</span></span></div>'
        +'</div>';
    }
  },
  {
    title:'CONTRAQ — Finance', active:7,
    html:function(){
      return '<div class="ds-panel ds-kpi-row">'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">£1.2M</div><div class="ds-kl">Revenue YTD</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--lime)">22.4%</div><div class="ds-kl">Margin</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv">£268k</div><div class="ds-kl">Gross profit</div></div>'
        +'<div class="ds-kpi"><div class="ds-kv" style="color:var(--orange)">+£38k</div><div class="ds-kl">vs last yr</div></div>'
        +'</div>'
        +'<div class="ds-chart-row">'
        +'<div class="ds-chart"><div class="ds-chart-title">Monthly revenue</div><div class="ds-bars" id="dbars-b1"></div></div>'
        +'<div class="ds-activity"><div class="ds-act-title">P&amp;L summary</div>'
        +'<div class="ds-act-item"><div class="ds-act-dot" style="background:var(--lime)"></div><span class="ds-act-text">Labour: £420k — on budget</span><span class="ds-act-time">✓</span></div>'
        +'<div class="ds-act-item"><div class="ds-act-dot" style="background:var(--orange)"></div><span class="ds-act-text">Materials: £310k — +4%</span><span class="ds-act-time">⚠</span></div>'
        +'<div class="ds-act-item"><div class="ds-act-dot" style="background:var(--blue)"></div><span class="ds-act-text">Subs: £204k — on budget</span><span class="ds-act-time">✓</span></div>'
        +'</div></div>';
    }
  }
];

var _demoTopIdx = 0;
var _demoBotIdx = 0; // starts offset so panes show different content

function renderDemoPane(paneId, sidebarId, titleId, screens, idx) {
  var screen = screens[idx];
  if (!screen) return;
  var contentEl = document.getElementById(paneId);
  var titleEl   = document.getElementById(titleId);
  var items     = document.querySelectorAll('#' + sidebarId + ' .ds-sb-item');
  if (!contentEl) return;
  if (titleEl) titleEl.textContent = screen.title;
  items.forEach(function(el, i){ el.classList.toggle('on', i === screen.active); });
  contentEl.innerHTML = screen.html();
  // animate bars
  setTimeout(function(){
    animateDemoBars('dbars-t1', [65,80,55,90,72,88,95,78,84,100,92,96]);
    animateDemoBars('dbars-b1', [70,85,60,95,80,92,88,76,90,100,88,94]);
  }, 80);
}

function startDemoBgCycle() {
  renderDemoPane('demo-top-content','demo-top-sidebar','demo-top-title', DEMO_SCREENS_TOP, 0);
  renderDemoPane('demo-bot-content','demo-bot-sidebar','demo-bot-title', DEMO_SCREENS_BOT, 0);

  // Top pane cycles every 5s
  setInterval(function(){
    _demoTopIdx = (_demoTopIdx + 1) % DEMO_SCREENS_TOP.length;
    renderDemoPane('demo-top-content','demo-top-sidebar','demo-top-title', DEMO_SCREENS_TOP, _demoTopIdx);
  }, 5000);

  // Bottom pane cycles every 5s but offset by 2.5s
  setTimeout(function(){
    setInterval(function(){
      _demoBotIdx = (_demoBotIdx + 1) % DEMO_SCREENS_BOT.length;
      renderDemoPane('demo-bot-content','demo-bot-sidebar','demo-bot-title', DEMO_SCREENS_BOT, _demoBotIdx);
    }, 5000);
  }, 2500);
}

function animateDemoBars(containerId, values) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var colours = ['var(--orange)','rgba(249,115,22,.6)','rgba(249,115,22,.4)','rgba(163,230,53,.7)','var(--lime)','rgba(163,230,53,.5)','rgba(249,115,22,.8)','rgba(96,165,250,.6)','var(--orange)','var(--lime)','rgba(249,115,22,.7)','rgba(163,230,53,.8)'];
  var maxH = 38; var maxVal = Math.max.apply(null, values);
  var months = ['O','N','D','J','F','M','A','M','J','J','A','S'];
  container.innerHTML = values.map(function(v,i){
    var h = Math.round((v/maxVal)*maxH);
    return '<div class="ds-bar-w"><div class="ds-bar" style="height:0;background:'+colours[i%colours.length]+';transition:height 1.4s cubic-bezier(.22,1,.36,1) '+(i*0.055)+'s" data-h="'+h+'"></div><span class="ds-bar-l">'+(months[i]||'')+'</span></div>';
  }).join('');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    container.querySelectorAll('.ds-bar').forEach(function(b){ b.style.height = b.dataset.h + 'px'; });
  });});
}


/* ═══════════════════════════════════════════════════════════════
   ANIMATION ENGINE — v11
   IntersectionObserver reveals, countUp, progress fills, hero live
══════════════════════════════════════════════════════════════ */

/* ── IntersectionObserver for scroll reveals ─────────────── */
function initScrollReveals() {
  var opts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible');
      observer.unobserve(el);
      // Trigger child checklist items
      el.querySelectorAll('.ck-item').forEach(function(item, i) {
        setTimeout(function() { item.classList.add('visible'); }, i * 90);
      });
      // Trigger count-up numbers
      el.querySelectorAll('.count-up').forEach(function(n) {
        animateCount(n);
      });
      // Trigger pain stat fills
      el.querySelectorAll('.pain-stat-fill[data-width]').forEach(function(bar) {
        var target = parseFloat(bar.dataset.width);
        setTimeout(function(){ bar.style.width = target + '%'; }, 200);
      });
      // Trigger progress bars
      el.querySelectorAll('.progress-fill[data-width]').forEach(function(bar) {
        var target = parseFloat(bar.dataset.width);
        setTimeout(function(){ bar.style.width = target + '%'; }, 400);
      });
    });
  }, opts);

  // Observe all .reveal elements inside page-home only
  var pageHome = document.getElementById('page-home');
  if (pageHome) {
    pageHome.querySelectorAll('.reveal').forEach(function(el) {
      observer.observe(el);
    });
  }
}

/* ── countUp animation ───────────────────────────────────── */
function animateCount(el) {
  var target = parseFloat(el.dataset.target) || 0;
  var prefix = el.dataset.prefix || '';
  var suffix = el.dataset.suffix || '';
  var comma  = el.dataset.comma === '1';
  var duration = 1400;
  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.floor(eased * target);
    el.textContent = prefix + (comma ? current.toLocaleString() : current) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + (comma ? target.toLocaleString() : target) + suffix;
  }
  requestAnimationFrame(step);
}

/* ── Hero frame live-update animation ───────────────────────── */
var HERO_LIVE_DATA = [
  { rev:'£284k', jobs:'7',  inv:'£189k', out:'£42k',  row0:'Active', row1:'On site'  },
  { rev:'£301k', jobs:'8',  inv:'£204k', out:'£38k',  row0:'Active', row1:'Active'   },
  { rev:'£318k', jobs:'8',  inv:'£217k', out:'£31k',  row0:'Active', row1:'On site'  },
  { rev:'£295k', jobs:'7',  inv:'£196k', out:'£45k',  row0:'On site', row1:'Active'  },
];
var _heroLiveIdx = 0;

function startHeroLiveUpdates() {
  var revEl  = document.getElementById('hkpi-rev');
  var jobsEl = document.getElementById('hkpi-jobs');
  var invEl  = document.getElementById('hkpi-inv');
  var outEl  = document.getElementById('hkpi-out');
  if (!revEl) return;

  setInterval(function() {
    _heroLiveIdx = (_heroLiveIdx + 1) % HERO_LIVE_DATA.length;
    var d = HERO_LIVE_DATA[_heroLiveIdx];
    function flashKpi(el, val) {
      if (!el) return;
      el.textContent = val;
      el.classList.remove('pulse');
      void el.offsetWidth;
      el.classList.add('pulse');
    }
    flashKpi(revEl,  d.rev);
    flashKpi(jobsEl, d.jobs);
    flashKpi(invEl,  d.inv);
    flashKpi(outEl,  d.out);
    // Flash a random table row
    var rowIdx = Math.floor(Math.random() * 2);
    var row = document.getElementById('hrow-' + rowIdx);
    if (row) {
      row.classList.remove('flash');
      void row.offsetWidth;
      row.classList.add('flash');
    }
  }, 3200);
}

/* ── Animate progress bars that are already visible on load ─ */
function initVisibleProgressBars() {
  // In case any progress bars are above the fold
  document.querySelectorAll('.progress-fill[data-width]').forEach(function(bar) {
    // Will be triggered by IntersectionObserver when they scroll into view
    // but set a small delay for those already visible
    setTimeout(function(){ 
      if (!bar.style.width || bar.style.width === '0px') {
        bar.style.width = bar.dataset.width + '%'; 
      }
    }, 800);
  });
}


document.addEventListener('DOMContentLoaded', function() {
  // Try to restore saved session first
  try {
    if (typeof tryRestoreSession === 'function' && tryRestoreSession()) {
      // Session restored — go to dashboard
      var h = window.location.hash.replace('#','');
      if (!h || h === 'login' || h === 'register') {
        nav('dashboard');
      }
    } else {
      // No saved session — show login or handle hash route
      var h = window.location.hash.replace('#','');
      if (h === 'register') nav('register');
      else nav('login');
    }
  } catch(e) { try { nav('login'); } catch(e2) {} }
  try {
    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(function(bd){
      bd.addEventListener('click',function(e){
        if(e.target===bd) bd.classList.remove('open');
      });
    });
    // Init carousel
    initCarousel();
    setInterval(function(){ if(document.getElementById('demo')) shiftSlide(1); }, 4000);
    // Stripe init when page shown
    var stripeEl = document.getElementById('page-stripe');
    if (stripeEl) {
      var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          if(m.target.id==='page-stripe' && m.target.classList.contains('active')) initStripe();
        });
      });
      observer.observe(stripeEl, {attributes:true,attributeFilter:['class']});
    }
    // Close notif panel + search on outside click
    document.addEventListener('click', function(e) {
      var panel = document.getElementById('notif-panel');
      var btn   = document.getElementById('notif-btn');
      if (panel && panel.classList.contains('open') && !panel.contains(e.target) && (!btn||!btn.contains(e.target))) {
        panel.classList.remove('open');
      }
      var sr = document.getElementById('global-search-results');
      var si = document.getElementById('global-search');
      if (sr && sr.classList.contains('open') && !sr.contains(e.target) && (!si||!si.contains(e.target))) {
        sr.classList.remove('open');
      }
    });
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key==='Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(function(m){m.classList.remove('open');});
        var panel=document.getElementById('notif-panel'); if(panel) panel.classList.remove('open');
        closeGlobalSearch();
        closeSidebar();
      }
      if ((e.ctrlKey||e.metaKey) && e.key==='k') {
        e.preventDefault();
        var si=document.getElementById('global-search'); if(si){si.focus();si.select();}
      }
    });
    buildNotifPanel();
    // v14 animations
    try { initScrollReveals(); } catch(e) {}
    try { startDemoBgCycle(); } catch(e) {}
    try { initVisibleProgressBars(); } catch(e) {}
    try { initFoundingMember(); } catch(e) { console.warn('FM init:', e); }
  } catch(initErr) {
    console.warn('CONTRAQ init warning:', initErr);
  }
});

/* ================================================================
   FOUNDING MEMBER — initialisation
   ================================================================ */
