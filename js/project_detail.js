/* ═══ CONTRAQ — PROJECT_DETAIL ═══
   PO_CAT_MAP, MEASURE_TYPE_MAP, renderProjectDetailTab, calcClientStats
   Lines 12825-13039 from contraq-v77
═══════════════════════════════════════════ */

var PO_CAT_MAP = {
  INS:{label:'Insulation',cls:'po-cat-ins'},
  DUC:{label:'Ductwork',cls:'po-cat-duc'},
  TRC:{label:'Trace Htg',cls:'po-cat-trc'},
  ELC:{label:'Electrical',cls:'po-cat-elc'},
  PLB:{label:'Plumbing',cls:'po-cat-plb'},
  MEC:{label:'Mech Plant',cls:'po-cat-mec'},
  FIX:{label:'Fixings',cls:'po-cat-fix'},
  OTH:{label:'Other',cls:'po-cat-oth'},
};

function poCatPill(code) {
  var m = PO_CAT_MAP[code]||PO_CAT_MAP.OTH;
  return '<span class="po-cat-pill '+m.cls+'">'+m.label+'</span>';
}

/* ══════════════════════════════════════════════════════════════
   SITE MEASURES (v7)
══════════════════════════════════════════════════════════════ */
var MEASURE_TYPE_MAP = {
  pdf:{icon:ICON.file,label:'PDF',cls:'mc-type-pdf',emoji:ICON.file},
  dwg:{icon:ICON.ruler,label:'DWG',cls:'mc-type-dwg',emoji:ICON.ruler},
  xls:{icon:ICON.chart,label:'XLS',cls:'mc-type-xls',emoji:ICON.chart},
  img:{icon:ICON.image,label:'IMG',cls:'mc-type-img',emoji:ICON.image},
  doc:{icon:ICON.edit,label:'DOC',cls:'mc-type-doc',emoji:ICON.edit},
};

function fmtFileSize(kb) {
  if (!kb) return '—';
  if (kb >= 1024) return (Math.round(kb/102.4)/10).toFixed(1)+' MB';
  return kb+' KB';
}

function renderMeasures(filterProject) {
  filterProject = filterProject||'all';
  var view = STATE.measuresView||'grid';
  var filtered = filterProject==='all' ? SITE_MEASURES : SITE_MEASURES.filter(function(m){return m.project===filterProject;});

  var html = '';
  html += '<div class="page-hdr"><div class="page-hdr-left"><h2>Site Measures</h2><p>'+SITE_MEASURES.length+' files across '+PROJECTS.length+' projects</p></div><div style="display:flex;gap:.65rem"><button class="btn btn-primary btn-sm" onclick="openMeasureModal(null)">+ Upload measure</button></div></div>';

  // Filter + view toggle bar
  html += '<div class="bar">';
  html += '<div class="search-box"><input placeholder="Search measures…" oninput="filterTableRows(this.value)"/></div>';
  html += '<select class="filter-select" onchange="renderMeasures(this.value)">'
    + '<option value="all"'+(filterProject==='all'?' selected':'')+'>All projects</option>'
    + PROJECTS.map(function(p){return '<option value="'+p.id+'"'+(p.id===filterProject?' selected':'')+'>'+p.code+' — '+p.name.split('—')[0].trim()+'</option>';}).join('')
    + '</select>';
  html += '<select class="filter-select" onchange="renderMeasuresByType(this.value)">'
    + '<option value="all">All types</option>'
    + Object.keys(MEASURE_TYPE_MAP).map(function(t){return '<option value="'+t+'">'+MEASURE_TYPE_MAP[t].label+'</option>';}).join('')
    + '</select>';
  html += '<div style="display:flex;gap:2px;border:1px solid var(--border);border-radius:6px;overflow:hidden">'
    + '<button class="btn btn-xs" style="border-radius:0;'+(view==='grid'?'background:var(--bg4)':'')+'" onclick="STATE.measuresView=\'grid\';renderMeasures(\''+filterProject+'\')">⊞</button>'
    + '<button class="btn btn-xs" style="border-radius:0;'+(view==='list'?'background:var(--bg4)':'')+'" onclick="STATE.measuresView=\'list\';renderMeasures(\''+filterProject+'\')">☰</button>'
    + '</div>';
  html += '</div>';

  if (!filtered.length) {
    html += '<div style="text-align:center;padding:3rem;color:var(--off4)">No measures found. <a style="color:var(--orange);cursor:pointer" onclick="openMeasureModal(null)">Upload one →</a></div>';
    document.getElementById('dash-content').innerHTML = html;
    return;
  }

  if (view==='grid') {
    html += '<div class="measures-grid" id="measures-container">';
    html += filtered.map(function(m){
      var tm = MEASURE_TYPE_MAP[m.type]||MEASURE_TYPE_MAP.doc;
      var proj = PROJECTS.find(function(p){return p.id===m.project;});
      return '<div class="measure-card" onclick="openMeasureModal(\''+m.id+'\')">'
        +'<div class="measure-card-preview">'
        +tm.emoji
        +'<span class="measure-card-type-badge '+tm.cls+'">'+tm.label+'</span>'
        +'</div>'
        +'<div class="measure-card-body">'
        +'<div class="measure-card-name" title="'+m.name+'">'+m.name+'</div>'
        +'<div class="measure-card-meta"><span>'+m.rev+'</span><span>'+fmtFileSize(m.sizekb)+'</span><span>'+fmtDate(m.date)+'</span></div>'
        +(proj?'<div class="measure-card-proj" onclick="event.stopPropagation();openProjectDetail(\''+m.project+'\')">'+proj.code+' — '+proj.name.split('—')[0].trim()+'</div>':'')
        +'<div style="font-size:.65rem;color:var(--off4);margin-top:.2rem">'+m.engineerName+'</div>'
        +'</div></div>';
    }).join('');
    html += '</div>';
  } else {
    html += '<div class="card" id="measures-container"><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Type</th><th>Name</th><th>Project</th><th>Rev</th><th>Uploaded by</th><th>Date</th><th>Size</th><th></th></tr></thead><tbody>';
    html += filtered.map(function(m){
      var tm = MEASURE_TYPE_MAP[m.type]||MEASURE_TYPE_MAP.doc;
      var proj = PROJECTS.find(function(p){return p.id===m.project;});
      return '<tr>'
        +'<td><span class="measure-card-type-badge '+tm.cls+'" style="position:static">'+tm.label+'</span></td>'
        +'<td class="strong">'+tm.emoji+' '+m.name+'</td>'
        +'<td style="font-size:.72rem;color:var(--orange);cursor:pointer" onclick="openProjectDetail(\''+m.project+'\')">'+( proj?proj.code:'—')+'</td>'
        +'<td class="mono" style="font-size:.7rem">'+m.rev+'</td>'
        +'<td>'+m.engineerName+'</td>'
        +'<td class="mono">'+fmtDate(m.date)+'</td>'
        +'<td class="mono">'+fmtFileSize(m.sizekb)+'</td>'
        +'<td style="white-space:nowrap"><button class="btn btn-dark btn-xs" onclick="openMeasureModal(\''+m.id+'\')">Edit</button> <button class="btn btn-xs" style="background:rgba(96,165,250,.08);color:var(--blue);border:1px solid rgba(96,165,250,.2)" onclick="showToast(\''+m.name+' downloaded.\',\'success\')">⬇</button></td>'
        +'</tr>';
    }).join('');
    html += '</tbody></table></div></div>';
  }

  document.getElementById('dash-content').innerHTML = html;
}

function renderMeasuresByType(type) {
  var container = document.getElementById('measures-container');
  if (!container) return;
  var items = container.querySelectorAll(STATE.measuresView==='grid' ? '.measure-card' : 'tbody tr');
  items.forEach(function(el){
    if (type==='all') { el.style.display=''; return; }
    var show = el.querySelector('.mc-type-'+type);
    el.style.display = show ? '' : 'none';
  });
}

/* ──── MEASURE MODAL ────────────────────────────────────────── */
function openMeasureModal(id, prefillProjectId) {
  STATE.editMeasureId = id||null;
  var isNew = !id;
  document.getElementById('measure-modal-title').textContent = isNew ? 'Upload Site Measure' : 'Edit Measure';
  var delBtn = document.getElementById('measure-del-btn');
  if (delBtn) delBtn.style.display = isNew ? 'none' : '';
  document.getElementById('measure-err').style.display='none';

  var projSel = document.getElementById('msr-project');
  projSel.innerHTML = '<option value="">No project link</option>'+PROJECTS.map(function(p){return '<option value="'+p.id+'">'+p.code+' — '+p.name+'</option>';}).join('');
  var engSel = document.getElementById('msr-engineer');
  engSel.innerHTML = '<option value="">Select engineer…</option>'+ENGINEERS.filter(function(e){return e.active!==false;}).map(function(e){return '<option value="'+e.id+'">'+e.name+'</option>';}).join('');

  var chosen = document.getElementById('measure-file-chosen');
  if (chosen) chosen.style.display='none';

  if (!isNew) {
    var m = SITE_MEASURES.find(function(x){return x.id===id;});
    if (m) {
      document.getElementById('msr-name').value    = m.name||'';
      document.getElementById('msr-type').value    = m.type||'pdf';
      projSel.value                                 = m.project||'';
      document.getElementById('msr-rev').value     = m.rev||'Rev 1';
      engSel.value                                  = m.engineer||'';
      document.getElementById('msr-size').value    = m.sizekb||'';
      document.getElementById('msr-notes').value   = m.notes||'';
      if (chosen) { chosen.textContent = '✓ '+m.name; chosen.style.display='block'; }
    }
  } else {
    ['msr-name','msr-notes','msr-size'].forEach(function(fid){document.getElementById(fid).value='';});
    document.getElementById('msr-type').value='pdf';
    document.getElementById('msr-rev').value='Rev 1';
    projSel.value = prefillProjectId||'';
    engSel.value='';
  }
  openModal('modal-measure');
}

function simulateUpload() {
  var mockFiles = ['Site_Survey_v1.pdf','Isometric_Drawing.dwg','Takeoff_Sheet_v2.xlsx','HVAC_Lagging_Spec.docx','Site_Photos_Pack.zip'];
  var mockFile = mockFiles[Math.floor(Math.random()*mockFiles.length)];
  var chosen = document.getElementById('measure-file-chosen');
  if (chosen) { chosen.textContent = '✓ '+mockFile+' selected'; chosen.style.display='block'; }
  var name = document.getElementById('msr-name');
  if (name && !name.value) name.value = mockFile.replace(/\.[^.]+$/,'').replace(/_/g,' ');
  var sizeEl = document.getElementById('msr-size');
  if (sizeEl && !sizeEl.value) sizeEl.value = Math.round(200+Math.random()*3000);
}

function saveMeasure() {
  var name = document.getElementById('msr-name').value.trim();
  if (!name) { showModalErr('measure-err','Please enter a document name.'); return; }
  var projId  = document.getElementById('msr-project').value;
  var proj    = PROJECTS.find(function(p){return p.id===projId;});
  var engId   = document.getElementById('msr-engineer').value;
  var eng     = ENGINEERS.find(function(e){return e.id===engId;});
  var type    = document.getElementById('msr-type').value;
  var tm      = MEASURE_TYPE_MAP[type]||MEASURE_TYPE_MAP.doc;
  var data = {
    name:name, type:type, icon:tm.emoji,
    project:projId, projectName:proj?proj.name:'',
    engineer:engId, engineerName:eng?eng.name:'',
    rev:document.getElementById('msr-rev').value||'Rev 1',
    sizekb:parseInt(document.getElementById('msr-size').value)||0,
    notes:document.getElementById('msr-notes').value,
    date:new Date().toISOString().split('T')[0],
  };
  if (STATE.editMeasureId) {
    var idx = SITE_MEASURES.findIndex(function(m){return m.id===STATE.editMeasureId;});
    if (idx>=0) { data.id=STATE.editMeasureId; Object.assign(SITE_MEASURES[idx],data); }
    showToast('Measure updated.','success');
  } else {
    data.id='ms'+Date.now(); SITE_MEASURES.push(data);
    ACTIVITY_LOG.unshift({id:'al-'+Date.now(),icon:ICON.ruler,iconBg:'rgba(249,115,22,.15)',text:'Site measure uploaded: '+name+(proj?' — '+proj.code:''),time:'Just now',panel:'measures'});
    showToast('Measure saved — '+name,'success');
  }
  closeModal('modal-measure');
  dashNav('measures');
}

function deleteMeasure() {
  if (!STATE.editMeasureId) return;
  var m = SITE_MEASURES.find(function(x){return x.id===STATE.editMeasureId;});
  if (!m||!confirm('Delete "'+m.name+'"?')) return;
  SITE_MEASURES.splice(SITE_MEASURES.findIndex(function(x){return x.id===STATE.editMeasureId;}),1);
  showToast('Measure deleted.','success');
  closeModal('modal-measure');
  dashNav('measures');
}

function generatePORef(catCode) {
  var counters = STATE.poCounters || {};
  var next = (counters[catCode]||0) + 1;
  return 'PO-'+catCode+'-'+String(next).padStart(3,'0');
}

/* ================================================================
   DRAWING REGISTER — Multi-drawing management per project
================================================================ */
var _drawingRegisters = {};
try { _drawingRegisters = JSON.parse(localStorage.getItem('contraq_drawing_registers') || '{}'); } catch(e) {}
function _drSave() { try { localStorage.setItem('contraq_drawing_registers', JSON.stringify(_drawingRegisters)); } catch(e) {} }

function renderDrawingRegisterTab(p) {
  var drawings = (p.folders && p.folders.drawings) || [];
  var reg = _drawingRegisters[p.id] || { drawings: [], processed: 0, aggregated: false };
  var h = '';

  /* Header */
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">';
  h += '<div>';
  h += '<div class="cl-detail-section-title" style="margin:0;">Drawing Register</div>';
  h += '<div style="font-size:.68rem;color:var(--off4);margin-top:.15rem;">' + drawings.length + ' drawing' + (drawings.length !== 1 ? 's' : '') + ' uploaded &middot; ' + reg.processed + ' processed</div>';
  h += '</div>';
  h += '<div style="display:flex;gap:.4rem;">';
  if (drawings.length > 0 && reg.processed < drawings.length) {
    h += '<button class="btn btn-primary btn-xs" onclick="drProcessAll(\'' + p.id + '\')">Process All Drawings</button>';
  }
  if (reg.processed > 0) {
    h += '<button class="btn btn-xs" style="background:rgba(96,165,250,.07);color:var(--blue);border:1px solid rgba(96,165,250,.2);" onclick="drShowAggregate(\'' + p.id + '\')">View Aggregate</button>';
  }
  h += '</div></div>';

  /* Stats cards */
  if (reg.drawings.length > 0) {
    var pending = 0, complete = 0, failed = 0, totalItems = 0;
    reg.drawings.forEach(function(d) {
      if (d.status === 'complete') { complete++; totalItems += d.items_extracted || 0; }
      else if (d.status === 'error') failed++;
      else pending++;
    });
    h += '<div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap;">';
    h += '<div class="card" style="flex:1;min-width:80px;padding:.5rem .7rem;"><div class="mono" style="font-size:1rem;color:var(--white);font-weight:700;">' + reg.drawings.length + '</div><div style="font-size:.55rem;color:var(--off4);">Total drawings</div></div>';
    h += '<div class="card" style="flex:1;min-width:80px;padding:.5rem .7rem;"><div class="mono" style="font-size:1rem;color:var(--lime);font-weight:700;">' + complete + '</div><div style="font-size:.55rem;color:var(--off4);">Processed</div></div>';
    if (pending > 0) h += '<div class="card" style="flex:1;min-width:80px;padding:.5rem .7rem;"><div class="mono" style="font-size:1rem;color:#f59e0b;font-weight:700;">' + pending + '</div><div style="font-size:.55rem;color:var(--off4);">Pending</div></div>';
    if (failed > 0) h += '<div class="card" style="flex:1;min-width:80px;padding:.5rem .7rem;"><div class="mono" style="font-size:1rem;color:#f87171;font-weight:700;">' + failed + '</div><div style="font-size:.55rem;color:var(--off4);">Failed</div></div>';
    h += '<div class="card" style="flex:1;min-width:80px;padding:.5rem .7rem;"><div class="mono" style="font-size:1rem;color:var(--orange);font-weight:700;">' + totalItems + '</div><div style="font-size:.55rem;color:var(--off4);">Items extracted</div></div>';
    h += '</div>';
  }

  /* Drawing register table */
  if (drawings.length === 0) {
    h += '<div style="text-align:center;padding:2rem;color:var(--off4);font-size:.8rem;">No drawings uploaded. Add drawings to the project from the Docs tab.</div>';
  } else {
    /* Sync register with folder drawings */
    var regMap = {};
    reg.drawings.forEach(function(d) { regMap[d.filename] = d; });
    var updated = false;
    drawings.forEach(function(d) {
      if (!regMap[d.filename]) {
        reg.drawings.push({ filename: d.filename, revision: d.revision || 'A', date: d.date, size: d.size || '', status: 'pending', items_extracted: 0, validation_grade: '', drawing_ref: d.notes || '' });
        updated = true;
      }
    });
    if (updated) { _drawingRegisters[p.id] = reg; _drSave(); }

    h += '<div class="card" style="padding:0;"><div style="overflow-x:auto;"><table class="tbl"><thead><tr>';
    h += '<th>Drawing</th><th style="width:40px;">Rev</th><th style="width:55px;">Status</th>';
    h += '<th style="width:40px;">Grade</th><th style="width:50px;">Items</th><th style="width:65px;">Date</th>';
    h += '<th style="width:90px;">Action</th>';
    h += '</tr></thead><tbody>';

    reg.drawings.forEach(function(d, i) {
      var statusColor = d.status === 'complete' ? 'var(--lime)' : d.status === 'error' ? '#f87171' : d.status === 'processing' ? '#60a5fa' : 'var(--off4)';
      var statusBg = d.status === 'complete' ? 'rgba(163,230,53,.08)' : d.status === 'error' ? 'rgba(248,113,113,.08)' : d.status === 'processing' ? 'rgba(96,165,250,.08)' : 'rgba(255,255,255,.04)';
      var gradeBg = d.validation_grade === 'A' || d.validation_grade === 'B' ? 'rgba(163,230,53,.08)' : d.validation_grade === 'C' ? 'rgba(251,191,36,.08)' : d.validation_grade ? 'rgba(248,113,113,.08)' : '';
      var gradeColor = d.validation_grade === 'A' || d.validation_grade === 'B' ? 'var(--lime)' : d.validation_grade === 'C' ? '#f59e0b' : d.validation_grade ? '#f87171' : 'var(--off4)';

      h += '<tr>';
      h += '<td style="font-size:.72rem;color:var(--white);" title="' + (d.drawing_ref || '') + '">' + d.filename + '</td>';
      h += '<td><span style="font-family:var(--mono);font-size:.65rem;color:var(--off3);">' + (d.revision || '') + '</span></td>';
      h += '<td><span style="font-family:var(--mono);font-size:.52rem;background:' + statusBg + ';color:' + statusColor + ';border:1px solid ' + statusColor + '33;border-radius:3px;padding:.08rem .25rem;text-transform:uppercase;">' + (d.status || 'pending') + '</span></td>';
      h += '<td><span style="font-family:var(--mono);font-size:.7rem;font-weight:600;background:' + gradeBg + ';color:' + gradeColor + ';border-radius:3px;padding:.05rem .2rem;">' + (d.validation_grade || '\u2014') + '</span></td>';
      h += '<td class="mono" style="font-size:.72rem;color:var(--white);font-weight:600;">' + (d.items_extracted || 0) + '</td>';
      h += '<td style="font-size:.62rem;color:var(--off4);">' + (d.date || '') + '</td>';
      h += '<td style="white-space:nowrap;">';
      if (d.status === 'pending' || d.status === 'error') {
        h += '<button class="btn btn-xs" style="background:rgba(163,230,53,.08);color:var(--lime);border:1px solid rgba(163,230,53,.2);" onclick="drProcessOne(\'' + p.id + '\',' + i + ')">Extract</button> ';
      }
      if (d.status === 'complete') {
        h += '<button class="btn btn-xs" style="background:rgba(96,165,250,.07);color:var(--blue);border:1px solid rgba(96,165,250,.2);" onclick="drViewResult(\'' + p.id + '\',' + i + ')">View</button> ';
        h += '<button class="btn btn-xs" style="background:rgba(255,255,255,.04);color:var(--off4);border:1px solid var(--border);" onclick="drReprocess(\'' + p.id + '\',' + i + ')">Redo</button>';
      }
      h += '</td></tr>';
    });

    h += '</tbody></table></div></div>';
  }

  /* Duplicate flags */
  if (reg.duplicates && reg.duplicates.length > 0) {
    h += '<div style="margin-top:1rem;">';
    h += '<div style="font-size:.78rem;color:#f59e0b;font-weight:600;margin-bottom:.4rem;">\u26a0 ' + reg.duplicates.length + ' potential duplicate' + (reg.duplicates.length !== 1 ? 's' : '') + ' across drawings</div>';
    reg.duplicates.forEach(function(dup, di) {
      h += '<div class="card" style="margin-bottom:.3rem;padding:.5rem .65rem;border-left:3px solid #f59e0b;">';
      h += '<div style="font-size:.72rem;color:var(--white);">' + dup.description + '</div>';
      h += '<div style="font-size:.62rem;color:var(--off3);">Found in: ' + (dup.found_in || []).join(', ') + ' &middot; Total qty: ' + (dup.total_qty || 0) + ' ' + (dup.unit || '') + '</div>';
      h += '<div style="margin-top:.3rem;display:flex;gap:.3rem;">';
      h += '<button class="btn btn-xs" style="background:rgba(163,230,53,.08);color:var(--lime);border:1px solid rgba(163,230,53,.2);" onclick="drResolveDuplicate(\'' + p.id + '\',' + di + ',\'keep\')">Keep both</button>';
      h += '<button class="btn btn-xs" style="background:rgba(248,113,113,.08);color:#f87171;border:1px solid rgba(248,113,113,.2);" onclick="drResolveDuplicate(\'' + p.id + '\',' + di + ',\'remove\')">Remove duplicate</button>';
      h += '</div></div>';
    });
    h += '</div>';
  }

  return h;
}

/* Process all pending drawings in register */
function drProcessAll(projectId) {
  var reg = _drawingRegisters[projectId];
  if (!reg) return;
  var pending = reg.drawings.filter(function(d) { return d.status === 'pending' || d.status === 'error'; });
  if (pending.length === 0) { showToast('All drawings already processed.', 'ok'); return; }
  showToast('Processing ' + pending.length + ' drawing(s)...', 'ok');
  var processed = 0;
  pending.forEach(function(d) {
    d.status = 'processing';
  });
  _drSave();
  renderProjectDetailTab(projectId, 'drawings');

  /* Simulate extraction per drawing (in production, calls /api/register/:ref/process-all) */
  pending.forEach(function(d, idx) {
    setTimeout(function() {
      var grades = ['A', 'A', 'B', 'B', 'C', 'B'];
      var items = Math.floor(Math.random() * 25) + 8;
      d.status = 'complete';
      d.items_extracted = items;
      d.validation_grade = grades[Math.floor(Math.random() * grades.length)];
      d.processed_at = new Date().toISOString();
      reg.processed = reg.drawings.filter(function(dd) { return dd.status === 'complete'; }).length;
      _drawingRegisters[projectId] = reg;
      _drSave();
      processed++;
      if (processed === pending.length) {
        drDetectDuplicates(projectId);
        renderProjectDetailTab(projectId, 'drawings');
        showToast('All drawings processed. ' + reg.processed + '/' + reg.drawings.length + ' complete.', 'success');
      }
    }, (idx + 1) * 1200);
  });
}

function drProcessOne(projectId, drawingIdx) {
  var reg = _drawingRegisters[projectId];
  if (!reg || !reg.drawings[drawingIdx]) return;
  var d = reg.drawings[drawingIdx];
  d.status = 'processing';
  _drSave();
  renderProjectDetailTab(projectId, 'drawings');
  showToast('Processing: ' + d.filename, 'ok');
  setTimeout(function() {
    var grades = ['A', 'B', 'B', 'C'];
    d.status = 'complete';
    d.items_extracted = Math.floor(Math.random() * 25) + 8;
    d.validation_grade = grades[Math.floor(Math.random() * grades.length)];
    d.processed_at = new Date().toISOString();
    reg.processed = reg.drawings.filter(function(dd) { return dd.status === 'complete'; }).length;
    _drSave();
    drDetectDuplicates(projectId);
    renderProjectDetailTab(projectId, 'drawings');
    showToast('Extraction complete: ' + d.filename + ' (' + d.items_extracted + ' items, grade ' + d.validation_grade + ')', 'success');
  }, 2000);
}

function drReprocess(projectId, drawingIdx) {
  var reg = _drawingRegisters[projectId];
  if (!reg || !reg.drawings[drawingIdx]) return;
  reg.drawings[drawingIdx].status = 'pending';
  reg.drawings[drawingIdx].items_extracted = 0;
  reg.drawings[drawingIdx].validation_grade = '';
  reg.processed = reg.drawings.filter(function(d) { return d.status === 'complete'; }).length;
  _drSave();
  renderProjectDetailTab(projectId, 'drawings');
  showToast('Drawing reset to pending.', 'ok');
}

function drViewResult(projectId, drawingIdx) {
  var reg = _drawingRegisters[projectId];
  if (!reg || !reg.drawings[drawingIdx]) return;
  var d = reg.drawings[drawingIdx];
  showToast(d.filename + ': ' + d.items_extracted + ' items extracted, grade ' + d.validation_grade + ', processed ' + (d.processed_at || '').split('T')[0], 'ok');
}

function drShowAggregate(projectId) {
  var reg = _drawingRegisters[projectId];
  if (!reg) return;
  var totalItems = 0;
  reg.drawings.forEach(function(d) { if (d.status === 'complete') totalItems += d.items_extracted || 0; });
  var dups = (reg.duplicates || []).length;
  showToast('Aggregate: ' + totalItems + ' total items across ' + reg.processed + ' drawings. ' + dups + ' potential duplicates flagged.', 'ok');
}

function drDetectDuplicates(projectId) {
  var reg = _drawingRegisters[projectId];
  if (!reg) return;
  /* Simple duplicate detection simulation — in production uses server/services/drawing-register.js */
  var completed = reg.drawings.filter(function(d) { return d.status === 'complete'; });
  var dups = [];
  if (completed.length >= 2) {
    var commonItems = ['LTHW Pipework 22mm copper', 'Cable containment — perforated tray', 'Isolation valves — gate type'];
    commonItems.forEach(function(desc) {
      if (Math.random() > 0.5) {
        var found = completed.slice(0, Math.min(2, completed.length)).map(function(d) { return d.filename; });
        dups.push({ description: desc, found_in: found, total_qty: Math.floor(Math.random() * 50) + 10, unit: desc.indexOf('valve') >= 0 ? 'nr' : 'm' });
      }
    });
  }
  reg.duplicates = dups;
  _drSave();
}

function drResolveDuplicate(projectId, dupIdx, action) {
  var reg = _drawingRegisters[projectId];
  if (!reg || !reg.duplicates) return;
  reg.duplicates.splice(dupIdx, 1);
  _drSave();
  renderProjectDetailTab(projectId, 'drawings');
  showToast('Duplicate ' + (action === 'keep' ? 'kept (both instances)' : 'removed') + '.', 'success');
}

/* ================================================================
   DOCUMENT ATTACHMENTS (Projects & Quotes)
================================================================ */
