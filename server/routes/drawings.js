const express = require('express');
const router = express.Router();
const { kbInjectionMiddleware } = require('../kb/middleware');
const { callAI } = require('../services/ai');
const { loadUpload, bufferToBase64 } = require('../services/pdf-processor');
const { logSession } = require('../services/session-logger');
const { saveExtraction } = require('../services/file-storage');
const { runHybridExtraction } = require('../services/hybrid-extraction');
const { preprocessPDF } = require('../services/pdf-preprocessor');
const { getGoldenExamples } = require('../services/golden-examples');

router.post('/extract', kbInjectionMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const { file_id, drawing_base64, drawing_mime_type, project_ref, messages, model, max_tokens, mode } = req.body;

    let base64, mimeType, pdfBuffer;
    if (file_id) {
      pdfBuffer = loadUpload(file_id);
      base64 = bufferToBase64(pdfBuffer);
      mimeType = 'application/pdf';
    } else if (drawing_base64) {
      base64 = drawing_base64;
      mimeType = drawing_mime_type || 'application/pdf';
      pdfBuffer = Buffer.from(base64, 'base64');
    } else if (messages) {
      // Legacy frontend sends messages[] with content blocks — extract base64 from them
      const userMsg = messages.find(m => m.role === 'user');
      if (userMsg && userMsg.content) {
        const blocks = Array.isArray(userMsg.content) ? userMsg.content : [userMsg.content];
        for (const block of blocks) {
          if (block.type === 'image' && block.source?.data) {
            base64 = block.source.data;
            mimeType = block.source.media_type || 'application/pdf';
            break;
          }
          if (block.type === 'document' && block.source?.data) {
            base64 = block.source.data;
            mimeType = block.source.media_type || 'application/pdf';
            break;
          }
        }
      }
      if (!base64) {
        return res.status(400).json({ error: 'No drawing found in messages content' });
      }
      pdfBuffer = Buffer.from(base64, 'base64');
    } else {
      return res.status(400).json({ error: 'file_id, drawing_base64, or messages required' });
    }

    // ═══ HYBRID TWO-PASS PIPELINE ═══
    // Pre-process PDF for text/annotation extraction
    let preprocessed = null;
    if (pdfBuffer) {
      try {
        preprocessed = await preprocessPDF(pdfBuffer);
        console.log(`[Drawings] Pre-processed: ${preprocessed.page_count} pages, ${preprocessed.equipment_tags.length} tags, text layer: ${preprocessed.has_text_layer}`);
      } catch (e) {
        console.warn('[Drawings] Pre-processing failed (non-fatal):', e.message);
      }
    }

    // Get golden examples for few-shot injection
    let goldenExamples = [];
    if (req.orgId && req.orgId !== 'demo-org-id') {
      try {
        goldenExamples = await getGoldenExamples(req.orgId, 8);
        if (goldenExamples.length > 0) {
          console.log(`[Drawings] Injecting ${goldenExamples.length} golden examples`);
        }
      } catch (e) {
        console.warn('[Drawings] Golden examples fetch failed (non-fatal):', e.message);
      }
    }

    // Run two-pass hybrid extraction
    const result = await runHybridExtraction({
      base64,
      mimeType,
      pdfBuffer: pdfBuffer || null,
      kbPrompt: req.kbPrompt || '',
      goldenExamples,
      preprocessedData: preprocessed,
      model: model || 'claude-sonnet-4-6',
    });

    const duration = Date.now() - startTime;
    logSession({
      type: 'drawing_extract_hybrid',
      project_ref,
      duration_ms: duration,
      tokens: result.usage,
      file_id,
      pass1_ms: result.timing.pass1_ms,
      pass2_ms: result.timing.pass2_ms,
    });

    // Auto-save extraction to Supabase
    if (req.orgId && req.orgId !== 'demo-org-id') {
      const extraction = result.extraction;
      const items = extraction?.extraction || [];
      const flags = extraction?.flags || [];
      saveExtraction({
        orgId: req.orgId,
        userId: req.user?.id,
        stage: 'drawing',
        inputFiles: [{ name: project_ref || 'drawing', type: 'pdf', size_kb: base64 ? Math.round(base64.length * 0.75 / 1024) : 0 }],
        resultJson: { detection: result.detection, extraction: result.extraction },
        grade: extraction?.validation_grade || null,
        score: extraction?.validation_score || null,
        itemsCount: Array.isArray(items) ? items.length : 0,
        flagsCount: Array.isArray(flags) ? flags.length : 0,
        tokensUsed: result.usage?.total_tokens || 0,
        model: model || 'claude-sonnet-4-6',
        processingMs: duration,
      }).catch(e => console.error('[Drawings] Auto-save error:', e.message));
    }

    res.json({
      success: true,
      kb_version: '9.0',
      kb_truncated: req.kbTruncated || false,
      pipeline: 'hybrid_two_pass',
      duration_ms: duration,
      timing: result.timing,
      usage: result.usage,
      detection: result.detection,
      extraction: result.extraction,
      preprocessed: preprocessed ? {
        has_text_layer: preprocessed.has_text_layer,
        equipment_tags: preprocessed.equipment_tags,
        scale_hints: preprocessed.scale_hints,
        page_count: preprocessed.page_count,
      } : null,
      golden_examples_used: goldenExamples.length,
    });
  } catch (err) {
    console.error('[drawings/extract]', err.message);
    res.status(500).json({ success: false, error: err.message, duration_ms: Date.now() - startTime });
  }
});

module.exports = router;
