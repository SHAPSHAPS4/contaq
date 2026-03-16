/* ═══ CONTRAQ — SUPPLIERS ═══
   renderSuppliers, openSupplierModal, supplier report
   Lines 17186-17485 from contraq-v77
═══════════════════════════════════════════ */



/* ══════════════════════════════════════════════════════════════
   MODALS — PURCHASE ORDER (v6)
══════════════════════════════════════════════════════════════ */
function updatePORef() {
  var catCode = document.getElementById('po-cat').value;
  var counters = STATE.poCounters || {};
  var next = (counters[catCode]||0) + 1;
  var ref = 'PO-'+catCode+'-'+String(next).padStart(3,'0');
  var preview = document.getElementById('po-ref-preview');
  if (preview) preview.textContent = ref;
  // If editing existing PO, show existing ref
  if (STATE.editPOId) {
    var po = PO_REGISTER.find(function(p){return p.id===STATE.editPOId;});
    if (po && preview) preview.textContent = po.id;
  }
}

function updatePOTotal() {
  var qty  = parseFloat(document.getElementById('po-qty').value)||0;
  var cost = parseFloat(document.getElementById('po-cost').value)||0;
  var total = qty * cost;
  var el = document.getElementById('po-total-preview');
  if (el) { el.textContent = 'Total: £'+fmtNum(Math.round(total*100)/100); el.style.display = (total>0)?'':'none'; }
}

function openPOModal(id) {
  STATE.editPOId = id||null;
  var isNew = !id;
  document.getElementById('po-modal-title').textContent = isNew ? 'Create Purchase Order' : 'Edit Purchase Order';
  var delBtn = document.getElementById('po-del-btn');
  if (delBtn) delBtn.style.display = isNew ? 'none' : '';
  document.getElementById('po-err').style.display='none';

  // Populate dropdowns
  var projSel = document.getElementById('po-project');
  projSel.innerHTML = '<option value="">Select project…</option>'+PROJECTS.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join('');
  var supSel = document.getElementById('po-supplier-sel');
  supSel.innerHTML = '<option value="">Select supplier…</option>'+SUPPLIERS.map(function(s){return '<option value="'+s.id+'">'+s.name+'</option>';}).join('');

  if (!isNew) {
    var po = PO_REGISTER.find(function(p){return p.id===id;});
    if (po) {
      document.getElementById('po-cat').value    = po.catCode||'INS';
      document.getElementById('po-project').value= po.project||'';
      supSel.value = po.supplierId||'';
      document.getElementById('po-supplier').value= po.supplierId ? '' : (po.supplier||'');
      document.getElementById('po-desc').value   = po.desc||'';
      document.getElementById('po-qty').value    = po.qty||'';
      document.getElementById('po-cost').value   = po.unitCost||'';
      document.getElementById('po-date').value   = po.date||'';
      document.getElementById('po-del').value    = po.expected||'';
      document.getElementById('po-notes').value  = po.notes||'';
      var preview = document.getElementById('po-ref-preview');
      if (preview) preview.textContent = po.id;
      updatePOTotal();
    }
  } else {
    document.getElementById('po-cat').value='INS';
    document.getElementById('po-project').value='';
    supSel.value='';
    document.getElementById('po-supplier').value='';
    document.getElementById('po-desc').value='';
    document.getElementById('po-qty').value='';
    document.getElementById('po-cost').value='';
    var today = new Date().toISOString().split('T')[0];
    var del = new Date(); del.setDate(del.getDate()+7);
    document.getElementById('po-date').value=today;
    document.getElementById('po-del').value=del.toISOString().split('T')[0];
    document.getElementById('po-notes').value='';
    var totalEl = document.getElementById('po-total-preview');
    if (totalEl) totalEl.style.display='none';
    updatePORef();
  }
  openModal('modal-po');
}

function savePO() {
  var catCode  = document.getElementById('po-cat').value;
  var qty      = parseFloat(document.getElementById('po-qty').value);
  var cost     = parseFloat(document.getElementById('po-cost').value);
  var desc     = document.getElementById('po-desc').value.trim();
  if (!desc)  { showModalErr('po-err','Please enter a description.'); return; }
  if (!qty||isNaN(qty)||!cost||isNaN(cost)) { showModalErr('po-err','Please enter valid quantity and unit cost.'); return; }

  var projId   = document.getElementById('po-project').value;
  var proj     = PROJECTS.find(function(p){return p.id===projId;});
  var supSelId = document.getElementById('po-supplier-sel').value;
  var supObj   = SUPPLIERS.find(function(s){return s.id===supSelId;});
  var supName  = supObj ? supObj.name : document.getElementById('po-supplier').value.trim();
  if (!supName) { showModalErr('po-err','Please select or enter a supplier.'); return; }

  var isEdit = !!STATE.editPOId;
  var poId;
  if (isEdit) {
    poId = STATE.editPOId;
  } else {
    // Generate and increment counter
    if (!STATE.poCounters) STATE.poCounters = {};
    var next = (STATE.poCounters[catCode]||0) + 1;
    STATE.poCounters[catCode] = next;
    poId = 'PO-'+catCode+'-'+String(next).padStart(3,'0');
  }

  var po = {
    id: poId, catCode: catCode, category: (PO_CAT_MAP[catCode]||{}).label||catCode,
    project: projId, projectName: proj?proj.name:'',
    supplier: supName, supplierId: supSelId||null,
    desc: desc, qty: Math.round(qty), unitCost: cost, totalValue: Math.round(qty*cost*100)/100,
    status: isEdit ? (PO_REGISTER.find(function(p){return p.id===STATE.editPOId;})||{}).status||'pending' : 'pending',
    date: document.getElementById('po-date').value,
    expected: document.getElementById('po-del').value,
    notes: document.getElementById('po-notes').value,
  };

  if (isEdit) {
    var idx = PO_REGISTER.findIndex(function(p){return p.id===STATE.editPOId;});
    if (idx>=0) PO_REGISTER[idx] = po;
    showToast('PO updated.','success');
    closeModal('modal-po');
    dashNav('procurement');
  } else {
    PO_REGISTER.push(po);
    closeModal('modal-po');
    dashNav('procurement');
    // Show PO created confirmation + email prompt
    setTimeout(function(){ openPOCreatedModal(poId); }, 180);
  }
}

function deletePO() {
  if (!STATE.editPOId) return;
  if (!confirm('Delete PO '+STATE.editPOId+'?')) return;
  var idx = PO_REGISTER.findIndex(function(p){return p.id===STATE.editPOId;});
  if (idx>=0) PO_REGISTER.splice(idx,1);
  showToast('PO deleted.','success');
  closeModal('modal-po');
  dashNav('procurement');
}



/* ══════════════════════════════════════════════════════════════
   MODALS — TENDER / QUOTE (v6)
══════════════════════════════════════════════════════════════ */
function updateTenderWonBanner() {
  var status = document.getElementById('tnd-status').value;
  var banner = document.getElementById('tender-won-banner');
  if (!banner) return;
  // Show banner only for won + existing tender that has no linked project yet
  var t = STATE.editTenderId ? TENDERS.find(function(x){return x.id===STATE.editTenderId;}) : null;
  var alreadyLinked = t && t.linkedProjectId;
  banner.style.display = (status==='won' && !alreadyLinked) ? '' : 'none';
}

function openTenderModal(id) {
  STATE.editTenderId = id;
  var isNew = !id;
  document.getElementById('tender-modal-title').textContent = isNew ? 'Add Quote' : 'Edit Quote';
  document.getElementById('tender-del-btn').style.display = isNew ? 'none' : '';
  document.getElementById('tender-err').style.display='none';
  var clSel = document.getElementById('tnd-client');
  clSel.innerHTML = '<option value="">Select client…</option>'+CLIENTS.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('');
  if (!isNew) {
    var t = TENDERS.find(function(x){return x.id===id;});
    if (t) {
      document.getElementById('tnd-name').value    = t.name||'';
      clSel.value                                   = t.client||'';
      document.getElementById('tnd-value').value   = t.value||'';
      document.getElementById('tnd-margin').value  = t.margin||20;
      document.getElementById('tnd-status').value  = t.status||'open';
      document.getElementById('tnd-decision').value= t.decision||'';
      document.getElementById('tnd-enquiry').value = t.enquiry||'';
      document.getElementById('tnd-submit').value  = t.submitted||'';
      document.getElementById('tnd-notes').value   = t.notes||'';
    }
  } else {
    ['tnd-name','tnd-notes','tnd-value','tnd-decision','tnd-submit'].forEach(function(fid){document.getElementById(fid).value='';});
    document.getElementById('tnd-margin').value  = 20;
    document.getElementById('tnd-status').value  = 'open';
    document.getElementById('tnd-enquiry').value = new Date().toISOString().split('T')[0];
  }
  updateTenderWonBanner();
  openModal('modal-tender');
}

function saveTender() {
  var name   = document.getElementById('tnd-name').value.trim();
  var val    = parseFloat(document.getElementById('tnd-value').value);
  var status = document.getElementById('tnd-status').value;
  if (!name) { showModalErr('tender-err','Quote name is required.'); return; }
  if (!val||isNaN(val)) { showModalErr('tender-err','Please enter a valid value.'); return; }
  var clientId = document.getElementById('tnd-client').value;
  var client   = CLIENTS.find(function(c){return c.id===clientId;});
  var data = {
    name:name, client:clientId, clientName:client?client.name:'',
    value:val, margin:parseInt(document.getElementById('tnd-margin').value)||20,
    status:status,
    enquiry:document.getElementById('tnd-enquiry').value,
    submitted:document.getElementById('tnd-submit').value,
    decision:document.getElementById('tnd-decision').value,
    notes:document.getElementById('tnd-notes').value,
  };
  if (STATE.editTenderId) {
    var idx = TENDERS.findIndex(function(t){return t.id===STATE.editTenderId;});
    if (idx>=0) {
      data.id=STATE.editTenderId; data.ref=TENDERS[idx].ref;
      data.linkedProjectId = TENDERS[idx].linkedProjectId||null;
      Object.assign(TENDERS[idx],data);
    }
    showToast('Quote updated.','success');
  } else {
    data.id='tq-'+Date.now();
    data.ref='QTE-2026-'+String(TENDERS.length+1).padStart(3,'0');
    TENDERS.push(data);
    showToast('Quote added.','success');
  }
  closeModal('modal-tender');
  dashNav('tenders');
}

function deleteTender() {
  if (!STATE.editTenderId) return;
  var t = TENDERS.find(function(x){return x.id===STATE.editTenderId;});
  if (!t||!confirm('Delete "'+t.name+'"?')) return;
  TENDERS.splice(TENDERS.findIndex(function(x){return x.id===STATE.editTenderId;}),1);
  showToast('Quote deleted.','success');
  closeModal('modal-tender');
  dashNav('tenders');
}

function wonTenderToProject() {
  var tenderId = STATE.editTenderId;
  if (!tenderId) return;
  closeModal('modal-tender');
  quickWonToProject(tenderId);
}

function quickWonToProject(tenderId) {
  var t = TENDERS.find(function(x){return x.id===tenderId;});
  if (!t) return;
  if (t.linkedProjectId) {
    var existing = PROJECTS.find(function(p){return p.id===t.linkedProjectId;});
    showToast('Already linked to '+(existing?existing.code:t.linkedProjectId)+'.','default');
    dashNav('projects');
    return;
  }
  var nextCode = 'PRJ-'+String(Math.max.apply(null,PROJECTS.map(function(p){return parseInt(p.code.split('-')[1])||0;}))+1).padStart(3,'0');
  var today = new Date().toISOString().split('T')[0];
  var endDate = new Date(); endDate.setMonth(endDate.getMonth()+6);
  var newProj = {
    id:'p-'+Date.now(), code:nextCode, name:t.name, client:t.client, clientName:t.clientName,
    value:t.value, margin:t.margin||20, status:'pending',
    start:today, end:endDate.toISOString().split('T')[0],
    notes:'Created from quote '+t.ref,
    costs:{labour:Math.round(t.value*0.35),materials:Math.round(t.value*0.28),subcontract:Math.round(t.value*0.18),overhead:Math.round(t.value*0.05)},
    billedToDate:0, lastInvoiceDate:'', tenderRef:t.ref,
    attachments: (t.attachments||[]).map(function(a){return Object.assign({},a,{id:a.id+'-xfer',transferredFrom:t.ref});}),
    quoteFiles: (t.quoteFiles||[]).map(function(f){return Object.assign({},f,{id:f.id+'-xfer',transferredFrom:t.ref});}),
    folders: (function(){
      var tf = t.folders||{};
      function xferArr(arr){ return (arr||[]).map(function(f){return Object.assign({},f,{id:f.id+'-xfer',transferredFrom:t.ref});}); }
      return {drawings:xferArr(tf.drawings),specs:xferArr(tf.specs),documents:xferArr(tf.documents),purchaseOrder:[],voQuote:[]};
    })(),
  };
  PROJECTS.push(newProj);
  var idx = TENDERS.findIndex(function(x){return x.id===tenderId;});
  if (idx>=0) TENDERS[idx].linkedProjectId = newProj.id;
  // Add to activity log
  ACTIVITY_LOG.unshift({id:'al-'+Date.now(),icon:'🏗️',iconBg:'rgba(249,115,22,.15)',text:'Project '+nextCode+' created from quote '+t.ref,time:'Just now',panel:'projects'});
  showToast('✓ Project '+nextCode+' created — navigating to Projects tab.','success');
  // Navigate to Projects tab and open detail
  dashNav('projects');
  setTimeout(function(){ openProjectDetail(newProj.id); }, 120);
}



/* ══════════════════════════════════════════════════════════════
   CAROUSEL
══════════════════════════════════════════════════════════════ */
