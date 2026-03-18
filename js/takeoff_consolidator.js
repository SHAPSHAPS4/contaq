/* ═══ CONTRAQ — TAKEOFF CONSOLIDATOR ═══
   Stage 3: Cross-references drawing extraction (Stage 1)
   against spec analysis (Stage 2) to produce a consolidated,
   conflict-checked takeoff ready for pricing.
   Uses /api/takeoff/consolidate with KB v5.0.
═══════════════════════════════════════════ */

var _tcResult = null;

/* ── Open the modal ───────────────────────────────────────────── */
function openTakeoffConsolidator() {
  _tcResult = null;
  document.getElementById('tc-phase-input').style.display = '';
  document.getElementById('tc-phase-progress').style.display = 'none';
  document.getElementById('tc-phase-results').style.display = 'none';
  document.getElementById('tc-error').style.display = 'none';
  document.getElementById('tc-consolidate-btn').style.display = 'none';
  document.getElementById('tc-export-btn').style.display = 'none';
  document.getElementById('tc-title').textContent = 'Takeoff Consolidator';

  /* Pre-fill from last results if available */
  var drawingTa = document.getElementById('tc-drawing-json');
  var specTa = document.getElementById('tc-spec-json');

  if (_daResult) {
    drawingTa.value = JSON.stringify(_daResult, null, 2);
  } else {
    drawingTa.value = '';
  }

  if (_srResult) {
    specTa.value = JSON.stringify(_srResult, null, 2);
  } else {
    specTa.value = '';
  }

  tcValidateInputs();
  openModal('modal-takeoff-consolidator');
}

/* ── Load last results from other tools ───────────────────────── */
function tcLoadLastDrawing() {
  if (!_daResult) {
    showToast('No Drawing Analyser results available. Run Drawing Analyser first.', 'error');
    return;
  }
  document.getElementById('tc-drawing-json').value = JSON.stringify(_daResult, null, 2);
  tcValidateInputs();
  showToast('Drawing extraction loaded.', 'success');
}

function tcLoadLastSpec() {
  if (!_srResult) {
    showToast('No Spec Reader results available. Run Spec Reader first.', 'error');
    return;
  }
  document.getElementById('tc-spec-json').value = JSON.stringify(_srResult, null, 2);
  tcValidateInputs();
  showToast('Spec analysis loaded.', 'success');
}

/* ── Validate both inputs are present ─────────────────────────── */
function tcValidateInputs() {
  var drawingVal = document.getElementById('tc-drawing-json').value.trim();
  var specVal = document.getElementById('tc-spec-json').value.trim();

  var drawingOk = false, specOk = false;
  try { var d = JSON.parse(drawingVal); drawingOk = !!(d.extraction || d.drawing_reference); } catch(e) {}
  try { var s = JSON.parse(specVal); specOk = !!(s.spec_requirements || s.project_reference); } catch(e) {}

  var dStatus = document.getElementById('tc-drawing-status');
  var sStatus = document.getElementById('tc-spec-status');

  dStatus.textContent = drawingOk ? 'Ready' : 'Missing';
  dStatus.style.background = drawingOk ? 'rgba(163,230,53,.1)' : 'rgba(248,113,113,.1)';
  dStatus.style.color = drawingOk ? 'var(--lime)' : '#f87171';

  sStatus.textContent = specOk ? 'Ready' : 'Missing';
  sStatus.style.background = specOk ? 'rgba(163,230,53,.1)' : 'rgba(248,113,113,.1)';
  sStatus.style.color = specOk ? 'var(--lime)' : '#f87171';

  document.getElementById('tc-consolidate-btn').style.display = (drawingOk && specOk) ? 'inline-flex' : 'none';
}

/* ── Start consolidation ──────────────────────────────────────── */
function tcStartConsolidation() {
  var drawingJson, specJson;
  try {
    drawingJson = JSON.parse(document.getElementById('tc-drawing-json').value.trim());
    specJson = JSON.parse(document.getElementById('tc-spec-json').value.trim());
  } catch(e) {
    showToast('Invalid JSON in one of the inputs. Check and try again.', 'error');
    return;
  }

  document.getElementById('tc-phase-input').style.display = 'none';
  document.getElementById('tc-phase-progress').style.display = '';
  document.getElementById('tc-consolidate-btn').style.display = 'none';
  document.getElementById('tc-error').style.display = 'none';
  document.getElementById('tc-title').textContent = 'Consolidating takeoff\u2026';

  var bar = document.getElementById('tc-progress-bar');
  var step = document.getElementById('tc-progress-step');
  var detail = document.getElementById('tc-progress-detail');

  bar.style.width = '15%';
  step.textContent = 'Cross-referencing drawings against specification\u2026';
  detail.textContent = 'Stage 3 \u00b7 KB v5.0 \u00b7 NRM2 + A90 precedence';

  var crawl = setInterval(function() {
    var w = parseFloat(bar.style.width);
    if (w < 85) bar.style.width = (w + 1.5) + '%';
  }, 1500);

  var _rulesCtx = (typeof getLearnedRulesPrompt === 'function') ? getLearnedRulesPrompt() : '';

  var userContent = 'STAGE 1 — DRAWING EXTRACTION:\n' + JSON.stringify(drawingJson, null, 2)
    + '\n\nSTAGE 2 — SPECIFICATION ANALYSIS:\n' + JSON.stringify(specJson, null, 2)
    + '\n\nCross-reference these two datasets. Produce a consolidated takeoff with conflicts identified and items flagged for estimator review. Return JSON only.'
    + _rulesCtx;

  fetch(CONTRAQ_API_BASE + '/api/takeoff/consolidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      messages: [{ role: 'user', content: userContent }]
    })
  }).then(function(resp) {
    clearInterval(crawl);
    bar.style.width = '90%';
    step.textContent = 'Processing consolidated takeoff\u2026';

    if (!resp.ok) {
      return resp.text().then(function(body) {
        var d = '';
        try { var j = JSON.parse(body); d = (j.error && j.error.message) || body; } catch(e) { d = body.substring(0, 200); }
        throw new Error('API ' + resp.status + ': ' + d);
      });
    }
    return resp.json();
  }).then(function(apiData) {
    var rawText = '';
    if (apiData.content && Array.isArray(apiData.content)) {
      apiData.content.forEach(function(block) {
        if (block.type === 'text') rawText += block.text;
      });
    }

    var cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    var jMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jMatch) throw new Error('No JSON object found in AI response');

    _tcResult = JSON.parse(jMatch[0]);

    bar.style.width = '100%';
    step.textContent = 'Consolidation complete \u2714';

    setTimeout(function() { tcRenderResults(_tcResult); }, 400);
  }).catch(function(err) {
    clearInterval(crawl);
    console.error('[Contraq Takeoff Consolidator]', err);
    bar.style.width = '100%';
    bar.style.background = '#f87171';
    step.textContent = '\u26a0 Consolidation failed';

    var msg = String(err.message || 'Unexpected error');
    if (/401|403|auth|key/i.test(msg)) msg = 'API authentication error.';
    if (/429|rate/i.test(msg)) msg = 'Rate limit reached \u2014 please wait and try again.';
    if (/502|proxy/i.test(msg)) msg = 'Could not reach AI service \u2014 is the API server running?';

    document.getElementById('tc-error').innerHTML =
      '<div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:var(--radius2);padding:.85rem;">'
      + '<div style="color:#f87171;font-weight:600;font-size:.8rem;margin-bottom:.3rem;">\u26a0 Consolidation unavailable</div>'
      + '<div style="font-size:.72rem;color:#8a9099;">' + msg + '</div></div>';
    document.getElementById('tc-error').style.display = '';

    setTimeout(function() {
      document.getElementById('tc-phase-input').style.display = '';
      document.getElementById('tc-consolidate-btn').style.display = 'inline-flex';
      bar.style.width = '0%';
      bar.style.background = '';
      document.getElementById('tc-phase-progress').style.display = 'none';
    }, 1600);
  });
}

/* ── Render results ───────────────────────────────────────────── */
function tcRenderResults(data) {
  document.getElementById('tc-phase-progress').style.display = 'none';
  document.getElementById('tc-phase-results').style.display = '';
  document.getElementById('tc-export-btn').style.display = 'inline-flex';
  document.getElementById('tc-title').textContent = 'Consolidated Takeoff';

  var takeoff = data.consolidated_takeoff || [];
  var conflicts = data.conflicts || [];
  var reviewItems = data.estimator_review_required || [];

  /* Count stats */
  var highCount = 0, medCount = 0, lowCount = 0;
  var tradeCounts = {};
  var sourceMap = { Drawing: 0, Spec: 0, Both: 0, Implicit: 0 };
  takeoff.forEach(function(item) {
    if (item.confidence === 'High') highCount++;
    else if (item.confidence === 'Medium') medCount++;
    else lowCount++;
    var t = item.trade || 'Unknown';
    if (!tradeCounts[t]) tradeCounts[t] = 0;
    tradeCounts[t]++;
    if (sourceMap[item.source] !== undefined) sourceMap[item.source]++;
  });

  /* Summary */
  var sh = '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.5rem;">';
  sh += _tcCard(takeoff.length, 'Total items', 'var(--white)');
  sh += _tcCard(highCount, 'High conf.', 'var(--lime)');
  sh += _tcCard(medCount, 'Medium', 'var(--yellow)');
  sh += _tcCard(lowCount, 'Low / Review', '#f87171');
  sh += _tcCard(conflicts.length, 'Conflicts', conflicts.length ? 'var(--orange)' : 'var(--off4)');
  sh += '</div>';

  /* Source breakdown */
  sh += '<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem;">';
  ['Both','Drawing','Spec','Implicit'].forEach(function(src) {
    if (sourceMap[src]) {
      var c = src === 'Both' ? 'var(--lime)' : src === 'Drawing' ? '#60a5fa' : src === 'Spec' ? 'var(--orange)' : 'var(--off3)';
      sh += '<span style="font-family:var(--mono);font-size:.52rem;background:' + c + '11;color:' + c + ';border:1px solid ' + c + '33;border-radius:3px;padding:.12rem .4rem;">' + sourceMap[src] + ' ' + src + '</span>';
    }
  });
  sh += '</div>';

  if (data.project_reference) {
    sh += '<div style="font-family:var(--mono);font-size:.62rem;color:var(--off3);margin-bottom:.5rem;">Project: ' + data.project_reference + '</div>';
  }

  document.getElementById('tc-results-summary').innerHTML = sh;

  /* Takeoff table */
  var th = '<div style="font-size:.78rem;color:var(--white);font-weight:600;margin-bottom:.4rem;">Consolidated Takeoff</div>';
  th += '<div class="card" style="padding:0;"><div style="overflow-x:auto;"><table class="tbl"><thead><tr>'
    + '<th style="width:75px;">Trade</th>'
    + '<th>Description</th>'
    + '<th style="width:140px;">Specification</th>'
    + '<th style="width:50px;text-align:right;">Qty</th>'
    + '<th style="width:30px;">Unit</th>'
    + '<th style="width:55px;">Source</th>'
    + '<th style="width:50px;">Conf.</th>'
    + '</tr></thead><tbody>';

  takeoff.forEach(function(item) {
    var confColor = item.confidence === 'High' ? 'var(--lime)' : item.confidence === 'Medium' ? 'var(--yellow)' : '#f87171';
    var confBg = item.confidence === 'High' ? 'rgba(163,230,53,.1)' : item.confidence === 'Medium' ? 'rgba(251,191,36,.08)' : 'rgba(248,113,113,.08)';
    var tradeColor = item.trade === 'Mechanical' ? 'var(--orange)' : item.trade === 'Electrical' ? '#60a5fa' : 'var(--lime)';
    var tradeBg = item.trade === 'Mechanical' ? 'rgba(249,115,22,.08)' : item.trade === 'Electrical' ? 'rgba(96,165,250,.08)' : 'rgba(163,230,53,.08)';
    var srcColor = item.source === 'Both' ? 'var(--lime)' : item.source === 'Drawing' ? '#60a5fa' : item.source === 'Spec' ? 'var(--orange)' : 'var(--off3)';

    th += '<tr' + (item.confidence === 'Low' ? ' style="background:rgba(248,113,113,.03);"' : '') + '>'
      + '<td><span style="font-family:var(--mono);font-size:.52rem;background:' + tradeBg + ';color:' + tradeColor + ';border:1px solid ' + tradeColor + '33;border-radius:3px;padding:.08rem .25rem;">' + (item.trade || '\u2014') + '</span></td>'
      + '<td style="font-size:.72rem;color:var(--white);" title="' + (item.notes || '').replace(/"/g, '&quot;') + '">' + (item.description || '\u2014') + '</td>'
      + '<td style="font-size:.64rem;color:var(--off3);max-width:140px;overflow:hidden;text-overflow:ellipsis;" title="' + (item.specification || '').replace(/"/g, '&quot;') + '">' + (item.specification || '\u2014') + '</td>'
      + '<td class="mono" style="font-size:.74rem;color:var(--white);text-align:right;font-weight:600;">' + (item.quantity != null ? item.quantity : '\u2014') + '</td>'
      + '<td class="mono" style="font-size:.66rem;color:var(--off3);">' + (item.unit || '\u2014') + '</td>'
      + '<td><span style="font-family:var(--mono);font-size:.48rem;color:' + srcColor + ';">' + (item.source || '\u2014') + '</span></td>'
      + '<td><span style="font-family:var(--mono);font-size:.5rem;background:' + confBg + ';color:' + confColor + ';border-radius:3px;padding:.08rem .25rem;">' + (item.confidence || '\u2014') + '</span></td>'
      + '</tr>';
  });
  th += '</tbody></table></div></div>';
  document.getElementById('tc-results-takeoff').innerHTML = th;

  /* Conflicts */
  if (conflicts.length) {
    var ch = '<div style="font-size:.78rem;color:var(--orange);font-weight:600;margin-bottom:.4rem;">\u26a0 ' + conflicts.length + ' conflict' + (conflicts.length !== 1 ? 's' : '') + ' found</div>';
    conflicts.forEach(function(c) {
      var typeBg = c.conflict_type === 'Drawing vs Spec' ? 'rgba(249,115,22,.06)' : c.conflict_type === 'Missing from Drawing' ? 'rgba(96,165,250,.06)' : 'rgba(251,191,36,.06)';
      var typeBorder = c.conflict_type === 'Drawing vs Spec' ? 'rgba(249,115,22,.2)' : c.conflict_type === 'Missing from Drawing' ? 'rgba(96,165,250,.2)' : 'rgba(251,191,36,.2)';
      ch += '<div style="background:' + typeBg + ';border:1px solid ' + typeBorder + ';border-radius:var(--radius2);padding:.6rem .75rem;margin-bottom:.4rem;">'
        + '<div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem;">'
        + '<span style="font-family:var(--mono);font-size:.52rem;background:rgba(249,115,22,.12);color:var(--orange);border-radius:3px;padding:.1rem .3rem;">' + (c.conflict_type || 'Conflict') + '</span>'
        + '<span style="font-size:.74rem;color:var(--white);font-weight:500;">' + (c.description || '') + '</span></div>';
      if (c.drawing_says) ch += '<div style="font-size:.66rem;color:#60a5fa;margin-bottom:.15rem;">Drawing: ' + c.drawing_says + '</div>';
      if (c.spec_says) ch += '<div style="font-size:.66rem;color:var(--lime);margin-bottom:.15rem;">Spec: ' + c.spec_says + '</div>';
      if (c.recommendation) ch += '<div style="font-size:.66rem;color:var(--off3);margin-top:.2rem;">\u2192 ' + c.recommendation + '</div>';
      ch += '</div>';
    });
    document.getElementById('tc-results-conflicts').innerHTML = ch;
  } else {
    document.getElementById('tc-results-conflicts').innerHTML = '<div style="font-size:.72rem;color:var(--lime);margin-bottom:.5rem;">\u2714 No conflicts found between drawings and specification.</div>';
  }

  /* Estimator review */
  if (reviewItems.length) {
    var rh = '<div style="font-size:.78rem;color:#f87171;font-weight:600;margin-bottom:.4rem;">Estimator Sign-Off Required (' + reviewItems.length + ' item' + (reviewItems.length !== 1 ? 's' : '') + ')</div>'
      + '<div style="background:rgba(248,113,113,.04);border:1px solid rgba(248,113,113,.15);border-radius:var(--radius2);padding:.65rem .75rem;">'
      + '<ul style="margin:0;padding-left:1.1rem;font-size:.7rem;color:var(--off2);line-height:1.7;">';
    reviewItems.forEach(function(item) {
      rh += '<li>' + item + '</li>';
    });
    rh += '</ul></div>';
    document.getElementById('tc-results-review').innerHTML = rh;
  } else {
    document.getElementById('tc-results-review').innerHTML = '';
  }
}

/* ── Helper: summary card ─────────────────────────────────────── */
function _tcCard(value, label, color) {
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.5rem .7rem;flex:1;min-width:80px;">'
    + '<div style="font-family:var(--mono);font-size:1rem;color:' + color + ';font-weight:700;">' + value + '</div>'
    + '<div style="font-size:.58rem;color:var(--off4);">' + label + '</div></div>';
}

/* ── Export results ───────────────────────────────────────────── */
function tcExportResults() {
  if (!_tcResult) return;
  var json = JSON.stringify(_tcResult, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'contraq-consolidated-takeoff-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('\u2714 Consolidated takeoff exported as JSON', 'success');
}
