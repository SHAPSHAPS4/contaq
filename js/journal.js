/* ═══ CONTRAQ — JOURNAL ═══
   JOURNAL_TYPE_COLORS, journal modal, AI journal analysis, save/delete
   Lines 14401-14900 from contraq-v77
═══════════════════════════════════════════ */

var JOURNAL_TYPE_COLORS = {
  'Missing Materials': '#f87171',
  'Hold Up':           '#fbbf24',
  'Advisory':          '#60a5fa',
  'Programme Update':  '#a3e635',
  'Safety Notice':     '#fb923c',
  'Client Instruction':'#c084fc',
  'Other':             '#94a3b8'
};

function journalTypeColor() {
  var sel = document.getElementById('journal-type');
  if (!sel) return;
  var c = JOURNAL_TYPE_COLORS[sel.value] || '#94a3b8';
  sel.style.borderColor = c + '66';
  sel.style.color = c;
}

function openJournalModal(projectId, entryId) {
  STATE.journalProjectId = projectId;
  STATE.journalEditId    = entryId || null;
  var isEdit = !!entryId;
  document.getElementById('journal-modal-title').textContent = isEdit ? 'Edit Journal Entry' : 'Add Journal Entry';
  document.getElementById('journal-err').style.display = 'none';
  document.getElementById('journal-ai-banner').style.display = 'none';
  document.getElementById('journal-ai-progress').style.display = 'none';
  document.getElementById('journal-ai-bar').style.width = '0%';
  STATE._journalDraftLetter = null;

  if (isEdit) {
    var proj = PROJECTS.find(function(p){ return p.id === projectId; });
    var entry = proj && proj.journal ? proj.journal.find(function(j){ return j.id === entryId; }) : null;
    if (entry) {
      document.getElementById('journal-date').value  = entry.date;
      document.getElementById('journal-type').value  = entry.type;
      document.getElementById('journal-title').value = entry.title;
      document.getElementById('journal-desc').value  = entry.description;
    }
  } else {
    document.getElementById('journal-date').value  = new Date().toISOString().split('T')[0];
    document.getElementById('journal-type').value  = 'Missing Materials';
    document.getElementById('journal-title').value = '';
    document.getElementById('journal-desc').value  = '';
  }
  journalTypeColor();
  openModal('modal-journal-entry');
}

/* ================================================================
   JOURNAL AI ANALYSE — Real Anthropic Claude API
   Construction contracts specialist: EOT, delay notices, L&E
   ================================================================ */
async function journalAIAnalyse() {
  var title = (document.getElementById('journal-title').value || '').trim();
  var desc  = (document.getElementById('journal-desc').value  || '').trim();
  var type  = (document.getElementById('journal-type').value  || '').trim();
  var date  = (document.getElementById('journal-date').value  || new Date().toISOString().split('T')[0]);

  if (!title && !desc) {
    showToast('Enter a title or description first for AI to analyse.', 'error');
    return;
  }

  /* ── Gather project context ───────────────────────────────────── */
  var proj       = PROJECTS.find(function(p){ return p.id === STATE.journalProjectId; });
  var projName   = proj ? proj.name   : 'Unknown Project';
  var clientName = proj ? (proj.clientName || '') : '';
  var projCode   = proj ? proj.code   : '';
  var projValue  = proj ? ('£' + Number(proj.value || 0).toLocaleString('en-GB')) : 'unknown';
  var projStart  = proj ? (proj.start || '') : '';
  var projEnd    = proj ? (proj.end   || '') : '';

  /* ── UI → loading state ───────────────────────────────────────── */
  var btn         = document.getElementById('journal-ai-btn');
  var progressDiv = document.getElementById('journal-ai-progress');
  var bar         = document.getElementById('journal-ai-bar');
  var lbl         = document.getElementById('journal-ai-progress-label');

  btn.disabled       = true;
  btn.innerHTML      = '<span id="journal-ai-spinner" style="display:inline-block;animation:spin .7s linear infinite;margin-right:.3rem;">⟳</span> Consulting contracts AI…';
  progressDiv.style.display = '';
  document.getElementById('journal-ai-banner').style.display = 'none';
  bar.style.width      = '8%';
  bar.style.background = 'linear-gradient(90deg,var(--lime),var(--orange))';
  if (lbl) lbl.textContent = 'Sending to Claude…';

  /* ── Crawl progress while API is in flight ────────────────────── */
  var pct = 8;
  var crawl = setInterval(function() {
    pct = Math.min(pct + (Math.random() * 6 + 2), 82);
    bar.style.width = pct + '%';
    if (lbl) {
      if (pct < 30)  lbl.textContent = 'Sending to Claude…';
      else if (pct < 55) lbl.textContent = 'Analysing contract obligations…';
      else if (pct < 75) lbl.textContent = 'Checking EOT & cost recovery…';
      else lbl.textContent = 'Drafting notification…';
    }
  }, 380);

  /* ── System prompt: UK construction contracts specialist ──────── */
  var SYSTEM = [
    'You are a specialist construction contracts adviser embedded in Contraq, a platform used by UK insulation and trade subcontractors.',
    'You are an expert in JCT (Design & Build, Standard Building Contract, Measured Term, Minor Works, DOM/1) and NEC3/NEC4 (ECC Option A–E) forms of contract, and the rights and obligations of subcontractors under these.',
    '',
    'DOMAIN KNOWLEDGE:',
    '• Delay notification obligations: JCT cl.2.27–2.29 (relevant events), NEC cl.61.3 (compensation events, 8-week notification deadline), DOM/1 cl.11.',
    '• Extension of Time (EOT): time-at-large risk, concurrency, float ownership, prevention principle.',
    '• Loss and Expense / compensation events: JCT cl.4.23 (direct loss and/or expense), NEC cl.63 (defined cost + fee).',
    '• Relevant Events under JCT: late instructions, employer\'s variations, force majeure, exceptionally adverse weather, civil commotion, nominated sub-contractor delay, statutory undertaker delay.',
    '• Compensation Events under NEC: cl.60.1(1)–(21), early warning notices (cl.16), programme obligation (cl.31/32).',
    '• Notice requirements: time-bar clauses, condition precedent notices, "without delay" language.',
    '• UK Tier-1 main contractors: Balfour Beatty, Skanska, Morgan Sindall, Mace, Vinci, Kier, Wates, ISG, BAM, Laing O\'Rourke, Galliford Try, Sir Robert McAlpine, Multiplex.',
    '• Trade terms: ductwork lagging, pipe insulation, PIR, mineral wool, phenolic foam, CWI, acoustic insulation, passive fire protection, intumescent, LTHW, CHW, VRF, AHU, FCU.',
    '• Site events: access denial, late drawing issue, variation instruction (AI/EWI/VO), plant room restricted access, concurrent works disruption, late RFI response, weather delay.',
    '',
    'TASK: Analyse the journal entry and return ONLY a JSON object — no preamble, no markdown fences.',
    '',
    'JSON schema (return exactly this structure):',
    '{',
    '  "riskLevel": "Low|Medium|High",',
    '  "riskRationale": "1–2 sentences explaining the risk level",',
    '  "notificationRequired": true|false,',
    '  "notificationDeadline": "string describing urgency e.g. \'Within 8 weeks under NEC cl.61.3\' or null",',
    '  "eotImplication": "string — EOT analysis, or null if no time impact",',
    '  "costRecovery": "string — loss & expense / compensation event analysis, or null if no cost impact",',
    '  "recommendedAction": "Formal Letter|Formal Email|Site Memo|Record Only|No Action",',
    '  "actionSummary": "2–3 sentences of plain-English advice for a subcontractor without a contracts manager",',
    '  "contractualPoints": ["array of up to 5 specific contractual clauses or obligations triggered"],',
    '  "suggestedEntryType": "Missing Materials|Hold Up|Advisory|Programme Update|Safety Notice|Client Instruction|Other",',
    '  "draftLetter": "full draft notification letter as a plain-text string (professional tone, UK English, signed off \'Yours faithfully\'), or null if no formal letter is needed"',
    '}'
  ].join('\n');

  var userContent = [
    'PROJECT CONTEXT:',
    '  Project: ' + projCode + ' — ' + projName,
    '  Client / Main Contractor: ' + (clientName || 'Not specified'),
    '  Contract Value: ' + projValue,
    '  Programme: ' + (projStart || 'unknown') + ' → ' + (projEnd || 'unknown'),
    '  Entry Date: ' + date,
    '  Entry Type (current): ' + (type || 'Not set'),
    '',
    'JOURNAL ENTRY:',
    '  Title: ' + title,
    '  Description: ' + (desc || '(no description provided)'),
    '',
    'Analyse this entry for contractual obligations, delay notification requirements, EOT entitlement, and cost recovery. Return JSON only.'
  ].join('\n');

  try {
    var resp = await fetch(CONTRAQ_API_BASE + '/api/journal/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    clearInterval(crawl);
    bar.style.width = '92%';
    if (lbl) lbl.textContent = 'Processing analysis…';

    if (!resp.ok) {
      var eb = {}; try { eb = await resp.json(); } catch(e) {}
      throw new Error((eb.error && eb.error.message) ? eb.error.message : 'HTTP ' + resp.status);
    }

    var apiData = await resp.json();
    var rawText = '';
    if (apiData.content && Array.isArray(apiData.content)) {
      apiData.content.forEach(function(b){ if (b.type === 'text') rawText += b.text; });
    }

    /* ── Parse JSON from response ─────────────────────────────── */
    var d;
    try {
      var cleaned = rawText.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
      var jm = cleaned.match(/\{[\s\S]*\}/);
      if (!jm) throw new Error('No JSON found');
      d = JSON.parse(jm[0]);
    } catch(pe) {
      throw new Error('Could not parse AI response. ' + pe.message);
    }

    bar.style.width = '100%';
    if (lbl) lbl.textContent = 'Analysis complete ✔';

    /* ── Auto-set entry type dropdown ─────────────────────────── */
    var VALID_TYPES = ['Missing Materials','Hold Up','Advisory','Programme Update','Safety Notice','Client Instruction','Other'];
    if (d.suggestedEntryType && VALID_TYPES.indexOf(d.suggestedEntryType) >= 0) {
      var typeSel = document.getElementById('journal-type');
      if (typeSel) { typeSel.value = d.suggestedEntryType; journalTypeColor(); }
    }

    /* ── Store draft letter for copy button ───────────────────── */
    STATE._journalDraftLetter = d.draftLetter || null;

    /* ── Render analysis banner ───────────────────────────────── */
    journalRenderAnalysis(d, proj);

    setTimeout(function() {
      progressDiv.style.display = 'none';
      bar.style.width = '0%';
      bar.style.background = '';
      btn.disabled  = false;
      btn.innerHTML = ICON.brain + ' Re-analyse';
    }, 600);

  } catch(err) {
    clearInterval(crawl);
    console.error('[Contraq Journal AI]', err);
    bar.style.width      = '100%';
    bar.style.background = '#f87171';
    if (lbl) lbl.textContent = '⚠ Analysis failed';

    var msg = String(err.message || 'Unexpected error');
    if (/401|403|auth|key/i.test(msg))  msg = 'API authentication error — check platform configuration.';
    if (/429|rate/i.test(msg))           msg = 'Rate limit — please wait a moment and try again.';

    /* Show error in banner */
    document.getElementById('journal-ai-text').innerHTML =
      '<div style="color:#f87171;font-weight:600;margin-bottom:.3rem;">⚠ AI analysis unavailable</div>'
    + '<div style="font-size:.72rem;color:#8a9099;">' + msg + '</div>'
    + '<div style="font-size:.68rem;color:#525860;margin-top:.35rem;">Save the entry manually — you can re-analyse later.</div>';
    document.getElementById('journal-ai-banner').style.display = '';

    setTimeout(function() {
      progressDiv.style.display = 'none';
      bar.style.width      = '0%';
      bar.style.background = '';
      btn.disabled  = false;
      btn.innerHTML = ICON.brain + ' AI Analyse Entry';
    }, 1600);
  }
}

/* ── Render the full contracts analysis into the banner ─────────── */
function journalRenderAnalysis(d, proj) {
  /* Risk badge colours */
  var riskColour = d.riskLevel === 'High' ? '#f87171' : d.riskLevel === 'Medium' ? '#fbbf24' : '#a3e635';
  var riskBg     = d.riskLevel === 'High' ? 'rgba(248,113,113,.12)' : d.riskLevel === 'Medium' ? 'rgba(251,191,36,.1)' : 'rgba(163,230,53,.1)';
  var riskBorder = d.riskLevel === 'High' ? 'rgba(248,113,113,.3)'  : d.riskLevel === 'Medium' ? 'rgba(251,191,36,.28)'  : 'rgba(163,230,53,.28)';

  /* Action badge colours */
  var actColour  = (d.recommendedAction === 'Formal Letter' || d.recommendedAction === 'Formal Email') ? '#f97316' : '#60a5fa';
  var actBg      = (d.recommendedAction === 'Formal Letter' || d.recommendedAction === 'Formal Email') ? 'rgba(249,115,22,.1)' : 'rgba(96,165,250,.1)';
  var actBorder  = (d.recommendedAction === 'Formal Letter' || d.recommendedAction === 'Formal Email') ? 'rgba(249,115,22,.3)' : 'rgba(96,165,250,.25)';

  var html = '';

  /* ── Row 1: Risk + Action badges ─────────────────────────────── */
  html += '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.65rem;">'
    + '<span style="font-size:.72rem;font-weight:700;padding:.22rem .65rem;border-radius:5px;background:' + riskBg + ';color:' + riskColour + ';border:1px solid ' + riskBorder + ';">'
    + '⬤ ' + (d.riskLevel || '?') + ' Risk</span>'
    + '<span style="font-size:.71rem;font-weight:600;padding:.22rem .65rem;border-radius:5px;background:' + actBg + ';color:' + actColour + ';border:1px solid ' + actBorder + ';">'
    + (d.recommendedAction === 'Formal Letter' ? ICON.file + ' ' : d.recommendedAction === 'Formal Email' ? ICON.file + ' ' : ICON.clipboard + ' ')
    + (d.recommendedAction || 'Review') + '</span>';

  /* Notification deadline pill */
  if (d.notificationRequired && d.notificationDeadline) {
    html += '<span style="font-size:.68rem;font-weight:600;padding:.2rem .55rem;border-radius:5px;background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.3);">⏱ ' + d.notificationDeadline + '</span>';
  }
  html += '</div>';

  /* ── Risk rationale ────────────────────────────────────────────── */
  if (d.riskRationale) {
    html += '<div style="font-size:.76rem;color:#f4f5f6;font-weight:500;margin-bottom:.5rem;line-height:1.5;">' + d.riskRationale + '</div>';
  }

  /* ── Action summary ────────────────────────────────────────────── */
  if (d.actionSummary) {
    html += '<div style="font-size:.73rem;color:#c8cdd4;line-height:1.6;margin-bottom:.55rem;">' + d.actionSummary + '</div>';
  }

  /* ── EOT + Cost Recovery side-by-side ───────────────────────── */
  var showEot  = !!d.eotImplication;
  var showCost = !!d.costRecovery;
  if (showEot || showCost) {
    html += '<div style="display:grid;grid-template-columns:' + (showEot && showCost ? '1fr 1fr' : '1fr') + ';gap:.5rem;margin-bottom:.55rem;">';
    if (showEot) {
      html += '<div style="background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.18);border-radius:6px;padding:.5rem .65rem;">'
        + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.46rem;text-transform:uppercase;letter-spacing:.08em;color:#60a5fa;margin-bottom:.25rem;">⏳ EOT</div>'
        + '<div style="font-size:.7rem;color:#c8cdd4;line-height:1.5;">' + d.eotImplication + '</div></div>';
    }
    if (showCost) {
      html += '<div style="background:rgba(163,230,53,.05);border:1px solid rgba(163,230,53,.18);border-radius:6px;padding:.5rem .65rem;">'
        + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.46rem;text-transform:uppercase;letter-spacing:.08em;color:#a3e635;margin-bottom:.25rem;">Loss &amp; Expense</div>'
        + '<div style="font-size:.7rem;color:#c8cdd4;line-height:1.5;">' + d.costRecovery + '</div></div>';
    }
    html += '</div>';
  }

  /* ── Contractual points ────────────────────────────────────────── */
  if (d.contractualPoints && d.contractualPoints.length) {
    html += '<div style="margin-bottom:.6rem;">'
      + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.47rem;text-transform:uppercase;letter-spacing:.08em;color:#525860;margin-bottom:.3rem;">Contractual Obligations Triggered</div>'
      + '<div style="display:flex;flex-direction:column;gap:.2rem;">';
    d.contractualPoints.forEach(function(pt) {
      html += '<div style="display:flex;align-items:flex-start;gap:.4rem;font-size:.71rem;color:#8a9099;line-height:1.45;">'
        + '<span style="color:#f97316;flex-shrink:0;margin-top:.05rem;">▸</span><span>' + pt + '</span></div>';
    });
    html += '</div></div>';
  }

  /* ── Draft letter section ──────────────────────────────────────── */
  if (d.draftLetter) {
    html += '<div style="border-top:1px solid rgba(255,255,255,.07);padding-top:.6rem;margin-top:.1rem;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem;">'
      + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.47rem;text-transform:uppercase;letter-spacing:.08em;color:#f97316;">✉ Draft Notification Letter</div>'
      + '<div style="display:flex;gap:.35rem;">'
      + '<button class="btn btn-xs" style="background:rgba(249,115,22,.1);color:#f97316;border:1px solid rgba(249,115,22,.28);font-size:.67rem;" onclick="journalToggleLetter()">'
        + '<span id="journal-letter-toggle-label">Show Letter</span></button>'
      + '<button class="btn btn-xs" style="background:rgba(163,230,53,.08);color:#a3e635;border:1px solid rgba(163,230,53,.28);font-size:.67rem;" onclick="journalCopyLetter(this)">Copy</button>'
      + '</div></div>'

      /* Collapsible letter body */
      + '<div id="journal-letter-body" style="display:none;max-height:200px;overflow-y:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:6px;padding:.65rem .75rem;font-size:.69rem;color:#c8cdd4;line-height:1.7;white-space:pre-wrap;font-family:\'IBM Plex Mono\',monospace;">'
      + journalEscapeHtml(d.draftLetter)
      + '</div></div>';
  }

  /* ── Footer: type auto-set note ───────────────────────────────── */
  if (d.suggestedEntryType) {
    html += '<div style="margin-top:.5rem;font-family:\'IBM Plex Mono\',monospace;font-size:.47rem;text-transform:uppercase;letter-spacing:.06em;color:#525860;">'
      + 'Entry type auto-set → <span style="color:#a3e635;">' + d.suggestedEntryType + '</span></div>';
  }

  document.getElementById('journal-ai-text').innerHTML = html;
  document.getElementById('journal-ai-banner').style.display = '';
}

/* ── Toggle draft letter visibility ─────────────────────────────── */
function journalToggleLetter() {
  var body  = document.getElementById('journal-letter-body');
  var label = document.getElementById('journal-letter-toggle-label');
  if (!body) return;
  var showing = body.style.display !== 'none';
  body.style.display  = showing ? 'none' : '';
  if (label) label.textContent = showing ? 'Show Letter' : 'Hide Letter';
}

/* ── Copy draft letter to clipboard ─────────────────────────────── */
function journalCopyLetter(btnEl) {
  var letter = STATE._journalDraftLetter;
  if (!letter) { showToast('No draft letter to copy.', 'error'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(letter).then(function() {
      if (btnEl) { btnEl.textContent = '✔ Copied!'; setTimeout(function(){ btnEl.innerHTML = 'Copy'; }, 2200); }
      showToast('✔ Draft letter copied to clipboard', 'success');
    }).catch(function() { journalCopyFallback(letter, btnEl); });
  } else {
    journalCopyFallback(letter, btnEl);
  }
}
function journalCopyFallback(text, btnEl) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta); ta.select();
  try {
    document.execCommand('copy');
    if (btnEl) { btnEl.textContent = '✔ Copied!'; setTimeout(function(){ btnEl.innerHTML = 'Copy'; }, 2200); }
    showToast('✔ Draft letter copied to clipboard', 'success');
  } catch(e) { showToast('Could not copy — please select and copy manually.', 'error'); }
  document.body.removeChild(ta);
}
function journalEscapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function saveJournalEntry() {
  var date  = (document.getElementById('journal-date').value  || '').trim();
  var type  = (document.getElementById('journal-type').value  || '').trim();
  var title = (document.getElementById('journal-title').value || '').trim();
  var desc  = (document.getElementById('journal-desc').value  || '').trim();

  if (!title) { showModalErr('journal-err', 'Please enter a title.'); return; }
  if (!date)  { showModalErr('journal-err', 'Please select a date.');  return; }

  var proj = PROJECTS.find(function(p){ return p.id === STATE.journalProjectId; });
  if (!proj) { closeModal('modal-journal-entry'); return; }
  if (!proj.journal) proj.journal = [];

  if (STATE.journalEditId) {
    var idx = proj.journal.findIndex(function(j){ return j.id === STATE.journalEditId; });
    if (idx >= 0) {
      proj.journal[idx] = Object.assign(proj.journal[idx], {date:date, type:type, title:title, description:desc, edited:true});
    }
    showToast('\u2714 Journal entry updated.', 'success');
  } else {
    proj.journal.unshift({
      id: 'j-' + proj.id + '-' + Date.now(),
      date: date, type: type, title: title, description: desc,
      author: (typeof DEMO_USER !== 'undefined' ? DEMO_USER.fname + ' ' + DEMO_USER.lname : 'James Mitchell'),
      edited: false
    });
    showToast('\u2714 Journal entry added to ' + proj.code + '.', 'success');
  }

  closeModal('modal-journal-entry');

  // Re-render whichever view is active
  var currentPanel = STATE.currentPanel;
  var pid = STATE.viewProjectId || STATE.journalProjectId;
  if (currentPanel === 'projects' && pid) {
    renderProjectDetailTab(pid, 'journal');
  } else if (currentPanel === 'procurement' && STATE.currentPOId) {
    openProcPODetail(STATE.currentPOId);
  }
}

function deleteJournalEntry(projectId, entryId) {
  var proj = PROJECTS.find(function(p){ return p.id === projectId; });
  if (!proj || !proj.journal) return;
  proj.journal = proj.journal.filter(function(j){ return j.id !== entryId; });
  showToast('Journal entry removed.', 'default');
  var delPid = STATE.viewProjectId || projectId;
  if (STATE.currentPanel === 'projects' && delPid) {
    renderProjectDetailTab(delPid, 'journal');
  } else if (STATE.currentPanel === 'procurement' && STATE.currentPOId) {
    openProcPODetail(STATE.currentPOId);
  }
}

/* ── Render journal as full timeline (Projects tab) ────────── */
function renderJournalTab(projectId, entries) {
  var sorted = (entries || []).slice().sort(function(a,b){
    return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
  });

  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;">';
  h += '<div style="font-family:var(--mono);font-size:.62rem;color:var(--off3);">' + sorted.length + ' entr' + (sorted.length !== 1 ? 'ies' : 'y') + '</div>';
  h += '<button class="btn btn-sm" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.3);font-size:.75rem;" onclick="openJournalModal(\'' + projectId + '\',null)">+ Add Journal Entry</button>';
  h += '</div>';

  if (!sorted.length) {
    return h + '<div style="text-align:center;padding:2.5rem 1rem;color:var(--off4);font-size:.82rem;">No journal entries yet.<br><span style="font-size:.72rem;">Click \u201cAdd Journal Entry\u201d to log issues, advisories and updates.</span></div>';
  }

  h += '<div style="display:flex;flex-direction:column;gap:.6rem;">';
  sorted.forEach(function(entry) {
    var tc = JOURNAL_TYPE_COLORS[entry.type] || '#94a3b8';
    h += '<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ' + tc + ';border-radius:0 8px 8px 0;padding:.85rem 1rem;">';
    h += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-bottom:.35rem;">';
    h += '<div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;">';
    h += '<span style="font-family:var(--mono);font-size:.56rem;background:' + tc + '1a;color:' + tc + ';border:1px solid ' + tc + '44;border-radius:4px;padding:.1rem .45rem;">' + entry.type + '</span>';
    h += '<span style="font-size:.8rem;font-weight:700;color:var(--white);">' + entry.title + '</span>';
    if (entry.edited) h += '<span style="font-family:var(--mono);font-size:.52rem;color:var(--off4);">(edited)</span>';
    h += '</div>';
    h += '<div style="display:flex;align-items:center;gap:.4rem;flex-shrink:0;">';
    h += '<span style="font-family:var(--mono);font-size:.62rem;color:var(--off4);">' + fmtDate(entry.date) + '</span>';
    h += '<button class="btn btn-dark btn-xs" onclick="openJournalModal(\'' + projectId + '\',\'' + entry.id + '\')">Edit</button>';
    h += '<button class="btn btn-xs" style="background:rgba(248,113,113,.08);color:var(--red);border:1px solid rgba(248,113,113,.2);" onclick="if(confirm(\'Delete this entry?\'))deleteJournalEntry(\'' + projectId + '\',\'' + entry.id + '\')">&#215;</button>';
    h += '</div></div>';
    if (entry.description) {
      h += '<div style="font-size:.76rem;color:var(--off2);line-height:1.6;margin-bottom:.3rem;">' + entry.description + '</div>';
    }
    h += '<div style="font-family:var(--mono);font-size:.58rem;color:var(--off4);">' + (entry.author || '') + '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ── Compact timeline (Procurement PO detail — max N entries) ── */
function renderJournalTimeline(projectId, entries, maxShow) {
  var sorted = (entries || []).slice().sort(function(a,b){
    return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
  });
  var show = maxShow ? sorted.slice(0, maxShow) : sorted;

  if (!show.length) {
    return '<div style="color:var(--off4);font-size:.76rem;padding:.5rem 0;">No journal entries yet.</div>';
  }

  var h = '<div style="display:flex;flex-direction:column;gap:.5rem;">';
  show.forEach(function(entry) {
    var tc = JOURNAL_TYPE_COLORS[entry.type] || '#94a3b8';
    h += '<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ' + tc + ';border-radius:0 7px 7px 0;padding:.65rem .85rem;">';
    h += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;">';
    h += '<div>';
    h += '<span style="font-family:var(--mono);font-size:.54rem;background:' + tc + '1a;color:' + tc + ';border:1px solid ' + tc + '44;border-radius:3px;padding:.06rem .35rem;margin-right:.4rem;">' + entry.type + '</span>';
    h += '<span style="font-size:.76rem;font-weight:600;color:var(--white);">' + entry.title + '</span>';
    h += '</div>';
    h += '<div style="display:flex;align-items:center;gap:.35rem;flex-shrink:0;">';
    h += '<span style="font-family:var(--mono);font-size:.6rem;color:var(--off4);">' + fmtDate(entry.date) + '</span>';
    h += '<button class="btn btn-dark btn-xs" onclick="openJournalModal(\'' + projectId + '\',\'' + entry.id + '\')">Edit</button>';
    h += '</div></div>';
    if (entry.description) {
      h += '<div style="font-size:.72rem;color:var(--off3);line-height:1.5;margin-top:.25rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + entry.description + '</div>';
    }
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function openProcPODetail(poId) {
  var po = PO_REGISTER.find(function(x){ return x.id === poId; });
  if (!po) return;
  var items   = po.items || [];
  var pj      = PROJECTS.find(function(p){ return p.id === po.project; });
  var cl      = pj ? CLIENTS.find(function(c){ return c.id === pj.client; }) : null;
  var subTot  = items.reduce(function(s,it){ return s + it.qty * it.unitCost; }, 0);
  var vatAmt  = Math.round(subTot * 0.20 * 100) / 100;
  var total   = Math.round((subTot + vatAmt) * 100) / 100;
  var sc = po.status==='delivered' ? '#a3e635' : po.status==='partial' ? '#f97316' : '#f87171';
  var sl = po.status==='delivered' ? 'Delivered'  : po.status==='partial' ? 'Partially Delivered' : 'Outstanding';

  document.getElementById('proc-po-detail-title').textContent = po.id + ' — Order Breakdown';

  var h = '';

  // Metadata card
  h += '<div style="background:var(--bg3);border:1.5px solid var(--border);border-radius:10px;padding:1rem 1.2rem;margin-bottom:.85rem;">';
  h += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">';
  h += '<div>';
  h += '<div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;letter-spacing:.1em;color:var(--orange);margin-bottom:.25rem;">Purchase Order</div>';
  h += '<div style="font-size:1.05rem;font-weight:700;color:var(--white);">' + po.id + '</div>';
  h += '<div style="font-size:.78rem;color:var(--off2);margin-top:.1rem;">' + po.supplier + '</div>';
  h += '</div>';
  h += '<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .65rem;border-radius:5px;font-family:var(--mono);font-size:.6rem;font-weight:700;background:' + sc + '1a;color:' + sc + ';border:1px solid ' + sc + '55;">';
  h += '<span style="width:6px;height:6px;border-radius:50%;background:' + sc + ';display:inline-block;"></span>' + sl + '</span>';
  h += '</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:.75rem;">';
  var meta = [
    ['Date Sent',   po.date   ? fmtDate(po.date)     : '—'],
    ['Expected',    po.expected ? fmtDate(po.expected): '—'],
    ['Project',     pj ? pj.code + ' ' + pj.name.split('—')[0].trim() : '—'],
    ['Client',      cl ? cl.name : (pj ? pj.clientName || '—' : '—')]
  ];
  meta.forEach(function(m){
    h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">' + m[0] + '</div>';
    h += '<div style="font-size:.72rem;color:var(--white);line-height:1.4;">' + m[1] + '</div></div>';
  });
  h += '</div>';
  if (po.siteAddress || po.siteContact) {
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.65rem;">';
    if (po.siteAddress) h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">Delivery Address</div><div style="font-size:.72rem;color:var(--off2);">' + po.siteAddress + '</div></div>';
    if (po.siteContact) h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">Site Contact</div><div style="font-size:.75rem;font-weight:600;color:var(--white);">' + po.siteContact + '</div><div style="font-size:.7rem;color:var(--blue);">' + (po.sitePhone||'') + '</div></div>';
    h += '</div>';
  }
  h += '</div>';

  // Line items table
  h += '<div class="card" style="margin-bottom:.75rem;"><div class="card-header"><span class="card-title">Materials Ordered</span></div>';
  if (!items.length) {
    h += '<div style="padding:1.25rem;text-align:center;color:var(--off4);font-size:.8rem;">No line items recorded for this order.</div>';
  } else {
    h += '<div style="overflow-x:auto;"><table class="tbl"><thead><tr>';
    h += '<th>Material / Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>VAT</th><th>Line Total (inc.VAT)</th>';
    if (po.notes) h += '<th>Notes</th>';
    h += '</tr></thead><tbody>';
    items.forEach(function(it){
      var net  = it.qty * it.unitCost;
      var vat  = net * ((it.vat||20)/100);
      var line = Math.round((net+vat)*100)/100;
      h += '<tr' + (it.outstanding ? ' style="background:rgba(249,115,22,.05)"' : '') + '>';
      h += '<td style="font-weight:' + (it.outstanding?'600':'400') + ';color:' + (it.outstanding?'var(--orange)':'var(--white)') + ';">';
      h += it.desc;
      if (it.outstanding) h += '<span style="font-family:var(--mono);font-size:.56rem;color:var(--orange);margin-left:.35rem;">&#9888; OUTSTANDING' + (it.outstandingQty?' ('+it.outstandingQty+')':'') + '</span>';
      h += '</td>';
      h += '<td class="mono">' + it.qty + '</td>';
      h += '<td class="mono" style="color:var(--off3);">' + it.unit + '</td>';
      h += '<td class="mono">&#163;' + it.unitCost.toFixed(2) + '</td>';
      h += '<td class="mono" style="color:var(--off3);">' + (it.vat||20) + '%</td>';
      h += '<td class="mono" style="color:var(--lime);font-weight:600;">&#163;' + fmtNum(line) + '</td>';
      if (po.notes) h += '<td style="font-size:.7rem;color:var(--off3);">' + (it.supplierNote||'') + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';

  // Cost summary
  h += '<div style="display:flex;justify-content:flex-end;margin-bottom:.75rem;">';
  h += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.85rem 1.1rem;min-width:230px;">';
  h += '<div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--off2);margin-bottom:.3rem;"><span>Subtotal (ex. VAT)</span><span class="mono">&#163;' + fmtNum(Math.round(subTot*100)/100) + '</span></div>';
  h += '<div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--off2);margin-bottom:.4rem;padding-bottom:.4rem;border-bottom:1px solid var(--border);"><span>VAT (20%)</span><span class="mono">&#163;' + fmtNum(vatAmt) + '</span></div>';
  h += '<div style="display:flex;justify-content:space-between;font-size:.9rem;font-weight:700;color:var(--white);"><span>Total</span><span class="mono" style="color:var(--lime);">&#163;' + fmtNum(total) + '</span></div>';
  h += '</div></div>';

  // Notes + outstanding
  if (po.notes) {
    h += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.8rem 1rem;' + (po.outstandingItems?'margin-bottom:.6rem;':'') + '">';
    h += '<div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.28rem;">Supplier Notes</div>';
    h += '<div style="font-size:.77rem;color:var(--off2);line-height:1.6;">' + po.notes + '</div>';
    h += '</div>';
  }
  if (po.outstandingItems) {
    h += '<div style="background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.28);border-radius:8px;padding:.8rem 1rem;">';
    h += '<div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--orange);margin-bottom:.28rem;">&#9888; Outstanding Items</div>';
    h += '<div style="font-size:.77rem;color:var(--orange);line-height:1.6;">' + po.outstandingItems + '</div>';
    h += '</div>';
  }

  // Journal section — linked project journal
  if (pj) {
    var jEntries = pj.journal || [];
    h += '<div style="margin-top:1.25rem;">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">';
    h += '<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.08em;color:var(--off4);">Project Journal &mdash; '+pj.code+'</div>';
    h += '<button class="btn btn-xs" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.3);" onclick="openJournalModal(\''+pj.id+'\',null)">+ Add Entry</button>';
    h += '</div>';
    h += renderJournalTimeline(pj.id, jEntries, 3);
    if (jEntries.length > 3) h += '<div style="text-align:center;margin-top:.5rem;"><button class="btn btn-dark btn-xs" onclick="renderProjectDetailTab(\''+pj.id+'\',\'journal\')">View all '+jEntries.length+' entries in Projects &rarr;</button></div>';
    h += '</div>';
  }

  document.getElementById('proc-po-detail-body').innerHTML = h;
  openModal('modal-proc-po-detail');
}
