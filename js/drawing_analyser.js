/* ═══ CONTRAQ — DRAWING ANALYSER ═══
   Standalone M&E drawing extraction powered by
   the server-side knowledge base (KB v5.0).
   Sends PDFs to /api/drawings/extract and renders
   structured trade-categorised results.
═══════════════════════════════════════════ */

var _daFiles = [];
var _daResult = null;

/* ── Open the modal ───────────────────────────────────────────── */
function openDrawingAnalyser() {
  _daFiles = [];
  _daResult = null;
  document.getElementById('da-phase-upload').style.display = '';
  document.getElementById('da-phase-progress').style.display = 'none';
  document.getElementById('da-phase-results').style.display = 'none';
  document.getElementById('da-error').style.display = 'none';
  document.getElementById('da-dropzone').style.display = '';
  document.getElementById('da-file-list').style.display = 'none';
  document.getElementById('da-file-items').innerHTML = '';
  document.getElementById('da-analyse-btn').style.display = 'none';
  document.getElementById('da-export-btn').style.display = 'none';
  document.getElementById('da-title').textContent = 'Drawing Analyser';
  var fi = document.getElementById('da-file-input'); if (fi) fi.value = '';
  openModal('modal-drawing-analyser');
}

/* ── File handling ────────────────────────────────────────────── */
function daHandleDrop(e) {
  document.getElementById('da-dropzone').style.borderColor = 'rgba(249,115,22,.35)';
  var files = e.dataTransfer ? e.dataTransfer.files : null;
  if (files && files.length) daFilesSelected(files);
}

function daFilesSelected(files) {
  _daFiles = Array.from(files).filter(function(f) {
    return /\.(pdf|png|jpg|jpeg)$/i.test(f.name);
  });
  if (!_daFiles.length) {
    showToast('Please select PDF or image files (PNG, JPG).', 'error');
    return;
  }
  document.getElementById('da-file-items').innerHTML = _daFiles.map(function(f) {
    var ext = f.name.split('.').pop().toUpperCase();
    var c = ext === 'PDF' ? '#f87171' : '#60a5fa';
    var size = f.size > 1024*1024 ? (f.size/(1024*1024)).toFixed(1)+' MB' : Math.round(f.size/1024)+' KB';
    return '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem;">'
      + '<span style="font-family:var(--mono);font-size:.55rem;background:'+c+'22;color:'+c+';border:1px solid '+c+'44;border-radius:3px;padding:.05rem .3rem;">'+ext+'</span>'
      + '<span>'+f.name+'</span>'
      + '<span style="color:var(--off4);margin-left:auto;">'+size+'</span>'
      + '</div>';
  }).join('');
  document.getElementById('da-file-list').style.display = '';
  document.getElementById('da-analyse-btn').style.display = 'inline-flex';
}

/* ── Read file as base64 ──────────────────────────────────────── */
function _daReadBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = function() { reject(new Error('Failed to read ' + file.name)); };
    reader.readAsDataURL(file);
  });
}

/* ── Start analysis ───────────────────────────────────────────── */
function daStartAnalysis() {
  if (!_daFiles.length) return;

  /* Switch to progress phase */
  document.getElementById('da-phase-upload').style.display = 'none';
  document.getElementById('da-phase-progress').style.display = '';
  document.getElementById('da-analyse-btn').style.display = 'none';
  document.getElementById('da-error').style.display = 'none';
  document.getElementById('da-title').textContent = 'Analysing ' + _daFiles.length + ' drawing' + (_daFiles.length > 1 ? 's' : '') + '\u2026';

  var bar = document.getElementById('da-progress-bar');
  var step = document.getElementById('da-progress-step');
  var detail = document.getElementById('da-progress-detail');

  bar.style.width = '10%';
  step.textContent = 'Reading drawing files\u2026';
  detail.textContent = _daFiles.length + ' file' + (_daFiles.length > 1 ? 's' : '');

  /* Read all files as base64 */
  var readPromises = _daFiles.map(function(f) {
    return _daReadBase64(f).then(function(b64) {
      var ext = f.name.split('.').pop().toLowerCase();
      return { name: f.name, ext: ext, base64: b64 };
    });
  });

  Promise.all(readPromises).then(function(fileData) {
    bar.style.width = '30%';
    step.textContent = 'Building content for AI analysis\u2026';

    /* Build content blocks */
    var contentBlocks = [];
    fileData.forEach(function(fd) {
      if (fd.ext === 'pdf') {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: fd.base64 }
        });
      } else if (/^(png|jpg|jpeg)$/.test(fd.ext)) {
        var mime = fd.ext === 'png' ? 'image/png' : 'image/jpeg';
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: mime, data: fd.base64 }
        });
      }
      contentBlocks.push({ type: 'text', text: 'Filename: ' + fd.name });
    });

    var _rulesCtx = (typeof getLearnedRulesPrompt === 'function') ? getLearnedRulesPrompt() : '';
    var _auditCtx = (typeof getSelfAuditPrompt === 'function') ? getSelfAuditPrompt() : '';

    contentBlocks.push({
      type: 'text',
      text: 'Analyse all uploaded drawings following the M&E knowledge base protocol. Extract every identifiable M&E element with NRM2-compliant quantities. Return JSON only.'
        + _rulesCtx + _auditCtx
    });

    bar.style.width = '45%';
    step.textContent = 'Claude AI analysing M&E services\u2026';
    detail.textContent = 'Knowledge Base v4.1 \u00b7 25 sources \u00b7 ' + _daFiles.length + ' drawing' + (_daFiles.length > 1 ? 's' : '');

    /* Animate progress while waiting */
    var crawl = setInterval(function() {
      var w = parseFloat(bar.style.width);
      if (w < 85) bar.style.width = (w + 2) + '%';
    }, 1500);

    return fetch(CONTRAQ_API_BASE + '/api/drawings/extract', {
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
          var detail = '';
          try { var j = JSON.parse(body); detail = (j.error && j.error.message) || body; } catch(e) { detail = body.substring(0, 200); }
          throw new Error('API ' + resp.status + ': ' + detail);
        });
      }
      return resp.json();
    }).then(function(apiData) {
      /* Extract text from Claude response */
      var rawText = '';
      if (apiData.content && Array.isArray(apiData.content)) {
        apiData.content.forEach(function(block) {
          if (block.type === 'text') rawText += block.text;
        });
      }

      /* Parse JSON */
      var cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      var jMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jMatch) throw new Error('No JSON object found in AI response');

      _daResult = JSON.parse(jMatch[0]);

      bar.style.width = '100%';
      step.textContent = 'Analysis complete \u2714';

      setTimeout(function() {
        daRenderResults(_daResult);
      }, 400);
    });
  }).catch(function(err) {
    console.error('[Contraq Drawing Analyser]', err);
    bar.style.width = '100%';
    bar.style.background = '#f87171';
    step.textContent = '\u26a0 Analysis failed';

    var msg = String(err.message || 'Unexpected error');
    if (/401|403|auth|key/i.test(msg)) msg = 'API authentication error \u2014 check server configuration.';
    if (/429|rate/i.test(msg)) msg = 'Rate limit reached \u2014 please wait a moment and try again.';
    if (/502|proxy/i.test(msg)) msg = 'Could not reach AI service \u2014 is the API server running?';

    document.getElementById('da-error').innerHTML =
      '<div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:var(--radius2);padding:.85rem;">'
      + '<div style="color:#f87171;font-weight:600;font-size:.8rem;margin-bottom:.3rem;">\u26a0 Drawing analysis unavailable</div>'
      + '<div style="font-size:.72rem;color:#8a9099;">' + msg + '</div>'
      + '<div style="font-size:.68rem;color:#525860;margin-top:.35rem;">Check that the Contraq API server is running on port 3001.</div>'
      + '</div>';
    document.getElementById('da-error').style.display = '';

    setTimeout(function() {
      document.getElementById('da-analyse-btn').style.display = 'inline-flex';
      document.getElementById('da-phase-upload').style.display = '';
      bar.style.width = '0%';
      bar.style.background = '';
      document.getElementById('da-phase-progress').style.display = 'none';
    }, 1600);
  });
}

/* ── Render results ───────────────────────────────────────────── */
function daRenderResults(data) {
  document.getElementById('da-phase-progress').style.display = 'none';
  document.getElementById('da-phase-results').style.display = '';
  document.getElementById('da-export-btn').style.display = 'inline-flex';
  document.getElementById('da-title').textContent = 'Drawing Analysis Results';

  var extraction = data.extraction || [];
  var flags = data.flags || [];

  /* Count by trade */
  var tradeCounts = {};
  extraction.forEach(function(item) {
    var t = item.trade || 'Unknown';
    if (!tradeCounts[t]) tradeCounts[t] = { count: 0, high: 0, med: 0, low: 0 };
    tradeCounts[t].count++;
    if (item.confidence === 'High') tradeCounts[t].high++;
    else if (item.confidence === 'Medium') tradeCounts[t].med++;
    else tradeCounts[t].low++;
  });

  /* Summary bar */
  var summaryHtml = '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.75rem;">';
  summaryHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:120px;">'
    + '<div style="font-family:var(--mono);font-size:1.1rem;color:var(--white);font-weight:700;">' + extraction.length + '</div>'
    + '<div style="font-size:.62rem;color:var(--off4);">Items extracted</div></div>';

  Object.keys(tradeCounts).forEach(function(trade) {
    var tc = tradeCounts[trade];
    var tradeColor = trade === 'Mechanical' ? 'var(--orange)' : trade === 'Electrical' ? '#60a5fa' : 'var(--lime)';
    summaryHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:120px;">'
      + '<div style="font-family:var(--mono);font-size:1.1rem;color:' + tradeColor + ';font-weight:700;">' + tc.count + '</div>'
      + '<div style="font-size:.62rem;color:var(--off4);">' + trade + '</div>'
      + '<div style="font-family:var(--mono);font-size:.5rem;color:var(--off4);margin-top:.15rem;">'
      + '<span style="color:var(--lime);">' + tc.high + ' high</span> \u00b7 '
      + '<span style="color:var(--yellow);">' + tc.med + ' med</span> \u00b7 '
      + '<span style="color:#f87171;">' + tc.low + ' low</span></div></div>';
  });

  if (flags.length) {
    summaryHtml += '<div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:var(--radius2);padding:.55rem .75rem;flex:1;min-width:120px;">'
      + '<div style="font-family:var(--mono);font-size:1.1rem;color:var(--yellow);font-weight:700;">' + flags.length + '</div>'
      + '<div style="font-size:.62rem;color:var(--off4);">Flags raised</div></div>';
  }
  summaryHtml += '</div>';

  if (data.drawing_reference && data.drawing_reference !== 'Not stated') {
    summaryHtml += '<div style="font-family:var(--mono);font-size:.62rem;color:var(--off3);margin-bottom:.5rem;">Drawing: ' + data.drawing_reference + (data.scale ? ' \u00b7 Scale: ' + data.scale : '') + '</div>';
  }

  document.getElementById('da-results-summary').innerHTML = summaryHtml;

  /* Results table */
  var tableHtml = '<div class="card" style="padding:0;"><div style="overflow-x:auto;"><table class="tbl"><thead><tr>'
    + '<th style="width:80px;">Trade</th>'
    + '<th>Description</th>'
    + '<th style="width:160px;">Specification</th>'
    + '<th style="width:55px;text-align:right;">Qty</th>'
    + '<th style="width:35px;">Unit</th>'
    + '<th style="width:55px;">Conf.</th>'
    + '<th>Notes</th>'
    + '</tr></thead><tbody>';

  extraction.forEach(function(item) {
    var confColor = item.confidence === 'High' ? 'var(--lime)' : item.confidence === 'Medium' ? 'var(--yellow)' : '#f87171';
    var confBg = item.confidence === 'High' ? 'rgba(163,230,53,.1)' : item.confidence === 'Medium' ? 'rgba(251,191,36,.08)' : 'rgba(248,113,113,.08)';
    var tradeBg = item.trade === 'Mechanical' ? 'rgba(249,115,22,.08)' : item.trade === 'Electrical' ? 'rgba(96,165,250,.08)' : 'rgba(163,230,53,.08)';
    var tradeColor = item.trade === 'Mechanical' ? 'var(--orange)' : item.trade === 'Electrical' ? '#60a5fa' : 'var(--lime)';

    tableHtml += '<tr>'
      + '<td><span style="font-family:var(--mono);font-size:.54rem;background:' + tradeBg + ';color:' + tradeColor + ';border:1px solid ' + tradeColor + '33;border-radius:3px;padding:.1rem .3rem;">' + (item.trade || '\u2014') + '</span></td>'
      + '<td style="font-size:.74rem;color:var(--white);font-weight:500;">' + (item.description || '\u2014') + '</td>'
      + '<td style="font-size:.68rem;color:var(--off3);max-width:160px;overflow:hidden;text-overflow:ellipsis;" title="' + (item.specification || '').replace(/"/g, '&quot;') + '">' + (item.specification || '\u2014') + '</td>'
      + '<td class="mono" style="font-size:.74rem;color:var(--white);text-align:right;font-weight:600;">' + (item.quantity != null ? item.quantity : '\u2014') + '</td>'
      + '<td class="mono" style="font-size:.68rem;color:var(--off3);">' + (item.unit || '\u2014') + '</td>'
      + '<td><span style="font-family:var(--mono);font-size:.52rem;background:' + confBg + ';color:' + confColor + ';border-radius:3px;padding:.1rem .3rem;">' + (item.confidence || '\u2014') + '</span></td>'
      + '<td style="font-size:.66rem;color:var(--off4);max-width:200px;overflow:hidden;text-overflow:ellipsis;" title="' + (item.notes || '').replace(/"/g, '&quot;') + '">' + (item.notes || '\u2014') + '</td>'
      + '</tr>';
  });

  tableHtml += '</tbody></table></div></div>';
  document.getElementById('da-results-table').innerHTML = tableHtml;

  /* Flags section */
  if (flags.length) {
    var flagsHtml = '<div style="margin-top:.5rem;">'
      + '<div style="font-family:var(--mono);font-size:.62rem;color:var(--yellow);margin-bottom:.4rem;">\u26a0 ' + flags.length + ' flag' + (flags.length !== 1 ? 's' : '') + ' raised</div>';

    flags.forEach(function(flag) {
      flagsHtml += '<div style="background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.12);border-radius:var(--radius2);padding:.55rem .7rem;margin-bottom:.35rem;">'
        + '<div style="font-size:.74rem;color:var(--yellow);font-weight:500;">' + (flag.issue || '') + '</div>'
        + (flag.location ? '<div style="font-size:.64rem;color:var(--off4);margin-top:.15rem;">Location: ' + flag.location + '</div>' : '')
        + (flag.recommendation ? '<div style="font-size:.66rem;color:var(--off3);margin-top:.2rem;">\u2192 ' + flag.recommendation + '</div>' : '')
        + '</div>';
    });

    flagsHtml += '</div>';
    document.getElementById('da-results-flags').innerHTML = flagsHtml;
  } else {
    document.getElementById('da-results-flags').innerHTML = '';
  }
}

/* ── Export results as JSON ────────────────────────────────────── */
function daExportResults() {
  if (!_daResult) return;
  var json = JSON.stringify(_daResult, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'contraq-drawing-analysis-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('\u2714 Drawing analysis exported as JSON', 'success');
}
