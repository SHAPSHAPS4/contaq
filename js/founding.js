/* ═══ CONTRAQ — FOUNDING ═══
   initFoundingMember
   Lines 18552-18632 from contraq-v77
═══════════════════════════════════════════ */

function initFoundingMember() {
  var taken  = Math.max(0, Math.min(FOUNDING_SPOTS_TOTAL, FOUNDING_SPOTS_TAKEN));
  var total  = FOUNDING_SPOTS_TOTAL;
  var left   = total - taken;
  var pct    = Math.round((taken / total) * 100);

  /* Counter numbers */
  var takenEl = document.getElementById('fm-taken-num');
  var leftLbl  = document.getElementById('fm-spots-left-label');
  var ctaLeft  = document.getElementById('fm-remaining-cta');
  if (takenEl)  takenEl.textContent  = taken;
  if (leftLbl)  leftLbl.textContent  = left + ' remaining';
  if (ctaLeft)  ctaLeft.textContent  = left;

  /* Progress bar — animate on scroll into view using IntersectionObserver */
  var fillBar = document.getElementById('fm-fill-bar');
  if (fillBar) {
    fillBar.style.width = '0%';
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setTimeout(function() { fillBar.style.width = pct + '%'; }, 220);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    obs.observe(fillBar);
  }

  /* Badge urgency copy based on spots remaining */
  var badge = document.getElementById('fm-badge-live');
  if (badge) {
    if (left <= 3)       badge.textContent = '🔴 Almost full — ' + left + ' spot' + (left !== 1 ? 's' : '') + ' left';
    else if (left <= 7)  badge.textContent = '🟠 Filling fast — ' + left + ' spots left';
    else                 badge.textContent = 'Live · Spots filling now';
  }

  /* Ticker tape — doubled for seamless loop */
  var ticker = document.getElementById('fm-ticker');
  if (ticker) {
    var items = [
      { text: '3 months free',          accent: true  },
      { text: 'No credit card required', accent: false },
      { text: 'Lifetime launch pricing', accent: true  },
      { text: 'Direct founder access',   accent: false },
      { text: 'Free onboarding call',    accent: true  },
      { text: 'Named on website',        accent: false },
      { text: 'Built for UK insulation & M&E trades', accent: true },
      { text: 'JCT & NEC contract tools',accent: false },
      { text: 'Quote book · Projects · Invoicing', accent: true },
      { text: 'EOT & delay notification AI', accent: false },
    ];
    /* Duplicate for seamless loop */
    var allItems = items.concat(items);
    ticker.innerHTML = allItems.map(function(item) {
      var inner = item.accent
        ? '<span>' + item.text + '</span>'
        : item.text;
      return '<span class="fm-ticker-item">· ' + inner + '</span>';
    }).join('');
  }

  /* Soft counter: if very close to full, show a subtle "n people viewed" nudge */
  if (left <= 5 && left > 0) {
    var ctaWrap = document.querySelector('.fm-cta-wrap');
    if (ctaWrap) {
      var nudge = document.createElement('p');
      nudge.style.cssText = 'font-family:\'IBM Plex Mono\',monospace;font-size:.6rem;color:var(--orange);letter-spacing:.04em;animation:blink 2.4s ease-in-out infinite;';
      nudge.textContent = '⚠ Only ' + left + ' founding spot' + (left !== 1 ? 's' : '') + ' remaining';
      ctaWrap.insertBefore(nudge, ctaWrap.firstChild);
    }
  }
}


/* ══════════════════════════════════════════════════════════════
   CIS — CONSTRUCTION INDUSTRY SCHEME MODULE
   Mitchell Insulation Ltd — demo data: Ryan Walsh & Paul Garrett
══════════════════════════════════════════════════════════════ */

/* ── CIS demo payment records ──────────────────────────────── */
