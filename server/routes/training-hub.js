/**
 * AI Training Hub Routes — Admin only
 * GET  /api/admin/training/metrics         — dashboard KPIs
 * GET  /api/admin/training/queue           — review queue
 * GET  /api/admin/training/extraction/:id  — single extraction detail
 * POST /api/admin/training/review          — submit review (creates golden record)
 * GET  /api/admin/training/golden-records  — list golden records
 * GET  /api/admin/training/prompts         — prompt version history
 * POST /api/admin/training/prompts         — save new prompt version
 * POST /api/admin/training/prompts/rollback — rollback to previous version
 * GET  /api/admin/training/export          — export training data
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const hub = require('../services/training-hub');
const { persistLearnedRules, persistPatternError } = require('../kb/index');
const { logSession } = require('../services/session-logger');

// All routes require admin
router.use(requireAuth);
router.use(requireRole('admin'));

// Dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    res.json({ success: true, ...hub.getMetrics() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Review queue
router.get('/queue', (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const type = req.query.type || null;
    const extractions = hub.getExtractions({ status, type, org_id: req.query.all ? null : req.orgId });
    res.json({ success: true, extractions, count: extractions.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single extraction detail
router.get('/extraction/:id', (req, res) => {
  try {
    const extraction = hub.getExtraction(req.params.id);
    if (!extraction) return res.status(404).json({ success: false, error: 'Extraction not found' });
    res.json({ success: true, extraction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit review — creates golden record + feeds corrections into KB flywheel
router.post('/review', async (req, res) => {
  try {
    const { extraction_id, corrected_items, original_items, feedback, document_name, extraction_type } = req.body;
    if (!extraction_id || !feedback) {
      return res.status(400).json({ success: false, error: 'extraction_id and feedback required' });
    }

    const goldenRecord = hub.createGoldenRecord({
      extraction_id,
      org_id: req.orgId,
      document_name: document_name || 'Unknown',
      extraction_type: extraction_type || 'unknown',
      corrected_items: corrected_items || [],
      original_items: original_items || [],
      feedback,
      reviewed_by: req.user.id,
    });

    // Save field-level feedback
    if (feedback.length > 0) {
      hub.saveFeedback(goldenRecord.id, feedback);
    }

    // ── FLYWHEEL: Convert corrections into KB learned rules ──
    const corrections = feedback.filter(f => f.tag === 'wrong_value' || f.tag === 'hallucination' || f.tag === 'missed_item');
    let rulesCreated = 0;
    let patternsUpdated = 0;

    if (corrections.length > 0) {
      // Build learned rules from corrections
      const errorTypeMap = { wrong_value: 'wrong_qty', hallucination: 'hallucination', missed_item: 'missing_item' };
      const newRules = corrections.map((c, i) => ({
        rule_id: 'TRAINED_' + Date.now() + '_' + String(i + 1).padStart(3, '0'),
        trigger: 'When extracting from ' + (extraction_type || 'drawing') + ' and encountering: ' + (c.original_value || '').substring(0, 100),
        action: c.tag === 'hallucination'
          ? 'Do NOT extract this item — it was flagged as hallucinated. ' + (c.comment || 'Not present in source document.')
          : c.tag === 'missed_item'
            ? 'Look for this item type — it was missed in previous extraction. ' + (c.comment || '')
            : 'Correct value should be: ' + (c.corrected_value || '') + '. ' + (c.comment || ''),
        reason: 'Admin review on ' + (document_name || 'document') + ': ' + c.tag + (c.comment ? ' — ' + c.comment : ''),
        error_type: errorTypeMap[c.tag] || c.tag,
        example_before: c.original_value || '',
        example_after: c.corrected_value || c.comment || '',
        date: new Date().toISOString().split('T')[0],
        occurrences: 1,
        source: 'training_hub'
      }));

      // Persist rules via unified KB interface (Supabase if org exists, files as fallback)
      // trade='all' ensures training hub rules apply to ALL trades platform-wide
      try {
        const persisted = await persistLearnedRules(newRules, req.orgId, req.user.id, 'all');
        rulesCreated = persisted?.persisted || newRules.length;
      } catch (e) {
        console.error('[Training Hub] Rule persistence error:', e.message);
        rulesCreated = 0;
      }

      // Track pattern errors via unified interface
      const errorTypeCounts = {};
      corrections.forEach(c => {
        const et = errorTypeMap[c.tag] || c.tag;
        errorTypeCounts[et] = (errorTypeCounts[et] || 0) + 1;
      });
      for (const [errorType, count] of Object.entries(errorTypeCounts)) {
        try {
          await persistPatternError(errorType, count, 'Flagged via Training Hub admin review. Check ' + errorType + ' carefully in future extractions.', req.orgId, req.user.id);
          patternsUpdated++;
        } catch (e) {
          console.error('[Training Hub] Pattern error persistence:', e.message);
        }
      }

      // Log session
      logSession({
        type: 'training_hub_review',
        project_ref: document_name,
        org_id: req.orgId,
        is_admin: true,
        duration_ms: 0,
        tokens: { input_tokens: 0, output_tokens: 0 },
        rules_added: rulesCreated,
        patterns_added: patternsUpdated,
        corrections_count: corrections.length
      });
    }

    res.json({
      success: true,
      golden_record: goldenRecord,
      kb_updated: rulesCreated > 0,
      rules_created: rulesCreated,
      patterns_updated: patternsUpdated,
      corrections_processed: corrections.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk review — submit multiple extractions at once
router.post('/bulk-review', async (req, res) => {
  try {
    const { reviews } = req.body;
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ success: false, error: 'reviews array required' });
    }

    const results = [];
    let totalRules = 0;
    let totalPatterns = 0;
    let totalCorrections = 0;

    for (const review of reviews) {
      const goldenRecord = hub.createGoldenRecord({
        extraction_id: review.extraction_id,
        org_id: req.orgId,
        document_name: review.document_name || 'Unknown',
        extraction_type: review.extraction_type || 'unknown',
        corrected_items: review.corrected_items || [],
        original_items: review.original_items || [],
        feedback: review.feedback || [],
        reviewed_by: req.user.id,
      });

      if (review.feedback && review.feedback.length > 0) {
        hub.saveFeedback(goldenRecord.id, review.feedback);
      }

      // Feed corrections into KB
      const corrections = (review.feedback || []).filter(f => f.tag === 'wrong_value' || f.tag === 'hallucination' || f.tag === 'missed_item');
      let rulesCreated = 0;

      if (corrections.length > 0) {
        const errorTypeMap = { wrong_value: 'wrong_qty', hallucination: 'hallucination', missed_item: 'missing_item' };
        const newRules = corrections.map((c, i) => ({
          rule_id: 'TRAINED_' + Date.now() + '_' + String(i + 1).padStart(3, '0'),
          trigger: 'When extracting from ' + (review.extraction_type || 'drawing') + ' and encountering: ' + (c.original_value || '').substring(0, 100),
          action: c.tag === 'hallucination'
            ? 'Do NOT extract this item — hallucinated. ' + (c.comment || '')
            : c.tag === 'missed_item'
              ? 'Look for this item type — missed previously. ' + (c.comment || '')
              : 'Correct value: ' + (c.corrected_value || '') + '. ' + (c.comment || ''),
          reason: 'Bulk review: ' + c.tag + (c.comment ? ' — ' + c.comment : ''),
          error_type: errorTypeMap[c.tag] || c.tag,
          example_before: c.original_value || '',
          example_after: c.corrected_value || c.comment || '',
          date: new Date().toISOString().split('T')[0],
          occurrences: 1,
          source: 'training_hub_bulk'
        }));

        try {
          const persisted = await persistLearnedRules(newRules, req.orgId, req.user.id, 'all');
          rulesCreated = persisted?.persisted || newRules.length;
        } catch (e) {}

        totalCorrections += corrections.length;
        totalRules += rulesCreated;
      }

      results.push({ extraction_id: review.extraction_id, golden_record_id: goldenRecord.id, accuracy_pct: goldenRecord.accuracy_pct, rules_created: rulesCreated });
    }

    logSession({
      type: 'training_hub_bulk_review',
      project_ref: 'bulk-' + reviews.length + '-extractions',
      org_id: req.orgId,
      is_admin: true,
      duration_ms: 0,
      tokens: { input_tokens: 0, output_tokens: 0 },
      rules_added: totalRules,
      patterns_added: totalPatterns,
      corrections_count: totalCorrections
    });

    res.json({
      success: true,
      reviews_processed: results.length,
      total_rules_created: totalRules,
      total_corrections: totalCorrections,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List golden records
router.get('/golden-records', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = hub.getGoldenRecords(limit);
    res.json({ success: true, records, count: records.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Prompt versions
router.get('/prompts', (req, res) => {
  try {
    const type = req.query.type || null;
    res.json({ success: true, versions: hub.getPromptVersions(type) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save new prompt version
router.post('/prompts', (req, res) => {
  try {
    const { extraction_type, prompt_text, change_note } = req.body;
    if (!extraction_type || !prompt_text) {
      return res.status(400).json({ success: false, error: 'extraction_type and prompt_text required' });
    }
    const version = hub.savePromptVersion({
      extraction_type,
      prompt_text,
      change_note,
      created_by: req.user.id,
    });
    res.json({ success: true, version });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rollback prompt
router.post('/prompts/rollback', (req, res) => {
  try {
    const { extraction_type, version_number } = req.body;
    if (!extraction_type || !version_number) {
      return res.status(400).json({ success: false, error: 'extraction_type and version_number required' });
    }
    const active = hub.rollbackPrompt(extraction_type, parseInt(version_number));
    res.json({ success: true, active_version: active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export training data
router.get('/export', (req, res) => {
  try {
    const data = hub.exportTrainingData();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Feedback stats
router.get('/feedback-stats', (req, res) => {
  try {
    res.json({ success: true, ...hub.getFeedbackStats() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
