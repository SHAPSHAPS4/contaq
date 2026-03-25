/* ═══ CONTRAQ — STRIPE ═══
   planLabels, planPrices, initStripe, fmtCard, fmtExp, submitStripe
   Lines 8357-8393 from contraq-v77
═══════════════════════════════════════════ */

var planLabels = {starter:'CONTRAQ Starter',professional:'CONTRAQ Professional',business:'CONTRAQ Business',beta:'CONTRAQ Beta'};
var planPrices = {starter:'£49/mo',professional:'£149/mo',business:'£349/mo'};

function initStripe() {
  var plan = STATE.regPlan||'professional';
  var lbl = document.getElementById('stripe-plan-label');
  var amt = document.getElementById('stripe-amt-label');
  if (lbl) lbl.textContent = planLabels[plan]||'CONTRAQ Professional';
  if (amt) amt.textContent = planPrices[plan]||'£149/mo';
  var today = new Date();
  document.getElementById('s-name').value = STATE.user?STATE.user.fname+' '+STATE.user.lname:'';
}

function fmtCard(inp) {
  inp.value = inp.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19);
}
function fmtExp(inp) {
  var v = inp.value.replace(/\D/g,'');
  if (v.length>2) v=v.slice(0,2)+' / '+v.slice(2,4);
  inp.value=v;
}

function submitStripe() {
  var card=document.getElementById('s-card').value.replace(/\s/g,'');
  var exp=document.getElementById('s-exp').value;
  var cvc=document.getElementById('s-cvc').value;
  var name=document.getElementById('s-name').value.trim();
  if (card.length<16||!exp||cvc.length<3||!name) { showToast('Please complete all card fields.','error'); return; }
  STATE.loggedIn=true;
  if (!STATE.user) STATE.user=Object.assign({},DEMO_USER);
  showToast('Payment processed! Starting your 7-day trial…','success');
  setTimeout(function(){ nav('dashboard'); }, 1200);
}

/* ── Real Stripe Checkout (for authenticated orgs) ─────────── */
function contraqUpgrade(plan) {
  if (STATE.demoMode) {
    showToast('Sign up for a real account to upgrade.', 'info');
    return;
  }

  if (!ContraqAPI.isRealUser()) {
    showToast('Please log in to upgrade.', 'error');
    return;
  }

  showToast('Redirecting to checkout...', 'info');

  fetch(CONTRAQ_API_BASE + '/api/billing/checkout', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ plan: plan || 'beta' })
  })
  .then(function(resp) { return resp.json(); })
  .then(function(data) {
    if (data.url) {
      window.location.href = data.url;
    } else {
      showToast(data.error || 'Billing not available yet. Contact hello@contraq.co.uk', 'error');
    }
  })
  .catch(function() {
    showToast('Could not connect to billing. Contact hello@contraq.co.uk', 'error');
  });
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD INIT
══════════════════════════════════════════════════════════════ */
