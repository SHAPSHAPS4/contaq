/* ═══ CONTRAQ — FEEDBACK LOOP ═══
   Estimator correction system. Processes feedback,
   produces corrected extractions, accumulates learned
   rules that persist across all AI calls this session.
   KB v5.0 · /api/feedback/process
═══════════════════════════════════════════ */

/* ── Session-persistent learned rules ─────────────────────────── */
var LEARNED_RULES = [];
var PATTERN_ERRORS = [];
var _fbResult = null;
var _fbSessionErrors = {
  QUANTITY_ERROR: 0, SPECIFICATION_ERROR: 0, TRADE_ERROR: 0,
  SCOPE_ERROR: 0, HALLUCINATION: 0, CONVENTION_ERROR: 0,
  CONFIDENCE_ERROR: 0, MISSED_FLAG: 0
};

/**
 * Returns learned rules formatted for injection into any AI call.
 * Call this from other modules before sending extraction requests.
 */
function getLearnedRulesPrompt() {
  if (!LEARNED_RULES.length && !PATTERN_ERRORS.length) return '';
  var lines = ['\n## LEARNED RULES FROM YOUR ORGANISATION\'S ESTIMATOR FEEDBACK\nThese corrections were made by estimators in your team. Apply them to improve accuracy.\n'];
  if (PATTERN_ERRORS.length) {
    lines.push('### PATTERN ERRORS (highest priority)');
    PATTERN_ERRORS.forEach(function(p) {
      lines.push('  [' + p.pattern_rule + '] ' + p.heightened_action);
    });
    lines.push('');
  }
  if (LEARNED_RULES.length) {
    lines.push('### Learned Rules');
    LEARNED_RULES.forEach(function(r) {
      lines.push('  [' + r.rule_id + '] When: ' + r.trigger + ' → Do: ' + r.action + ' (Reason: ' + r.reason + ')');
    });
  }
  return lines.join('\n');
}

/**
 * Returns self-audit block for pre-extraction checking.
 */
function getSelfAuditPrompt() {
  if (!LEARNED_RULES.length) return '';
  return '\n## SELF-AUDIT (run before extraction)\nCheck your extraction against these learned rules before responding:\n'
    + LEARNED_RULES.map(function(r) { return '  - [' + r.rule_id + '] ' + r.trigger + ' → ' + r.action; }).join('\n')
    + '\nFlag any items that might trigger a known error pattern.\n';
}

/* ── Open the modal ───────────────────────────────────────────── */
function openFeedbackLoop() {
  /* ── API: load learned rules from database on first open ── */
  if (ContraqAPI.isRealUser() && !STATE._learnedRulesApiLoaded) {
    ContraqAPI.getLearnedRules().then(function(rules) {
      if (rules && rules.length) {
        rules.forEach(function(r) {
          var exists = LEARNED_RULES.some(function(lr) { return lr.rule_id === r.rule_id; });
          if (!exists) LEARNED_RULES.push({ rule_id: r.rule_id, trigger: r.trigger, action: r.action, reason: r.reason });
        });
      }
      STATE._learnedRulesApiLoaded = true;
    }).catch(function(e) { console.error('[FeedbackLoop] Load rules error:', e); STATE._learnedRulesApiLoaded = true; });
  }

  _fbResult = null;
  document.getElementById('fb-phase-input').style.display = '';
  document.getElementById('fb-phase-progress').style.display = 'none';
  document.getElementById('fb-phase-results').style.display = 'none';
  document.getElementById('fb-error').style.display = 'none';
  document.getElementById('fb-submit-btn').style.display = 'none';
  document.getElementById('fb-export-btn').style.display = 'none';
  document.getElementById('fb-title').textContent = 'Estimator Feedback';

  /* Show current rules count */
  _fbUpdateRulesBadge();
  document.getElementById('fb-rules-badge').textContent = LEARNED_RULES.length
    ? LEARNED_RULES.length + ' learned rule' + (LEARNED_RULES.length !== 1 ? 's' : '') + ' active this session'
      + (PATTERN_ERRORS.length ? ' · ' + PATTERN_ERRORS.length + ' pattern error' + (PATTERN_ERRORS.length !== 1 ? 's' : '') : '')
    : 'No learned rules yet — submit your first correction to start training.';

  fbValidateInputs();
  openModal('modal-feedback-loop');
}

/* ── Load last results ────────────────────────────────────────── */
function fbLoadLast(type) {
  var data = type === 'drawing' ? _daResult : type === 'spec' ? _srResult : _tcResult;
  var label = type === 'drawing' ? 'Drawing Analyser' : type === 'spec' ? 'Spec Reader' : 'Takeoff Consolidator';
  if (!data) {
    showToast('No ' + label + ' results available. Run it first.', 'error');
    return;
  }
  document.getElementById('fb-original-json').value = JSON.stringify(data, null, 2);
  fbValidateInputs();
  showToast(label + ' result loaded.', 'success');
}

/* ── Validate inputs ──────────────────────────────────────────── */
function fbValidateInputs() {
  var origVal = document.getElementById('fb-original-json').value.trim();
  var corrVal = document.getElementById('fb-corrections-json').value.trim();

  var origOk = false, corrOk = false;
  try { JSON.parse(origVal); origOk = origVal.length > 10; } catch(e) {}
  try { var c = JSON.parse(corrVal); corrOk = !!(c.corrections && c.corrections.length); } catch(e) {}

  var oStatus = document.getElementById('fb-original-status');
  var cStatus = document.getElementById('fb-corrections-status');

  oStatus.textContent = origOk ? 'Ready' : 'Missing';
  oStatus.style.background = origOk ? 'rgba(163,230,53,.1)' : 'rgba(248,113,113,.1)';
  oStatus.style.color = origOk ? 'var(--lime)' : '#f87171';

  cStatus.textContent = corrOk ? 'Ready' : 'Missing';
  cStatus.style.background = corrOk ? 'rgba(163,230,53,.1)' : 'rgba(248,113,113,.1)';
  cStatus.style.color = corrOk ? 'var(--lime)' : '#f87171';

  document.getElementById('fb-submit-btn').style.display = (origOk && corrOk) ? 'inline-flex' : 'none';
}

/* ── Submit feedback ──────────────────────────────────────────── */
function fbSubmitFeedback() {
  var origJson, corrJson;
  try {
    origJson = JSON.parse(document.getElementById('fb-original-json').value.trim());
    corrJson = JSON.parse(document.getElementById('fb-corrections-json').value.trim());
  } catch(e) {
    showToast('Invalid JSON. Check inputs.', 'error');
    return;
  }

  document.getElementById('fb-phase-input').style.display = 'none';
  document.getElementById('fb-phase-progress').style.display = '';
  document.getElementById('fb-submit-btn').style.display = 'none';
  document.getElementById('fb-error').style.display = 'none';
  document.getElementById('fb-title').textContent = 'Processing feedback\u2026';

  var bar = document.getElementById('fb-progress-bar');
  var step = document.getElementById('fb-progress-step');
  bar.style.width = '20%';
  step.textContent = 'Analysing ' + corrJson.corrections.length + ' correction' + (corrJson.corrections.length !== 1 ? 's' : '') + '\u2026';

  var crawl = setInterval(function() {
    var w = parseFloat(bar.style.width);
    if (w < 85) bar.style.width = (w + 2) + '%';
  }, 1200);

  /* Build message with existing learned rules context */
  var rulesContext = LEARNED_RULES.length
    ? '\n\nEXISTING LEARNED RULES (apply these and number new rules sequentially):\n' + JSON.stringify(LEARNED_RULES, null, 2)
    : '';

  var userContent = 'ORIGINAL EXTRACTION:\n' + JSON.stringify(origJson, null, 2)
    + '\n\nESTIMATOR FEEDBACK:\n' + JSON.stringify(corrJson, null, 2)
    + rulesContext
    + '\n\nProcess all corrections. Acknowledge each error, produce corrected takeoff, and state new learned rules. Number rules starting at LEARNED_' + String(LEARNED_RULES.length + 1).padStart(3, '0') + '. Return JSON only.';

  fetch(CONTRAQ_API_BASE + '/api/feedback/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      messages: [{ role: 'user', content: userContent }]
    })
  }).then(function(resp) {
    clearInterval(crawl);
    bar.style.width = '90%';
    step.textContent = 'Applying corrections\u2026';

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
    if (!jMatch) throw new Error('No JSON found in AI response');

    _fbResult = JSON.parse(jMatch[0]);

    /* Accumulate learned rules */
    if (_fbResult.learned_rules && Array.isArray(_fbResult.learned_rules)) {
      _fbResult.learned_rules.forEach(function(rule) {
        var exists = LEARNED_RULES.some(function(r) { return r.rule_id === rule.rule_id; });
        if (!exists) {
          LEARNED_RULES.push(rule);
          /* ── API: persist learned rule to database ── */
          if (ContraqAPI.isRealUser()) {
            ContraqAPI.saveLearnedRule({ rule_id: rule.rule_id, trigger: rule.trigger, action: rule.action, reason: rule.reason }).catch(function(e) { console.error('[FeedbackLoop] Save rule error:', e); });
          }
        }
      });
    }

    /* Accumulate pattern errors */
    if (_fbResult.pattern_errors && Array.isArray(_fbResult.pattern_errors)) {
      _fbResult.pattern_errors.forEach(function(pe) {
        var exists = PATTERN_ERRORS.some(function(p) { return p.pattern_rule === pe.pattern_rule; });
        if (!exists) PATTERN_ERRORS.push(pe);
      });
    }

    /* Track error counts */
    if (_fbResult.error_acknowledgements) {
      _fbResult.error_acknowledgements.forEach(function(ack) {
        if (_fbSessionErrors[ack.error_type] !== undefined) {
          _fbSessionErrors[ack.error_type]++;
        }
      });
    }

    /* Check for pattern errors (same type 3+ times) */
    Object.keys(_fbSessionErrors).forEach(function(type) {
      if (_fbSessionErrors[type] >= 3) {
        var alreadyPatternned = PATTERN_ERRORS.some(function(p) { return p.error_type === type; });
        if (!alreadyPatternned) {
          PATTERN_ERRORS.push({
            error_type: type,
            occurrences: _fbSessionErrors[type],
            pattern_rule: 'PATTERN_' + String(PATTERN_ERRORS.length + 1).padStart(3, '0'),
            heightened_action: 'Triple-check all ' + type + ' items. This error type has occurred ' + _fbSessionErrors[type] + ' times.'
          });
        }
      }
    });

    bar.style.width = '100%';
    step.textContent = 'Feedback processed \u2714';
    _fbUpdateRulesBadge();

    setTimeout(function() { fbRenderResults(_fbResult); }, 400);
  }).catch(function(err) {
    clearInterval(crawl);
    console.error('[Contraq Feedback]', err);
    bar.style.width = '100%';
    bar.style.background = '#f87171';
    step.textContent = '\u26a0 Processing failed';

    document.getElementById('fb-error').innerHTML =
      '<div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:var(--radius2);padding:.85rem;">'
      + '<div style="color:#f87171;font-weight:600;font-size:.8rem;">\u26a0 ' + (err.message || 'Unexpected error') + '</div></div>';
    document.getElementById('fb-error').style.display = '';

    setTimeout(function() {
      document.getElementById('fb-phase-input').style.display = '';
      document.getElementById('fb-submit-btn').style.display = 'inline-flex';
      bar.style.width = '0%';
      bar.style.background = '';
      document.getElementById('fb-phase-progress').style.display = 'none';
    }, 1600);
  });
}

/* ── Render results ───────────────────────────────────────────── */
function fbRenderResults(data) {
  document.getElementById('fb-phase-progress').style.display = 'none';
  document.getElementById('fb-phase-results').style.display = '';
  document.getElementById('fb-export-btn').style.display = 'inline-flex';
  document.getElementById('fb-title').textContent = 'Feedback Processed';

  var acks = data.error_acknowledgements || [];
  var rules = data.learned_rules || [];
  var summary = data.feedback_session_summary || {};

  /* Error acknowledgements */
  var ah = '<div style="font-size:.78rem;color:var(--orange);font-weight:600;margin-bottom:.5rem;">' + acks.length + ' Error' + (acks.length !== 1 ? 's' : '') + ' Acknowledged</div>';
  acks.forEach(function(ack) {
    var typeColor = ack.error_type === 'HALLUCINATION' ? '#f87171' : ack.error_type === 'QUANTITY_ERROR' ? 'var(--orange)' : '#60a5fa';
    ah += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.65rem .75rem;margin-bottom:.4rem;">'
      + '<div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem;">'
      + '<span style="font-family:var(--mono);font-size:.52rem;background:' + typeColor + '15;color:' + typeColor + ';border-radius:3px;padding:.1rem .3rem;">' + (ack.error_type || '') + '</span>'
      + '<span style="font-size:.74rem;color:var(--white);font-weight:500;">' + (ack.item || '') + '</span></div>'
      + '<div style="font-size:.66rem;color:var(--off3);margin-bottom:.2rem;">Root cause: ' + (ack.root_cause || 'Not identified') + '</div>'
      + '<div style="font-size:.66rem;color:var(--lime);">Principle: ' + (ack.correct_principle || '') + '</div>';
    if (ack.corrected_extraction) {
      var ce = ack.corrected_extraction;
      ah += '<div style="margin-top:.3rem;padding:.35rem .5rem;background:rgba(163,230,53,.04);border:1px solid rgba(163,230,53,.12);border-radius:4px;font-family:var(--mono);font-size:.6rem;color:var(--off2);">'
        + (ce.description || '') + ' \u00b7 ' + (ce.quantity || '?') + ' ' + (ce.unit || '') + ' \u00b7 ' + (ce.confidence || '') + '</div>';
    }
    ah += '</div>';
  });
  document.getElementById('fb-results-acks').innerHTML = ah;

  /* Learned rules */
  if (rules.length) {
    var rh = '<div style="font-size:.78rem;color:var(--lime);font-weight:600;margin-bottom:.4rem;">' + rules.length + ' New Rule' + (rules.length !== 1 ? 's' : '') + ' Learned</div>';
    rules.forEach(function(r) {
      rh += '<div style="background:rgba(163,230,53,.04);border:1px solid rgba(163,230,53,.12);border-radius:var(--radius2);padding:.55rem .7rem;margin-bottom:.3rem;">'
        + '<div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.2rem;">'
        + '<span style="font-family:var(--mono);font-size:.56rem;color:var(--lime);font-weight:700;">' + r.rule_id + '</span>'
        + '<span style="font-size:.72rem;color:var(--white);">When: ' + r.trigger + '</span></div>'
        + '<div style="font-size:.66rem;color:var(--off2);">\u2192 ' + r.action + '</div>'
        + '<div style="font-size:.62rem;color:var(--off4);margin-top:.15rem;">Reason: ' + r.reason + '</div></div>';
    });

    /* Show pattern errors if any */
    if (PATTERN_ERRORS.length) {
      rh += '<div style="font-size:.78rem;color:#f87171;font-weight:600;margin-top:.75rem;margin-bottom:.4rem;">\u26a0 ' + PATTERN_ERRORS.length + ' Pattern Error' + (PATTERN_ERRORS.length !== 1 ? 's' : '') + ' Detected</div>';
      PATTERN_ERRORS.forEach(function(pe) {
        rh += '<div style="background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.15);border-radius:var(--radius2);padding:.55rem .7rem;margin-bottom:.3rem;">'
          + '<span style="font-family:var(--mono);font-size:.56rem;color:#f87171;font-weight:700;">' + pe.pattern_rule + '</span> '
          + '<span style="font-size:.72rem;color:var(--white);">' + pe.error_type + ' (' + pe.occurrences + ' occurrences)</span>'
          + '<div style="font-size:.66rem;color:var(--off2);margin-top:.15rem;">' + pe.heightened_action + '</div></div>';
      });
    }

    document.getElementById('fb-results-rules').innerHTML = rh;
  } else {
    document.getElementById('fb-results-rules').innerHTML = '';
  }

  /* Session summary */
  var sh = '<div style="font-size:.78rem;color:var(--white);font-weight:600;margin-bottom:.4rem;">Session Summary</div>'
    + '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.7rem .85rem;">'
    + '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.5rem;">'
    + '<span style="font-family:var(--mono);font-size:.7rem;color:var(--white);font-weight:600;">' + LEARNED_RULES.length + ' total rules</span>'
    + '<span style="font-family:var(--mono);font-size:.6rem;color:var(--off4);">\u00b7</span>'
    + '<span style="font-family:var(--mono);font-size:.7rem;color:' + (summary.overall_accuracy_assessment === 'Improving' ? 'var(--lime)' : summary.overall_accuracy_assessment === 'Needs Attention' ? '#f87171' : 'var(--yellow)') + ';">'
    + (summary.overall_accuracy_assessment || 'Assessing') + '</span></div>';

  if (summary.recommended_kb_updates && summary.recommended_kb_updates.length) {
    sh += '<div style="font-size:.66rem;color:var(--orange);margin-top:.4rem;">Recommended KB updates:</div>'
      + '<ul style="margin:.2rem 0 0;padding-left:1rem;font-size:.64rem;color:var(--off3);line-height:1.6;">';
    summary.recommended_kb_updates.forEach(function(u) { sh += '<li>' + u + '</li>'; });
    sh += '</ul>';
  }
  sh += '</div>';
  document.getElementById('fb-results-summary').innerHTML = sh;
}

/* ── Update rules badge ───────────────────────────────────────── */
function _fbUpdateRulesBadge() {
  var badge = document.getElementById('fb-rule-count-badge');
  if (badge) {
    badge.textContent = LEARNED_RULES.length + ' learned rule' + (LEARNED_RULES.length !== 1 ? 's' : '')
      + (PATTERN_ERRORS.length ? ' · ' + PATTERN_ERRORS.length + ' pattern' : '');
    badge.style.color = LEARNED_RULES.length ? 'var(--orange)' : '#f87171';
    badge.style.background = LEARNED_RULES.length ? 'rgba(249,115,22,.08)' : 'rgba(248,113,113,.08)';
  }
}

/* ── Export ────────────────────────────────────────────────────── */
function fbExportResults() {
  if (!_fbResult) return;
  var exportData = {
    feedback_result: _fbResult,
    session_learned_rules: LEARNED_RULES,
    session_pattern_errors: PATTERN_ERRORS,
    session_error_counts: _fbSessionErrors
  };
  var json = JSON.stringify(exportData, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'contraq-feedback-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('\u2714 Feedback and learned rules exported', 'success');
}

/* ── Load org learned rules from database on dashboard init ── */
function loadOrgLearnedRules() {
  if (typeof ContraqAPI === 'undefined' || !ContraqAPI.isRealUser()) return;
  ContraqAPI.getLearnedRules().then(function(rules) {
    if (!rules || !rules.length) return;
    rules.forEach(function(r) {
      var exists = LEARNED_RULES.some(function(lr) { return lr.rule_id === r.id; });
      if (!exists) {
        LEARNED_RULES.push({
          rule_id: r.id || r.rule_type + '_' + Date.now(),
          trigger: r.trigger_text,
          action: r.action_text,
          reason: r.reason || 'Learned from estimator correction',
          error_type: r.rule_type,
          date: r.created_at
        });
      }
    });
    console.log('[KB] Loaded ' + rules.length + ' org learned rules');
  }).catch(function(e) { console.error('[KB] Failed to load rules:', e); });
}
