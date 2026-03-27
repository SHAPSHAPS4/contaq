const express = require('express');
const router = express.Router();
const { kbInjectionMiddleware } = require('../kb/middleware');
const { callAI } = require('../services/ai');
const { persistLearnedRules, persistPatternError } = require('../kb/index');
const { logSession } = require('../services/session-logger');

router.post('/process', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  const orgId = req.orgId || null;
  const userId = req.user?.id || null;
  const trade = req.userTrade || req.user?.organizations?.trade || null;

  try {
    const { original_extraction, corrections, general_feedback, project_ref, messages, model, max_tokens } = req.body;

    if (messages) {
      req.body.system = `You are an M&E estimating assistant in refinement mode.\n${req.kbPrompt}`;
      if (!req.body.max_tokens) req.body.max_tokens = 10000;
      // Legacy proxy with learning intercept
      const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
      const safeModel = model === 'claude-sonnet-4-6' ? model : 'claude-sonnet-4-6';
      const anthropicBody = { model: safeModel, max_tokens: req.body.max_tokens, system: req.body.system, messages };
      const anthropicResp = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(anthropicBody)
      });
      const body = await anthropicResp.text();
      if (anthropicResp.ok) {
        try {
          const parsed = JSON.parse(body);
          const raw = parsed.content?.[0]?.text || '';
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            const rules = result.updated_rules || result.learned_rules || [];
            if (rules.length) await persistLearnedRules(rules, orgId, userId, trade);
            for (const p of (result.pattern_errors || [])) {
              await persistPatternError(p.error_type, p.occurrences || 3, p.heightened_action || `Check ${p.error_type}`, orgId, userId);
            }
          }
        } catch {}
      }
      return res.status(anthropicResp.status).set('Content-Type', 'application/json').send(body);
    }

    if (!corrections || !corrections.length) return res.status(400).json({ error: 'corrections array required' });

    const systemPrompt = `You are an M&E estimating assistant in refinement mode.\nProcess the estimator corrections and generate LEARNED rules to prevent recurrence.\n${req.kbPrompt}`.trim();

    const userPrompt = `Project reference: ${project_ref || 'Not stated'}\n\nORIGINAL EXTRACTION:\n${JSON.stringify(original_extraction || {}, null, 2)}\n\nESTIMATOR CORRECTIONS:\n${JSON.stringify(corrections, null, 2)}\n\nGENERAL FEEDBACK: ${general_feedback || 'None provided'}\n\nPlease:\n1. Acknowledge each error with root cause\n2. Produce corrected extraction\n3. State LEARNED rules with concrete examples: { rule_id, trigger, action, reason, error_type, example_before, example_after }\n   - example_before: the specific AI output that was wrong (e.g. "50m duct, no elbows")\n   - example_after: what the estimator corrected it to (e.g. "50m duct + 10 elbows")\n4. Identify PATTERN errors if same error_type appears 3+ times\n5. Produce feedback session summary`.trim();

    const result = await callAI({
      systemPrompt,
      userPrompt,
      maxTokens: max_tokens || 10000,
      model: model || 'claude-sonnet-4-6',
    });

    const learned_rules = result.data?.updated_rules || [];
    const pattern_errors = result.data?.pattern_errors || [];

    if (learned_rules.length) await persistLearnedRules(learned_rules, orgId, userId, trade);
    for (const p of pattern_errors) {
      await persistPatternError(p.error_type, p.occurrences, p.heightened_action, orgId, userId);
    }

    const duration = Date.now() - startTime;
    logSession({
      type: 'feedback_process',
      project_ref,
      org_id: orgId,
      duration_ms: duration,
      tokens: result.usage,
      rules_added: learned_rules.length,
      patterns_added: pattern_errors.length,
      corrections_count: corrections.length,
    });

    res.json({
      success: true,
      duration_ms: duration,
      usage: result.usage,
      response: result.data,
      learned_rules_persisted: learned_rules.length,
      pattern_errors_persisted: pattern_errors.length,
      kb_updated: learned_rules.length > 0 || pattern_errors.length > 0,
      org_scoped: !!orgId,
    });
  } catch (err) {
    console.error('[feedback/process]', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
