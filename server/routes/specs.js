/**
 * Spec Reader Routes
 * POST /api/specs/analyse — Stage 2 of the estimation pipeline
 */

const express = require('express');
const router = express.Router();
const { callAI } = require('../services/ai');
const kb = require('../knowledge/mep-knowledge-base');

const TASK_PROMPT = `## YOUR TASK

You will be provided with one or more specification documents. You must:

1. IDENTIFY the specification requirements for each M&E trade:
   - MECHANICAL: pipe materials, jointing methods, pressure ratings, insulation requirements, testing requirements
   - ELECTRICAL: cable types, containment specifications, earthing requirements, wiring regulations references
   - INSULATION: insulation materials, thickness requirements, facing types, fire ratings

2. EXTRACT any Bills of Materials, schedules, or itemised lists present in the spec.

3. FLAG any contradictions, ambiguities, or missing information within the spec itself.

4. OUTPUT as a JSON object (no markdown, no backticks, no preamble):

{
  "project_reference": "[project name/number if shown]",
  "kb_version": "${kb.KB_VERSION}",
  "spec_requirements": [
    {
      "trade": "Mechanical | Electrical | Insulation",
      "requirement": "[description of requirement]",
      "spec_reference": "[section/clause number if available]",
      "mandatory": true | false,
      "notes": "[any clarification needed]"
    }
  ],
  "schedules_found": [
    {
      "schedule_type": "[e.g. pipe schedule, luminaire schedule]",
      "content_summary": "[brief description of what it contains]"
    }
  ],
  "flags": [
    {
      "issue": "[contradiction or ambiguity found]",
      "spec_reference": "[where in the document]",
      "recommendation": "[what estimator should clarify]"
    }
  ]
}

## RULES
- Do not invent requirements. Only extract what is explicitly stated.
- Where the spec references a standard (e.g. BS EN, CIBSE), note it but do not expand unless it directly affects quantities.
- If sections are missing or vague, flag them for estimator review.
- Where the spec contradicts itself internally, flag both instances.
- Identify spec type (D/D+/P) per section where determinable.
- Cross-reference against BSRIA defaults — if spec is silent on a key parameter, flag it.
- Check for template leftovers (generic text not edited for the specific project).
- Note any risk items: LDs, bonding requirements, programme constraints, testing extent, warranty periods.
- Return JSON ONLY. No markdown fences, no preamble, no trailing text.`;

router.post('/analyse', async (req, res) => {
  try {
    const { documents, messages, model, max_tokens, projectRef } = req.body;

    const systemPrompt = `You are an expert M&E estimator and specification reader with 20+ years of experience reading UK construction specifications. You work inside the Contraq platform.

${req.kbPrompt}

${req.kbTruncated ? '⚠ NOTE: Some non-critical KB sections were omitted due to token limits.' : ''}

${TASK_PROMPT}`.trim();

    if (documents && Array.isArray(documents)) {
      const response = await callAI({
        systemPrompt,
        userPrompt: `Analyse all uploaded specification documents. Extract every M&E requirement by trade, identify schedules, flag contradictions. Project: ${projectRef || 'Not stated'}. Return JSON only.`,
        documents,
        maxTokens: max_tokens || 8000,
        model: model || 'claude-sonnet-4-6'
      });

      return res.json({
        success: true,
        kbVersion: kb.KB_VERSION,
        kbTruncated: req.kbTruncated || false,
        analysis: response.json || response.raw,
        usage: response.usage
      });
    }

    // Legacy: raw messages from existing frontend
    if (messages) {
      req.body.system = systemPrompt;
      if (!req.body.max_tokens) req.body.max_tokens = 8000;
      const proxyToAnthropic = req.app.get('proxyToAnthropic');
      if (proxyToAnthropic) return proxyToAnthropic(req, res, '/api/specs/analyse');
    }

    res.status(400).json({ error: { type: 'invalid_request', message: 'Provide documents or messages.' } });
  } catch (err) {
    console.error('[specs/analyse] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
