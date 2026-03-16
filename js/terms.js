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
    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">4. Limitation of Liability</h3>'
    + '<p>Our total liability for any claim arising from AI-generated outputs shall not exceed the fees paid by you in the <strong style="color:var(--white)">twelve (12) months</strong> preceding the claim. We shall not be liable for any indirect, consequential, incidental, or economic loss arising from reliance on AI-generated quantities, measurements, cost estimates, or specification interpretations, including but not limited to: losses from underpriced or overpriced tenders, rework costs, project delays, back-charges from main contractors, or professional negligence claims.</p>'

    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">5. No Professional Advice</h3>'
    + '<p>Nothing in this platform constitutes professional engineering, quantity surveying, or construction consultancy advice. The platform is a software tool, not a professional service. References to British Standards, BSRIA guidance, CIBSE conventions, and NRM2 measurement rules are provided as contextual information to support your own professional assessment.</p>'

    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">6. Knowledge Base &amp; Audit Trail</h3>'
    + '<p>Each AI-generated quote is tagged with the knowledge base version used at the time of generation. The platform maintains assumption audit trails showing which reference data, defaults, and rules of thumb were applied to each line item. These records are provided for your internal quality assurance purposes and do not constitute a warranty of accuracy.</p>'

    + '<h3 style="font-family:var(--sans);font-size:.85rem;color:var(--orange);margin:1rem 0 .4rem">7. Scope of AI Capabilities</h3>'
    + '<p>The AI Quote Builder analyses M&amp;E drawings and specifications across all trades involved in mechanical and electrical fit-out, including but not limited to: pipework, ductwork, insulation, electrical containment, fire stopping, ventilation, heating, cooling, plumbing, renewable energy systems, and trace heating. The accuracy of AI outputs varies by drawing quality, annotation clarity, specification completeness, and project complexity. The confidence scoring system reflects this variability.</p>'

    + '<div style="margin-top:1.25rem;padding:.75rem;background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.15);border-radius:6px;font-family:var(--mono);font-size:.6rem;color:var(--off3);line-height:1.65">'
    + '<strong style="color:var(--orange)">Important:</strong> These terms should be reviewed by a qualified solicitor specialising in construction technology before commercial deployment. The clauses above represent the minimum required liability protection for an AI-powered estimation tool used in commercial M&amp;E tendering.'
    + '</div>'

    + '</div></div>';
  document.body.appendChild(tosOverlay);
}
