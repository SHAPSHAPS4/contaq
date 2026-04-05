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

/* ══════════════════════════════════════════════════════════════════
   PASS 1 — RAW DETECTION
   Claude acts as a visual detector. Count everything, measure everything.
   No rule application, no interpretation, no skipping.
   ══════════════════════════════════════════════════════════════════ */

const DETECTION_SYSTEM_PROMPT = `You are a visual detection engine scanning an M&E construction drawing.
Your ONLY job is to detect, count, and measure every visible service element.

INSTRUCTIONS:
1. SCAN the entire drawing systematically: left to right, top to bottom.
2. For every distinct service item you can see, record it.
3. MEASURE linear items against the scale. If scale bar is visible, calibrate first. If stated scale exists, use it.
4. COUNT discrete items exactly — do not approximate.
5. Note the coordinates/location of each item (gridline, room name, or quadrant).

OUTPUT FORMAT — respond with ONLY this JSON structure:
{
  "drawing_info": {
    "drawing_number": "",
    "title": "",
    "scale": "",
    "revision": "",
    "status": ""
  },
  "scale_validation": {
    "method": "scale_bar|stated_scale|reference_dimension|none",
    "reference_used": "",
    "confidence": "high|medium|low"
  },
  "detected_items": [
    {
      "category": "ductwork|pipework|equipment|terminal|fitting|damper|containment|other",
      "description": "",
      "size": "",
      "quantity": 0,
      "unit": "m|nr|m2",
      "measurement_method": "traced_from_drawing|counted_from_drawing|from_text_annotation",
      "location": "",
      "visual_evidence": "what you can see that confirms this item"
    }
  ],
  "unidentified_items": [
    {
      "description": "what the symbol/element looks like",
      "location": "",
      "possible_type": ""
    }
  ]
}

CRITICAL RULES:
- If you can see it, DETECT it. Do not skip any visible service.
- Every ductwork run MUST have a length in metres — trace it segment by segment.
- Every terminal device (grille, diffuser) MUST have an exact count.
- Every fitting (bend, tee, VCD, damper) MUST have an exact count.
- Supply and return/extract are SEPARATE items — count each independently.
- If you cannot measure something, say why in visual_evidence.
- Do NOT apply business rules or make assumptions — just detect what you see.`;


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
 */
async function runHybridExtraction({ base64, mimeType, kbPrompt, goldenExamples, preprocessedData, model }) {
  const modelId = model || 'claude-sonnet-4-6';

  // Build preprocessor context
  const preprocessorContext = preprocessedData ? buildPreprocessorContext(preprocessedData) : '';

  // ═══ PASS 1: DETECTION ═══
  console.log('[Hybrid] Starting Pass 1 — Detection...');
  const pass1Start = Date.now();

  let detectionPrompt = 'Scan this M&E drawing and detect every service element. Count and measure everything visible.';
  if (preprocessorContext) {
    detectionPrompt += '\n\n' + preprocessorContext;
  }

  const detection = await callAI({
    systemPrompt: DETECTION_SYSTEM_PROMPT,
    userPrompt: detectionPrompt,
    documents: [{ base64, mimeType: mimeType || 'application/pdf' }],
    maxTokens: 4000,
    model: modelId,
  });

  const pass1Duration = Date.now() - pass1Start;
  console.log(`[Hybrid] Pass 1 complete: ${pass1Duration}ms, ${detection.usage?.total_tokens || 0} tokens`);

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
