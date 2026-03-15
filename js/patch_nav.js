/* ═══ CONTRAQ — PATCH_NAV ═══
   patchNav IIFE, requestDPA
   Lines 20352-20384 from contraq-v77
═══════════════════════════════════════════ */

(function patchNav() {
  var _origNav = window.nav;
  window.nav = function(pageId) {
    if (pageId === 'security') {
      document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
      var pg = document.getElementById('page-security');
      if (pg) {
        pg.classList.add('active');
        try { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch(e) {}
      }
      return;
    }
    if (_origNav) _origNav(pageId);
  };
})();

/* ── DPA request ─────────────────────────────────────────── */
function requestDPA() {
  var subject = encodeURIComponent('Data Processor Agreement Request - Contraq');
  var bodyParts = [
    'Hi Contraq team,', '',
    'I would like to request a copy of your Data Processor Agreement (DPA) for our records.', '',
    'Company name: ', 'Your name: ', 'Email: ', '',
    'Please send the DPA to the above email address at your earliest convenience.', '',
    'Thank you.'
  ];
  var body = encodeURIComponent(bodyParts.join('\n'));
  window.location.href = 'mailto:dpo@contraq.co.uk?subject=' + subject + '&body=' + body;
}

/* ══════════════════════════════════════════════════════════════
   COOKIE CONSENT
══════════════════════════════════════════════════════════════ */
