/* ═══ CONTRAQ — SPEC READER ═══
   M&E specification analysis powered by
   the server-side knowledge base (KB v5.0).
   Sends spec PDFs to /api/specs/analyse and renders
   structured requirements, schedules, and flags.
═══════════════════════════════════════════ */

var _srFiles = [];
var _srResult = null;

/* ── Open the modal ───────────────────────────────────────────── */
function openSpecReader() {
  _srFiles = [];
  _srResult = null;
  document.getElementById('sr-phase-upload').style.display = '';
  document.getElementById('sr-phase-progress').style.display = 'none';
  document.getElementById('sr-phase-results').style.display = 'none';
  document.getElementById('sr-error').style.display = 'none';
  document.getElementById('sr-dropzone').style.display = '';
  document.getElementById('sr-file-list').style.display = 'none';
  document.getElementById('sr-file-items').innerHTML = '';
  document.getElementById('sr-analyse-btn').style.display = 'none';
  document.getElementById('sr-export-btn').style.display = 'none';
  document.getElementById('sr-title').textContent = 'Spec Reader';
  var fi = document.getElementById('sr-file-input'); if (fi) fi.value = '';
  openModal('modal-spec-reader');
}

/* ── File handling ────────────────────────────────────────────── */
function srHandleDrop(e) {
  document.getElementById('sr-dropzone').style.borderColor = 'rgba(163,230,53,.35)';
  var files = e.dataTransfer ? e.dataTransfer.files : null;
  if (files && files.length) srFilesSelected(files);
}

function srFilesSelected(files) {
  _srFiles = Array.from(files).filter(function(f) {
    return /\.(pdf|docx)$/i.test(f.name);
  });
  if (!_srFiles.length) {
    showToast('Please select PDF or DOCX specification files.', 'error');
    return;
  }
  document.getElementById('sr-file-items').innerHTML = _srFiles.map(function(f) {
    var ext = f.name.split('.').pop().toUpperCase();
    var c = ext === 'PDF' ? '#f87171' : '#60a5fa';
    var size = f.size > 1024*1024 ? (f.size/(1024*1024)).toFixed(1)+' MB' : Math.round(f.size/1024)+' KB';
    return '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem;">'
      + '<span style="font-family:var(--mono);font-size:.55rem;background:'+c+'22;color:'+c+';border:1px solid '+c+'44;border-radius:3px;padding:.05rem .3rem;">'+ext+'</span>'
      + '<span>'+f.name+'</span>'
      + '<span style="color:var(--off4);margin-left:auto;">'+size+'</span>'
      + '</div>';
  }).join('');
  document.getElementById('sr-file-list').style.display = '';
  document.getElementById('sr-analyse-btn').style.display = 'inline-flex';
}

/* ── Read file as base64 ──────────────────────────────────────── */
function _srReadBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = function() { reject(new Error('Failed to read ' + file.name)); };
    reader.readAsDataURL(file);
  });
}

/* ── Start analysis ───────────────────────────────────────────── */
function srStartAnalysis() {
  if (!_srFiles.length) return;

  document.getElementById('sr-phase-upload').style.display = 'none';
  document.getElementById('sr-phase-progress').style.display = '';
  document.getElementById('sr-analyse-btn').style.display = 'none';
  document.getElementById('sr-error').style.display = 'none';
  document.getElementById('sr-title').textContent = 'Analysing ' + _srFiles.length + ' specification' + (_srFiles.length > 1 ? 's' : '') + '\u2026';

  var bar = document.getElementById('sr-progress-bar');
  var step = document.getElementById('sr-progress-step');
  var detail = document.getElementById('sr-progress-detail');

  bar.style.width = '10%';
  step.textContent = 'Reading specification documents\u2026';
  detail.textContent = _srFiles.length + ' file' + (_srFiles.length > 1 ? 's' : '');

  var readPromises = _srFiles.map(function(f) {
    return _srReadBase64(f).then(function(b64) {
      var ext = f.name.split('.').pop().toLowerCase();
      return { name: f.name, ext: ext, base64: b64 };
    });
  });

  Promise.all(readPromises).then(function(fileData) {
    bar.style.width = '30%';
    step.textContent = 'Preparing for AI analysis\u2026';

    var contentBlocks = [];
    fileData.forEach(function(fd) {
      if (fd.ext === 'pdf') {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: fd.base64 }
        });
      }
      contentBlocks.push({ type: 'text', text: 'Filename: ' + fd.name });
    });

    var _rulesCtx = (typeof getLearnedRulesPrompt === 'function') ? getLearnedRulesPrompt() : '';
    var _auditCtx = (typeof getSelfAuditPrompt === 'function') ? getSelfAuditPrompt() : '';

    contentBlocks.push({
      type: 'text',
      text: 'Analyse all uploaded specification documents. Extract every M&E requirement by trade, identify schedules, flag contradictions and missing information. Cross-reference against NRM2 and BSRIA defaults. Return JSON only.'
        + _rulesCtx + _auditCtx
    });

    bar.style.width = '45%';
    step.textContent = 'Claude AI reading specification\u2026';
    detail.textContent = 'Knowledge Base v4.1 \u00b7 NRM2 + BSRIA + NBS';

    var crawl = setInterval(function() {
      var w = parseFloat(bar.style.width);
      if (w < 85) bar.style.width = (w + 2) + '%';
    }, 1500);

    return fetch(CONTRAQ_API_BASE + '/api/specs/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        messages: [{ role: 'user', content: contentBlocks }]
      })
    }).then(function(resp) {
      clearInterval(crawl);
      bar.style.width = '90%';
      step.textContent = 'Processing results\u2026';

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

      _srResult = JSON.parse(jMatch[0]);

      bar.style.width = '100%';
      step.textContent = 'Analysis complete \u2714';

      setTimeout(function() { srRenderResults(_srResult); }, 400);
    });
  }).catch(function(err) {
    console.error('[Contraq Spec Reader]', err);
    bar.style.width = '100%';
    bar.style.background = '#f87171';
    step.textContent = '\u26a0 Analysis failed';

    var msg = String(err.message || 'Unexpected error');
    if (/401|403|auth|key/i.test(msg)) msg = 'API authentication error \u2014 check server configuration.';
    if (/429|rate/i.test(msg)) msg = 'Rate limit reached \u2014 please wait a moment and try again.';
    if (/502|proxy/i.test(msg)) msg = 'Could not reach AI service \u2014 is the API server running?';

    document.getElementById('sr-error').innerHTML =
      '<div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:var(--radius2);padding:.85rem;">'
      + '<div style="color:#f87171;font-weight:600;font-size:.8rem;margin-bottom:.3rem;">\u26a0 Spec analysis unavailable</div>'
      + '<div style="font-size:.72rem;color:#8a9099;">' + msg + '</div>'
      + '<div style="font-size:.68rem;color:#525860;margin-top:.35rem;">Check that the Contraq API server is running on port 3001.</div>'
      + '</div>';
    document.getElementById('sr-error').style.display = '';

    setTimeout(function() {
      document.getElementById('sr-analyse-btn').style.display = 'inline-flex';
      document.getElementById('sr-phase-upload').style.display = '';
      bar.style.width = '0%';
      bar.style.background = '';
      document.getElementById('sr-phase-progress').style.display = 'none';
    }, 1600);
  });
}

/* ── Render results ───────────────────────────────────────────── */
function srRenderResults(data) {
  document.getElementById('sr-phase-progress').style.display = 'none';
  document.getElementById('sr-phase-results').style.display = '';
  document.getElementById('sr-export-btn').style.display = 'inline-flex';
  document.getElementById('sr-title').textContent = 'Specification Analysis';

  var reqs = data.spec_requirements || [];
  var schedules = data.schedules_found || [];
  var flags = data.flags || [];

  /* Count by trade */
  var tradeCounts = {};
  var mandatoryCount = 0;
  reqs.forEach(function(r) {
    var t = r.trade || 'Unknown';
    if (!tradeCounts[t]) tradeCounts[t] = 0;
    tradeCounts[t]++;
    if (r.mandatory) mandatoryCount++;
  });

  /* Summary */
  var summaryHtml = '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.75rem;">';
  summaryHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:100px;">'
    + '<div style="font-family:var(--mono);font-size:1.1rem;color:var(--white);font-weight:700;">' + reqs.length + '</div>'
    + '<div style="font-size:.62rem;color:var(--off4);">Requirements</div></div>';

  summaryHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:100px;">'
    + '<div style="font-family:var(--mono);font-size:1.1rem;color:var(--orange);font-weight:700;">' + mandatoryCount + '</div>'
    + '<div style="font-size:.62rem;color:var(--off4);">Mandatory</div></div>';

  Object.keys(tradeCounts).forEach(function(trade) {
    var tradeColor = trade === 'Mechanical' ? 'var(--orange)' : trade === 'Electrical' ? '#60a5fa' : 'var(--lime)';
    summaryHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:100px;">'
      + '<div style="font-family:var(--mono);font-size:1.1rem;color:' + tradeColor + ';font-weight:700;">' + tradeCounts[trade] + '</div>'
      + '<div style="font-size:.62rem;color:var(--off4);">' + trade + '</div></div>';
  });

  if (schedules.length) {
    summaryHtml += '<div style="background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.2);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:100px;">'
      + '<div style="font-family:var(--mono);font-size:1.1rem;color:#60a5fa;font-weight:700;">' + schedules.length + '</div>'
      + '<div style="font-size:.62rem;color:var(--off4);">Schedules found</div></div>';
  }

  if (flags.length) {
    summaryHtml += '<div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:100px;">'
      + '<div style="font-family:var(--mono);font-size:1.1rem;color:var(--yellow);font-weight:700;">' + flags.length + '</div>'
      + '<div style="font-size:.62rem;color:var(--off4);">Flags raised</div></div>';
  }
  summaryHtml += '</div>';

  if (data.project_reference) {
    summaryHtml += '<div style="font-family:var(--mono);font-size:.62rem;color:var(--off3);margin-bottom:.5rem;">Project: ' + data.project_reference + '</div>';
  }

  document.getElementById('sr-results-summary').innerHTML = summaryHtml;

  /* Requirements table */
  var reqHtml = '<div style="font-size:.78rem;color:var(--white);font-weight:600;margin-bottom:.4rem;">Specification Requirements</div>';
  reqHtml += '<div class="card" style="padding:0;"><div style="overflow-x:auto;"><table class="tbl"><thead><tr>'
    + '<th style="width:80px;">Trade</th>'
    + '<th>Requirement</th>'
    + '<th style="width:90px;">Ref</th>'
    + '<th style="width:50px;">Mand.</th>'
    + '<th>Notes</th>'
    + '</tr></thead><tbody>';

  reqs.forEach(function(r) {
    var tradeColor = r.trade === 'Mechanical' ? 'var(--orange)' : r.trade === 'Electrical' ? '#60a5fa' : 'var(--lime)';
    var tradeBg = r.trade === 'Mechanical' ? 'rgba(249,115,22,.08)' : r.trade === 'Electrical' ? 'rgba(96,165,250,.08)' : 'rgba(163,230,53,.08)';

    reqHtml += '<tr>'
      + '<td><span style="font-family:var(--mono);font-size:.54rem;background:' + tradeBg + ';color:' + tradeColor + ';border:1px solid ' + tradeColor + '33;border-radius:3px;padding:.1rem .3rem;">' + (r.trade || '\u2014') + '</span></td>'
      + '<td style="font-size:.72rem;color:var(--white);">' + (r.requirement || '\u2014') + '</td>'
      + '<td class="mono" style="font-size:.64rem;color:var(--off3);">' + (r.spec_reference || '\u2014') + '</td>'
      + '<td style="text-align:center;">' + (r.mandatory ? '<span style="color:var(--orange);font-weight:700;font-size:.7rem;">\u2713</span>' : '<span style="color:var(--off4);font-size:.68rem;">\u2014</span>') + '</td>'
      + '<td style="font-size:.66rem;color:var(--off4);max-width:180px;overflow:hidden;text-overflow:ellipsis;" title="' + (r.notes || '').replace(/"/g, '&quot;') + '">' + (r.notes || '\u2014') + '</td>'
      + '</tr>';
  });

  reqHtml += '</tbody></table></div></div>';
  document.getElementById('sr-results-requirements').innerHTML = reqHtml;

  /* Schedules */
  if (schedules.length) {
    var schHtml = '<div style="font-size:.78rem;color:var(--white);font-weight:600;margin-bottom:.4rem;">Schedules Found</div>';
    schedules.forEach(function(s) {
      schHtml += '<div style="background:rgba(96,165,250,.04);border:1px solid rgba(96,165,250,.12);border-radius:var(--radius2);padding:.55rem .7rem;margin-bottom:.35rem;">'
        + '<div style="font-size:.74rem;color:#60a5fa;font-weight:500;">' + (s.schedule_type || 'Unknown schedule') + '</div>'
        + '<div style="font-size:.66rem;color:var(--off3);margin-top:.15rem;">' + (s.content_summary || '') + '</div>'
        + '</div>';
    });
    document.getElementById('sr-results-schedules').innerHTML = schHtml;
  } else {
    document.getElementById('sr-results-schedules').innerHTML = '';
  }

  /* Flags */
  if (flags.length) {
    var flagsHtml = '<div style="font-size:.78rem;color:var(--yellow);font-weight:600;margin-bottom:.4rem;">\u26a0 ' + flags.length + ' flag' + (flags.length !== 1 ? 's' : '') + ' raised</div>';
    flags.forEach(function(flag) {
      flagsHtml += '<div style="background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.12);border-radius:var(--radius2);padding:.55rem .7rem;margin-bottom:.35rem;">'
        + '<div style="font-size:.74rem;color:var(--yellow);font-weight:500;">' + (flag.issue || '') + '</div>'
        + (flag.spec_reference ? '<div style="font-family:var(--mono);font-size:.6rem;color:var(--off4);margin-top:.15rem;">Ref: ' + flag.spec_reference + '</div>' : '')
        + (flag.recommendation ? '<div style="font-size:.66rem;color:var(--off3);margin-top:.2rem;">\u2192 ' + flag.recommendation + '</div>' : '')
        + '</div>';
    });
    document.getElementById('sr-results-flags').innerHTML = flagsHtml;
  } else {
    document.getElementById('sr-results-flags').innerHTML = '';
  }
}

/* ── Export results as JSON ────────────────────────────────────── */
function srExportResults() {
  if (!_srResult) return;
  var json = JSON.stringify(_srResult, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'contraq-spec-analysis-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('\u2714 Spec analysis exported as JSON', 'success');
}
