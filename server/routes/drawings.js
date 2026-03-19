const express = require('express');
const router = express.Router();
const { kbInjectionMiddleware } = require('../kb/middleware');
const { callAI } = require('../services/ai');
const { loadUpload, bufferToBase64 } = require('../services/pdf-processor');
const { logSession } = require('../services/session-logger');

router.post('/extract', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { file_id, drawing_base64, drawing_mime_type, project_ref, messages, model, max_tokens } = req.body;

    let base64, mimeType;
    if (file_id) {
      const buffer = loadUpload(file_id);
      base64 = bufferToBase64(buffer);
      mimeType = 'application/pdf';
    } else if (drawing_base64) {
      base64 = drawing_base64;
      mimeType = drawing_mime_type || 'application/pdf';
    } else if (messages) {
      // Legacy compatibility — raw messages from existing frontend
      req.body.system = `You are an expert M&E estimating assistant.\n${req.kbPrompt}`;
      if (!req.body.max_tokens) req.body.max_tokens = 8000;
      const proxyToAnthropic = req.app.get('proxyToAnthropic');
      if (proxyToAnthropic) return proxyToAnthropic(req, res, '/api/drawings/extract');
      return res.status(500).json({ error: 'Proxy not available' });
    } else {
      return res.status(400).json({ error: 'file_id, drawing_base64, or messages required' });
    }

    const systemPrompt = `You are an expert M&E estimating assistant.\nRead the following knowledge base carefully before processing the drawing.\n${req.kbPrompt}${req.kbTruncated ? '\nNOTE: Some non-critical KB sections omitted due to token limits.' : ''}`.trim();

    const userPrompt = `Analyse this M&E drawing and extract all quantities.\nProject reference: ${project_ref || 'Not stated'}\nOutput your extraction using the JSON format defined in your knowledge base.\nInclude drawing_reference, extraction array, and flags array.`.trim();

    const result = await callAI({
      systemPrompt,
      userPrompt,
      documents: [{ base64, mimeType }],
      maxTokens: max_tokens || 8000,
      model: model || 'claude-sonnet-4-6',
    });

    const duration = Date.now() - startTime;
    logSession({ type: 'drawing_extract', project_ref, duration_ms: duration, tokens: result.usage, file_id });

    res.json({
      success: true,
      kb_version: 'v7.2',
      kb_truncated: req.kbTruncated || false,
      duration_ms: duration,
      usage: result.usage,
      extraction: result.data,
    });
  } catch (err) {
    console.error('[drawings/extract]', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
