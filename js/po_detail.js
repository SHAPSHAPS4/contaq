/* ═══ CONTRAQ — PO_DETAIL ═══
   renderPODetail
   Lines 12412-12500 from contraq-v77
═══════════════════════════════════════════ */

          lbl='<span style="color:#a3e635;font-size:.7rem;font-weight:600;">Delivered</span>';
        } else if (po.status==='partial') {
          dot='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f97316;flex-shrink:0;"></span>';
          lbl='<span style="color:#f97316;font-size:.7rem;font-weight:600;">Partial</span>';
        } else {
          dot='<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f87171;flex-shrink:0;"></span>';
          lbl='<span style="color:#f87171;font-size:.7rem;font-weight:600;">Outstanding</span>';
        }
        return '<tr style="cursor:pointer" onclick="renderPODetail(\''+po.id+'\',\''+projectId+'\')" onmouseenter="this.style.background=\'rgba(255,255,255,.04)\'" onmouseleave="this.style.background=\'\'">'
          +'<td style="padding:.5rem .4rem;text-align:center;">'+dot+'</td>'
          +'<td class="mono" style="font-size:.68rem;">'+po.id+'</td>'
          +'<td style="font-weight:600;">'+po.supplier+'</td>'
          +'<td class="mono">'+fmtDate(po.date)+'</td>'
          +'<td class="mono">&#163;'+fmtNum(gross)+'</td>'
          +'<td><div style="display:flex;align-items:center;gap:.35rem;">'+dot+lbl+'</div></td>'
          +'<td class="mono" style="font-size:.72rem;">'+(outItems.length
            ?'<span style="color:var(--orange);">&#9888; '+outQty+' items</span>'
            :'<span style="color:var(--lime);">&#10003; None</span>')
          +'</td>'
          +'<td class="mono" style="font-size:.7rem;color:var(--off3);">'+(po.deliveredLaterDate?fmtDate(po.deliveredLaterDate):'&#8212;')+'</td>'
          +'<td><button class="btn btn-dark btn-xs" onclick="event.stopPropagation();renderPODetail(\''+po.id+'\',\''+projectId+'\')">View</button></td>'
          +'</tr>';
      }).join('');
      html += '</tbody></table></div></div>';
    }
  }

  if (tab==='p&l') {
    var costs = p.costs || {labour:0,materials:0,subcontract:0,overhead:0};
    var tc = costs.labour+costs.materials+costs.subcontract+costs.overhead;
    var gpVal = p.value - tc;
    var gpPct = p.value ? Math.round(gpVal/p.value*100) : 0;
    var billedPct = p.value ? Math.round(billed/p.value*100) : 0;
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem;margin-bottom:1rem">';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val">£'+fmtNum(p.value)+'</div><div class="cl-detail-stat-label">Contract value</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--red)">£'+fmtNum(tc)+'</div><div class="cl-detail-stat-label">Est. cost</div></div>';
    html += '<div class="cl-detail-stat"><div class="cl-detail-stat-val" style="color:var(--lime)">£'+fmtNum(gpVal)+' ('+gpPct+'%)</div><div class="cl-detail-stat-label">Gross profit</div></div>';
    html += '</div>';
    html += '<div class="cl-detail-section-title">Cost breakdown</div>';
    var costItems = [['Labour',costs.labour,'var(--orange)'],['Materials',costs.materials,'var(--blue)'],['Subcontract',costs.subcontract,'var(--yellow)'],['Overhead',costs.overhead,'var(--off3)']];
    costItems.forEach(function(ci){
      var pct = p.value ? Math.round(ci[1]/p.value*100) : 0;
      html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.55rem"><span style="font-size:.75rem;color:var(--off2);width:90px">'+ci[0]+'</span><div style="flex:1;height:7px;background:var(--bg4);border-radius:4px"><div style="width:'+pct+'%;height:100%;background:'+ci[2]+';border-radius:4px;opacity:.8"></div></div><span style="font-family:var(--mono);font-size:.72rem;color:var(--white);white-space:nowrap">£'+fmtNum(ci[1])+'</span></div>';
    });
    html += '<div class="cl-detail-section-title">Billing status</div>';
    html += '<div style="font-size:.78rem;color:var(--off3);margin-bottom:.5rem">'+billedPct+'% billed · £'+fmtNum(billed)+' of £'+fmtNum(p.value)+' contract value</div>';
    html += '<div style="height:8px;background:var(--bg4);border-radius:4px;margin-bottom:.75rem"><div style="width:'+billedPct+'%;height:100%;background:var(--lime);border-radius:4px;transition:width .4s"></div></div>';
  }

  if (tab === 'attachments') {
    html += renderFoldersUI('project', p.id, p.folders||{}, p.quoteFiles||[]);
  }

  if (tab === 'journal') {
    html += renderJournalTab(p.id, p.journal || []);
  }

  document.getElementById('proj-detail-body').innerHTML = html;
}


/* ══════════════════════════════════════════════════════════════
   CLIENT REGISTER (v6)
══════════════════════════════════════════════════════════════ */
function calcClientStats(clientId) {
  var projs = PROJECTS.filter(function(p){return p.client===clientId;});
  var invs  = INVOICES.filter(function(i){return i.client===clientId;});
  var tndrs = TENDERS.filter(function(t){return t.client===clientId;});
  var totalValue  = projs.reduce(function(s,p){return s+p.value;},0);
  var totalBilled = invs.reduce(function(s,i){return s+i.amount;},0);
  var paidAmt     = invs.filter(function(i){return i.status==='paid';}).reduce(function(s,i){return s+i.amount;},0);
  var overdueAmt  = invs.filter(function(i){return i.status==='overdue';}).reduce(function(s,i){return s+i.amount;},0);
  var avgMargin   = projs.length ? Math.round(projs.reduce(function(s,p){return s+(p.margin||0);},0)/projs.length*10)/10 : 0;
  var avgJobVal   = projs.length ? Math.round(totalValue/projs.length) : 0;
  var wonTenders  = tndrs.filter(function(t){return t.status==='won';});
  var decidedTend = tndrs.filter(function(t){return t.status==='won'||t.status==='lost';});
  var winRate     = decidedTend.length ? Math.round(wonTenders.length/decidedTend.length*100) : null;
  // Profitability score (1–10): weighted by margin, payment reliability, volume
  var marginScore = Math.min(10, Math.max(1, Math.round(avgMargin/3)));
  var cl = CLIENTS.find(function(c){return c.id===clientId;});
  var termsScore  = cl ? Math.max(1, 10 - Math.round(cl.creditTerms/10)) : 5;
  var volScore    = Math.min(10, Math.round(totalValue/100000));
  var overdueScore= overdueAmt > 0 ? Math.max(1, 7 - Math.round(overdueAmt/10000)) : 10;
  var profScore   = Math.round((marginScore*0.4 + termsScore*0.2 + volScore*0.2 + overdueScore*0.2)*10)/10;
  return {projs:projs, invs:invs, tndrs:tndrs, totalValue:totalValue, totalBilled:totalBilled, paidAmt:paidAmt, overdueAmt:overdueAmt, avgMargin:avgMargin, avgJobVal:avgJobVal, winRate:winRate, profScore:Math.min(10,Math.max(1,profScore))};
}

function renderClients() {
  var html = '<div class="page-hdr"><div class="page-hdr-left"><h2>Client Register</h2><p>'+CLIENTS.length+' clients</p></div>'
