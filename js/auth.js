/* ═══ CONTRAQ — AUTH ═══
   doLogin, selectRegPlan, doRegister
   Lines 8259-8300 from contraq-v77
═══════════════════════════════════════════ */

function doLogin() {
  var email = document.getElementById('login-email').value.trim().toLowerCase();
  var pass = document.getElementById('login-pass').value;
  var err = document.getElementById('login-err');
  err.style.display = 'none';
  if (!email || !pass) { err.textContent='Please enter email and password.'; err.style.display='block'; return; }
  if (email === 'demo@contraq.co.uk' && pass === 'Demo1234!') {
    STATE.loggedIn = true; STATE.user = Object.assign({}, DEMO_USER);
    nav('dashboard');
  } else if (email === 'admin@contraq.co.uk' && pass === 'Admin2025!') {
    STATE.loggedIn = true; STATE.user = Object.assign({}, ADMIN_USER);
    nav('dashboard');
  } else {
    err.textContent = 'Incorrect email or password.'; err.style.display='block';
  }
}

function selectRegPlan(plan, el) {
  STATE.regPlan = plan;
  document.querySelectorAll('.plan-opt').forEach(function(o){o.classList.remove('sel');});
  if (el) el.classList.add('sel');
}

function doRegister() {
  var fname = document.getElementById('reg-fname').value.trim();
  var lname = document.getElementById('reg-lname').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var pass = document.getElementById('reg-pass').value;
  var company = document.getElementById('reg-company').value.trim();
  var err = document.getElementById('reg-err');
  err.style.display='none';
  if (!fname||!lname||!email||!pass||!company) { err.textContent='Please fill in all fields.'; err.style.display='block'; return; }
  if (pass.length < 8) { err.textContent='Password must be at least 8 characters.'; err.style.display='block'; return; }
  STATE.user = {fname:fname,lname:lname,email:email,company:company,plan:STATE.regPlan,trialDays:14};
  nav('onboarding');
  STATE.obStep=1; renderObSteps();
}

/* ══════════════════════════════════════════════════════════════
   ONBOARDING
══════════════════════════════════════════════════════════════ */
/* ── Trade tile toggle ──────────────────────────────────────── */
