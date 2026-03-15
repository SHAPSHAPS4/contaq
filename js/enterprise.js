/* ═══ CONTRAQ — ENTERPRISE ═══
   openBookDemo, submitBookDemo, demoAutoLogin, flashField, initEntBar, dismissEntBar
   Lines 19683-19823 from contraq-v77
═══════════════════════════════════════════ */

function openBookDemo() {
  // Reset to form view
  var formView    = document.getElementById('demo-form-view');
  var confirmView = document.getElementById('demo-confirm-view');
  if (formView)    formView.style.display    = '';
  if (confirmView) confirmView.style.display = 'none';
  // Pre-fill name/company from user state if logged in
  if (typeof STATE !== 'undefined' && STATE.user) {
    var nameEl = document.getElementById('demo-name');
    if (nameEl && !nameEl.value) nameEl.value = (STATE.user.fname||'') + ' ' + (STATE.user.lname||'');
  }
  var bd = document.getElementById('modal-book-demo');
  if (bd) bd.classList.add('open');
}

function submitBookDemo() {
  var name    = (document.getElementById('demo-name')    ||{}).value || '';
  var company = (document.getElementById('demo-company') ||{}).value || '';
  if (!name.trim())    { flashField('demo-name',    'Please enter your name');    return; }
  if (!company.trim()) { flashField('demo-company', 'Please enter your company'); return; }

  // Show confirmation view
  var formView    = document.getElementById('demo-form-view');
  var confirmView = document.getElementById('demo-confirm-view');
  if (formView)    formView.style.display    = 'none';
  if (confirmView) confirmView.style.display = '';

  // Log to console (in production: POST to CRM/webhook)
  console.log('[Contraq Demo Booking]', {
    name:    name,
    company: company,
    size:    (document.getElementById('demo-size')   ||{}).value,
    trade:   (document.getElementById('demo-trade')  ||{}).value,
    source:  (document.getElementById('demo-source') ||{}).value,
    slot:    (document.getElementById('demo-slot')   ||{}).value,
    ts:      new Date().toISOString()
  });
}

function demoAutoLoginFromModal() {
  closeModal('modal-book-demo');
  demoAutoLogin();
}

function demoAutoLogin() {
  var emailEl = document.getElementById('login-email');
  var passEl  = document.getElementById('login-pass');
  if (emailEl) emailEl.value = 'demo@contraq.co.uk';
  if (passEl)  passEl.value  = 'Demo1234!';
  nav('login');
  setTimeout(function() { doLogin(); }, 320);
}

/* ── Copy demo credentials ─────────────────────────────────── */
function demoCopy(which) {
  var val = which === 'email' ? 'demo@contraq.co.uk' : 'Demo1234!';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(val).then(function() {
      if (typeof showToast === 'function') showToast('✔ Copied: ' + val, 'success');
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = val;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (typeof showToast === 'function') showToast('✔ Copied: ' + val, 'success');
  }
}

/* ── Flash field helper (reuse existing pattern if available) ── */
function flashField(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor  = 'var(--red)';
  el.style.boxShadow    = '0 0 0 3px rgba(248,113,113,.2)';
  el.scrollIntoView({behavior:'smooth', block:'center'});
  if (typeof showToast === 'function') showToast('⚠ ' + msg, 'error');
  setTimeout(function() { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2000);
}

/* ── Sticky enterprise bar ─────────────────────────────────── */
(function() {
  var bar      = null;
  var dismissed = false;
  var shown     = false;

  function initEntBar() {
    bar = document.getElementById('enterprise-sticky-bar');
    if (!bar) return;

    // Use IntersectionObserver on the hero section
    var hero = document.querySelector('.hero') || document.getElementById('page-home');
    if (!hero || typeof IntersectionObserver === 'undefined') return;

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!dismissed) {
          if (!entry.isIntersecting && !shown) {
            // Hero scrolled out of view — show bar
            bar.style.display = 'flex';
            shown = true;
          } else if (entry.isIntersecting && shown) {
            // Scrolled back to top — hide bar
            bar.style.display = 'none';
            shown = false;
          }
        }
      });
    }, { threshold: 0.05 });

    io.observe(hero);
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEntBar);
  } else {
    initEntBar();
  }
})();

function dismissEntBar() {
  var bar = document.getElementById('enterprise-sticky-bar');
  if (bar) bar.style.display = 'none';
  // Mark as dismissed so it doesn't re-appear this session
  try { sessionStorage.setItem('entBarDismissed', '1'); } catch(e){}
}





/* ══════════════════════════════════════════════════════════════
   ECO4 / PAS 2030 COMPLIANCE MODULE
══════════════════════════════════════════════════════════════ */

/* ── Status badge helper ─────────────────────────────────── */
