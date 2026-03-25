/* ═══ CONTRAQ — AUTH ═══
   Real Supabase auth + demo fallback
═══════════════════════════════════════════ */

/* ── Session management ──────────────────────────────────────── */
var CONTRAQ_SESSION = JSON.parse(localStorage.getItem('contraq_session') || 'null');

function saveSession(session, user, org) {
  CONTRAQ_SESSION = { token: session.access_token, refresh: session.refresh_token, expires: session.expires_at };
  localStorage.setItem('contraq_session', JSON.stringify(CONTRAQ_SESSION));
  localStorage.setItem('contraq_user', JSON.stringify(user));
  localStorage.setItem('contraq_org', JSON.stringify(org));
}

function clearSession() {
  CONTRAQ_SESSION = null;
  localStorage.removeItem('contraq_session');
  localStorage.removeItem('contraq_user');
  localStorage.removeItem('contraq_org');
}

function getAuthHeader() {
  if (CONTRAQ_SESSION && CONTRAQ_SESSION.token) {
    return { 'Authorization': 'Bearer ' + CONTRAQ_SESSION.token, 'Content-Type': 'application/json' };
  }
  return { 'Content-Type': 'application/json' };
}

/* ── Login ────────────────────────────────────────────────────── */
function doLogin() {
  var email = document.getElementById('login-email').value.trim().toLowerCase();
  var pass = document.getElementById('login-pass').value;
  var err = document.getElementById('login-err');
  var btn = document.querySelector('#page-login .btn-primary');
  err.style.display = 'none';
  if (!email || !pass) { err.textContent = 'Please enter email and password.'; err.style.display = 'block'; return; }

  // Demo fallback — keeps working without database
  if ((email === 'demo@contraq.co.uk' && pass === 'Demo1234!') || (email === 'admin@contraq.co.uk' && pass === 'Admin2025!')) {
    STATE.loggedIn = true;
    STATE.demoMode = true;
    STATE.user = email.startsWith('admin') ? Object.assign({}, ADMIN_USER) : Object.assign({}, DEMO_USER);
    if (typeof restoreDemoData === 'function') restoreDemoData();
    nav('dashboard');
    return;
  }

  // Real API login
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }

  fetch(CONTRAQ_API_BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: pass })
  })
  .then(function(resp) { return resp.json().then(function(data) { return { ok: resp.ok, data: data }; }); })
  .then(function(result) {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign in →'; }
    if (!result.ok) {
      err.textContent = result.data.error || 'Invalid email or password.';
      err.style.display = 'block';
      return;
    }
    // Save session
    saveSession(result.data.session, result.data.user, result.data.org);
    // Clear demo data — real org gets a clean workspace
    if (typeof clearDemoData === 'function') clearDemoData();
    // Set STATE for the platform
    STATE.loggedIn = true;
    STATE.demoMode = false;
    STATE.user = {
      id: result.data.user.id,
      fname: result.data.user.name.split(' ')[0] || result.data.user.name,
      lname: result.data.user.name.split(' ').slice(1).join(' ') || '',
      email: result.data.user.email,
      company: result.data.org.name,
      plan: result.data.org.plan,
      role: result.data.user.role,
      orgId: result.data.org.id,
      orgSlug: result.data.org.slug,
      trialEnds: result.data.org.trial_ends || null,
      trialDaysLeft: result.data.org.trial_days_left,
      trialExpired: result.data.org.trial_expired || false
    };

    // Check if trial has expired
    if (STATE.user.trialExpired) {
      showTrialExpiredScreen();
      return;
    }

    nav('dashboard');
    showToast('Welcome back, ' + STATE.user.fname + '!', 'success');
  })
  .catch(function(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign in →'; }
    err.textContent = 'Connection error. Please try again.';
    err.style.display = 'block';
    console.error('[Auth] Login error:', e);
  });
}

/* ── Plan selection ──────────────────────────────────────────── */
function selectRegPlan(plan, el) {
  STATE.regPlan = plan;
  document.querySelectorAll('.plan-opt').forEach(function(o) { o.classList.remove('sel'); });
  if (el) el.classList.add('sel');
}

/* ── Register ────────────────────────────────────────────────── */
function doRegister() {
  var fname = document.getElementById('reg-fname').value.trim();
  var lname = document.getElementById('reg-lname').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var pass = document.getElementById('reg-pass').value;
  var company = document.getElementById('reg-company').value.trim();
  var err = document.getElementById('reg-err');
  var btn = document.querySelector('#page-register .btn-primary');
  err.style.display = 'none';

  if (!fname || !lname || !email || !pass || !company) {
    err.textContent = 'Please fill in all fields.'; err.style.display = 'block'; return;
  }
  if (pass.length < 8) {
    err.textContent = 'Password must be at least 8 characters.'; err.style.display = 'block'; return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }

  fetch(CONTRAQ_API_BASE + '/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: pass,
      name: fname + ' ' + lname,
      companyName: company,
      plan: STATE.regPlan || 'professional',
      trade: 'insulation'
    })
  })
  .then(function(resp) { return resp.json().then(function(data) { return { ok: resp.ok, data: data }; }); })
  .then(function(result) {
    if (btn) { btn.disabled = false; btn.textContent = 'Create account →'; }
    if (!result.ok) {
      err.textContent = result.data.error || 'Failed to create account.';
      err.style.display = 'block';
      return;
    }
    // Clear demo data — new org gets clean workspace
    if (typeof clearDemoData === 'function') clearDemoData();
    STATE.demoMode = false;
    // Set STATE for onboarding
    STATE.user = {
      id: result.data.user.id,
      fname: fname,
      lname: lname,
      email: email,
      company: company,
      plan: STATE.regPlan || 'professional',
      role: result.data.user.role,
      orgId: result.data.org.id,
      trialDays: 14
    };

    // Auto-login after signup
    fetch(CONTRAQ_API_BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    })
    .then(function(r) { return r.json(); })
    .then(function(loginData) {
      if (loginData.session) {
        saveSession(loginData.session, loginData.user, loginData.org);
      }
    })
    .catch(function() {}); // non-critical — they can log in manually later

    nav('onboarding');
    STATE.obStep = 1;
    if (typeof renderObSteps === 'function') renderObSteps();
    showToast('Account created! Welcome to Contraq.', 'success');
  })
  .catch(function(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Create account →'; }
    err.textContent = 'Connection error. Please try again.';
    err.style.display = 'block';
    console.error('[Auth] Register error:', e);
  });
}

/* ── Auto-restore session on page load ───────────────────────── */
function tryRestoreSession() {
  var savedUser = JSON.parse(localStorage.getItem('contraq_user') || 'null');
  var savedOrg = JSON.parse(localStorage.getItem('contraq_org') || 'null');
  if (CONTRAQ_SESSION && CONTRAQ_SESSION.token && savedUser) {
    // Real user session — clear demo data for clean workspace
    if (typeof clearDemoData === 'function') clearDemoData();
    STATE.loggedIn = true;
    STATE.demoMode = false;
    STATE.user = {
      id: savedUser.id,
      fname: savedUser.name ? savedUser.name.split(' ')[0] : 'User',
      lname: savedUser.name ? savedUser.name.split(' ').slice(1).join(' ') : '',
      email: savedUser.email,
      company: savedOrg ? savedOrg.name : '',
      plan: savedOrg ? savedOrg.plan : 'professional',
      role: savedUser.role,
      orgId: savedOrg ? savedOrg.id : null
    };
    return true;
  }
  return false;
}

function selectPlanAndRegister(plan) {
  STATE.regPlan = plan;
  nav('register');
  setTimeout(function() {
    ['starter','professional','business'].forEach(function(p) {
      var el = document.getElementById('po-' + p);
      if (el) el.classList.remove('sel');
    });
    var target = document.getElementById('po-' + plan);
    if (target) target.classList.add('sel');
  }, 100);
}

/* ══════════════════════════════════════════════════════════════
   TRIAL ENFORCEMENT
══════════════════════════════════════════════════════════════ */

function showTrialExpiredScreen() {
  var content = document.getElementById('dash-content');
  if (!content) { nav('dashboard'); content = document.getElementById('dash-content'); }
  if (!content) return;

  // Show the dashboard page but replace content with expired screen
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var dashPage = document.getElementById('page-dashboard');
  if (dashPage) dashPage.classList.add('active');

  content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:70vh;padding:2rem">'
    + '<div style="text-align:center;max-width:480px">'
    + '<div style="font-size:3rem;margin-bottom:1rem">&#x23F0;</div>'
    + '<h2 style="font-size:1.4rem;font-weight:800;color:var(--white);margin-bottom:.5rem;letter-spacing:-.02em">Your free trial has ended</h2>'
    + '<p style="font-size:.88rem;color:var(--off3);line-height:1.6;margin-bottom:1.5rem">'
    + 'Your 7-day Contraq trial expired on <strong style="color:var(--white)">' + (STATE.user.trialEnds ? new Date(STATE.user.trialEnds).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : 'recently') + '</strong>. '
    + 'Your data is safe and will be here when you upgrade.'
    + '</p>'
    + '<p style="font-size:.78rem;color:var(--off4);line-height:1.5;margin-bottom:1.5rem">'
    + 'Choose a plan to continue using AI-powered take-offs, project management, and all Contraq features. '
    + 'Or contact us to discuss your needs.'
    + '</p>'
    + '<div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">'
    + '<button class="btn btn-primary" onclick="contraqUpgrade(\'beta\')">Upgrade — £99/mo Beta Pricing</button>'
    + '<a href="mailto:hello@contraq.uk" class="btn btn-dark" style="text-decoration:none">Contact Us</a>'
    + '</div>'
    + '<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">'
    + '<button class="btn btn-ghost btn-sm" style="font-size:.72rem" onclick="doLogout()">Sign out</button>'
    + '</div>'
    + '</div></div>';
}

function showTrialBanner() {
  if (STATE.demoMode || !STATE.user || !STATE.user.trialDaysLeft) return;
  var days = STATE.user.trialDaysLeft;
  if (days > 5) return; // Only show banner in last 5 days

  var existing = document.getElementById('contraq-trial-banner');
  if (existing) existing.remove();

  var urgency = days <= 1 ? 'background:var(--red)' : days <= 3 ? 'background:var(--orange)' : 'background:var(--bg3);border-bottom:1px solid var(--border)';
  var banner = document.createElement('div');
  banner.id = 'contraq-trial-banner';
  banner.style.cssText = urgency + ';color:white;text-align:center;padding:.5rem 1rem;font-size:.75rem;font-weight:600;z-index:1000;position:relative;';
  banner.innerHTML = (days === 0 ? 'Your trial ends today' : days === 1 ? '1 day left on your free trial' : days + ' days left on your free trial')
    + ' — <button onclick="dashNav(\'settings\')" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:white;padding:.2rem .6rem;border-radius:4px;font-size:.68rem;font-weight:700;cursor:pointer;margin-left:.4rem">Upgrade now</button>'
    + (days > 1 ? '<button onclick="this.parentNode.remove()" style="background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;margin-left:.5rem;font-size:.7rem">✕</button>' : '');

  var topbar = document.querySelector('.dash-topbar');
  if (topbar) topbar.parentNode.insertBefore(banner, topbar.nextSibling);
}

/* ══════════════════════════════════════════════════════════════
   ONBOARDING
══════════════════════════════════════════════════════════════ */
/* ── Trade tile toggle ──────────────────────────────────────── */
