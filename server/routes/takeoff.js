/**
 * Takeoff Consolidator Routes
 * POST /api/takeoff/consolidate — Stage 3 of the estimation pipeline
 */

const express = require('express');
const router = express.Router();
const { callAI } = require('../services/ai');
const kb = require('../kb/index');

const TASK_PROMPT = `## YOUR TASK

You will be provided with:
- A structured drawing extraction (JSON from the Drawing Analyser — Stage 1)
- A structured specification analysis (JSON from the Spec Reader — Stage 2)

You must:

1. CROSS-REFERENCE the drawing quantities against the specification requirements for each trade.

2. VALIDATE that what is shown on the drawings meets the specification. Identify:
   - Items on drawings that don't match the spec (wrong material, rating, etc.)
   - Items required by the spec that don't appear on the drawings
   - Quantities that need adjusting based on spec requirements
   - Implicit inclusions required by the spec but not shown (supports, testing, labelling)

3. PRODUCE a consolidated takeoff as a JSON object (no markdown, no backticks, no preamble):

{
  "project_reference": "[project name/number]",
  "kb_version": "${kb.KB_VERSION}",
  "consolidated_takeoff": [
    {
      "trade": "Mechanical | Electrical | Insulation",
      "description": "[item description]",
      "specification": "[confirmed spec from cross-reference]",
      "quantity": [number],
      "unit": "m | nr | m\u00b2",
      "source": "Drawing | Spec | Both | Implicit",
      "confidence": "High | Medium | Low",
      "notes": "[any estimator notes]"
    }
  ],
  "conflicts": [
    {
      "conflict_type": "Drawing vs Spec | Spec vs Spec | Missing from Drawing | Missing from Spec",
      "description": "[what the conflict is]",
      "drawing_says": "[what drawing shows]",
      "spec_says": "[what spec requires]",
      "recommendation": "[suggested resolution for estimator review]"
    }
  ],
  "estimator_review_required": [
    "[list of items flagged as Low confidence or conflicted that need human sign-off]"
  ]
}

## RULES
- Where drawing and spec AGREE: source = "Both", confidence = "High".
- Where drawing and spec CONFLICT: default to the spec requirement but flag it clearly. Confidence = "Low".
- Where spec is SILENT on something shown on the drawing: include with source = "Drawing", confidence = "Medium".
- Where spec REQUIRES something NOT on the drawing: include with source = "Spec", confidence = "Low", flag as "Missing from Drawing".
- Implicit inclusions (supports, testing, labelling): source = "Implicit", confidence = "Medium".
- NEVER resolve a conflict autonomously — always flag for estimator review.
- The estimator must sign off on ALL Low confidence items and ALL conflicts before pricing.
- Apply BSRIA sense-check thresholds to all quantities — flag outliers.
- Ensure all items have NRM2-compliant units and descriptions.
- Return JSON ONLY. No markdown fences, no preamble, no trailing text.`;

router.post('/consolidate', async (req, res) => {
  try {
    const { drawingData, specData, messages, model, max_tokens } = req.body;

    const systemPrompt = `You are an expert M&E estimator inside the Contraq platform. You have 20+ years of experience cross-referencing construction drawings against specifications.

${req.kbPrompt}

${req.kbTruncated ? '⚠ NOTE: Some non-critical KB sections were omitted due to token limits.' : ''}

${TASK_PROMPT}`.trim();

    // New structured API
    if (drawingData && specData) {
      const userPrompt = `STAGE 1 — DRAWING EXTRACTION:\n${JSON.stringify(drawingData, null, 2)}\n\nSTAGE 2 — SPECIFICATION ANALYSIS:\n${JSON.stringify(specData, null, 2)}\n\nCross-reference these two datasets. Produce a consolidated takeoff with conflicts identified. Return JSON only.`;

      const response = await callAI({
        systemPrompt,
        userPrompt,
        maxTokens: max_tokens || 12000,
        model: model || 'claude-sonnet-4-6'
      });

      return res.json({
        success: true,
        kbVersion: kb.KB_VERSION,
        kbTruncated: req.kbTruncated || false,
        takeoff: response.json || response.raw,
        usage: response.usage
      });
    }

    // Legacy: raw messages
    if (messages) {
      req.body.system = systemPrompt;
      if (!req.body.max_tokens) req.body.max_tokens = 12000;
      const proxyToAnthropic = req.app.get('proxyToAnthropic');
      if (proxyToAnthropic) return proxyToAnthropic(req, res, '/api/takeoff/consolidate');
    }

    res.status(400).json({ error: { type: 'invalid_request', message: 'Provide drawingData + specData, or messages.' } });
  } catch (err) {
    console.error('[takeoff/consolidate] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
