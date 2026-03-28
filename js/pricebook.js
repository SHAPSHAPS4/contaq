/* ═══ CONTRAQ — PRICEBOOK ═══
   renderPriceBook, price book AI upload, apply imported data
   Lines 11083-11697 from contraq-v77
═══════════════════════════════════════════ */



/* ── Reset to demo data ─────────────────────────────────────── */
function qbResetDemoData() {
  for (var i = PROJECTS.length - 1; i >= 0; i--) {
    if (PROJECTS[i].id && PROJECTS[i].id.startsWith('iq-p')) { PROJECTS.splice(i, 1); }
  }
  TENDERS.length = 0;
  TENDERS_DEMO.forEach(function(t){ TENDERS.push(JSON.parse(JSON.stringify(t))); });
  PROJECTS_DEMO_KEYS = {};
  renderTenders('all');
  showToast('Demo data restored.', 'success');
}


/* ══════════════════════════════════════════════════════════════
   MATERIALS & PRICE BOOK
══════════════════════════════════════════════════════════════ */

function renderPriceBook() {
  /* ── API: load pricebook from database for real users ── */
  if (ContraqAPI.isRealUser() && !STATE._pricebookApiLoaded) {
    ContraqAPI.getPricebook().then(function(items) {
      if (items && items.length) {
        MATERIALS_PRICE_BOOK.length = 0;
        items.forEach(function(m) {
          MATERIALS_PRICE_BOOK.push({
            id: m.id,
            name: m.name,
            unit: m.unit,
            qtyPerPack: m.qty_per_pack || m.qtyPerPack || null,
            supplierPrice: m.supplier_price || m.supplierPrice || 0,
            category: m.category,
            supplier: m.supplier,
            updated: m.updated || m.updated_at || ''
          });
        });
      }
      STATE._pricebookApiLoaded = true;
      renderPriceBook();
    }).catch(function(e) { console.error('[Pricebook] API error:', e); STATE._pricebookApiLoaded = true; renderPriceBook(); });
    return;
  }

  var total   = MATERIALS_PRICE_BOOK.length;
  var cats    = {};
  MATERIALS_PRICE_BOOK.forEach(function(m){ cats[m.category] = (cats[m.category]||0)+1; });
  var catCount = Object.keys(cats).length;
  var avgPrice = total > 0
    ? (MATERIALS_PRICE_BOOK.reduce(function(s,m){return s+m.supplierPrice;},0)/total).toFixed(2)
    : '0.00';

  var sorted = MATERIALS_PRICE_BOOK.slice().sort(function(a,b){return a.name.localeCompare(b.name);});
  var html = '';

  /* ── Page header ── */
  html += '<div class="page-hdr">'
    + '<div class="page-hdr-left"><h2>Materials &amp; Price Book</h2>'
    + '<p>'+total+' materials &nbsp;&middot;&nbsp; '+catCount+' categories &nbsp;&middot;&nbsp; avg £'+avgPrice+' per unit</p>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:.65rem;">'
    + '<button class="pb-reset-link" onclick="pbResetDemoData()">&#8635; Reset demo</button>'
    + '<button class="pb-upload-btn" onclick="openModal(\'modal-pb-upload\')">'
    + '<span>' + ICON.chart + '</span> Upload Supplier Price Book AI Enabled</button>'
    + '</div></div>';

  /* ── KPI row ── */
  html += '<div class="kpi-grid" style="margin-bottom:1.1rem;">'
    + '<div class="kpi proj-stat-kpi" style="--kc:#a3e635;">'
    +   '<div class="kpi-label">Total Items</div>'
    +   '<div class="kpi-val" style="color:#a3e635;">'+total+'</div>'
    +   '<div class="kpi-delta">across all categories</div>'
    + '</div>'
    + '<div class="kpi proj-stat-kpi" style="--kc:#f97316;">'
    +   '<div class="kpi-label">Categories</div>'
    +   '<div class="kpi-val" style="color:#f97316;">'+catCount+'</div>'
    +   '<div class="kpi-delta">material types</div>'
    + '</div>'
    + '<div class="kpi proj-stat-kpi" style="--kc:#60a5fa;">'
    +   '<div class="kpi-label">Avg Unit Price</div>'
    +   '<div class="kpi-val" style="color:#60a5fa;">£'+avgPrice+'</div>'
    +   '<div class="kpi-delta">ex. VAT</div>'
    + '</div>'
    + '<div class="kpi proj-stat-kpi" style="--kc:#fbbf24;">'
    +   '<div class="kpi-label">Suppliers</div>'
    +   '<div class="kpi-val" style="color:#fbbf24;">'
    +   ([...new Set(MATERIALS_PRICE_BOOK.map(function(m){return m.supplier;}))].length)
    +   '</div><div class="kpi-delta">in price book</div>'
    + '</div>'
    + '</div>';

  /* ── Table ── */
  html += '<div class="card"><div style="overflow-x:auto"><table class="tbl"><thead>'
    + '<tr>'
    + '<th>Material / Item Name</th>'
    + '<th>Category</th>'
    + '<th>Unit</th>'
    + '<th>Qty / Pack</th>'
    + '<th>Supplier</th>'
    + '<th>Unit Price (ex. VAT)</th>'
    + '<th>Last Updated</th>'
    + '</tr></thead><tbody>';

  if (sorted.length === 0) {
    html += '<tr><td colspan="7" style="text-align:center;padding:2.5rem;color:var(--off4);">No materials in price book. Upload a supplier price list to get started.</td></tr>';
  } else {
    sorted.forEach(function(m) {
      html += '<tr>'
        + '<td class="strong">'+m.name+'</td>'
        + '<td><span class="pb-cat-badge">'+m.category+'</span></td>'
        + '<td class="mono">'+m.unit+'</td>'
        + '<td class="mono">'+(m.qtyPerPack ? m.qtyPerPack : '&mdash;')+'</td>'
        + '<td style="font-size:.75rem;color:var(--off2);">'+m.supplier+'</td>'
        + '<td class="mono" style="color:var(--lime);font-weight:700;">£'+m.supplierPrice.toFixed(2)+'</td>'
        + '<td class="mono" style="font-size:.68rem;color:var(--off3);">'+fmtDate(m.updated)+'</td>'
        + '</tr>';
    });
  }
  html += '</tbody></table></div></div>';

  /* ── Uploaded books folder ── */
  if (PB_UPLOADED_BOOKS.length > 0) {
    html += '<div class="pb-books-section"><div class="card-header" style="margin-bottom:.6rem;">'
      + '<span class="card-title">&#128193; Imported Price Books</span>'
      + '</div>';
    PB_UPLOADED_BOOKS.forEach(function(book) {
      var ext = (book.name.split('.').pop()||'').toLowerCase();
      var icon = ext === 'pdf' ? ICON.file : ICON.chart;
      html += '<div class="pb-book-item" style="margin-bottom:.4rem;">'
        + '<span class="pb-book-icon">'+icon+'</span>'
        + '<span class="pb-book-name">'+book.name+'</span>'
        + '<span class="pb-book-meta">'+book.imported+' &nbsp;&middot;&nbsp; '+book.count+' items</span>'
        + '</div>';
    });
    html += '</div>';
  }

  document.getElementById('dash-content').innerHTML = html;
}

/* ── Upload helpers ─────────────────────────────────────────── */
function pbFileSelected(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  pbShowFileChosen(file);
}

function pbHandleDrop(event) {
  event.preventDefault();
  document.getElementById('pb-dropzone').classList.remove('drag-active');
  var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (!file) return;
  if (!/\.(xlsx|xls|pdf)$/i.test(file.name)) {
    showToast('Please upload an .xlsx, .xls, or .pdf file.', 'error');
    return;
  }
  pbShowFileChosen(file);
}

function pbShowFileChosen(file) {
  _pbSelectedFile = file;
  var ext = (file.name.split('.').pop()||'').toLowerCase();
  document.getElementById('pb-file-icon').innerHTML = ext === 'pdf' ? ICON.file : ICON.chart;
  document.getElementById('pb-file-name').textContent = file.name;
  document.getElementById('pb-file-size').textContent = (file.size/1024).toFixed(1)+' KB';
  document.getElementById('pb-file-chosen').classList.add('active');
  var btn = document.getElementById('pb-analyse-btn');
  btn.disabled = false; btn.style.opacity='1'; btn.style.cursor='pointer';
}

/* ── Store the selected file for upload ─────────────────────── */
var _pbSelectedFile = null;

function pbStartAnalysis() {
  var fileInput = document.getElementById('pb-file-input-pb');
  var file = _pbSelectedFile || (fileInput && fileInput.files && fileInput.files[0]);
  if (!file) { showToast('No file selected.', 'error'); return; }

  document.getElementById('pb-dropzone').style.display='none';
  document.getElementById('pb-file-chosen').style.display='none';
  document.getElementById('pb-upload-footer').style.display='none';
  document.getElementById('pb-upload-title').textContent='Importing Supplier Price Book\u2026';
  document.getElementById('pb-ai-progress').classList.add('active');
  document.getElementById('pb-ai-step').textContent = 'Reading file\u2026';
  document.getElementById('pb-ai-prog-fill').style.width = '10%';

  /* ── Demo mode: use hardcoded data ── */
  if (!ContraqAPI.isRealUser()) {
    _pbRunDemoImport(file);
    return;
  }

  /* ── Real AI extraction ── */
  var reader = new FileReader();
  reader.onload = function() {
    var base64 = reader.result.split(',')[1];
    document.getElementById('pb-ai-step').textContent = 'Sending to AI\u2026';
    document.getElementById('pb-ai-prog-fill').style.width = '20%';
    _pbCallAI(file, base64);
  };
  reader.onerror = function() {
    showToast('Failed to read file.', 'error');
    pbResetUploadModal();
  };
  reader.readAsDataURL(file);
}

function _pbCallAI(file, base64) {
  var startTime = Date.now();
  var fname = file.name;
  var fsize = (file.size / 1024).toFixed(1);
  var mimeType = file.type || 'application/pdf';
  /* xlsx files may report empty type — detect from extension */
  if (!mimeType || mimeType === 'application/octet-stream') {
    var ext = (fname.split('.').pop() || '').toLowerCase();
    if (ext === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === 'xls') mimeType = 'application/vnd.ms-excel';
    else if (ext === 'pdf') mimeType = 'application/pdf';
  }

  fetch(CONTRAQ_API_BASE + '/api/pricebook/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_base64: base64,
      file_name: fname,
      mime_type: mimeType
    })
  }).then(function(resp) {
    if (!resp.ok && !resp.headers.get('content-type')?.includes('text/event-stream')) {
      return resp.json().then(function(err) { throw new Error(err.error?.message || 'Server error'); });
    }
    /* ── Consume SSE stream ── */
    var streamReader = resp.body.getReader();
    var decoder = new TextDecoder();
    var fullText = '';
    var lastItemCount = 0;

    function readChunk() {
      return streamReader.read().then(function(result) {
        if (result.done) return fullText;
        var chunk = decoder.decode(result.value, { stream: true });
        fullText += chunk;

        /* Parse SSE lines for progress updates */
        var lines = fullText.split('\n');
        for (var i = 0; i < lines.length; i++) {
          if (!lines[i].startsWith('data: ')) continue;
          var raw = lines[i].slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            var evt = JSON.parse(raw);
            if (evt.progress && evt.items_so_far > lastItemCount) {
              lastItemCount = evt.items_so_far;
              var pct = Math.min(20 + Math.round(lastItemCount * 2.5), 90);
              document.getElementById('pb-ai-prog-fill').style.width = pct + '%';
              document.getElementById('pb-ai-step').textContent = 'Extracting materials\u2026 ' + lastItemCount + ' items found';
            }
          } catch(e) {}
        }

        return readChunk();
      });
    }

    return readChunk().then(function(sseText) {
      /* Find the final result event */
      var dataLines = sseText.split('\n');
      var resultData = null;
      for (var i = dataLines.length - 1; i >= 0; i--) {
        if (dataLines[i].startsWith('data: ') && dataLines[i].indexOf('"type":"result"') > -1) {
          try { resultData = JSON.parse(dataLines[i].slice(6)); } catch(e) {}
          break;
        }
      }
      if (!resultData || !resultData.data || resultData.data.error) {
        var msg = resultData && resultData.data && resultData.data.parse_error
          ? 'AI could not parse the document. Try a cleaner PDF or spreadsheet.'
          : (resultData && resultData.data && resultData.data.message) || 'No data extracted. Please try again.';
        throw new Error(msg);
      }
      return { data: resultData.data, elapsed: resultData.elapsed_seconds, fname: fname, fsize: fsize };
    });
  }).then(function(result) {
    _pbApplyAIResult(result.data, result.fname, result.fsize, result.elapsed);
  }).catch(function(err) {
    console.error('[Pricebook AI]', err);
    document.getElementById('pb-ai-step').textContent = 'Error: ' + err.message;
    document.getElementById('pb-ai-prog-fill').style.width = '100%';
    document.getElementById('pb-ai-prog-fill').style.background = 'var(--red)';
    setTimeout(function() {
      pbResetUploadModal();
      showToast('Price book import failed: ' + err.message, 'error');
    }, 2000);
  });
}

function _pbApplyAIResult(data, fname, fsize, elapsed) {
  var items = data.items || [];
  if (!items.length) {
    showToast('AI found no material items in the document.', 'error');
    pbResetUploadModal();
    return;
  }

  document.getElementById('pb-ai-step').textContent = 'Finalising\u2026 ' + items.length + ' materials extracted';
  document.getElementById('pb-ai-prog-fill').style.width = '100%';

  var today = new Date().toISOString().split('T')[0];

  /* Map AI output to frontend format */
  var imported = items.map(function(item, idx) {
    return {
      id: 'ai-' + Date.now() + '-' + idx,
      name: item.name || 'Unknown item',
      unit: item.unit || 'nr',
      qtyPerPack: item.qty_per_pack || null,
      supplierPrice: parseFloat(item.supplier_price) || 0,
      category: item.category || 'Other',
      supplier: item.supplier || data.supplier_name || 'Unknown',
      updated: today
    };
  });

  /* Replace MATERIALS_PRICE_BOOK */
  MATERIALS_PRICE_BOOK.length = 0;
  imported.forEach(function(m) { MATERIALS_PRICE_BOOK.push(m); });

  /* Record the uploaded book */
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  PB_UPLOADED_BOOKS.unshift({ name: fname, size: fsize, imported: dateStr, count: imported.length });

  /* ── API: persist imported pricebook items ── */
  if (ContraqAPI.isRealUser()) {
    imported.forEach(function(m) {
      fetch(CONTRAQ_API_BASE + '/api/data/pricebook', {
        method: 'POST',
        headers: typeof getAuthHeader === 'function' ? getAuthHeader() : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: m.name, unit: m.unit, qty_per_pack: m.qtyPerPack, supplier_price: m.supplierPrice, category: m.category, supplier: m.supplier, updated: m.updated })
      }).catch(function(e) { console.error('[Pricebook] Save error:', e); });
    });
  }

  closeModal('modal-pb-upload');
  pbResetUploadModal();
  renderPriceBook();

  var elapsedStr = elapsed ? ' in ' + elapsed + 's' : '';
  showToast('Price book imported — ' + imported.length + ' materials extracted by AI' + elapsedStr + '.', 'success');
}

/* ── Demo mode fallback (no API call) ─────────────────────────── */
function _pbRunDemoImport(file) {
  var fname = file.name;
  var fsize = (file.size / 1024).toFixed(1);

  var steps = [
    { text: 'Reading file\u2026', pct: 15, delay: 0 },
    { text: 'Detecting column headers\u2026', pct: 30, delay: 700 },
    { text: 'Extracting material rows\u2026', pct: 50, delay: 1400 },
    { text: 'Identifying units & pack sizes\u2026', pct: 68, delay: 2100 },
    { text: 'Mapping supplier pricing\u2026', pct: 85, delay: 2800 },
    { text: 'Finalising price book\u2026', pct: 100, delay: 3400 }
  ];

  function runStep(i) {
    if (i >= steps.length) {
      setTimeout(function() {
        var demoItems = [
          { id: 'pi01', name: 'Aeroflex Acoustic Tube 15mm\u00d710mm', unit: 'm', qtyPerPack: 2, supplierPrice: 1.85, category: 'Pipe Insulation', supplier: 'Aeroflex Europe', updated: '2026-03-01' },
          { id: 'pi02', name: 'Aeroflex Acoustic Tube 28mm\u00d710mm', unit: 'm', qtyPerPack: 2, supplierPrice: 2.40, category: 'Pipe Insulation', supplier: 'Aeroflex Europe', updated: '2026-03-01' },
          { id: 'pi03', name: 'Armaflex AP Tape 50mm', unit: 'roll', qtyPerPack: null, supplierPrice: 5.20, category: 'Adhesives & Tape', supplier: 'Armacell UK', updated: '2026-02-20' },
          { id: 'pi04', name: 'Armaflex Closed-Cell Foam Sheet 25mm', unit: 'sheet', qtyPerPack: null, supplierPrice: 31.50, category: 'Sheet Insulation', supplier: 'Armacell UK', updated: '2026-02-20' },
          { id: 'pi05', name: 'Calcium Silicate Block 65mm', unit: 'section', qtyPerPack: null, supplierPrice: 18.90, category: 'High-Temp Insulation', supplier: 'Morgan Thermal Ceramics', updated: '2026-01-30' },
          { id: 'pi06', name: 'Ceramic Fibre Blanket 50mm\u00d71m', unit: 'roll', qtyPerPack: null, supplierPrice: 62.00, category: 'High-Temp Insulation', supplier: 'Morgan Thermal Ceramics', updated: '2026-01-30' },
          { id: 'pi07', name: 'Fibreglass Pipe Section 3in\u00d71in', unit: 'section', qtyPerPack: null, supplierPrice: 7.80, category: 'Pipe Insulation', supplier: 'Knauf Insulation', updated: '2026-02-10' },
          { id: 'pi08', name: 'Foil Scrim Kraft (FSK) Facing Tape', unit: 'roll', qtyPerPack: null, supplierPrice: 9.40, category: 'Adhesives & Tape', supplier: 'Scapa UK', updated: '2026-01-10' },
          { id: 'pi09', name: 'Galvanised Wire Mesh (1m\u00d710m)', unit: 'roll', qtyPerPack: null, supplierPrice: 44.00, category: 'Fixings', supplier: 'SteelMesh Direct', updated: '2025-12-01' },
          { id: 'pi10', name: 'Glass Wool Blanket 100mm\u00d7600mm', unit: 'roll', qtyPerPack: null, supplierPrice: 55.00, category: 'Sheet Insulation', supplier: 'Isover Saint-Gobain', updated: '2026-02-15' },
          { id: 'pi11', name: 'Lagging Pins Welded M4 (100\u00d7Pack)', unit: 'pack', qtyPerPack: 100, supplierPrice: 11.20, category: 'Fixings', supplier: 'Fixfast UK', updated: '2026-01-08' },
          { id: 'pi12', name: 'Mineral Wool Pipe Section 76mm\u00d750mm', unit: 'm', qtyPerPack: 1, supplierPrice: 6.10, category: 'Pipe Insulation', supplier: 'Rockwool Ltd', updated: '2026-02-01' },
          { id: 'pi13', name: 'Phenolic Ductwork Board 30mm (1.2\u00d72.4m)', unit: 'board', qtyPerPack: null, supplierPrice: 34.80, category: 'Ductwork', supplier: 'Kingspan Insulation', updated: '2026-02-25' },
          { id: 'pi14', name: 'PIR Pipe Section 28mm\u00d750mm', unit: 'm', qtyPerPack: 1, supplierPrice: 4.25, category: 'Pipe Insulation', supplier: 'Kingspan Insulation', updated: '2026-02-25' },
          { id: 'pi15', name: 'Polysurlyn Jacketing 0.5mm (1m\u00d730m)', unit: 'roll', qtyPerPack: null, supplierPrice: 78.00, category: 'Cladding', supplier: 'Rytons Building Products', updated: '2025-11-20' },
          { id: 'pi16', name: 'Screws & Rivets \u2014 Cladding Pack (200)', unit: 'pack', qtyPerPack: 200, supplierPrice: 8.40, category: 'Fixings', supplier: 'Fixfast UK', updated: '2026-01-08' },
          { id: 'pi17', name: 'Stainless Banding Tool Kit', unit: 'kit', qtyPerPack: null, supplierPrice: 145.00, category: 'Tools', supplier: 'Bandfix UK', updated: '2025-10-15' },
          { id: 'pi18', name: 'Vapour Barrier Emulsion (5L)', unit: 'tin', qtyPerPack: null, supplierPrice: 28.50, category: 'Adhesives & Tape', supplier: 'Tremco CPG', updated: '2025-12-20' }
        ];
        MATERIALS_PRICE_BOOK.length = 0;
        demoItems.forEach(function(m) { MATERIALS_PRICE_BOOK.push(m); });
        var now = new Date();
        var dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        PB_UPLOADED_BOOKS.unshift({ name: fname, size: fsize, imported: dateStr, count: demoItems.length });
        closeModal('modal-pb-upload');
        pbResetUploadModal();
        renderPriceBook();
        showToast('Price book imported — ' + demoItems.length + ' materials added (demo mode).', 'success');
      }, 400);
      return;
    }
    setTimeout(function() {
      document.getElementById('pb-ai-step').textContent = steps[i].text;
      document.getElementById('pb-ai-prog-fill').style.width = steps[i].pct + '%';
      runStep(i + 1);
    }, steps[i].delay);
  }
  runStep(0);
}

function pbResetUploadModal() {
  _pbSelectedFile = null;
  var dz  = document.getElementById('pb-dropzone');
  var fc  = document.getElementById('pb-file-chosen');
  var ap  = document.getElementById('pb-ai-progress');
  var ft  = document.getElementById('pb-upload-footer');
  var btn = document.getElementById('pb-analyse-btn');
  var fi  = document.getElementById('pb-file-input-pb');
  var ttl = document.getElementById('pb-upload-title');
  if (dz)  dz.style.display='';
  if (fc)  { fc.classList.remove('active'); fc.style.display=''; }
  if (ap)  { ap.classList.remove('active'); }
  if (ft)  ft.style.display='';
  if (btn) { btn.disabled=true; btn.style.opacity='.4'; btn.style.cursor='default'; }
  if (fi)  fi.value='';
  if (ttl) ttl.textContent='Upload Supplier Price Book';
  var pf = document.getElementById('pb-ai-prog-fill');
  var st = document.getElementById('pb-ai-step');
  if (pf) { pf.style.width='0%'; pf.style.background=''; }
  if (st) st.textContent='Reading file\u2026';
}

function pbResetDemoData() {
  MATERIALS_PRICE_BOOK.length = 0;
  MATERIALS_DEMO.forEach(function(m){ MATERIALS_PRICE_BOOK.push(JSON.parse(JSON.stringify(m))); });
  PB_UPLOADED_BOOKS.length = 0;
  renderPriceBook();
  showToast('Demo price book restored.', 'success');
}


/* ══════════════════════════════════════════════════════════════
   CLIENT REGISTER — AI UPLOAD
══════════════════════════════════════════════════════════════ */
function clFileSelected(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  clShowFileChosen(file);
}

function clHandleDrop(event) {
  event.preventDefault();
  document.getElementById('cl-dropzone').classList.remove('drag-active');
  var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (!file) return;
  if (!/\.(xlsx|xls|pdf)$/i.test(file.name)) {
    showToast('Please upload an .xlsx, .xls, or .pdf file.', 'error');
    return;
  }
  clShowFileChosen(file);
}

/* ── Store the selected file for client upload ─────────────── */
var _clSelectedFile = null;

function clShowFileChosen(file) {
  _clSelectedFile = file;
  var ext = (file.name.split('.').pop()||'').toLowerCase();
  document.getElementById('cl-file-icon').innerHTML = ext === 'pdf' ? ICON.file : ICON.chart;
  document.getElementById('cl-file-name').textContent = file.name;
  document.getElementById('cl-file-size').textContent = (file.size/1024).toFixed(1)+' KB';
  document.getElementById('cl-file-chosen').classList.add('active');
  var btn = document.getElementById('cl-analyse-btn');
  btn.disabled = false; btn.style.opacity='1'; btn.style.cursor='pointer';
}

function clStartAnalysis() {
  var file = _clSelectedFile;
  if (!file) { showToast('No file selected.', 'error'); return; }

  document.getElementById('cl-dropzone').style.display='none';
  document.getElementById('cl-file-chosen').style.display='none';
  document.getElementById('cl-upload-footer').style.display='none';
  document.getElementById('cl-upload-title').textContent='Importing Client Records\u2026';
  document.getElementById('cl-ai-progress').classList.add('active');
  document.getElementById('cl-ai-step').textContent = 'Reading file\u2026';
  document.getElementById('cl-ai-prog-fill').style.width = '10%';

  /* ── Demo mode: use hardcoded data ── */
  if (!ContraqAPI.isRealUser()) {
    _clRunDemoImport();
    return;
  }

  /* ── Real AI extraction ── */
  var reader = new FileReader();
  reader.onload = function() {
    var base64 = reader.result.split(',')[1];
    document.getElementById('cl-ai-step').textContent = 'Sending to AI\u2026';
    document.getElementById('cl-ai-prog-fill').style.width = '20%';
    _clCallAI(file, base64);
  };
  reader.onerror = function() {
    showToast('Failed to read file.', 'error');
    clResetUploadModal();
  };
  reader.readAsDataURL(file);
}

function _clCallAI(file, base64) {
  var fname = file.name;
  var mimeType = file.type || 'application/pdf';
  if (!mimeType || mimeType === 'application/octet-stream') {
    var ext = (fname.split('.').pop() || '').toLowerCase();
    if (ext === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === 'xls') mimeType = 'application/vnd.ms-excel';
    else if (ext === 'pdf') mimeType = 'application/pdf';
  }

  fetch(CONTRAQ_API_BASE + '/api/clients/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_base64: base64,
      file_name: fname,
      mime_type: mimeType
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
            if (evt.progress && evt.clients_so_far > lastCount) {
              lastCount = evt.clients_so_far;
              var pct = Math.min(20 + Math.round(lastCount * 4), 90);
              document.getElementById('cl-ai-prog-fill').style.width = pct + '%';
              document.getElementById('cl-ai-step').textContent = 'Extracting clients\u2026 ' + lastCount + ' found';
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
        var msg = resultData && resultData.data && resultData.data.parse_error
          ? 'AI could not parse the document. Try a cleaner PDF or spreadsheet.'
          : (resultData && resultData.data && resultData.data.message) || 'No data extracted. Please try again.';
        throw new Error(msg);
      }
      return { data: resultData.data, elapsed: resultData.elapsed_seconds };
    });
  }).then(function(result) {
    _clApplyAIResult(result.data, result.elapsed);
  }).catch(function(err) {
    console.error('[Client AI]', err);
    document.getElementById('cl-ai-step').textContent = 'Error: ' + err.message;
    document.getElementById('cl-ai-prog-fill').style.width = '100%';
    document.getElementById('cl-ai-prog-fill').style.background = 'var(--red)';
    setTimeout(function() {
      clResetUploadModal();
      showToast('Client import failed: ' + err.message, 'error');
    }, 2000);
  });
}

/* ── Colour palette for client avatars ─────────────────────── */
var _clColors = ['#4ade80','#38bdf8','#fb923c','#c084fc','#f87171','#facc15','#34d399','#60a5fa','#a78bfa','#f97316','#2dd4bf','#e879f9','#fbbf24','#818cf8','#fb7185','#a3e635'];

function _clApplyAIResult(data, elapsed) {
  var clients = data.clients || [];
  if (!clients.length) {
    showToast('AI found no client records in the document.', 'error');
    clResetUploadModal();
    return;
  }

  document.getElementById('cl-ai-step').textContent = 'Finalising\u2026 ' + clients.length + ' clients extracted';
  document.getElementById('cl-ai-prog-fill').style.width = '100%';

  var imported = clients.map(function(c, idx) {
    var name = c.name || 'Unknown';
    var words = name.split(/\s+/);
    var initials = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
    return {
      id: 'cl-ai-' + Date.now() + '-' + idx,
      name: name,
      initials: initials,
      color: _clColors[idx % _clColors.length],
      sector: c.sector || 'Other',
      since: c.since || new Date().getFullYear().toString(),
      contact: c.contact || null,
      phone: c.phone || null,
      email: c.email || null,
      address: c.address || null,
      creditTerms: c.credit_terms || 30,
      retentionPct: c.retention_pct || 0,
      notes: c.notes || ''
    };
  });

  CLIENTS.length = 0;
  imported.forEach(function(c) { CLIENTS.push(c); });

  /* ── API: persist imported clients to database ── */
  if (ContraqAPI.isRealUser()) {
    imported.forEach(function(c) {
      ContraqAPI.saveClient({
        name: c.name,
        contact: c.contact,
        email: c.email,
        phone: c.phone,
        address: c.address,
        category: c.sector,
        pay_terms: c.creditTerms,
        notes: c.notes
      });
    });
  }

  closeModal('modal-cl-upload');
  clResetUploadModal();
  renderClients();

  var elapsedStr = elapsed ? ' in ' + elapsed + 's' : '';
  showToast('Client records imported — ' + imported.length + ' clients extracted by AI' + elapsedStr + '.', 'success');
}

/* ── Demo mode fallback ── */
function _clRunDemoImport() {
  var steps = [
    { text: 'Reading file\u2026', pct: 15, delay: 0 },
    { text: 'Extracting client rows\u2026', pct: 35, delay: 700 },
    { text: 'Identifying contacts & sectors\u2026', pct: 55, delay: 1400 },
    { text: 'Mapping trade history\u2026', pct: 72, delay: 2100 },
    { text: 'Building client profiles\u2026', pct: 88, delay: 2800 },
    { text: 'Finalising import\u2026', pct: 100, delay: 3400 }
  ];

  function runStep(i) {
    if (i >= steps.length) {
      setTimeout(function() {
        var demoClients = [
          { id: 'cl-1', name: 'Balfour Beatty', initials: 'BB', color: '#4ade80', sector: 'Tier-1 Contractor', since: '2019', contact: 'Sarah Webb', phone: '020 7216 6800', email: 's.webb@balfourbeatty.com', address: '130 Wilton Road, London SW1V 1LQ', creditTerms: 30, retentionPct: 5, notes: 'Major framework contractor. Priority account.' },
          { id: 'cl-2', name: 'Aecom Ltd', initials: 'AC', color: '#38bdf8', sector: 'Engineering', since: '2020', contact: 'Andy Clarke', phone: '020 7061 7000', email: 'andy.clarke@aecom.com', address: '22 Hanover Square, London W1S 1JA', creditTerms: 45, retentionPct: 0, notes: 'Global consultancy. Regular design-and-build referrals.' },
          { id: 'cl-3', name: 'Morgan Sindall', initials: 'MS', color: '#fb923c', sector: 'Tier-1 Contractor', since: '2020', contact: 'Phillip Grant', phone: '020 3060 7800', email: 'p.grant@morgansindall.com', address: 'Kent House, 14-17 Market Place, London W1W 8AJ', creditTerms: 30, retentionPct: 3, notes: 'Framework partner \u2014 HS2 enabling works.' },
          { id: 'cl-4', name: 'Mace Group', initials: 'MG', color: '#c084fc', sector: 'Project Management', since: '2021', contact: 'Diane Okafor', phone: '020 3522 3000', email: 'd.okafor@macegroup.com', address: '155 Moorgate, London EC2M 6XB', creditTerms: 45, retentionPct: 5, notes: 'High-value residential & commercial pipeline.' },
          { id: 'cl-5', name: 'Skanska UK', initials: 'SK', color: '#f87171', sector: 'Tier-1 Contractor', since: '2021', contact: 'Lars Eriksson', phone: '020 7121 9400', email: 'l.eriksson@skanska.co.uk', address: '25 Canada Square, Canary Wharf E14 5LB', creditTerms: 30, retentionPct: 5, notes: 'Nordic tier-1. Strong civils + MEP pipeline.' },
          { id: 'cl-6', name: 'Vinci Construction UK', initials: 'VC', color: '#facc15', sector: 'Tier-1 Contractor', since: '2022', contact: 'Marc Dupont', phone: '020 7363 4800', email: 'm.dupont@vinci-construction.co.uk', address: 'Astral House, Imperial Way, Watford WD24 4WW', creditTerms: 60, retentionPct: 5, notes: 'French tier-1 with growing UK residential portfolio.' },
          { id: 'cl-7', name: 'ISG Ltd', initials: 'IS', color: '#34d399', sector: 'Fit-Out Contractor', since: '2022', contact: 'Rachel Drummond', phone: '020 7633 1900', email: 'r.drummond@isgltd.com', address: 'One America Square, London EC3N 2LS', creditTerms: 30, retentionPct: 0, notes: 'Interior & fit-out specialist. Repeat retail client.' },
          { id: 'cl-8', name: 'Kier Group', initials: 'KG', color: '#60a5fa', sector: 'Tier-1 Contractor', since: '2023', contact: 'Tom Hicks', phone: '01767 640111', email: 't.hicks@kier.co.uk', address: 'Tempsford Hall, Sandy SG19 2BD', creditTerms: 45, retentionPct: 5, notes: 'Growing relationship via public-sector frameworks.' },
          { id: 'cl-9', name: 'Multiplex Europe', initials: 'MX', color: '#a78bfa', sector: 'Developer', since: '2023', contact: 'James Obi', phone: '020 7631 5900', email: 'j.obi@multiplex.global', address: '70 St Mary Axe, London EC3A 8BE', creditTerms: 30, retentionPct: 3, notes: 'Australian developer. High-rise residential in City.' },
          { id: 'cl-10', name: 'Laing O\'Rourke', initials: 'LO', color: '#f97316', sector: 'Tier-1 Contractor', since: '2024', contact: 'Aoife Murphy', phone: '01322 296200', email: 'a.murphy@laingorourke.com', address: 'Bridge Place, Dartford DA1 1BU', creditTerms: 60, retentionPct: 5, notes: 'New relationship via Hinkley Point C supply chain.' },
          { id: 'cl-11', name: 'Bowmer & Kirkland', initials: 'BK', color: '#2dd4bf', sector: 'Regional Contractor', since: '2024', contact: 'Steve Kirkland', phone: '01773 604000', email: 's.kirkland@band-k.co.uk', address: 'High Edge Court, Heage, Belper DE56 2BW', creditTerms: 30, retentionPct: 3, notes: 'Strong Midlands and North regional pipeline.' },
          { id: 'cl-12', name: 'Graham Construction', initials: 'GC', color: '#e879f9', sector: 'Regional Contractor', since: '2024', contact: 'Neil Graham', phone: '028 9268 9500', email: 'n.graham@graham.co.uk', address: 'Hillsborough House, Hillsborough BT26 6AH', creditTerms: 30, retentionPct: 3, notes: 'Northern Ireland & Scotland specialist.' }
        ];
        CLIENTS.length = 0;
        demoClients.forEach(function(c) { CLIENTS.push(c); });
        closeModal('modal-cl-upload');
        clResetUploadModal();
        renderClients();
        showToast('Client records imported — ' + demoClients.length + ' clients loaded (demo mode).', 'success');
      }, 400);
      return;
    }
    setTimeout(function() {
      document.getElementById('cl-ai-step').textContent = steps[i].text;
      document.getElementById('cl-ai-prog-fill').style.width = steps[i].pct + '%';
      runStep(i + 1);
    }, steps[i].delay);
  }
  runStep(0);
}

function clResetUploadModal() {
  _clSelectedFile = null;
  var dz  = document.getElementById('cl-dropzone');
  var fc  = document.getElementById('cl-file-chosen');
  var ap  = document.getElementById('cl-ai-progress');
  var ft  = document.getElementById('cl-upload-footer');
  var btn = document.getElementById('cl-analyse-btn');
  var fi  = document.getElementById('cl-file-input');
  var ttl = document.getElementById('cl-upload-title');
  if (dz)  dz.style.display='';
  if (fc)  { fc.classList.remove('active'); fc.style.display=''; }
  if (ap)  ap.classList.remove('active');
  if (ft)  ft.style.display='';
  if (btn) { btn.disabled=true; btn.style.opacity='.4'; btn.style.cursor='default'; }
  if (fi)  fi.value='';
  if (ttl) ttl.textContent='Upload Client Records';
  var pf = document.getElementById('cl-ai-prog-fill');
  var st = document.getElementById('cl-ai-step');
  if (pf) { pf.style.width='0%'; pf.style.background=''; }
  if (st) st.textContent='Reading file\u2026';
}

function clResetDemoData() {
  CLIENTS.length = 0;
  CLIENTS_DEMO.forEach(function(c){ CLIENTS.push(JSON.parse(JSON.stringify(c))); });
  renderClients();
  showToast('Demo client data restored.', 'success');
}


/* ══════════════════════════════════════════════════════════════
   CLIENT REGISTER — REPORT MODAL
══════════════════════════════════════════════════════════════ */
function openClReport(cat) {
  var titles = {
    won:          'Projects Won Report',
    quoted:       'Projects Quoted Report',
    profitability:'Client Profitability Report',
    lost:         'Lost Quotes Report'
  };
  document.getElementById('cl-rpt-title').textContent = titles[cat] || 'Client Report';
  document.getElementById('cl-rpt-body').innerHTML = '<p style="color:var(--off3);padding:.5rem">Loading\u2026</p>';
  openModal('modal-cl-report');

  requestAnimationFrame(function() {
    var html = '';

    if (cat === 'won') {
      /* Projects won — per client breakdown */
      var rows = CLIENTS.map(function(c) {
        var cs = calcClientStats(c.id);
        return {name:c.name, color:c.color, initials:c.initials, count:cs.projs.length, value:cs.totalValue, margin:cs.avgMargin};
      }).filter(function(r){return r.count > 0;}).sort(function(a,b){return b.value-a.value;});

      var totalProjs = rows.reduce(function(s,r){return s+r.count;},0);
      var totalVal   = rows.reduce(function(s,r){return s+r.value;},0);
      var avgMargin  = rows.length ? Math.round(rows.reduce(function(s,r){return s+r.margin;},0)/rows.length*10)/10 : 0;

      html += '<div class="kpi-grid" style="margin-bottom:1rem;">'
        + kpiCard('Active Projects', totalProjs, rows.length+' clients', 'up', {background:'var(--lime)'}, null)
        + kpiCard('Total Value', '\u00a3'+fmtNum(totalVal), 'across all projects', 'up', {background:'var(--blue)'}, null)
        + kpiCard('Avg Margin', avgMargin+'%', 'weighted average', 'up', {background:'var(--orange)'}, null)
        + '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">'
        + '<div style="position:relative;height:220px;width:100%"><canvas id="cl-rpt-bar"></canvas></div>'
        + '<div style="position:relative;height:220px;width:100%"><canvas id="cl-rpt-pie"></canvas></div>'
        + '</div>';

      html += '<div class="card" style="margin-bottom:0"><div style="overflow-x:auto"><table class="tbl"><thead>'
        + '<tr><th>Client</th><th>Projects</th><th>Total Value</th><th>Avg Margin</th></tr>'
        + '</thead><tbody>';
      rows.forEach(function(r) {
        html += '<tr><td><div style="display:flex;align-items:center;gap:.5rem">'
          + '<div class="inline-av" style="background:'+r.color+'">'+r.initials+'</div>'
          + r.name+'</div></td>'
          + '<td class="mono">'+r.count+'</td>'
          + '<td class="mono">\u00a3'+fmtNum(r.value)+'</td>'
          + '<td class="mono">'+(r.margin?r.margin+'%':'—')+'</td></tr>';
      });
      html += '</tbody></table></div></div>';

      document.getElementById('cl-rpt-body').innerHTML = html;
      document.getElementById('cl-rpt-body').dataset.cat = cat;
      document.getElementById('cl-rpt-body').dataset.csv = JSON.stringify(rows);

      setTimeout(function() {
        var barEl = document.getElementById('cl-rpt-bar');
        var pieEl = document.getElementById('cl-rpt-pie');
        if (barEl) { var ex=Chart.getChart(barEl); if(ex)ex.destroy();
          new Chart(barEl, {type:'bar', data:{labels:rows.map(function(r){return r.name;}),
            datasets:[{label:'Project Value',data:rows.map(function(r){return r.value;}),
            backgroundColor:'rgba(163,230,53,.7)',borderColor:'#a3e635',borderWidth:1}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
              scales:{x:{ticks:{color:'#8a9099',font:{size:9}}},y:{ticks:{color:'#8a9099',callback:function(v){return '\u00a3'+fmtNum(v);}}}}}});
        }
        if (pieEl) { var ex2=Chart.getChart(pieEl); if(ex2)ex2.destroy();
          new Chart(pieEl, {type:'doughnut', data:{labels:rows.map(function(r){return r.name;}),
            datasets:[{data:rows.map(function(r){return r.count;}),
            backgroundColor:rows.map(function(r){return r.color;}),borderWidth:0}]},
            options:{responsive:true,maintainAspectRatio:false,cutout:'62%',
              plugins:{legend:{position:'right',labels:{color:'#8a9099',boxWidth:10,font:{size:9}}}}}});
        }
      }, 80);

    } else if (cat === 'quoted') {
      var rows = TENDERS.filter(function(t){return t.status==='open'||t.status==='submitted';});
      var byClient = {};
      rows.forEach(function(t){
        if(!byClient[t.clientName]) byClient[t.clientName]={name:t.clientName,count:0,value:0};
        byClient[t.clientName].count++;
        byClient[t.clientName].value+=t.value;
      });
      var cRows = Object.values(byClient).sort(function(a,b){return b.value-a.value;});
      var totalVal = rows.reduce(function(s,t){return s+t.value;},0);

      html += '<div class="kpi-grid" style="margin-bottom:1rem;">'
        + kpiCard('Open Quotes', rows.length, 'awaiting decision', 'up', {background:'var(--blue)'}, null)
        + kpiCard('Pipeline Value', '\u00a3'+fmtNum(totalVal), 'total live pipeline', 'up', {background:'var(--orange)'}, null)
        + kpiCard('Clients Quoted', cRows.length, 'unique clients', 'up', {background:'var(--lime)'}, null)
        + '</div>';

      html += '<div style="position:relative;height:220px;width:100%;margin-bottom:1rem"><canvas id="cl-rpt-bar"></canvas></div>';

      html += '<div class="card" style="margin-bottom:0"><div style="overflow-x:auto"><table class="tbl"><thead>'
        + '<tr><th>Ref</th><th>Quote Name</th><th>Client</th><th>Value</th><th>Status</th></tr>'
        + '</thead><tbody>';
      rows.forEach(function(t){
        html += '<tr><td class="mono" style="font-size:.68rem">'+t.ref+'</td><td>'+t.name+'</td>'
          + '<td>'+t.clientName+'</td><td class="mono">\u00a3'+fmtNum(t.value)+'</td>'
          + '<td>'+badge(t.status)+'</td></tr>';
      });
      html += '</tbody></table></div></div>';

      document.getElementById('cl-rpt-body').innerHTML = html;
      document.getElementById('cl-rpt-body').dataset.cat = cat;
      document.getElementById('cl-rpt-body').dataset.csv = JSON.stringify(rows.map(function(t){return {ref:t.ref,name:t.name,client:t.clientName,value:t.value,status:t.status};}));

      setTimeout(function() {
        var barEl = document.getElementById('cl-rpt-bar');
        if (barEl) { var ex=Chart.getChart(barEl); if(ex)ex.destroy();
          new Chart(barEl, {type:'bar', data:{labels:cRows.map(function(r){return r.name;}),
            datasets:[{label:'Pipeline Value',data:cRows.map(function(r){return r.value;}),
            backgroundColor:'rgba(96,165,250,.7)',borderColor:'#60a5fa',borderWidth:1},
            {label:'Quote Count',data:cRows.map(function(r){return r.count*50000;}),
            backgroundColor:'rgba(249,115,22,.35)',borderColor:'var(--orange)',borderWidth:1,type:'line',yAxisID:'y2'}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a9099'}}},
              scales:{x:{ticks:{color:'#8a9099',font:{size:9}}},
                      y:{ticks:{color:'#8a9099',callback:function(v){return '\u00a3'+fmtNum(v);}}},
                      y2:{position:'right',ticks:{display:false},grid:{drawOnChartArea:false}}}}});
        }
      }, 80);

    } else if (cat === 'profitability') {
      var rows = CLIENTS.map(function(c){
        var cs = calcClientStats(c.id);
        return {name:c.name,color:c.color,initials:c.initials,margin:cs.avgMargin,value:cs.totalValue,profScore:cs.profScore,projs:cs.projs.length};
      }).filter(function(r){return r.projs>0;}).sort(function(a,b){return b.margin-a.margin;});

      var avg = rows.length ? Math.round(rows.reduce(function(s,r){return s+r.margin;},0)/rows.length*10)/10 : 0;
      var best = rows[0];

      html += '<div class="kpi-grid" style="margin-bottom:1rem;">'
        + kpiCard('Avg Margin', avg+'%', 'across active clients', 'up', {background:'var(--orange)'}, null)
        + kpiCard('Best Client', best?best.name:'—', best?best.margin+'% margin':'', 'up', {background:'var(--lime)'}, null)
        + kpiCard('Clients Rated', rows.length, 'with active projects', 'up', {background:'var(--blue)'}, null)
        + '</div>';

      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">'
        + '<div style="position:relative;height:220px;width:100%"><canvas id="cl-rpt-bar"></canvas></div>'
        + '<div style="position:relative;height:220px;width:100%"><canvas id="cl-rpt-pie"></canvas></div>'
        + '</div>';

      html += '<div class="card" style="margin-bottom:0"><div style="overflow-x:auto"><table class="tbl"><thead>'
        + '<tr><th>Client</th><th>Projects</th><th>Avg Margin</th><th>Profitability Score</th></tr>'
        + '</thead><tbody>';
      rows.forEach(function(r){
        html += '<tr><td><div style="display:flex;align-items:center;gap:.5rem">'
          + '<div class="inline-av" style="background:'+r.color+'">'+r.initials+'</div>'+r.name+'</div></td>'
          + '<td class="mono">'+r.projs+'</td>'
          + '<td class="mono" style="color:'+(r.margin>=20?'var(--lime)':r.margin>=15?'var(--orange)':'var(--red)')+'">'+r.margin+'%</td>'
          + '<td class="mono">'+r.profScore.toFixed(1)+'/10</td></tr>';
      });
      html += '</tbody></table></div></div>';

      document.getElementById('cl-rpt-body').innerHTML = html;
      document.getElementById('cl-rpt-body').dataset.cat = cat;
      document.getElementById('cl-rpt-body').dataset.csv = JSON.stringify(rows.map(function(r){return {client:r.name,projects:r.projs,margin:r.margin,score:r.profScore};}));

      setTimeout(function() {
        var barEl = document.getElementById('cl-rpt-bar');
        var pieEl = document.getElementById('cl-rpt-pie');
        if (barEl) { var ex=Chart.getChart(barEl); if(ex)ex.destroy();
          new Chart(barEl, {type:'bar', data:{labels:rows.map(function(r){return r.name;}),
            datasets:[{label:'Avg Margin %',data:rows.map(function(r){return r.margin;}),
            backgroundColor:rows.map(function(r){return r.margin>=20?'rgba(163,230,53,.7)':r.margin>=15?'rgba(249,115,22,.7)':'rgba(248,113,113,.7)';}),
            borderWidth:0}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
              scales:{x:{ticks:{color:'#8a9099',font:{size:9}}},y:{ticks:{color:'#8a9099',callback:function(v){return v+'%';}}}}}});
        }
        if (pieEl) { var ex2=Chart.getChart(pieEl); if(ex2)ex2.destroy();
          new Chart(pieEl, {type:'doughnut', data:{labels:rows.map(function(r){return r.name;}),
            datasets:[{data:rows.map(function(r){return r.profScore;}),
            backgroundColor:rows.map(function(r){return r.color;}),borderWidth:0}]},
            options:{responsive:true,maintainAspectRatio:false,cutout:'62%',
              plugins:{legend:{position:'right',labels:{color:'#8a9099',boxWidth:10,font:{size:9}}}}}});
        }
      }, 80);

    } else if (cat === 'lost') {
      var rows = TENDERS.filter(function(t){return t.status==='lost';});
      var byClient = {};
      rows.forEach(function(t){
        if(!byClient[t.clientName]) byClient[t.clientName]={name:t.clientName,count:0,value:0};
        byClient[t.clientName].count++;
        byClient[t.clientName].value+=t.value;
      });
      var cRows = Object.values(byClient).sort(function(a,b){return b.value-a.value;});
      var totalLost = rows.reduce(function(s,t){return s+t.value;},0);

      html += '<div class="kpi-grid" style="margin-bottom:1rem;">'
        + kpiCard('Quotes Lost', rows.length, 'to competition', 'dn', {background:'var(--red)'}, null)
        + kpiCard('Value Lost', '\u00a3'+fmtNum(totalLost), 'potential revenue missed', 'dn', {background:'var(--orange)'}, null)
        + kpiCard('Clients Affected', cRows.length, 'unique clients', 'up', {background:'var(--blue)'}, null)
        + '</div>';

      html += '<div style="position:relative;height:220px;width:100%;margin-bottom:1rem"><canvas id="cl-rpt-bar"></canvas></div>';

      html += '<div class="card" style="margin-bottom:0"><div style="overflow-x:auto"><table class="tbl"><thead>'
        + '<tr><th>Ref</th><th>Quote Name</th><th>Client</th><th>Value Lost</th></tr>'
        + '</thead><tbody>';
      rows.forEach(function(t){
        html += '<tr><td class="mono" style="font-size:.68rem">'+t.ref+'</td><td>'+t.name+'</td>'
          + '<td>'+t.clientName+'</td><td class="mono" style="color:var(--red)">\u00a3'+fmtNum(t.value)+'</td></tr>';
      });
      html += '</tbody></table></div></div>';

      document.getElementById('cl-rpt-body').innerHTML = html;
      document.getElementById('cl-rpt-body').dataset.cat = cat;
      document.getElementById('cl-rpt-body').dataset.csv = JSON.stringify(rows.map(function(t){return {ref:t.ref,name:t.name,client:t.clientName,value:t.value};}));

      setTimeout(function() {
        var barEl = document.getElementById('cl-rpt-bar');
        if (barEl) { var ex=Chart.getChart(barEl); if(ex)ex.destroy();
          new Chart(barEl, {type:'bar', data:{labels:cRows.map(function(r){return r.name;}),
            datasets:[{label:'Value Lost',data:cRows.map(function(r){return r.value;}),
            backgroundColor:'rgba(248,113,113,.7)',borderColor:'#f87171',borderWidth:1}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
              scales:{x:{ticks:{color:'#8a9099',font:{size:9}}},y:{ticks:{color:'#8a9099',callback:function(v){return '\u00a3'+fmtNum(v);}}}}}});
        }
      }, 80);
    }
  });
}

function exportClRptCSV() {
  var body = document.getElementById('cl-rpt-body');
  if (!body || !body.dataset.csv) return;
  try {
    var rows = JSON.parse(body.dataset.csv);
    if (!rows.length) return;
    var headers = Object.keys(rows[0]);
    var csv = headers.join(',') + '\n' + rows.map(function(r){ return headers.map(function(h){ var v=r[h]||''; return typeof v==='string'&&v.includes(',') ? '"'+v+'"' : v; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download = 'client_report.csv'; a.click();
  } catch(e) {}
}

/* ── Materials Summary (Projects → PO tab) ── */
