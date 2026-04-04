/**
 * AI Pipeline Routes — AlphaLab-inspired multi-phase processing
 *
 * POST /api/ai/analyse         — Phase 1: Deep analysis + grounded generation
 * POST /api/ai/critic          — Phase 2: Adversarial critic pass
 * POST /api/ai/quote-dual      — Phase 3: Dual-model divergence for quotes
 * POST /api/ai/full-pipeline   — Phase 1 + 2 combined (analyse → generate → critic)
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { kbInjectionMiddleware } = require('../kb/middleware');
const { runAnalysisPipeline, runCriticPass, runDualModelQuote, runFullPipeline } = require('../services/ai-pipeline');
const { logSession } = require('../services/session-logger');

// All routes require auth
router.use(requireAuth);

// Phase 1: Deep Analysis Pipeline (EOT, Loss & Expense, Contract Risk)
router.post('/analyse', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { documents, journal_entries, user_request, generation_type } = req.body;

    if (!generation_type) {
      return res.status(400).json({ success: false, error: 'generation_type required (eot, loss_expense, contract_risk)' });
    }

    // Convert base64 documents to the format callAI expects
    const docs = (documents || []).map(d => ({
      base64: d.base64 || d.data,
      mimeType: d.mime_type || d.mimeType || 'application/pdf',
    }));

    const result = await runAnalysisPipeline({
      documents: docs,
      journalEntries: journal_entries || [],
      userRequest: user_request || '',
      generationType: generation_type,
      kbPrompt: req.kbPrompt || '',
    });

    const duration = Date.now() - startTime;
    logSession({
      type: 'ai_pipeline_analyse',
      project_ref: req.body.project_ref,
      org_id: req.orgId,
      duration_ms: duration,
      tokens: result.usage,
      generation_type,
    });

    res.json({
      success: true,
      phase: 'analysis_and_generation',
      analysis: result.analysis,
      output: result.output,
      raw_output: result.raw_output,
      document_count: result.document_count,
      grounded: true,
      usage: result.usage,
      duration_ms: duration,
    });
  } catch (err) {
    console.error('[AI Pipeline] Analysis error:', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

// Phase 2: Adversarial Critic (can be called on any AI output)
router.post('/critic', async (req, res) => {
  const startTime = Date.now();
  try {
    const { ai_output, source_analysis, output_type } = req.body;

    if (!ai_output) {
      return res.status(400).json({ success: false, error: 'ai_output required' });
    }

    const result = await runCriticPass({
      aiOutput: ai_output,
      sourceAnalysis: source_analysis || null,
      outputType: output_type || 'general',
    });

    res.json({
      success: true,
      phase: 'critic',
      passed: result.passed,
      issues: result.issues || [],
      confidence: result.confidence || 'medium',
      usage: result.usage,
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.error('[AI Pipeline] Critic error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Phase 3: Dual-Model Divergence for Quotes
router.post('/quote-dual', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { scope_description, documents } = req.body;

    if (!scope_description) {
      return res.status(400).json({ success: false, error: 'scope_description required' });
    }

    const docs = (documents || []).map(d => ({
      base64: d.base64 || d.data,
      mimeType: d.mime_type || d.mimeType || 'application/pdf',
    }));

    const result = await runDualModelQuote({
      scopeDescription: scope_description,
      kbPrompt: req.kbPrompt || '',
      documents: docs,
    });

    const duration = Date.now() - startTime;
    logSession({
      type: 'ai_pipeline_quote_dual',
      project_ref: req.body.project_ref,
      org_id: req.orgId,
      duration_ms: duration,
      tokens: result.usage,
    });

    res.json({
      success: true,
      phase: 'dual_model',
      conservative: result.conservative,
      aggressive: result.aggressive,
      divergence_flags: result.flags,
      flag_count: result.flags.length,
      usage: result.usage,
      duration_ms: duration,
    });
  } catch (err) {
    console.error('[AI Pipeline] Quote dual error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full Pipeline: Analysis + Generation + Critic (one call does it all)
router.post('/full-pipeline', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { documents, journal_entries, user_request, generation_type } = req.body;

    if (!generation_type) {
      return res.status(400).json({ success: false, error: 'generation_type required' });
    }

    const docs = (documents || []).map(d => ({
      base64: d.base64 || d.data,
      mimeType: d.mime_type || d.mimeType || 'application/pdf',
    }));

    const result = await runFullPipeline({
      documents: docs,
      journalEntries: journal_entries || [],
      userRequest: user_request || '',
      generationType: generation_type,
      kbPrompt: req.kbPrompt || '',
    });

    const duration = Date.now() - startTime;
    logSession({
      type: 'ai_pipeline_full',
      project_ref: req.body.project_ref,
      org_id: req.orgId,
      duration_ms: duration,
      tokens: result.usage,
      generation_type,
      critic_passed: result.critic.passed,
    });

    res.json({
      success: true,
      phase: 'full_pipeline',
      analysis: result.analysis,
      output: result.output,
      raw_output: result.raw_output,
      document_count: result.document_count,
      grounded: true,
      critic: result.critic,
      usage: result.usage,
      duration_ms: duration,
    });
  } catch (err) {
    console.error('[AI Pipeline] Full pipeline error:', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
