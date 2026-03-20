/**
 * Quote Versioning Routes
 * POST /api/versions/:quoteRef/save — save a new version
 * GET  /api/versions/:quoteRef — get version history
 * GET  /api/versions/:quoteRef/compare?a=1&b=2 — compare two versions
 */

const express = require('express');
const router = express.Router();
const { saveVersion, getVersionHistory, getVersion, compareVersions } = require('../services/quote-versioning');

router.post('/:quoteRef/save', (req, res) => {
  try {
    const { quote_data, change_note } = req.body;
    if (!quote_data) return res.status(400).json({ error: 'quote_data required' });
    const version = saveVersion(req.params.quoteRef, quote_data, change_note);
    res.json({ success: true, version });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:quoteRef', (req, res) => {
  try {
    const history = getVersionHistory(req.params.quoteRef);
    res.json(history.map(v => ({
      version_number: v.version_number,
      version_ref: v.version_ref,
      saved_at: v.saved_at,
      change_note: v.change_note,
      summary: v.summary,
    })));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:quoteRef/compare', (req, res) => {
  try {
    const { a, b } = req.query;
    if (!a || !b) return res.status(400).json({ error: 'a and b version numbers required' });
    const verA = getVersion(req.params.quoteRef, a);
    const verB = getVersion(req.params.quoteRef, b);
    const comparison = compareVersions(req.params.quoteRef, verA, verB);
    res.json({ success: true, comparison });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
