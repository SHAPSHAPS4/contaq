/* ═══ CONTRAQ — COOKIE ═══
   COOKIE_KEY, cookie banner, consent management, IIFE init
   Lines 20385-20481 from contraq-v77
═══════════════════════════════════════════ */

var COOKIE_KEY = 'contraq_cookie_consent';

function initCookieBanner() {
  try {
    var existing = localStorage.getItem(COOKIE_KEY);
    if (!existing) {
      setTimeout(function() {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.add('visible');
      }, 1200);
    } else {
      applyCookieConsent(JSON.parse(existing));
    }
  } catch(e) {
    // localStorage unavailable — show banner anyway
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.add('visible');
  }
}

function cookieConsent(level) {
  var prefs;
  if (level === 'all') {
    prefs = { essential: true, analytics: true, functional: true, timestamp: Date.now(), level: 'all' };
  } else {
    prefs = { essential: true, analytics: false, functional: false, timestamp: Date.now(), level: 'essential' };
  }
  saveCookieConsent(prefs);
  showToast(level === 'all' ? 'Cookie preferences saved — thank you!' : 'Essential cookies only. You can change this in the footer.', 'success');
}

function cookieConsentCustom() {
  var analytics   = document.getElementById('ck-analytics-toggle');
  var functional  = document.getElementById('ck-functional-toggle');
  var prefs = {
    essential:  true,
    analytics:  analytics  ? analytics.checked  : false,
    functional: functional ? functional.checked : false,
    timestamp:  Date.now(),
    level:      'custom'
  };
  saveCookieConsent(prefs);
  hideCookieManage();
  showToast('Your cookie preferences have been saved.', 'success');
}

function saveCookieConsent(prefs) {
  try { localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs)); } catch(e) {}
  applyCookieConsent(prefs);
  hideCookieBanner();
  hideCookieManage();
}

function applyCookieConsent(prefs) {
  // Only fire analytics if consent given
  if (prefs && prefs.analytics) {
    // Placeholder: initialise analytics here when ready
    // e.g. window.analyticsEnabled = true;
  }
}

function hideCookieBanner() {
  var banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('visible');
}

function showCookieManage() {
  hideCookieBanner();
  // Pre-fill toggles from saved prefs
  try {
    var saved = localStorage.getItem(COOKIE_KEY);
    if (saved) {
      var p = JSON.parse(saved);
      var at = document.getElementById('ck-analytics-toggle');
      var ft = document.getElementById('ck-functional-toggle');
      if (at) at.checked = !!p.analytics;
      if (ft) ft.checked = !!p.functional;
    }
  } catch(e) {}
  var panel = document.getElementById('cookie-manage-panel');
  if (panel) panel.classList.add('visible');
}

function hideCookieManage() {
  var panel = document.getElementById('cookie-manage-panel');
  if (panel) panel.classList.remove('visible');
}

// Init on DOM ready
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();

