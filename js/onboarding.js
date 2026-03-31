/* ═══ CONTRAQ — ONBOARDING ═══
   obToggleTrade, renderObSteps, obStep
   Lines 8301-8356 from contraq-v77
═══════════════════════════════════════════ */

function obToggleTrade(el) {
  var trade = el.getAttribute('data-trade');
  var idx = STATE.selectedTrades.indexOf(trade);
  if (idx === -1) {
    STATE.selectedTrades.push(trade);
    el.classList.add('selected');
  } else {
    STATE.selectedTrades.splice(idx, 1);
    el.classList.remove('selected');
  }
  // Update primary trade (first selected)
  STATE.tradePrimary = STATE.selectedTrades.length ? STATE.selectedTrades[0] : 'insulation';
  // Hide error if now valid
  if (STATE.selectedTrades.length > 0) {
    var err = document.getElementById('ob-trade-error');
    if (err) err.style.display = 'none';
  }
}

function renderObSteps() {
  for (var i=1;i<=3;i++) {
    var s = document.getElementById('obs-'+i);
    if (s) { s.className='ob-step'+(i<STATE.obStep?' done':i===STATE.obStep?' active':''); }
    var p = document.getElementById('ob-panel-'+i);
    if (p) p.style.display = (i===STATE.obStep)?'block':'none';
  }
  document.getElementById('ob-step-label').textContent='Step '+STATE.obStep+' of 3';
  document.getElementById('ob-back-btn').style.display = STATE.obStep>1?'':'none';
  document.getElementById('ob-next-btn').textContent = STATE.obStep<3?'Next →':'Finish setup →';
  if (STATE.user) {
    var biz = document.getElementById('ob-biz');
    if (biz && !biz.value) biz.value = STATE.user.company||'';
  }
}

function obStep(delta) {
  if (delta > 0 && STATE.obStep === 1) {
    // Validate trade selection
    if (STATE.selectedTrades.length === 0) {
      var err = document.getElementById('ob-trade-error');
      if (err) err.style.display = 'block';
      return;
    }
    STATE.obStep++; renderObSteps(); return;
  }
  if (delta > 0 && STATE.obStep < 3) { STATE.obStep++; renderObSteps(); return; }
  if (delta < 0 && STATE.obStep > 1) { STATE.obStep--; renderObSteps(); return; }
  if (delta > 0 && STATE.obStep === 3) {
    /* Store onboarding preferences */
    try {
      localStorage.setItem('contraq_onboarding_complete', 'true');
      localStorage.setItem('contraq_trades', JSON.stringify(STATE.selectedTrades));
    } catch(e) {}
    if (!STATE.loggedIn) nav('stripe');
    else {
      nav('dashboard');
      var tradeLabel = STATE.selectedTrades.length >= 3 ? 'M&E Contractor' : STATE.selectedTrades.map(function(t) {
        var labels = { insulation: 'Insulation', ductwork: 'Ductwork', pipework: 'Pipework', electrical: 'Electrical', plumbing: 'Plumbing & Heating', fire: 'Fire Protection', cladding: 'Cladding', other: 'Specialist' };
        return labels[t] || t;
      }).join(' & ');
      showToast('Welcome to Contraq, ' + tradeLabel + '! Your workspace is ready.', 'success');
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   STRIPE
══════════════════════════════════════════════════════════════ */
