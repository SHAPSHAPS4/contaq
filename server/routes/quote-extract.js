/**
 * Quote Extraction Route — Two-pass pipeline
 * POST /api/quote-extract — Extract structured quote data from uploaded documents
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { kbInjectionMiddleware } = require('../kb/middleware');
const { extractQuote } = require('../services/quote-extraction');
const { hashDocument } = require('../services/structural-extractor');
const { logSession } = require('../services/session-logger');

router.use(requireAuth);

router.post('/', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  req.setTimeout(300000);
  res.setTimeout(300000);

  try {
    const { documents, project_ref, trade_type, existing_items } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, error: 'documents array required' });
    }

    if (documents.length > 10) {
      return res.status(400).json({ success: false, error: 'Maximum 10 documents per extraction' });
    }

    // Pre-flight summary for large batches
    const docSummary = documents.map(d => ({
      name: d.name,
      size_kb: d.base64 ? Math.round(d.base64.length * 0.75 / 1024) : 0,
      type: d.mimeType || 'unknown',
    }));
    console.log(`[Quote Extract] Starting: ${documents.length} docs, trade: ${trade_type || 'general'}, project: ${project_ref || '?'}`);

    const result = await extractQuote({
      documents,
      projectRef: project_ref,
      tradeType: trade_type,
      kbPrompt: req.kbPrompt || '',
      existingItems: existing_items || [],
    });

    const duration = Date.now() - startTime;
    logSession({
      type: 'quote_extraction',
      project_ref,
      org_id: req.orgId,
      duration_ms: duration,
      tokens: result.usage,
      documents_count: documents.length,
      items_extracted: result.quote_extraction?.summary?.total_scope_items || 0,
    });

    res.json({
      success: true,
      ...result,
      duration_ms: duration,
      documents_processed: docSummary,
    });
  } catch (err) {
    console.error('[Quote Extract]', err.message, err.stack);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
