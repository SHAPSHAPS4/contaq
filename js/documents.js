/* ═══ CONTRAQ — DOCUMENTS ═══
   docStagedFiles, doc upload, doc AI analysis
   Lines 13040-13213 from contraq-v77
═══════════════════════════════════════════ */

var _docStagedFiles = [];

function docGuessType(fn) {
  var n = fn.toLowerCase();
  if (n.indexOf("spec") >= 0) return "Specification";
  if (n.indexOf("draw") >= 0 || n.indexOf("dwg") >= 0) return "Drawing";
  if (n.indexOf("prog") >= 0 || n.indexOf("programme") >= 0) return "Programme";
  if (n.indexOf("email") >= 0 || n.indexOf("enquiry") >= 0) return "Correspondence";
  if (n.indexOf("measure") >= 0 || n.indexOf("survey") >= 0) return "Site Measure";
  if (n.indexOf("coord") >= 0) return "Co-ordination";
  if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "Schedule";
  if (n.endsWith(".docx") || n.endsWith(".doc")) return "Document";
  return "PDF Drawing";
}

function docGuessRevision(fn) {
  var m = fn.match(/[Rr]ev[-_]?([A-Z0-9])/); if (m) return m[1];
  m = fn.match(/-[Rr]([0-9]+)/); if (m) return m[1];
  m = fn.match(/_[Vv]([0-9]+)/); if (m) return "v" + m[1];
  return "1";
}

function docFileExt(fn) {
  var p = fn.split("."); return p.length > 1 ? p[p.length-1].toUpperCase() : "FILE";
}

function docExtColor(ext) {
  if (ext === "PDF") return "#f87171";
  if (ext === "XLSX" || ext === "XLS") return "#a3e635";
  if (ext === "DOCX" || ext === "DOC") return "#60a5fa";
  return "#f97316";
}

function docFmtSize(bytes) {
  if (!bytes) return "";
  if (bytes > 1024*1024) return (bytes/(1024*1024)).toFixed(1) + " MB";
  return Math.round(bytes/1024) + " KB";
}

function openDocUpload(type, id) {
  STATE.docUploadContext = {type: type, id: id};
  _docStagedFiles = [];
  document.getElementById("doc-dropzone").style.display = "";
  document.getElementById("doc-file-list").style.display = "none";
  document.getElementById("doc-file-items").innerHTML = "";
  document.getElementById("doc-ai-progress").style.display = "none";
  document.getElementById("doc-upload-footer").style.display = "";
  document.getElementById("doc-analyse-btn").style.display = "none";
  document.getElementById("doc-upload-title").textContent = "Upload Documents AI Enabled";
  var fi = document.getElementById("doc-file-input"); if (fi) fi.value = "";
  openModal("modal-doc-upload");
}

function docHandleDrop(e) {
  document.getElementById("doc-dropzone").style.borderColor = "rgba(249,115,22,.35)";
  var files = e.dataTransfer ? e.dataTransfer.files : null;
  if (files && files.length) docFilesSelected(files);
}

function docFilesSelected(files) {
  _docStagedFiles = Array.from(files).filter(function(f){ return /\.(pdf|xlsx|docx)$/i.test(f.name); });
  if (!_docStagedFiles.length) { showToast("Please select PDF, XLSX, or DOCX files only.", "error"); return; }
  document.getElementById("doc-file-items").innerHTML = _docStagedFiles.map(function(f) {
    var ext = docFileExt(f.name), c = docExtColor(ext);
    return '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem;">'
      + '<span style="font-family:var(--mono);font-size:.55rem;background:'+c+'22;color:'+c+';border:1px solid '+c+'44;border-radius:3px;padding:.05rem .3rem;">'+ext+'</span>'
      + '<span>'+f.name+'</span>'
      + (f.size ? '<span style="color:var(--off4);margin-left:auto;">'+docFmtSize(f.size)+'</span>' : "")
      + '</div>';
  }).join("");
  document.getElementById("doc-file-list").style.display = "";
  document.getElementById("doc-analyse-btn").style.display = "inline-flex";
}

function docStartAnalysis() {
  if (!_docStagedFiles.length) return;
  document.getElementById("doc-dropzone").style.display = "none";
  document.getElementById("doc-file-list").style.display = "none";
  document.getElementById("doc-upload-footer").style.display = "none";
  document.getElementById("doc-ai-progress").style.display = "";
  document.getElementById("doc-upload-title").textContent = "AI Analysing Documents...";
  var steps = [
    {text:"Reading files...",                pct:15,  delay:0},
    {text:"Detecting document types...",     pct:32,  delay:600},
    {text:"Extracting revision numbers...",  pct:52,  delay:1200},
    {text:"Categorising by discipline...",   pct:70,  delay:1900},
    {text:"Sorting revisions...",            pct:88,  delay:2600},
    {text:"Finalising import...",            pct:100, delay:3200}
  ];
  steps.forEach(function(s) {
    setTimeout(function() {
      document.getElementById("doc-ai-step").textContent = s.text;
      document.getElementById("doc-ai-bar").style.width = s.pct + "%";
    }, s.delay);
  });
  setTimeout(function() { docApplyUpload(); }, 3600);
}

function docApplyUpload() {
  var ctx = STATE.docUploadContext;
  if (!ctx) { closeModal("modal-doc-upload"); return; }
  var today = new Date().toISOString().split("T")[0];
  var newAtts = _docStagedFiles.map(function(f, i) {
    return { id:"att-"+ctx.id+"-"+Date.now()+"-"+i, filename:f.name,
      type:docGuessType(f.name), revision:docGuessRevision(f.name),
      date:today, size:docFmtSize(f.size)||"N/A" };
  });
  if (ctx.type === "project") {
    var proj = PROJECTS.find(function(p){return p.id===ctx.id;});
    if (proj) { if (!proj.attachments) proj.attachments=[]; proj.attachments = newAtts.concat(proj.attachments); }
  } else {
    var tend = TENDERS.find(function(t){return t.id===ctx.id;});
    if (tend) { if (!tend.attachments) tend.attachments=[]; tend.attachments = newAtts.concat(tend.attachments); }
  }
  closeModal("modal-doc-upload");
  showToast("✔ Documents uploaded and organised — " + newAtts.length + " item" + (newAtts.length!==1?"s":"") + " added.", "success");
  if (ctx.type === "project") { renderProjectDetailTab(ctx.id, "attachments"); }
  else { openTenderDetailView(ctx.id); }
}

function renderAttachmentsTab(type, id, attachments) {
  var sorted = (attachments||[]).slice().sort(function(a,b){
    if (b.date > a.date) return 1; if (b.date < a.date) return -1;
    return (b.revision||"").localeCompare(a.revision||"");
  });
  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;">'
    + '<div style="font-family:var(--mono);font-size:.62rem;color:var(--off3);">'+sorted.length+' document'+(sorted.length!==1?"s":"")+' attached</div>'
    + '<button class="btn btn-sm" style="background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.3);font-size:.75rem;" '
    + 'onclick="openDocUpload(\''+type+'\',\''+id+'\')">'
    + '&#128196; Upload Documents AI Enabled</button></div>';
  if (!sorted.length) {
    return h + '<div style="text-align:center;padding:2.5rem 1rem;color:var(--off4);font-size:.82rem;">No documents attached yet.<br><span style="font-size:.72rem;">Click Upload Documents AI Enabled to attach drawings, specs, programmes and more.</span></div>';
  }
  var baseCounts = {};
  sorted.forEach(function(a){
    var base = a.filename.replace(/[-_]?[Rr]ev[-_]?[A-Z0-9]+/i,"").replace(/[-_]?[Rr][0-9]+/i,"").replace(/[-_]?[Vv][0-9]+/i,"");
    if (!baseCounts[base]) baseCounts[base]=[];
    baseCounts[base].push(a.id);
  });
  h += '<div class="card" style="padding:0;"><div style="overflow-x:auto;"><table class="tbl"><thead><tr>'
    + '<th>File</th><th>Type</th><th>Rev</th><th>Date</th><th>Size</th><th>Status</th>'
    + '</tr></thead><tbody>';
  sorted.forEach(function(att){
    var ext = docFileExt(att.filename), c = docExtColor(ext);
    var base = att.filename.replace(/[-_]?[Rr]ev[-_]?[A-Z0-9]+/i,"").replace(/[-_]?[Rr][0-9]+/i,"").replace(/[-_]?[Vv][0-9]+/i,"");
    var isLatest = baseCounts[base] && baseCounts[base][0]===att.id;
    var isSuperseded = baseCounts[base] && baseCounts[base].length>1 && !isLatest;
    h += '<tr style="'+(isSuperseded?"opacity:.55;":"")+'">'
      + '<td style="max-width:260px;"><div style="display:flex;align-items:center;gap:.5rem;">'
      + '<span style="font-family:var(--mono);font-size:.54rem;background:'+c+'22;color:'+c+';border:1px solid '+c+'44;border-radius:3px;padding:.05rem .3rem;flex-shrink:0;">'+ext+'</span>'
      + '<span style="font-size:.74rem;color:var(--white);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+att.filename+'">'+att.filename+'</span>'
      + '</div></td>'
      + '<td style="font-size:.72rem;color:var(--off2);">'+att.type+'</td>'
      + '<td class="mono" style="font-size:.72rem;color:'+(isLatest?"var(--lime)":"var(--off3)")+';font-weight:'+(isLatest?"700":"400")+';">'+  (att.revision||"—")+'</td>'
      + '<td class="mono" style="font-size:.7rem;color:var(--off3);">'+fmtDate(att.date)+'</td>'
      + '<td class="mono" style="font-size:.7rem;color:var(--off4);">'+  (att.size||"—")+'</td>'
      + '<td>';
    if (isLatest && baseCounts[base].length>1) {
      h += '<span style="font-family:var(--mono);font-size:.56rem;background:rgba(163,230,53,.12);color:var(--lime);border:1px solid rgba(163,230,53,.25);border-radius:3px;padding:.08rem .35rem;">Latest</span>';
    } else if (isSuperseded) {
      h += '<span style="font-family:var(--mono);font-size:.56rem;background:rgba(255,255,255,.04);color:var(--off4);border:1px solid var(--border);border-radius:3px;padding:.08rem .35rem;">Superseded</span>';
    } else if (isLatest) {
      h += '<span style="font-family:var(--mono);font-size:.56rem;background:rgba(96,165,250,.1);color:var(--blue);border:1px solid rgba(96,165,250,.2);border-radius:3px;padding:.08rem .35rem;">Current</span>';
    }
    h += '</td></tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

/* ================================================================
   QUOTE FILE UPLOAD — AI ENABLED
================================================================ */

