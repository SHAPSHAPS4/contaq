/* ═══ CONTRAQ — PROCORE ═══
   _pci state, CSV parsing, field mapping, import/export, renderProcoreImport
   Lines 20482-20862 from contraq-v77
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   PROCORE CSV IMPORT
══════════════════════════════════════════════════════════════ */
var _pci = {
  step: 'upload', // upload | map | done
  fileName: '',
  headers: [],
  rows: [],
  mapping: {},
  imported: null,
  fields: [
    {key:'projectName',label:'Project Name',required:true},
    {key:'client',label:'Client',required:true},
    {key:'contractValue',label:'Contract Value',required:true},
    {key:'startDate',label:'Start Date',required:true},
    {key:'endDate',label:'End Date',required:false},
    {key:'projectManager',label:'Project Manager',required:false},
    {key:'status',label:'Status',required:false}
  ],
  hints: {
    projectName:['project name','name','project','project title','title','job name','job'],
    client:['client','owner','company','customer','client name','owner name','gc','main contractor'],
    contractValue:['contract value','value','amount','total','contract amount','budget','original value'],
    startDate:['start date','start','commence','commencement','projected start','est. start'],
    endDate:['end date','end','completion','finish','projected finish','est. completion','completion date'],
    projectManager:['project manager','pm','manager','superintendent','project lead'],
    status:['status','stage','state','phase','project status']
  }
};

function pciAutoMap(headers) {
  var mapping = {};
  var norm = headers.map(function(h){return h.toLowerCase().trim();});
  _pci.fields.forEach(function(field) {
    var hints = _pci.hints[field.key] || [];
    var best = -1;
    for (var i = 0; i < norm.length; i++) {
      var taken = false;
      for (var k in mapping) { if (mapping[k] === i) { taken = true; break; } }
      if (taken) continue;
      var h = norm[i];
      var exactMatch = hints.some(function(hint){return h === hint;});
      if (exactMatch) { best = i; break; }
      if (best === -1 && hints.some(function(hint){return h.indexOf(hint) >= 0 || hint.indexOf(h) >= 0;})) best = i;
    }
    if (best !== -1) mapping[field.key] = best;
  });
  return mapping;
}

function pciParseCSV(text) {
  var lines = [];
  var current = '';
  var inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if ((ch === ',' || ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === ',') {
        if (!lines.length || lines[lines.length-1].done) lines.push({cells:[current],done:false});
        else lines[lines.length-1].cells.push(current);
        current = '';
      } else {
        if (ch === '\r' && text[i+1] === '\n') i++;
        if (lines.length && !lines[lines.length-1].done) {
          lines[lines.length-1].cells.push(current);
          lines[lines.length-1].done = true;
        } else if (current) {
          lines.push({cells:[current],done:true});
        }
        current = '';
      }
    } else { current += ch; }
  }
  if (current || (lines.length && !lines[lines.length-1].done)) {
    if (lines.length && !lines[lines.length-1].done) lines[lines.length-1].cells.push(current);
    else lines.push({cells:[current],done:true});
  }
  return lines.map(function(l){return l.cells.map(function(c){return c.trim();});});
}

function pciProcessFile(file) {
  if (!file) return;
  _pci.fileName = file.name;
  var reader = new FileReader();
  reader.onload = function(e) {
    var parsed = pciParseCSV(e.target.result);
    if (parsed.length < 2) return;
    _pci.headers = parsed[0];
    _pci.rows = parsed.slice(1).filter(function(r){return r.some(function(c){return c.length > 0;});});
    _pci.mapping = pciAutoMap(_pci.headers);
    _pci.step = 'map';
    renderProcoreImport();
  };
  reader.readAsText(file);
}

function pciReset() {
  _pci.step = 'upload';
  _pci.fileName = '';
  _pci.headers = [];
  _pci.rows = [];
  _pci.mapping = {};
  _pci.imported = null;
  renderProcoreImport();
}

function pciUpdateMapping(fieldKey, val) {
  if (val === '') delete _pci.mapping[fieldKey];
  else _pci.mapping[fieldKey] = parseInt(val);
  renderProcoreImport();
}

function pciDoImport() {
  var result = _pci.rows.map(function(row) {
    var obj = {};
    _pci.fields.forEach(function(field) {
      var idx = _pci.mapping[field.key];
      obj[field.key] = idx !== undefined ? (row[idx] || '') : '';
    });
    return obj;
  });
  _pci.imported = result;
  _pci.step = 'done';
  renderProcoreImport();
}

function pciCopyJSON() {
  if (!_pci.imported) return;
  var text = JSON.stringify(_pci.imported, null, 2);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  var btn = document.getElementById('pci-copy-btn');
  if (btn) { btn.textContent = 'Copied!'; setTimeout(function(){btn.textContent='Copy JSON';}, 1500); }
}

function renderProcoreImport() {
  var c = document.getElementById('dash-content');
  if (!c) return;
  var html = '<div class="pci-wrap">';

  // Page header
  html += '<div class="page-hdr"><div class="page-hdr-left">'
    + '<h2>Procore CSV Import</h2>'
    + '<div style="position:relative;display:inline-block"><button class="help-tip" onclick="showHelpTip(\'procore\')" title="What is this?">?</button>'
    + '<div class="help-tooltip" id="help-tip-procore">Import projects from Procore by uploading a CSV export. Contraq automatically maps Procore columns to its project data model. Go to Procore → Reporting → Projects → Export CSV.</div></div>'
    + '<p>Map Procore project exports to the Contraq data model</p></div>';
  if (_pci.step !== 'upload') {
    html += '<div><button class="btn btn-ghost btn-sm" onclick="pciReset()">← Reset</button></div>';
  }
  html += '</div>';

  // ─── UPLOAD STEP ───
  if (_pci.step === 'upload') {
    html += '<div id="pci-dropzone" class="pci-dropzone"'
      + ' ondrop="event.preventDefault();this.classList.remove(\'drag-over\');var f=event.dataTransfer.files[0];if(f&&(f.name.endsWith(\'.csv\')||f.type===\'text/csv\'))pciProcessFile(f);"'
      + ' ondragover="event.preventDefault();this.classList.add(\'drag-over\')"'
      + ' ondragleave="this.classList.remove(\'drag-over\')"'
      + ' onclick="document.getElementById(\'pci-file-input\').click()">'
      + '<div style="opacity:.5">' + iconSvg('folderOpen', 32) + '</div>'
      + '<div class="pci-drop-title">Drop your Procore CSV export here</div>'
      + '<div class="pci-drop-sub">or click to browse · Project exports from <strong style="color:var(--off2)">Procore → Reporting → CSV</strong></div>'
      + '<div class="pci-drop-btn">SELECT CSV FILE</div>'
      + '</div>'
      + '<input id="pci-file-input" type="file" accept=".csv" style="display:none" onchange="pciProcessFile(this.files[0])">';

    // Expected columns hint
    html += '<div class="pci-hints">'
      + '<div class="pci-hints-label">Expected columns from Procore</div>';
    ['Project Name','Owner / Client','Contract Value','Start Date','Completion Date','Project Manager','Status'].forEach(function(col){
      html += '<span class="pci-hint-tag">' + col + '</span>';
    });
    html += '</div>';
  }

  // ─── MAP STEP ───
  if (_pci.step === 'map') {
    var mappedCount = Object.keys(_pci.mapping).length;
    var reqFields = _pci.fields.filter(function(f){return f.required;});
    var unmappedReq = reqFields.filter(function(f){return _pci.mapping[f.key] === undefined;});
    var allReqMapped = unmappedReq.length === 0;

    // File info bar
    html += '<div class="pci-file-bar">'
      + '<span>' + ICON.file + '</span>'
      + '<span class="pci-file-name">' + _pci.fileName + '</span>'
      + '<span class="pci-file-meta">' + _pci.rows.length + ' project' + (_pci.rows.length !== 1 ? 's' : '') + ' · ' + _pci.headers.length + ' columns</span>'
      + '<span class="pci-badge ' + (allReqMapped ? 'pci-badge-ok' : 'pci-badge-warn') + '">'
      + mappedCount + '/' + _pci.fields.length + ' mapped</span>'
      + '</div>';

    // Column mapping card
    html += '<div class="pci-card"><div class="pci-card-hdr"><h4>Column Mapping</h4>'
      + '<span>Auto-matched ' + Object.keys(pciAutoMap(_pci.headers)).length + ' columns · adjust below</span></div>';

    _pci.fields.forEach(function(field) {
      var isMapped = _pci.mapping[field.key] !== undefined;
      var isUnmappedReq = field.required && !isMapped;
      var rowClass = 'pci-map-row' + (isUnmappedReq ? ' unmapped-req' : '');

      html += '<div class="' + rowClass + '">';

      // Status icon
      html += '<div class="pci-map-status">';
      if (isMapped) html += '<span style="color:#22c55e">✓</span>';
      else if (isUnmappedReq) html += '<span style="color:#ef4444">⚠</span>';
      else html += '<span style="color:var(--off4)">·</span>';
      html += '</div>';

      // Field label
      var labelClass = 'pci-map-label' + (isUnmappedReq ? ' req-missing' : '');
      html += '<div class="' + labelClass + '">' + field.label;
      if (field.required) html += '<span class="pci-req">req</span>';
      html += '</div>';

      // Arrow
      html += '<div class="pci-map-arrow' + (isMapped ? '' : ' dim') + '">→</div>';

      // Select dropdown
      html += '<div class="pci-map-select"><select onchange="pciUpdateMapping(\'' + field.key + '\',this.value)">';
      html += '<option value="">— Select Procore column —</option>';
      _pci.headers.forEach(function(h, i) {
        var sel = (_pci.mapping[field.key] === i) ? ' selected' : '';
        html += '<option value="' + i + '"' + sel + '>' + h.replace(/</g,'&lt;') + '</option>';
      });
      html += '</select></div>';

      // Sample value
      if (isMapped && _pci.rows[0]) {
        var sampleVal = _pci.rows[0][_pci.mapping[field.key]] || '—';
        html += '<div class="pci-map-sample">e.g. ' + sampleVal.replace(/</g,'&lt;').substring(0,30) + '</div>';
      }

      html += '</div>';
    });
    html += '</div>'; // close card

    // Unmapped warning
    if (unmappedReq.length > 0) {
      html += '<div class="pci-warn-bar">'
        + '<span style="color:#ef4444">⚠</span> '
        + unmappedReq.length + ' required field' + (unmappedReq.length > 1 ? 's' : '') + ' unmapped: '
        + '<strong>' + unmappedReq.map(function(f){return f.label;}).join(', ') + '</strong>'
        + '</div>';
    }

    // Preview table
    if (mappedCount > 0) {
      var preview = _pci.rows.slice(0, 5);
      var mappedFields = _pci.fields.filter(function(f){return _pci.mapping[f.key] !== undefined;});

      html += '<div class="pci-card"><div class="pci-card-hdr"><h4>Preview</h4>'
        + '<span>Showing ' + Math.min(5, _pci.rows.length) + ' of ' + _pci.rows.length + ' rows</span></div>'
        + '<div style="overflow-x:auto" class="pci-preview"><table><thead><tr><th>#</th>';
      mappedFields.forEach(function(f){ html += '<th class="pci-th-orange">' + f.label + '</th>'; });
      html += '</tr></thead><tbody>';

      preview.forEach(function(row, ri) {
        html += '<tr><td style="color:var(--off4);font-size:.6rem;font-weight:600">' + (ri+1) + '</td>';
        mappedFields.forEach(function(f) {
          var val = row[_pci.mapping[f.key]] || '';
          var escaped = val.replace(/</g,'&lt;').substring(0, 40);
          if (f.key === 'contractValue' && val) {
            var display = (val.indexOf('£') === 0 || val.indexOf('$') === 0) ? escaped : '£' + escaped;
            html += '<td class="pci-val">' + display + '</td>';
          } else if (val) {
            html += '<td>' + escaped + '</td>';
          } else {
            html += '<td class="pci-empty">—</td>';
          }
        });
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
    }

    // Import button
    html += '<div class="pci-actions">';
    if (allReqMapped) html += '<span class="pci-hint">All required fields mapped</span>';
    html += '<button class="pci-import-btn ' + (allReqMapped ? 'enabled' : 'disabled') + '"'
      + (allReqMapped ? ' onclick="pciDoImport()"' : ' disabled')
      + '>Import ' + _pci.rows.length + ' project' + (_pci.rows.length !== 1 ? 's' : '') + ' →</button>'
      + '</div>';
  }

  // ─── DONE STEP ───
  if (_pci.step === 'done' && _pci.imported) {
    html += '<div class="pci-success">'
      + '<div class="pci-success-icon">✓</div>'
      + '<h3>' + _pci.imported.length + ' project' + (_pci.imported.length !== 1 ? 's' : '') + ' imported</h3>'
      + '<p>from ' + _pci.fileName + ' · mapped to Contraq data model</p>'
      + '</div>';

    // JSON output
    html += '<div class="pci-json-wrap"><div class="pci-card-hdr"><h4>Structured Output</h4>'
      + '<button id="pci-copy-btn" class="btn btn-ghost btn-sm" style="font-family:var(--mono);font-size:.62rem;letter-spacing:.04em" onclick="pciCopyJSON()">Copy JSON</button>'
      + '</div>'
      + '<pre>' + JSON.stringify(_pci.imported, null, 2).replace(/</g,'&lt;') + '</pre></div>';

    // Summary table
    html += '<div class="pci-card"><div class="pci-card-hdr"><h4>Import Summary</h4></div>'
      + '<div style="overflow-x:auto" class="pci-preview"><table><thead><tr>';
    _pci.fields.forEach(function(f){ html += '<th class="pci-th-orange">' + f.label + '</th>'; });
    html += '</tr></thead><tbody>';
    _pci.imported.slice(0, 10).forEach(function(obj) {
      html += '<tr>';
      _pci.fields.forEach(function(f) {
        var val = obj[f.key] || '';
        var escaped = val.replace(/</g,'&lt;').substring(0, 35);
        if (f.key === 'contractValue' && val) {
          var display = (val.indexOf('£') === 0 || val.indexOf('$') === 0) ? escaped : '£' + escaped;
          html += '<td class="pci-val">' + display + '</td>';
        } else if (val) {
          html += '<td>' + escaped + '</td>';
        } else {
          html += '<td class="pci-empty">—</td>';
        }
      });
      html += '</tr>';
    });
    if (_pci.imported.length > 10) {
      html += '<tr><td colspan="' + _pci.fields.length + '" style="text-align:center;color:var(--off4);font-size:.65rem;padding:.7rem">… and ' + (_pci.imported.length - 10) + ' more</td></tr>';
    }
    html += '</tbody></table></div></div>';

    // Actions
    html += '<div class="pci-actions">'
      + '<button class="btn btn-ghost btn-sm" onclick="pciReset()">Import another file</button>'
      + '<button class="btn btn-primary btn-sm" onclick="pciAddToProjects()">Add to Contraq Projects →</button>'
      + '</div>';
  }

  html += '</div>'; // close pci-wrap
  c.innerHTML = html;
}

function pciAddToProjects() {
  if (!_pci.imported || !_pci.imported.length) return;
  var added = 0;
  _pci.imported.forEach(function(obj, idx) {
    if (!obj.projectName) return;
    var id = 'pc-p' + (Date.now() + idx);
    var clientId = '';
    if (obj.client) {
      var existing = CLIENTS.find(function(cl){return cl.name.toLowerCase() === obj.client.toLowerCase();});
      if (existing) clientId = existing.id;
      else {
        clientId = 'pc-cl' + (Date.now() + idx);
        CLIENTS.push({id:clientId,name:obj.client,contact:obj.projectManager||'',email:'',phone:'',address:'',notes:'Imported from Procore CSV'});
      }
    }
    var valStr = (obj.contractValue || '').replace(/[£$,\s]/g,'');
    var val = parseFloat(valStr) || 0;
    var statusMap = {'active':'active','in progress':'active','bidding':'tender','tender':'tender','awarded':'active','complete':'completed','completed':'completed','closed':'completed'};
    var rawStatus = (obj.status || '').toLowerCase().trim();
    var status = statusMap[rawStatus] || 'active';
    PROJECTS.push({
      id:id, name:obj.projectName, client:clientId, clientName:obj.client||'',
      value:val, start:obj.startDate||'', end:obj.endDate||'',
      manager:obj.projectManager||'', status:status,
      notes:'Imported from Procore CSV — ' + _pci.fileName,
      tags:['procore-import']
    });
    added++;
  });
  if (added > 0) {
    alert(added + ' project' + (added !== 1 ? 's' : '') + ' added to Contraq. Switching to Projects…');
    dashNav('projects');
  }
}

