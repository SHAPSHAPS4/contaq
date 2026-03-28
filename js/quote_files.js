/* ═══ CONTRAQ — QUOTE_FILES ═══
   JSZip loading, quote file reading, AI analysis, tender detail view
   Lines 13645-14400 from contraq-v77
═══════════════════════════════════════════ */

var _qfJsZipLoading = false;
function qfLoadJsZip() {
  return new Promise(function(resolve, reject) {
    if (window.JSZip) { resolve(); return; }
    if (_qfJsZipLoading) {
      var poll = setInterval(function() { if (window.JSZip) { clearInterval(poll); resolve(); } }, 60);
      return;
    }
    _qfJsZipLoading = true;
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    s.onload  = function() { resolve(); };
    s.onerror = function() { reject(new Error('JSZip failed to load')); };
    document.head.appendChild(s);
  });
}

/* ── DOCX → plain text via JSZip ────────────────────────────────── */
async function qfExtractDocxText(arrayBuffer) {
  try {
    await qfLoadJsZip();
    var zip  = await JSZip.loadAsync(arrayBuffer);
    var main = zip.file('word/document.xml');
    if (!main) return null;
    var xml  = await main.async('string');
    var text = xml
      .replace(/<w:br[^>]*\/?>/gi, '\n')
      .replace(/<w:p[\s>]/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
    return text.slice(0, 9000);
  } catch(e) { return null; }
}

/* ── XLSX → plain text via JSZip (shared strings + sheet values) ── */
async function qfExtractXlsxText(arrayBuffer) {
  try {
    await qfLoadJsZip();
    var zip     = await JSZip.loadAsync(arrayBuffer);
    var texts   = [];
    /* shared strings table */
    var ssFile  = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      var ssXml = await ssFile.async('string');
      (ssXml.match(/<t[^>]*>([^<]+)<\/t>/g) || []).forEach(function(m) {
        var t = m.replace(/<[^>]+>/g,'').trim();
        if (t) texts.push(t);
      });
    }
    /* sheet1 inline strings */
    var sh1 = zip.file('xl/worksheets/sheet1.xml');
    if (sh1) {
      var shXml = await sh1.async('string');
      (shXml.match(/<is><t>([^<]+)<\/t><\/is>/g) || []).forEach(function(m) {
        var t = m.replace(/<[^>]+>/g,'').trim();
        if (t) texts.push(t);
      });
    }
    return texts.join(' | ').slice(0, 9000);
  } catch(e) { return null; }
}

/* ── File → Anthropic content block ────────────────────────────── */
function qfReadFileForClaude(file) {
  var ext = (file.name.split('.').pop() || '').toLowerCase();
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();

    if (ext === 'pdf') {
      /* PDFs: native Anthropic document type */
      reader.onload = function(e) {
        resolve({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: e.target.result.split(',')[1] }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);

    } else if (ext === 'docx' || ext === 'doc' || ext === 'xlsx' || ext === 'xls') {
      /* Office formats: extract text via JSZip, fallback to raw ASCII scan */
      reader.onload = async function(e) {
        try {
          var text = null;
          if (ext === 'docx' || ext === 'doc') {
            text = await qfExtractDocxText(e.target.result);
          } else {
            text = await qfExtractXlsxText(e.target.result);
          }
          if (text && text.length > 40) {
            resolve({ type: 'text', text: '[File: ' + file.name + ']\n\n' + text });
            return;
          }
          /* Fallback: scan raw bytes for printable ASCII runs */
          var arr = new Uint8Array(e.target.result);
          var raw = '', run = '';
          for (var i = 0; i < Math.min(arr.length, 80000); i++) {
            var b = arr[i];
            if (b >= 32 && b < 127) { run += String.fromCharCode(b); }
            else {
              if (run.length >= 4) raw += run + ' ';
              run = '';
            }
          }
          raw = raw.replace(/\s{3,}/g, ' ').trim();
          if (raw.length > 60) {
            resolve({ type: 'text', text: '[File: ' + file.name + ' — raw text extract]\n\n' + raw.slice(0, 7000) });
          } else {
            resolve({ type: 'text', text: '[File: ' + file.name + ']\n[Binary content — limited text could be extracted. Use filename and any visible metadata to infer project details.]' });
          }
        } catch(err) {
          resolve({ type: 'text', text: '[File: ' + file.name + ']\n[Extraction error: ' + err.message + ']' });
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);

    } else {
      /* Plain text fallback */
      reader.onload = function(e) {
        resolve({ type: 'text', text: '[File: ' + file.name + ']\n\n' + String(e.target.result).slice(0, 9000) });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    }
  });
}

/* ── Add pending files to tender data model ─────────────────────── */
function qfAddFilesToTender() {
  var t = TENDERS.find(function(x){ return x.id === STATE.qfUploadTenderId; });
  if (!t) return [];
  if (!t.quoteFiles) t.quoteFiles = [];
  var today    = new Date().toISOString().split('T')[0];
  var newFiles = [];
  (STATE._qfPendingFiles || []).forEach(function(f) {
    var rev     = qfGuessRevision(f.name);
    var ftype   = qfGuessType(f.name);
    var sizekb  = Math.round(f.size / 1024);
    var sizeStr = sizekb > 1000 ? (sizekb / 1024).toFixed(1) + ' MB' : sizekb + ' KB';
    newFiles.push({
      id: 'qf-' + t.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      filename: f.name, fileType: ftype, revision: rev, date: today, size: sizeStr, status: 'Latest'
    });
  });
  var all = newFiles.concat(t.quoteFiles);
  all.sort(function(a, b){ return qfRevRank(b.revision) - qfRevRank(a.revision); });
  var seen = {};
  all.forEach(function(f) {
    var base = f.filename
      .replace(/[_-]?rev[-_]?[a-zA-Z0-9]+\./i, '.')
      .replace(/[_-]?v\d+\./i, '.')
      .replace(/[_-]?[Rr]\d+\./, '.');
    f.status = seen[base] ? 'Superseded' : 'Latest';
    seen[base] = true;
  });
  t.quoteFiles = all;
  return newFiles;
}

/* ── Render AI result banner ─────────────────────────────────────── */
function qfShowAIResults(d, addedFiles) {
  document.getElementById('qf-progress-wrap').style.display = 'none';

  /* ── Confidence colours (safe hex, no CSS vars in dynamic attrs) */
  var confHex = d.confidence === 'high' ? '#a3e635' : d.confidence === 'medium' ? '#fbbf24' : '#f97316';

  var html = '';

  /* File summary rows */
  if (addedFiles && addedFiles.length) {
    html += '<div style="margin-bottom:.6rem;">';
    addedFiles.forEach(function(f) {
      html += '<div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.2rem;">'
            + '<span style="color:#a3e635;font-size:.8rem;">✓</span>'
            + '<span style="font-size:.72rem;color:#e2e6ea;"><strong style="color:#f4f5f6;">' + f.filename + '</strong>'
            + ' — Rev ' + f.revision + ' · ' + f.fileType + ' · ' + f.size + '</span></div>';
    });
    html += '</div>'
          + '<div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:.6rem;"></div>';
  }

  /* Extracted fields grid */
  var fields = [
    ['Project Name',   d.projectName],
    ['Client / MC',    d.clientName],
    ['Est. Value',     d.estimatedValue ? '£' + Number(d.estimatedValue).toLocaleString('en-GB') : null],
    ['Trade Type',     d.tradeType ? d.tradeType.charAt(0).toUpperCase() + d.tradeType.slice(1) : null],
    ['Contract Form',  d.contractForm],
    ['Retention',      d.retentionPercent != null ? d.retentionPercent + '%' : null]
  ];
  var fieldRows = fields.filter(function(r){ return r[1]; });
  if (fieldRows.length) {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem .85rem;margin-bottom:.55rem;">';
    fieldRows.forEach(function(r) {
      html += '<div>'
            + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.07em;color:#525860;margin-bottom:.1rem;">' + r[0] + '</div>'
            + '<div style="font-size:.74rem;color:#f4f5f6;font-weight:500;">' + r[1] + '</div>'
            + '</div>';
    });
    html += '</div>';
  }

  /* Programme dates */
  if (d.programmeDates) {
    var pd = d.programmeDates;
    var dates = [];
    if (pd.startDate)           dates.push(['Start',      pd.startDate, '#60a5fa']);
    if (pd.completionDate)      dates.push(['Completion', pd.completionDate, '#a3e635']);
    if (pd.submissionDeadline)  dates.push(['Submission', pd.submissionDeadline, '#f97316']);
    if (dates.length) {
      html += '<div style="margin-bottom:.55rem;padding:.45rem .55rem;background:rgba(255,255,255,.03);border-radius:6px;">'
            + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.07em;color:#525860;margin-bottom:.3rem;">Programme Dates</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:.6rem 1.2rem;">';
      dates.forEach(function(d) {
        html += '<span style="font-size:.71rem;color:#8a9099;">' + d[0] + ': <strong style="color:' + d[2] + ';">' + d[1] + '</strong></span>';
      });
      html += '</div></div>';
    }
  }

  /* Key materials tags */
  if (d.keyMaterials && d.keyMaterials.length) {
    html += '<div style="margin-bottom:.55rem;">'
          + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.07em;color:#525860;margin-bottom:.3rem;">Key Materials</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:.25rem;">';
    d.keyMaterials.slice(0, 10).forEach(function(m) {
      html += '<span style="font-size:.67rem;background:rgba(249,115,22,.09);color:#fb923c;border:1px solid rgba(249,115,22,.22);border-radius:4px;padding:.1rem .38rem;">' + m + '</span>';
    });
    html += '</div></div>';
  }

  /* Scope summary */
  if (d.scope) {
    html += '<div style="margin-bottom:.55rem;font-size:.72rem;color:#c8cdd4;line-height:1.6;font-style:italic;border-left:2px solid rgba(249,115,22,.35);padding-left:.55rem;">'
          + d.scope + '</div>';
  }

  /* Footer row: confidence + pre-fill button */
  html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.4rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.06);">'
        + '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:.48rem;text-transform:uppercase;letter-spacing:.07em;color:' + confHex + ';background:' + confHex + '18;border:1px solid ' + confHex + '44;border-radius:3px;padding:.15rem .45rem;">AI Confidence: ' + (d.confidence || '?').toUpperCase() + '</span>'
        + '<button class="btn btn-xs" style="background:rgba(163,230,53,.10);color:#a3e635;border:1px solid rgba(163,230,53,.28);font-size:.68rem;" onclick="qfPrefillAndOpenForm()">✏ Pre-fill Quote Form →</button>'
        + '</div>';

  document.getElementById('qf-ai-result').innerHTML = html;
  document.getElementById('qf-ai-banner').style.display = '';

  /* Show "Close & View" in footer, relabel Cancel */
  var cancelBtn = document.getElementById('qf-cancel-btn');
  var viewBtn   = document.getElementById('qf-view-tender-btn');
  if (cancelBtn) cancelBtn.textContent = 'Close';
  if (viewBtn)   viewBtn.style.display = '';
}

/* ── Pre-fill the quote (tender) form with Claude-extracted data ── */
function qfPrefillAndOpenForm() {
  var d = STATE._qfAIExtracted;
  if (!d) return;
  closeModal('modal-quote-file-upload');
  setTimeout(function() {
    if (STATE.qfUploadTenderId) {
      openTenderModal(STATE.qfUploadTenderId);
      setTimeout(function() {
        /* Name */
        if (d.projectName) {
          var el = document.getElementById('tnd-name');
          if (el && !el.value) el.value = d.projectName;
        }
        /* Value */
        if (d.estimatedValue) {
          var el = document.getElementById('tnd-value');
          if (el && !el.value) el.value = d.estimatedValue;
        }
        /* Client — try fuzzy match against CLIENTS list */
        if (d.clientName && typeof CLIENTS !== 'undefined') {
          var lower = d.clientName.toLowerCase();
          var match = CLIENTS.find(function(c) {
            return c.name.toLowerCase().indexOf(lower) >= 0 || lower.indexOf(c.name.toLowerCase()) >= 0;
          });
          if (match) {
            var sel = document.getElementById('tnd-client');
            if (sel) sel.value = match.id;
          }
        }
        /* Programme dates */
        if (d.programmeDates) {
          var pd = d.programmeDates;
          if (pd.startDate) {
            var el = document.getElementById('tnd-enquiry');
            if (el && !el.value) el.value = pd.startDate;
          }
          if (pd.submissionDeadline) {
            var el = document.getElementById('tnd-submit');
            if (el && !el.value) el.value = pd.submissionDeadline;
          }
          if (pd.completionDate) {
            var el = document.getElementById('tnd-decision');
            if (el && !el.value) el.value = pd.completionDate;
          }
        }
        /* Notes — compose from extracted fields */
        var notesEl = document.getElementById('tnd-notes');
        if (notesEl) {
          var parts = [];
          if (d.scope) parts.push(d.scope);
          if (d.keyMaterials && d.keyMaterials.length) parts.push('Materials: ' + d.keyMaterials.join(', '));
          if (d.contractForm)        parts.push('Contract form: ' + d.contractForm);
          if (d.retentionPercent != null) parts.push('Retention: ' + d.retentionPercent + '%');
          if (parts.length && !notesEl.value) notesEl.value = parts.join('\n');
        }
        showToast('✔ Quote form pre-filled from AI analysis', 'success');
      }, 160);
    }
  }, 220);
}

/* ── Close modal then reopen tender detail ───────────────────────── */
function qfCloseThenView() {
  var tid = STATE.qfUploadTenderId;
  closeModal('modal-quote-file-upload');
  if (tid) {
    setTimeout(function() { openTenderDetailView(tid); }, 180);
  }
}

/* ── MAIN: qfStartAnalysis — real Claude API call ────────────────── */
async function qfStartAnalysis() {
  if (!STATE._qfPendingFiles || !STATE._qfPendingFiles.length) {
    showToast('Select at least one file.', 'error'); return;
  }

  var analyseBtn   = document.getElementById('qf-analyse-btn');
  var progressWrap = document.getElementById('qf-progress-wrap');
  var bar          = document.getElementById('qf-progress-bar');
  var lbl          = document.getElementById('qf-progress-label');
  var errDiv       = document.getElementById('qf-err');

  /* Reset UI into loading state */
  analyseBtn.style.display   = 'none';
  progressWrap.style.display = '';
  document.getElementById('qf-ai-banner').style.display = 'none';
  errDiv.style.display = 'none';
  bar.style.width      = '5%';
  bar.style.background = '';
  lbl.style.color      = '';

  /* ── Helper: animated label steps (non-blocking) */
  function setStep(pct, msg) {
    bar.style.width  = pct + '%';
    lbl.textContent  = msg;
  }

  try {
    /* STEP 1 — Read file content */
    setStep(10, 'Reading file…');
    var primaryFile = STATE._qfPendingFiles[0];
    var contentBlock;
    try {
      contentBlock = await qfReadFileForClaude(primaryFile);
    } catch(e) {
      throw new Error('Could not read file — ' + e.message);
    }

    /* STEP 2 — Prepare API payload */
    setStep(28, 'Preparing UK construction prompt…');

    var SYSTEM_PROMPT = [
      'You are a specialist document analyst embedded in Contraq, a platform used by UK insulation and trade subcontractors.',
      'Analyse the uploaded quote, tender enquiry, BoQ, specification, or programme document and extract structured project data.',
      '',
      'DOMAIN KNOWLEDGE — you understand:',
      '• NBS specifications, Preliminaries, Measured Work, Bill of Quantities (BoQ), Schedule of Rates',
      '• Insulation types: ductwork lagging, pipe insulation, PIR board, mineral wool, phenolic foam (PB), acoustic insulation, CWI, ECO scheme',
      '• Passive fire protection: intumescent coatings, fire collars, fire stopping, IFC (Installed Fire Control)',
      '• M&E trades: ductwork, LTHW/CHW pipework, sprinklers, FCUs, AHUs, VRF/VRV systems',
      '• Payment terms: payment applications (ValApp / Application for Payment), retention (3–5%), defects liability period (DLP), final account, interim certificates',
      '• Programme: possession date, practical completion (PC), sectional completion, float, extension of time (EOT)',
      '• Contract forms: JCT Design & Build, JCT Measured Term, NEC3, NEC4, DOM/1, FAC-1, FIDIC',
      '• UK Tier-1 main contractors: Balfour Beatty, Skanska, Morgan Sindall, Mace, Vinci, Kier, Wates, ISG, BAM, Laing O\'Rourke, Galliford Try, Sir Robert McAlpine, Multiplex, Turner & Townsend, Mott MacDonald',
      '• UK regions, postcodes, borough and county references; GLA (Greater London Authority) projects; Homes England schemes',
      '',
      'TASK: Return ONLY a valid JSON object — no markdown fences, no preamble, no explanation.',
      '',
      'JSON schema:',
      '{',
      '  "projectName": "string or null",',
      '  "clientName": "string or null — main contractor or direct client name",',
      '  "estimatedValue": number or null,',
      '  "tradeType": "insulation|electrical|plumbing|hvac|mechanical|fire-protection|groundworks|other or null",',
      '  "keyMaterials": ["up to 10 specific materials, products or specs mentioned"],',
      '  "programmeDates": {',
      '    "startDate": "YYYY-MM-DD or null",',
      '    "completionDate": "YYYY-MM-DD or null",',
      '    "submissionDeadline": "YYYY-MM-DD or null"',
      '  },',
      '  "scope": "1–2 sentence plain-English summary of the subcontract scope of works",',
      '  "retentionPercent": number or null,',
      '  "contractForm": "JCT|NEC3|NEC4|DOM/1|other string or null",',
      '  "confidence": "high|medium|low"',
      '}'
    ].join('\n');

    /* STEP 3 — Call Claude API */
    setStep(42, 'Calling Claude AI (UK construction specialist)\u2026');

    var apiResponse = await fetch(CONTRAQ_API_BASE + '/api/quote-files/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              contentBlock,
              { type: 'text', text: 'Please analyse this document and return the JSON object with extracted construction project data. No extra text \u2014 JSON only.' }
            ]
          }
        ]
      })
    });

    setStep(72, 'Processing Claude AI response…');

    if (!apiResponse.ok) {
      var errBody = {};
      try { errBody = await apiResponse.json(); } catch(e) {}
      var msg = (errBody.error && errBody.error.message) ? errBody.error.message : ('HTTP ' + apiResponse.status);
      throw new Error('Claude API error — ' + msg);
    }

    var apiData = await apiResponse.json();

    /* STEP 4 — Parse JSON from Claude response */
    setStep(88, 'Extracting construction data…');

    var rawText = '';
    if (apiData.content && Array.isArray(apiData.content)) {
      apiData.content.forEach(function(block) {
        if (block.type === 'text') rawText += block.text;
      });
    }

    var extracted;
    try {
      /* Strip accidental markdown fences */
      var cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      /* Grab first JSON object */
      var jMatch  = cleaned.match(/\{[\s\S]*\}/);
      if (!jMatch) throw new Error('No JSON object in response');
      extracted = JSON.parse(jMatch[0]);
    } catch(parseErr) {
      throw new Error('Could not parse AI response — document may be in an unsupported format. (' + parseErr.message + ')');
    }

    setStep(100, 'Done! ✔');

    /* STEP 5 — Add files to tender data model */
    var addedFiles = qfAddFilesToTender();

    /* STEP 6 — Store extracted data, render results */
    STATE._qfAIExtracted = extracted;
    qfShowAIResults(extracted, addedFiles);

    showToast('✔ Claude AI analysis complete — ' + addedFiles.length + ' file' + (addedFiles.length !== 1 ? 's' : '') + ' added', 'success');

  } catch(err) {
    /* ── Error state ── */
    console.error('[Contraq AI] qfStartAnalysis error:', err);
    bar.style.background = '#f87171';
    lbl.style.color      = '#f87171';
    setStep(100, '⚠ Analysis failed');

    setTimeout(function() {
      progressWrap.style.display = 'none';
      bar.style.background = '';
      lbl.style.color      = '';
      analyseBtn.style.display = '';

      var userMsg = String(err.message || 'Unexpected error');
      /* Simplify auth errors for end users */
      if (/401|403|auth|key/i.test(userMsg)) userMsg = 'API authentication error — check platform API key configuration.';
      if (/429|rate/i.test(userMsg))          userMsg = 'Rate limit reached — please wait a moment and try again.';

      errDiv.innerHTML = '<strong style="color:#f87171;">⚠ AI analysis unavailable</strong><br>'
        + '<span style="color:#8a9099;">' + userMsg + '</span><br>'
        + '<span style="font-size:.7rem;color:#525860;">You can still upload the file and fill in the quote details manually.</span>';
      errDiv.style.display = '';

      /* Still attach the files even without AI data */
      var addedFiles = qfAddFilesToTender();
      if (addedFiles.length) {
        /* Show minimal file-added result */
        var fallbackHtml = addedFiles.map(function(f) {
          return '<div style="display:flex;gap:.4rem;align-items:center;">'
               + '<span style="color:#a3e635;">✓</span>'
               + '<span style="font-size:.72rem;color:#e2e6ea;"><strong>' + f.filename + '</strong> — Rev ' + f.revision + ' · ' + f.size + '</span></div>';
        }).join('');
        fallbackHtml += '<div style="margin-top:.4rem;font-size:.68rem;color:#525860;">Files attached. AI extraction unavailable — fill quote details manually.</div>';
        document.getElementById('qf-ai-result').innerHTML = fallbackHtml;
        document.getElementById('qf-ai-banner').style.display = '';
        var viewBtn = document.getElementById('qf-view-tender-btn');
        if (viewBtn) viewBtn.style.display = '';
        var cancelBtn = document.getElementById('qf-cancel-btn');
        if (cancelBtn) cancelBtn.textContent = 'Close';
      }
    }, 1400);
  }
}

function qfGuessRevision(fn) {
  var base = fn.toLowerCase();
  var m;
  // Rev letter: RevC, Rev-B, Rev_A
  m = base.match(/rev[-_]?([a-z])\b/i); if (m) return m[1].toUpperCase();
  // _RevC at end
  m = base.match(/-rev([a-z])\./i); if (m) return m[1].toUpperCase();
  // _v2, -v3
  m = base.match(/[_-]v(\d+)\./i); if (m) return 'v' + m[1];
  // R2, R3
  m = base.match(/[_-][Rr](\d+)\./); if (m) return 'R' + m[1];
  // Draft
  if (base.indexOf('draft') >= 0) return 'Draft';
  return 'A';
}

function qfGuessType(fn) {
  var b = fn.toLowerCase();
  if (b.indexOf('.xlsx')>=0 || b.indexOf('.xls')>=0) return 'Spreadsheet';
  if (b.indexOf('.pdf')>=0) return 'PDF';
  if (b.indexOf('.docx')>=0 || b.indexOf('.doc')>=0) return 'Word';
  return 'File';
}

function qfRevRank(r) {
  if (!r) return -1;
  if (r.toLowerCase()==='draft') return -1;
  if (/^[A-Z]$/i.test(r)) return r.toUpperCase().charCodeAt(0);
  var n = parseInt(r); return isNaN(n) ? 0 : n;
}

function qfApplyUpload() {
  var t = TENDERS.find(function(x){return x.id===STATE.qfUploadTenderId;});
  if (!t) { closeModal('modal-quote-file-upload'); return; }
  if (!t.quoteFiles) t.quoteFiles = [];
  var today = new Date().toISOString().split('T')[0];
  var newFiles = [];
  (STATE._qfPendingFiles || []).forEach(function(f) {
    var rev = qfGuessRevision(f.name);
    var ftype = qfGuessType(f.name);
    var sizekb = Math.round(f.size / 1024);
    var sizeStr = sizekb > 1000 ? (sizekb/1024).toFixed(1) + ' MB' : sizekb + ' KB';
    newFiles.push({
      id: 'qf-' + t.id + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
      filename: f.name, fileType: ftype, revision: rev, date: today, size: sizeStr, status: 'Latest'
    });
  });
  // merge + re-sort to assign status
  var all = newFiles.concat(t.quoteFiles);
  all.sort(function(a,b){ return qfRevRank(b.revision) - qfRevRank(a.revision); });
  // Mark only highest rev as Latest
  var seen = {};
  all.forEach(function(f) {
    var base = f.filename.replace(/[_-]?rev[-_]?[a-zA-Z0-9]+\./i,'.').replace(/[_-]?v\d+\./i,'.').replace(/[_-]?[Rr]\d+\./,'.');
    if (!seen[base]) { f.status = 'Latest'; seen[base] = true; }
    else { f.status = 'Superseded'; }
  });
  t.quoteFiles = all;
  // Show AI banner
  document.getElementById('qf-progress-wrap').style.display = 'none';
  var insights = newFiles.map(function(f){
    return '<div style="display:flex;gap:.4rem;"><span style="color:var(--lime);">✓</span><span><strong style="color:var(--white);">' + f.filename + '</strong> — Rev ' + f.revision + ' · ' + f.fileType + ' · ' + f.size + '</span></div>';
  }).join('');
  document.getElementById('qf-ai-result').innerHTML = insights
    + '<div style="margin-top:.5rem;font-size:.7rem;color:var(--off3);">Revisions sorted, most recent at top. Older revisions marked Superseded.</div>';
  document.getElementById('qf-ai-banner').style.display = '';
  // Re-render tender detail
  setTimeout(function(){
    closeModal('modal-quote-file-upload');
    openTenderDetailView(STATE.qfUploadTenderId);
    showToast('✔ Quote file uploaded and organised — ' + newFiles.length + ' revision' + (newFiles.length!==1?'s':'') + ' added', 'success');
  }, 900);
}

function openTenderDetailView(tenderId) {
  var t = TENDERS.find(function(x){return x.id===tenderId;});
  if (!t) return;
  var cl = CLIENTS.find(function(c){return c.id===t.client;});
  var linkedProj = t.linkedProjectId ? PROJECTS.find(function(p){return p.id===t.linkedProjectId;}) : null;
  document.getElementById("tender-detail-title").textContent = t.ref + " — " + t.name.split("—")[0].trim();
  var sc = t.status==="won"?"#a3e635":t.status==="lost"?"#f87171":t.status==="submitted"?"#60a5fa":"#fbbf24";
  var sl = t.status.charAt(0).toUpperCase()+t.status.slice(1);
  var h = '<div style="background:var(--bg3);border:1.5px solid var(--border);border-radius:10px;padding:1rem 1.2rem;margin-bottom:.85rem;">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">'
    + '<div><div style="font-family:var(--mono);font-size:.52rem;text-transform:uppercase;letter-spacing:.1em;color:var(--orange);margin-bottom:.2rem;">Quote Reference</div>'
    + '<div style="font-size:1rem;font-weight:700;color:var(--white);">'+t.ref+'</div>'
    + '<div style="font-size:.78rem;color:var(--off2);margin-top:.1rem;">'+t.name+'</div></div>'
    + '<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .65rem;border-radius:5px;font-family:var(--mono);font-size:.6rem;font-weight:700;background:'+sc+'1a;color:'+sc+';border:1px solid '+sc+'55;">'
    + '<span style="width:6px;height:6px;border-radius:50%;background:'+sc+';display:inline-block;"></span>'+sl+'</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-top:.75rem;">';
  var meta = [["Client",cl?cl.name:t.clientName],["Value","\u00a3"+fmtNum(t.value)],["Enquiry",fmtDate(t.enquiry)],["Decision",t.decision?fmtDate(t.decision):"\u2014"]];
  meta.forEach(function(m){
    h += '<div><div style="font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);margin-bottom:.1rem;">'+m[0]+'</div>'
      + '<div style="font-size:.75rem;color:var(--white);">'+m[1]+'</div></div>';
  });
  h += '</div>';
  if (t.notes) h += '<div style="margin-top:.75rem;padding-top:.6rem;border-top:1px solid var(--border);font-size:.75rem;color:var(--off2);line-height:1.55;">'+t.notes+'</div>';
  if (linkedProj) h += '<div style="margin-top:.6rem;padding:.5rem .75rem;background:rgba(163,230,53,.06);border:1px solid rgba(163,230,53,.2);border-radius:6px;font-size:.73rem;color:var(--lime);">Linked to project: <strong>'+linkedProj.code+' — '+linkedProj.name.split("—")[0].trim()+'</strong></div>';
  h += '</div>';

  /* ── AI Line Items Section — Excel-style spreadsheet ─── */
  if (t.lineItems && t.lineItems.length > 0) {
    var meta = t.aiMetadata || {};
    var liTotal = t.lineItems.reduce(function(s,li){return s + li.total;}, 0);

    // Compact AI disclaimer
    h += '<div class="ai-disc-compact" onclick="this.classList.toggle(\'expanded\')" style="margin-bottom:.65rem">'
      + '<div class="ai-disc-compact-bar">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.7"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
      + '<span class="ai-disc-compact-text"><strong>AI-Generated Estimate</strong> \u2014 requires human verification before commercial use</span>'
      + '<span class="ai-kb-version">KB v'+(meta.kbVersion||KB_VERSION)+' \u00B7 '+(meta.kbVersionDate||KB_VERSION_DATE)+' \u00B7 '+(meta.kbSources||KB_VERSION_SOURCES)+' sources'
      + (meta.exportGateConfirmedAt ? ' \u00B7 \u2713 Gate '+new Date(meta.exportGateConfirmedAt).toLocaleDateString('en-GB') : '')
      + '</span>'
      + '<svg class="ai-disc-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'
      + '</div>'
      + '<div class="ai-disc-compact-detail">AI estimates based on BSRIA BG 85/87, BS 5422, NBS, CIBSE, NRM2. Not a substitute for professional QS. All values must be independently verified. '
      + '<a href="#" onclick="event.stopPropagation();event.preventDefault();showTermsOfService()" style="color:var(--orange)">Terms of Service \u2192</a></div>'
      + '</div>';

    // Compact extraction metadata row
    var totalItems = t.lineItems.length;
    var hc = (meta.highCount||0), mc = (meta.medCount||0), lc = (meta.lowCount||0);
    h += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.65rem;flex-wrap:wrap;font-family:var(--mono);font-size:.58rem;color:var(--off4)">'
      + '<span>\uD83E\uDDE0 AI Extraction</span>'
      + (meta.extractedAt ? '<span>'+new Date(meta.extractedAt).toLocaleDateString('en-GB')+'</span>' : '')
      + '<span style="display:inline-flex;gap:.35rem"><span style="color:var(--lime)">'+hc+' HIGH</span><span style="color:var(--yellow)">'+mc+' MED</span><span style="color:var(--red)">'+lc+' LOW</span></span>'
      + '<span style="color:var(--orange);font-weight:700">'+(meta.avgConfidence||0)+'% avg</span>'
      + (meta.sourceFiles&&meta.sourceFiles.length ? '<span>\uD83D\uDCCE '+meta.sourceFiles.join(' \u00B7 ')+'</span>' : '')
      + (meta.timeSavedHrs ? '<span>\u23F1 '+meta.timeSavedHrs+' hrs saved</span>' : '')
      + '</div>';

    // ── Excel-style toolbar ──
    h += '<div class="xl-toolbar">'
      + '<span class="xl-logo">\uD83D\uDCCA Contraq</span>'
      + '<span class="xl-filename">'+t.ref+' \u2014 Line Items</span>'
      + '<div style="margin-left:auto;display:flex;gap:.4rem">'
      + '<button class="xl-btn xl-btn-primary" onclick="qbExportSpreadsheet(\''+t.id+'\')">\uD83D\uDCE5 Export to Excel</button>'
      + '<button class="xl-btn" onclick="qbCopyLineItems(\''+t.id+'\')">\uD83D\uDCCB Copy</button>'
      + '<button class="xl-btn" onclick="qbReQuote(\''+t.id+'\')">\uD83D\uDD04 Re-quote</button>'
      + '</div></div>';

    // Formula bar
    h += '<div class="xl-formula-bar">'
      + '<span class="xl-cell-ref">H'+(totalItems+2)+'</span>'
      + '<span class="xl-fx">fx</span>'
      + '<span style="color:#333">=SUM(H2:H'+(totalItems+1)+') \u2192 <strong>\u00A3'+Math.round(liTotal).toLocaleString('en-GB')+'</strong></span>'
      + '</div>';

    // ── Spreadsheet table ──
    h += '<div class="xl-sheet-wrap">'
      + '<table class="xl-sheet"><thead><tr>'
      + '<th class="xl-rownum"></th>'
      + '<th style="width:24px"></th>'
      + '<th style="width:55px">Ref</th>'
      + '<th>Description</th>'
      + '<th class="xl-num" style="width:52px">Qty</th>'
      + '<th style="width:40px">Unit</th>'
      + '<th class="xl-num" style="width:64px">Rate (\u00A3)</th>'
      + '<th class="xl-num" style="width:72px">Total (\u00A3)</th>'
      + '<th style="width:42px">Status</th>'
      + '</tr></thead><tbody>';

    var _xlRow = 1;
    var _xlLastUE = '';
    var _xlGroupTotals = {};
    var _xlGroupQtys = {};

    t.lineItems.forEach(function(li) {
      var ue = li.unit_equip || '';
      if (ue && ue !== _xlLastUE) {
        h += '<tr class="xl-group-row"><td class="xl-rownum"></td><td colspan="8">\u2699\uFE0F ' + ue + '</td></tr>';
        _xlLastUE = ue;
        if (!_xlGroupTotals[ue]) { _xlGroupTotals[ue] = 0; _xlGroupQtys[ue] = 0; }
      }
      if (ue) {
        _xlGroupTotals[ue] = (_xlGroupTotals[ue]||0) + (li.total||0);
        _xlGroupQtys[ue] = (_xlGroupQtys[ue]||0) + (parseFloat(li.qty)||0);
      }

      var confClass = li.level==='high'?'xl-conf-high':li.level==='med'?'xl-conf-med':'xl-conf-low';
      var stateLabel = li.reviewState==='accepted'?'\u2713':li.reviewState==='flagged'?'\u2691':'\u2022';
      var stateClass = li.reviewState==='accepted'?'xl-status-accepted':li.reviewState==='flagged'?'xl-status-flagged':'';

      h += '<tr>'
        + '<td class="xl-rownum">'+_xlRow+'</td>'
        + '<td style="text-align:center"><span class="xl-conf '+confClass+'" title="'+li.conf+'% \u2014 '+(li.level==='high'?'High':li.level==='med'?'Medium':'Low')+'"></span></td>'
        + '<td style="font-size:.68rem;color:#666">'+li.ref+'</td>'
        + '<td style="font-size:.72rem;line-height:1.35">'
          + (li.service ? '<span style="font-size:.6rem;color:#217346;font-weight:600">\uD83D\uDD27 '+li.service+'</span> \u2014 ' : '')
          + li.desc
        + '</td>'
        + '<td class="xl-num" style="font-weight:600">'+li.qty+'</td>'
        + '<td style="font-size:.68rem;color:#666">'+li.unit+'</td>'
        + '<td class="xl-curr">\u00A3'+li.rate.toFixed(2)+'</td>'
        + '<td class="xl-curr" style="font-weight:600">\u00A3'+Math.round(li.total).toLocaleString('en-GB')+'</td>'
        + '<td style="text-align:center"><span class="xl-status '+stateClass+'" title="'+(li.reviewState||'unreviewed')+'">'+stateLabel+'</span></td>'
        + '</tr>';
      _xlRow++;
    });

    // Grand total row
    h += '<tr class="xl-grand">'
      + '<td class="xl-rownum"></td>'
      + '<td></td>'
      + '<td></td>'
      + '<td style="text-align:right">TOTAL (' + totalItems + ' items'
      + (meta.flaggedCount ? ' \u00B7 '+meta.flaggedCount+' flagged' : '') + ')</td>'
      + '<td></td><td></td><td></td>'
      + '<td class="xl-curr">\u00A3'+Math.round(liTotal).toLocaleString('en-GB')+'</td>'
      + '<td></td></tr>';

    h += '</tbody></table></div>';

    // Sheet tabs
    h += '<div class="xl-sheet-tabs">'
      + '<div class="xl-sheet-tab active">Line Items</div>'
      + '<div class="xl-sheet-tab">Summary</div>'
      + '</div>';

    // Collective intelligence — compact
    h += '<div style="display:flex;align-items:center;gap:.4rem;padding:.35rem .6rem;margin-top:.65rem;font-size:.58rem;color:var(--off4);font-family:var(--mono)">'
      + '<span>\uD83E\uDDE0</span>'
      + '<span><strong style="color:var(--lime)">Collective Intelligence</strong> \u2014 informed by '
      + (meta.kbVersion ? KB_VERSION_SOURCES+' sources' : 'industry sources')
      + '. Corrections improve accuracy for all users.</span>'
      + '</div>';
  }

  h += renderFoldersUI("tender", t.id, t.folders||{}, t.quoteFiles||[]);
  document.getElementById("tender-detail-body").innerHTML = h;
  openModal("modal-tender-detail");
}

/* ================================================================
   PROJECT JOURNAL
================================================================ */

