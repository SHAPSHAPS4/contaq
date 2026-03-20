/**
 * Similar Projects Routes
 * POST /api/similarity/find — find similar historical projects
 * POST /api/similarity/compare — compare quantities against reference
 * POST /api/similarity/rebuild-index — rebuild project similarity index
 */

const express = require('express');
const router = express.Router();
const { findSimilarProjects, compareWithReference, buildProjectsIndex } = require('../services/similarity-engine');

router.post('/find', (req, res) => {
  try {
    const { extraction_items, limit } = req.body;
    const similar = findSimilarProjects(extraction_items || [], limit || 3);
    res.json({ success: true, similar_projects: similar, count: similar.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/compare', (req, res) => {
  try {
    const { new_items, reference_quote_ref } = req.body;
    if (!new_items || !reference_quote_ref) return res.status(400).json({ error: 'new_items and reference_quote_ref required' });
    const comparison = compareWithReference(new_items, reference_quote_ref);
    res.json({ success: true, comparison });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/rebuild-index', (req, res) => {
  try {
    const projects = buildProjectsIndex();
    res.json({ success: true, indexed: projects.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
