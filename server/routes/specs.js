const express = require('express');
const router = express.Router();
const { kbInjectionMiddleware } = require('../kb/middleware');
const { callAI } = require('../services/ai');
const { loadUpload, bufferToBase64 } = require('../services/pdf-processor');
const { logSession } = require('../services/session-logger');
const { saveExtraction } = require('../services/file-storage');

router.post('/analyse', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { file_id, spec_base64, spec_mime_type, project_ref, messages, model, max_tokens } = req.body;

    let base64, mimeType;
    if (file_id) {
      const buffer = loadUpload(file_id);
      base64 = bufferToBase64(buffer);
      mimeType = 'application/pdf';
    } else if (spec_base64) {
      base64 = spec_base64;
      mimeType = spec_mime_type || 'application/pdf';
    } else if (messages) {
      req.body.system = `You are an expert M&E specification reader.\n${req.kbPrompt}`;
      if (!req.body.max_tokens) req.body.max_tokens = 8000;
      const proxyToAnthropic = req.app.get('proxyToAnthropic');
      if (proxyToAnthropic) return proxyToAnthropic(req, res, '/api/specs/analyse');
      return res.status(500).json({ error: 'Proxy not available' });
    } else {
      return res.status(400).json({ error: 'file_id, spec_base64, or messages required' });
    }

    const systemPrompt = `You are an expert M&E estimating assistant and specification reader.\nRead the following knowledge base before processing the specification.\n${req.kbPrompt}`.trim();

    const userPrompt = `Analyse this M&E specification document and extract all requirements.\nProject reference: ${project_ref || 'Not stated'}\nOutput using the JSON format defined in your knowledge base.\nInclude project_reference, spec_requirements array, schedules_found array, and flags array.`.trim();

    const result = await callAI({
      systemPrompt,
      userPrompt,
      documents: [{ base64, mimeType }],
      maxTokens: max_tokens || 8000,
      model: model || 'claude-sonnet-4-6',
    });

    const duration = Date.now() - startTime;
    logSession({ type: 'spec_analyse', project_ref, duration_ms: duration, tokens: result.usage, file_id });

    // Auto-save extraction
    if (req.orgId && req.orgId !== 'demo-org-id') {
      saveExtraction({
        orgId: req.orgId, userId: req.user?.id, stage: 'spec',
        inputFiles: [{ name: project_ref || 'spec', type: 'pdf' }],
        resultJson: result.data, tokensUsed: result.usage?.total_tokens || 0,
        model: model || 'claude-sonnet-4-6', processingMs: duration,
      }).catch(e => console.error('[Specs] Auto-save error:', e.message));
    }

    res.json({
      success: true,
      kb_version: '9.0',
      duration_ms: duration,
      usage: result.usage,
      analysis: result.data,
    });
  } catch (err) {
    console.error('[specs/analyse]', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
