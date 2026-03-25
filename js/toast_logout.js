/* ═══ CONTRAQ — TOAST_LOGOUT ═══
   showToast, doLogout
   Lines 18071-18090 from contraq-v77
═══════════════════════════════════════════ */

function showToast(msg, type) {
  type = type||'default';
  var icons = {success:'✓',error:'✕',warn:'⚠',default:'ℹ'};
  var container = document.getElementById('toasts');
  var toast = document.createElement('div');
  toast.className='toast '+(type==='default'?'':type);
  toast.innerHTML='<span>'+icons[type]+'</span><span>'+msg+'</span>';
  container.appendChild(toast);
  setTimeout(function(){if(toast.parentNode)toast.parentNode.removeChild(toast);},3200);
}

/* ══════════════════════════════════════════════════════════════
   LOGOUT / RESET
══════════════════════════════════════════════════════════════ */
function doLogout() {
  STATE.loggedIn = false;
  STATE.user = null;
  STATE.demoMode = true;
  if (typeof clearSession === 'function') clearSession();
  if (typeof restoreDemoData === 'function') restoreDemoData();
  window.location.href = 'landing.html';
}

