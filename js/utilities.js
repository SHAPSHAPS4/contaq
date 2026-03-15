/* ═══ CONTRAQ — UTILITIES ═══
   openModal, closeModal, showModalErr, badge, fmtNum, fmtDate, getGreeting, filterTableRows
   Lines 17519-17566 from contraq-v77
═══════════════════════════════════════════ */

function openModal(id) {
  var m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  var m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
function showModalErr(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent=msg; el.style.display='block'; }
}

/* ══════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════ */
function badge(status) {
  return '<span class="badge badge-'+status+'">'+status+'</span>';
}

function fmtNum(n) {
  if (!n&&n!==0) return '0';
  return Math.round(n).toLocaleString('en-GB');
}

function fmtDate(iso) {
  if (!iso) return '—';
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var parts=iso.split('-');
  if (parts.length!==3) return iso;
  return parseInt(parts[2])+' '+months[parseInt(parts[1])-1]+' '+parts[0];
}

function getGreeting() {
  var h = new Date().getHours();
  if (h<12) return 'Good morning'; if (h<17) return 'Good afternoon'; return 'Good evening';
}

function filterTableRows(q) {
  q = (q||'').toLowerCase();
  document.querySelectorAll('#dash-content .tbl tbody tr').forEach(function(tr){
    tr.style.display = tr.textContent.toLowerCase().includes(q)?'':'none';
  });
}

/* ══════════════════════════════════════════════════════════════
   GLOBAL SEARCH (v7)
══════════════════════════════════════════════════════════════ */
