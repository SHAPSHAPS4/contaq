/* ═══ CONTRAQ — FOLDERS ═══
   QF_EXT_ICONS, FOLDER_DEFS, folder rendering, folder upload
   Lines 13214-13644 from contraq-v77
═══════════════════════════════════════════ */

var QF_EXT_ICONS = {
  'xlsx':ICON.chart,'xls':ICON.chart,'pdf':ICON.file,'docx':ICON.edit,'doc':ICON.edit
};

function qfGetExt(filename) {
  return (filename.split('.').pop()||'').toLowerCase();
}

function qfExtIcon(filename) {
  return QF_EXT_ICONS[qfGetExt(filename)] || ICON.paperclip;
}

function qfExtColor(filename) {
  var e = qfGetExt(filename);
  if (e==='pdf') return '#f87171';
  if (e==='xlsx'||e==='xls') return '#a3e635';
  if (e==='docx'||e==='doc') return '#60a5fa';
  return '#94a3b8';
}

/* ================================================================
   FOLDER-ORGANISED ATTACHMENTS
================================================================ */

var FOLDER_DEFS = {
  // Quote / Project shared folders
  drawings:      {label:'Drawings',      icon:ICON.ruler, color:'#60a5fa', accepts:['.pdf','.dwg','.dxf']},
  specs:         {label:'Specifications',icon:ICON.clipboard, color:'#a3e635', accepts:['.pdf','.docx','.doc']},
  documents:     {label:'Documents',     icon:ICON.folder, color:'#fbbf24', accepts:['.pdf','.xlsx','.xls','.docx','.doc','.eml','.msg']},
  // Project-only folders
  purchaseOrder: {label:'Purchase Order',icon:ICON.receipt, color:'#f97316', accepts:['.pdf','.docx','.doc','.xlsx']},
  voQuote:       {label:'VO Quote',      icon:ICON.chart, color:'#c084fc', accepts:['.pdf','.xlsx','.xls','.docx']}
};

var FOLDER_AI_KEYWORDS = {
  drawings:      ['drawing','dwg','layout','ga ','plan','section','detail','elevation','isometric','schematic'],
  specs:         ['spec','specification','nbs','performance','requirement','schedule','standard','compliance'],
  documents:     ['email','enquiry','programme','minutes','meeting','coordination','report','letter','note','memo','advisory','cert'],
  purchaseOrder: ['purchase order','po ','order confirmation','contract award','instruction','authorisation'],
  voQuote:       ['variation','vo ','vo-','extra work','change order','additional','daywork','omission']
};

function folderRevRank(r) {
  if (!r) return -1;
  if ((r+'').toLowerCase()==='draft') return -1;
  if (/^[A-Z]$/i.test(r)) return r.toUpperCase().charCodeAt(0);
  var n = parseInt(r); return isNaN(n) ? 0 : n;
}

function folderSorted(arr) {
  return (arr||[]).slice().sort(function(a,b){
    var dr = folderRevRank(b.revision) - folderRevRank(a.revision);
    if (dr !== 0) return dr;
    return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
  });
}

/* ── Single folder section ─────────────────────────────────── */
function renderFolderSection(source, entityId, folderKey, items, isProjectOnly) {
  var def = FOLDER_DEFS[folderKey];
  if (!def) return '';
  var sorted = folderSorted(items);
  var h = '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:.7rem;">';
  // Header
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:.65rem .9rem;background:var(--bg4);border-bottom:1px solid var(--border);">';
  h += '<div style="display:flex;align-items:center;gap:.5rem;">';
  h += '<span style="font-size:.95rem;">' + def.icon + '</span>';
  h += '<span style="font-size:.78rem;font-weight:700;color:var(--white);">' + def.label + '</span>';
  h += '<span style="font-family:var(--mono);font-size:.58rem;background:' + def.color + '1a;color:' + def.color + ';border:1px solid ' + def.color + '44;border-radius:4px;padding:.05rem .4rem;">' + sorted.length + '</span>';
  h += '</div>';
  h += '<button class="btn btn-xs" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.3);font-size:.68rem;" '
    + 'onclick="openFolderUpload(\'' + source + '\',\'' + entityId + '\',\'' + folderKey + '\')">'
    + def.icon + ' Upload to ' + def.label + ' AI Enabled</button>';
  h += '</div>';
  // Table or empty
  if (!sorted.length) {
    h += '<div style="padding:.85rem;text-align:center;font-size:.74rem;color:var(--off4);">No files yet. Click Upload to add.</div>';
  } else {
    var showNotes = (folderKey === 'purchaseOrder' || folderKey === 'voQuote');
    h += '<table style="width:100%;border-collapse:collapse;font-size:.73rem;">';
    h += '<thead><tr style="background:rgba(255,255,255,.02);">';
    var cols = ['File','Revision','Date','Size'];
    if (showNotes) cols = ['File','Date','Size','Notes'];
    cols.forEach(function(c){ h += '<th style="padding:.4rem .75rem;text-align:left;font-family:var(--mono);font-size:.5rem;text-transform:uppercase;color:var(--off4);">' + c + '</th>'; });
    h += '<th style="padding:.4rem .75rem;"></th>';
    h += '</tr></thead><tbody>';
    sorted.forEach(function(f, idx) {
      var isTop = (idx === 0);
      var op = isTop ? '1' : '0.58';
      h += '<tr style="border-top:1px solid var(--border);opacity:' + op + ';" '
        + 'onmouseenter="this.style.opacity=\'1\';this.style.background=\'rgba(255,255,255,.02)\'" '
        + 'onmouseleave="this.style.opacity=\'' + op + '\';this.style.background=\'\'">';
      // File column
      var ext = (f.filename||'').split('.').pop().toLowerCase();
      var ic = ext==='pdf'?ICON.file:ext==='xlsx'||ext==='xls'?ICON.chart:ext==='docx'||ext==='doc'?ICON.edit:ICON.paperclip;
      var ec = ext==='pdf'?'#f87171':ext==='xlsx'||ext==='xls'?'#a3e635':ext==='docx'||ext==='doc'?'#60a5fa':'#94a3b8';
      h += '<td style="padding:.48rem .75rem;"><div style="display:flex;align-items:center;gap:.4rem;">';
      h += '<span style="color:'+ec+'">' + ic + '</span>';
      h += '<span style="color:' + (isTop?'var(--white)':'var(--off2)') + ';word-break:break-all;">' + f.filename + '</span>';
      h += '</div></td>';
      if (showNotes) {
        h += '<td style="padding:.48rem .75rem;font-family:var(--mono);font-size:.63rem;color:var(--off3);white-space:nowrap;">' + (f.date ? fmtDate(f.date) : '—') + '</td>';
        h += '<td style="padding:.48rem .75rem;font-family:var(--mono);font-size:.63rem;color:var(--off4);white-space:nowrap;">' + (f.size||'—') + '</td>';
        h += '<td style="padding:.48rem .75rem;font-size:.7rem;color:var(--off3);">' + (f.notes||'') + '</td>';
      } else {
        var revC = isTop ? '#a3e635' : 'var(--off4)';
        h += '<td style="padding:.48rem .75rem;font-family:var(--mono);font-size:.66rem;"><span style="color:' + revC + ';font-weight:' + (isTop?'700':'400') + ';">Rev ' + (f.revision||'—') + '</span></td>';
        h += '<td style="padding:.48rem .75rem;font-family:var(--mono);font-size:.63rem;color:var(--off3);white-space:nowrap;">' + (f.date ? fmtDate(f.date) : '—') + '</td>';
        h += '<td style="padding:.48rem .75rem;font-family:var(--mono);font-size:.63rem;color:var(--off4);white-space:nowrap;">' + (f.size||'—') + '</td>';
      }
      h += '<td style="padding:.48rem .75rem;white-space:nowrap;"><button class="btn btn-dark btn-xs" onclick="showToast(\'Preview: ' + f.filename.replace(/'/g,"\\'").replace(/"/g,'&quot;') + '\',\'default\')">Preview</button></td>';
      h += '</tr>';
    });
    h += '</tbody></table>';
    if (sorted.length && sorted[0].transferredFrom) {
      h += '<div style="font-family:var(--mono);font-size:.55rem;color:var(--off4);padding:.4rem .75rem;">Transferred from: ' + sorted[0].transferredFrom + '</div>';
    }
  }
  h += '</div>';
  return h;
}

/* ── Full folders UI (3 shared + optional project-only + quoteFiles) ─ */
function renderFoldersUI(source, entityId, folders, quoteFiles) {
  var f = folders || {};
  var isProject = (source === 'project');
  var h = '';

  // Section label
  h += '<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.08em;color:var(--off4);margin-bottom:.65rem;">Document Folders</div>';

  // Shared folders
  h += renderFolderSection(source, entityId, 'drawings',  f.drawings||[]);
  h += renderFolderSection(source, entityId, 'specs',     f.specs||[]);
  h += renderFolderSection(source, entityId, 'documents', f.documents||[]);

  // Project-only folders
  if (isProject) {
    h += '<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.08em;color:var(--off4);margin-bottom:.65rem;margin-top:.85rem;">Project Folders</div>';
    h += renderFolderSection(source, entityId, 'purchaseOrder', f.purchaseOrder||[], true);
    h += renderFolderSection(source, entityId, 'voQuote',       f.voQuote||[], true);
  }

  // Quote Files (transferred or current)
  if ((quoteFiles||[]).length) {
    h += renderQuoteFilesSection(isProject ? null : entityId, quoteFiles, isProject);
  } else if (!isProject) {
    h += renderQuoteFilesSection(entityId, [], false);
  }

  return h;
}

/* ── Open folder upload modal ───────────────────────────────── */
function openFolderUpload(source, entityId, folderKey) {
  STATE.folderUploadCtx = {source:source, entityId:entityId, folderKey:folderKey};
  STATE._folderPendingFiles = [];
  var def = FOLDER_DEFS[folderKey] || {label:folderKey, icon:ICON.paperclip, color:'#f97316'};
  document.getElementById('fu-title').textContent = 'Upload to ' + def.label + ' — AI Enabled';
  document.getElementById('fu-subtitle').textContent = 'Accepted: ' + (def.accepts||['.pdf','.docx','.xlsx']).join('  ');
  document.getElementById('fu-drop-zone').style.background = '';
  document.getElementById('fu-file-list').innerHTML = '';
  document.getElementById('fu-file-list').style.display = 'none';
  document.getElementById('fu-analyse-btn').style.display = 'none';
  document.getElementById('fu-progress-wrap').style.display = 'none';
  document.getElementById('fu-ai-banner').style.display = 'none';
  document.getElementById('fu-err').style.display = 'none';
  document.getElementById('fu-drop-icon').textContent = def.icon;
  openModal('modal-folder-upload');
}

function fuFilesSelected(files) {
  STATE._folderPendingFiles = Array.from(files);
  var ul = document.getElementById('fu-file-list');
  ul.innerHTML = '';
  Array.from(files).forEach(function(f) {
    var ext = (f.name.split('.').pop()||'').toLowerCase();
    var ic = ext==='pdf'?ICON.file:ext==='xlsx'||ext==='xls'?ICON.chart:ext==='docx'||ext==='doc'?ICON.edit:ICON.paperclip;
    var ec = ext==='pdf'?'#f87171':ext==='xlsx'||ext==='xls'?'#a3e635':ext==='docx'||ext==='doc'?'#60a5fa':'#94a3b8';
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;align-items:center;gap:.55rem;padding:.5rem .75rem;background:var(--bg4);border-radius:6px;margin-bottom:.35rem;';
    d.innerHTML = '<span style="color:'+ec+'">' + ic + '</span>'
      + '<span style="font-size:.76rem;color:var(--white);flex:1;">' + f.name + '</span>'
      + '<span style="font-family:var(--mono);font-size:.58rem;background:' + ec + '1a;color:' + ec + ';border:1px solid ' + ec + '44;border-radius:3px;padding:.05rem .35rem;">' + ext.toUpperCase() + '</span>';
    ul.appendChild(d);
  });
  ul.style.display = STATE._folderPendingFiles.length ? '' : 'none';
  document.getElementById('fu-analyse-btn').style.display = STATE._folderPendingFiles.length ? '' : 'none';
}

function fuDropHandler(e) {
  e.preventDefault();
  document.getElementById('fu-drop-zone').style.background = '';
  if (e.dataTransfer && e.dataTransfer.files) fuFilesSelected(e.dataTransfer.files);
}

function fuDetectFolder(filename) {
  var b = filename.toLowerCase();
  var best = null, bestScore = 0;
  var keys = ['drawings','specs','documents','purchaseOrder','voQuote'];
  keys.forEach(function(k) {
    var kws = FOLDER_AI_KEYWORDS[k] || [];
    var score = 0;
    kws.forEach(function(w){ if (b.indexOf(w) >= 0) score++; });
    if (score > bestScore) { bestScore = score; best = k; }
  });
  return best || 'documents';
}

function fuGuessRevision(fn) {
  var b = fn.toLowerCase();
  var m;
  m = b.match(/rev[-_]?([a-z])\b/i); if (m) return m[1].toUpperCase();
  m = b.match(/-rev([a-z])\./i); if (m) return m[1].toUpperCase();
  m = b.match(/[_-]v(\d+)\./i); if (m) return 'v'+m[1];
  if (b.indexOf('draft') >= 0) return 'Draft';
  return '1';
}

function fuStartAnalysis() {
  if (!STATE._folderPendingFiles || !STATE._folderPendingFiles.length) {
    showToast('Select at least one file.','error'); return;
  }
  document.getElementById('fu-analyse-btn').style.display = 'none';
  document.getElementById('fu-progress-wrap').style.display = '';
  document.getElementById('fu-ai-banner').style.display = 'none';
  var bar = document.getElementById('fu-progress-bar');
  var lbl = document.getElementById('fu-progress-label');
  lbl.textContent = 'Reading files\u2026'; bar.style.width = '5%';

  /* ── Demo mode: filename-based analysis ── */
  if (!ContraqAPI.isRealUser()) {
    _fuRunDemoAnalysis();
    return;
  }

  /* ── Real AI: read files as base64 and send to server ── */
  var filesToSend = [];
  var pending = STATE._folderPendingFiles.length;
  var done = 0;

  STATE._folderPendingFiles.forEach(function(f, idx) {
    var reader = new FileReader();
    reader.onload = function() {
      var base64 = reader.result.split(',')[1];
      var mimeType = f.type || 'application/octet-stream';
      if (!mimeType || mimeType === 'application/octet-stream') {
        var ext = (f.name.split('.').pop() || '').toLowerCase();
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (ext === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else if (ext === 'xls') mimeType = 'application/vnd.ms-excel';
        else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      }
      filesToSend[idx] = { file_base64: base64, file_name: f.name, mime_type: mimeType };
      done++;
      bar.style.width = Math.round(done / pending * 15 + 5) + '%';
      lbl.textContent = 'Reading files\u2026 ' + done + '/' + pending;
      if (done === pending) {
        lbl.textContent = 'Sending to AI\u2026';
        bar.style.width = '25%';
        _fuCallAI(filesToSend);
      }
    };
    reader.onerror = function() {
      done++;
      if (done === pending && filesToSend.filter(Boolean).length > 0) {
        _fuCallAI(filesToSend.filter(Boolean));
      }
    };
    reader.readAsDataURL(f);
  });
}

function _fuCallAI(filesToSend) {
  var ctx = STATE.folderUploadCtx;
  var bar = document.getElementById('fu-progress-bar');
  var lbl = document.getElementById('fu-progress-label');

  fetch(CONTRAQ_API_BASE + '/api/folders/analyse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: filesToSend,
      target_folder: ctx ? ctx.folderKey : null,
      entity_type: ctx ? ctx.source : null
    })
  }).then(function(resp) {
    if (!resp.ok && !resp.headers.get('content-type')?.includes('text/event-stream')) {
      return resp.json().then(function(err) { throw new Error(err.error?.message || 'Server error'); });
    }
    var streamReader = resp.body.getReader();
    var decoder = new TextDecoder();
    var fullText = '';
    var lastCount = 0;

    function readChunk() {
      return streamReader.read().then(function(result) {
        if (result.done) return fullText;
        var chunk = decoder.decode(result.value, { stream: true });
        fullText += chunk;

        var lines = fullText.split('\n');
        for (var i = 0; i < lines.length; i++) {
          if (!lines[i].startsWith('data: ')) continue;
          var raw = lines[i].slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            var evt = JSON.parse(raw);
            if (evt.progress && evt.files_analysed > lastCount) {
              lastCount = evt.files_analysed;
              var pct = Math.min(25 + Math.round(lastCount / filesToSend.length * 65), 90);
              bar.style.width = pct + '%';
              lbl.textContent = 'Analysing\u2026 ' + lastCount + '/' + filesToSend.length + ' files classified';
            }
          } catch(e) {}
        }

        return readChunk();
      });
    }

    return readChunk().then(function(sseText) {
      var dataLines = sseText.split('\n');
      var resultData = null;
      for (var i = dataLines.length - 1; i >= 0; i--) {
        if (dataLines[i].startsWith('data: ') && dataLines[i].indexOf('"type":"result"') > -1) {
          try { resultData = JSON.parse(dataLines[i].slice(6)); } catch(e) {}
          break;
        }
      }
      if (!resultData || !resultData.data || resultData.data.error) {
        throw new Error(resultData && resultData.data && resultData.data.message || 'AI analysis failed.');
      }
      return resultData.data;
    });
  }).then(function(aiData) {
    bar.style.width = '100%';
    lbl.textContent = 'Finalising\u2026';
    _fuApplyAIResult(aiData);
  }).catch(function(err) {
    console.error('[Folder AI]', err);
    lbl.textContent = 'AI unavailable \u2014 using filename analysis';
    bar.style.width = '100%';
    bar.style.background = 'var(--orange)';
    /* Fallback to filename-based analysis */
    setTimeout(function() {
      bar.style.background = '';
      _fuApplyFallback();
    }, 1000);
  });
}

function _fuApplyAIResult(aiData) {
  var ctx = STATE.folderUploadCtx;
  if (!ctx) { closeModal('modal-folder-upload'); return; }
  var today = new Date().toISOString().split('T')[0];

  var entity = null;
  if (ctx.source === 'project') {
    entity = PROJECTS.find(function(p){ return p.id === ctx.entityId; });
  } else {
    entity = TENDERS.find(function(t){ return t.id === ctx.entityId; });
  }
  if (!entity) { closeModal('modal-folder-upload'); return; }
  if (!entity.folders) entity.folders = {drawings:[],specs:[],documents:[],purchaseOrder:[],voQuote:[]};

  var aiFiles = aiData.files || [];
  var insights = [];

  (STATE._folderPendingFiles||[]).forEach(function(f, idx) {
    var ai = aiFiles[idx] || {};
    var suggestedFolder = ai.suggested_folder || fuDetectFolder(f.name);
    var targetFolder = ctx.folderKey;
    var mismatch = (suggestedFolder !== targetFolder);
    var rev = ai.revision || fuGuessRevision(f.name);
    var sizeKb = Math.round(f.size/1024);
    var sizeStr = sizeKb > 1024 ? (sizeKb/1024).toFixed(1)+' MB' : sizeKb+' KB';
    var docDate = ai.date || today;

    var newFile = {
      id: 'fd-'+ctx.entityId+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,5),
      filename: f.name,
      revision: rev,
      date: docDate,
      size: sizeStr,
      notes: ai.summary || ''
    };
    if (!entity.folders[targetFolder]) entity.folders[targetFolder] = [];
    entity.folders[targetFolder].unshift(newFile);

    var msg = '<strong style="color:var(--white);">' + f.name + '</strong>';
    if (ai.title) msg += '<br><span style="font-size:.68rem;color:var(--off3);">' + ai.title + '</span>';
    msg += '<br><span style="font-family:var(--mono);font-size:.6rem;">'
      + (ai.document_type || 'Document') + ' &middot; Rev ' + rev
      + (ai.author ? ' &middot; ' + ai.author : '') + '</span>';
    if (mismatch) {
      msg += '<br><span style="color:var(--yellow);font-size:.62rem;">AI suggests: '
        + (FOLDER_DEFS[suggestedFolder]||{label:suggestedFolder}).label
        + ' \u2014 placed in ' + (FOLDER_DEFS[targetFolder]||{label:targetFolder}).label + ' as selected</span>';
    }
    insights.push(msg);
  });

  /* ── API: persist folder file metadata to database ── */
  if (ContraqAPI.isRealUser()) {
    (STATE._folderPendingFiles||[]).forEach(function(f, idx) {
      var ai = aiFiles[idx] || {};
      var rev = ai.revision || fuGuessRevision(f.name);
      var sizeKb = Math.round(f.size/1024);
      var sizeStr = sizeKb > 1024 ? (sizeKb/1024).toFixed(1)+' MB' : sizeKb+' KB';
      fetch(CONTRAQ_API_BASE + '/api/data/documents', {
        method: 'POST',
        headers: typeof getAuthHeader === 'function' ? getAuthHeader() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: f.name, revision: rev, size: sizeStr,
          folder_key: ctx.folderKey, entity_type: ctx.source, entity_id: ctx.entityId,
          date: ai.date || new Date().toISOString().split('T')[0],
          notes: ai.summary || null, document_type: ai.document_type || null
        })
      }).catch(function(e) { console.error('[Folders] Save error:', e); });
    });
  }

  document.getElementById('fu-progress-wrap').style.display = 'none';
  document.getElementById('fu-ai-result').innerHTML = insights.map(function(i){
    return '<div style="display:flex;gap:.4rem;margin-bottom:.5rem;"><span style="color:var(--lime);">\u2713</span><span style="font-size:.74rem;line-height:1.5;">'+i+'</span></div>';
  }).join('') + '<div style="font-family:var(--mono);font-size:.55rem;color:var(--off4);margin-top:.45rem;">Files analysed by AI. Revisions sorted \u2014 newest at top.</div>';
  document.getElementById('fu-ai-banner').style.display = '';

  setTimeout(function(){
    closeModal('modal-folder-upload');
    if (ctx.source === 'project' && STATE.viewProjectId) {
      renderProjectDetailTab(STATE.viewProjectId, 'attachments');
    } else if (ctx.source === 'tender') {
      openTenderDetailView(ctx.entityId);
    }
    showToast('\u2714 Files uploaded to ' + (FOLDER_DEFS[ctx.folderKey]||{label:ctx.folderKey}).label + ' folder \u2014 AI classified.', 'success');
  }, 1500);
}

/* ── Fallback: filename-based analysis (demo + AI failure) ── */
function _fuApplyFallback() {
  var ctx = STATE.folderUploadCtx;
  if (!ctx) { closeModal('modal-folder-upload'); return; }
  var today = new Date().toISOString().split('T')[0];

  var entity = null;
  if (ctx.source === 'project') {
    entity = PROJECTS.find(function(p){ return p.id === ctx.entityId; });
  } else {
    entity = TENDERS.find(function(t){ return t.id === ctx.entityId; });
  }
  if (!entity) { closeModal('modal-folder-upload'); return; }
  if (!entity.folders) entity.folders = {drawings:[],specs:[],documents:[],purchaseOrder:[],voQuote:[]};

  var insights = [];
  (STATE._folderPendingFiles||[]).forEach(function(f) {
    var detectedFolder = fuDetectFolder(f.name);
    var targetFolder = ctx.folderKey;
    var mismatch = (detectedFolder !== targetFolder);
    var rev = fuGuessRevision(f.name);
    var sizeKb = Math.round(f.size/1024);
    var sizeStr = sizeKb > 1024 ? (sizeKb/1024).toFixed(1)+' MB' : sizeKb+' KB';
    var newFile = {
      id: 'fd-'+ctx.entityId+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,5),
      filename: f.name, revision: rev, date: today, size: sizeStr, notes: ''
    };
    if (!entity.folders[targetFolder]) entity.folders[targetFolder] = [];
    entity.folders[targetFolder].unshift(newFile);
    var msg = '<strong style="color:var(--white);">' + f.name + '</strong> \u2192 '
      + (FOLDER_DEFS[targetFolder]||{label:targetFolder}).label + ' \u00b7 Rev ' + rev;
    if (mismatch) {
      msg += ' <span style="color:var(--yellow);font-size:.68rem;">(detected as '+(FOLDER_DEFS[detectedFolder]||{label:detectedFolder}).label+' \u2014 placed in selected folder)</span>';
    }
    insights.push(msg);
  });

  if (ContraqAPI.isRealUser()) {
    (STATE._folderPendingFiles||[]).forEach(function(f) {
      var rev = fuGuessRevision(f.name);
      var sizeKb = Math.round(f.size/1024);
      var sizeStr = sizeKb > 1024 ? (sizeKb/1024).toFixed(1)+' MB' : sizeKb+' KB';
      fetch(CONTRAQ_API_BASE + '/api/data/documents', {
        method: 'POST',
        headers: typeof getAuthHeader === 'function' ? getAuthHeader() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: f.name, revision: rev, size: sizeStr, folder_key: ctx.folderKey, entity_type: ctx.source, entity_id: ctx.entityId, date: new Date().toISOString().split('T')[0] })
      }).catch(function(e) { console.error('[Folders] Save error:', e); });
    });
  }

  document.getElementById('fu-progress-wrap').style.display = 'none';
  document.getElementById('fu-ai-result').innerHTML = insights.map(function(i){
    return '<div style="display:flex;gap:.4rem;"><span style="color:var(--lime);">\u2713</span><span style="font-size:.74rem;line-height:1.6;">'+i+'</span></div>';
  }).join('') + '<div style="font-family:var(--mono);font-size:.55rem;color:var(--off4);margin-top:.45rem;">Files added. Revisions sorted \u2014 newest at top.</div>';
  document.getElementById('fu-ai-banner').style.display = '';

  setTimeout(function(){
    closeModal('modal-folder-upload');
    if (ctx.source === 'project' && STATE.viewProjectId) {
      renderProjectDetailTab(STATE.viewProjectId, 'attachments');
    } else if (ctx.source === 'tender') {
      openTenderDetailView(ctx.entityId);
    }
    showToast('\u2714 Files uploaded to ' + (FOLDER_DEFS[ctx.folderKey]||{label:ctx.folderKey}).label + ' folder.', 'success');
  }, 800);
}

/* ── Demo mode: animated filename-based analysis ── */
function _fuRunDemoAnalysis() {
  var steps = ['Reading file\u2026','Detecting document type\u2026','Extracting revision\u2026','Categorising to folder\u2026','Sorting revisions\u2026','Finalising\u2026'];
  var si = 0, bar = document.getElementById('fu-progress-bar'), lbl = document.getElementById('fu-progress-label');
  lbl.textContent = steps[0]; bar.style.width = '0%';
  var iv = setInterval(function(){
    si++;
    if (si >= steps.length) { clearInterval(iv); bar.style.width='100%'; _fuApplyFallback(); return; }
    bar.style.width = Math.round(si/steps.length*100)+'%';
    lbl.textContent = steps[si];
  }, 500);
}

function renderQuoteFilesSection(tenderId, files, isProject) {
  var sorted = (files||[]).slice().sort(function(a,b){
    // Sort by revision desc: handle A/B/C letter revs and numeric, Draft last
    function revRank(r) {
      if (!r) return -1;
      if (r.toLowerCase()==='draft') return -1;
      if (/^[A-Z]$/i.test(r)) return r.toUpperCase().charCodeAt(0);
      var n = parseInt(r); return isNaN(n) ? 0 : n;
    }
    var ra = revRank(a.revision), rb = revRank(b.revision);
    if (rb !== ra) return rb - ra;
    return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
  });

  var h = '<div style="margin-top:1.1rem;">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;">';
  h += '<div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.08em;color:var(--off4);">';
  h += isProject ? 'Quote Files — Transferred' : 'Quote Files';
  if (sorted.length) h += ' <span style="color:var(--orange);">(' + sorted.length + ')</span>';
  h += '</div>';
  if (!isProject && tenderId) {
    h += '<button class="btn btn-sm" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.3);font-size:.72rem;display:flex;align-items:center;gap:.35rem;" onclick="openQuoteFileUpload(\'' + tenderId + '\')">';
    h += '<span style="display:inline-flex;gap:.2rem;">' + ICON.chart + ICON.file + ICON.edit + '</span>&ensp;Upload Quote File AI Enabled';
    h += '</button>';
  }
  h += '</div>';

  if (!sorted.length) {
    if (!isProject) {
      h += '<div style="border:1.5px dashed rgba(249,115,22,.2);border-radius:8px;padding:1.25rem;text-align:center;cursor:pointer;" onclick="openQuoteFileUpload(\'' + tenderId + '\')">';
      h += '<div style="margin-bottom:.4rem;display:flex;gap:.3rem;justify-content:center;opacity:.5">' + ICON.chart + ICON.file + ICON.edit + '</div>';
      h += '<div style="font-size:.78rem;color:var(--off3);">No quote files uploaded yet.</div>';
      h += '<div style="font-size:.72rem;color:var(--off4);margin-top:.2rem;">Click <strong style="color:var(--orange);">Upload Quote File AI Enabled</strong> to add and organise revisions.</div>';
      h += '</div>';
    } else {
      h += '<div style="font-size:.76rem;color:var(--off4);padding:.5rem 0;">No quote files transferred for this project.</div>';
    }
    h += '</div>';
    return h;
  }

  // Files table
  h += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;overflow:hidden;">';
  h += '<table style="width:100%;border-collapse:collapse;font-size:.74rem;">';
  h += '<thead><tr style="background:var(--bg4);">';
  ['File', 'Type', 'Revision', 'Date', 'Size', 'Status', ''].forEach(function(col) {
    h += '<th style="padding:.45rem .7rem;text-align:left;font-family:var(--mono);font-size:.52rem;text-transform:uppercase;color:var(--off4);font-weight:600;white-space:nowrap;">' + col + '</th>';
  });
  h += '</tr></thead><tbody>';

  sorted.forEach(function(f, idx) {
    var ec = qfExtColor(f.filename);
    var isLatest = (f.status === 'Latest');
    var rowOp = isLatest ? '1' : '0.55';
    h += '<tr style="border-top:1px solid var(--border);opacity:' + rowOp + ';transition:opacity .15s;" onmouseenter="this.style.opacity=\'1\';this.style.background=\'rgba(255,255,255,.02)\'" onmouseleave="this.style.opacity=\'' + rowOp + '\';this.style.background=\'\'">';
    // Filename
    h += '<td style="padding:.5rem .7rem;"><div style="display:flex;align-items:center;gap:.45rem;">';
    h += '<span style="font-size:.95rem;">' + qfExtIcon(f.filename) + '</span>';
    h += '<span style="color:' + (isLatest ? 'var(--white)' : 'var(--off2)') + ';word-break:break-all;">' + f.filename + '</span>';
    h += '</div></td>';
    // Type
    h += '<td style="padding:.5rem .7rem;white-space:nowrap;"><span style="font-family:var(--mono);font-size:.58rem;background:' + ec + '1a;color:' + ec + ';border:1px solid ' + ec + '44;border-radius:4px;padding:.1rem .4rem;">' + (f.fileType||'File') + '</span></td>';
    // Revision
    h += '<td style="padding:.5rem .7rem;font-family:var(--mono);font-size:.68rem;">';
    h += '<span style="color:' + (isLatest ? 'var(--lime)' : 'var(--off3)') + ';font-weight:' + (isLatest ? '700' : '400') + ';">Rev ' + (f.revision||'—') + '</span>';
    h += '</td>';
    // Date
    h += '<td style="padding:.5rem .7rem;font-family:var(--mono);font-size:.65rem;color:var(--off3);white-space:nowrap;">' + fmtDate(f.date) + '</td>';
    // Size
    h += '<td style="padding:.5rem .7rem;font-family:var(--mono);font-size:.65rem;color:var(--off4);white-space:nowrap;">' + (f.size||'—') + '</td>';
    // Status badge
    var sc = f.status==='Latest' ? '#a3e635' : f.status==='Draft' ? '#fbbf24' : '#94a3b8';
    h += '<td style="padding:.5rem .7rem;white-space:nowrap;"><span style="font-family:var(--mono);font-size:.55rem;background:' + sc + '1a;color:' + sc + ';border:1px solid ' + sc + '44;border-radius:4px;padding:.1rem .4rem;">' + (f.status||'—') + '</span></td>';
    // Actions
    h += '<td style="padding:.5rem .7rem;white-space:nowrap;">';
    h += '<button class="btn btn-dark btn-xs" onclick="showToast(\'Preview: \'+\'' + f.filename.replace(/'/g,"\\'") + '\',\'default\')">Preview</button>';
    h += '</td>';
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  if (isProject && sorted.length) {
    var src = sorted[0].transferredFrom || '';
    if (src) h += '<div style="font-family:var(--mono);font-size:.57rem;color:var(--off4);margin-top:.4rem;">Transferred from quote: ' + src + '</div>';
  }
  h += '</div>';
  return h;
}

function openQuoteFileUpload(tenderId) {
  STATE.qfUploadTenderId = tenderId;
  var t = TENDERS.find(function(x){return x.id===tenderId;});
  document.getElementById('qf-upload-title').textContent = t ? ('Upload Quote File — ' + t.ref) : 'Upload Quote File';
  document.getElementById('qf-drop-zone').style.background = '';
  document.getElementById('qf-file-list').innerHTML = '';
  document.getElementById('qf-file-list').style.display = 'none';
  document.getElementById('qf-analyse-btn').style.display = 'none';
  document.getElementById('qf-progress-wrap').style.display = 'none';
  document.getElementById('qf-ai-banner').style.display = 'none';
  document.getElementById('qf-err').style.display = 'none';
  STATE._qfPendingFiles = [];
  STATE._qfAIExtracted  = null;
  var cancelBtn = document.getElementById('qf-cancel-btn');
  var viewBtn   = document.getElementById('qf-view-tender-btn');
  if (cancelBtn) cancelBtn.textContent = 'Cancel';
  if (viewBtn)   viewBtn.style.display = 'none';
  openModal('modal-quote-file-upload');
}

function qfFilesSelected(files) {
  STATE._qfPendingFiles = Array.from(files);
  var ul = document.getElementById('qf-file-list');
  ul.innerHTML = '';
  Array.from(files).forEach(function(f) {
    var ext = (f.name.split('.').pop()||'').toLowerCase();
    var allowed = ['xlsx','xls','pdf','docx','doc'];
    if (allowed.indexOf(ext) < 0) return;
    var ic = QF_EXT_ICONS[ext] || ICON.paperclip;
    var ec = qfExtColor(f.name);
    var li = document.createElement('div');
    li.style.cssText = 'display:flex;align-items:center;gap:.55rem;padding:.5rem .75rem;background:var(--bg4);border-radius:6px;margin-bottom:.35rem;';
    li.innerHTML = '<span style="color:'+ec+'">' + ic + '</span>'
      + '<span style="font-size:.76rem;color:var(--white);flex:1;">' + f.name + '</span>'
      + '<span style="font-family:var(--mono);font-size:.58rem;background:' + ec + '1a;color:' + ec + ';border:1px solid ' + ec + '44;border-radius:3px;padding:.05rem .35rem;">' + ext.toUpperCase() + '</span>';
    ul.appendChild(li);
  });
  ul.style.display = STATE._qfPendingFiles.length ? '' : 'none';
  document.getElementById('qf-analyse-btn').style.display = STATE._qfPendingFiles.length ? '' : 'none';
}

function qfDropHandler(e) {
  e.preventDefault();
  document.getElementById('qf-drop-zone').style.background = '';
  if (e.dataTransfer && e.dataTransfer.files) qfFilesSelected(e.dataTransfer.files);
}

/* ================================================================
   QUOTE FILE UPLOAD — REAL ANTHROPIC AI (claude-sonnet-4-6)
   ================================================================ */

/* ── JSZip lazy-loader (for DOCX / XLSX text extraction) ────────── */
