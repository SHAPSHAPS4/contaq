/* ═══ CONTRAQ — AI Pipeline UI Components ═══
   AlphaLab-inspired UI: critic badges, analysis summaries,
   dual-model divergence panels, pipeline loading states.
═══════════════════════════════════════════════ */

/* ── Critic Verdict Badges ─────────────────────────────────────── */

function renderCriticBadge(critic) {
  if (!critic) return '';
  var h = '<div style="display:flex;align-items:center;gap:.4rem;margin-top:.5rem;margin-bottom:.5rem;">';

  if (critic.passed && critic.confidence === 'high') {
    h += '<span style="font-size:.65rem;font-weight:700;padding:.18rem .5rem;border-radius:4px;background:rgba(163,230,53,.12);color:#a3e635;border:1px solid rgba(163,230,53,.25);">✓ Verified</span>';
  } else if (critic.passed && critic.confidence !== 'high') {
    h += '<span style="font-size:.65rem;font-weight:700;padding:.18rem .5rem;border-radius:4px;background:rgba(163,230,53,.08);color:#a3e635;border:1px solid rgba(163,230,53,.2);">✓ Passed</span>';
  } else if (!critic.passed) {
    h += '<span style="font-size:.65rem;font-weight:700;padding:.18rem .5rem;border-radius:4px;background:rgba(249,115,22,.12);color:#f97316;border:1px solid rgba(249,115,22,.25);">⚠ Review Flagged</span>';
  }

  if (critic.confidence === 'low') {
    h += '<span style="font-size:.6rem;font-weight:600;padding:.16rem .45rem;border-radius:4px;background:rgba(255,255,255,.06);color:#888;border:1px solid rgba(255,255,255,.1);">Low Confidence</span>';
  }

  h += '</div>';

  /* Issues list (collapsible) */
  if (critic.issues && critic.issues.length > 0) {
    h += '<div style="margin-bottom:.6rem;">';
    h += '<div style="font-family:var(--mono);font-size:.47rem;text-transform:uppercase;letter-spacing:.08em;color:#525860;margin-bottom:.25rem;cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'\':\'none\'">'
      + '▸ ' + critic.issues.length + ' issue(s) found — click to expand</div>';
    h += '<div style="display:none;">';
    critic.issues.forEach(function(issue) {
      var typeColor = issue.type === 'inconsistency' ? '#f87171' : issue.type === 'unsupported' ? '#f97316' : '#60a5fa';
      var typeBg = issue.type === 'inconsistency' ? 'rgba(248,113,113,.08)' : issue.type === 'unsupported' ? 'rgba(249,115,22,.08)' : 'rgba(96,165,250,.08)';
      h += '<div style="display:flex;align-items:flex-start;gap:.4rem;padding:.3rem .5rem;margin-bottom:.2rem;background:' + typeBg + ';border-radius:4px;border:1px solid ' + typeColor + '22;">';
      h += '<span style="font-family:var(--mono);font-size:.55rem;font-weight:700;color:' + typeColor + ';flex-shrink:0;min-width:80px;">' + (issue.type || 'issue').toUpperCase() + '</span>';
      h += '<span style="font-size:.68rem;color:#c8cdd4;">' + (issue.description || '') + '</span>';
      h += '</div>';
    });
    h += '</div></div>';
  }

  return h;
}

/* ── Grounded Badge ────────────────────────────────────────────── */

function renderGroundedBadge(documentCount) {
  if (!documentCount || documentCount <= 0) return '';
  return '<span style="font-size:.6rem;font-weight:600;padding:.16rem .45rem;border-radius:4px;background:rgba(96,165,250,.08);color:#60a5fa;border:1px solid rgba(96,165,250,.2);">'
    + '⬤ Grounded in ' + documentCount + ' document' + (documentCount > 1 ? 's' : '') + '</span>';
}

/* ── Analysis Summary Panel (collapsible) ──────────────────────── */

function renderAnalysisSummary(analysis) {
  if (!analysis) return '';
  var h = '<div style="margin-bottom:.6rem;border:1px solid rgba(96,165,250,.15);border-radius:6px;overflow:hidden;">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem;background:rgba(96,165,250,.06);cursor:pointer;" onclick="var b=this.nextElementSibling;b.style.display=b.style.display===\'none\'?\'\':\'none\';this.querySelector(\'span:last-child\').textContent=b.style.display===\'none\'?\'▸ Show\':\'▾ Hide\'">';
  h += '<span style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;letter-spacing:.08em;color:#60a5fa;">Phase 1 — Document Analysis</span>';
  h += '<span style="font-size:.6rem;color:#60a5fa;">▸ Show</span>';
  h += '</div>';
  h += '<div style="display:none;padding:.5rem .6rem;background:rgba(0,0,0,.15);font-size:.68rem;color:#c8cdd4;line-height:1.5;">';

  /* Delay events */
  if (analysis.delay_events && analysis.delay_events.length > 0) {
    h += '<div style="font-weight:600;color:#f87171;margin-bottom:.2rem;">Delay Events (' + analysis.delay_events.length + ')</div>';
    analysis.delay_events.forEach(function(ev) {
      h += '<div style="margin-left:.5rem;margin-bottom:.15rem;">• ' + (ev.date || '?') + ': ' + (ev.event || '') + (ev.responsible_party ? ' — ' + ev.responsible_party : '') + '</div>';
    });
  }

  /* Contract clauses */
  if (analysis.contract_clauses && analysis.contract_clauses.length > 0) {
    h += '<div style="font-weight:600;color:#f97316;margin-top:.3rem;margin-bottom:.2rem;">Relevant Clauses (' + analysis.contract_clauses.length + ')</div>';
    analysis.contract_clauses.forEach(function(cl) {
      h += '<div style="margin-left:.5rem;margin-bottom:.15rem;">• ' + (cl.clause || '') + ': ' + (cl.relevance || '') + '</div>';
    });
  }

  /* Cost references */
  if (analysis.cost_references && analysis.cost_references.length > 0) {
    h += '<div style="font-weight:600;color:#a3e635;margin-top:.3rem;margin-bottom:.2rem;">Cost References (' + analysis.cost_references.length + ')</div>';
    analysis.cost_references.forEach(function(cr) {
      h += '<div style="margin-left:.5rem;margin-bottom:.15rem;">• ' + (cr.type || '') + ': ' + (cr.amount || '?') + ' — ' + (cr.description || '') + '</div>';
    });
  }

  /* Parties */
  if (analysis.parties && analysis.parties.length > 0) {
    h += '<div style="font-weight:600;color:#888;margin-top:.3rem;margin-bottom:.2rem;">Parties</div>';
    analysis.parties.forEach(function(p) {
      h += '<div style="margin-left:.5rem;margin-bottom:.15rem;">• ' + (p.name || '') + ' (' + (p.role || '') + ')</div>';
    });
  }

  if (analysis.status_summary) {
    h += '<div style="margin-top:.3rem;font-style:italic;color:#888;">' + analysis.status_summary + '</div>';
  }

  h += '</div></div>';
  return h;
}

/* ── Dual-Model Risk Review Panel ──────────────────────────────── */

function renderRiskReviewPanel(flags, conservative, aggressive) {
  if (!flags || flags.length === 0) return '';

  var h = '<div style="margin-top:.8rem;border:1px solid rgba(249,115,22,.2);border-radius:8px;overflow:hidden;">';

  /* Header */
  h += '<div style="padding:.5rem .7rem;background:rgba(249,115,22,.06);display:flex;align-items:center;justify-content:space-between;">';
  h += '<div>';
  h += '<div style="font-size:.8rem;font-weight:700;color:#f97316;">Risk Review</div>';
  h += '<div style="font-size:.65rem;color:#888;margin-top:.1rem;">The AI identified ' + (flags.length - 1) + ' line item' + (flags.length > 2 ? 's' : '') + ' with high estimation uncertainty</div>';
  h += '</div>';
  h += '<span style="font-size:.55rem;font-weight:600;padding:.15rem .4rem;border-radius:3px;background:rgba(249,115,22,.12);color:#f97316;border:1px solid rgba(249,115,22,.2);">DUAL MODEL</span>';
  h += '</div>';

  /* Table */
  h += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:.7rem;">';
  h += '<thead><tr style="background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);">';
  h += '<th style="text-align:left;padding:.4rem .5rem;color:#888;font-weight:600;">Item</th>';
  h += '<th style="text-align:right;padding:.4rem .5rem;color:#a3e635;font-weight:600;">Conservative</th>';
  h += '<th style="text-align:right;padding:.4rem .5rem;color:#60a5fa;font-weight:600;">Aggressive</th>';
  h += '<th style="text-align:right;padding:.4rem .5rem;color:#f97316;font-weight:600;">Delta</th>';
  h += '</tr></thead><tbody>';

  flags.forEach(function(f) {
    var isTotal = f.line_item === 'TOTAL';
    var rowBg = isTotal ? 'rgba(249,115,22,.04)' : '';
    var rowWeight = isTotal ? 'font-weight:700;' : '';
    h += '<tr style="border-bottom:1px solid rgba(255,255,255,.04);background:' + rowBg + ';">';
    h += '<td style="padding:.35rem .5rem;color:#f4f5f6;' + rowWeight + '">' + (isTotal ? 'TOTAL' : (f.line_item || '—')) + '</td>';
    h += '<td style="text-align:right;padding:.35rem .5rem;font-family:var(--mono);color:#a3e635;' + rowWeight + '">£' + Number(f.conservative || 0).toLocaleString('en-GB', {minimumFractionDigits: 2}) + '</td>';
    h += '<td style="text-align:right;padding:.35rem .5rem;font-family:var(--mono);color:#60a5fa;' + rowWeight + '">£' + Number(f.aggressive || 0).toLocaleString('en-GB', {minimumFractionDigits: 2}) + '</td>';
    h += '<td style="text-align:right;padding:.35rem .5rem;font-family:var(--mono);color:#f97316;' + rowWeight + '">' + (f.delta_percent || 0) + '%</td>';
    h += '</tr>';
  });

  h += '</tbody></table></div>';

  /* Footer */
  h += '<div style="padding:.4rem .7rem;background:rgba(255,255,255,.02);font-size:.62rem;color:#888;border-top:1px solid rgba(255,255,255,.04);">';
  h += 'Conservative figure pre-selected. Items with &gt;15% delta flagged for estimator review.';
  h += '</div></div>';

  return h;
}

/* ── Two-Stage Pipeline Loading ────────────────────────────────── */

function renderPipelineProgress(stage, pct) {
  /* stage: 'reading' | 'generating' | 'auditing' | 'complete' | 'error' */
  var stages = [
    { id: 'reading', label: 'Reading documents', icon: '📄' },
    { id: 'generating', label: 'Drafting output', icon: '✏️' },
    { id: 'auditing', label: 'Quality audit', icon: '🔍' }
  ];

  var h = '<div style="display:flex;gap:.3rem;margin-bottom:.5rem;">';
  stages.forEach(function(s, i) {
    var active = s.id === stage;
    var done = stages.findIndex(function(x) { return x.id === stage; }) > i;
    var color = done ? '#a3e635' : active ? '#f97316' : '#525860';
    var bg = done ? 'rgba(163,230,53,.08)' : active ? 'rgba(249,115,22,.08)' : 'rgba(255,255,255,.03)';
    h += '<div style="flex:1;padding:.3rem .4rem;background:' + bg + ';border:1px solid ' + color + '33;border-radius:4px;text-align:center;">';
    h += '<div style="font-size:.55rem;color:' + color + ';font-weight:600;">' + (done ? '✓' : active ? '⟳' : (i + 1)) + ' ' + s.label + '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}
