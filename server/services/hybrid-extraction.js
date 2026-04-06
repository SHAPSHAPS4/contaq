/**
 * Hybrid Extraction Pipeline
 *
 * Two-pass architecture inspired by AlphaLab:
 * Pass 1 (Detection): Claude scans the drawing and produces raw counts + measurements
 * Pass 2 (Reconciliation): Claude applies rules, golden examples, and KB to reconcile
 *
 * Claude never guesses in Pass 2 — it only works from Pass 1 detection data.
 */

const { callAI } = require('./ai');
const { preprocessPDF, buildPreprocessorContext } = require('./pdf-preprocessor');
const cvClient = require('./cv-client');

/* ══════════════════════════════════════════════════════════════════
   PASS 1 — RAW DETECTION
   Claude acts as a visual detector. Count everything, measure everything.
   No rule application, no interpretation, no skipping.
   ══════════════════════════════════════════════════════════════════ */

const DETECTION_SYSTEM_PROMPT = `You are a conservative MEP symbol spotter using Claude Sonnet 4.6.
Your ONLY job is to detect and list items you are 90%+ certain of. You are NOT allowed to guess quantities or add implicit items.

STRICT RULES (never break these):
- Only report symbols that are clearly visible and match the legend exactly.
- If a symbol is ambiguous, overlapping, partially obscured, low-contrast, or duplicated across views, place it in unidentified_items[] with a reason.
- Never estimate or "fill in" quantities. Use exact visible counts only.
- Never add items that are not explicitly drawn.
- Scan systematically (left→right, top→bottom) and output raw detection only.
- Do NOT apply any business rules, NRM2 factors, or estimation logic — that happens in Pass 2.
- For ductwork: trace each run segment by segment against the scale. Report length per size. If scale cannot be verified, report "scale unverified" and still provide your best measurement.
- For terminal devices (grilles, diffusers): count each one individually. Trace duct legs to their ends — each leg terminates at a terminal.
- For fittings (bends, tees, VCDs, dampers): count every direction change, branch point, and damper symbol individually.
- Supply and return/extract are SEPARATE systems — count and measure each independently.

Output format: Strict JSON only
{
  "drawing_info": {
    "number": "",
    "scale": "",
    "revision": "",
    "title": "",
    "status": ""
  },
  "scale_validation": {
    "detected_scale": "",
    "reference_dimension": "",
    "consistent": true
  },
  "detected_items": [
    {
      "category": "ductwork|pipework|equipment|terminal|fitting|damper|containment|other",
      "description": "",
      "size": "",
      "quantity": 0,
      "unit": "m|nr|m2",
      "location": "",
      "visual_evidence": "exact quote or description of symbol/callout that confirms this item",
      "confidence": 0.92
    }
  ],
  "unidentified_items": [
    {
      "symbol": "description of what the symbol looks like",
      "reason": "why it cannot be confidently identified",
      "location": ""
    }
  ]
}`;


/* ══════════════════════════════════════════════════════════════════
   PASS 2 — RECONCILIATION
   Claude applies rules, KB, and golden examples to the detection data.
   It NEVER overrides raw counts with guesses.
   ══════════════════════════════════════════════════════════════════ */

const RECONCILIATION_SYSTEM_PROMPT = `You are a strict MEP quantity reconciliation engine.
You NEVER perform raw counting yourself. You are given:
- Raw detection results (counts + measurements from Pass 1)
- Pre-processed PDF data (text layer annotations, equipment tags)
- Full knowledge base rules
- Golden examples from previous reviewed extractions

Your ONLY job: Apply the rules exactly, reconcile the detection data, and output the final extraction.

RULES:
1. USE the detection counts as your baseline. Do not override them with your own guess.
2. CROSS-CHECK detection against PDF text annotations (equipment tags, dimensions).
3. FLAG any detection that contradicts a rule — explain the conflict in notes.
4. ADD implicit items (isolation valves, fire stopping) ONLY if rules require them — mark as "Source: Implicit".
5. If detection is ambiguous or confidence is low, mark as "NOT CONFIRMED — requires review" — do NOT fill gaps.
6. Apply learned rules from the knowledge base — these are corrections from previous extractions.

OUTPUT FORMAT — structured JSON:
{
  "drawing_reference": "",
  "extraction": [
    {
      "item_ref": "sequential number",
      "system": "supply_air|return_air|extract|lthw|chw|electrical|refrigerant|other",
      "description": "",
      "specification": "",
      "size": "",
      "quantity": 0,
      "unit": "m|nr|m2",
      "source": "detected|text_annotation|implicit|rule_derived",
      "confidence": "High|Medium|Low",
      "evidence": "what confirms this quantity",
      "notes": ""
    }
  ],
  "flags": [
    {
      "item": "",
      "issue": "",
      "recommendation": ""
    }
  ],
  "reconciliation_notes": "",
  "items_from_detection": 0,
  "items_added_by_rules": 0,
  "items_flagged": 0
}`;


/**
 * Run the two-pass hybrid extraction.
 * If CV service is available, uses CV detection as baseline for Pass 1.
 */
async function runHybridExtraction({ base64, mimeType, kbPrompt, goldenExamples, preprocessedData, pdfBuffer, model }) {
  const modelId = model || 'claude-sonnet-4-6';

  // ═══ CV SERVICE (if available) ═══
  let cvData = null;
  if (pdfBuffer && cvClient.isAvailable()) {
    try {
      console.log('[Hybrid] Calling CV service for pre-processing + detection...');
      cvData = await cvClient.callCVService(pdfBuffer);
      if (cvData && cvData.preprocessed) {
        // Use CV preprocessed data (has vector geometry — richer than Node pdf-parse)
        preprocessedData = cvData.preprocessed;
        console.log(`[Hybrid] CV pre-processing: ${cvData.preprocessed.page_count} pages, vectors: ${cvData.preprocessed.vector_summary?.total_lines || 0} lines`);
      }
    } catch (e) {
      console.warn('[Hybrid] CV service call failed (non-fatal):', e.message);
    }
  }

  // Build preprocessor context
  const preprocessorContext = preprocessedData ? buildPreprocessorContext(preprocessedData) : '';

  // ═══ PASS 1: MULTI-CROP DETECTION ═══
  // Send the full drawing + each crop to Claude for detection.
  // Crops let Claude focus on smaller areas at higher detail.
  console.log('[Hybrid] Starting Pass 1 — Multi-crop detection...');
  const pass1Start = Date.now();

  let detectionPrompt = 'Scan this M&E drawing and detect every service element. Count and measure everything visible.';
  if (preprocessorContext) {
    detectionPrompt += '\n\n' + preprocessorContext;
  }

  // If CV service provided symbol detection, include as baseline
  if (cvData && cvData.cv_results && cvData.cv_results.cv_available) {
    detectionPrompt += '\n\n## CV SYMBOL DETECTION RESULTS (automated pre-scan)\n';
    detectionPrompt += 'A computer vision model detected the following symbols. Use these counts as your BASELINE — verify against the image, do not override unless clearly wrong:\n';
    detectionPrompt += JSON.stringify(cvData.cv_results.grouped_counts, null, 2);
  }

  // Build document array: full drawing + crops (if available from CV service)
  const documents = [];

  // Use high-res render from CV service if available, otherwise raw PDF
  if (cvData && cvData.rendered_image_b64) {
    documents.push({ base64: cvData.rendered_image_b64, mimeType: 'image/png' });
    console.log(`[Hybrid] Using CV-rendered image (${cvData.rendered_dpi} DPI, ${cvData.image_size_kb}KB)`);
  } else {
    documents.push({ base64, mimeType: mimeType || 'application/pdf' });
  }

  // Add crops as additional images for detailed inspection
  const crops = (cvData && cvData.crops) || [];
  if (crops.length > 0) {
    detectionPrompt += '\n\nYou are given ' + (crops.length + 1) + ' images: the full drawing followed by ' + crops.length + ' zoomed crops (quadrants). ';
    detectionPrompt += 'Scan EACH crop for items you may have missed in the full view. The crops overlap slightly so do not double-count items at crop boundaries.';
    for (const crop of crops) {
      documents.push({ base64: crop.crop_b64, mimeType: 'image/png' });
    }
    console.log(`[Hybrid] Sending ${crops.length} crops (${crops.map(c => c.label).join(', ')})`);
  }

  const detection = await callAI({
    systemPrompt: DETECTION_SYSTEM_PROMPT,
    userPrompt: detectionPrompt,
    documents,
    maxTokens: 4000,
    model: modelId,
  });

  const pass1Duration = Date.now() - pass1Start;
  console.log(`[Hybrid] Pass 1 complete: ${pass1Duration}ms, ${detection.usage?.total_tokens || 0} tokens, ${documents.length} images sent`);

  // ═══ PASS 2: RECONCILIATION ═══
  console.log('[Hybrid] Starting Pass 2 — Reconciliation...');
  const pass2Start = Date.now();

  let reconciliationContext = '## RAW DETECTION RESULTS (from Pass 1 — do not override these counts)\n';
  reconciliationContext += JSON.stringify(detection.data, null, 2);

  if (preprocessorContext) {
    reconciliationContext += '\n\n## PDF PRE-PROCESSED DATA\n' + preprocessorContext;
  }

  if (goldenExamples && goldenExamples.length > 0) {
    reconciliationContext += '\n\n## GOLDEN EXAMPLES (correct extractions from previous reviews)\n';
    reconciliationContext += 'Use these as reference for expected output quality and format:\n';
    goldenExamples.forEach(function(ex, i) {
      reconciliationContext += '\n### Example ' + (i + 1) + ': ' + (ex.document_name || 'Drawing') + ' (Accuracy: ' + (ex.accuracy_pct || '?') + '%)\n';
      if (ex.corrected_items && ex.corrected_items.length > 0) {
        reconciliationContext += 'Correct extraction:\n' + JSON.stringify(ex.corrected_items.slice(0, 5), null, 2) + '\n';
      }
      if (ex.feedback) {
        const corrections = ex.feedback.filter(function(f) { return f.tag !== 'correct'; });
        if (corrections.length > 0) {
          reconciliationContext += 'Corrections made by estimator:\n';
          corrections.forEach(function(c) {
            reconciliationContext += '  - ' + c.tag + ': ' + (c.comment || c.original_value || '') + ' → ' + (c.corrected_value || '') + '\n';
          });
        }
      }
    });
  }

  const kbPrefix = kbPrompt ? kbPrompt + '\n\n' : '';

  const reconciliation = await callAI({
    systemPrompt: kbPrefix + RECONCILIATION_SYSTEM_PROMPT,
    userPrompt: reconciliationContext + '\n\nReconcile the detection results above. Apply all rules and produce the final extraction.',
    documents: [{ base64, mimeType: mimeType || 'application/pdf' }],
    maxTokens: 6000,
    model: modelId,
  });

  const pass2Duration = Date.now() - pass2Start;
  console.log(`[Hybrid] Pass 2 complete: ${pass2Duration}ms, ${reconciliation.usage?.total_tokens || 0} tokens`);

  return {
    detection: detection.data,
    extraction: reconciliation.data,
    raw_output: reconciliation.raw,
    preprocessed: preprocessedData || null,
    usage: {
      pass1: detection.usage,
      pass2: reconciliation.usage,
      total_tokens: (detection.usage?.total_tokens || 0) + (reconciliation.usage?.total_tokens || 0),
    },
    timing: {
      pass1_ms: pass1Duration,
      pass2_ms: pass2Duration,
      total_ms: pass1Duration + pass2Duration,
    },
  };
}

module.exports = { runHybridExtraction, DETECTION_SYSTEM_PROMPT, RECONCILIATION_SYSTEM_PROMPT };
