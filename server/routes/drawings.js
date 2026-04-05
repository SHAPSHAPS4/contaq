const express = require('express');
const router = express.Router();
const { kbInjectionMiddleware } = require('../kb/middleware');
const { callAI } = require('../services/ai');
const { loadUpload, bufferToBase64 } = require('../services/pdf-processor');
const { logSession } = require('../services/session-logger');
const { saveExtraction, uploadFile } = require('../services/file-storage');

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

    // Auto-save extraction to Supabase (non-blocking — don't fail the response)
    if (req.orgId && req.orgId !== 'demo-org-id') {
      const extraction = result.data;
      const items = extraction?.extraction || extraction?.items || [];
      const flags = extraction?.flags || [];
      saveExtraction({
        orgId: req.orgId,
        userId: req.user?.id,
        stage: 'drawing',
        inputFiles: [{ name: project_ref || 'drawing', type: 'pdf', size_kb: base64 ? Math.round(base64.length * 0.75 / 1024) : 0 }],
        resultJson: extraction,
        grade: extraction?.validation_grade || null,
        score: extraction?.validation_score || null,
        itemsCount: Array.isArray(items) ? items.length : 0,
        flagsCount: Array.isArray(flags) ? flags.length : 0,
        tokensUsed: result.usage?.total_tokens || 0,
        model: model || 'claude-sonnet-4-6',
        processingMs: duration,
      }).catch(e => console.error('[Drawings] Auto-save extraction error:', e.message));
    }

    res.json({
      success: true,
      kb_version: '9.0',
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
