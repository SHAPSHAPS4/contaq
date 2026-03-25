/* ═══ CONTRAQ — CHURN PREVENTION UI LAYER ═══
   Frontend-only indicators for 5 churn signals.
   All data stored in localStorage. Backend triggers to be wired later.
═══════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── Helpers ────────────────────────────────────────────── */
  function daysSince(dateStr) {
    if (!dateStr) return 999;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }

  function createBanner(id, html, className) {
    if (document.getElementById(id)) return;
    var el = document.createElement('div');
    el.id = id;
    el.className = 'churn-banner ' + (className || '');
    el.innerHTML = html;
    el.style.animation = 'fadeIn 0.3s ease';
    var main = document.querySelector('.main-content-v2') || document.getElementById('dash-content') || document.body.firstElementChild;
    if (main) main.parentNode.insertBefore(el, main);
    return el;
  }

  function dismiss(id) {
    var el = document.getElementById(id);
    if (el) { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }
  }

  /* ── SIGNAL 1: No login for 7+ days ────────────────────── */
  function checkWelcomeBack() {
    var lastLogin = localStorage.getItem('contraq_last_login');
    var days = daysSince(lastLogin);

    // Always update login date
    localStorage.setItem('contraq_last_login', new Date().toISOString());

    if (days >= 7 && lastLogin) {
      var name = (STATE && STATE.user) ? STATE.user.split('@')[0] : 'there';
      createBanner('churn-welcome',
        '<div style="flex:1">'
        + '<strong>Welcome back ' + name + '</strong> — your last session was ' + days + ' days ago. '
        + 'Your quotes are ready to continue.'
        + '</div>'
        + '<button class="btn-action btn-sm" onclick="dashNav(\'tenders\')">Resume last quote →</button>'
        + '<button class="btn-ghost btn-sm" onclick="dismiss(\'churn-welcome\')">Dismiss</button>',
        'churn-welcome'
      );
    }
  }

  /* ── SIGNAL 2: Upload activity drop ─────────────────────── */
  function checkUploadDrop() {
    var thisWeek = parseInt(localStorage.getItem('contraq_uploads_this_week') || '0');
    var lastWeek = parseInt(localStorage.getItem('contraq_uploads_last_week') || '0');

    if (lastWeek > 2 && thisWeek < lastWeek * 0.5) {
      // Show floating tooltip (not a banner — bottom-right card)
      if (document.getElementById('churn-upload-tip')) return;
      var tip = document.createElement('div');
      tip.id = 'churn-upload-tip';
      tip.style.cssText = 'position:fixed;bottom:24px;right:24px;background:white;border:1px solid var(--c-slate,#C8CDD5);border-radius:12px;padding:16px 20px;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:200;animation:fadeIn 0.3s ease;font-size:13px;color:var(--c-gray-text,#4A4A4A);';
      tip.innerHTML = '<div style="font-weight:600;margin-bottom:6px;">Upload activity is down this week</div>'
        + '<div style="margin-bottom:10px;color:var(--c-gray-muted,#717171);">Need help with a drawing type? We can assist.</div>'
        + '<div style="display:flex;gap:8px;">'
        + '<button class="btn-action btn-sm" onclick="window.open(\'mailto:support@contraq.co.uk\')">Get help →</button>'
        + '<button class="btn-ghost btn-sm" onclick="document.getElementById(\'churn-upload-tip\').remove()">Dismiss</button>'
        + '</div>';
      document.body.appendChild(tip);
    }
  }

  /* ── SIGNAL 3: Consecutive extraction failures ──────────── */
  function checkFailures() {
    var failures = parseInt(localStorage.getItem('contraq_consecutive_failures') || '0');

    if (failures >= 2) {
      createBanner('churn-failure',
        '<div style="flex:1">'
        + '<strong>We noticed your last ' + failures + ' extractions had issues.</strong> '
        + 'Let us help you get back on track.'
        + '</div>'
        + '<button class="btn-action btn-sm" onclick="openDrawingAnalyser()">Run diagnostic →</button>'
        + '<button class="btn-ghost btn-sm" onclick="window.open(\'mailto:support@contraq.co.uk\')">Contact support →</button>'
        + '<button class="btn-ghost btn-sm" onclick="dismiss(\'churn-failure\');localStorage.setItem(\'contraq_consecutive_failures\',\'0\')">Dismiss</button>',
        'churn-failure'
      );
    }
  }

  // Track failures — call these from extraction code
  window.contraqTrackSuccess = function() {
    localStorage.setItem('contraq_consecutive_failures', '0');
  };
  window.contraqTrackFailure = function() {
    var f = parseInt(localStorage.getItem('contraq_consecutive_failures') || '0');
    localStorage.setItem('contraq_consecutive_failures', String(f + 1));
  };
  window.contraqTrackUpload = function() {
    var c = parseInt(localStorage.getItem('contraq_uploads_this_week') || '0');
    localStorage.setItem('contraq_uploads_this_week', String(c + 1));
  };
  window.contraqTrackExport = function() {
    localStorage.setItem('contraq_last_export', new Date().toISOString());
  };

  /* ── SIGNAL 4: No quote export in 14 days ───────────────── */
  function checkExportStale() {
    var lastExport = localStorage.getItem('contraq_last_export');
    var days = daysSince(lastExport);

    if (days >= 14) {
      // Add pulse class to export buttons
      setTimeout(function() {
        var exportBtns = document.querySelectorAll('[onclick*="Export"], [onclick*="export"]');
        exportBtns.forEach(function(btn) {
          btn.classList.add('churn-export-pulse');
          btn.title = "You haven't exported a quote in " + days + " days — clients are waiting!";
        });
      }, 2000);
    }
  }

  /* ── SIGNAL 5: Trial ending ─────────────────────────────── */
  function checkTrialEnding() {
    // For real orgs, use the DB-sourced trial data (handled by showTrialBanner in auth.js)
    // This localStorage fallback is only for demo mode
    if (typeof STATE !== 'undefined' && !STATE.demoMode) return;

    var trialEnd = localStorage.getItem('contraq_trial_end');
    if (!trialEnd) {
      var firstUse = localStorage.getItem('contraq_first_use');
      if (!firstUse) {
        localStorage.setItem('contraq_first_use', new Date().toISOString());
        trialEnd = new Date(Date.now() + 7 * 86400000).toISOString();
        localStorage.setItem('contraq_trial_end', trialEnd);
      }
    }

    if (trialEnd) {
      var daysLeft = Math.ceil((new Date(trialEnd).getTime() - Date.now()) / 86400000);
      if (daysLeft <= 3 && daysLeft > 0) {
        var banner = document.createElement('div');
        banner.className = 'churn-banner churn-trial';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:1000;';
        banner.innerHTML = 'Your trial ends in <strong>' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + '</strong> — upgrade now and save 20% '
          + '<button style="background:white;color:var(--c-action,#F05A28);border:none;padding:6px 16px;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;margin-left:12px;" onclick="dashNav(\'settings\')">Upgrade →</button>';
        if (daysLeft > 1) {
          banner.innerHTML += '<button style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;margin-left:8px;font-size:12px;" onclick="this.parentNode.remove()">✕</button>';
        }
        document.body.prepend(banner);
        document.body.style.paddingTop = '44px';
      }
    }
  }

  /* ── Weekly upload counter reset ────────────────────────── */
  function resetWeeklyCounters() {
    var lastReset = localStorage.getItem('contraq_week_reset');
    var daysSinceReset = daysSince(lastReset);
    if (daysSinceReset >= 7) {
      var thisWeek = localStorage.getItem('contraq_uploads_this_week') || '0';
      localStorage.setItem('contraq_uploads_last_week', thisWeek);
      localStorage.setItem('contraq_uploads_this_week', '0');
      localStorage.setItem('contraq_week_reset', new Date().toISOString());
    }
  }

  /* ── Initialize on page load ────────────────────────────── */
  function initChurnPrevention() {
    resetWeeklyCounters();
    // Delay checks to let the main UI render first
    setTimeout(function() {
      checkTrialEnding();
      checkWelcomeBack();
      checkFailures();
      checkUploadDrop();
      checkExportStale();
    }, 1500);
  }

  // Expose dismiss globally
  window.dismiss = dismiss;

  // Run after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChurnPrevention);
  } else {
    initChurnPrevention();
  }
})();
