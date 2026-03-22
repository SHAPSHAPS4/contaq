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
    STATE.user = email.startsWith('admin') ? Object.assign({}, ADMIN_USER) : Object.assign({}, DEMO_USER);
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
    // Set STATE for the platform
    STATE.loggedIn = true;
    STATE.user = {
      id: result.data.user.id,
      fname: result.data.user.name.split(' ')[0] || result.data.user.name,
      lname: result.data.user.name.split(' ').slice(1).join(' ') || '',
      email: result.data.user.email,
      company: result.data.org.name,
      plan: result.data.org.plan,
      role: result.data.user.role,
      orgId: result.data.org.id,
      orgSlug: result.data.org.slug
    };
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
    STATE.loggedIn = true;
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
   ONBOARDING
══════════════════════════════════════════════════════════════ */
/* ── Trade tile toggle ──────────────────────────────────────── */
