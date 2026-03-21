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
   DOCUMENT ATTACHMENTS (Projects & Quotes)
================================================================ */
