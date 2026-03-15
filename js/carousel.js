/* ═══ CONTRAQ — CAROUSEL ═══
   CAROUSEL_STATE, initCarousel, goSlide, shiftSlide
   Lines 17486-17518 from contraq-v77
═══════════════════════════════════════════ */

var CAROUSEL_STATE = { current: 0, total: 5 };

function initCarousel() {
  var dots = document.getElementById('carousel-dots');
  if (!dots) return;
  dots.innerHTML = '';
  for (var i=0; i<CAROUSEL_STATE.total; i++) {
    var d = document.createElement('div');
    d.className = 'c-dot' + (i===0?' active':'');
    d.setAttribute('onclick','goSlide('+i+')');
    dots.appendChild(d);
  }
}

function goSlide(idx) {
  var slides = document.querySelectorAll('.carousel-slide');
  var tabs = document.querySelectorAll('.slide-tab');
  var dots = document.querySelectorAll('.c-dot');
  if (!slides.length) return;
  CAROUSEL_STATE.current = idx;
  slides.forEach(function(s,i){ s.classList.toggle('active', i===idx); });
  tabs.forEach(function(t,i){ t.classList.toggle('active', i===idx); });
  dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
}

function shiftSlide(delta) {
  var next = (CAROUSEL_STATE.current + delta + CAROUSEL_STATE.total) % CAROUSEL_STATE.total;
  goSlide(next);
}

/* ══════════════════════════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════════════════════════ */
