/**
 * Feedback Loop Routes
 * POST /api/feedback/process — Estimator correction processing
 */

const express = require('express');
const router = express.Router();
const { callAI } = require('../services/ai');
const kbManager = require('../knowledge/kb-manager');
const kb = require('../knowledge/mep-knowledge-base');

const TASK_PROMPT = `## ERROR TYPES
QUANTITY_ERROR: Wrong quantity (wrong length, missed items, double counted, wrong waste factor)
SPECIFICATION_ERROR: Wrong material, size, rating, or type
TRADE_ERROR: Item assigned to wrong trade
SCOPE_ERROR: Included out-of-scope items or missed in-scope items
HALLUCINATION: Invented items or quantities not present on drawing/spec
CONVENTION_ERROR: Misread drawing convention, symbol, or abbreviation
CONFIDENCE_ERROR: Wrong confidence score
MISSED_FLAG: Failed to flag something needing estimator attention

## YOUR RESPONSE FORMAT

Respond with a JSON object (no markdown, no backticks, no preamble):

{
  "kb_version": "${kb.KB_VERSION}",
  "error_acknowledgements": [
    {
      "item": "[item in question]",
      "error_type": "[error type]",
      "root_cause": "[why this happened]",
      "correct_principle": "[what rule applies]",
      "corrected_extraction": {
        "description": "[corrected description]",
        "specification": "[corrected spec]",
        "quantity": [number],
        "unit": "[unit]",
        "confidence": "[corrected confidence]"
      }
    }
  ],
  "corrected_takeoff": {
    "drawing_reference": "[drawing number]",
    "version": "Corrected following estimator review",
    "extraction": [ "...corrected items..." ],
    "flags": [ "...updated flags..." ]
  },
  "learned_rules": [
    {
      "rule_id": "LEARNED_001",
      "trigger": "[what situation triggers this rule]",
      "action": "[what to do differently]",
      "reason": "[why this matters]"
    }
  ],
  "pattern_errors": [],
  "feedback_session_summary": {
    "total_errors_corrected": [number],
    "errors_by_type": {},
    "learned_rules_added": [],
    "overall_accuracy_assessment": "Improving | Stable | Needs Attention",
    "recommended_kb_updates": []
  }
}

## RULES
- NEVER argue with estimator corrections — accept and learn.
- NEVER repeat a corrected error in the same session.
- Always show working when correcting quantities.
- If a correction seems inconsistent with a previous one, flag politely for clarification.
- Prioritise estimator feedback over domain knowledge.
- If same error type corrected 3+ times, flag as PATTERN ERROR.
- Return JSON ONLY.`;

router.post('/process', async (req, res) => {
  try {
    const { originalExtraction, corrections, messages, model, max_tokens } = req.body;

    const systemPrompt = `You are an M&E estimating assistant inside the Contraq platform. The estimator has reviewed your output and identified errors. You must learn from this feedback, correct your extraction, and produce updated rules.

${req.kbPrompt}

${req.kbTruncated ? '⚠ NOTE: Some non-critical KB sections were omitted due to token limits.' : ''}

${TASK_PROMPT}`.trim();

    // New structured API
    if (originalExtraction && corrections) {
      const existingRules = kbManager.loadLearning();
      const rulesContext = existingRules.learnedRules.length
        ? '\n\nEXISTING LEARNED RULES:\n' + JSON.stringify(existingRules.learnedRules, null, 2)
        : '';

      const nextRuleNum = existingRules.learnedRules.length + 1;
      const userPrompt = `ORIGINAL EXTRACTION:\n${JSON.stringify(originalExtraction, null, 2)}\n\nESTIMATOR FEEDBACK:\n${JSON.stringify(corrections, null, 2)}${rulesContext}\n\nProcess all corrections. Number new rules starting at LEARNED_${String(nextRuleNum).padStart(3, '0')}. Return JSON only.`;

      const response = await callAI({
        systemPrompt,
        userPrompt,
        maxTokens: max_tokens || 10000,
        model: model || 'claude-sonnet-4-6'
      });

      // Persist learned rules to disk
      if (response.raw) {
        try { kbManager.processAndPersistFeedback(response.raw); } catch (e) {
          console.warn('[feedback] Learning persistence failed:', e.message);
        }
      }

      return res.json({
        success: true,
        kbVersion: kb.KB_VERSION,
        feedback: response.json || response.raw,
        learning: kbManager.loadLearning(),
        usage: response.usage
      });
    }

    // Legacy: raw messages
    if (messages) {
      req.body.system = systemPrompt;
      if (!req.body.max_tokens) req.body.max_tokens = 10000;

      // Use custom proxy that intercepts response for learning persistence
      const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
      const { ALLOWED_MODELS } = require('../services/ai');

      const safeModel = ALLOWED_MODELS.includes(req.body.model) ? req.body.model : 'claude-sonnet-4-6';
      const anthropicBody = { model: safeModel, max_tokens: req.body.max_tokens, system: systemPrompt, messages: req.body.messages };

      const anthropicResp = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(anthropicBody)
      });

      const body = await anthropicResp.text();
      if (anthropicResp.ok) {
        try { kbManager.processAndPersistFeedback(body); } catch (e) {
          console.warn('[feedback] Learning persistence failed:', e.message);
        }
      }

      return res.status(anthropicResp.status).set('Content-Type', 'application/json').send(body);
    }

    res.status(400).json({ error: { type: 'invalid_request', message: 'Provide originalExtraction + corrections, or messages.' } });
  } catch (err) {
    console.error('[feedback/process] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
