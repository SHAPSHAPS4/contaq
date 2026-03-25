/**
 * Learning Management Routes
 * GET  /api/learning/rules — view learned rules and pattern errors (org-scoped)
 * DELETE /api/learning/rules — clear all learned rules (org-scoped)
 */

const express = require('express');
const router = express.Router();
const kbManager = require('../kb/index');

router.get('/rules', async (req, res) => {
  try {
    const orgId = req.orgId || null;
    const data = await kbManager.loadLearning(orgId);
    res.json({ ...data, org_scoped: !!orgId });
  } catch (err) {
    console.error('[learning/rules GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/rules', async (req, res) => {
  try {
    const orgId = req.orgId || null;
    await kbManager.saveLearning([], [], orgId);
    res.json({
      status: 'cleared',
      message: orgId
        ? 'All learned rules and pattern errors cleared for your organisation.'
        : 'All learned rules and pattern errors cleared (global/demo).',
      org_scoped: !!orgId
    });
  } catch (err) {
    console.error('[learning/rules DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
