/**
 * Feedback Loop Routes
 * POST /api/feedback/process — Estimator correction processing
 *
 * Processes estimator corrections, produces corrected extraction,
 * generates LEARNED rules, and persists them to KB-L01/L02 on disk.
 */

const express = require('express');
const router = express.Router();
const { callAI } = require('../services/ai');
const kbManager = require('../knowledge/kb-manager');
const kb = require('../knowledge/mep-knowledge-base');

router.post('/process', async (req, res) => {
  try {
    const { originalExtraction, corrections, generalFeedback, messages, model, max_tokens } = req.body;

    const systemPrompt = `You are an M&E estimating assistant in refinement mode.
Process the estimator's corrections, produce a corrected extraction,
and generate LEARNED rules to prevent recurrence.

${req.kbPrompt}

${req.kbTruncated ? '⚠ NOTE: Some non-critical KB sections were omitted due to token limits.' : ''}

## ERROR TYPES
QUANTITY_ERROR: Wrong quantity (wrong length, missed items, double counted, wrong waste factor)
SPECIFICATION_ERROR: Wrong material, size, rating, or type
TRADE_ERROR: Item assigned to wrong trade
SCOPE_ERROR: Included out-of-scope items or missed in-scope items
HALLUCINATION: Invented items or quantities not present on drawing/spec
CONVENTION_ERROR: Misread drawing convention, symbol, or abbreviation
CONFIDENCE_ERROR: Wrong confidence score
MISSED_FLAG: Failed to flag something needing estimator attention

## RESPONSE FORMAT
Return a JSON object (no markdown, no backticks, no preamble):

{
  "kb_version": "${kb.KB_VERSION}",
  "error_acknowledgements": [
    {
      "item": "[item in question]",
      "error_type": "[error type from list above]",
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
  "updated_rules": [
    {
      "rule_id": "LEARNED_NNN",
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
- If same error type corrected 3+ times, add to pattern_errors array.
- Return JSON ONLY.`.trim();

    // ── New structured API ─────────────────────────
    if (originalExtraction && corrections) {
      const existingLearning = kbManager.loadLearning();
      const nextRuleNum = existingLearning.learnedRules.length + 1;

      const existingRulesContext = existingLearning.learnedRules.length
        ? `\n\nEXISTING LEARNED RULES (apply these, number new rules sequentially from LEARNED_${String(nextRuleNum).padStart(3, '0')}):\n${JSON.stringify(existingLearning.learnedRules, null, 2)}`
        : `\n\nNo existing learned rules. Number new rules starting at LEARNED_${String(nextRuleNum).padStart(3, '0')}.`;

      const userPrompt = `Original extraction:
${JSON.stringify(originalExtraction, null, 2)}

Estimator corrections:
${JSON.stringify(corrections, null, 2)}

General feedback: ${generalFeedback || 'None provided'}
${existingRulesContext}

Please:
1. Acknowledge each error with root cause analysis
2. Produce corrected extraction JSON
3. State updated LEARNED rules in format: { rule_id, trigger, action, reason }
4. Produce feedback session summary`.trim();

      const response = await callAI({
        systemPrompt,
        userPrompt,
        maxTokens: max_tokens || 10000,
        model: model || 'claude-sonnet-4-6'
      });

      // ── Parse and persist learned rules ─────────
      let learnedRules = [];
      let patternErrors = [];

      try {
        const parsed = response.json || (typeof response.raw === 'string' ? JSON.parse(response.raw) : null);

        if (parsed) {
          learnedRules = parsed.updated_rules || parsed.learned_rules || [];
          patternErrors = parsed.pattern_errors || [];

          // Persist learned rules to KB-L01
          if (learnedRules.length > 0) {
            const existing = kbManager.loadLearning();
            const ruleIds = new Set(existing.learnedRules.map(r => r.rule_id));
            const merged = [...existing.learnedRules];

            for (const rule of learnedRules) {
              if (!ruleIds.has(rule.rule_id)) {
                merged.push(rule);
                ruleIds.add(rule.rule_id);
                console.log(`[KB] Persisted new learned rule: ${rule.rule_id}`);
              } else {
                const idx = merged.findIndex(r => r.rule_id === rule.rule_id);
                merged[idx] = rule;
                console.log(`[KB] Updated learned rule: ${rule.rule_id}`);
              }
            }

            const existingPatterns = existing.patternErrors;

            // Persist pattern errors to KB-L02
            for (const pattern of patternErrors) {
              const exists = existingPatterns.find(p => p.error_type === pattern.error_type);
              if (!exists) {
                existingPatterns.push({
                  pattern_id: `PATTERN_${String(existingPatterns.length + 1).padStart(3, '0')}`,
                  error_type: pattern.error_type,
                  occurrences: pattern.occurrences || 3,
                  heightened_action: pattern.heightened_action || `Triple-check all ${pattern.error_type} items.`,
                  first_detected: new Date().toISOString(),
                  last_triggered: new Date().toISOString()
                });
                console.log(`[KB] New pattern error: ${pattern.error_type}`);
              } else {
                exists.occurrences = pattern.occurrences || exists.occurrences;
                exists.heightened_action = pattern.heightened_action || exists.heightened_action;
                exists.last_triggered = new Date().toISOString();
              }
            }

            kbManager.saveLearning(merged, existingPatterns);
          }
        }
      } catch (parseErr) {
        console.warn('[feedback/process] Could not parse learned rules from AI response:', parseErr.message);
      }

      return res.json({
        success: true,
        kbVersion: kb.KB_VERSION,
        response: response.json || response.raw,
        learnedRulesPersisted: learnedRules.length,
        patternErrorsPersisted: patternErrors.length,
        kbUpdated: learnedRules.length > 0 || patternErrors.length > 0,
        totalLearnedRules: kbManager.loadLearning().learnedRules.length,
        totalPatternErrors: kbManager.loadLearning().patternErrors.length,
        usage: response.usage
      });
    }

    // ── Legacy: raw messages from existing frontend ──
    if (messages) {
      req.body.system = systemPrompt;
      if (!req.body.max_tokens) req.body.max_tokens = 10000;

      // Custom proxy that intercepts response for learning persistence
      const { ALLOWED_MODELS } = require('../services/ai');
      const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

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

      // Persist learning from legacy response
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
