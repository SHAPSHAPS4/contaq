const express = require('express');
const router = express.Router();
const { kbInjectionMiddleware } = require('../kb/middleware');
const { callAI } = require('../services/ai');
const { logSession } = require('../services/session-logger');
const { validateExtraction, generateValidationReport } = require('../services/extraction-validator');
const { checkScope } = require('../services/scope-checker');

router.post('/consolidate', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { drawing_extraction, spec_analysis, project_ref, messages, model, max_tokens } = req.body;

    if (messages) {
      req.body.system = `You are an expert M&E estimator performing takeoff consolidation.\n${req.kbPrompt}`;
      if (!req.body.max_tokens) req.body.max_tokens = 12000;
      const proxyToAnthropic = req.app.get('proxyToAnthropic');
      if (proxyToAnthropic) return proxyToAnthropic(req, res, '/api/takeoff/consolidate');
      return res.status(500).json({ error: 'Proxy not available' });
    }

    if (!drawing_extraction) return res.status(400).json({ error: 'drawing_extraction required' });

    // Validation gate — block if extraction quality is too low
    const validation = validateExtraction(drawing_extraction);
    if (!validation.passed && !req.body.override_validation) {
      return res.status(422).json({
        success: false,
        blocked: true,
        validation,
        report: generateValidationReport(validation, project_ref),
        message: 'Extraction quality too low to proceed. Review validation report and submit with override_validation: true to force.',
      });
    }

    const systemPrompt = `You are an expert M&E estimating assistant performing takeoff consolidation.\nRead the following knowledge base before processing.\n${req.kbPrompt}`.trim();

    const userPrompt = `Cross-reference the following drawing extraction and specification analysis.\nProduce a consolidated takeoff ready for estimator review and pricing.\nProject reference: ${project_ref || 'Not stated'}\n\nDRAWING EXTRACTION:\n${JSON.stringify(drawing_extraction, null, 2)}\n\nSPECIFICATION ANALYSIS:\n${JSON.stringify(spec_analysis || {}, null, 2)}\n\nOutput using the JSON format defined in your knowledge base.\nInclude project_reference, consolidated_takeoff array, conflicts array, and estimator_review_required array.`.trim();

    const result = await callAI({
      systemPrompt,
      userPrompt,
      maxTokens: max_tokens || 12000,
      model: model || 'claude-sonnet-4-6',
    });

    // Run scope completeness check on the consolidated takeoff
    const scopeCheck = checkScope(result.data);

    const duration = Date.now() - startTime;
    logSession({ type: 'takeoff_consolidate', project_ref, duration_ms: duration, tokens: result.usage, scope_gaps: scopeCheck.scope_gaps_found });

    res.json({
      success: true,
      kb_version: 'v7.2',
      duration_ms: duration,
      usage: result.usage,
      takeoff: result.data,
      scope_check: scopeCheck,
      scope_gaps_warning: scopeCheck.scope_gaps_found > 0,
    });
  } catch (err) {
    console.error('[takeoff/consolidate]', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
