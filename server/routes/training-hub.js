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

// Submit review — creates golden record + saves feedback
router.post('/review', (req, res) => {
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

    res.json({ success: true, golden_record: goldenRecord });
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
