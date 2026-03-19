/**
 * Validation Gate Routes
 * POST /api/validate/extraction — validate extraction quality
 * POST /api/validate/override — estimator override with audit trail
 * GET  /api/validate/overrides — audit log of all overrides
 */

const express = require('express');
const router = express.Router();
const { validateExtraction, generateValidationReport } = require('../services/extraction-validator');
const fs = require('fs');
const path = require('path');

const OVERRIDE_LOG = path.join(__dirname, '../data/validation-overrides.json');

function logOverride(projectRef, validationResult, reason, estimator) {
  let log = [];
  try { log = JSON.parse(fs.readFileSync(OVERRIDE_LOG, 'utf-8')); } catch {}
  log.push({
    project_ref: projectRef,
    timestamp: new Date().toISOString(),
    block_reason: validationResult.block_reason,
    score: validationResult.score,
    override_reason: reason,
    estimator: estimator || 'unknown',
  });
  fs.writeFileSync(OVERRIDE_LOG, JSON.stringify(log, null, 2));
}

router.post('/extraction', (req, res) => {
  const { extraction, project_ref } = req.body;
  if (!extraction) return res.status(400).json({ error: 'extraction required' });
  const result = validateExtraction(extraction);
  const report = generateValidationReport(result, project_ref);
  res.json({ success: true, validation: result, report });
});

router.post('/override', (req, res) => {
  const { project_ref, validation_result, override_reason, estimator } = req.body;
  if (!project_ref || !override_reason) return res.status(400).json({ error: 'project_ref and override_reason required' });
  logOverride(project_ref, validation_result || {}, override_reason, estimator);
  res.json({
    success: true,
    override_granted: true,
    audit_logged: true,
    message: 'Override recorded. Estimator accepts responsibility for extraction quality.',
    timestamp: new Date().toISOString(),
  });
});

router.get('/overrides', (req, res) => {
  try {
    const log = JSON.parse(fs.readFileSync(OVERRIDE_LOG, 'utf-8'));
    res.json(log);
  } catch {
    res.json([]);
  }
});

module.exports = router;
