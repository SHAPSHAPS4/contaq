/**
 * Drawing Extraction Routes
 * POST /api/drawings/extract — Stage 1 of the estimation pipeline
 */

const express = require('express');
const router = express.Router();
const { callAI } = require('../services/ai');
const kb = require('../knowledge/mep-knowledge-base');

const TASK_PROMPT = `## YOUR TASK

You will be provided with one or more PDF drawing pages. You must:

1. IDENTIFY all M&E elements visible on the drawings, categorised by trade:
   - MECHANICAL: pipework (diameter, material, insulation spec if shown), HVAC ductwork, plant equipment, valves, fittings
   - ELECTRICAL: cable routes, containment (tray, trunking, conduit), DB boards, light fittings, sockets, equipment
   - INSULATION: any insulation spec noted against pipework, ductwork, or equipment

2. QUANTIFY each element using NRM2-compliant units:
   - Linear items (pipe, cable, duct, trunking): metres (m)
   - Point items (valves, fittings, outlets, luminaires): number (nr)
   - Area items (lagging, insulation board): square metres (m²)

3. OUTPUT your extraction as a JSON object (no markdown, no backticks, no preamble):

{
  "drawing_reference": "[drawing number/title if visible]",
  "scale": "[drawing scale if stated, or 'NTS' / 'Not stated']",
  "kb_version": "${kb.KB_VERSION}",
  "extraction": [
    {
      "trade": "Mechanical | Electrical | Insulation",
      "description": "[item description]",
      "specification": "[material, diameter, rating, etc. if shown]",
      "quantity": [number],
      "unit": "m | nr | m²",
      "confidence": "High | Medium | Low",
      "notes": "[any relevant notes including location on drawing]"
    }
  ],
  "flags": [
    {
      "issue": "[description of ambiguity, missing info, or conflict]",
      "location": "[where on the drawing]",
      "recommendation": "[what the estimator should check]"
    }
  ]
}

## RULES
- ALWAYS extract the Legend/Key FIRST. Project-specific legends override all general standards.
- Use CIBSE colour/symbol standards from the knowledge base for identification.
- Only extract items you can clearly see. Do not invent or assume quantities.
- If a measurement is unclear or scale is ambiguous, set confidence to "Low" and explain in notes.
- If an item is partially visible or cut off at drawing edge, flag it.
- Do not guess pipe sizes or cable ratings — if not labelled, mark as "unspecified".
- Flag any items that appear on the drawing but have no spec or schedule reference.
- Distinguish NEW services (bold/coloured) from EXISTING (grey/faded). Only extract NEW unless asked otherwise.
- NEVER count dimension lines, arrows, leaders, centre-lines, or text as physical services.
- Double-line duct = ONE duct, measure centreline ONCE.
- Apply two-pass verification: classify then confirm against legend/CIBSE.
- DEFAULT CONSERVATIVE. Under-count and flag rather than over-count.
- Return JSON ONLY. No markdown fences, no preamble, no trailing text.`;

router.post('/extract', async (req, res) => {
  try {
    const { documents, messages, model, max_tokens, projectRef } = req.body;

    // Build system prompt with KB injected by middleware
    const systemPrompt = `You are an expert M&E (Mechanical, Electrical, and Insulation) estimator with 20+ years of experience reading construction drawings. You work inside the Contraq platform.

${req.kbPrompt}

${req.kbTruncated ? '⚠ NOTE: Some non-critical KB sections were omitted due to token limits.' : ''}

${TASK_PROMPT}`.trim();

    // If called via the new structured API (documents + projectRef)
    if (documents && Array.isArray(documents)) {
      const userPrompt = `Please analyse the attached M&E drawing(s) and extract all quantities.
Project reference: ${projectRef || 'Not stated'}
Output your extraction in the JSON format defined in your knowledge base.`;

      const response = await callAI({
        systemPrompt,
        userPrompt,
        documents,
        maxTokens: max_tokens || 8000,
        model: model || 'claude-sonnet-4-6'
      });

      return res.json({
        success: true,
        kbVersion: kb.KB_VERSION,
        kbTruncated: req.kbTruncated || false,
        extraction: response.json || response.raw,
        usage: response.usage
      });
    }

    // Legacy compatibility: if called with raw messages (from existing frontend)
    if (messages) {
      req.body.system = systemPrompt;
      if (!req.body.max_tokens) req.body.max_tokens = 8000;

      // Forward to shared proxy logic
      const proxyToAnthropic = req.app.get('proxyToAnthropic');
      if (proxyToAnthropic) {
        return proxyToAnthropic(req, res, '/api/drawings/extract');
      }
    }

    res.status(400).json({ error: { type: 'invalid_request', message: 'Provide documents array or messages array.' } });
  } catch (err) {
    console.error('[drawings/extract] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
