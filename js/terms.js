/* ═══ CONTRAQ — TERMS ═══
   showTermsOfService
   Lines 11063-11082 from contraq-v77
═══════════════════════════════════════════ */

function showTermsOfService() {
  var tosOverlay = document.createElement('div');
  tosOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99999;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:2rem;';
  tosOverlay.onclick = function(e) { if (e.target === tosOverlay) tosOverlay.remove(); };
  tosOverlay.innerHTML = '<div style="background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;padding:2rem;width:620px;max-width:95vw;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5);">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem">'
    + '<div><div style="font-family:var(--mono);font-size:.55rem;text-transform:uppercase;letter-spacing:.1em;color:var(--orange)">CONTRAQ</div>'
    + '<h2 style="font-family:var(--serif);font-size:1.15rem;color:var(--white);margin:.2rem 0 0">Terms of Service</h2>'
    + '<div style="font-family:var(--mono);font-size:.55rem;color:var(--off4)">Last updated: March 2026</div></div>'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:none;border:none;color:var(--off4);font-size:1.2rem;cursor:pointer;padding:.25rem">&times;</button></div>'
    + '<div style="font-size:.78rem;color:var(--off2);line-height:1.7">'

    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">1. AI-Generated Outputs</h3>'
    + '<p>The CONTRAQ AI Quote Builder produces estimated quantities, dimensions, specifications, and costs based on automated analysis of uploaded drawings, specifications, and reference data. These outputs are provided as <strong style="color:var(--white)">decision-support tools</strong> and are not a substitute for professional quantity surveying, engineering review, or specification compliance checking.</p>'

    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">2. Reference Data Disclaimer</h3>'
    + '<p>The platform references industry standards and guidance including but not limited to: BSRIA BG 85/2024 and BG 87/2024 (mechanical building services defaults), BS 5422 (thermal insulation), CIBSE drawing symbol conventions, NBS specification conventions, NRM2 measurement rules (RICS), and Wendes estimating methodology. These references indicate the <strong style="color:var(--white)">reference data used by the AI</strong> \u2014 they do not constitute certification of compliance with any standard. Actual project specifications may differ materially from the defaults and rules of thumb applied by the AI.</p>'

    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">3. User Responsibility</h3>'
    + '<p>You acknowledge that all AI-generated outputs must be <strong style="color:var(--white)">independently verified</strong> before use in commercial tenders, contractual pricing, procurement decisions, or any other commercial purpose. You accept sole responsibility for any commercial decisions made using outputs from the platform. The platform provides confidence indicators (HIGH / MEDIUM / LOW), assumption audit trails, and review gates to assist your verification process \u2014 these tools do not replace professional judgement.</p>'
