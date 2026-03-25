/* ═══ CONTRAQ — CORE ═══
   nav() and scrollToSection()
   Lines 8006-8028 from contraq-v77
═══════════════════════════════════════════ */

function nav(pageId) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    try { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch(e){}
  }
  if (pageId === 'dashboard') {
    initDashboard();
  }
}

function scrollToSection(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({behavior:'smooth'});
}

/* ── ROI Calculator (4-slider) ─────────────────────────────── */
