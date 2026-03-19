/**
 * Learning Management Routes
 * GET  /api/learning/rules — view learned rules and pattern errors
 * DELETE /api/learning/rules — clear all learned rules
 */

const express = require('express');
const router = express.Router();
const kbManager = require('../kb/index');

router.get('/rules', (_req, res) => {
  res.json(kbManager.loadLearning());
});

router.delete('/rules', (_req, res) => {
  kbManager.saveLearning([], []);
  res.json({ status: 'cleared', message: 'All learned rules and pattern errors cleared.' });
});

module.exports = router;
